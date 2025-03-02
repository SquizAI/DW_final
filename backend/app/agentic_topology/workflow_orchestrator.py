"""
Workflow Orchestrator Module

This module defines the WorkflowOrchestrator class for orchestrating workflows
using the agentic topology system.
"""

import logging
import uuid
import asyncio
from typing import Dict, List, Any, Optional, Set, Tuple
import json
import time
from datetime import datetime
import pandas as pd
import numpy as np

from .agent_manager import (
    agent_manager,
    AgentCapability,
    AgentRole,
    AgentStatus,
    InteractionType,
    InteractionProtocol
)
from ..workflow_engine.executor import WorkflowExecutor
from ..workflow_engine.node_processor import NodeProcessorFactory
from ..workflow_engine.data_manager import DataManager

logger = logging.getLogger(__name__)

class WorkflowOrchestrator:
    """
    Orchestrates workflows using the agentic topology system.
    
    Handles:
    - Workflow execution planning
    - Task delegation to agents
    - Monitoring and coordination
    - Result aggregation
    """
    
    def __init__(self):
        """Initialize the WorkflowOrchestrator."""
        self.executions: Dict[str, Dict[str, Any]] = {}
        self.data_managers: Dict[str, DataManager] = {}
        self.executors: Dict[str, WorkflowExecutor] = {}
        self.agent_assignments: Dict[str, Dict[str, str]] = {}  # execution_id -> {node_id -> agent_id}
        
        # Ensure default agents are created
        if not agent_manager.agents:
            agent_manager.create_default_agents()
    
    async def execute_workflow(self, workflow_id: str, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], execution_mode: str = "sequential") -> Dict[str, Any]:
        """
        Execute a workflow.
        
        Args:
            workflow_id: ID of the workflow
            nodes: List of node definitions
            edges: List of edge definitions
            execution_mode: Mode of execution (sequential or parallel)
            
        Returns:
            Dictionary with execution results
        """
        # Generate execution ID
        execution_id = str(uuid.uuid4())
        
        # Register execution
        self.executions[execution_id] = {
            "workflow_id": workflow_id,
            "execution_id": execution_id,
            "status": "initializing",
            "start_time": datetime.now(),
            "end_time": None,
            "nodes": nodes,
            "edges": edges,
            "execution_mode": execution_mode,
            "node_statuses": {},
            "results": {},
            "insights": []
        }
        
        # Create data manager
        self.data_managers[execution_id] = DataManager(workflow_id)
        
        # Create workflow executor
        self.executors[execution_id] = WorkflowExecutor(
            workflow_id=workflow_id,
            nodes=nodes,
            edges=edges,
            max_parallel_nodes=4 if execution_mode == "parallel" else 1
        )
        
        # Set progress callback
        self.executors[execution_id].set_progress_callback(
            lambda workflow_id, status: self._update_execution_status(execution_id, status)
        )
        
        # Plan the execution
        await self._plan_execution(execution_id)
        
        # Start execution
        asyncio.create_task(self._execute_workflow(execution_id))
        
        return {
            "execution_id": execution_id,
            "status": "started",
            "message": "Workflow execution started"
        }
    
    async def _plan_execution(self, execution_id: str):
        """
        Plan the execution of a workflow.
        
        Args:
            execution_id: ID of the execution
        """
        execution = self.executions[execution_id]
        nodes = execution["nodes"]
        edges = execution["edges"]
        
        # Update execution status
        execution["status"] = "planning"
        
        # Analyze the workflow to determine the best agents for each node
        for node in nodes:
            node_id = node["id"]
            node_type = node["type"]
            node_data = node["data"]
            
            # Determine required capabilities based on node type
            required_capabilities = self._get_required_capabilities(node_type, node_data)
            
            # Find the best agent for the node
            best_agent = agent_manager.find_best_agent_for_task(
                task_type=node_type,
                required_capabilities=required_capabilities
            )
            
            if best_agent:
                # Assign the agent to the node
                if execution_id not in self.agent_assignments:
                    self.agent_assignments[execution_id] = {}
                self.agent_assignments[execution_id][node_id] = best_agent.config.id
                
                # Initialize node status
                execution["node_statuses"][node_id] = {
                    "status": "assigned",
                    "agent_id": best_agent.config.id,
                    "progress": 0.0,
                    "start_time": None,
                    "end_time": None,
                    "result": None,
                    "error": None
                }
            else:
                # No suitable agent found
                execution["node_statuses"][node_id] = {
                    "status": "unassigned",
                    "agent_id": None,
                    "progress": 0.0,
                    "start_time": None,
                    "end_time": None,
                    "result": None,
                    "error": "No suitable agent found"
                }
        
        # Update execution status
        execution["status"] = "planned"
    
    async def _execute_workflow(self, execution_id: str):
        """
        Execute a workflow.
        
        Args:
            execution_id: ID of the execution
        """
        execution = self.executions[execution_id]
        executor = self.executors[execution_id]
        
        try:
            # Update execution status
            execution["status"] = "running"
            
            # Execute the workflow
            result = executor.execute()
            
            # Update execution status
            execution["status"] = result["status"]
            execution["end_time"] = datetime.now()
            execution["results"] = result
            
            # Generate insights
            await self._generate_insights(execution_id)
            
        except Exception as e:
            logger.exception(f"Error executing workflow: {e}")
            
            # Update execution status
            execution["status"] = "failed"
            execution["end_time"] = datetime.now()
            execution["error"] = str(e)
    
    async def _generate_insights(self, execution_id: str):
        """
        Generate insights for a workflow execution.
        
        Args:
            execution_id: ID of the execution
        """
        execution = self.executions[execution_id]
        
        # Find an explainer agent
        explainer_agent = next(
            (agent for agent in agent_manager.agents.values() 
             if agent.config.role == AgentRole.EXPLAINER 
             and agent.state.status == AgentStatus.IDLE),
            None
        )
        
        if not explainer_agent:
            logger.warning("No available explainer agent for generating insights")
            return
        
        # Create a task for the explainer agent
        task_id = f"insight_generation_{execution_id}"
        
        # Delegate the task
        agent_manager.delegate_task(
            task_id=task_id,
            task_type="insight_generation",
            required_capabilities=[AgentCapability.INSIGHT_GENERATION],
            data={
                "execution_id": execution_id,
                "workflow_id": execution["workflow_id"],
                "nodes": execution["nodes"],
                "edges": execution["edges"],
                "results": execution["results"]
            }
        )
        
        # Wait for the task to complete (with timeout)
        start_time = time.time()
        while time.time() - start_time < 60:  # 60-second timeout
            task = agent_manager.task_registry.get(task_id)
            if task and task.get("status") in ["completed", "failed"]:
                break
            await asyncio.sleep(1)
        
        # Get the insights
        task = agent_manager.task_registry.get(task_id)
        if task and task.get("status") == "completed" and "result" in task:
            execution["insights"] = task["result"].get("insights", [])
    
    def _update_execution_status(self, execution_id: str, status: Dict[str, Any]):
        """
        Update the status of a workflow execution.
        
        Args:
            execution_id: ID of the execution
            status: Status information
        """
        if execution_id not in self.executions:
            logger.error(f"Execution not found: {execution_id}")
            return
        
        execution = self.executions[execution_id]
        
        # Update overall status
        if "status" in status:
            execution["status"] = status["status"]
        
        # Update node statuses
        if "node_details" in status:
            for node_id, details in status["node_details"].items():
                if node_id in execution["node_statuses"]:
                    execution["node_statuses"][node_id].update(details)
    
    def get_execution_status(self, execution_id: str) -> Dict[str, Any]:
        """
        Get the status of a workflow execution.
        
        Args:
            execution_id: ID of the execution
            
        Returns:
            Dictionary with execution status
        """
        if execution_id not in self.executions:
            return {
                "status": "not_found",
                "message": f"Execution not found: {execution_id}"
            }
        
        execution = self.executions[execution_id]
        
        # Calculate overall progress
        node_statuses = execution["node_statuses"]
        if node_statuses:
            overall_progress = sum(status.get("progress", 0) for status in node_statuses.values()) / len(node_statuses)
        else:
            overall_progress = 0
        
        return {
            "execution_id": execution_id,
            "workflow_id": execution["workflow_id"],
            "status": execution["status"],
            "progress": overall_progress,
            "start_time": execution["start_time"].isoformat() if execution["start_time"] else None,
            "end_time": execution["end_time"].isoformat() if execution["end_time"] else None,
            "execution_time": (execution["end_time"] - execution["start_time"]).total_seconds() if execution["end_time"] else None,
            "node_statuses": execution["node_statuses"],
            "insights": execution["insights"]
        }
    
    def stop_execution(self, execution_id: str) -> Dict[str, Any]:
        """
        Stop a workflow execution.
        
        Args:
            execution_id: ID of the execution
            
        Returns:
            Dictionary with stop result
        """
        if execution_id not in self.executions:
            return {
                "status": "not_found",
                "message": f"Execution not found: {execution_id}"
            }
        
        execution = self.executions[execution_id]
        
        # Stop the executor
        if execution_id in self.executors:
            executor = self.executors[execution_id]
            executor.pause()
        
        # Update execution status
        execution["status"] = "stopped"
        execution["end_time"] = datetime.now()
        
        return {
            "status": "stopped",
            "message": "Workflow execution stopped"
        }
    
    def _get_required_capabilities(self, node_type: str, node_data: Dict[str, Any]) -> List[AgentCapability]:
        """
        Get the required capabilities for a node.
        
        Args:
            node_type: Type of node
            node_data: Node data
            
        Returns:
            List of required capabilities
        """
        # Map node types to required capabilities
        type_capability_map = {
            "data_source": [AgentCapability.DATA_CLEANING],
            "data_transformation": [AgentCapability.FEATURE_ENGINEERING],
            "analysis": [
                AgentCapability.CLASSIFICATION,
                AgentCapability.REGRESSION,
                AgentCapability.CLUSTERING,
                AgentCapability.DIMENSIONALITY_REDUCTION
            ],
            "visualization": [AgentCapability.VISUALIZATION],
            "export": []
        }
        
        # Get capabilities based on node type
        capabilities = type_capability_map.get(node_type, [])
        
        # Add additional capabilities based on node data
        if node_data.get("analysis_type") == "classification":
            capabilities.append(AgentCapability.CLASSIFICATION)
        elif node_data.get("analysis_type") == "regression":
            capabilities.append(AgentCapability.REGRESSION)
        elif node_data.get("analysis_type") == "clustering":
            capabilities.append(AgentCapability.CLUSTERING)
        elif node_data.get("analysis_type") == "pca":
            capabilities.append(AgentCapability.DIMENSIONALITY_REDUCTION)
        
        # Add insight generation for all nodes
        capabilities.append(AgentCapability.INSIGHT_GENERATION)
        
        return capabilities

# Initialize the workflow orchestrator
workflow_orchestrator = WorkflowOrchestrator() 
"""
Workflow Executor Module

This module defines the WorkflowExecutor class for executing workflows.
"""

import logging
import time
import uuid
import json
from typing import Dict, Any, List, Optional, Callable, Set, Tuple
import networkx as nx
from datetime import datetime

from .exceptions import WorkflowExecutionError
from .data_manager import DataManager
from .node_processor import NodeProcessorFactory

logger = logging.getLogger(__name__)

class WorkflowExecutor:
    """
    Executes a workflow by processing nodes in the correct order.
    
    This class handles:
    - Determining the execution order based on node dependencies
    - Executing nodes in sequence or in parallel
    - Managing data passing between nodes
    - Tracking execution progress and status
    - Handling errors and recovery
    """
    
    def __init__(self, workflow_id: str, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], 
                 cache_dir: Optional[str] = None, max_parallel_nodes: int = 1):
        """
        Initialize the WorkflowExecutor.
        
        Args:
            workflow_id: The ID of the workflow
            nodes: List of node definitions
            edges: List of edge definitions connecting nodes
            cache_dir: Directory to use for caching data (optional)
            max_parallel_nodes: Maximum number of nodes to execute in parallel
        """
        self.workflow_id = workflow_id
        self.nodes = nodes
        self.edges = edges
        self.max_parallel_nodes = max_parallel_nodes
        
        # Create a data manager for this workflow
        self.data_manager = DataManager(workflow_id, cache_dir)
        
        # Create a directed graph to represent the workflow
        self.graph = self._build_workflow_graph()
        
        # Execution state
        self.execution_id = str(uuid.uuid4())
        self.status = "initialized"
        self.start_time = None
        self.end_time = None
        self.current_node_id = None
        self.executed_nodes = set()
        self.failed_nodes = set()
        self.node_results = {}
        self.progress_callback = None
        self.node_progress = {node["id"]: 0 for node in nodes}
        self.paused = False
        
        logger.info(f"WorkflowExecutor initialized for workflow {workflow_id}")
        logger.info(f"Workflow contains {len(nodes)} nodes and {len(edges)} edges")
    
    def _build_workflow_graph(self) -> nx.DiGraph:
        """
        Build a directed graph representing the workflow.
        
        Returns:
            NetworkX DiGraph instance
        """
        graph = nx.DiGraph()
        
        # Add nodes
        for node in self.nodes:
            graph.add_node(node["id"], **node)
        
        # Add edges
        for edge in self.edges:
            graph.add_edge(edge["source"], edge["target"], **edge)
        
        # Validate the graph
        if not nx.is_directed_acyclic_graph(graph):
            cycles = list(nx.simple_cycles(graph))
            raise WorkflowExecutionError(
                message=f"Workflow contains cycles: {cycles}",
                workflow_id=self.workflow_id
            )
        
        return graph
    
    def set_progress_callback(self, callback: Callable[[str, Dict[str, Any]], None]) -> None:
        """
        Set a callback function to report progress.
        
        Args:
            callback: Function that takes workflow_id and status info
        """
        self.progress_callback = callback
    
    def _update_progress(self, status: str = None, details: Dict[str, Any] = None) -> None:
        """
        Update the progress of workflow execution.
        
        Args:
            status: Status message
            details: Additional details about the progress
        """
        if status:
            self.status = status
        
        # Calculate overall progress based on node progress
        if self.nodes:
            overall_progress = sum(self.node_progress.values()) / len(self.nodes)
        else:
            overall_progress = 0
        
        if self.progress_callback:
            self.progress_callback(
                self.workflow_id,
                {
                    "execution_id": self.execution_id,
                    "status": self.status,
                    "progress": overall_progress,
                    "current_node": self.current_node_id,
                    "executed_nodes": list(self.executed_nodes),
                    "failed_nodes": list(self.failed_nodes),
                    "start_time": self.start_time.isoformat() if self.start_time else None,
                    "end_time": self.end_time.isoformat() if self.end_time else None,
                    "execution_time": (datetime.now() - self.start_time).total_seconds() if self.start_time else 0,
                    **(details or {})
                }
            )
    
    def _node_progress_callback(self, node_id: str, progress: float, details: Dict[str, Any]) -> None:
        """
        Callback for node progress updates.
        
        Args:
            node_id: The ID of the node
            progress: Progress value (0-100)
            details: Additional details about the progress
        """
        self.node_progress[node_id] = progress
        
        # Update node results with details
        if node_id not in self.node_results:
            self.node_results[node_id] = {}
        
        self.node_results[node_id].update(details)
        
        # Update overall workflow progress
        self._update_progress(details={"node_details": {node_id: details}})
    
    def execute(self) -> Dict[str, Any]:
        """
        Execute the workflow.
        
        Returns:
            Dictionary with execution results
        """
        try:
            self.start_time = datetime.now()
            self.status = "running"
            self._update_progress("running", {"message": "Starting workflow execution"})
            
            # Get execution order
            execution_order = self._get_execution_order()
            logger.info(f"Execution order: {execution_order}")
            
            # Execute nodes in order
            for node_id in execution_order:
                if self.paused:
                    self.status = "paused"
                    self._update_progress("paused", {"message": "Workflow execution paused"})
                    break
                
                self.current_node_id = node_id
                self._update_progress(details={"message": f"Executing node {node_id}"})
                
                # Skip if already executed
                if node_id in self.executed_nodes:
                    continue
                
                # Execute the node
                try:
                    self._execute_node(node_id)
                    self.executed_nodes.add(node_id)
                except Exception as e:
                    self.failed_nodes.add(node_id)
                    logger.exception(f"Error executing node {node_id}")
                    
                    # Check if we should continue on error
                    if not self._should_continue_on_error(node_id):
                        raise WorkflowExecutionError(
                            message=f"Workflow execution stopped due to error in node {node_id}: {str(e)}",
                            workflow_id=self.workflow_id,
                            node_id=node_id,
                            details={"error": str(e)}
                        ) from e
            
            # Finalize execution
            self.end_time = datetime.now()
            execution_time = (self.end_time - self.start_time).total_seconds()
            
            if self.paused:
                result_status = "paused"
            elif self.failed_nodes:
                result_status = "completed_with_errors"
            else:
                result_status = "completed"
            
            self.status = result_status
            self._update_progress(result_status, {
                "message": f"Workflow execution {result_status}",
                "execution_time": execution_time
            })
            
            return {
                "execution_id": self.execution_id,
                "workflow_id": self.workflow_id,
                "status": self.status,
                "start_time": self.start_time.isoformat(),
                "end_time": self.end_time.isoformat() if self.end_time else None,
                "execution_time": execution_time,
                "executed_nodes": list(self.executed_nodes),
                "failed_nodes": list(self.failed_nodes),
                "node_results": self.node_results
            }
            
        except Exception as e:
            self.end_time = datetime.now()
            self.status = "failed"
            
            error_details = {
                "message": str(e),
                "exception_type": type(e).__name__,
                "execution_time": (self.end_time - self.start_time).total_seconds()
            }
            
            self._update_progress("failed", error_details)
            
            if isinstance(e, WorkflowExecutionError):
                raise
            else:
                raise WorkflowExecutionError(
                    message=f"Workflow execution failed: {str(e)}",
                    workflow_id=self.workflow_id,
                    details=error_details
                ) from e
    
    def _execute_node(self, node_id: str) -> Dict[str, Any]:
        """
        Execute a single node.
        
        Args:
            node_id: The ID of the node to execute
            
        Returns:
            Node execution results
        """
        # Get node definition
        node_data = self.graph.nodes[node_id]
        node_type = node_data.get("type", "unknown")
        node_config = node_data.get("data", {})
        
        logger.info(f"Executing node {node_id} of type {node_type}")
        
        # Create node processor
        processor = NodeProcessorFactory.create(node_type, node_id, node_config)
        processor.set_progress_callback(self._node_progress_callback)
        
        # Get input data for the node
        input_data = self.data_manager.get_node_input_data(node_id, self.edges)
        
        # Process the node
        output_data = processor.process(input_data, self.data_manager)
        
        # Store results
        for output_name, data in output_data.items():
            self.data_manager.store_data(node_id, data, output_name)
        
        return output_data
    
    def _get_execution_order(self) -> List[str]:
        """
        Determine the order in which nodes should be executed.
        
        Returns:
            List of node IDs in execution order
        """
        # Use topological sort to get execution order
        try:
            return list(nx.topological_sort(self.graph))
        except nx.NetworkXUnfeasible:
            # This should not happen as we already checked for cycles
            raise WorkflowExecutionError(
                message="Cannot determine execution order due to cycles in workflow",
                workflow_id=self.workflow_id
            )
    
    def _should_continue_on_error(self, failed_node_id: str) -> bool:
        """
        Determine if workflow execution should continue after a node fails.
        
        Args:
            failed_node_id: The ID of the failed node
            
        Returns:
            True if execution should continue, False otherwise
        """
        # Get workflow configuration
        workflow_config = next((node["data"] for node in self.nodes if node.get("id") == "workflow_config"), {})
        stop_on_error = workflow_config.get("stop_on_error", True)
        
        if not stop_on_error:
            return True
        
        # If stop_on_error is True, check if any nodes depend on the failed node
        dependent_nodes = set()
        for edge in self.edges:
            if edge["source"] == failed_node_id:
                dependent_nodes.add(edge["target"])
        
        # If there are no dependent nodes, we can continue
        return len(dependent_nodes) == 0
    
    def pause(self) -> None:
        """
        Pause workflow execution.
        """
        self.paused = True
        logger.info(f"Workflow {self.workflow_id} paused")
    
    def resume(self) -> Dict[str, Any]:
        """
        Resume workflow execution.
        
        Returns:
            Dictionary with execution results
        """
        if not self.paused:
            return {
                "execution_id": self.execution_id,
                "workflow_id": self.workflow_id,
                "status": self.status,
                "message": "Workflow is not paused"
            }
        
        self.paused = False
        logger.info(f"Resuming workflow {self.workflow_id}")
        
        return self.execute()
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get the current status of workflow execution.
        
        Returns:
            Dictionary with status information
        """
        execution_time = None
        if self.start_time:
            if self.end_time:
                execution_time = (self.end_time - self.start_time).total_seconds()
            else:
                execution_time = (datetime.now() - self.start_time).total_seconds()
        
        return {
            "execution_id": self.execution_id,
            "workflow_id": self.workflow_id,
            "status": self.status,
            "progress": sum(self.node_progress.values()) / len(self.nodes) if self.nodes else 0,
            "current_node": self.current_node_id,
            "executed_nodes": list(self.executed_nodes),
            "failed_nodes": list(self.failed_nodes),
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "execution_time": execution_time,
            "node_results": self.node_results,
            "paused": self.paused
        }
    
    def get_node_result(self, node_id: str, output_name: str = "default") -> Any:
        """
        Get the result data from a specific node.
        
        Args:
            node_id: The ID of the node
            output_name: Name of the output to retrieve
            
        Returns:
            The node's output data
            
        Raises:
            KeyError: If the node or output doesn't exist
        """
        data_id = f"{node_id}:{output_name}"
        return self.data_manager.get_data(data_id)
    
    def clear_cache(self, node_ids: Optional[List[str]] = None) -> None:
        """
        Clear cached data.
        
        Args:
            node_ids: List of node IDs to clear cache for (optional)
        """
        self.data_manager.clear_cache(node_ids) 
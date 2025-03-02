"""
Agentic Topology API Router

This module defines the FastAPI router for the agentic topology system.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
import logging
import json
from datetime import datetime

from .agent_manager import (
    agent_manager,
    AgentRole,
    AgentCapability,
    AgentStatus,
    InteractionType,
    InteractionProtocol,
    AgentConfig
)
from .workflow_orchestrator import workflow_orchestrator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agentic", tags=["Agentic Topology"])

# Request and response models
class AgentCreateRequest(BaseModel):
    name: str
    role: AgentRole
    capabilities: List[AgentCapability]
    learning_capacity: float = 0.5
    autonomy_level: float = 0.5
    specializations: List[str] = Field(default_factory=list)
    parameters: Dict[str, Any] = Field(default_factory=dict)

class AgentResponse(BaseModel):
    id: str
    name: str
    role: AgentRole
    capabilities: List[AgentCapability]
    learning_capacity: float
    autonomy_level: float
    specializations: List[str]
    status: AgentStatus
    progress: float
    current_task: Optional[str]

class WorkflowExecuteRequest(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    execution_mode: str = "sequential"

class WorkflowExecutionResponse(BaseModel):
    execution_id: str
    status: str
    message: str

class InteractionCreateRequest(BaseModel):
    interaction_type: InteractionType
    protocol: InteractionProtocol
    participants: List[str]
    metadata: Dict[str, Any] = Field(default_factory=dict)

class MessageSendRequest(BaseModel):
    from_agent: str
    to_agent: str
    content: Dict[str, Any]
    requires_response: bool = True
    response_to: Optional[str] = None

# Agent endpoints
@router.post("/agents", response_model=AgentResponse)
async def create_agent(request: AgentCreateRequest):
    """Create a new agent."""
    try:
        # Generate agent ID
        agent_id = f"agent_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Create agent config
        config = AgentConfig(
            id=agent_id,
            name=request.name,
            role=request.role,
            capabilities=request.capabilities,
            learning_capacity=request.learning_capacity,
            autonomy_level=request.autonomy_level,
            specializations=request.specializations,
            parameters=request.parameters
        )
        
        # Create agent
        agent = agent_manager.create_agent(config)
        
        return AgentResponse(
            id=agent.config.id,
            name=agent.config.name,
            role=agent.config.role,
            capabilities=agent.config.capabilities,
            learning_capacity=agent.config.learning_capacity,
            autonomy_level=agent.config.autonomy_level,
            specializations=agent.config.specializations,
            status=agent.state.status,
            progress=agent.state.progress,
            current_task=agent.state.current_task
        )
    except Exception as e:
        logger.exception(f"Error creating agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agents", response_model=List[AgentResponse])
async def get_agents():
    """Get all agents."""
    try:
        return [
            AgentResponse(
                id=agent.config.id,
                name=agent.config.name,
                role=agent.config.role,
                capabilities=agent.config.capabilities,
                learning_capacity=agent.config.learning_capacity,
                autonomy_level=agent.config.autonomy_level,
                specializations=agent.config.specializations,
                status=agent.state.status,
                progress=agent.state.progress,
                current_task=agent.state.current_task
            )
            for agent in agent_manager.agents.values()
        ]
    except Exception as e:
        logger.exception(f"Error getting agents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    """Get an agent by ID."""
    try:
        agent = agent_manager.get_agent(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail=f"Agent not found: {agent_id}")
        
        return AgentResponse(
            id=agent.config.id,
            name=agent.config.name,
            role=agent.config.role,
            capabilities=agent.config.capabilities,
            learning_capacity=agent.config.learning_capacity,
            autonomy_level=agent.config.autonomy_level,
            specializations=agent.config.specializations,
            status=agent.state.status,
            progress=agent.state.progress,
            current_task=agent.state.current_task
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error getting agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent."""
    try:
        success = agent_manager.delete_agent(agent_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Agent not found: {agent_id}")
        
        return {"status": "success", "message": f"Agent deleted: {agent_id}"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error deleting agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agents/default")
async def create_default_agents():
    """Create default agents."""
    try:
        agent_manager.create_default_agents()
        return {"status": "success", "message": "Default agents created"}
    except Exception as e:
        logger.exception(f"Error creating default agents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Workflow execution endpoints
@router.post("/workflow/execute/{workflow_id}", response_model=WorkflowExecutionResponse)
async def execute_workflow(workflow_id: str, request: WorkflowExecuteRequest, background_tasks: BackgroundTasks):
    """Execute a workflow."""
    try:
        # Execute the workflow
        result = await workflow_orchestrator.execute_workflow(
            workflow_id=workflow_id,
            nodes=request.nodes,
            edges=request.edges,
            execution_mode=request.execution_mode
        )
        
        return WorkflowExecutionResponse(
            execution_id=result["execution_id"],
            status=result["status"],
            message=result["message"]
        )
    except Exception as e:
        logger.exception(f"Error executing workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workflow/execution-status/{execution_id}")
async def get_execution_status(execution_id: str):
    """Get the status of a workflow execution."""
    try:
        status = workflow_orchestrator.get_execution_status(execution_id)
        if status["status"] == "not_found":
            raise HTTPException(status_code=404, detail=status["message"])
        
        return status
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error getting execution status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workflow/stop/{execution_id}")
async def stop_execution(execution_id: str):
    """Stop a workflow execution."""
    try:
        result = workflow_orchestrator.stop_execution(execution_id)
        if result["status"] == "not_found":
            raise HTTPException(status_code=404, detail=result["message"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error stopping execution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Agent interaction endpoints
@router.post("/interactions")
async def create_interaction(request: InteractionCreateRequest):
    """Create a new interaction between agents."""
    try:
        interaction = agent_manager.create_interaction(
            interaction_type=request.interaction_type,
            protocol=request.protocol,
            participants=request.participants,
            metadata=request.metadata
        )
        
        if not interaction:
            raise HTTPException(status_code=400, detail="Failed to create interaction")
        
        return {
            "interaction_id": interaction.id,
            "status": "created",
            "message": "Interaction created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error creating interaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interactions/{interaction_id}/messages")
async def send_message(interaction_id: str, request: MessageSendRequest):
    """Send a message in an interaction."""
    try:
        message = agent_manager.send_message(
            from_agent=request.from_agent,
            to_agent=request.to_agent,
            content=request.content,
            interaction_id=interaction_id,
            requires_response=request.requires_response,
            response_to=request.response_to
        )
        
        if not message:
            raise HTTPException(status_code=400, detail="Failed to send message")
        
        # Process messages
        agent_manager.process_messages()
        
        return {
            "message_id": message.id,
            "status": "sent",
            "message": "Message sent successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Agent topology visualization endpoints
@router.get("/topology")
async def get_agent_topology():
    """Get the agent topology for visualization."""
    try:
        # Create nodes for each agent
        nodes = []
        for agent in agent_manager.agents.values():
            nodes.append({
                "id": agent.config.id,
                "label": agent.config.name,
                "type": agent.config.role.value,
                "data": {
                    "role": agent.config.role.value,
                    "capabilities": [cap.value for cap in agent.config.capabilities],
                    "status": agent.state.status.value,
                    "progress": agent.state.progress,
                    "learning_capacity": agent.config.learning_capacity,
                    "autonomy_level": agent.config.autonomy_level,
                    "specializations": agent.config.specializations
                }
            })
        
        # Create edges for each interaction
        edges = []
        for interaction in agent_manager.interactions.values():
            # Create edges between all participants
            for i, from_agent in enumerate(interaction.participants):
                for to_agent in interaction.participants[i+1:]:
                    edges.append({
                        "id": f"{interaction.id}_{from_agent}_{to_agent}",
                        "source": from_agent,
                        "target": to_agent,
                        "data": {
                            "interaction_type": interaction.interaction_type.value,
                            "protocol": interaction.protocol.value,
                            "message_count": len(interaction.messages)
                        }
                    })
        
        return {
            "nodes": nodes,
            "edges": edges
        }
    except Exception as e:
        logger.exception(f"Error getting agent topology: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 
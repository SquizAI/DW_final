from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import uuid
import json

# Create router
router = APIRouter()

# Models
class NodeBase(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any] = {}

class EdgeBase(BaseModel):
    id: str
    source: str
    target: str
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    tags: List[str] = []

class WorkflowCreate(WorkflowBase):
    nodes: List[NodeBase]
    edges: List[EdgeBase]

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    nodes: Optional[List[NodeBase]] = None
    edges: Optional[List[EdgeBase]] = None

class WorkflowStatus(BaseModel):
    status: str = "idle"  # idle, running, completed, failed
    progress: float = 0.0
    message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None

class Workflow(WorkflowBase):
    id: str
    nodes: List[NodeBase]
    edges: List[EdgeBase]
    status: WorkflowStatus
    created_at: datetime
    updated_at: datetime
    owner_id: str
    last_run: Optional[datetime] = None

    class Config:
        from_attributes = True

# Mock workflow database - in a real app, this would be in a database
WORKFLOWS_DB = {
    "workflow_1": {
        "id": "workflow_1",
        "name": "Data Cleaning Pipeline",
        "description": "A workflow to clean and preprocess data",
        "tags": ["data cleaning", "preprocessing"],
        "nodes": [
            {
                "id": "node_1",
                "type": "dataSource",
                "position": {"x": 100, "y": 100},
                "data": {"datasetId": "dataset_1"}
            },
            {
                "id": "node_2",
                "type": "missingValues",
                "position": {"x": 300, "y": 100},
                "data": {"strategy": "mean"}
            },
            {
                "id": "node_3",
                "type": "outlierRemoval",
                "position": {"x": 500, "y": 100},
                "data": {"method": "iqr", "threshold": 1.5}
            }
        ],
        "edges": [
            {
                "id": "edge_1",
                "source": "node_1",
                "target": "node_2",
                "source_handle": "output",
                "target_handle": "input"
            },
            {
                "id": "edge_2",
                "source": "node_2",
                "target": "node_3",
                "source_handle": "output",
                "target_handle": "input"
            }
        ],
        "status": {
            "status": "completed",
            "progress": 1.0,
            "message": "Workflow completed successfully",
            "started_at": datetime.now(),
            "completed_at": datetime.now(),
            "error": None
        },
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "owner_id": "user_1",
        "last_run": datetime.now()
    },
    "workflow_2": {
        "id": "workflow_2",
        "name": "Feature Engineering",
        "description": "A workflow to create new features",
        "tags": ["feature engineering", "preprocessing"],
        "nodes": [
            {
                "id": "node_1",
                "type": "dataSource",
                "position": {"x": 100, "y": 100},
                "data": {"datasetId": "dataset_2"}
            },
            {
                "id": "node_2",
                "type": "oneHotEncoding",
                "position": {"x": 300, "y": 100},
                "data": {"columns": ["location"]}
            },
            {
                "id": "node_3",
                "type": "scaling",
                "position": {"x": 500, "y": 100},
                "data": {"method": "minmax"}
            }
        ],
        "edges": [
            {
                "id": "edge_1",
                "source": "node_1",
                "target": "node_2",
                "source_handle": "output",
                "target_handle": "input"
            },
            {
                "id": "edge_2",
                "source": "node_2",
                "target": "node_3",
                "source_handle": "output",
                "target_handle": "input"
            }
        ],
        "status": {
            "status": "idle",
            "progress": 0.0,
            "message": None,
            "started_at": None,
            "completed_at": None,
            "error": None
        },
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "owner_id": "user_2",
        "last_run": None
    }
}

# Mock function to simulate workflow execution
async def execute_workflow(workflow_id: str):
    """Simulate workflow execution in the background"""
    if workflow_id not in WORKFLOWS_DB:
        return
    
    workflow = WORKFLOWS_DB[workflow_id]
    
    # Update status to running
    workflow["status"]["status"] = "running"
    workflow["status"]["progress"] = 0.0
    workflow["status"]["message"] = "Workflow started"
    workflow["status"]["started_at"] = datetime.now()
    workflow["status"]["completed_at"] = None
    workflow["status"]["error"] = None
    
    # Simulate progress
    import asyncio
    
    try:
        # Simulate node execution
        for i, node in enumerate(workflow["nodes"]):
            # Update progress
            progress = (i + 1) / len(workflow["nodes"])
            workflow["status"]["progress"] = progress
            workflow["status"]["message"] = f"Executing node {node['id']}"
            
            # Simulate processing time
            await asyncio.sleep(1)
        
        # Update status to completed
        workflow["status"]["status"] = "completed"
        workflow["status"]["progress"] = 1.0
        workflow["status"]["message"] = "Workflow completed successfully"
        workflow["status"]["completed_at"] = datetime.now()
        workflow["last_run"] = datetime.now()
    
    except Exception as e:
        # Update status to failed
        workflow["status"]["status"] = "failed"
        workflow["status"]["message"] = "Workflow execution failed"
        workflow["status"]["error"] = str(e)
        workflow["status"]["completed_at"] = datetime.now()

# Endpoints
@router.get("/", response_model=List[Workflow])
async def get_workflows(
    owner_id: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all workflows with optional filtering"""
    workflows = list(WORKFLOWS_DB.values())
    
    # Filter by owner
    if owner_id:
        workflows = [w for w in workflows if w["owner_id"] == owner_id]
    
    # Filter by tag
    if tag:
        workflows = [w for w in workflows if tag in w["tags"]]
    
    # Filter by search term
    if search:
        search = search.lower()
        workflows = [
            w for w in workflows 
            if search in w["name"].lower() or 
               (w["description"] and search in w["description"].lower())
        ]
    
    # Filter by status
    if status:
        workflows = [w for w in workflows if w["status"]["status"] == status]
    
    return workflows

@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: str):
    """Get a specific workflow by ID"""
    if workflow_id not in WORKFLOWS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    return WORKFLOWS_DB[workflow_id]

@router.post("/", response_model=Workflow, status_code=status.HTTP_201_CREATED)
async def create_workflow(workflow: WorkflowCreate, owner_id: str):
    """Create a new workflow"""
    workflow_id = f"workflow_{len(WORKFLOWS_DB) + 1}"
    
    # Create workflow object
    new_workflow = {
        "id": workflow_id,
        "name": workflow.name,
        "description": workflow.description,
        "tags": workflow.tags,
        "nodes": [node.dict() for node in workflow.nodes],
        "edges": [edge.dict() for edge in workflow.edges],
        "status": {
            "status": "idle",
            "progress": 0.0,
            "message": None,
            "started_at": None,
            "completed_at": None,
            "error": None
        },
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "owner_id": owner_id,
        "last_run": None
    }
    
    WORKFLOWS_DB[workflow_id] = new_workflow
    return new_workflow

@router.put("/{workflow_id}", response_model=Workflow)
async def update_workflow(workflow_id: str, workflow_update: WorkflowUpdate):
    """Update a workflow"""
    if workflow_id not in WORKFLOWS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Update workflow fields
    workflow_data = WORKFLOWS_DB[workflow_id]
    update_data = workflow_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if value is not None:
            if field in ["nodes", "edges"]:
                # Convert Pydantic models to dicts
                workflow_data[field] = [item.dict() for item in value]
            else:
                workflow_data[field] = value
    
    workflow_data["updated_at"] = datetime.now()
    WORKFLOWS_DB[workflow_id] = workflow_data
    
    return workflow_data

@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(workflow_id: str):
    """Delete a workflow"""
    if workflow_id not in WORKFLOWS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    del WORKFLOWS_DB[workflow_id]
    return None

@router.post("/{workflow_id}/execute", response_model=WorkflowStatus)
async def execute_workflow_endpoint(workflow_id: str, background_tasks: BackgroundTasks):
    """Execute a workflow"""
    if workflow_id not in WORKFLOWS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    workflow = WORKFLOWS_DB[workflow_id]
    
    # Check if workflow is already running
    if workflow["status"]["status"] == "running":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workflow is already running"
        )
    
    # Start workflow execution in the background
    background_tasks.add_task(execute_workflow, workflow_id)
    
    # Update initial status
    workflow["status"]["status"] = "running"
    workflow["status"]["progress"] = 0.0
    workflow["status"]["message"] = "Workflow started"
    workflow["status"]["started_at"] = datetime.now()
    workflow["status"]["completed_at"] = None
    workflow["status"]["error"] = None
    
    return workflow["status"]

@router.get("/{workflow_id}/status", response_model=WorkflowStatus)
async def get_workflow_status(workflow_id: str):
    """Get the status of a workflow"""
    if workflow_id not in WORKFLOWS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    return WORKFLOWS_DB[workflow_id]["status"] 
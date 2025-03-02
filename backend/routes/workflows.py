from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List, Dict, Optional, Any, Union
from pydantic import BaseModel, Field
import json
from datetime import datetime
import logging
from pathlib import Path
import openai
from uuid import uuid4
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Import database models and dependencies
from app.database import get_db
from app import models, schemas, crud

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workflows")

# Load environment variables
load_dotenv()

# Initialize base directories - using local paths instead of /app
current_dir = Path(os.path.dirname(os.path.abspath(__file__)))
project_root = current_dir.parent
BASE_DATA_DIR = project_root / "data"
WORKFLOWS_DIR = BASE_DATA_DIR / "workflows"

# Create necessary directories
Path(WORKFLOWS_DIR).mkdir(parents=True, exist_ok=True)

class WorkflowNode(BaseModel):
    """A node in the workflow graph"""
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]
    inputs: List[Dict[str, Any]] = Field(default_factory=list)
    outputs: List[Dict[str, Any]] = Field(default_factory=list)
    settings: Dict[str, Any] = Field(default_factory=dict)

class WorkflowEdge(BaseModel):
    """A connection between workflow nodes"""
    id: str
    source: str
    target: str
    sourceHandle: Optional[str]
    targetHandle: Optional[str]
    type: str = "default"

class Workflow(BaseModel):
    """Complete workflow definition"""
    id: str
    name: str
    description: str
    dataset_id: Optional[str] = None
    template: Optional[str] = None
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]
    created_at: datetime
    updated_at: datetime
    created_by: str
    is_ai_generated: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AIWorkflowRequest(BaseModel):
    """Request to generate a workflow using AI"""
    description: str
    input_data_type: Optional[str]
    output_requirements: Optional[str]
    complexity_level: str = "medium"
    preferred_tools: List[str] = Field(default_factory=list)

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    dataset_id: Optional[str] = None
    template: Optional[str] = None
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    metadata: Dict[str, Any] = {}

# Node type definitions for the frontend
NODE_TYPES = {
    "dataSource": {
        "category": "Input",
        "operations": ["csvUpload", "kaggleDataset", "databaseConnection", "apiEndpoint"]
    },
    "transformation": {
        "category": "Processing",
        "operations": ["filter", "aggregate", "join", "sort", "groupBy", "pivot"]
    },
    "analysis": {
        "category": "Analysis",
        "operations": ["statistics", "correlation", "regression", "clustering", "prediction"]
    },
    "visualization": {
        "category": "Output",
        "operations": ["lineChart", "barChart", "scatterPlot", "heatmap", "dashboard"]
    },
    "aiAssistant": {
        "category": "AI",
        "operations": ["dataInsights", "anomalyDetection", "featureEngineering", "modelSelection"]
    }
}

@router.get("/node-types")
async def get_node_types():
    """Get available node types for workflow building"""
    return NODE_TYPES

@router.post("/ai/generate")
async def generate_workflow(request: schemas.AIWorkflowRequest, db: Session = Depends(get_db)):
    """Generate a workflow using AI based on user requirements"""
    try:
        # Use OpenAI to generate workflow structure
        prompt = f"""Create a data analysis workflow based on these requirements:
        Description: {request.description}
        Input Data: {request.input_data_type or 'Any'}
        Output Needs: {request.output_requirements or 'Standard analysis'}
        Complexity: {request.complexity_level}
        Preferred Tools: {', '.join(request.preferred_tools) if request.preferred_tools else 'Any'}
        
        Generate a workflow that includes appropriate data processing, analysis, and visualization steps.
        """
        
        completion = await openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a data workflow architect. Create workflows using the available node types: dataSource, transformation, analysis, visualization, and aiAssistant."},
                {"role": "user", "content": prompt}
            ],
            functions=[{
                "name": "create_workflow",
                "description": "Create a workflow with nodes and edges",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "nodes": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "type": {"type": "string"},
                                    "operation": {"type": "string"},
                                    "position": {
                                        "type": "object",
                                        "properties": {
                                            "x": {"type": "number"},
                                            "y": {"type": "number"}
                                        }
                                    },
                                    "settings": {"type": "object"}
                                }
                            }
                        },
                        "edges": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "source": {"type": "string"},
                                    "target": {"type": "string"}
                                }
                            }
                        }
                    }
                }
            }]
        )
        
        # Convert AI response to workflow
        workflow_data = completion.choices[0].message.function_call.arguments
        workflow_json = json.loads(workflow_data)
        
        # Convert nodes to proper format
        nodes = []
        for node_data in workflow_json["nodes"]:
            nodes.append(schemas.WorkflowNodeCreate(
                id=node_data["id"],
                type=node_data["type"],
                position_x=node_data["position"]["x"],
                position_y=node_data["position"]["y"],
                data={"label": node_data.get("operation", "Node")}
            ))
        
        # Convert edges to proper format
        edges = []
        for i, edge_data in enumerate(workflow_json["edges"]):
            edges.append(schemas.WorkflowEdgeCreate(
                id=f"edge-{i+1}",
                source=edge_data["source"],
                target=edge_data["target"]
            ))
        
        # Create workflow object
        workflow_create = schemas.WorkflowCreate(
            name=f"AI Generated Workflow - {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            description=request.description,
            dataset_id=request.input_data_type,
            template="ai_generated",
            created_by="AI",
            is_ai_generated=True,
            nodes=nodes,
            edges=edges,
            metadata={
                "input_requirements": request.input_data_type,
                "output_requirements": request.output_requirements,
                "complexity_level": request.complexity_level,
                "preferred_tools": request.preferred_tools
            }
        )
        
        # Save to database
        db_workflow = crud.create_workflow(db, workflow_create)
        
        return db_workflow
        
    except Exception as e:
        logger.error(f"Error generating workflow: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate workflow: {str(e)}"
        )

@router.get("/", response_model=List[schemas.Workflow])
async def get_all_workflows(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all workflows"""
    return crud.get_workflows(db, skip=skip, limit=limit)

@router.get("/{workflow_id}", response_model=schemas.Workflow)
async def get_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Get a workflow by ID"""
    workflow = crud.get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.post("/", response_model=schemas.Workflow)
async def create_workflow(workflow: schemas.WorkflowCreate, db: Session = Depends(get_db)):
    """Create a new workflow"""
    return crud.create_workflow(db, workflow)

@router.put("/{workflow_id}", response_model=schemas.Workflow)
async def update_workflow(workflow_id: str, workflow: schemas.WorkflowUpdate, db: Session = Depends(get_db)):
    """Update a workflow"""
    db_workflow = crud.update_workflow(db, workflow_id, workflow)
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return db_workflow

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Delete a workflow"""
    success = crud.delete_workflow(db, workflow_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted successfully"}

@router.post("/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Execute a workflow"""
    workflow = crud.get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    try:
        # This is a placeholder - actual implementation would need to handle
        # node execution logic, data passing between nodes, etc.
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "status": "completed",
            "results": {"message": "Workflow execution completed"}
        }
    
    except Exception as e:
        logger.error(f"Error executing workflow: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to execute workflow: {str(e)}"
        )

@router.post("/{workflow_id}/ai/optimize")
async def optimize_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Use AI to optimize an existing workflow"""
    try:
        workflow = crud.get_workflow(db, workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Use OpenAI to suggest optimizations
        prompt = f"""Analyze and optimize this data workflow:
        Current workflow: {json.dumps(workflow.dict(), indent=2)}
        
        Suggest optimizations for:
        1. Performance
        2. Resource usage
        3. Analysis quality
        4. Visualization effectiveness
        """
        
        completion = await openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a workflow optimization expert. Analyze workflows and suggest improvements."},
                {"role": "user", "content": prompt}
            ]
        )
        
        suggestions = completion.choices[0].message.content
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "optimization_suggestions": suggestions
        }
    
    except Exception as e:
        logger.error(f"Error optimizing workflow: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to optimize workflow: {str(e)}"
        ) 
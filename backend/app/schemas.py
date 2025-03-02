from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
from datetime import datetime

# Dataset Schemas
class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None

class DatasetCreate(DatasetBase):
    file_path: str

class DatasetUpdate(DatasetBase):
    name: Optional[str] = None
    file_path: Optional[str] = None

class DatasetInDB(DatasetBase):
    id: str
    file_path: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Dataset(DatasetInDB):
    pass

# Workflow Node Schemas
class WorkflowNodeBase(BaseModel):
    type: str
    position_x: float
    position_y: float
    data: Optional[Dict[str, Any]] = None

class WorkflowNodeCreate(WorkflowNodeBase):
    id: str

class WorkflowNodeUpdate(WorkflowNodeBase):
    type: Optional[str] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None

class WorkflowNodeInDB(WorkflowNodeBase):
    id: str
    workflow_id: str

    class Config:
        from_attributes = True

class WorkflowNode(WorkflowNodeInDB):
    pass

# Workflow Edge Schemas
class WorkflowEdgeBase(BaseModel):
    source: str
    target: str
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None
    type: Optional[str] = "default"

class WorkflowEdgeCreate(WorkflowEdgeBase):
    id: str

class WorkflowEdgeUpdate(WorkflowEdgeBase):
    source: Optional[str] = None
    target: Optional[str] = None

class WorkflowEdgeInDB(WorkflowEdgeBase):
    id: str
    workflow_id: str

    class Config:
        from_attributes = True

class WorkflowEdge(WorkflowEdgeInDB):
    pass

# Workflow Schemas
class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    dataset_id: Optional[str] = None
    template: Optional[str] = None
    created_by: Optional[str] = None
    is_ai_generated: Optional[bool] = False
    meta_data: Optional[Dict[str, Any]] = None

class WorkflowCreate(WorkflowBase):
    nodes: List[WorkflowNodeCreate] = []
    edges: List[WorkflowEdgeCreate] = []

class WorkflowUpdate(WorkflowBase):
    name: Optional[str] = None
    nodes: Optional[List[WorkflowNodeCreate]] = None
    edges: Optional[List[WorkflowEdgeCreate]] = None

class WorkflowInDB(WorkflowBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Workflow(WorkflowInDB):
    nodes: List[WorkflowNode] = []
    edges: List[WorkflowEdge] = []

# AI Workflow Request Schema
class AIWorkflowRequest(BaseModel):
    description: str
    input_data_type: Optional[str] = None
    output_requirements: Optional[str] = None
    complexity_level: str = "medium"
    preferred_tools: List[str] = Field(default_factory=list)

# Kaggle Schemas
class KaggleDatasetInfo(BaseModel):
    ref: str
    title: str
    size: Optional[int] = None
    lastUpdated: Optional[str] = None
    downloadCount: Optional[int] = None
    voteCount: Optional[int] = None
    description: Optional[str] = None
    ownerName: Optional[str] = None
    tags: Optional[List[str]] = None
    license: Optional[str] = None
    url: str

# API Response Schemas
class ResponseBase(BaseModel):
    success: bool
    message: str

class DatasetResponse(ResponseBase):
    data: Optional[Dataset] = None

class DatasetsResponse(ResponseBase):
    data: List[Dataset] = []

class WorkflowResponse(ResponseBase):
    data: Optional[Workflow] = None

class WorkflowsResponse(ResponseBase):
    data: List[Workflow] = [] 
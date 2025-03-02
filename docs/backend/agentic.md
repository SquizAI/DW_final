# agentic Backend Module

## Overview

This documentation is automatically generated for the agentic backend module.

## Files

```
backend/app/api/agentic/__init__.py
backend/app/api/agentic/routes.py
```

## Endpoints

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py:@router.get("/agents", response_model=List[Agent])
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py:@router.get("/agents/{agent_id}", response_model=Agent)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py:@router.get("/workflow/execution-status/{execution_id}", response_model=Dict[str, Any])
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py:@router.post("/agents", response_model=Agent)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py:@router.post("/agents/default", response_model=List[Agent])
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py:@router.post("/workflow/execute/{workflow_id}", response_model=Dict[str, Any])
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py:@router.post("/workflow/stop/{execution_id}", response_model=Dict[str, str])
```

## Models

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py:class Agent(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    name: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    role: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    capabilities: List[str]
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    description: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    status: str = "available"
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    created_at: datetime = Field(default_factory=datetime.now)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py:class WorkflowNode(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    id: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    type: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    data: Dict[str, Any]
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    status: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    agent_id: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    start_time: Optional[datetime] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    end_time: Optional[datetime] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    progress: Optional[float] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    error: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    output: Optional[Dict[str, Any]] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py:class WorkflowEdge(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    id: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    source: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    target: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py:class WorkflowExecution(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    workflow_id: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    status: str = "pending"
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    nodes: List[WorkflowNode]
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    edges: List[WorkflowEdge]
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    start_time: Optional[datetime] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    end_time: Optional[datetime] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    results: Optional[Dict[str, Any]] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-    insights: Optional[Dict[str, Any]] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/agentic/routes.py-
```

## Last Updated

Wed Feb 26 21:17:52 EST 2025

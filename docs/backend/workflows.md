# workflows Backend Module

## Overview

This documentation is automatically generated for the workflows backend module.

## Files

```
backend/app/api/workflows/__init__.py
backend/app/api/workflows/router.py
```

## Endpoints

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py:@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py:@router.get("/", response_model=List[Workflow])
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py:@router.get("/{workflow_id}", response_model=Workflow)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py:@router.get("/{workflow_id}/status", response_model=WorkflowStatus)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py:@router.post("/", response_model=Workflow, status_code=status.HTTP_201_CREATED)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py:@router.post("/{workflow_id}/execute", response_model=WorkflowStatus)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py:@router.put("/{workflow_id}", response_model=Workflow)
```

## Models

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py:class NodeBase(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    id: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    type: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    position: Dict[str, float]
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    data: Dict[str, Any] = {}
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py:class EdgeBase(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    id: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    source: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    target: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    source_handle: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    target_handle: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py:class WorkflowBase(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    name: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    description: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    tags: List[str] = []
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-class WorkflowCreate(WorkflowBase):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    nodes: List[NodeBase]
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    edges: List[EdgeBase]
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py:class WorkflowUpdate(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    name: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    description: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    tags: Optional[List[str]] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    nodes: Optional[List[NodeBase]] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    edges: Optional[List[EdgeBase]] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py:class WorkflowStatus(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    status: str = "idle"  # idle, running, completed, failed
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    progress: float = 0.0
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    message: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    started_at: Optional[datetime] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    completed_at: Optional[datetime] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    error: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-class Workflow(WorkflowBase):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    id: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/workflows/router.py-    nodes: List[NodeBase]
```

## Last Updated

Wed Feb 26 21:17:52 EST 2025

# datasets Backend Module

## Overview

This documentation is automatically generated for the datasets backend module.

## Files

```
backend/app/api/datasets/__init__.py
backend/app/api/datasets/router.py
```

## Endpoints

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py:@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py:@router.get("/", response_model=List[Dataset])
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py:@router.get("/{dataset_id}", response_model=Dataset)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py:@router.get("/{dataset_id}/preview", response_model=Dict[str, Any])
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py:@router.post("/", response_model=Dataset, status_code=status.HTTP_201_CREATED)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py:@router.put("/{dataset_id}", response_model=Dataset)
```

## Models

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py:class DatasetBase(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    name: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    description: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    source: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    tags: List[str] = []
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-class DatasetCreate(DatasetBase):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    pass
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py:class DatasetUpdate(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    name: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    description: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    source: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    tags: Optional[List[str]] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-class Dataset(DatasetBase):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    id: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    file_path: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    file_size: int
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/datasets/router.py-    file_type: str
```

## Last Updated

Wed Feb 26 21:17:52 EST 2025

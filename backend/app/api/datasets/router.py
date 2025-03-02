from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import json
from pathlib import Path

# Create router
router = APIRouter()

# Models
class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None
    source: Optional[str] = None
    tags: List[str] = []

class DatasetCreate(DatasetBase):
    pass

class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    source: Optional[str] = None
    tags: Optional[List[str]] = None

class Dataset(DatasetBase):
    id: str
    file_path: str
    file_size: int
    file_type: str
    columns: List[str] = []
    row_count: int = 0
    created_at: datetime
    updated_at: datetime
    owner_id: str

    class Config:
        from_attributes = True

# Mock dataset database - in a real app, this would be in a database
DATASETS_DB = {
    "dataset_1": {
        "id": "dataset_1",
        "name": "Iris Dataset",
        "description": "Famous iris flower dataset",
        "source": "UCI Machine Learning Repository",
        "tags": ["classification", "beginner", "flowers"],
        "file_path": "/data/iris.csv",
        "file_size": 4096,
        "file_type": "csv",
        "columns": ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"],
        "row_count": 150,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "owner_id": "user_1"
    },
    "dataset_2": {
        "id": "dataset_2",
        "name": "Housing Prices",
        "description": "Boston housing prices dataset",
        "source": "Kaggle",
        "tags": ["regression", "real estate", "prices"],
        "file_path": "/data/housing.csv",
        "file_size": 12288,
        "file_type": "csv",
        "columns": ["price", "bedrooms", "bathrooms", "sqft", "location"],
        "row_count": 506,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "owner_id": "user_2"
    }
}

# Endpoints
@router.get("/", response_model=List[Dataset])
async def get_datasets(
    owner_id: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None
):
    """Get all datasets with optional filtering"""
    datasets = list(DATASETS_DB.values())
    
    # Filter by owner
    if owner_id:
        datasets = [d for d in datasets if d["owner_id"] == owner_id]
    
    # Filter by tag
    if tag:
        datasets = [d for d in datasets if tag in d["tags"]]
    
    # Filter by search term
    if search:
        search = search.lower()
        datasets = [
            d for d in datasets 
            if search in d["name"].lower() or 
               (d["description"] and search in d["description"].lower())
        ]
    
    return datasets

@router.get("/{dataset_id}", response_model=Dataset)
async def get_dataset(dataset_id: str):
    """Get a specific dataset by ID"""
    if dataset_id not in DATASETS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    return DATASETS_DB[dataset_id]

@router.post("/", response_model=Dataset, status_code=status.HTTP_201_CREATED)
async def create_dataset(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    source: Optional[str] = Form(None),
    tags: str = Form("[]"),  # JSON string of tags
    owner_id: str = Form(...),
    file: UploadFile = File(...)
):
    """Create a new dataset with file upload"""
    # Parse tags from JSON string
    try:
        tags_list = json.loads(tags)
        if not isinstance(tags_list, list):
            tags_list = []
    except json.JSONDecodeError:
        tags_list = []
    
    # Create dataset ID
    dataset_id = f"dataset_{len(DATASETS_DB) + 1}"
    
    # Get file info
    file_size = 0
    file_content = await file.read()
    file_size = len(file_content)
    
    # Get file extension
    file_extension = Path(file.filename).suffix.lstrip(".").lower()
    
    # In a real app, you would save the file to disk or cloud storage
    file_path = f"/data/{dataset_id}.{file_extension}"
    
    # Create dataset object
    new_dataset = {
        "id": dataset_id,
        "name": name,
        "description": description,
        "source": source,
        "tags": tags_list,
        "file_path": file_path,
        "file_size": file_size,
        "file_type": file_extension,
        "columns": [],  # In a real app, you would parse the file to get columns
        "row_count": 0,  # In a real app, you would count rows
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "owner_id": owner_id
    }
    
    DATASETS_DB[dataset_id] = new_dataset
    return new_dataset

@router.put("/{dataset_id}", response_model=Dataset)
async def update_dataset(dataset_id: str, dataset_update: DatasetUpdate):
    """Update a dataset"""
    if dataset_id not in DATASETS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Update dataset fields
    dataset_data = DATASETS_DB[dataset_id]
    update_data = dataset_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if value is not None:
            dataset_data[field] = value
    
    dataset_data["updated_at"] = datetime.now()
    DATASETS_DB[dataset_id] = dataset_data
    
    return dataset_data

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dataset(dataset_id: str):
    """Delete a dataset"""
    if dataset_id not in DATASETS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # In a real app, you would also delete the file from disk or cloud storage
    
    del DATASETS_DB[dataset_id]
    return None

@router.get("/{dataset_id}/preview", response_model=Dict[str, Any])
async def preview_dataset(dataset_id: str, rows: int = Query(10, ge=1, le=100)):
    """Get a preview of the dataset (first N rows)"""
    if dataset_id not in DATASETS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    dataset = DATASETS_DB[dataset_id]
    
    # In a real app, you would read the file and return the first N rows
    # Here we'll just return mock data
    
    columns = dataset["columns"]
    
    # Generate mock data rows
    data = []
    for i in range(min(rows, dataset["row_count"])):
        row = {col: f"Value {i+1}" for col in columns}
        data.append(row)
    
    return {
        "dataset_id": dataset_id,
        "name": dataset["name"],
        "columns": columns,
        "rows": data
    } 
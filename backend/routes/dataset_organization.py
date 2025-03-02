"""
Dataset Organization API

This module provides API endpoints for the dataset organization system.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body
from pydantic import BaseModel
from sqlalchemy.orm import Session
from pathlib import Path as FilePath

from app.database import get_db
from app.dataset_organization import BucketManager, AICataloger, DatasetIndexer
from app import models, schemas

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/datasets/organization")

# Initialize components - using local paths instead of /app
current_dir = FilePath(os.path.dirname(os.path.abspath(__file__)))
project_root = current_dir.parent
data_dir = str(project_root / 'data')
# Ensure data directory exists
os.makedirs(data_dir, exist_ok=True)
logger.info(f"Using data directory: {data_dir}")

bucket_manager = BucketManager(data_dir=data_dir)
dataset_indexer = DatasetIndexer(data_dir=data_dir)
ai_cataloger = AICataloger(data_dir=data_dir)

# Pydantic models for API
class BucketCreate(BaseModel):
    """Model for creating a bucket"""
    name: str
    description: Optional[str] = None
    bucket_id: Optional[str] = None

class BucketUpdate(BaseModel):
    """Model for updating a bucket"""
    name: Optional[str] = None
    description: Optional[str] = None

class DatasetAddToBucket(BaseModel):
    """Model for adding a dataset to a bucket"""
    dataset_id: str

class DatasetCatalogUpdate(BaseModel):
    """Model for updating dataset catalog information"""
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None

class DatasetOrganize(BaseModel):
    """Model for organizing a dataset"""
    dataset_id: str
    target_dir: Optional[str] = None

# API endpoints for buckets
@router.get("/buckets", response_model=List[Dict[str, Any]])
async def get_all_buckets():
    """Get all buckets"""
    return bucket_manager.get_all_buckets()

@router.get("/buckets/{bucket_id}", response_model=Dict[str, Any])
async def get_bucket(bucket_id: str = Path(..., description="ID of the bucket")):
    """Get a specific bucket"""
    bucket = bucket_manager.get_bucket(bucket_id)
    if not bucket:
        raise HTTPException(status_code=404, detail=f"Bucket {bucket_id} not found")
    return bucket

@router.post("/buckets", response_model=Dict[str, Any])
async def create_bucket(bucket: BucketCreate):
    """Create a new bucket"""
    return bucket_manager.create_bucket(
        name=bucket.name,
        description=bucket.description,
        bucket_id=bucket.bucket_id
    )

@router.put("/buckets/{bucket_id}", response_model=Dict[str, Any])
async def update_bucket(
    bucket_update: BucketUpdate,
    bucket_id: str = Path(..., description="ID of the bucket")
):
    """Update a bucket"""
    updated_bucket = bucket_manager.update_bucket(
        bucket_id=bucket_id,
        name=bucket_update.name,
        description=bucket_update.description
    )
    
    if not updated_bucket:
        raise HTTPException(status_code=404, detail=f"Bucket {bucket_id} not found")
    
    return updated_bucket

@router.delete("/buckets/{bucket_id}")
async def delete_bucket(
    bucket_id: str = Path(..., description="ID of the bucket"),
    force: bool = Query(False, description="Force deletion even if bucket contains datasets")
):
    """Delete a bucket"""
    success = bucket_manager.delete_bucket(bucket_id=bucket_id, force=force)
    
    if not success:
        raise HTTPException(status_code=404, detail=f"Bucket {bucket_id} not found or not empty")
    
    return {"message": f"Bucket {bucket_id} deleted successfully"}

@router.post("/buckets/{bucket_id}/datasets", response_model=Dict[str, Any])
async def add_dataset_to_bucket(
    dataset: DatasetAddToBucket,
    bucket_id: str = Path(..., description="ID of the bucket")
):
    """Add a dataset to a bucket"""
    success = bucket_manager.add_dataset_to_bucket(
        dataset_id=dataset.dataset_id,
        bucket_id=bucket_id
    )
    
    if not success:
        raise HTTPException(status_code=404, detail=f"Bucket {bucket_id} not found or dataset already in bucket")
    
    return {"message": f"Dataset {dataset.dataset_id} added to bucket {bucket_id}"}

@router.delete("/buckets/{bucket_id}/datasets/{dataset_id}")
async def remove_dataset_from_bucket(
    bucket_id: str = Path(..., description="ID of the bucket"),
    dataset_id: str = Path(..., description="ID of the dataset")
):
    """Remove a dataset from a bucket"""
    success = bucket_manager.remove_dataset_from_bucket(
        dataset_id=dataset_id,
        bucket_id=bucket_id
    )
    
    if not success:
        raise HTTPException(status_code=404, detail=f"Bucket {bucket_id} not found or dataset not in bucket")
    
    return {"message": f"Dataset {dataset_id} removed from bucket {bucket_id}"}

@router.get("/buckets/{bucket_id}/datasets", response_model=List[str])
async def get_datasets_in_bucket(bucket_id: str = Path(..., description="ID of the bucket")):
    """Get all datasets in a bucket"""
    return bucket_manager.get_datasets_in_bucket(bucket_id)

# API endpoints for dataset indexing
@router.get("/index", response_model=List[Dict[str, Any]])
async def get_all_indexed_datasets():
    """Get all indexed datasets"""
    return dataset_indexer.get_all_datasets()

@router.get("/index/{dataset_id}", response_model=Dict[str, Any])
async def get_indexed_dataset(dataset_id: str = Path(..., description="ID of the dataset")):
    """Get a specific indexed dataset"""
    dataset = dataset_indexer.get_dataset(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found in index")
    return dataset

@router.post("/index", response_model=Dict[str, Any])
async def index_dataset(
    file_path: str = Body(..., embed=True),
    name: Optional[str] = Body(None, embed=True),
    description: Optional[str] = Body(None, embed=True),
    tags: Optional[List[str]] = Body(None, embed=True),
    source: Optional[str] = Body(None, embed=True)
):
    """Index a dataset file"""
    try:
        return dataset_indexer.index_dataset(
            file_path=file_path,
            name=name,
            description=description,
            tags=tags,
            source=source
        )
    except Exception as e:
        logger.error(f"Error indexing dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error indexing dataset: {str(e)}")

@router.put("/index/{dataset_id}", response_model=Dict[str, Any])
async def update_indexed_dataset(
    dataset_id: str = Path(..., description="ID of the dataset"),
    name: Optional[str] = Body(None, embed=True),
    description: Optional[str] = Body(None, embed=True),
    tags: Optional[List[str]] = Body(None, embed=True)
):
    """Update an indexed dataset"""
    updated_dataset = dataset_indexer.update_dataset(
        dataset_id=dataset_id,
        name=name,
        description=description,
        tags=tags
    )
    
    if not updated_dataset:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found in index")
    
    return updated_dataset

@router.delete("/index/{dataset_id}")
async def delete_indexed_dataset(
    dataset_id: str = Path(..., description="ID of the dataset"),
    delete_file: bool = Query(False, description="Whether to also delete the dataset file")
):
    """Delete an indexed dataset"""
    success = dataset_indexer.delete_dataset(
        dataset_id=dataset_id,
        delete_file=delete_file
    )
    
    if not success:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found in index")
    
    return {"message": f"Dataset {dataset_id} deleted from index"}

@router.get("/index/search", response_model=List[Dict[str, Any]])
async def search_indexed_datasets(query: str = Query(..., description="Search query")):
    """Search for indexed datasets"""
    return dataset_indexer.search_datasets(query)

@router.get("/index/tag/{tag}", response_model=List[Dict[str, Any]])
async def get_datasets_by_tag(tag: str = Path(..., description="Tag to filter by")):
    """Get all datasets with a specific tag"""
    return dataset_indexer.get_datasets_by_tag(tag)

@router.get("/index/source/{source}", response_model=List[Dict[str, Any]])
async def get_datasets_by_source(source: str = Path(..., description="Source to filter by")):
    """Get all datasets from a specific source"""
    return dataset_indexer.get_datasets_by_source(source)

@router.post("/index/organize", response_model=Dict[str, Any])
async def organize_dataset(dataset_organize: DatasetOrganize):
    """Organize a dataset by moving it to a target directory"""
    result = dataset_indexer.organize_dataset(
        dataset_id=dataset_organize.dataset_id,
        target_dir=dataset_organize.target_dir
    )
    
    if not result:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_organize.dataset_id} not found in index or error organizing")
    
    return result

@router.post("/index/scan", response_model=Dict[str, Any])
async def scan_directory_for_datasets(directory: str = Body(..., embed=True)):
    """Scan a directory for datasets and index them"""
    try:
        return dataset_indexer.index_existing_datasets(directory)
    except Exception as e:
        logger.error(f"Error scanning directory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error scanning directory: {str(e)}")

# API endpoints for AI cataloging
@router.get("/catalog", response_model=Dict[str, Any])
async def get_catalog():
    """Get the AI catalog"""
    return ai_cataloger._load_catalog()

@router.get("/catalog/{dataset_id}", response_model=Dict[str, Any])
async def get_dataset_catalog(dataset_id: str = Path(..., description="ID of the dataset")):
    """Get catalog information for a dataset"""
    catalog_entry = ai_cataloger.get_dataset_catalog(dataset_id)
    if not catalog_entry:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found in catalog")
    return catalog_entry

@router.post("/catalog/{dataset_id}", response_model=Dict[str, Any])
async def catalog_dataset(
    dataset_id: str = Path(..., description="ID of the dataset"),
    file_path: str = Body(..., embed=True),
    metadata: Optional[Dict[str, Any]] = Body(None, embed=True)
):
    """Catalog a dataset using AI"""
    try:
        return ai_cataloger.catalog_dataset(
            dataset_id=dataset_id,
            file_path=file_path,
            metadata=metadata
        )
    except Exception as e:
        logger.error(f"Error cataloging dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error cataloging dataset: {str(e)}")

@router.put("/catalog/{dataset_id}", response_model=Dict[str, Any])
async def update_dataset_catalog(
    dataset_catalog_update: DatasetCatalogUpdate,
    dataset_id: str = Path(..., description="ID of the dataset")
):
    """Update catalog information for a dataset"""
    updated_entry = ai_cataloger.update_dataset_catalog(
        dataset_id=dataset_id,
        description=dataset_catalog_update.description,
        tags=dataset_catalog_update.tags,
        category=dataset_catalog_update.category
    )
    
    if not updated_entry:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found in catalog")
    
    return updated_entry

@router.delete("/catalog/{dataset_id}")
async def remove_dataset_from_catalog(dataset_id: str = Path(..., description="ID of the dataset")):
    """Remove a dataset from the catalog"""
    success = ai_cataloger.remove_dataset_from_catalog(dataset_id)
    
    if not success:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} not found in catalog")
    
    return {"message": f"Dataset {dataset_id} removed from catalog"}

@router.get("/catalog/category/{category}", response_model=List[str])
async def get_datasets_by_category(category: str = Path(..., description="Category to filter by")):
    """Get all datasets in a category"""
    return ai_cataloger.get_datasets_by_category(category)

@router.get("/catalog/tag/{tag}", response_model=List[str])
async def get_datasets_by_catalog_tag(tag: str = Path(..., description="Tag to filter by")):
    """Get all datasets with a specific tag"""
    return ai_cataloger.get_datasets_by_tag(tag)

@router.get("/catalog/search", response_model=List[Dict[str, Any]])
async def search_catalog(query: str = Query(..., description="Search query")):
    """Search for datasets in the catalog"""
    return ai_cataloger.search_datasets(query)

@router.post("/catalog/all", response_model=Dict[str, Any])
async def catalog_all_datasets():
    """Catalog all indexed datasets"""
    try:
        # Get all indexed datasets
        datasets = dataset_indexer.get_all_datasets()
        
        # Catalog all datasets
        return ai_cataloger.catalog_all_datasets(datasets)
    except Exception as e:
        logger.error(f"Error cataloging all datasets: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error cataloging all datasets: {str(e)}")

# Initialize endpoint
@router.post("/initialize", response_model=Dict[str, Any])
async def initialize_organization(
    scan_dirs: Optional[List[str]] = Body(None, embed=True),
    use_ai: bool = Body(True, embed=True)
):
    """Initialize the dataset organization system"""
    try:
        # Import the initialization function
        from initialize_dataset_organization import initialize_organization as init_org
        
        # Run initialization
        init_org(
            data_dir=data_dir,
            scan_dirs=scan_dirs,
            use_ai=use_ai
        )
        
        return {
            "message": "Dataset organization system initialized successfully",
            "buckets": len(bucket_manager.get_all_buckets()),
            "indexed_datasets": len(dataset_indexer.get_all_datasets()),
            "cataloged_datasets": len(ai_cataloger._load_catalog()["datasets"]) if use_ai else 0
        }
    except Exception as e:
        logger.error(f"Error initializing dataset organization: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error initializing dataset organization: {str(e)}") 
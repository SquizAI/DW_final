"""
Kaggle API Router

This module provides a FastAPI router for all Kaggle API endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, Body, Path, Query, UploadFile, File
from typing import List, Dict, Any, Optional
import os
import logging
import time
from datetime import datetime
import json
from pathlib import Path as FilePath
from sqlalchemy.orm import Session

# Import Kaggle API
try:
    from kaggle.api.kaggle_api_extended import KaggleApi
except ImportError:
    # For development without Kaggle API
    KaggleApi = None

# Import database dependencies
from app.database import get_db

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/kaggle",
    tags=["kaggle"],
    responses={404: {"description": "Not found"}}
)

def get_kaggle_api():
    """Initialize and authenticate Kaggle API
    
    Returns:
        KaggleApi: Authenticated Kaggle API instance
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        api = KaggleApi()
        api.authenticate()
        return api
    except Exception as e:
        logger.error(f"Failed to authenticate with Kaggle API: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to authenticate with Kaggle API: {str(e)}"
        )

# Search endpoint
@router.get("/search")
async def search_datasets(query: str = Query(..., description="Search query")):
    """Search for datasets on Kaggle
    
    Args:
        query: Search query
        
    Returns:
        List of datasets matching the query
    """
    try:
        logger.info(f"Searching Kaggle for: {query}")
        api = get_kaggle_api()
        
        # Search for datasets
        datasets = api.dataset_list(search=query)
        
        # Convert to response format
        results = []
        for dataset in datasets[:20]:  # Limit to 20 results
            try:
                # Get owner and slug from the dataset reference
                ref_parts = dataset.ref.split('/')
                owner = ref_parts[0] if len(ref_parts) > 1 else dataset.ownerRef
                slug = ref_parts[1] if len(ref_parts) > 1 else dataset.ref
                
                results.append({
                    "ref": dataset.ref,
                    "title": dataset.title,
                    "size": dataset.size,
                    "lastUpdated": str(dataset.lastUpdated),
                    "downloadCount": dataset.downloadCount,
                    "description": dataset.description if hasattr(dataset, 'description') else (dataset.subtitle if hasattr(dataset, 'subtitle') else ""),
                    "url": f"https://www.kaggle.com/datasets/{dataset.ref}"
                })
            except Exception as e:
                logger.error(f"Error processing dataset {dataset.ref}: {str(e)}")
                continue
        
        logger.info(f"Found {len(results)} datasets matching query: {query}")
        return results
    except Exception as e:
        logger.error(f"Error searching Kaggle: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error searching Kaggle: {str(e)}"
        )

# Download endpoint
@router.post("/download")
async def download_dataset(dataset_ref: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """Download a dataset from Kaggle
    
    Args:
        dataset_ref: Dataset reference in the format "owner/dataset"
        db: Database session
        
    Returns:
        Download status
    """
    try:
        logger.info(f"Downloading dataset: {dataset_ref}")
        api = get_kaggle_api()
        
        # Parse owner and dataset from the reference
        parts = dataset_ref.split('/')
        if len(parts) != 2:
            raise HTTPException(
                status_code=400,
                detail="Invalid dataset reference. Format should be 'owner/dataset'"
            )
        
        owner, dataset = parts
        
        # Create download path
        # Use the existing backend/data/kaggle directory that's already working
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        data_dir = os.path.join(backend_dir, "data")
        download_path = os.path.join(data_dir, "kaggle", owner, dataset)
        
        # Create directory if it doesn't exist
        os.makedirs(download_path, exist_ok=True)
        
        # Log the download path for debugging
        logger.info(f"Download path: {download_path}")
        
        # Download the dataset
        api.dataset_download_files(
            dataset_ref,
            path=download_path,
            unzip=True
        )
        
        # Get file information
        files = []
        total_size = 0
        for root, _, filenames in os.walk(download_path):
            for filename in filenames:
                file_path = os.path.join(root, filename)
                size = os.path.getsize(file_path)
                files.append({
                    "name": filename,
                    "path": file_path,
                    "size": size
                })
                total_size += size
        
        logger.info(f"Downloaded dataset {dataset_ref} with {len(files)} files ({total_size} bytes)")
        
        # Register the dataset in the database
        try:
            from app import schemas, crud
            
            # Create dataset metadata
            metadata = {
                "source": "kaggle",
                "kaggle_ref": dataset_ref,
                "owner": owner,
                "dataset": dataset,
                "download_time": datetime.now().isoformat(),
                "file_count": len(files),
                "total_size": total_size,
                "files": [{"name": f["name"], "size": f["size"]} for f in files]
            }
            
            # Create dataset
            dataset_create = schemas.DatasetCreate(
                name=f"Kaggle: {dataset}",
                description=f"Dataset downloaded from Kaggle: {dataset_ref}",
                file_path=download_path,
                meta_data=metadata
            )
            
            # Save to database
            db_dataset = crud.create_dataset(db, dataset_create)
            logger.info(f"Registered dataset in database with ID: {db_dataset.id}")
            
            # Return success response with database ID
            return {
                "success": True,
                "message": f"Dataset downloaded successfully to {download_path}",
                "dataset_id": db_dataset.id,
                "name": db_dataset.name,
                "file_path": download_path,
                "files": files,
                "absolute_path": os.path.abspath(download_path),
                "total_size": total_size,
                "file_count": len(files)
            }
            
        except Exception as e:
            logger.error(f"Error registering dataset in database: {str(e)}")
            # Continue with the response even if database registration fails
            return {
                "success": True,
                "message": f"Dataset downloaded successfully to {download_path}, but failed to register in database: {str(e)}",
                "dataset_id": f"kaggle_{owner}_{dataset}",
                "name": f"Kaggle: {dataset}",
                "file_path": download_path,
                "files": files,
                "absolute_path": os.path.abspath(download_path),
                "total_size": total_size,
                "file_count": len(files)
            }
    except Exception as e:
        logger.error(f"Error downloading dataset: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error downloading dataset: {str(e)}"
        )

# Download status endpoint
@router.get("/datasets/download/status/{dataset_ref:path}")
async def download_status(dataset_ref: str = Path(..., description="Dataset reference")):
    """Get download status for a dataset
    
    Args:
        dataset_ref: Dataset reference in the format "owner/dataset"
        
    Returns:
        Download status
    """
    try:
        logger.info(f"Checking download status for: {dataset_ref}")
        
        # Parse owner and dataset from the reference
        parts = dataset_ref.split('/')
        if len(parts) != 2:
            raise HTTPException(
                status_code=400,
                detail="Invalid dataset reference. Format should be 'owner/dataset'"
            )
        
        owner, dataset = parts
        
        # Get the download path
        data_dir = os.environ.get("DATA_DIR", "data")
        download_path = os.path.join(data_dir, "kaggle", owner, dataset)
        
        # Check if the dataset has been downloaded
        if not os.path.exists(download_path):
            return {
                "status": "not_found",
                "message": f"Dataset {dataset_ref} has not been downloaded yet",
                "dataset_ref": dataset_ref
            }
        
        # Get the list of files
        files = []
        total_size = 0
        
        for root, _, filenames in os.walk(download_path):
            for filename in filenames:
                file_path = os.path.join(root, filename)
                size = os.path.getsize(file_path)
                last_modified = os.path.getmtime(file_path)
                files.append({
                    "name": filename,
                    "path": file_path,
                    "size": size,
                    "last_modified": datetime.fromtimestamp(last_modified).isoformat()
                })
                total_size += size
        
        # Return the status
        return {
            "status": "completed",
            "progress": 100,
            "dataset_ref": dataset_ref,
            "files": files,
            "file_count": len(files),
            "total_size": total_size,
            "download_path": download_path,
            "absolute_path": os.path.abspath(download_path),
            "download_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error checking download status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error checking download status: {str(e)}"
        )

# All download statuses endpoint
@router.get("/datasets/download/status")
async def all_download_statuses():
    """Get all download statuses
    
    Returns:
        List of download statuses
    """
    try:
        logger.info("Getting all download statuses")
        
        # Get the base directory
        data_dir = os.environ.get("DATA_DIR", "data")
        base_dir = os.path.join(data_dir, "kaggle")
        
        # Check if the directory exists
        if not os.path.exists(base_dir):
            return []
        
        # Get all downloaded datasets
        statuses = []
        
        # Walk through the directory structure
        for owner_dir in os.listdir(base_dir):
            owner_path = os.path.join(base_dir, owner_dir)
            if os.path.isdir(owner_path):
                for dataset_dir in os.listdir(owner_path):
                    dataset_path = os.path.join(owner_path, dataset_dir)
                    if os.path.isdir(dataset_path):
                        # Get the list of files
                        files = []
                        total_size = 0
                        
                        for root, _, filenames in os.walk(dataset_path):
                            for filename in filenames:
                                file_path = os.path.join(root, filename)
                                size = os.path.getsize(file_path)
                                last_modified = os.path.getmtime(file_path)
                                files.append({
                                    "name": filename,
                                    "path": file_path,
                                    "size": size,
                                    "last_modified": datetime.fromtimestamp(last_modified).isoformat()
                                })
                                total_size += size
                        
                        # Add the status
                        statuses.append({
                            "status": "completed",
                            "progress": 100,
                            "dataset_ref": f"{owner_dir}/{dataset_dir}",
                            "files": files,
                            "file_count": len(files),
                            "total_size": total_size,
                            "download_path": dataset_path,
                            "absolute_path": os.path.abspath(dataset_path),
                            "download_time": datetime.now().isoformat()
                        })
        
        return statuses
    except Exception as e:
        logger.error(f"Error getting all download statuses: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting all download statuses: {str(e)}"
        )

# Local datasets endpoint
@router.get("/local/datasets")
async def local_datasets():
    """Get local datasets
    
    Returns:
        List of local datasets
    """
    try:
        logger.info("Getting local datasets")
        
        # Get the base directory
        data_dir = os.environ.get("DATA_DIR", "data")
        base_dir = os.path.join(data_dir, "kaggle")
        
        # Check if the directory exists
        if not os.path.exists(base_dir):
            return []
        
        # Get all downloaded datasets
        datasets = []
        
        # Walk through the directory structure
        for owner_dir in os.listdir(base_dir):
            owner_path = os.path.join(base_dir, owner_dir)
            if os.path.isdir(owner_path):
                for dataset_dir in os.listdir(owner_path):
                    dataset_path = os.path.join(owner_path, dataset_dir)
                    if os.path.isdir(dataset_path):
                        # Get the list of files
                        files = []
                        total_size = 0
                        
                        for root, _, filenames in os.walk(dataset_path):
                            for filename in filenames:
                                file_path = os.path.join(root, filename)
                                size = os.path.getsize(file_path)
                                files.append({
                                    "name": filename,
                                    "path": file_path,
                                    "size": size
                                })
                                total_size += size
                        
                        # Add the dataset
                        datasets.append({
                            "ref": f"{owner_dir}/{dataset_dir}",
                            "title": dataset_dir.replace("-", " ").title(),
                            "local_path": dataset_path,
                            "download_date": datetime.fromtimestamp(os.path.getctime(dataset_path)).isoformat(),
                            "size_bytes": total_size,
                            "file_count": len(files),
                            "files": files
                        })
        
        return datasets
    except Exception as e:
        logger.error(f"Error getting local datasets: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting local datasets: {str(e)}"
        )

# Delete local dataset endpoint
@router.delete("/local/datasets/{dataset_ref:path}")
async def delete_local_dataset(
    dataset_ref: str = Path(..., description="Dataset reference"),
    delete_files: bool = Query(False, description="Whether to delete the files")
):
    """Delete a local dataset
    
    Args:
        dataset_ref: Dataset reference in the format "owner/dataset"
        delete_files: Whether to delete the files
        
    Returns:
        Deletion status
    """
    try:
        logger.info(f"Deleting local dataset: {dataset_ref} (delete_files={delete_files})")
        
        # Parse owner and dataset from the reference
        parts = dataset_ref.split('/')
        if len(parts) != 2:
            raise HTTPException(
                status_code=400,
                detail="Invalid dataset reference. Format should be 'owner/dataset'"
            )
        
        owner, dataset = parts
        
        # Get the download path
        data_dir = os.environ.get("DATA_DIR", "data")
        dataset_path = os.path.join(data_dir, "kaggle", owner, dataset)
        
        # Check if the dataset exists
        if not os.path.exists(dataset_path):
            raise HTTPException(
                status_code=404,
                detail=f"Dataset {dataset_ref} not found"
            )
        
        # Delete the files if requested
        if delete_files:
            import shutil
            shutil.rmtree(dataset_path)
            logger.info(f"Deleted dataset files at {dataset_path}")
        
        return {
            "success": True,
            "message": f"Dataset {dataset_ref} deleted successfully",
            "dataset_ref": dataset_ref,
            "files_deleted": delete_files
        }
    except Exception as e:
        logger.error(f"Error deleting local dataset: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting local dataset: {str(e)}"
        )

# Auth status endpoint
@router.get("/auth/status")
async def auth_status():
    """Check Kaggle API authentication status
    
    Returns:
        Authentication status
    """
    try:
        logger.info("Checking Kaggle API authentication status")
        
        # Check if Kaggle credentials are set
        username = os.environ.get("KAGGLE_USERNAME")
        key = os.environ.get("KAGGLE_KEY")
        
        if not username or not key:
            return {
                "authenticated": False,
                "error": "Kaggle API credentials not found"
            }
        
        # Try to authenticate
        try:
            api = get_kaggle_api()
            return {
                "authenticated": True,
                "error": None
            }
        except Exception as e:
            return {
                "authenticated": False,
                "error": str(e)
            }
    except Exception as e:
        logger.error(f"Error checking auth status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error checking auth status: {str(e)}"
        ) 
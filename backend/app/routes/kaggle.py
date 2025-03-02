from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
import os
import logging
from kaggle.api.kaggle_api_extended import KaggleApi
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/api/kaggle",
    tags=["kaggle"],
    responses={404: {"description": "Not found"}},
)

def get_kaggle_api():
    """Initialize and authenticate Kaggle API"""
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

@router.get("/search", response_model=List[schemas.KaggleDatasetInfo])
async def search_kaggle_datasets(
    query: str = Query(..., description="Search query for Kaggle datasets"),
    limit: int = Query(10, description="Maximum number of results to return"),
    db: Session = Depends(get_db)
):
    """
    Search for datasets on Kaggle
    """
    try:
        logger.info(f"Searching Kaggle for datasets with query: {query}")
        
        # Get Kaggle API
        api = get_kaggle_api()
        
        # Search for datasets
        datasets = api.dataset_list(search=query, page_size=limit)
        
        # Convert to response format
        results = []
        for dataset in datasets:
            results.append(schemas.KaggleDatasetInfo(
                ref=f"{dataset.owner_ref}/{dataset.ref}",
                title=dataset.title,
                size=dataset.size,
                lastUpdated=dataset.lastUpdated,
                downloadCount=dataset.downloadCount,
                voteCount=dataset.voteCount,
                description=dataset.description,
                ownerName=dataset.ownerName,
                tags=dataset.tags,
                license=dataset.license_name,
                url=f"https://www.kaggle.com/datasets/{dataset.owner_ref}/{dataset.ref}"
            ))
        
        logger.info(f"Found {len(results)} datasets matching query: {query}")
        return results
    
    except Exception as e:
        logger.error(f"Error searching Kaggle datasets: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error searching Kaggle datasets: {str(e)}"
        )

@router.get("/download/{owner_dataset}")
async def download_kaggle_dataset(
    owner_dataset: str,
    db: Session = Depends(get_db)
):
    """
    Download a dataset from Kaggle
    """
    try:
        logger.info(f"Downloading Kaggle dataset: {owner_dataset}")
        
        # Get Kaggle API
        api = get_kaggle_api()
        
        # Set download path
        data_dir = os.getenv('DATA_DIR', 'data')
        download_path = os.path.join(data_dir, 'kaggle', owner_dataset.replace('/', '_'))
        
        # Create directory if it doesn't exist
        os.makedirs(download_path, exist_ok=True)
        
        # Download dataset
        api.dataset_download_files(
            owner_dataset,
            path=download_path,
            unzip=True
        )
        
        # Get list of files
        files = []
        for root, _, filenames in os.walk(download_path):
            for filename in filenames:
                if not filename.endswith('.zip'):  # Skip zip files
                    file_path = os.path.join(root, filename)
                    rel_path = os.path.relpath(file_path, download_path)
                    files.append({
                        "name": filename,
                        "path": rel_path,
                        "size": os.path.getsize(file_path)
                    })
        
        logger.info(f"Successfully downloaded dataset {owner_dataset} with {len(files)} files")
        
        return {
            "success": True,
            "message": f"Successfully downloaded dataset {owner_dataset}",
            "data": {
                "dataset_id": owner_dataset.replace('/', '_'),
                "files": files,
                "download_path": download_path
            }
        }
    
    except Exception as e:
        logger.error(f"Error downloading Kaggle dataset: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error downloading Kaggle dataset: {str(e)}"
        ) 
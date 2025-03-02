from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import pandas as pd
from pathlib import Path
import os
from app.services.kaggle_service import kaggle_service

router = APIRouter()

class Dataset(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    file_path: str
    row_count: int
    column_count: int
    created_at: str
    updated_at: str
    file_size: int

@router.get("/datasets")
async def list_datasets() -> List[Dataset]:
    """List all available datasets"""
    try:
        datasets_dir = Path("./data/datasets")
        datasets_dir.mkdir(parents=True, exist_ok=True)
        
        datasets = []
        for file_path in datasets_dir.glob("*"):
            if file_path.is_file() and file_path.suffix in ['.csv', '.parquet', '.json', '.xlsx']:
                stats = file_path.stat()
                try:
                    # Try to read the first few rows to get column count
                    if file_path.suffix == '.csv':
                        df = pd.read_csv(file_path, nrows=5)
                    elif file_path.suffix == '.parquet':
                        df = pd.read_parquet(file_path)
                    elif file_path.suffix == '.json':
                        df = pd.read_json(file_path)
                    else:  # .xlsx
                        df = pd.read_excel(file_path)
                    
                    datasets.append(Dataset(
                        id=file_path.stem,
                        name=file_path.name,
                        file_path=str(file_path),
                        row_count=len(df),
                        column_count=len(df.columns),
                        created_at=str(stats.st_ctime_ns),
                        updated_at=str(stats.st_mtime_ns),
                        file_size=stats.st_size
                    ))
                except Exception as e:
                    print(f"Error reading {file_path}: {str(e)}")
                    continue
        
        return datasets
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class KaggleSearchResult(BaseModel):
    ref: str
    title: str
    size: str
    lastUpdated: str
    downloadCount: int
    voteCount: int
    usabilityRating: float
    description: str

@router.get("/kaggle/search")
async def search_kaggle_datasets(
    query: str = Query(..., description="Search query for Kaggle datasets"),
    max_results: int = Query(10, description="Maximum number of results to return")
) -> List[KaggleSearchResult]:
    """Search for datasets on Kaggle"""
    try:
        results = await kaggle_service.search_datasets(query, max_results)
        return [KaggleSearchResult(**result) for result in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/kaggle/download/{dataset_ref:path}")
async def download_kaggle_dataset(
    dataset_ref: str,
    target_dir: Optional[str] = None
) -> Dict[str, Any]:
    """Download a dataset from Kaggle"""
    try:
        result = await kaggle_service.download_dataset(dataset_ref, target_dir)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add an endpoint to upload datasets
@router.post("/datasets/upload")
async def upload_dataset(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Upload a new dataset"""
    try:
        # Create datasets directory if it doesn't exist
        datasets_dir = Path("./data/datasets")
        datasets_dir.mkdir(parents=True, exist_ok=True)
        
        # Save the file
        file_path = datasets_dir / file.filename
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Read the file to get basic info
        if file_path.suffix == '.csv':
            df = pd.read_csv(file_path, nrows=5)
        elif file_path.suffix == '.parquet':
            df = pd.read_parquet(file_path)
        elif file_path.suffix == '.json':
            df = pd.read_json(file_path)
        else:  # .xlsx
            df = pd.read_excel(file_path)
        
        stats = file_path.stat()
        dataset = Dataset(
            id=file_path.stem,
            name=file_path.name,
            file_path=str(file_path),
            row_count=len(df),
            column_count=len(df.columns),
            created_at=str(stats.st_ctime_ns),
            updated_at=str(stats.st_mtime_ns),
            file_size=stats.st_size
        )
        
        return {
            "message": "Dataset uploaded successfully",
            "dataset": dataset.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
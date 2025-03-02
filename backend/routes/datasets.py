from fastapi import APIRouter, HTTPException, UploadFile, File, Body, Form, Depends
from typing import List, Dict, Optional, Any, Union
import pandas as pd
import numpy as np
import os
from pathlib import Path
import json
import kaggle
from kaggle.api.kaggle_api_extended import KaggleApi
from dotenv import load_dotenv
from pydantic import BaseModel, Field, HttpUrl
import logging
import shutil
import re
from datetime import datetime
from uuid import uuid4
import requests
import tempfile
from git import Repo
from sqlalchemy.orm import Session

# Import database models and dependencies
from app.database import get_db
from app import models, schemas, crud

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/datasets")

# Initialize base directories - using local paths instead of /app
current_dir = Path(os.path.dirname(os.path.abspath(__file__)))
project_root = current_dir.parent
BASE_DATA_DIR = project_root / "data"
USERS_DIR = BASE_DATA_DIR / "users"
TEMP_DIR = BASE_DATA_DIR / "temp"
SHARED_DIR = BASE_DATA_DIR / "shared"
UPLOAD_DIR = project_root / "uploads"

# Create necessary directories
for directory in [BASE_DATA_DIR, USERS_DIR, TEMP_DIR, SHARED_DIR, UPLOAD_DIR]:
    Path(directory).mkdir(parents=True, exist_ok=True)

def get_user_data_dir(user_id: str) -> Path:
    """Get or create user-specific data directory."""
    user_dir = USERS_DIR / user_id
    user_dir.mkdir(exist_ok=True)
    
    # Create subdirectories for different data types
    (user_dir / "datasets").mkdir(exist_ok=True)
    (user_dir / "models").mkdir(exist_ok=True)
    (user_dir / "visualizations").mkdir(exist_ok=True)
    
    return user_dir

def generate_safe_filename(original_name: str) -> str:
    """Generate a safe, unique filename."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid4())[:8]
    extension = Path(original_name).suffix
    safe_name = re.sub(r'[^a-zA-Z0-9.-]', '_', Path(original_name).stem)
    return f"{safe_name}_{timestamp}_{unique_id}{extension}"

class DatasetMetadata(BaseModel):
    """Metadata for a Kaggle dataset"""
    ref: str
    title: str
    size: float
    lastUpdated: str
    downloadCount: int
    description: str
    owner: str = Field(default="Unknown")
    tags: List[str] = Field(default_factory=list)
    url: str

    class Config:
        arbitrary_types_allowed = True

class DatasetUploadResponse(BaseModel):
    """Response model for dataset uploads"""
    success: bool
    filename: str
    file_path: str
    size: int
    upload_time: str
    metadata: Dict[str, Any]

class UrlUploadRequest(BaseModel):
    url: HttpUrl
    type: str
    branch: Optional[str] = "main"
    path: Optional[str] = ""

class DatasetResponse(BaseModel):
    message: str
    filename: str
    path: str
    preview: Optional[dict] = None

@router.get("/", response_model=List[schemas.Dataset])
async def get_all_datasets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all datasets"""
    return crud.get_datasets(db, skip=skip, limit=limit)

@router.get("/{dataset_id}", response_model=schemas.Dataset)
async def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Get a dataset by ID"""
    dataset = crud.get_dataset(db, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset

@router.post("/upload", response_model=schemas.Dataset)
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload a new dataset"""
    try:
        # Generate a unique ID for the dataset
        dataset_id = str(uuid4())
        
        # Create a directory for the dataset
        dataset_dir = os.path.join(UPLOAD_DIR, dataset_id)
        os.makedirs(dataset_dir, exist_ok=True)
        
        # Save the file
        file_path = os.path.join(dataset_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file metadata
        metadata = {
            "original_filename": file.filename,
            "content_type": file.content_type,
            "size_bytes": os.path.getsize(file_path)
        }
        
        # Try to extract additional metadata for CSV files
        if file.filename.endswith('.csv'):
            try:
                df = pd.read_csv(file_path, nrows=5)
                metadata["columns"] = df.columns.tolist()
                metadata["row_count_estimate"] = len(pd.read_csv(file_path, usecols=[0]))
                metadata["preview"] = df.to_dict(orient='records')
            except Exception as e:
                metadata["parse_error"] = str(e)
        
        # Create dataset in database
        dataset_create = schemas.DatasetCreate(
            name=name,
            description=description,
            file_path=file_path,
            metadata=metadata
        )
        
        db_dataset = crud.create_dataset(db, dataset_create)
        
        return db_dataset
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload dataset: {str(e)}"
        )

@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Delete a dataset"""
    # Find the dataset
    dataset = crud.get_dataset(db, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        # Remove the dataset directory
        dataset_dir = os.path.dirname(dataset.file_path)
        if os.path.exists(dataset_dir):
            shutil.rmtree(dataset_dir)
        
        # Delete from database
        success = crud.delete_dataset(db, dataset_id)
        
        if success:
            return {"message": "Dataset deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete dataset from database")
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete dataset: {str(e)}"
        )

@router.get("/search", response_model=List[schemas.Dataset])
async def search_datasets(query: str, db: Session = Depends(get_db)):
    """Search for datasets by name or description"""
    datasets = []
    
    for dataset in crud.get_datasets(db):
        if (query.lower() in dataset.name.lower() or 
            (dataset.description and query.lower() in dataset.description.lower())):
            datasets.append(dataset)
    
    return datasets

@router.get("/kaggle/search")
async def search_kaggle_datasets(query: str = ''):
    """Search Kaggle datasets"""
    try:
        if not query.strip():
            return {
                "success": True,
                "datasets": [],
                "message": "Please provide a search query"
            }
        
        logger.info(f"Starting Kaggle search for query: {query}")
        api = init_kaggle_api()
        
        try:
            datasets = api.dataset_list(search=query, sort_by='hottest')
            logger.info(f"Found {len(datasets)} datasets")
        except Exception as e:
            logger.error(f"Error during dataset search: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to search datasets: {str(e)}"
            )
        
        results = []
        for dataset in datasets[:10]:  # Limit to top 10 results
            try:
                # Debug log the available attributes
                logger.debug(f"Dataset attributes: {dir(dataset)}")
                
                # Extract ref components safely
                ref = f"{dataset.ref}"  # This is the full reference
                owner_username = ref.split('/')[0] if '/' in ref else 'Unknown'
                dataset_slug = ref.split('/')[1] if '/' in ref else ref
                
                # Convert tags to strings
                tags = [str(tag) for tag in getattr(dataset, 'tags', [])]
                
                metadata = DatasetMetadata(
                    ref=ref,
                    title=getattr(dataset, 'title', dataset_slug),
                    size=convert_size_to_mb(str(getattr(dataset, 'size', '0B'))),
                    lastUpdated=str(getattr(dataset, 'lastUpdated', '')),
                    downloadCount=getattr(dataset, 'downloadCount', 0),
                    description=getattr(dataset, 'description', ''),
                    owner=owner_username,
                    tags=tags,
                    url=f"https://www.kaggle.com/datasets/{ref}"
                )
                results.append(metadata.dict())
                logger.info(f"Successfully processed dataset: {metadata.ref}")
            except Exception as e:
                logger.error(f"Error processing dataset {getattr(dataset, 'ref', 'unknown')}: {str(e)}")
                continue
        
        if not results:
            logger.warning(f"No valid datasets found for query: {query}")
            return {
                "success": True,
                "datasets": [],
                "message": "No datasets found matching your query"
            }
        
        return {
            "success": True,
            "datasets": results,
            "total": len(results)
        }
    
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in search_kaggle_datasets: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search Kaggle datasets: {str(e)}"
        )

@router.post("/kaggle/download")
async def download_kaggle_dataset(dataset_ref: str = Body(..., embed=True)):
    """Download a dataset from Kaggle"""
    try:
        logger.info(f"Starting download for dataset: {dataset_ref}")
        api = init_kaggle_api()
        
        # Create temporary download directory
        temp_dir = TEMP_DIR
        temp_dir.mkdir(exist_ok=True)
        
        try:
            # Download the dataset
            api.dataset_download_files(
                dataset=dataset_ref,
                path=str(temp_dir),
                unzip=True,
                quiet=False
            )
            logger.info("Dataset downloaded successfully")
        except Exception as e:
            logger.error(f"Error downloading dataset: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to download dataset: {str(e)}"
            )
        
        try:
            # Find CSV files
            csv_files = list(temp_dir.glob("*.csv"))
            if not csv_files:
                raise HTTPException(
                    status_code=404,
                    detail="No CSV files found in dataset"
                )
            
            # Move the first CSV file to the data directory
            target_path = TEMP_DIR / csv_files[0].name
            shutil.move(str(csv_files[0]), str(target_path))
            logger.info(f"Dataset moved to: {target_path}")
            
            # Read the dataset to get info
            df = pd.read_csv(target_path)
            info = {
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": df.columns.tolist(),
                "memory_usage_mb": df.memory_usage(deep=True).sum() / (1024 * 1024),
                "file_size_mb": os.path.getsize(target_path) / (1024 * 1024)
            }
            
            # Clean up temp directory
            shutil.rmtree(temp_dir)
            
            return {
                "success": True,
                "message": "Dataset downloaded successfully",
                "info": info,
                "filename": target_path.name
            }
            
        except Exception as e:
            logger.error(f"Error processing downloaded dataset: {str(e)}")
            # Clean up on error
            if temp_dir.exists():
                shutil.rmtree(temp_dir)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process dataset: {str(e)}"
            )
    
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in download_kaggle_dataset: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download dataset: {str(e)}"
        )

@router.get("/active")
async def get_active_dataset():
    """Get information about the currently active dataset"""
    try:
        csv_files = list(TEMP_DIR.glob("*.csv"))
        if not csv_files:
            raise HTTPException(
                status_code=404,
                detail="No active dataset found"
            )
        
        df = pd.read_csv(csv_files[0])
        return {
            "filename": csv_files[0].name,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "memory_usage": df.memory_usage(deep=True).sum(),
            "preview": df.head().to_dict('records')
        }
    
    except Exception as e:
        logger.error(f"Error getting active dataset: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get active dataset: {str(e)}"
        )

@router.get("/datasets/active/preview")
async def get_dataset_preview():
    """Get preview of the active dataset"""
    try:
        # Check if any dataset is active
        csv_files = list(TEMP_DIR.glob("*.csv"))
        if not csv_files:
            return {
                "message": "No active dataset. Please upload or select a dataset first.",
                "columns": [],
                "data": [],
                "totalRows": 0
            }
        
        df = pd.read_csv(csv_files[0])
        
        # Calculate column statistics
        columns = []
        for col in df.columns:
            missing = df[col].isna().sum()
            unique = df[col].nunique()
            dtype = str(df[col].dtype)
            
            columns.append({
                "name": col,
                "type": "number" if pd.api.types.is_numeric_dtype(df[col]) else "string",
                "missing": int(missing),
                "unique": int(unique),
                "sample": df[col].head(3).tolist()
            })
        
        return {
            "columns": columns,
            "data": df.head(5).to_dict('records'),
            "totalRows": len(df)
        }
    except Exception as e:
        logger.error(f"Error getting dataset preview: {str(e)}")
        return {
            "message": "Error reading dataset. Please ensure the file is valid.",
            "error": str(e),
            "columns": [],
            "data": [],
            "totalRows": 0
        }

@router.get("/datasets/active/columns")
async def get_dataset_columns():
    """Get columns of the active dataset"""
    try:
        # Check if any dataset is active
        csv_files = list(TEMP_DIR.glob("*.csv"))
        if not csv_files:
            return {
                "columns": [],
                "message": "No active dataset. Please upload or select a dataset first."
            }
        
        df = pd.read_csv(csv_files[0])
        
        columns = []
        for col in df.columns:
            col_type = "numeric" if pd.api.types.is_numeric_dtype(df[col]) else \
                      "datetime" if pd.api.types.is_datetime64_dtype(df[col]) else \
                      "categorical"
            
            columns.append({
                "value": col,
                "label": col,
                "type": col_type
            })
        
        return {"columns": columns}
    except Exception as e:
        logger.error(f"Error getting columns: {str(e)}")
        return {
            "columns": [],
            "error": str(e),
            "message": "Error reading dataset columns. Please ensure the file is valid."
        }

@router.get("/datasets/active/numeric-columns")
async def get_numeric_columns():
    """Get numeric columns of the active dataset"""
    try:
        # Check if any dataset is active
        csv_files = list(TEMP_DIR.glob("*.csv"))
        if not csv_files:
            return {
                "numericColumns": [],
                "message": "No active dataset. Please upload or select a dataset first."
            }
        
        df = pd.read_csv(csv_files[0])
        
        numeric_columns = []
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                numeric_columns.append({
                    "value": col,
                    "label": col
                })
        
        return {"numericColumns": numeric_columns}
    except Exception as e:
        logger.error(f"Error getting numeric columns: {str(e)}")
        return {
            "numericColumns": [],
            "error": str(e),
            "message": "Error reading dataset columns. Please ensure the file is valid."
        }

class WrangleRequest(BaseModel):
    """Request model for data wrangling operations"""
    operation: str = Field(..., description="The operation to perform")
    columns: List[str] = Field(..., description="The columns to operate on")
    params: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional parameters for the operation"
    )
    
    class Config:
        arbitrary_types_allowed = True

@router.post("/data/wrangle")
async def wrangle_data(request: WrangleRequest):
    """Apply data wrangling operations"""
    try:
        # Get the active dataset
        csv_files = list(TEMP_DIR.glob("*.csv"))
        if not csv_files:
            raise HTTPException(status_code=404, detail="No active dataset found")
        
        # Read the dataset
        df = pd.read_csv(csv_files[0])
        
        # Apply the requested operation
        if request.operation == "remove_missing":
            df = df.dropna(subset=request.columns)
        
        elif request.operation == "fill_missing":
            method = request.params.get("method", "mean")
            for col in request.columns:
                if method == "mean":
                    df[col] = df[col].fillna(df[col].mean())
                elif method == "median":
                    df[col] = df[col].fillna(df[col].median())
                elif method == "mode":
                    df[col] = df[col].fillna(df[col].mode()[0])
                elif method == "constant":
                    df[col] = df[col].fillna(request.params.get("value", 0))
        
        elif request.operation == "normalize":
            method = request.params.get("method", "minmax")
            for col in request.columns:
                if method == "minmax":
                    df[col] = (df[col] - df[col].min()) / (df[col].max() - df[col].min())
                elif method == "zscore":
                    df[col] = (df[col] - df[col].mean()) / df[col].std()
                elif method == "robust":
                    q1 = df[col].quantile(0.25)
                    q3 = df[col].quantile(0.75)
                    iqr = q3 - q1
                    df[col] = (df[col] - q1) / iqr
        
        elif request.operation == "filter":
            condition = request.params.get("condition")
            value = request.params.get("value")
            for col in request.columns:
                if condition == "greater":
                    df = df[df[col] > float(value)]
                elif condition == "less":
                    df = df[df[col] < float(value)]
                elif condition == "equal":
                    df = df[df[col] == value]
                elif condition == "contains":
                    df = df[df[col].astype(str).str.contains(str(value), na=False)]
        
        elif request.operation == "sort":
            order = request.params.get("order", "ascending")
            na_position = request.params.get("na_position", "last")
            df = df.sort_values(
                by=request.columns,
                ascending=order == "ascending",
                na_position=na_position
            )
        
        # Save the transformed dataset
        df.to_csv(csv_files[0], index=False)
        
        return {
            "success": True,
            "message": "Data transformation applied successfully",
            "rows": len(df),
            "columns": len(df.columns)
        }
    
    except Exception as e:
        print(f"Error in data wrangling: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to apply data transformation: {str(e)}"
        )

@router.get("/data/analyze")
async def analyze_data():
    """Get detailed analysis of the dataset"""
    try:
        # Check if any dataset is active
        csv_files = list(TEMP_DIR.glob("*.csv"))
        if not csv_files:
            return {
                "message": "No active dataset. Please upload or select a dataset first.",
                "rowCount": 0,
                "columnCount": 0,
                "columns": []
            }
        
        # Read the dataset
        df = pd.read_csv(csv_files[0])
        
        # Calculate dataset statistics
        stats = {
            "rowCount": len(df),
            "columnCount": len(df.columns),
            "memoryUsage": df.memory_usage(deep=True).sum(),
            "duplicateRows": df.duplicated().sum(),
            "columns": []
        }
        
        # Calculate column statistics
        for col in df.columns:
            col_stats = {
                "name": col,
                "type": str(df[col].dtype),
                "stats": {
                    "count": len(df[col]),
                    "missing": df[col].isna().sum(),
                    "unique": df[col].nunique()
                }
            }
            
            # Add numeric statistics if applicable
            if pd.api.types.is_numeric_dtype(df[col]):
                col_stats["stats"].update({
                    "mean": float(df[col].mean()),
                    "std": float(df[col].std()),
                    "min": float(df[col].min()),
                    "max": float(df[col].max()),
                    "median": float(df[col].median()),
                    "skewness": float(df[col].skew()),
                    "kurtosis": float(df[col].kurtosis()),
                    "distribution": {
                        "bins": list(np.histogram(df[col].dropna(), bins=10)[1]),
                        "counts": list(np.histogram(df[col].dropna(), bins=10)[0])
                    }
                })
            
            # Add categorical statistics if applicable
            elif pd.api.types.is_string_dtype(df[col]) or pd.api.types.is_categorical_dtype(df[col]):
                value_counts = df[col].value_counts()
                col_stats["stats"]["categories"] = [
                    {
                        "value": str(value),
                        "count": int(count),
                        "percentage": float(count / len(df) * 100)
                    }
                    for value, count in value_counts.items()
                ]
            
            stats["columns"].append(col_stats)
        
        return stats
    
    except Exception as e:
        print(f"Error in data analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze dataset: {str(e)}"
        )

@router.get("/datasets")
async def list_all_datasets():
    """List all available datasets across all users"""
    try:
        all_datasets = []
        
        # Scan through user directories
        for user_dir in USERS_DIR.iterdir():
            if user_dir.is_dir():
                datasets_dir = user_dir / "datasets"
                if datasets_dir.exists():
                    for dataset_file in datasets_dir.glob("*.csv"):
                        dataset_info = {
                            "name": dataset_file.stem,
                            "filename": dataset_file.name,
                            "size": dataset_file.stat().st_size,
                            "created": datetime.fromtimestamp(dataset_file.stat().st_ctime).isoformat(),
                            "modified": datetime.fromtimestamp(dataset_file.stat().st_mtime).isoformat(),
                            "user_id": user_dir.name
                        }
                        all_datasets.append(dataset_info)
        
        return all_datasets
    except Exception as e:
        logger.error(f"Error listing datasets: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list datasets: {str(e)}"
        )

@router.get("/project")
async def get_project_info():
    """Get project information including datasets, workflows, and analytics"""
    try:
        # Get total dataset count
        dataset_count = 0
        total_size = 0
        latest_update = None
        
        for user_dir in USERS_DIR.iterdir():
            if user_dir.is_dir():
                datasets_dir = user_dir / "datasets"
                if datasets_dir.exists():
                    for dataset_file in datasets_dir.glob("*.csv"):
                        dataset_count += 1
                        total_size += dataset_file.stat().st_size
                        modified_time = datetime.fromtimestamp(dataset_file.stat().st_mtime)
                        if latest_update is None or modified_time > latest_update:
                            latest_update = modified_time
        
        return {
            "name": "Data Whisperer Project",
            "createdAt": datetime.now().isoformat(),  # You might want to store this in a config file
            "updatedAt": latest_update.isoformat() if latest_update else None,
            "datasets": {
                "count": dataset_count,
                "totalSize": total_size,
                "lastUpdate": latest_update.isoformat() if latest_update else None
            },
            "workflows": {
                "active": 0,  # You can implement workflow tracking later
                "completed": 0
            },
            "completedSteps": 0,  # You can implement step tracking later
            "nextAction": "Upload or select a dataset to begin"
        }
    except Exception as e:
        logger.error(f"Error getting project info: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get project info: {str(e)}"
        )

@router.get("/preview")
async def get_dataset_preview(dataset_ref: str) -> Dict:
    """Get a preview of a dataset."""
    try:
        # For now, return mock data
        # In production, this would load and analyze the actual dataset
        return {
            "name": dataset_ref.split('/')[-1],
            "size": 1024,
            "type": "csv",
            "rowCount": 1000,
            "columns": ["id", "name", "value", "date"],
            "sample": [
                {"id": 1, "name": "Sample 1", "value": 100, "date": "2024-01-01"},
                {"id": 2, "name": "Sample 2", "value": 200, "date": "2024-01-02"},
                {"id": 3, "name": "Sample 3", "value": 300, "date": "2024-01-03"},
            ],
            "stats": {
                "totalRows": 1000,
                "totalColumns": 4,
                "numericColumns": 2,
                "categoricalColumns": 2,
                "missingValues": {},
                "memoryUsage": 1.2
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get dataset preview: {str(e)}"
        )

def get_file_preview(file_path: Path) -> Optional[dict]:
    """Generate a preview of the dataset file"""
    try:
        if file_path.suffix == '.csv':
            df = pd.read_csv(file_path, nrows=5)
        elif file_path.suffix == '.json':
            df = pd.read_json(file_path)
        elif file_path.suffix in ['.xlsx', '.xls']:
            df = pd.read_excel(file_path)
        elif file_path.suffix == '.parquet':
            df = pd.read_parquet(file_path)
        else:
            return None

        return {
            "columns": df.columns.tolist(),
            "rowCount": len(df),
            "sampleData": df.head().to_dict('records')
        }
    except Exception as e:
        logger.error(f"Error generating preview for {file_path}: {e}")
        return None

@router.post("/url", response_model=DatasetResponse)
async def import_from_url(request: UrlUploadRequest):
    """Import dataset from a direct URL"""
    try:
        logger.info(f"Starting URL import from: {request.url}")
        
        # Create a temporary directory for download
        with tempfile.TemporaryDirectory() as temp_dir:
            # Download the file
            response = requests.get(str(request.url), stream=True)
            response.raise_for_status()
            
            # Get filename from URL or headers
            filename = request.url.path.split('/')[-1]
            if not filename:
                content_disp = response.headers.get('content-disposition')
                if content_disp and 'filename=' in content_disp:
                    filename = content_disp.split('filename=')[1].strip('"')
                else:
                    filename = 'dataset.csv'  # Default filename
            
            file_path = Path(temp_dir) / filename
            
            # Save the file
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Move to final location
            final_path = Path(UPLOAD_DIR) / filename
            shutil.move(str(file_path), str(final_path))
            
            # Generate preview
            preview = get_file_preview(final_path)
            
            logger.info(f"Successfully imported file from URL: {filename}")
            
            return DatasetResponse(
                message="Dataset imported successfully",
                filename=filename,
                path=str(final_path),
                preview=preview
            )
            
    except requests.RequestException as e:
        logger.error(f"Failed to download file: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to download file: {str(e)}")
    except Exception as e:
        logger.error(f"Error importing dataset: {e}")
        raise HTTPException(status_code=500, detail=f"Error importing dataset: {str(e)}")

@router.post("/github", response_model=List[DatasetResponse])
async def import_from_github(request: UrlUploadRequest):
    """Import dataset from a GitHub repository"""
    try:
        logger.info(f"Starting GitHub import from: {request.url}")
        
        # Extract owner and repo from GitHub URL
        parts = request.url.path.strip('/').split('/')
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub repository URL")
        
        owner, repo = parts[0], parts[1]
        clone_url = f"https://github.com/{owner}/{repo}.git"
        
        # Create a temporary directory for cloning
        with tempfile.TemporaryDirectory() as temp_dir:
            # Clone the repository
            repo_path = Path(temp_dir) / repo
            logger.info(f"Cloning repository: {clone_url}")
            Repo.clone_from(clone_url, repo_path, branch=request.branch)
            
            # Get the file or directory path
            source_path = repo_path
            if request.path:
                source_path = repo_path / request.path
            
            if not source_path.exists():
                raise HTTPException(status_code=404, detail=f"Path {request.path} not found in repository")
            
            results = []
            
            # Handle single file or directory
            if source_path.is_file():
                # Move single file
                filename = source_path.name
                final_path = Path(UPLOAD_DIR) / filename
                shutil.copy2(str(source_path), str(final_path))
                
                # Generate preview
                preview = get_file_preview(final_path)
                
                results.append(DatasetResponse(
                    message="File imported successfully",
                    filename=filename,
                    path=str(final_path),
                    preview=preview
                ))
            else:
                # Copy all supported files from directory
                for ext in ['.csv', '.json', '.xlsx', '.xls', '.parquet']:
                    for file in source_path.glob(f'**/*{ext}'):
                        rel_path = file.relative_to(repo_path)
                        final_path = Path(UPLOAD_DIR) / rel_path.name
                        shutil.copy2(str(file), str(final_path))
                        
                        # Generate preview
                        preview = get_file_preview(final_path)
                        
                        results.append(DatasetResponse(
                            message="File imported successfully",
                            filename=rel_path.name,
                            path=str(final_path),
                            preview=preview
                        ))
            
            logger.info(f"Successfully imported {len(results)} files from GitHub")
            return results
            
    except Exception as e:
        logger.error(f"Error importing from GitHub: {e}")
        raise HTTPException(status_code=500, detail=f"Error importing from GitHub: {str(e)}")

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file directly"""
    try:
        logger.info(f"Starting file upload: {file.filename}")
        
        # Save the file
        file_path = Path(UPLOAD_DIR) / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Generate preview
        preview = get_file_preview(file_path)
        
        logger.info(f"Successfully uploaded file: {file.filename}")
        
        return DatasetResponse(
            message="File uploaded successfully",
            filename=file.filename,
            path=str(file_path),
            preview=preview
        )
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

def init_kaggle_api() -> KaggleApi:
    """Initialize and authenticate Kaggle API"""
    try:
        # Check if Kaggle credentials are set
        username = os.getenv('KAGGLE_USERNAME')
        key = os.getenv('KAGGLE_KEY')
        
        if not username or not key:
            raise HTTPException(
                status_code=500,
                detail="Kaggle API credentials not found. Please set KAGGLE_USERNAME and KAGGLE_KEY environment variables."
            )
        
        # Set Kaggle credentials in environment
        os.environ['KAGGLE_USERNAME'] = username
        os.environ['KAGGLE_KEY'] = key
        
        api = KaggleApi()
        api.authenticate()
        return api
    except Exception as e:
        logger.error(f"Kaggle API Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize Kaggle API: {str(e)}"
        )

def convert_size_to_mb(size_str: str) -> float:
    """Convert size string (e.g., '262MB', '66KB', '2GB') to MB."""
    try:
        # Remove any whitespace and convert to uppercase for consistency
        size_str = size_str.strip().upper()
        
        # Extract the numeric value and unit
        match = re.match(r'([\d.]+)\s*([KMGT]?B)', size_str)
        if not match:
            return 0.0
            
        value = float(match.group(1))
        unit = match.group(2)
        
        # Convert to MB based on unit
        if unit == 'KB':
            return value / 1024
        elif unit == 'MB':
            return value
        elif unit == 'GB':
            return value * 1024
        elif unit == 'TB':
            return value * 1024 * 1024
        else:  # Assume bytes if just 'B'
            return value / (1024 * 1024)
    except Exception as e:
        logger.error(f"Error converting size {size_str}: {str(e)}")
        return 0.0 
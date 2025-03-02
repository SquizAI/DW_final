from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Query, Path
from typing import List, Dict, Optional, Any, Union
import pandas as pd
import os
from pathlib import Path as FilePath
import json
import shutil
import re
from datetime import datetime
from uuid import uuid4
import logging
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

# Import database models and dependencies
from app.database import get_db
from app import models, schemas, crud

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/data-management")

# Initialize base directories - using local paths instead of /app
current_dir = FilePath(os.path.dirname(os.path.abspath(__file__)))
project_root = current_dir.parent
BASE_DATA_DIR = project_root / "data"
USERS_DIR = BASE_DATA_DIR / "users"
TEMP_DIR = BASE_DATA_DIR / "temp"
SHARED_DIR = BASE_DATA_DIR / "shared"
UPLOAD_DIR = project_root / "uploads"

# Create necessary directories
for directory in [BASE_DATA_DIR, USERS_DIR, TEMP_DIR, SHARED_DIR, UPLOAD_DIR]:
    FilePath(directory).mkdir(parents=True, exist_ok=True)

# Pydantic models
class FolderCreate(BaseModel):
    name: str
    path: str = "/"

class FolderResponse(BaseModel):
    id: str
    name: str
    path: str
    created_at: str
    parent_id: Optional[str] = None

class FoldersResponse(BaseModel):
    success: bool = True
    message: str = "Folders retrieved successfully"
    data: List[FolderResponse]

class DatasetPreview(BaseModel):
    columns: List[str]
    rowCount: int
    sampleData: List[Dict[str, Any]]

class DatasetPreviewResponse(BaseModel):
    success: bool = True
    message: str = "Dataset preview retrieved successfully"
    data: DatasetPreview

# Helper functions
def get_user_data_dir(user_id: str = "default") -> FilePath:
    """Get or create user-specific data directory."""
    user_dir = USERS_DIR / user_id
    user_dir.mkdir(exist_ok=True)
    
    # Create subdirectories for different data types
    (user_dir / "datasets").mkdir(exist_ok=True)
    (user_dir / "folders").mkdir(exist_ok=True)
    
    return user_dir

def generate_safe_filename(original_name: str) -> str:
    """Generate a safe, unique filename."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid4())[:8]
    extension = FilePath(original_name).suffix
    safe_name = re.sub(r'[^a-zA-Z0-9.-]', '_', FilePath(original_name).stem)
    return f"{safe_name}_{timestamp}_{unique_id}{extension}"

def get_file_preview(file_path: str, max_rows: int = 10) -> DatasetPreview:
    """Generate a preview of the dataset file."""
    extension = FilePath(file_path).suffix.lower()
    
    try:
        if extension == '.csv':
            df = pd.read_csv(file_path, nrows=max_rows)
        elif extension in ['.xls', '.xlsx']:
            df = pd.read_excel(file_path, nrows=max_rows)
        elif extension == '.json':
            with open(file_path, 'r') as f:
                data = json.load(f)
            if isinstance(data, list):
                df = pd.DataFrame(data[:max_rows])
            else:
                df = pd.DataFrame([data])
        else:
            raise ValueError(f"Unsupported file format: {extension}")
        
        # Get total row count
        if extension == '.csv':
            row_count = sum(1 for _ in open(file_path, 'r')) - 1  # Subtract header
        elif extension in ['.xls', '.xlsx']:
            xl = pd.ExcelFile(file_path)
            row_count = len(pd.read_excel(xl, sheet_name=0))
        elif extension == '.json':
            with open(file_path, 'r') as f:
                data = json.load(f)
            row_count = len(data) if isinstance(data, list) else 1
        
        # Convert to dict for JSON serialization
        sample_data = df.fillna('').to_dict(orient='records')
        columns = df.columns.tolist()
        
        return DatasetPreview(
            columns=columns,
            rowCount=row_count,
            sampleData=sample_data
        )
    except Exception as e:
        logger.error(f"Error generating file preview: {str(e)}")
        return DatasetPreview(
            columns=["Error"],
            rowCount=0,
            sampleData=[{"Error": f"Failed to preview file: {str(e)}"}]
        )

# Endpoints
@router.get("/folders", response_model=FoldersResponse)
async def list_folders(
    path: str = "/",
    user_id: str = "default",
    db: Session = Depends(get_db)
):
    """List folders in the specified path."""
    try:
        # In a real application, you would query the database for folders
        # For now, we'll simulate folder structure
        user_dir = get_user_data_dir(user_id)
        folders_dir = user_dir / "folders"
        
        # Create a list of folders
        folders = []
        for i in range(1, 6):  # Simulate 5 folders
            folder_id = f"folder_{i}"
            folder_name = f"Folder {i}"
            folder_path = f"{path}{folder_name}/"
            folders.append(FolderResponse(
                id=folder_id,
                name=folder_name,
                path=folder_path,
                created_at=datetime.now().isoformat(),
                parent_id=None if path == "/" else "parent_folder"
            ))
        
        return FoldersResponse(data=folders)
    except Exception as e:
        logger.error(f"Error listing folders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list folders: {str(e)}")

@router.post("/folders", response_model=schemas.ResponseBase)
async def create_folder(
    folder: FolderCreate,
    user_id: str = "default",
    db: Session = Depends(get_db)
):
    """Create a new folder."""
    try:
        # In a real application, you would create a folder in the database
        # For now, we'll just return success
        return schemas.ResponseBase(
            success=True,
            message=f"Folder '{folder.name}' created successfully"
        )
    except Exception as e:
        logger.error(f"Error creating folder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create folder: {str(e)}")

@router.get("/datasets/{dataset_id}/preview", response_model=DatasetPreviewResponse)
async def get_dataset_preview(
    dataset_id: str = Path(..., description="The ID of the dataset to preview"),
    max_rows: int = Query(10, description="Maximum number of rows to preview"),
    db: Session = Depends(get_db)
):
    """Get a preview of the dataset."""
    try:
        # Get the dataset from the database
        dataset = crud.get_dataset(db, dataset_id)
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Generate preview
        preview = get_file_preview(dataset.file_path, max_rows)
        
        return DatasetPreviewResponse(data=preview)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dataset preview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get dataset preview: {str(e)}")

@router.post("/upload", response_model=schemas.DatasetResponse)
async def upload_file(
    file: UploadFile = File(...),
    path: str = Form("/"),
    user_id: str = "default",
    db: Session = Depends(get_db)
):
    """Upload a new dataset file."""
    try:
        # Generate a safe filename
        safe_filename = generate_safe_filename(file.filename)
        
        # Save the file
        user_dir = get_user_data_dir(user_id)
        datasets_dir = user_dir / "datasets"
        file_path = datasets_dir / safe_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create dataset in database
        dataset_data = schemas.DatasetCreate(
            name=FilePath(file.filename).stem,
            description=f"Uploaded on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            file_path=str(file_path)
        )
        
        dataset = crud.create_dataset(db, dataset_data)
        
        return schemas.DatasetResponse(
            success=True,
            message="File uploaded successfully",
            data=dataset
        )
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.post("/url", response_model=schemas.DatasetResponse)
async def import_from_url(
    url_data: Dict[str, Any],
    user_id: str = "default",
    db: Session = Depends(get_db)
):
    """Import a dataset from a URL."""
    try:
        # In a real application, you would download the file from the URL
        # For now, we'll just return success
        return schemas.DatasetResponse(
            success=True,
            message="Dataset imported successfully from URL",
            data=schemas.Dataset(
                id=str(uuid4()),
                name="URL Import",
                description="Imported from URL",
                file_path="/path/to/file.csv",
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        )
    except Exception as e:
        logger.error(f"Error importing from URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to import from URL: {str(e)}") 
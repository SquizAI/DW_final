from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime
import json
import logging
import sys
from pathlib import Path
import os
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from .data_loader import data_loader
from .routes import datasets_router, workflows_router
from .database import get_db, engine, Base
from . import models, crud, schemas, init_db
from .kaggle import kaggle_router  # Import the Kaggle router
from .agentic_topology import agentic_router  # Import the Agentic Topology router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Data Whisperer API",
    description="API for data wrangling, analysis, and intelligent workflow orchestration",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for downloads
app.mount("/downloads", StaticFiles(directory="exports"), name="downloads")

# Error handling middleware
@app.middleware("http")
async def error_handling_middleware(request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Unhandled error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error. Please check the logs for more details."
        )

# Initialize database with sample data on startup
@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    try:
        init_db.init_db(db)
    finally:
        db.close()

# Include routers
app.include_router(datasets_router, prefix="/api")
app.include_router(workflows_router, prefix="/api")
app.include_router(kaggle_router, prefix="/api")  # Include the Kaggle router
app.include_router(agentic_router, prefix="/api")  # Include the Agentic Topology router

# Dataset endpoints
@app.get("/api/datasets", response_model=schemas.DatasetsResponse)
def get_all_datasets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    datasets = crud.get_datasets(db, skip=skip, limit=limit)
    return {
        "success": True,
        "message": "Datasets retrieved successfully",
        "data": datasets
    }

@app.get("/api/datasets/{dataset_id}", response_model=schemas.DatasetResponse)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    dataset = crud.get_dataset(db, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {
        "success": True,
        "message": "Dataset retrieved successfully",
        "data": dataset
    }

@app.post("/api/datasets", response_model=schemas.DatasetResponse)
def create_dataset(dataset: schemas.DatasetCreate, db: Session = Depends(get_db)):
    db_dataset = crud.create_dataset(db, dataset)
    return {
        "success": True,
        "message": "Dataset created successfully",
        "data": db_dataset
    }

@app.put("/api/datasets/{dataset_id}", response_model=schemas.DatasetResponse)
def update_dataset(dataset_id: str, dataset: schemas.DatasetUpdate, db: Session = Depends(get_db)):
    db_dataset = crud.update_dataset(db, dataset_id, dataset)
    if not db_dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {
        "success": True,
        "message": "Dataset updated successfully",
        "data": db_dataset
    }

@app.delete("/api/datasets/{dataset_id}")
def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    success = crud.delete_dataset(db, dataset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {
        "success": True,
        "message": "Dataset deleted successfully"
    }

# Workflow endpoints
@app.get("/api/workflows", response_model=schemas.WorkflowsResponse)
def get_all_workflows(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    workflows = crud.get_workflows(db, skip=skip, limit=limit)
    return {
        "success": True,
        "message": "Workflows retrieved successfully",
        "data": workflows
    }

@app.get("/api/workflows/{workflow_id}", response_model=schemas.WorkflowResponse)
def get_workflow(workflow_id: str, db: Session = Depends(get_db)):
    workflow = crud.get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {
        "success": True,
        "message": "Workflow retrieved successfully",
        "data": workflow
    }

@app.post("/api/workflows", response_model=schemas.WorkflowResponse)
def create_workflow(workflow: schemas.WorkflowCreate, db: Session = Depends(get_db)):
    db_workflow = crud.create_workflow(db, workflow)
    return {
        "success": True,
        "message": "Workflow created successfully",
        "data": db_workflow
    }

@app.put("/api/workflows/{workflow_id}", response_model=schemas.WorkflowResponse)
def update_workflow(workflow_id: str, workflow: schemas.WorkflowUpdate, db: Session = Depends(get_db)):
    db_workflow = crud.update_workflow(db, workflow_id, workflow)
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {
        "success": True,
        "message": "Workflow updated successfully",
        "data": db_workflow
    }

@app.delete("/api/workflows/{workflow_id}")
def delete_workflow(workflow_id: str, db: Session = Depends(get_db)):
    success = crud.delete_workflow(db, workflow_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {
        "success": True,
        "message": "Workflow deleted successfully"
    }

# Health check endpoint
@app.get("/api/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify API status"""
    try:
        # Check if data directory exists and is writable
        data_dir = os.getenv('DATA_DIR', 'data')
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        
        # Check if database is accessible
        db_status = "healthy"
        try:
            # Try to execute a simple query
            db.execute("SELECT 1")
        except Exception as e:
            db_status = f"error: {str(e)}"
        
        # Check if Kaggle credentials are configured
        kaggle_username = os.getenv('KAGGLE_USERNAME')
        kaggle_key = os.getenv('KAGGLE_KEY')
        
        # Check if data directory is writable
        test_file = os.path.join(data_dir, '.test')
        try:
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)
            is_writable = True
        except:
            is_writable = False
        
        return {
            "status": "healthy",
            "version": "1.0.0",
            "database": db_status,
            "data_dir": {
                "exists": os.path.exists(data_dir),
                "writable": is_writable
            },
            "kaggle_configured": bool(kaggle_username and kaggle_key)
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Health check failed: {str(e)}"
        )

# In-memory storage for workflows and data
workflows = {}
node_data = {}

class Node(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]

class Edge(BaseModel):
    id: str
    source: str
    target: str

class Workflow(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class TransformConfig(BaseModel):
    type: str
    params: Dict[str, Any]

class ExportConfig(BaseModel):
    format: str
    options: Optional[Dict[str, Any]] = None

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Save the uploaded file
        file_path = await data_loader.save_uploaded_file(file, file.filename)
        
        # Load the data
        data = data_loader.load_data(file_path)
        
        # Get data info
        info = data_loader.get_data_info(data)
        
        # Validate the data
        validation = data_loader.validate_data(data)
        
        # Create a new node for this data
        node_id = f"data_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        node_data[node_id] = data
        
        return {
            "node_id": node_id,
            "info": info,
            "validation": validation
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/workflow/{workflow_id}")
async def get_workflow(workflow_id: str):
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflows[workflow_id]

@app.put("/api/workflow/{workflow_id}")
async def save_workflow(workflow_id: str, workflow: Workflow):
    workflows[workflow_id] = workflow.dict()
    return {"status": "success"}

@app.get("/api/workflow/preview/{node_id}")
async def get_data_preview(node_id: str):
    if node_id not in node_data:
        raise HTTPException(status_code=404, detail="Node data not found")
    
    return data_loader.get_data_info(node_data[node_id])

@app.post("/api/workflow/transform/{node_id}")
async def apply_transformation(node_id: str, config: TransformConfig):
    if node_id not in node_data:
        raise HTTPException(status_code=404, detail="Node data not found")
    
    df = pd.DataFrame(node_data[node_id])
    
    try:
        if config.type == "filter":
            df = df.query(config.params["condition"])
        elif config.type == "select":
            df = df[config.params["columns"]]
        elif config.type == "rename":
            df = df.rename(columns=config.params["mapping"])
        elif config.type == "sort":
            df = df.sort_values(
                by=config.params["columns"],
                ascending=config.params.get("ascending", True)
            )
        elif config.type == "aggregate":
            df = df.groupby(config.params["by"]).agg(config.params["aggregations"]).reset_index()
        elif config.type == "fillna":
            df = df.fillna(config.params["value"])
        elif config.type == "dropna":
            df = df.dropna(subset=config.params.get("columns", None))
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported transformation type: {config.type}")
        
        # Store transformed data
        new_node_id = f"{node_id}_transformed_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        node_data[new_node_id] = df.to_dict('records')
        
        return {
            "node_id": new_node_id,
            "info": data_loader.get_data_info(node_data[new_node_id])
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/workflow/quality/{node_id}")
async def run_quality_checks(node_id: str):
    if node_id not in node_data:
        raise HTTPException(status_code=404, detail="Node data not found")
    
    return data_loader.validate_data(node_data[node_id])

@app.post("/api/workflow/export/{node_id}")
async def export_data(node_id: str, config: ExportConfig):
    if node_id not in node_data:
        raise HTTPException(status_code=404, detail="Node data not found")
    
    df = pd.DataFrame(node_data[node_id])
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"export_{node_id}_{timestamp}"
    
    try:
        if config.format == "csv":
            output_path = f"exports/{filename}.csv"
            df.to_csv(output_path, index=False, **(config.options or {}))
        elif config.format == "json":
            output_path = f"exports/{filename}.json"
            df.to_json(output_path, orient="records", **(config.options or {}))
        elif config.format == "parquet":
            output_path = f"exports/{filename}.parquet"
            df.to_parquet(output_path, index=False, **(config.options or {}))
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported export format: {config.format}")
        
        return {"downloadUrl": f"/downloads/{output_path}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/workflow/suggestions/{node_id}")
async def get_node_suggestions(node_id: str):
    if node_id not in node_data:
        raise HTTPException(status_code=404, detail="Node data not found")
    
    df = pd.DataFrame(node_data[node_id])
    suggestions = []
    
    # Suggest handling missing values
    missing = df.isnull().sum()
    for col, count in missing.items():
        if count > 0:
            suggestions.append({
                "id": f"fillna_{col}",
                "title": f"Fill missing values in {col}",
                "description": f"Replace {count} missing values with the column mean/mode",
                "config": {
                    "type": "fillna",
                    "params": {
                        "columns": [col],
                        "value": df[col].mean() if df[col].dtype.kind in 'iuf' else df[col].mode()[0]
                    }
                }
            })
    
    # Suggest removing duplicate rows
    duplicates = df.duplicated().sum()
    if duplicates > 0:
        suggestions.append({
            "id": "remove_duplicates",
            "title": "Remove duplicate rows",
            "description": f"Found {duplicates} duplicate rows that can be removed",
            "config": {
                "type": "drop_duplicates",
                "params": {}
            }
        })
    
    # Suggest sorting for numeric columns
    for col in df.select_dtypes(include=[np.number]).columns:
        suggestions.append({
            "id": f"sort_{col}",
            "title": f"Sort by {col}",
            "description": f"Sort the dataset based on {col} values",
            "config": {
                "type": "sort",
                "params": {
                    "columns": [col],
                    "ascending": False
                }
            }
        })
    
    return {"suggestions": suggestions}

@app.get("/api/workflow/analyze/{node_id}")
async def analyze_data(node_id: str):
    if node_id not in node_data:
        raise HTTPException(status_code=404, detail="Node data not found")
    
    df = pd.DataFrame(node_data[node_id])
    insights = []
    
    # Basic statistics
    for col in df.select_dtypes(include=[np.number]).columns:
        insights.append({
            "type": "statistics",
            "description": f"Statistical summary for {col}",
            "confidence": 1.0,
            "metadata": {
                "mean": float(df[col].mean()),
                "median": float(df[col].median()),
                "std": float(df[col].std()),
                "min": float(df[col].min()),
                "max": float(df[col].max())
            }
        })
    
    # Distribution analysis
    for col in df.select_dtypes(include=[np.number]).columns:
        skewness = float(df[col].skew())
        insights.append({
            "type": "distribution",
            "description": f"Distribution analysis for {col}",
            "confidence": 0.9,
            "metadata": {
                "skewness": skewness,
                "is_normal": abs(skewness) < 0.5,
                "unique_values": int(df[col].nunique())
            }
        })
    
    # Correlation analysis
    if len(df.select_dtypes(include=[np.number]).columns) > 1:
        corr = df.corr()
        high_corr = []
        for i in range(len(corr.columns)):
            for j in range(i+1, len(corr.columns)):
                if abs(corr.iloc[i,j]) > 0.7:
                    high_corr.append({
                        "col1": corr.columns[i],
                        "col2": corr.columns[j],
                        "correlation": float(corr.iloc[i,j])
                    })
        
        if high_corr:
            insights.append({
                "type": "correlation",
                "description": "Found strong correlations between variables",
                "confidence": 0.85,
                "metadata": {
                    "correlations": high_corr
                }
            })
    
    return {"insights": insights}

# Clean up old files periodically
@app.on_event("startup")
async def startup_event():
    data_loader.clean_old_files()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
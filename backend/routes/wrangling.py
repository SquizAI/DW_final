from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Optional, Any
import pandas as pd
import numpy as np
from pathlib import Path
import os
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize data directory - using local paths instead of /app
current_dir = Path(os.path.dirname(os.path.abspath(__file__)))
project_root = current_dir.parent
DATA_DIR = project_root / "data"
DATA_DIR.mkdir(exist_ok=True)

class ColumnTransformRequest(BaseModel):
    """Request model for column transformation"""
    column: str = Field(..., description="The column to transform")
    operation: str = Field(..., description="The operation to perform")
    params: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional parameters for the operation"
    )

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

@router.post("/transform")
async def wrangle_data(request: WrangleRequest):
    """Apply data wrangling operations"""
    try:
        logger.info(f"Starting data transformation: {request.operation}")
        
        # Get the active dataset
        csv_files = list(DATA_DIR.glob("*.csv"))
        if not csv_files:
            raise HTTPException(status_code=404, detail="No active dataset found")
        
        # Read the dataset
        df = pd.read_csv(csv_files[0])
        original_df = df.copy()  # Keep a copy for error handling
        
        try:
            # Validate columns exist
            missing_cols = [col for col in request.columns if col not in df.columns]
            if missing_cols:
                raise ValueError(f"Columns not found: {', '.join(missing_cols)}")
            
            # Apply the requested operation
            if request.operation == "remove_missing":
                df = df.dropna(subset=request.columns)
            
            elif request.operation == "fill_missing":
                method = request.params.get("method", "mean")
                for col in request.columns:
                    if method == "mean" and pd.api.types.is_numeric_dtype(df[col]):
                        df[col] = df[col].fillna(df[col].mean())
                    elif method == "median" and pd.api.types.is_numeric_dtype(df[col]):
                        df[col] = df[col].fillna(df[col].median())
                    elif method == "mode":
                        df[col] = df[col].fillna(df[col].mode()[0])
                    elif method == "constant":
                        df[col] = df[col].fillna(request.params.get("value", 0))
            
            elif request.operation == "normalize":
                method = request.params.get("method", "minmax")
                for col in request.columns:
                    if not pd.api.types.is_numeric_dtype(df[col]):
                        raise ValueError(f"Column {col} must be numeric for normalization")
                    
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
                if not condition or value is None:
                    raise ValueError("Both condition and value are required for filtering")
                
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
            
            elif request.operation == "round":
                decimals = request.params.get("decimals", 2)
                for col in request.columns:
                    if pd.api.types.is_numeric_dtype(df[col]):
                        df[col] = df[col].round(decimals)
            
            elif request.operation == "replace":
                old_value = request.params.get("old_value")
                new_value = request.params.get("new_value")
                if old_value is None or new_value is None:
                    raise ValueError("Both old_value and new_value are required for replacement")
                
                for col in request.columns:
                    df[col] = df[col].replace(old_value, new_value)
            
            elif request.operation == "rename":
                new_names = request.params.get("new_names", {})
                if not new_names:
                    raise ValueError("new_names dictionary is required for renaming")
                df = df.rename(columns=new_names)
            
            else:
                raise ValueError(f"Unknown operation: {request.operation}")
            
            # Validate the transformed dataset
            if len(df) == 0:
                raise ValueError("Operation resulted in empty dataset")
            
            # Save the transformed dataset
            df.to_csv(csv_files[0], index=False)
            
            return {
                "success": True,
                "message": "Data transformation applied successfully",
                "rows": len(df),
                "columns": len(df.columns),
                "preview": df.head().to_dict('records')
            }
        
        except Exception as e:
            # Restore the original dataset if something went wrong
            original_df.to_csv(csv_files[0], index=False)
            raise e
    
    except Exception as e:
        logger.error(f"Error in data wrangling: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to apply data transformation: {str(e)}"
        )

@router.post("/transform/column")
async def transform_column(request: ColumnTransformRequest = Body(...)):
    """Apply transformation to a specific column"""
    try:
        logger.info(f"Starting column transformation: {request.operation} on {request.column}")
        
        csv_files = list(DATA_DIR.glob("*.csv"))
        if not csv_files:
            raise HTTPException(status_code=404, detail="No active dataset found")
        
        df = pd.read_csv(csv_files[0])
        if request.column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{request.column}' not found")
        
        # Keep original for error handling
        original_df = df.copy()
        
        try:
            # Apply transformation
            if request.operation == "to_datetime":
                df[request.column] = pd.to_datetime(
                    df[request.column],
                    format=request.params.get("format"),
                    errors='coerce'
                )
            elif request.operation == "to_numeric":
                df[request.column] = pd.to_numeric(df[request.column], errors='coerce')
            elif request.operation == "to_string":
                df[request.column] = df[request.column].astype(str)
            elif request.operation == "extract":
                pattern = request.params.get("pattern")
                if not pattern:
                    raise ValueError("Pattern is required for extract operation")
                df[request.column] = df[request.column].str.extract(pattern, expand=False)
            else:
                raise ValueError(f"Unknown operation: {request.operation}")
            
            # Save the transformed dataset
            df.to_csv(csv_files[0], index=False)
            
            return {
                "success": True,
                "message": f"Column '{request.column}' transformed successfully",
                "preview": df[request.column].head().tolist()
            }
        
        except Exception as e:
            # Restore original data if transformation failed
            original_df.to_csv(csv_files[0], index=False)
            raise e
    
    except Exception as e:
        logger.error(f"Error in column transformation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to transform column: {str(e)}"
        ) 
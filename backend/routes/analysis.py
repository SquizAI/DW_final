from fastapi import APIRouter, HTTPException
from typing import List, Dict
import pandas as pd
import numpy as np
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()

# Initialize data directory - using local paths instead of /app
current_dir = Path(os.path.dirname(os.path.abspath(__file__)))
project_root = current_dir.parent
DATA_DIR = project_root / "data"
DATA_DIR.mkdir(exist_ok=True)

@router.get("/data/analyze")
async def analyze_data():
    """Get detailed analysis of the dataset"""
    try:
        # Get the active dataset
        csv_files = list(DATA_DIR.glob("*.csv"))
        if not csv_files:
            raise HTTPException(status_code=404, detail="No active dataset found")
        
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
                    "missing": int(df[col].isna().sum()),
                    "unique": int(df[col].nunique())
                }
            }
            
            # Add numeric statistics if applicable
            if pd.api.types.is_numeric_dtype(df[col]):
                numeric_stats = {
                    "mean": float(df[col].mean()),
                    "std": float(df[col].std()),
                    "min": float(df[col].min()),
                    "max": float(df[col].max()),
                    "median": float(df[col].median()),
                    "skewness": float(df[col].skew()),
                    "kurtosis": float(df[col].kurtosis())
                }
                
                # Calculate distribution
                hist_values, hist_bins = np.histogram(df[col].dropna(), bins=10)
                numeric_stats["distribution"] = {
                    "bins": hist_bins.tolist(),
                    "counts": hist_values.tolist()
                }
                
                # Calculate correlations with other numeric columns
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                correlations = {}
                for other_col in numeric_cols:
                    if other_col != col:
                        corr = df[col].corr(df[other_col])
                        if not np.isnan(corr):
                            correlations[other_col] = float(corr)
                
                numeric_stats["correlations"] = correlations
                col_stats["stats"].update(numeric_stats)
            
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

@router.get("/data/summary")
async def get_data_summary():
    """Get a quick summary of the dataset"""
    try:
        csv_files = list(DATA_DIR.glob("*.csv"))
        if not csv_files:
            raise HTTPException(status_code=404, detail="No active dataset found")
        
        df = pd.read_csv(csv_files[0])
        
        summary = {
            "filename": csv_files[0].name,
            "rows": len(df),
            "columns": len(df.columns),
            "memory_usage_mb": df.memory_usage(deep=True).sum() / (1024 * 1024),
            "column_types": {
                "numeric": len(df.select_dtypes(include=[np.number]).columns),
                "categorical": len(df.select_dtypes(include=['object', 'category']).columns),
                "datetime": len(df.select_dtypes(include=['datetime64']).columns),
                "boolean": len(df.select_dtypes(include=['bool']).columns)
            },
            "missing_values": {
                "total": int(df.isna().sum().sum()),
                "by_column": {col: int(df[col].isna().sum()) for col in df.columns}
            }
        }
        
        return summary
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get data summary: {str(e)}"
        ) 
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_selection import mutual_info_classif
import json
import logging

router = APIRouter()

class DatasetInfo(BaseModel):
    ref: str
    columns: List[str]
    preview: List[Dict[str, Any]]
    stats: Dict[str, Any]

class WorkflowRequest(BaseModel):
    dataset: Optional[DatasetInfo] = None
    workflow: Optional[Dict[str, Any]] = None
    scenario: Optional[Dict[str, Any]] = None

class WorkflowSuggestion(BaseModel):
    title: str
    description: str
    steps: List[Dict[str, Any]]
    confidence: float

class AIInsight(BaseModel):
    type: str
    title: str
    message: str
    action: Optional[Dict[str, str]]

class AnalysisResponse(BaseModel):
    insights: List[AIInsight]
    suggestions: List[WorkflowSuggestion]

def analyze_dataset_quality(df: pd.DataFrame) -> List[AIInsight]:
    """Analyze dataset quality and generate insights."""
    insights = []
    
    # Check for missing values
    missing_cols = df.columns[df.isnull().any()].tolist()
    if missing_cols:
        insights.append(AIInsight(
            type="warning",
            title="Missing Values Detected",
            message=f"Found missing values in columns: {', '.join(missing_cols)}",
            action={
                "label": "Handle Missing Values",
                "handler": "handleMissingValues"
            }
        ))
    
    # Check for categorical columns
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    if categorical_cols:
        insights.append(AIInsight(
            type="info",
            title="Categorical Features Found",
            message=f"Found {len(categorical_cols)} categorical columns that may need encoding",
            action={
                "label": "Encode Categories",
                "handler": "encodeCategorical"
            }
        ))
    
    return insights

def generate_dataset_suggestions(dataset: DatasetInfo) -> List[WorkflowSuggestion]:
    """Generate workflow suggestions based on dataset characteristics."""
    suggestions = []
    
    # Convert preview data to DataFrame for analysis
    df = pd.DataFrame(dataset.preview)
    
    # Detect numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    datetime_cols = [col for col in df.columns if pd.to_datetime(df[col], errors='coerce').notna().all()]
    
    # Customer Segmentation Suggestion
    if len(numeric_cols) >= 3 and len(categorical_cols) >= 1:
        suggestions.append(WorkflowSuggestion(
            title="Customer Segmentation Analysis",
            description="Segment customers based on behavioral and demographic data",
            steps=[
                {
                    "type": "data_preprocessing",
                    "config": {
                        "operations": ["handle_missing", "encode_categorical", "scale_features"]
                    }
                },
                {
                    "type": "clustering",
                    "config": {
                        "algorithm": "kmeans",
                        "n_clusters": "auto"
                    }
                },
                {
                    "type": "visualization",
                    "config": {
                        "type": "scatter",
                        "dimensions": 2
                    }
                }
            ],
            confidence=0.85
        ))
    
    # Time Series Analysis Suggestion
    if len(datetime_cols) >= 1 and len(numeric_cols) >= 1:
        suggestions.append(WorkflowSuggestion(
            title="Time Series Forecasting",
            description="Analyze and predict trends over time",
            steps=[
                {
                    "type": "time_series_preprocessing",
                    "config": {
                        "date_column": datetime_cols[0],
                        "target_column": numeric_cols[0],
                        "frequency": "auto"
                    }
                },
                {
                    "type": "forecasting",
                    "config": {
                        "algorithm": "prophet",
                        "horizon": "30d"
                    }
                },
                {
                    "type": "visualization",
                    "config": {
                        "type": "line",
                        "components": ["trend", "forecast"]
                    }
                }
            ],
            confidence=0.9
        ))
    
    # Feature Importance Analysis
    if len(numeric_cols) >= 2:
        suggestions.append(WorkflowSuggestion(
            title="Feature Importance Analysis",
            description="Identify key factors driving your target variable",
            steps=[
                {
                    "type": "feature_selection",
                    "config": {
                        "method": "mutual_info",
                        "target": numeric_cols[-1]
                    }
                },
                {
                    "type": "visualization",
                    "config": {
                        "type": "bar",
                        "sort": "descending"
                    }
                }
            ],
            confidence=0.8
        ))
    
    return suggestions

@router.post("/suggest", response_model=List[WorkflowSuggestion])
async def generate_suggestions(request: WorkflowRequest) -> List[WorkflowSuggestion]:
    """Generate workflow suggestions based on dataset or existing workflow."""
    try:
        if request.dataset:
            return generate_dataset_suggestions(request.dataset)
        elif request.workflow:
            # Handle existing workflow suggestions
            return []
        else:
            raise HTTPException(
                status_code=400,
                detail="Either dataset or workflow must be provided"
            )
    except Exception as e:
        logging.error(f"Error generating suggestions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate suggestions: {str(e)}"
        ) 
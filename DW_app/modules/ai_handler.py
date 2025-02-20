import os
from openai import OpenAI
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import json
from pydantic import BaseModel
from datetime import datetime

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Define structured response models
class DatasetInsight(BaseModel):
    summary: str
    key_findings: List[str]
    patterns: List[str]
    recommendations: List[str]
    warnings: List[str]

class VisualizationSuggestion(BaseModel):
    chart_type: str
    columns: List[str]
    purpose: str
    description: str

class DataQualityCheck(BaseModel):
    missing_values: Dict[str, float]
    outliers: Dict[str, List[float]]
    correlations: Dict[str, Dict[str, float]]
    recommendations: List[str]

class DataAnalysis(BaseModel):
    summary: str
    findings: List[str]
    correlations: List[str]
    issues: List[str]
    recommendations: List[str]

class CleaningPlan(BaseModel):
    issues: List[str]
    steps: List[str]
    impact: List[str]
    priority: List[str]
    validation: List[str]

class ChatResponse(BaseModel):
    answer: str
    supporting_data: Dict[str, Any]
    related_insights: List[str]
    follow_up: List[str]

class TrendAnalysis(BaseModel):
    historical_analysis: List[str]
    patterns: List[str]
    correlations: Dict[str, float]
    predictions: List[str]
    confidence: Dict[str, float]

def analyze_data(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze a dataset using OpenAI's API to generate structured insights.
    """
    df_info = df.describe().to_string()
    df_sample = df.head().to_string()
    column_types = df.dtypes.to_string()
    missing_info = df.isnull().sum().to_string()
    
    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a data analysis expert. Analyze the dataset and provide structured insights."},
                {"role": "user", "content": f"""
                    Data Summary: {df_info}
                    Column Types: {column_types}
                    Missing Values: {missing_info}
                    Sample Data: {df_sample}
                """}
            ],
            response_format=DataAnalysis
        )
        
        return {
            "insights": completion.choices[0].message.parsed,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "error": f"Error analyzing data: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

def suggest_visualizations(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Suggest appropriate visualizations based on the dataset structure.
    """
    # Get column types and basic stats
    column_info = {
        col: {
            "type": str(df[col].dtype),
            "unique_values": len(df[col].unique()),
            "missing_values": df[col].isnull().sum(),
            "is_numeric": pd.api.types.is_numeric_dtype(df[col].dtype),
            "is_categorical": pd.api.types.is_categorical_dtype(df[col].dtype) or 
                            (pd.api.types.is_object_dtype(df[col].dtype) and df[col].nunique() < len(df) * 0.05)
        }
        for col in df.columns
    }
    
    prompt = f"""
    Suggest visualizations for this dataset:
    
    Column Information:
    {json.dumps(column_info, indent=2)}
    
    Provide a list of visualization suggestions, each containing:
    1. Chart type (e.g., scatter, line, bar, etc.)
    2. Columns to use
    3. Purpose of the visualization
    4. Description of expected insights
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a data visualization expert. Suggest effective visualizations."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" },
            temperature=0.7
        )
        
        suggestions = json.loads(response.choices[0].message.content)
        return {
            "suggestions": suggestions,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "error": f"Error suggesting visualizations: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

def generate_insights(df: pd.DataFrame, focus: Optional[str] = None) -> Dict[str, Any]:
    """
    Generate specific insights based on the focus area.
    """
    # Prepare dataset summary
    summary = {
        "shape": df.shape,
        "columns": list(df.columns),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "missing": df.isnull().sum().to_dict(),
        "numeric_stats": df.describe().to_dict() if not df.select_dtypes(include=[np.number]).empty else {},
        "focus": focus
    }
    
    prompt = f"""
    Generate insights for this dataset:
    
    Dataset Summary:
    {json.dumps(summary, indent=2)}
    
    Focus Area: {focus if focus else 'General analysis'}
    
    Provide a structured analysis including:
    1. Dataset overview and context
    2. Key insights and findings
    3. Statistical observations
    4. Recommendations for further analysis
    5. Potential applications or use cases
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a data insight generator. Provide meaningful, actionable insights."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" },
            temperature=0.7
        )
        
        insights = json.loads(response.choices[0].message.content)
        return {
            "insights": insights,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "error": f"Error generating insights: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

def chat_with_data(df: pd.DataFrame, user_message: str) -> Dict[str, Any]:
    """
    Enable natural language interaction with the dataset.
    """
    context = {
        "columns": list(df.columns),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "shape": df.shape,
        "summary": df.describe().to_dict()
    }
    
    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful data assistant. Provide structured responses to questions."},
                {"role": "user", "content": f"""
                    Dataset Context: {context}
                    Question: {user_message}
                """}
            ],
            response_format=ChatResponse
        )
        
        return {
            "response": completion.choices[0].message.parsed,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "error": f"Error processing query: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

def predict_trends(df: pd.DataFrame, target_column: str) -> Dict[str, Any]:
    """
    Analyze and predict trends in the dataset.
    """
    context = {
        "target_column": target_column,
        "historical_data": df[target_column].describe().to_dict() if target_column in df.columns else None,
        "correlations": df.corr()[target_column].to_dict() if target_column in df.columns else None
    }
    
    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a trend analysis expert. Provide structured trend analysis and predictions."},
                {"role": "user", "content": f"Trend Context: {context}"}
            ],
            response_format=TrendAnalysis
        )
        
        return {
            "analysis": completion.choices[0].message.parsed,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "error": f"Error analyzing trends: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

def clean_data(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Suggest and apply data cleaning operations with structured responses.
    """
    quality_report = {
        "missing_values": df.isnull().sum().to_dict(),
        "duplicates": len(df[df.duplicated()]),
        "column_types": df.dtypes.astype(str).to_dict(),
        "unique_counts": {col: df[col].nunique() for col in df.columns}
    }
    
    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a data cleaning expert. Provide a structured cleaning plan."},
                {"role": "user", "content": f"Data Quality Report: {quality_report}"}
            ],
            response_format=CleaningPlan
        )
        
        return {
            "cleaning_plan": completion.choices[0].message.parsed,
            "quality_report": quality_report,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "error": f"Error generating cleaning plan: {str(e)}",
            "timestamp": datetime.now().isoformat()
        } 
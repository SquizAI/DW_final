from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from openai import AsyncOpenAI
from datetime import datetime
import json
import os
from dotenv import load_dotenv
import traceback
import pandas as pd
import numpy as np
from pathlib import Path
import kaggle
from kaggle.api.kaggle_api_extended import KaggleApi
import boto3
from kafka import KafkaConsumer
import pymongo
from sqlalchemy import create_engine
import io
from .kaggle_utils import search_kaggle_datasets, download_kaggle_dataset
import shutil
from .agents.types import AgentInteraction
from .agents.manager import agent_manager

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Create data directory if it doesn't exist
UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Data Whisperer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class AnalyzeContextRequest(BaseModel):
    currentPath: str
    recentActions: List[str]
    activeDatasets: List[str]

class WorkflowStep(BaseModel):
    type: str
    params: Dict[str, Any]
    description: str

class WorkflowSuggestion(BaseModel):
    id: str
    name: str
    description: str
    confidence: float
    steps: List[WorkflowStep]

class DataInsight(BaseModel):
    type: str
    message: str
    confidence: float
    action: Optional[Dict[str, str]]

class AnalyzeContextResponse(BaseModel):
    insights: List[DataInsight]
    suggestedWorkflows: List[WorkflowSuggestion]

class AnalyzeIntentRequest(BaseModel):
    input: str

class AnalyzeIntentResponse(BaseModel):
    intent: str
    confidence: float
    workflows: List[WorkflowSuggestion]

class WorkflowNode(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]

class WorkflowEdge(BaseModel):
    id: Optional[str]
    source: str
    target: str
    type: Optional[str]

class WorkflowState(BaseModel):
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]

class AnalyzeWorkflowRequest(BaseModel):
    message: str
    workflow: WorkflowState

class AnalyzeWorkflowResponse(BaseModel):
    response: str
    suggestedWorkflow: Optional[WorkflowState]

# Additional Models for Dataset Management
class DatasetPreview(BaseModel):
    name: str
    size: int
    type: str
    rowCount: Optional[int]
    columns: Optional[List[str]]
    sample: Optional[List[Dict[str, Any]]]

class DatasetStats(BaseModel):
    totalRows: int
    totalColumns: int
    numericColumns: int
    categoricalColumns: int
    missingValues: Dict[str, int]
    memoryUsage: float

# Additional Models for Data Preview and Validation
class DataPreview(BaseModel):
    schema: Dict[str, Any]
    sample: List[Dict[str, Any]]
    stats: Dict[str, Any]

class ValidationRule(BaseModel):
    field: str
    type: str
    params: Dict[str, Any]

class ValidationConfig(BaseModel):
    rules: List[ValidationRule]
    threshold: float
    action: str

class ValidationResult(BaseModel):
    isValid: bool
    issues: List[Dict[str, Any]]
    summary: Dict[str, Any]

# Additional Models for Data Sources
class KaggleSearchRequest(BaseModel):
    query: str
    max_results: int = 10

class KaggleDataset(BaseModel):
    ref: str
    title: str
    size: str
    last_updated: str
    download_count: int

class KaggleSearchResponse(BaseModel):
    success: bool
    datasets: List[KaggleDataset]
    error: Optional[str] = None

class S3Config(BaseModel):
    bucket: str
    key: str
    region: str
    access_key_id: str
    secret_access_key: str

class KafkaConfig(BaseModel):
    bootstrap_servers: List[str]
    topic: str
    group_id: str
    auto_offset_reset: str = "earliest"

class MongoDBConfig(BaseModel):
    connection_string: str
    database: str
    collection: str

class SQLConfig(BaseModel):
    connection_string: str
    query: str

# Additional Models for Data Lineage
class LineageNode(BaseModel):
    id: str
    type: str
    name: str
    source: str
    created_at: datetime
    metadata: Dict[str, Any]

class LineageEdge(BaseModel):
    id: str
    source_node: str
    target_node: str
    operation: str
    created_at: datetime
    metadata: Dict[str, Any]

class LineageGraph(BaseModel):
    nodes: List[LineageNode]
    edges: List[LineageEdge]

# AI Functions
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

async def analyze_context_with_ai(request: AnalyzeContextRequest) -> AnalyzeContextResponse:
    try:
        # Use the async OpenAI client
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI data analysis assistant. Analyze the current context and provide: 1. Relevant insights about the data and potential actions, 2. Suggested workflows based on the current state."
                },
                {
                    "role": "user",
                    "content": f"Current path: {request.currentPath}\nRecent actions: {request.recentActions}\nActive datasets: {request.activeDatasets}"
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )

        # Parse the response into insights and workflows
        try:
            content = response.choices[0].message.content
            # Return dummy data for now
            return AnalyzeContextResponse(
                insights=[
                    DataInsight(
                        type="suggestion",
                        message="Try uploading a dataset to get started",
                        confidence=0.9
                    )
                ],
                suggestedWorkflows=[
                    WorkflowSuggestion(
                        id="sample-workflow",
                        name="Sample Data Pipeline",
                        description="A basic data processing pipeline",
                        confidence=0.8,
                        steps=[
                            WorkflowStep(
                                type="dataNode",
                                params={"source": "upload"},
                                description="Upload your dataset"
                            ),
                            WorkflowStep(
                                type="transformNode",
                                params={"operation": "clean"},
                                description="Clean and preprocess data"
                            )
                        ]
                    )
                ]
            )
        except Exception as parse_error:
            print('Error parsing OpenAI response:', parse_error)
            raise

    except Exception as e:
        print('Error in analyze_context_with_ai:', traceback.format_exc())
        if DEBUG:
            return AnalyzeContextResponse(
                insights=[
                    DataInsight(
                        type="insight",
                        message="Dummy insight: Analysis failed",
                        confidence=0.8
                    )
                ],
                suggestedWorkflows=[
                    WorkflowSuggestion(
                        id="dummy",
                        name="Dummy Workflow",
                        description="This is a dummy workflow for context analysis",
                        confidence=0.8,
                        steps=[]
                    )
                ]
            )
        raise HTTPException(status_code=500, detail=str(e))

async def analyze_intent_with_ai(request: AnalyzeIntentRequest) -> AnalyzeIntentResponse:
    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI data analysis assistant. Analyze the user's intent and provide: 1. The main intent/goal, 2. Confidence level, 3. Suggested workflows to achieve the goal."
                },
                {
                    "role": "user",
                    "content": request.input
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )

        content = response.choices[0].message.content
        # Parse the content into structured response
        return AnalyzeIntentResponse(
            intent="Analyze data",
            confidence=0.9,
            workflows=[
                WorkflowSuggestion(
                    id="data-analysis",
                    name="Data Analysis Pipeline",
                    description="Basic data analysis workflow",
                    confidence=0.8,
                    steps=[]
                )
            ]
        )
    except Exception as e:
        print('Error in analyze_intent_with_ai:', traceback.format_exc())
        if DEBUG:
            return AnalyzeIntentResponse(
                intent="Dummy intent: analysis failed",
                confidence=0.75,
                workflows=[WorkflowSuggestion(id="dummy", name="Dummy Workflow", description="This is a dummy workflow for intent analysis", confidence=0.8, steps=[])]
            )
        raise HTTPException(status_code=500, detail=str(e))

async def analyze_workflow_with_ai(request: AnalyzeWorkflowRequest) -> AnalyzeWorkflowResponse:
    try:
        # Format the workflow state for the AI
        workflow_description = []
        for node in request.workflow.nodes:
            node_info = f"Node {node.id} ({node.type})"
            if node.data.get("config"):
                config_str = ", ".join(f"{k}: {v}" for k, v in node.data["config"].items())
                node_info += f" with config: {config_str}"
            workflow_description.append(node_info)
        
        for edge in request.workflow.edges:
            workflow_description.append(f"Connection from {edge.source} to {edge.target}")

        workflow_state = "\n".join(workflow_description) if workflow_description else "Empty workflow"

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": """You are an AI data lake workflow assistant. Analyze workflows and provide:
                    1. Insights about the current workflow state
                    2. Suggestions for improvement
                    3. Best practices for data lake architecture
                    4. Potential optimizations
                    Format your response in a clear, structured way."""
                },
                {
                    "role": "user",
                    "content": f"User message: {request.message}\n\nCurrent workflow state:\n{workflow_state}"
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )

        content = response.choices[0].message.content
        return AnalyzeWorkflowResponse(
            response=content,
            suggestedWorkflow=None
        )
    except Exception as e:
        print('Error in analyze_workflow_with_ai:', traceback.format_exc())
        if DEBUG:
            return AnalyzeWorkflowResponse(
                response="I encountered an error while analyzing the workflow. In debug mode, I'll provide a dummy response.",
                suggestedWorkflow=None
            )
        raise HTTPException(status_code=500, detail=str(e))

# Routes
@app.post("/api/ai/analyze-context", response_model=AnalyzeContextResponse)
async def analyze_context(request: AnalyzeContextRequest):
    return await analyze_context_with_ai(request)

@app.post("/api/ai/analyze-intent", response_model=AnalyzeIntentResponse)
async def analyze_intent(request: AnalyzeIntentRequest):
    return await analyze_intent_with_ai(request)

@app.post("/api/ai/execute-workflow/{workflow_id}")
async def execute_workflow(workflow_id: str):
    # TODO: Implement workflow execution
    return {"status": "success", "message": f"Executing workflow {workflow_id}"}

@app.get("/api/ai/dataset-recommendations")
async def get_dataset_recommendations():
    # TODO: Implement dataset recommendations
    return {
        "insights": [
            {
                "type": "suggestion",
                "message": "Consider uploading a CSV file for better analysis",
                "confidence": 0.9
            }
        ]
    }

@app.post("/api/ai/analyze-workflow", response_model=AnalyzeWorkflowResponse)
async def analyze_workflow(request: AnalyzeWorkflowRequest):
    return await analyze_workflow_with_ai(request)

# Dataset Management Routes
@app.post("/api/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        # Save file
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Read and analyze the dataset
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        elif file.filename.endswith('.json'):
            df = pd.read_json(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Generate preview and stats
        preview = DatasetPreview(
            name=file.filename,
            size=len(content),
            type=file.content_type or "text/csv",
            rowCount=len(df),
            columns=df.columns.tolist(),
            sample=df.head(5).to_dict('records')
        )
        
        stats = DatasetStats(
            totalRows=len(df),
            totalColumns=len(df.columns),
            numericColumns=len(df.select_dtypes(include=['int64', 'float64']).columns),
            categoricalColumns=len(df.select_dtypes(include=['object', 'category', 'bool']).columns),
            missingValues={col: int(df[col].isnull().sum()) for col in df.columns},
            memoryUsage=df.memory_usage(deep=True).sum() / (1024 * 1024)  # MB
        )
        
        return {
            "success": True,
            "preview": preview.dict(),
            "stats": stats.dict()
        }
        
    except Exception as e:
        print('Error in upload_dataset:', traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/datasets")
async def list_datasets():
    try:
        datasets = []
        for file in UPLOAD_DIR.glob("*"):
            if file.suffix in ['.csv', '.xlsx', '.json']:
                stats = file.stat()
                datasets.append({
                    "name": file.name,
                    "size": stats.st_size,
                    "modified": stats.st_mtime,
                    "type": file.suffix[1:]
                })
        return datasets
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/datasets/{filename}/preview")
async def get_dataset_preview(filename: str):
    try:
        file_path = UPLOAD_DIR / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Read the dataset
        if filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif filename.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        elif filename.endswith('.json'):
            df = pd.read_json(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Generate preview
        preview = {
            "name": filename,
            "rowCount": len(df),
            "columns": df.columns.tolist(),
            "sample": df.head(5).to_dict('records'),
            "stats": {
                "numeric_columns": len(df.select_dtypes(include=['int64', 'float64']).columns),
                "categorical_columns": len(df.select_dtypes(include=['object', 'category', 'bool']).columns),
                "missing_values": {col: int(df[col].isnull().sum()) for col in df.columns},
                "memory_usage_mb": df.memory_usage(deep=True).sum() / (1024 * 1024)
            }
        }
        
        return preview
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/datasets/{filename}")
async def delete_dataset(filename: str):
    try:
        file_path = UPLOAD_DIR / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        file_path.unlink()
        return {"success": True, "message": f"Dataset {filename} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Data Preview and Validation Routes
@app.get("/api/workflow/preview/{node_id}", response_model=DataPreview)
async def get_node_preview(node_id: str):
    try:
        # In a real implementation, this would fetch data from your data lake
        # and generate statistics based on the node's configuration
        
        # Example preview data
        preview = {
            "schema": {
                "fields": [
                    {"name": "id", "type": "integer", "nullable": False},
                    {"name": "name", "type": "string", "nullable": True},
                    {"name": "value", "type": "float", "nullable": True},
                ]
            },
            "sample": [
                {"id": 1, "name": "Item 1", "value": 10.5},
                {"id": 2, "name": "Item 2", "value": 20.0},
                {"id": 3, "name": "Item 3", "value": None},
            ],
            "stats": {
                "rowCount": 1000,
                "nullCounts": {
                    "id": 0,
                    "name": 5,
                    "value": 10
                },
                "uniqueCounts": {
                    "id": 1000,
                    "name": 950,
                    "value": 100
                },
                "numericalStats": {
                    "id": {
                        "min": 1,
                        "max": 1000,
                        "mean": 500.5,
                        "stdDev": 288.675
                    },
                    "value": {
                        "min": 0.0,
                        "max": 100.0,
                        "mean": 50.0,
                        "stdDev": 25.0
                    }
                }
            }
        }
        
        return preview
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/workflow/validate", response_model=ValidationResult)
async def validate_data(config: ValidationConfig, file: UploadFile = File(...)):
    try:
        # Read the uploaded file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file.file)
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(file.file)
        elif file.filename.endswith('.json'):
            df = pd.read_json(file.file)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")

        issues = []
        
        # Apply validation rules
        for rule in config.rules:
            if rule.field not in df.columns:
                issues.append({
                    "field": rule.field,
                    "type": "missing_field",
                    "message": f"Field {rule.field} not found in dataset"
                })
                continue

            if rule.type == "missing":
                null_count = df[rule.field].isnull().sum()
                null_ratio = null_count / len(df)
                if null_ratio > rule.params.get("threshold", 0.1):
                    issues.append({
                        "field": rule.field,
                        "type": "missing_values",
                        "message": f"Field {rule.field} has {null_count} missing values ({null_ratio:.2%})"
                    })

            elif rule.type == "unique":
                unique_count = df[rule.field].nunique()
                unique_ratio = unique_count / len(df)
                if unique_ratio < rule.params.get("threshold", 0.9):
                    issues.append({
                        "field": rule.field,
                        "type": "uniqueness",
                        "message": f"Field {rule.field} has low uniqueness ({unique_ratio:.2%})"
                    })

            elif rule.type == "range":
                if pd.api.types.is_numeric_dtype(df[rule.field]):
                    min_val = df[rule.field].min()
                    max_val = df[rule.field].max()
                    if min_val < rule.params.get("min", float("-inf")) or max_val > rule.params.get("max", float("inf")):
                        issues.append({
                            "field": rule.field,
                            "type": "range",
                            "message": f"Field {rule.field} has values outside allowed range [{rule.params.get('min', '-inf')}, {rule.params.get('max', 'inf')}]"
                        })

            elif rule.type == "regex":
                if pd.api.types.is_string_dtype(df[rule.field]):
                    pattern = rule.params.get("pattern", "")
                    if pattern:
                        invalid_count = df[df[rule.field].notna()][~df[rule.field].str.match(pattern)].shape[0]
                        if invalid_count > 0:
                            issues.append({
                                "field": rule.field,
                                "type": "regex",
                                "message": f"Field {rule.field} has {invalid_count} values not matching pattern"
                            })

        # Calculate validation summary
        total_issues = len(issues)
        fields_with_issues = len(set(issue["field"] for issue in issues))
        
        summary = {
            "totalIssues": total_issues,
            "fieldsWithIssues": fields_with_issues,
            "issuesByType": {},
            "affectedRows": 0
        }

        # Count issues by type
        for issue in issues:
            issue_type = issue["type"]
            summary["issuesByType"][issue_type] = summary["issuesByType"].get(issue_type, 0) + 1

        # Determine if validation passed based on threshold
        is_valid = total_issues == 0 or (total_issues / len(df)) <= config.threshold

        return ValidationResult(
            isValid=is_valid,
            issues=issues,
            summary=summary
        )

    except Exception as e:
        print('Error in validate_data:', traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# Utility Functions
def setup_kaggle_api():
    """Set up and verify Kaggle API credentials."""
    try:
        api = KaggleApi()
        api.authenticate()
        return True, api
    except Exception as e:
        print('Error in setup_kaggle_api:', traceback.format_exc())
        return False, None

def convert_size_to_mb(size_str: str) -> float:
    """Convert size string to MB."""
    try:
        if 'KB' in size_str:
            return float(size_str.replace('KB', '').strip()) / 1024
        elif 'MB' in size_str:
            return float(size_str.replace('MB', '').strip())
        elif 'GB' in size_str:
            return float(size_str.replace('GB', '').strip()) * 1024
        else:
            return float(size_str) / (1024 * 1024)  # Assume bytes
    except:
        return 0.0

# New Routes for Data Sources
@app.post("/api/kaggle/search", response_model=KaggleSearchResponse)
async def search_datasets(request: KaggleSearchRequest):
    """Search Kaggle datasets with proper error handling and metadata extraction."""
    try:
        success, api = setup_kaggle_api()
        if not success:
            raise HTTPException(status_code=500, detail="Failed to authenticate with Kaggle API")
        
        datasets = api.dataset_list(
            search=request.query,
            sort_by='hottest',
            max_size=None,
            file_type='csv'
        )
        results = []
        
        for dataset in datasets[:request.max_results]:
            try:
                size_mb = convert_size_to_mb(str(getattr(dataset, 'size', '0')))
                dataset_info = KaggleDataset(
                    ref=f"{dataset.ref}",
                    title=getattr(dataset, 'title', 'Untitled'),
                    size=f"{size_mb:.1f} MB",
                    last_updated=str(getattr(dataset, 'lastUpdated', 'Unknown')),
                    download_count=getattr(dataset, 'downloadCount', 0)
                )
                results.append(dataset_info)
            except Exception as e:
                print(f"Error processing dataset {dataset.ref}: {str(e)}")
                continue
        
        return KaggleSearchResponse(success=True, datasets=results)
    except Exception as e:
        print('Error in search_kaggle_datasets:', traceback.format_exc())
        return KaggleSearchResponse(
            success=False,
            datasets=[],
            error=f"Search failed: {str(e)}"
        )

@app.post("/api/kaggle/download", response_model=KaggleSearchResponse)
async def download_dataset(dataset_ref: str, target_dir: str = "data"):
    """Download a dataset from Kaggle."""
    try:
        result = await download_kaggle_dataset(dataset_ref, target_dir)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/s3/import")
async def import_from_s3(config: S3Config):
    """Import data from S3."""
    try:
        s3 = boto3.client(
            's3',
            region_name=config.region,
            aws_access_key_id=config.access_key_id,
            aws_secret_access_key=config.secret_access_key
        )
        
        # Download file from S3
        response = s3.get_object(Bucket=config.bucket, Key=config.key)
        file_content = response['Body'].read()
        
        # Determine file type and read data
        if config.key.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(file_content))
        elif config.key.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(file_content))
        elif config.key.endswith('.json'):
            df = pd.read_json(io.BytesIO(file_content))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Save file locally
        file_path = UPLOAD_DIR / config.key.split('/')[-1]
        with file_path.open('wb') as f:
            f.write(file_content)
        
        preview = DatasetPreview(
            name=file_path.name,
            size=len(file_content),
            type=file_path.suffix[1:],
            rowCount=len(df),
            columns=df.columns.tolist(),
            sample=df.head(5).to_dict('records')
        )
        
        return {
            "success": True,
            "message": f"File imported as {file_path.name}",
            "preview": preview.dict()
        }
    except Exception as e:
        print('Error in import_from_s3:', traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/kafka/import")
async def import_from_kafka(config: KafkaConfig):
    """Import data from Kafka topic."""
    try:
        # Initialize Kafka consumer
        consumer = KafkaConsumer(
            config.topic,
            bootstrap_servers=config.bootstrap_servers,
            group_id=config.group_id,
            auto_offset_reset=config.auto_offset_reset,
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )
        
        # Collect messages
        messages = []
        message_count = 0
        start_time = datetime.now()
        
        while (datetime.now() - start_time).seconds < 30 and message_count < 1000:
            msg = next(consumer, None)
            if msg is None:
                break
            messages.append(msg.value)
            message_count += 1
        
        if not messages:
            raise HTTPException(status_code=404, detail="No messages found in topic")
        
        # Convert to DataFrame
        df = pd.DataFrame(messages)
        
        # Save as JSON file
        file_path = UPLOAD_DIR / f"kafka_import_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        df.to_json(file_path, orient='records')
        
        preview = DatasetPreview(
            name=file_path.name,
            size=file_path.stat().st_size,
            type="json",
            rowCount=len(df),
            columns=df.columns.tolist(),
            sample=df.head(5).to_dict('records')
        )
        
        return {
            "success": True,
            "message": f"Imported {len(messages)} messages as {file_path.name}",
            "preview": preview.dict()
        }
    except Exception as e:
        print('Error in import_from_kafka:', traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/mongodb/import")
async def import_from_mongodb(config: MongoDBConfig):
    """Import data from MongoDB collection."""
    try:
        client = pymongo.MongoClient(config.connection_string)
        db = client[config.database]
        collection = db[config.collection]
        
        # Fetch documents
        documents = list(collection.find())
        if not documents:
            raise HTTPException(status_code=404, detail="No documents found in collection")
        
        # Convert to DataFrame
        df = pd.DataFrame(documents)
        
        # Remove MongoDB _id column
        if '_id' in df.columns:
            df = df.drop('_id', axis=1)
        
        # Save as JSON file
        file_path = UPLOAD_DIR / f"mongodb_import_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        df.to_json(file_path, orient='records')
        
        preview = DatasetPreview(
            name=file_path.name,
            size=file_path.stat().st_size,
            type="json",
            rowCount=len(df),
            columns=df.columns.tolist(),
            sample=df.head(5).to_dict('records')
        )
        
        return {
            "success": True,
            "message": f"Imported {len(documents)} documents as {file_path.name}",
            "preview": preview.dict()
        }
    except Exception as e:
        print('Error in import_from_mongodb:', traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sql/import")
async def import_from_sql(config: SQLConfig):
    """Import data from SQL database."""
    try:
        engine = create_engine(config.connection_string)
        
        # Execute query
        df = pd.read_sql(config.query, engine)
        
        # Save as CSV file
        file_path = UPLOAD_DIR / f"sql_import_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        df.to_csv(file_path, index=False)
        
        preview = DatasetPreview(
            name=file_path.name,
            size=file_path.stat().st_size,
            type="csv",
            rowCount=len(df),
            columns=df.columns.tolist(),
            sample=df.head(5).to_dict('records')
        )
        
        return {
            "success": True,
            "message": f"Imported {len(df)} rows as {file_path.name}",
            "preview": preview.dict()
        }
    except Exception as e:
        print('Error in import_from_sql:', traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# Data Lineage Routes
@app.post("/api/lineage/node")
async def create_lineage_node(node: LineageNode):
    """Create a new node in the data lineage graph."""
    try:
        # In a real implementation, this would be stored in a database
        # For now, we'll store it in a JSON file
        lineage_file = UPLOAD_DIR / "lineage.json"
        if lineage_file.exists():
            with lineage_file.open('r') as f:
                lineage = json.load(f)
        else:
            lineage = {"nodes": [], "edges": []}
        
        node_dict = node.dict()
        node_dict["created_at"] = node_dict["created_at"].isoformat()
        lineage["nodes"].append(node_dict)
        
        with lineage_file.open('w') as f:
            json.dump(lineage, f, indent=2)
        
        return node_dict
    except Exception as e:
        print('Error in create_lineage_node:', traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/lineage/edge")
async def create_lineage_edge(edge: LineageEdge):
    """Create a new edge in the data lineage graph."""
    try:
        lineage_file = UPLOAD_DIR / "lineage.json"
        if lineage_file.exists():
            with lineage_file.open('r') as f:
                lineage = json.load(f)
        else:
            lineage = {"nodes": [], "edges": []}
        
        edge_dict = edge.dict()
        edge_dict["created_at"] = edge_dict["created_at"].isoformat()
        lineage["edges"].append(edge_dict)
        
        with lineage_file.open('w') as f:
            json.dump(lineage, f, indent=2)
        
        return edge_dict
    except Exception as e:
        print('Error in create_lineage_edge:', traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/lineage/graph", response_model=LineageGraph)
async def get_lineage_graph():
    """Get the complete data lineage graph."""
    try:
        lineage_file = UPLOAD_DIR / "lineage.json"
        if not lineage_file.exists():
            return LineageGraph(nodes=[], edges=[])
        
        with lineage_file.open('r') as f:
            lineage = json.load(f)
        
        # Convert ISO format strings back to datetime objects
        for node in lineage["nodes"]:
            node["created_at"] = datetime.fromisoformat(node["created_at"])
        for edge in lineage["edges"]:
            edge["created_at"] = datetime.fromisoformat(edge["created_at"])
        
        return LineageGraph(**lineage)
    except Exception as e:
        print('Error in get_lineage_graph:', traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/lineage/node/{node_id}")
async def get_lineage_node(node_id: str):
    """Get details about a specific node in the lineage graph."""
    try:
        lineage_file = UPLOAD_DIR / "lineage.json"
        if not lineage_file.exists():
            raise HTTPException(status_code=404, detail="Lineage graph not found")
        
        with lineage_file.open('r') as f:
            lineage = json.load(f)
        
        node = next((n for n in lineage["nodes"] if n["id"] == node_id), None)
        if not node:
            raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
        
        # Get all edges connected to this node
        connected_edges = [
            e for e in lineage["edges"]
            if e["source_node"] == node_id or e["target_node"] == node_id
        ]
        
        # Get all directly connected nodes
        connected_nodes = []
        for edge in connected_edges:
            other_node_id = edge["target_node"] if edge["source_node"] == node_id else edge["source_node"]
            other_node = next((n for n in lineage["nodes"] if n["id"] == other_node_id), None)
            if other_node:
                connected_nodes.append(other_node)
        
        return {
            "node": node,
            "edges": connected_edges,
            "connected_nodes": connected_nodes
        }
    except Exception as e:
        print('Error in get_lineage_node:', traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/lineage/path")
async def find_lineage_path(source_id: str, target_id: str):
    """Find the path between two nodes in the lineage graph."""
    try:
        lineage_file = UPLOAD_DIR / "lineage.json"
        if not lineage_file.exists():
            raise HTTPException(status_code=404, detail="Lineage graph not found")
        
        with lineage_file.open('r') as f:
            lineage = json.load(f)
        
        def find_paths(current_id: str, target_id: str, visited: set, path: list) -> List[list]:
            if current_id == target_id:
                return [path]
            
            paths = []
            visited.add(current_id)
            
            # Find all edges where current_id is the source
            next_edges = [e for e in lineage["edges"] if e["source_node"] == current_id]
            
            for edge in next_edges:
                next_id = edge["target_node"]
                if next_id not in visited:
                    new_paths = find_paths(
                        next_id,
                        target_id,
                        visited.copy(),
                        path + [{"edge": edge, "node": next((n for n in lineage["nodes"] if n["id"] == next_id), None)}]
                    )
                    paths.extend(new_paths)
            
            return paths
        
        # Find the source and target nodes
        source_node = next((n for n in lineage["nodes"] if n["id"] == source_id), None)
        target_node = next((n for n in lineage["nodes"] if n["id"] == target_id), None)
        
        if not source_node or not target_node:
            raise HTTPException(status_code=404, detail="Source or target node not found")
        
        # Find all paths from source to target
        paths = find_paths(source_id, target_id, set(), [{
            "edge": None,
            "node": source_node
        }])
        
        if not paths:
            return {
                "paths": [],
                "message": f"No path found between {source_id} and {target_id}"
            }
        
        return {
            "paths": paths,
            "message": f"Found {len(paths)} path(s) between {source_id} and {target_id}"
        }
    except Exception as e:
        print('Error in find_lineage_path:', traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# File upload endpoint
@app.post("/api/upload")
async def upload_file(file: UploadFile):
    """Handle file upload and save to data directory."""
    try:
        # Create data directory if it doesn't exist
        os.makedirs("data", exist_ok=True)
        
        # Save the file
        file_path = os.path.join("data", file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "success": True,
            "message": f"File {file.filename} uploaded successfully",
            "file_path": file_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Kaggle API endpoints
@app.get("/api/kaggle/search")
async def search_datasets(query: str, max_results: int = 10):
    """Search Kaggle datasets."""
    return search_kaggle_datasets(query, max_results)

@app.post("/api/kaggle/download")
async def download_dataset(dataset_ref: str):
    """Download a Kaggle dataset."""
    return download_kaggle_dataset(dataset_ref)

# Agent Routes
@app.get("/api/agents")
async def get_agents():
    """Get all active agents and their status."""
    return list(agent_manager.agents.values())

@app.post("/api/agents/interact")
async def interact_with_agents(interaction: AgentInteraction):
    """Handle an interaction with the agent system."""
    try:
        responses = await agent_manager.handle_interaction(
            interaction.message,
            interaction.context
        )
        return {"responses": responses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
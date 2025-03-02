from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from app.workflows.data_science import workflow_manager, WorkflowStep, DatasetSource
from app.services.ai_analysis import analyze_dataset, suggest_workflow, analyze_ml_potential, generate_insights, recommend_preprocessing, auto_clean_dataset, auto_feature_engineering, real_time_workflow_assistance
from app.services.ai_model_optimization import AutoMLOptimizer
from app.services.ai_visualization import AIVisualizationGenerator
import pandas as pd
import numpy as np

router = APIRouter()

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    dataset_source: DatasetSource
    dataset_path: str

@router.post("/workflow")
async def create_workflow(workflow_data: WorkflowCreate):
    """Create a new data science workflow."""
    try:
        workflow = await workflow_manager.create_workflow(
            name=workflow_data.name,
            description=workflow_data.description,
            dataset_source=workflow_data.dataset_source,
            dataset_path=workflow_data.dataset_path
        )
        return {"workflow_id": workflow.id, "status": "created"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/workflow/{workflow_id}/steps/{step}")
async def execute_workflow_step(
    workflow_id: str,
    step: WorkflowStep,
    background_tasks: BackgroundTasks
):
    """Execute a specific step in the workflow."""
    try:
        # Add the task to background processing
        background_tasks.add_task(workflow_manager.execute_step, workflow_id, step)
        return {
            "message": f"Step {step} execution started",
            "workflow_id": workflow_id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/workflow/{workflow_id}/status")
async def get_workflow_status(workflow_id: str):
    """Get the current status of a workflow."""
    try:
        return workflow_manager.get_workflow_status(workflow_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Workflow not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/workflow/{workflow_id}/results/{step}")
async def get_step_results(workflow_id: str, step: WorkflowStep):
    """Get the results of a specific workflow step."""
    try:
        workflow = workflow_manager.workflows[workflow_id]
        if step not in workflow.results:
            raise HTTPException(
                status_code=404,
                detail=f"No results found for step {step}"
            )
        return workflow.results[step]
    except KeyError:
        raise HTTPException(status_code=404, detail="Workflow not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/workflow/analyze-dataset")
async def analyze_uploaded_dataset(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
) -> Dict[str, Any]:
    """
    Analyze an uploaded dataset using AI to suggest optimal workflows and data processing steps.
    """
    try:
        # Read the dataset based on file type
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file.file)
        elif file.filename.endswith('.json'):
            df = pd.read_json(file.file)
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(file.file)
        elif file.filename.endswith('.parquet'):
            df = pd.read_parquet(file.file)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload CSV, JSON, Excel, or Parquet files."
            )

        # Analyze dataset characteristics
        analysis_results = await analyze_dataset(df)
        
        # Generate workflow suggestions
        workflow_suggestions = await suggest_workflow(
            df=df,
            analysis=analysis_results,
            available_nodes=workflow_manager.get_available_nodes()
        )

        return {
            "columns": [
                {
                    "name": col,
                    "type": str(df[col].dtype),
                    "nullPercentage": (df[col].isnull().sum() / len(df) * 100),
                    "uniqueValues": df[col].nunique(),
                    "distribution": df[col].value_counts().head(10).to_dict() if df[col].dtype in ['object', 'category'] else None
                }
                for col in df.columns
            ],
            "rowCount": len(df),
            "dataQuality": analysis_results["quality"],
            "suggestedWorkflows": workflow_suggestions
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AIAnalysisRequest(BaseModel):
    columns: List[Dict[str, Any]]
    rowCount: int
    dataQuality: Dict[str, Any]

@router.post("/workflow/ai-analysis")
async def perform_ai_analysis(request: AIAnalysisRequest) -> Dict[str, Any]:
    """
    Perform advanced AI analysis on the dataset to suggest optimal ML workflows.
    """
    try:
        # Analyze ML potential
        ml_potential = await analyze_ml_potential(
            columns=request.columns,
            row_count=request.rowCount,
            quality=request.dataQuality
        )

        # Generate dataset insights
        insights = await generate_insights(
            columns=request.columns,
            quality=request.dataQuality
        )

        # Get preprocessing recommendations
        preprocessing_recs = await recommend_preprocessing(
            columns=request.columns,
            quality=request.dataQuality,
            ml_tasks=ml_potential["suggestedTasks"]
        )

        # Calculate dataset profile
        data_types = {}
        for col in request.columns:
            dtype = col["type"]
            data_types[dtype] = data_types.get(dtype, 0) + 1

        completeness = sum(
            1 - col.get("nullPercentage", 0) / 100
            for col in request.columns
        ) / len(request.columns)

        return {
            "dataProfile": {
                "rowCount": request.rowCount,
                "columnCount": len(request.columns),
                "memoryUsage": f"{request.rowCount * len(request.columns) * 8 / (1024*1024):.1f} MB",
                "dataTypes": data_types,
                "completeness": completeness
            },
            "quality": request.dataQuality,
            "insights": insights,
            "mlPotential": ml_potential,
            "recommendations": preprocessing_recs
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AutoCleanRequest(BaseModel):
    dataset_id: str
    cleaning_preferences: Optional[Dict[str, Any]] = None

@router.post("/workflow/auto-clean")
async def clean_dataset(request: AutoCleanRequest) -> Dict[str, Any]:
    """
    Automatically clean a dataset using AI-guided decisions.
    """
    try:
        # Load dataset
        df = workflow_manager.get_dataset(request.dataset_id)
        if df is None:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # Perform auto-cleaning
        cleaning_results = await auto_clean_dataset(df)
        
        if "error" in cleaning_results:
            raise HTTPException(status_code=500, detail=cleaning_results["error"])

        # Save cleaned dataset
        workflow_manager.save_dataset(
            f"{request.dataset_id}_cleaned",
            cleaning_results["cleaned_data"]
        )

        return {
            "cleaning_logs": cleaning_results["cleaning_logs"],
            "quality_improvement": cleaning_results["quality_improvement"],
            "cleaned_dataset_id": f"{request.dataset_id}_cleaned"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class FeatureEngineeringRequest(BaseModel):
    dataset_id: str
    target_column: Optional[str] = None
    engineering_preferences: Optional[Dict[str, Any]] = None

@router.post("/workflow/auto-engineer-features")
async def engineer_features(request: FeatureEngineeringRequest) -> Dict[str, Any]:
    """
    Automatically engineer features using AI guidance.
    """
    try:
        # Load dataset
        df = workflow_manager.get_dataset(request.dataset_id)
        if df is None:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # Perform feature engineering
        engineering_results = await auto_feature_engineering(
            df,
            target_col=request.target_column
        )
        
        if "error" in engineering_results:
            raise HTTPException(status_code=500, detail=engineering_results["error"])

        # Save engineered dataset
        workflow_manager.save_dataset(
            f"{request.dataset_id}_engineered",
            engineering_results["engineered_data"]
        )

        return {
            "feature_logs": engineering_results["feature_logs"],
            "importance_scores": engineering_results["importance_scores"],
            "engineered_dataset_id": f"{request.dataset_id}_engineered"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class WorkflowAssistanceRequest(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    selected_node: Optional[Dict[str, Any]] = None

@router.post("/workflow/get-assistance")
async def get_workflow_assistance(request: WorkflowAssistanceRequest) -> Dict[str, Any]:
    """
    Get real-time AI assistance for workflow building.
    """
    try:
        assistance = await real_time_workflow_assistance(
            current_nodes=request.nodes,
            current_edges=request.edges,
            selected_node=request.selected_node
        )
        
        if "error" in assistance:
            raise HTTPException(status_code=500, detail=assistance["error"])

        return assistance

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AutoMLRequest(BaseModel):
    dataset_id: str
    target_column: str
    task_type: str = 'classification'
    optimization_time: Optional[int] = 3600  # 1 hour default
    n_trials: Optional[int] = 100

@router.post("/workflow/optimize-model")
async def optimize_model(request: AutoMLRequest) -> Dict[str, Any]:
    """
    Automatically optimize a machine learning model using AI guidance.
    """
    try:
        # Load dataset
        df = workflow_manager.get_dataset(request.dataset_id)
        if df is None:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # Split features and target
        if request.target_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Target column {request.target_column} not found in dataset")
        
        X = df.drop(columns=[request.target_column])
        y = df[request.target_column]

        # Initialize optimizer
        optimizer = AutoMLOptimizer(task_type=request.task_type)

        # Run optimization
        results = await optimizer.optimize_model(
            X=X,
            y=y,
            n_trials=request.n_trials,
            timeout=request.optimization_time
        )

        if "error" in results:
            raise HTTPException(status_code=500, detail=results["error"])

        # Save optimized model
        model_id = f"{request.dataset_id}_optimized_model"
        workflow_manager.save_model(model_id, optimizer)

        return {
            "model_id": model_id,
            "optimization_results": {
                "best_params": results["best_params"],
                "best_score": results["best_score"],
                "feature_importance": results["feature_importance"],
            },
            "insights": results["insights"],
            "history": results["optimization_history"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ModelPredictionRequest(BaseModel):
    model_id: str
    data: Dict[str, List[Any]]

@router.post("/workflow/predict")
async def make_predictions(request: ModelPredictionRequest) -> Dict[str, Any]:
    """
    Make predictions using an optimized model.
    """
    try:
        # Load model
        model = workflow_manager.get_model(request.model_id)
        if model is None:
            raise HTTPException(status_code=404, detail="Model not found")

        # Convert input data to DataFrame
        df = pd.DataFrame(request.data)

        # Make predictions
        predictions = model.predict(df)
        probabilities = model.predict_proba(df) if model.task_type == "classification" else None

        return {
            "predictions": predictions.tolist(),
            "probabilities": probabilities.tolist() if probabilities is not None else None,
            "feature_importance": model.get_feature_importance(),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class VisualizationRequest(BaseModel):
    dataset_id: str
    target_column: Optional[str] = None
    task_type: Optional[str] = None
    visualization_types: Optional[List[str]] = None

@router.post("/workflow/visualize")
async def generate_visualizations(request: VisualizationRequest) -> Dict[str, Any]:
    """
    Generate AI-powered visualizations for data insights.
    """
    try:
        # Load dataset
        df = workflow_manager.get_dataset(request.dataset_id)
        if df is None:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # Initialize visualization generator
        viz_generator = AIVisualizationGenerator()

        # Generate visualizations
        results = await viz_generator.generate_visualizations(
            df=df,
            target_col=request.target_column,
            task_type=request.task_type
        )

        if "error" in results:
            raise HTTPException(status_code=500, detail=results["error"])

        return {
            "visualizations": {
                "figures": results["figures"],
                "titles": results["titles"],
                "descriptions": results["descriptions"],
            },
            "insights": results["insights"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
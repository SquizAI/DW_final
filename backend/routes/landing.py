from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict
import random
from datetime import datetime, timedelta
import os
import pandas as pd
import json

router = APIRouter()

# In-memory cache for demo purposes
stats_cache = {
    "last_update": None,
    "data": None
}

# Demo project templates
DEMO_TEMPLATES = {
    "customer_segmentation": {
        "name": "Customer Segmentation",
        "description": "Segment customers based on RFM analysis",
        "dataset": "carrie1/ecommerce-customer-segmentation",
        "workflow": {
            "nodes": [
                {
                    "id": "1",
                    "type": "dataSource",
                    "position": {"x": 100, "y": 100},
                    "data": {"label": "Customer Data"}
                },
                {
                    "id": "2",
                    "type": "transform",
                    "position": {"x": 300, "y": 100},
                    "data": {"label": "RFM Calculation"}
                },
                {
                    "id": "3",
                    "type": "aiModel",
                    "position": {"x": 500, "y": 100},
                    "data": {"label": "K-Means Clustering"}
                }
            ],
            "edges": [
                {"id": "e1-2", "source": "1", "target": "2"},
                {"id": "e2-3", "source": "2", "target": "3"}
            ]
        }
    },
    "sales_forecasting": {
        "name": "Sales Forecasting",
        "description": "Predict future sales using historical data",
        "dataset": "rohitsahoo/sales-forecasting",
        "workflow": {
            "nodes": [
                {
                    "id": "1",
                    "type": "dataSource",
                    "position": {"x": 100, "y": 100},
                    "data": {"label": "Sales Data"}
                },
                {
                    "id": "2",
                    "type": "transform",
                    "position": {"x": 300, "y": 100},
                    "data": {"label": "Feature Engineering"}
                },
                {
                    "id": "3",
                    "type": "aiModel",
                    "position": {"x": 500, "y": 100},
                    "data": {"label": "LSTM Model"}
                }
            ],
            "edges": [
                {"id": "e1-2", "source": "1", "target": "2"},
                {"id": "e2-3", "source": "2", "target": "3"}
            ]
        }
    }
}

def initialize_demo_workspace():
    """Initialize a demo workspace with sample data and workflows."""
    workspace_id = f"demo-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    workspace_dir = os.path.join("data", workspace_id)
    
    # Create workspace directory
    os.makedirs(workspace_dir, exist_ok=True)
    
    # Save demo templates
    with open(os.path.join(workspace_dir, "templates.json"), "w") as f:
        json.dump(DEMO_TEMPLATES, f)
    
    return workspace_id

@router.get("/stats")
async def get_stats() -> Dict:
    """Get platform statistics for the landing page."""
    # For now, return mock data
    # In production, this would come from your database
    return {
        "users": 1234,
        "datasets": 567,
        "insights": 8901
    }

@router.post("/demo/initialize")
async def initialize_demo(background_tasks: BackgroundTasks) -> Dict:
    """Initialize a demo environment for new users."""
    try:
        # Initialize workspace in background
        workspace_id = initialize_demo_workspace()
        
        # Download demo datasets in background
        background_tasks.add_task(download_demo_datasets, workspace_id)
        
        return {
            "status": "success",
            "message": "Demo environment initialized successfully",
            "workspace_id": workspace_id,
            "templates": DEMO_TEMPLATES
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize demo environment: {str(e)}"
        )

@router.get("/demo/templates")
async def get_demo_templates() -> Dict:
    """Get available demo templates."""
    return DEMO_TEMPLATES

async def download_demo_datasets(workspace_id: str):
    """Download demo datasets in the background."""
    workspace_dir = os.path.join("data", workspace_id)
    
    # Here you would implement the actual dataset download logic
    # For now, we'll create some dummy data
    for template in DEMO_TEMPLATES.values():
        dataset_path = os.path.join(workspace_dir, f"{template['name']}.csv")
        
        # Create dummy data
        df = pd.DataFrame({
            'id': range(1000),
            'value': [random.random() for _ in range(1000)]
        })
        df.to_csv(dataset_path, index=False) 
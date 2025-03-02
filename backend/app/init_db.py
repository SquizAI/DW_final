import logging
import os
import json
from pathlib import Path
from datetime import datetime
import uuid

from sqlalchemy.orm import Session
from . import models, crud, schemas
from .database import engine, Base, SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample data for initialization
SAMPLE_DATASETS = [
    {
        "name": "Customer Segmentation Dataset",
        "description": "Dataset for customer segmentation analysis with demographic and purchase data",
        "file_path": "data/samples/customer_segmentation.csv",
        "metadata": {
            "rows": 1000,
            "columns": 15,
            "size_bytes": 250000,
            "format": "csv"
        }
    },
    {
        "name": "Sales Analysis Dataset",
        "description": "Historical sales data for trend analysis and forecasting",
        "file_path": "data/samples/sales_analysis.csv",
        "metadata": {
            "rows": 5000,
            "columns": 10,
            "size_bytes": 750000,
            "format": "csv"
        }
    },
    {
        "name": "Product Analytics Dataset",
        "description": "Product usage and performance metrics for product analytics",
        "file_path": "data/samples/product_analytics.csv",
        "metadata": {
            "rows": 3000,
            "columns": 12,
            "size_bytes": 500000,
            "format": "csv"
        }
    }
]

SAMPLE_WORKFLOWS = [
    {
        "name": "Customer Segmentation Workflow",
        "description": "Segment customers based on demographic and purchase behavior",
        "template": "segmentation",
        "is_ai_generated": False,
        "created_by": "system",
        "nodes": [
            {
                "id": "node-1",
                "type": "dataSource",
                "position_x": 100,
                "position_y": 100,
                "data": {"label": "Dataset Source"}
            },
            {
                "id": "node-2",
                "type": "transformation",
                "position_x": 300,
                "position_y": 100,
                "data": {"label": "Data Transformation"}
            },
            {
                "id": "node-3",
                "type": "analysis",
                "position_x": 500,
                "position_y": 100,
                "data": {"label": "Segmentation Analysis"}
            }
        ],
        "edges": [
            {
                "id": "edge-1-2",
                "source": "node-1",
                "target": "node-2"
            },
            {
                "id": "edge-2-3",
                "source": "node-2",
                "target": "node-3"
            }
        ]
    },
    {
        "name": "Sales Forecasting Workflow",
        "description": "Forecast future sales based on historical data",
        "template": "forecasting",
        "is_ai_generated": True,
        "created_by": "system",
        "nodes": [
            {
                "id": "node-1",
                "type": "dataSource",
                "position_x": 100,
                "position_y": 100,
                "data": {"label": "Sales Data Source"}
            },
            {
                "id": "node-2",
                "type": "transformation",
                "position_x": 300,
                "position_y": 100,
                "data": {"label": "Data Cleaning"}
            },
            {
                "id": "node-3",
                "type": "analysis",
                "position_x": 500,
                "position_y": 100,
                "data": {"label": "Time Series Analysis"}
            },
            {
                "id": "node-4",
                "type": "visualization",
                "position_x": 700,
                "position_y": 100,
                "data": {"label": "Forecast Visualization"}
            }
        ],
        "edges": [
            {
                "id": "edge-1-2",
                "source": "node-1",
                "target": "node-2"
            },
            {
                "id": "edge-2-3",
                "source": "node-2",
                "target": "node-3"
            },
            {
                "id": "edge-3-4",
                "source": "node-3",
                "target": "node-4"
            }
        ]
    }
]

def init_db(db: Session) -> None:
    """Initialize the database with sample data if it doesn't exist."""
    # Check if there are any datasets
    datasets_count = db.query(models.Dataset).count()
    if datasets_count > 0:
        logger.info(f"Database already contains {datasets_count} datasets. Skipping initialization.")
        return
    
    logger.info("Initializing database with sample data...")
    
    # Create sample datasets
    sample_datasets = [
        models.Dataset(
            id=str(uuid.uuid4()),
            name="Sample CSV Dataset",
            description="A sample CSV dataset for testing",
            file_path="data/sample_csv.csv",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            meta_data={"rows": 100, "columns": 5, "format": "csv"}
        ),
        models.Dataset(
            id=str(uuid.uuid4()),
            name="Sample JSON Dataset",
            description="A sample JSON dataset for testing",
            file_path="data/sample_json.json",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            meta_data={"records": 50, "format": "json"}
        ),
        models.Dataset(
            id=str(uuid.uuid4()),
            name="Sample Excel Dataset",
            description="A sample Excel dataset for testing",
            file_path="data/sample_excel.xlsx",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            meta_data={"sheets": 2, "rows": 200, "format": "xlsx"}
        )
    ]
    
    # Add datasets to the database
    for dataset in sample_datasets:
        db.add(dataset)
    
    # Commit changes to get dataset IDs
    db.commit()
    
    # Create sample workflows
    sample_workflows = [
        models.Workflow(
            id=str(uuid.uuid4()),
            name="Data Cleaning Workflow",
            description="A sample workflow for data cleaning",
            dataset_id=sample_datasets[0].id,
            template="data_cleaning",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            created_by="system",
            is_ai_generated=False,
            meta_data={"version": "1.0", "complexity": "medium"}
        ),
        models.Workflow(
            id=str(uuid.uuid4()),
            name="Data Visualization Workflow",
            description="A sample workflow for data visualization",
            dataset_id=sample_datasets[1].id,
            template="data_visualization",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            created_by="system",
            is_ai_generated=True,
            meta_data={"version": "1.0", "complexity": "low"}
        )
    ]
    
    # Add workflows to the database
    for workflow in sample_workflows:
        db.add(workflow)
    
    # Commit changes to get workflow IDs
    db.commit()
    
    # Create sample workflow nodes for the first workflow
    sample_nodes_1 = [
        models.WorkflowNode(
            id="node1",
            workflow_id=sample_workflows[0].id,
            type="dataSource",
            position_x=100,
            position_y=100,
            data={"label": "Data Source", "datasetId": sample_datasets[0].id}
        ),
        models.WorkflowNode(
            id="node2",
            workflow_id=sample_workflows[0].id,
            type="filter",
            position_x=300,
            position_y=100,
            data={"label": "Filter", "column": "age", "operator": ">", "value": 30}
        ),
        models.WorkflowNode(
            id="node3",
            workflow_id=sample_workflows[0].id,
            type="output",
            position_x=500,
            position_y=100,
            data={"label": "Output"}
        )
    ]
    
    # Add nodes to the database
    for node in sample_nodes_1:
        db.add(node)
    
    # Create sample workflow edges for the first workflow
    sample_edges_1 = [
        models.WorkflowEdge(
            id="edge1",
            workflow_id=sample_workflows[0].id,
            source="node1",
            target="node2"
        ),
        models.WorkflowEdge(
            id="edge2",
            workflow_id=sample_workflows[0].id,
            source="node2",
            target="node3"
        )
    ]
    
    # Add edges to the database
    for edge in sample_edges_1:
        db.add(edge)
    
    # Create sample workflow nodes for the second workflow
    sample_nodes_2 = [
        models.WorkflowNode(
            id="node4",
            workflow_id=sample_workflows[1].id,
            type="dataSource",
            position_x=100,
            position_y=100,
            data={"label": "Data Source", "datasetId": sample_datasets[1].id}
        ),
        models.WorkflowNode(
            id="node5",
            workflow_id=sample_workflows[1].id,
            type="transform",
            position_x=300,
            position_y=100,
            data={"label": "Transform", "operation": "groupBy", "column": "category"}
        ),
        models.WorkflowNode(
            id="node6",
            workflow_id=sample_workflows[1].id,
            type="visualization",
            position_x=500,
            position_y=100,
            data={"label": "Visualization", "type": "barChart"}
        )
    ]
    
    # Add nodes to the database
    for node in sample_nodes_2:
        db.add(node)
    
    # Create sample workflow edges for the second workflow
    sample_edges_2 = [
        models.WorkflowEdge(
            id="edge3",
            workflow_id=sample_workflows[1].id,
            source="node4",
            target="node5"
        ),
        models.WorkflowEdge(
            id="edge4",
            workflow_id=sample_workflows[1].id,
            source="node5",
            target="node6"
        )
    ]
    
    # Add edges to the database
    for edge in sample_edges_2:
        db.add(edge)
    
    # Commit all changes
    db.commit()
    
    logger.info(f"Database initialized with {len(sample_datasets)} datasets and {len(sample_workflows)} workflows.")
    logger.info(f"Added {len(sample_nodes_1) + len(sample_nodes_2)} nodes and {len(sample_edges_1) + len(sample_edges_2)} edges.")

def main() -> None:
    logger.info("Creating initial data")
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()

if __name__ == "__main__":
    main() 
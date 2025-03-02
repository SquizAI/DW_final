import os
import json
import logging
from pathlib import Path
from datetime import datetime
from sqlalchemy.orm import Session

from .database import SessionLocal, engine, Base
from . import models, schemas, crud

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize base directories
BASE_DATA_DIR = Path(os.getenv('DATA_DIR', os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')))
WORKFLOWS_DIR = BASE_DATA_DIR / "workflows"

def migrate_datasets():
    """Migrate datasets from JSON file to database"""
    logger.info("Migrating datasets to database")
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Check if datasets.json exists
        datasets_file = os.path.join(BASE_DATA_DIR, 'datasets.json')
        if not os.path.exists(datasets_file):
            logger.info("No datasets.json file found, skipping dataset migration")
            return
        
        # Load datasets from JSON file
        with open(datasets_file, 'r') as f:
            datasets = json.load(f)
        
        # Migrate each dataset
        for dataset in datasets:
            # Check if dataset already exists in database
            existing_dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset["id"]).first()
            if existing_dataset:
                logger.info(f"Dataset {dataset['id']} already exists in database, skipping")
                continue
            
            # Create dataset in database
            dataset_create = schemas.DatasetCreate(
                name=dataset["name"],
                description=dataset.get("description"),
                file_path=dataset["file_path"],
                metadata=dataset.get("metadata", {})
            )
            
            # Set ID to match the original dataset
            db_dataset = models.Dataset(
                id=dataset["id"],
                name=dataset_create.name,
                description=dataset_create.description,
                file_path=dataset_create.file_path,
                metadata=dataset_create.metadata,
                created_at=datetime.fromisoformat(dataset["created_at"]) if "created_at" in dataset else datetime.now(),
                updated_at=datetime.fromisoformat(dataset["updated_at"]) if "updated_at" in dataset else datetime.now()
            )
            
            db.add(db_dataset)
            logger.info(f"Migrated dataset: {dataset['name']} ({dataset['id']})")
        
        # Commit changes
        db.commit()
        logger.info(f"Migrated {len(datasets)} datasets to database")
    
    except Exception as e:
        logger.error(f"Error migrating datasets: {str(e)}")
        db.rollback()
    finally:
        db.close()

def migrate_workflows():
    """Migrate workflows from JSON files to database"""
    logger.info("Migrating workflows to database")
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Check if workflows directory exists
        if not os.path.exists(WORKFLOWS_DIR):
            logger.info("No workflows directory found, skipping workflow migration")
            return
        
        # Count migrated workflows
        migrated_count = 0
        
        # Migrate each workflow file
        for filename in os.listdir(WORKFLOWS_DIR):
            if not filename.endswith('.json'):
                continue
            
            workflow_path = WORKFLOWS_DIR / filename
            workflow_id = filename.replace('.json', '')
            
            # Check if workflow already exists in database
            existing_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
            if existing_workflow:
                logger.info(f"Workflow {workflow_id} already exists in database, skipping")
                continue
            
            # Load workflow from JSON file
            with open(workflow_path, 'r') as f:
                workflow_data = json.load(f)
            
            # Convert nodes to proper format
            nodes = []
            for node_data in workflow_data.get("nodes", []):
                # Handle different node formats
                if isinstance(node_data, dict) and "id" in node_data:
                    # Extract position data
                    position = node_data.get("position", {})
                    position_x = position.get("x", 0) if isinstance(position, dict) else 0
                    position_y = position.get("y", 0) if isinstance(position, dict) else 0
                    
                    # Create node
                    node = models.WorkflowNode(
                        id=node_data["id"],
                        workflow_id=workflow_id,
                        type=node_data.get("type", "unknown"),
                        position_x=position_x,
                        position_y=position_y,
                        data=node_data.get("data", {})
                    )
                    nodes.append(node)
            
            # Convert edges to proper format
            edges = []
            for edge_data in workflow_data.get("edges", []):
                if isinstance(edge_data, dict) and "source" in edge_data and "target" in edge_data:
                    # Create edge
                    edge = models.WorkflowEdge(
                        id=edge_data.get("id", f"edge-{len(edges)+1}"),
                        workflow_id=workflow_id,
                        source=edge_data["source"],
                        target=edge_data["target"],
                        source_handle=edge_data.get("sourceHandle"),
                        target_handle=edge_data.get("targetHandle"),
                        type=edge_data.get("type", "default")
                    )
                    edges.append(edge)
            
            # Create workflow in database
            workflow = models.Workflow(
                id=workflow_id,
                name=workflow_data.get("name", f"Workflow {workflow_id}"),
                description=workflow_data.get("description", ""),
                dataset_id=workflow_data.get("dataset_id"),
                template=workflow_data.get("template"),
                created_at=datetime.fromisoformat(workflow_data["created_at"]) if "created_at" in workflow_data else datetime.now(),
                updated_at=datetime.fromisoformat(workflow_data["updated_at"]) if "updated_at" in workflow_data else datetime.now(),
                created_by=workflow_data.get("created_by", "system"),
                is_ai_generated=workflow_data.get("is_ai_generated", False),
                metadata=workflow_data.get("metadata", {})
            )
            
            # Add workflow to database
            db.add(workflow)
            
            # Add nodes and edges
            for node in nodes:
                db.add(node)
            
            for edge in edges:
                db.add(edge)
            
            migrated_count += 1
            logger.info(f"Migrated workflow: {workflow.name} ({workflow_id})")
        
        # Commit changes
        db.commit()
        logger.info(f"Migrated {migrated_count} workflows to database")
    
    except Exception as e:
        logger.error(f"Error migrating workflows: {str(e)}")
        db.rollback()
    finally:
        db.close()

def main():
    """Run the data migration process"""
    logger.info("Starting data migration process")
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Migrate datasets
    migrate_datasets()
    
    # Migrate workflows
    migrate_workflows()
    
    logger.info("Data migration completed")

if __name__ == "__main__":
    main() 
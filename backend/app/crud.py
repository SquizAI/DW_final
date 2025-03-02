from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Dict, Any, Optional, Union, Type
import logging
from datetime import datetime

from . import models, schemas

logger = logging.getLogger(__name__)

# Dataset CRUD operations
def create_dataset(db: Session, dataset: schemas.DatasetCreate) -> models.Dataset:
    db_dataset = models.Dataset(
        name=dataset.name,
        description=dataset.description,
        file_path=dataset.file_path,
        meta_data=dataset.meta_data
    )
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset

def get_dataset(db: Session, dataset_id: str) -> Optional[models.Dataset]:
    return db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()

def get_datasets(db: Session, skip: int = 0, limit: int = 100) -> List[models.Dataset]:
    return db.query(models.Dataset).offset(skip).limit(limit).all()

def update_dataset(db: Session, dataset_id: str, dataset: schemas.DatasetUpdate) -> Optional[models.Dataset]:
    db_dataset = get_dataset(db, dataset_id)
    if db_dataset:
        update_data = dataset.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_dataset, key, value)
        db_dataset.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_dataset)
    return db_dataset

def delete_dataset(db: Session, dataset_id: str) -> bool:
    db_dataset = get_dataset(db, dataset_id)
    if db_dataset:
        db.delete(db_dataset)
        db.commit()
        return True
    return False

# Workflow CRUD operations
def create_workflow(db: Session, workflow: schemas.WorkflowCreate) -> models.Workflow:
    # Create workflow
    db_workflow = models.Workflow(
        name=workflow.name,
        description=workflow.description,
        dataset_id=workflow.dataset_id,
        template=workflow.template,
        created_by=workflow.created_by,
        is_ai_generated=workflow.is_ai_generated,
        meta_data=workflow.meta_data
    )
    db.add(db_workflow)
    db.flush()  # Flush to get the ID
    
    # Create nodes
    for node in workflow.nodes:
        db_node = models.WorkflowNode(
            id=node.id,
            workflow_id=db_workflow.id,
            type=node.type,
            position_x=node.position_x,
            position_y=node.position_y,
            data=node.data
        )
        db.add(db_node)
    
    # Create edges
    for edge in workflow.edges:
        db_edge = models.WorkflowEdge(
            id=edge.id,
            workflow_id=db_workflow.id,
            source=edge.source,
            target=edge.target,
            source_handle=edge.source_handle,
            target_handle=edge.target_handle,
            type=edge.type
        )
        db.add(db_edge)
    
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

def get_workflow(db: Session, workflow_id: str) -> Optional[models.Workflow]:
    return db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()

def get_workflows(db: Session, skip: int = 0, limit: int = 100) -> List[models.Workflow]:
    return db.query(models.Workflow).offset(skip).limit(limit).all()

def get_workflows_by_dataset(db: Session, dataset_id: str) -> List[models.Workflow]:
    return db.query(models.Workflow).filter(models.Workflow.dataset_id == dataset_id).all()

def update_workflow(db: Session, workflow_id: str, workflow: schemas.WorkflowUpdate) -> Optional[models.Workflow]:
    db_workflow = get_workflow(db, workflow_id)
    if not db_workflow:
        return None
    
    # Update workflow fields
    update_data = workflow.dict(exclude={"nodes", "edges"}, exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_workflow, key, value)
    
    # Update nodes if provided
    if workflow.nodes is not None:
        # Delete existing nodes
        db.query(models.WorkflowNode).filter(models.WorkflowNode.workflow_id == workflow_id).delete()
        
        # Create new nodes
        for node in workflow.nodes:
            db_node = models.WorkflowNode(
                id=node.id,
                workflow_id=workflow_id,
                type=node.type,
                position_x=node.position_x,
                position_y=node.position_y,
                data=node.data
            )
            db.add(db_node)
    
    # Update edges if provided
    if workflow.edges is not None:
        # Delete existing edges
        db.query(models.WorkflowEdge).filter(models.WorkflowEdge.workflow_id == workflow_id).delete()
        
        # Create new edges
        for edge in workflow.edges:
            db_edge = models.WorkflowEdge(
                id=edge.id,
                workflow_id=workflow_id,
                source=edge.source,
                target=edge.target,
                source_handle=edge.source_handle,
                target_handle=edge.target_handle,
                type=edge.type
            )
            db.add(db_edge)
    
    db_workflow.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

def delete_workflow(db: Session, workflow_id: str) -> bool:
    db_workflow = get_workflow(db, workflow_id)
    if db_workflow:
        db.delete(db_workflow)
        db.commit()
        return True
    return False 
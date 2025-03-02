#!/usr/bin/env python
"""
List Datasets

This script lists all datasets in the database.
"""

import os
import sys
import logging
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def list_datasets():
    """List all datasets in the database"""
    try:
        # Import database dependencies
        from app.database import SessionLocal
        from app import models
        
        # Create database session
        db = SessionLocal()
        
        try:
            # Get all datasets
            datasets = db.query(models.Dataset).all()
            
            # Print dataset information
            logger.info(f"Found {len(datasets)} datasets in the database:")
            for i, dataset in enumerate(datasets):
                logger.info(f"{i+1}. {dataset.name} (ID: {dataset.id})")
                logger.info(f"   Description: {dataset.description}")
                logger.info(f"   File path: {dataset.file_path}")
                logger.info(f"   Created at: {dataset.created_at}")
                logger.info(f"   Updated at: {dataset.updated_at}")
                
                # Print metadata if available
                if dataset.meta_data:
                    logger.info(f"   Metadata:")
                    for key, value in dataset.meta_data.items():
                        if key == "files":
                            logger.info(f"      {key}: {len(value)} files")
                        else:
                            logger.info(f"      {key}: {value}")
                
                logger.info("")
            
            return datasets
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error listing datasets: {str(e)}")
        return []

if __name__ == "__main__":
    list_datasets() 
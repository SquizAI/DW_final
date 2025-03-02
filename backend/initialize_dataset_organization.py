#!/usr/bin/env python
"""
Initialize Dataset Organization

This script initializes the dataset organization system and catalogs existing datasets.
It creates the necessary directory structure, indexes existing datasets, and organizes them into buckets.
"""

import os
import sys
import logging
import argparse
from pathlib import Path
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the dataset organization components
from app.dataset_organization.bucket_manager import BucketManager
from app.dataset_organization.dataset_indexer import DatasetIndexer
from app.dataset_organization.ai_cataloger import AICataloger

def initialize_organization(use_ai: bool = True) -> None:
    """Initialize the dataset organization system
    
    Args:
        use_ai: Whether to use AI for cataloging datasets
    """
    # Set up the data directory
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)
    logger.info(f"Using data directory: {data_dir}")
    
    # Initialize components
    bucket_manager = BucketManager(data_dir=data_dir)
    dataset_indexer = DatasetIndexer(data_dir=data_dir)
    ai_cataloger = AICataloger(data_dir=data_dir)
    
    # Get all datasets from the database
    from app.database import SessionLocal
    from app.crud import get_datasets
    
    db = SessionLocal()
    try:
        db_datasets = get_datasets(db)
        logger.info(f"Found {len(db_datasets)} datasets in the database")
        
        # Index the datasets
        indexed_datasets = []
        for dataset in db_datasets:
            try:
                # Check if file exists
                if not os.path.exists(dataset.file_path):
                    logger.warning(f"Dataset file not found: {dataset.file_path}")
                    continue
                
                # Index the dataset
                indexed = dataset_indexer.index_dataset(
                    file_path=dataset.file_path,
                    name=dataset.name,
                    description=dataset.description,
                    source="database"
                )
                
                indexed_datasets.append(indexed)
                logger.info(f"Indexed dataset: {dataset.name}")
            except Exception as e:
                logger.error(f"Failed to index dataset {dataset.name}: {str(e)}")
        
        logger.info(f"Successfully indexed {len(indexed_datasets)} datasets")
        
        # Organize datasets into buckets
        bucket_manager.organize_existing_datasets(indexed_datasets)
        logger.info("Organized datasets into buckets")
        
        # Catalog datasets using AI if enabled
        if use_ai:
            successful = 0
            failed = 0
            for dataset in indexed_datasets:
                try:
                    ai_cataloger.catalog_dataset(
                        dataset_id=dataset['id'],
                        file_path=dataset['file_path'],
                        metadata=dataset.get('metadata', {})
                    )
                    successful += 1
                    logger.info(f"Cataloged dataset: {dataset['name']}")
                except Exception as e:
                    failed += 1
                    logger.error(f"Failed to catalog dataset {dataset['name']}: {str(e)}")
            
            logger.info(f"AI cataloging completed: {successful} successful, {failed} failed")
        else:
            logger.info("Skipping AI cataloging of datasets")
            
        logger.info("Dataset organization system initialized successfully")
    finally:
        db.close()

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Initialize the dataset organization system")
    parser.add_argument("--no-ai", action="store_true", help="Skip AI cataloging of datasets")
    args = parser.parse_args()
    
    initialize_organization(use_ai=not args.no_ai)

if __name__ == "__main__":
    main() 
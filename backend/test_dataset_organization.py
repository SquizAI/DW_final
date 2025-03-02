#!/usr/bin/env python
"""
Test Dataset Organization System

This script tests the dataset organization system components.
"""

import os
import sys
import logging
import json
from pathlib import Path

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

def test_bucket_manager():
    """Test the bucket manager component"""
    logger.info("Testing bucket manager...")
    
    # Set up test data directory
    test_data_dir = os.path.join(os.path.dirname(__file__), 'test_data')
    os.makedirs(test_data_dir, exist_ok=True)
    
    # Initialize bucket manager
    bucket_manager = BucketManager(data_dir=test_data_dir)
    
    # Create buckets
    bucket1 = bucket_manager.create_bucket(
        name="Test Bucket 1",
        description="Test bucket for testing"
    )
    logger.info(f"Created bucket: {bucket1['name']} ({bucket1['id']})")
    
    bucket2 = bucket_manager.create_bucket(
        name="Test Bucket 2",
        description="Another test bucket"
    )
    logger.info(f"Created bucket: {bucket2['name']} ({bucket2['id']})")
    
    # Get all buckets
    buckets = bucket_manager.get_all_buckets()
    logger.info(f"Found {len(buckets)} buckets")
    
    # Create test datasets
    dataset1 = {
        "id": "test-dataset-1",
        "name": "Test Dataset 1",
        "description": "Test dataset for testing",
        "file_path": "/path/to/test/dataset1.csv"
    }
    
    dataset2 = {
        "id": "test-dataset-2",
        "name": "Test Dataset 2",
        "description": "Another test dataset",
        "file_path": "/path/to/test/dataset2.csv"
    }
    
    # Add datasets to buckets
    bucket_manager.add_dataset_to_bucket(dataset1["id"], bucket1["id"])
    logger.info(f"Added dataset {dataset1['id']} to bucket {bucket1['id']}")
    
    bucket_manager.add_dataset_to_bucket(dataset2["id"], bucket1["id"])
    logger.info(f"Added dataset {dataset2['id']} to bucket {bucket1['id']}")
    
    bucket_manager.add_dataset_to_bucket(dataset1["id"], bucket2["id"])
    logger.info(f"Added dataset {dataset1['id']} to bucket {bucket2['id']}")
    
    # Get datasets in bucket
    datasets_in_bucket1 = bucket_manager.get_datasets_in_bucket(bucket1["id"])
    logger.info(f"Found {len(datasets_in_bucket1)} datasets in bucket {bucket1['id']}")
    
    # Get buckets for dataset
    buckets_for_dataset1 = bucket_manager.get_buckets_for_dataset(dataset1["id"])
    logger.info(f"Found {len(buckets_for_dataset1)} buckets for dataset {dataset1['id']}")
    
    # Remove dataset from bucket
    bucket_manager.remove_dataset_from_bucket(dataset1["id"], bucket1["id"])
    logger.info(f"Removed dataset {dataset1['id']} from bucket {bucket1['id']}")
    
    # Delete bucket
    bucket_manager.delete_bucket(bucket2["id"])
    logger.info(f"Deleted bucket {bucket2['id']}")
    
    # Clean up
    buckets_dir = os.path.join(test_data_dir, "buckets")
    if os.path.exists(buckets_dir):
        os.remove(os.path.join(buckets_dir, "index.json"))
        os.rmdir(buckets_dir)
    
    logger.info("Bucket manager tests completed successfully")

def test_dataset_indexer():
    """Test the dataset indexer component"""
    logger.info("Testing dataset indexer...")
    
    # Set up test data directory
    test_data_dir = os.path.join(os.path.dirname(__file__), 'test_data')
    os.makedirs(test_data_dir, exist_ok=True)
    
    # Create a test CSV file
    test_csv_path = os.path.join(test_data_dir, "test_dataset.csv")
    with open(test_csv_path, "w") as f:
        f.write("id,name,value\n")
        f.write("1,Item 1,100\n")
        f.write("2,Item 2,200\n")
        f.write("3,Item 3,300\n")
    
    # Initialize dataset indexer
    dataset_indexer = DatasetIndexer(data_dir=test_data_dir)
    
    # Index the test dataset
    indexed_dataset = dataset_indexer.index_dataset(
        file_path=test_csv_path,
        name="Test Dataset",
        description="A test dataset for testing",
        tags=["test", "csv", "example"],
        source="test"
    )
    logger.info(f"Indexed dataset: {indexed_dataset['name']} ({indexed_dataset['id']})")
    
    # Get all datasets
    datasets = dataset_indexer.get_all_datasets()
    logger.info(f"Found {len(datasets)} datasets in index")
    
    # Get dataset by ID
    dataset = dataset_indexer.get_dataset(indexed_dataset["id"])
    logger.info(f"Retrieved dataset: {dataset['name']} ({dataset['id']})")
    
    # Update dataset
    updated_dataset = dataset_indexer.update_dataset(
        dataset_id=indexed_dataset["id"],
        name="Updated Test Dataset",
        description="An updated test dataset",
        tags=["test", "updated", "example"]
    )
    logger.info(f"Updated dataset: {updated_dataset['name']} ({updated_dataset['id']})")
    
    # Search datasets
    search_results = dataset_indexer.search_datasets("updated")
    logger.info(f"Found {len(search_results)} datasets matching search query")
    
    # Get datasets by tag
    tag_results = dataset_indexer.get_datasets_by_tag("updated")
    logger.info(f"Found {len(tag_results)} datasets with tag 'updated'")
    
    # Delete dataset
    dataset_indexer.delete_dataset(indexed_dataset["id"], delete_file=True)
    logger.info(f"Deleted dataset {indexed_dataset['id']}")
    
    # Clean up
    index_dir = os.path.join(test_data_dir, "index")
    if os.path.exists(index_dir):
        os.remove(os.path.join(index_dir, "datasets.json"))
        os.rmdir(index_dir)
    
    logger.info("Dataset indexer tests completed successfully")

def test_ai_cataloger():
    """Test the AI cataloger component"""
    logger.info("Testing AI cataloger...")
    
    # Check if OpenAI API key is available
    if not os.getenv("OPENAI_API_KEY"):
        logger.warning("OpenAI API key not found. Skipping AI cataloger tests.")
        return
    
    # Set up test data directory
    test_data_dir = os.path.join(os.path.dirname(__file__), 'test_data')
    os.makedirs(test_data_dir, exist_ok=True)
    
    # Create a test CSV file
    test_csv_path = os.path.join(test_data_dir, "test_dataset.csv")
    with open(test_csv_path, "w") as f:
        f.write("id,name,age,salary\n")
        f.write("1,John Doe,30,50000\n")
        f.write("2,Jane Smith,25,60000\n")
        f.write("3,Bob Johnson,40,70000\n")
    
    # Initialize AI cataloger
    ai_cataloger = AICataloger(data_dir=test_data_dir)
    
    # Catalog the test dataset
    dataset_id = "test-dataset-ai"
    catalog_result = ai_cataloger.catalog_dataset(
        dataset_id=dataset_id,
        file_path=test_csv_path,
        metadata={
            "name": "Employee Data",
            "description": "Employee information including age and salary"
        }
    )
    logger.info(f"Cataloged dataset: {dataset_id}")
    logger.info(f"Category: {catalog_result['category']}")
    logger.info(f"Tags: {catalog_result['tags']}")
    
    # Get dataset catalog
    catalog = ai_cataloger.get_dataset_catalog(dataset_id)
    logger.info(f"Retrieved catalog for dataset {dataset_id}")
    
    # Update dataset catalog
    updated_catalog = ai_cataloger.update_dataset_catalog(
        dataset_id=dataset_id,
        description="Updated employee information",
        tags=["employees", "hr", "salary"],
        category="Human Resources"
    )
    logger.info(f"Updated catalog for dataset {dataset_id}")
    
    # Remove dataset from catalog
    ai_cataloger.remove_dataset_from_catalog(dataset_id)
    logger.info(f"Removed dataset {dataset_id} from catalog")
    
    # Clean up
    catalog_dir = os.path.join(test_data_dir, "catalog")
    if os.path.exists(catalog_dir):
        os.remove(os.path.join(catalog_dir, "ai_catalog.json"))
        os.rmdir(catalog_dir)
    
    # Remove test CSV file
    if os.path.exists(test_csv_path):
        os.remove(test_csv_path)
    
    logger.info("AI cataloger tests completed successfully")

def main():
    """Run all tests"""
    logger.info("Starting dataset organization system tests...")
    
    # Create test data directory
    test_data_dir = os.path.join(os.path.dirname(__file__), 'test_data')
    os.makedirs(test_data_dir, exist_ok=True)
    
    try:
        # Run tests
        test_bucket_manager()
        test_dataset_indexer()
        test_ai_cataloger()
        
        logger.info("All tests completed successfully")
    finally:
        # Clean up test data directory
        if os.path.exists(test_data_dir):
            import shutil
            shutil.rmtree(test_data_dir)

if __name__ == "__main__":
    main() 
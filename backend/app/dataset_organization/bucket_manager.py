"""
Bucket Manager

This module provides functionality for organizing datasets into a structured bucket system.
Buckets are categories or groups that datasets can be organized into.
"""

import os
import json
import shutil
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class BucketManager:
    """Manages dataset buckets for organization"""
    
    def __init__(self, data_dir: str = None):
        """Initialize the bucket manager
        
        Args:
            data_dir: Base data directory
        """
        self.data_dir = Path(data_dir or os.getenv('DATA_DIR', 'data'))
        self.buckets_dir = self.data_dir / "buckets"
        self.buckets_index_file = self.buckets_dir / "index.json"
        self.datasets_dir = self.data_dir / "datasets"
        
        # Create necessary directories
        self.buckets_dir.mkdir(parents=True, exist_ok=True)
        self.datasets_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize buckets index if it doesn't exist
        if not self.buckets_index_file.exists():
            self._initialize_buckets_index()
    
    def _initialize_buckets_index(self) -> None:
        """Initialize the buckets index file with default buckets"""
        default_buckets = {
            "buckets": [
                {
                    "id": "general",
                    "name": "General",
                    "description": "General purpose datasets",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "datasets": []
                },
                {
                    "id": "kaggle",
                    "name": "Kaggle",
                    "description": "Datasets imported from Kaggle",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "datasets": []
                },
                {
                    "id": "machine_learning",
                    "name": "Machine Learning",
                    "description": "Datasets for machine learning projects",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "datasets": []
                },
                {
                    "id": "visualization",
                    "name": "Visualization",
                    "description": "Datasets for data visualization",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "datasets": []
                },
                {
                    "id": "analysis",
                    "name": "Analysis",
                    "description": "Datasets for data analysis",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "datasets": []
                }
            ],
            "last_updated": datetime.now().isoformat()
        }
        
        with open(self.buckets_index_file, 'w') as f:
            json.dump(default_buckets, f, indent=2)
        
        logger.info(f"Initialized buckets index at {self.buckets_index_file}")
    
    def _load_buckets_index(self) -> Dict[str, Any]:
        """Load the buckets index from file
        
        Returns:
            Dictionary containing bucket information
        """
        if not self.buckets_index_file.exists():
            self._initialize_buckets_index()
        
        with open(self.buckets_index_file, 'r') as f:
            return json.load(f)
    
    def _save_buckets_index(self, index: Dict[str, Any]) -> None:
        """Save the buckets index to file
        
        Args:
            index: Dictionary containing bucket information
        """
        # Update last_updated timestamp
        index["last_updated"] = datetime.now().isoformat()
        
        with open(self.buckets_index_file, 'w') as f:
            json.dump(index, f, indent=2)
    
    def get_all_buckets(self) -> List[Dict[str, Any]]:
        """Get all buckets
        
        Returns:
            List of bucket objects
        """
        index = self._load_buckets_index()
        return index["buckets"]
    
    def get_bucket(self, bucket_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific bucket by ID
        
        Args:
            bucket_id: ID of the bucket to get
            
        Returns:
            Bucket object if found, None otherwise
        """
        buckets = self.get_all_buckets()
        for bucket in buckets:
            if bucket["id"] == bucket_id:
                return bucket
        return None
    
    def create_bucket(self, name: str, description: str = "", bucket_id: str = None) -> Dict[str, Any]:
        """Create a new bucket
        
        Args:
            name: Name of the bucket
            description: Description of the bucket
            bucket_id: Optional ID for the bucket (generated if not provided)
            
        Returns:
            The created bucket object
        """
        # Generate ID if not provided
        if not bucket_id:
            bucket_id = name.lower().replace(" ", "_")
        
        # Check if bucket already exists
        existing_bucket = self.get_bucket(bucket_id)
        if existing_bucket:
            logger.warning(f"Bucket with ID {bucket_id} already exists")
            return existing_bucket
        
        # Create bucket directory
        bucket_dir = self.buckets_dir / bucket_id
        bucket_dir.mkdir(exist_ok=True)
        
        # Create bucket object
        bucket = {
            "id": bucket_id,
            "name": name,
            "description": description,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "datasets": []
        }
        
        # Add to index
        index = self._load_buckets_index()
        index["buckets"].append(bucket)
        self._save_buckets_index(index)
        
        logger.info(f"Created bucket: {name} ({bucket_id})")
        return bucket
    
    def update_bucket(self, bucket_id: str, name: str = None, description: str = None) -> Optional[Dict[str, Any]]:
        """Update a bucket's metadata
        
        Args:
            bucket_id: ID of the bucket to update
            name: New name for the bucket (optional)
            description: New description for the bucket (optional)
            
        Returns:
            Updated bucket object if found, None otherwise
        """
        index = self._load_buckets_index()
        
        for i, bucket in enumerate(index["buckets"]):
            if bucket["id"] == bucket_id:
                if name:
                    bucket["name"] = name
                if description:
                    bucket["description"] = description
                
                bucket["updated_at"] = datetime.now().isoformat()
                index["buckets"][i] = bucket
                self._save_buckets_index(index)
                
                logger.info(f"Updated bucket: {bucket['name']} ({bucket_id})")
                return bucket
        
        logger.warning(f"Bucket with ID {bucket_id} not found")
        return None
    
    def delete_bucket(self, bucket_id: str, force: bool = False) -> bool:
        """Delete a bucket
        
        Args:
            bucket_id: ID of the bucket to delete
            force: If True, delete even if bucket contains datasets
            
        Returns:
            True if bucket was deleted, False otherwise
        """
        # Don't allow deleting default buckets
        if bucket_id in ["general", "kaggle", "machine_learning", "visualization", "analysis"]:
            logger.warning(f"Cannot delete default bucket: {bucket_id}")
            return False
        
        index = self._load_buckets_index()
        
        for i, bucket in enumerate(index["buckets"]):
            if bucket["id"] == bucket_id:
                # Check if bucket contains datasets
                if bucket["datasets"] and not force:
                    logger.warning(f"Bucket {bucket_id} contains datasets. Use force=True to delete anyway.")
                    return False
                
                # Remove from index
                del index["buckets"][i]
                self._save_buckets_index(index)
                
                # Delete bucket directory
                bucket_dir = self.buckets_dir / bucket_id
                if bucket_dir.exists():
                    shutil.rmtree(bucket_dir)
                
                logger.info(f"Deleted bucket: {bucket['name']} ({bucket_id})")
                return True
        
        logger.warning(f"Bucket with ID {bucket_id} not found")
        return False
    
    def add_dataset_to_bucket(self, dataset_id: str, bucket_id: str) -> bool:
        """Add a dataset to a bucket
        
        Args:
            dataset_id: ID of the dataset to add
            bucket_id: ID of the bucket to add the dataset to
            
        Returns:
            True if dataset was added, False otherwise
        """
        index = self._load_buckets_index()
        
        # Find the bucket
        bucket_found = False
        for bucket in index["buckets"]:
            if bucket["id"] == bucket_id:
                # Check if dataset is already in bucket
                if dataset_id in bucket["datasets"]:
                    logger.info(f"Dataset {dataset_id} is already in bucket {bucket_id}")
                    return True
                
                # Add dataset to bucket
                bucket["datasets"].append(dataset_id)
                bucket["updated_at"] = datetime.now().isoformat()
                bucket_found = True
                break
        
        if not bucket_found:
            logger.warning(f"Bucket with ID {bucket_id} not found")
            return False
        
        self._save_buckets_index(index)
        logger.info(f"Added dataset {dataset_id} to bucket {bucket_id}")
        return True
    
    def remove_dataset_from_bucket(self, dataset_id: str, bucket_id: str) -> bool:
        """Remove a dataset from a bucket
        
        Args:
            dataset_id: ID of the dataset to remove
            bucket_id: ID of the bucket to remove the dataset from
            
        Returns:
            True if dataset was removed, False otherwise
        """
        index = self._load_buckets_index()
        
        # Find the bucket
        bucket_found = False
        for bucket in index["buckets"]:
            if bucket["id"] == bucket_id:
                # Check if dataset is in bucket
                if dataset_id not in bucket["datasets"]:
                    logger.info(f"Dataset {dataset_id} is not in bucket {bucket_id}")
                    return False
                
                # Remove dataset from bucket
                bucket["datasets"].remove(dataset_id)
                bucket["updated_at"] = datetime.now().isoformat()
                bucket_found = True
                break
        
        if not bucket_found:
            logger.warning(f"Bucket with ID {bucket_id} not found")
            return False
        
        self._save_buckets_index(index)
        logger.info(f"Removed dataset {dataset_id} from bucket {bucket_id}")
        return True
    
    def get_datasets_in_bucket(self, bucket_id: str) -> List[str]:
        """Get all datasets in a bucket
        
        Args:
            bucket_id: ID of the bucket
            
        Returns:
            List of dataset IDs in the bucket
        """
        bucket = self.get_bucket(bucket_id)
        if not bucket:
            logger.warning(f"Bucket with ID {bucket_id} not found")
            return []
        
        return bucket["datasets"]
    
    def get_buckets_for_dataset(self, dataset_id: str) -> List[Dict[str, Any]]:
        """Get all buckets that contain a dataset
        
        Args:
            dataset_id: ID of the dataset
            
        Returns:
            List of bucket objects that contain the dataset
        """
        buckets = []
        for bucket in self.get_all_buckets():
            if dataset_id in bucket["datasets"]:
                buckets.append(bucket)
        
        return buckets
    
    def organize_existing_datasets(self, datasets: List[Dict[str, Any]]) -> None:
        """Organize existing datasets into appropriate buckets
        
        Args:
            datasets: List of dataset objects
        """
        # Add Kaggle datasets to the Kaggle bucket
        for dataset in datasets:
            dataset_id = dataset["id"]
            
            # Check if dataset is from Kaggle
            if dataset.get("meta_data", {}).get("source") == "kaggle":
                self.add_dataset_to_bucket(dataset_id, "kaggle")
            else:
                # Add to general bucket if not in any bucket yet
                if not self.get_buckets_for_dataset(dataset_id):
                    self.add_dataset_to_bucket(dataset_id, "general")
        
        logger.info(f"Organized {len(datasets)} existing datasets into buckets") 
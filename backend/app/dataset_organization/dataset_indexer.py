"""
Dataset Indexer

This module provides functionality for indexing and organizing datasets,
including metadata extraction and management.
"""

import os
import json
import logging
import shutil
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class DatasetIndexer:
    """Manages dataset indexing and organization"""
    
    def __init__(self, data_dir: str = None):
        """Initialize the dataset indexer
        
        Args:
            data_dir: Base data directory
        """
        self.data_dir = Path(data_dir or os.getenv('DATA_DIR', 'data'))
        self.index_dir = self.data_dir / "index"
        self.index_file = self.index_dir / "datasets.json"
        self.datasets_dir = self.data_dir / "datasets"
        
        # Create necessary directories
        self.index_dir.mkdir(parents=True, exist_ok=True)
        self.datasets_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize index if it doesn't exist
        if not self.index_file.exists():
            self._initialize_index()
    
    def _initialize_index(self) -> None:
        """Initialize the dataset index file"""
        index = {
            "datasets": {},
            "last_updated": datetime.now().isoformat()
        }
        
        with open(self.index_file, 'w') as f:
            json.dump(index, f, indent=2)
        
        logger.info(f"Initialized dataset index at {self.index_file}")
    
    def _load_index(self) -> Dict[str, Any]:
        """Load the dataset index from file
        
        Returns:
            Dictionary containing dataset index information
        """
        if not self.index_file.exists():
            self._initialize_index()
        
        with open(self.index_file, 'r') as f:
            return json.load(f)
    
    def _save_index(self, index: Dict[str, Any]) -> None:
        """Save the dataset index to file
        
        Args:
            index: Dictionary containing dataset index information
        """
        # Update last_updated timestamp
        index["last_updated"] = datetime.now().isoformat()
        
        with open(self.index_file, 'w') as f:
            json.dump(index, f, indent=2)
    
    def _extract_metadata(self, file_path: str) -> Dict[str, Any]:
        """Extract metadata from a dataset file
        
        Args:
            file_path: Path to the dataset file
            
        Returns:
            Dictionary with metadata about the dataset
        """
        file_path = Path(file_path)
        
        # Basic file metadata
        metadata = {
            "file_name": file_path.name,
            "file_extension": file_path.suffix.lower(),
            "file_size": file_path.stat().st_size,
            "created_at": datetime.fromtimestamp(file_path.stat().st_ctime).isoformat(),
            "modified_at": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
        }
        
        # Try to determine file type and extract additional metadata
        if metadata["file_extension"] in ['.csv', '.tsv']:
            metadata["file_type"] = "csv"
            
            # Try to count rows and columns
            try:
                import pandas as pd
                # Read just the header to get column count
                df_header = pd.read_csv(file_path, nrows=0)
                metadata["columns"] = len(df_header.columns)
                
                # Count lines in file for row count (faster than loading into pandas)
                with open(file_path, 'r') as f:
                    metadata["rows"] = sum(1 for _ in f) - 1  # Subtract header row
            except Exception as e:
                logger.warning(f"Error extracting CSV metadata: {str(e)}")
        
        elif metadata["file_extension"] in ['.xlsx', '.xls']:
            metadata["file_type"] = "excel"
            
            # Try to get sheet names and counts
            try:
                import pandas as pd
                xls = pd.ExcelFile(file_path)
                metadata["sheets"] = xls.sheet_names
                metadata["sheet_count"] = len(xls.sheet_names)
            except Exception as e:
                logger.warning(f"Error extracting Excel metadata: {str(e)}")
        
        elif metadata["file_extension"] == '.json':
            metadata["file_type"] = "json"
            
            # Try to determine if it's an array or object
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                if isinstance(data, list):
                    metadata["structure"] = "array"
                    metadata["record_count"] = len(data)
                else:
                    metadata["structure"] = "object"
            except Exception as e:
                logger.warning(f"Error extracting JSON metadata: {str(e)}")
        
        elif metadata["file_extension"] in ['.parquet', '.pq']:
            metadata["file_type"] = "parquet"
            
            # Try to get row and column count
            try:
                import pyarrow.parquet as pq
                parquet_file = pq.ParquetFile(file_path)
                metadata["rows"] = parquet_file.metadata.num_rows
                metadata["columns"] = len(parquet_file.schema.names)
                metadata["column_names"] = parquet_file.schema.names
            except Exception as e:
                logger.warning(f"Error extracting Parquet metadata: {str(e)}")
        
        return metadata
    
    def index_dataset(self, file_path: str, name: str = None, description: str = None, tags: List[str] = None, source: str = None) -> Dict[str, Any]:
        """Index a dataset file
        
        Args:
            file_path: Path to the dataset file
            name: Name for the dataset (defaults to file name)
            description: Description of the dataset
            tags: List of tags for the dataset
            source: Source of the dataset (e.g., "upload", "kaggle")
            
        Returns:
            Dictionary with dataset information
        """
        file_path = Path(file_path)
        
        # Generate a unique ID for the dataset
        dataset_id = str(uuid.uuid4())
        
        # Extract metadata
        metadata = self._extract_metadata(file_path)
        
        # Set name if not provided
        if not name:
            name = metadata["file_name"]
        
        # Create dataset entry
        dataset = {
            "id": dataset_id,
            "name": name,
            "description": description or f"Dataset from {metadata['file_name']}",
            "file_path": str(file_path),
            "tags": tags or [],
            "source": source or "upload",
            "metadata": metadata,
            "indexed_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Add to index
        index = self._load_index()
        index["datasets"][dataset_id] = dataset
        self._save_index(index)
        
        logger.info(f"Indexed dataset: {name} ({dataset_id})")
        return dataset
    
    def get_dataset(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        """Get a dataset by ID
        
        Args:
            dataset_id: ID of the dataset to get
            
        Returns:
            Dataset information if found, None otherwise
        """
        index = self._load_index()
        return index["datasets"].get(dataset_id)
    
    def get_all_datasets(self) -> List[Dict[str, Any]]:
        """Get all indexed datasets
        
        Returns:
            List of dataset information
        """
        index = self._load_index()
        return list(index["datasets"].values())
    
    def update_dataset(self, dataset_id: str, name: str = None, description: str = None, tags: List[str] = None) -> Optional[Dict[str, Any]]:
        """Update dataset information
        
        Args:
            dataset_id: ID of the dataset to update
            name: New name for the dataset (optional)
            description: New description for the dataset (optional)
            tags: New tags for the dataset (optional)
            
        Returns:
            Updated dataset information if found, None otherwise
        """
        index = self._load_index()
        
        if dataset_id not in index["datasets"]:
            logger.warning(f"Dataset {dataset_id} not found in index")
            return None
        
        dataset = index["datasets"][dataset_id]
        
        # Update fields if provided
        if name:
            dataset["name"] = name
        
        if description:
            dataset["description"] = description
        
        if tags:
            dataset["tags"] = tags
        
        # Update timestamp
        dataset["updated_at"] = datetime.now().isoformat()
        
        # Save index
        self._save_index(index)
        
        logger.info(f"Updated dataset: {dataset['name']} ({dataset_id})")
        return dataset
    
    def delete_dataset(self, dataset_id: str, delete_file: bool = False) -> bool:
        """Delete a dataset from the index
        
        Args:
            dataset_id: ID of the dataset to delete
            delete_file: Whether to also delete the dataset file
            
        Returns:
            True if dataset was deleted, False otherwise
        """
        index = self._load_index()
        
        if dataset_id not in index["datasets"]:
            logger.warning(f"Dataset {dataset_id} not found in index")
            return False
        
        dataset = index["datasets"][dataset_id]
        file_path = dataset["file_path"]
        
        # Delete file if requested
        if delete_file and os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"Deleted dataset file: {file_path}")
            except Exception as e:
                logger.error(f"Error deleting dataset file: {str(e)}")
        
        # Remove from index
        del index["datasets"][dataset_id]
        self._save_index(index)
        
        logger.info(f"Deleted dataset from index: {dataset['name']} ({dataset_id})")
        return True
    
    def search_datasets(self, query: str) -> List[Dict[str, Any]]:
        """Search for datasets in the index
        
        Args:
            query: Search query
            
        Returns:
            List of matching dataset information
        """
        index = self._load_index()
        results = []
        
        query = query.lower()
        
        for dataset in index["datasets"].values():
            # Check if query matches name, description, or tags
            if (query in dataset["name"].lower() or
                query in dataset["description"].lower() or
                any(query in tag.lower() for tag in dataset["tags"])):
                results.append(dataset)
        
        return results
    
    def get_datasets_by_tag(self, tag: str) -> List[Dict[str, Any]]:
        """Get all datasets with a specific tag
        
        Args:
            tag: Tag to filter by
            
        Returns:
            List of matching dataset information
        """
        index = self._load_index()
        results = []
        
        for dataset in index["datasets"].values():
            if tag in dataset["tags"]:
                results.append(dataset)
        
        return results
    
    def get_datasets_by_source(self, source: str) -> List[Dict[str, Any]]:
        """Get all datasets from a specific source
        
        Args:
            source: Source to filter by (e.g., "upload", "kaggle")
            
        Returns:
            List of matching dataset information
        """
        index = self._load_index()
        results = []
        
        for dataset in index["datasets"].values():
            if dataset["source"] == source:
                results.append(dataset)
        
        return results
    
    def organize_dataset(self, dataset_id: str, target_dir: str = None) -> Optional[Dict[str, Any]]:
        """Organize a dataset by moving it to a target directory
        
        Args:
            dataset_id: ID of the dataset to organize
            target_dir: Target directory (relative to datasets_dir)
            
        Returns:
            Updated dataset information if successful, None otherwise
        """
        index = self._load_index()
        
        if dataset_id not in index["datasets"]:
            logger.warning(f"Dataset {dataset_id} not found in index")
            return None
        
        dataset = index["datasets"][dataset_id]
        current_path = Path(dataset["file_path"])
        
        # If no target directory specified, use a default based on source
        if not target_dir:
            source = dataset.get("source", "other")
            target_dir = source
        
        # Create target directory
        target_path = self.datasets_dir / target_dir
        target_path.mkdir(parents=True, exist_ok=True)
        
        # Generate target file path
        target_file = target_path / current_path.name
        
        # Move the file
        try:
            # Copy instead of move to avoid permission issues
            shutil.copy2(current_path, target_file)
            
            # Update dataset information
            dataset["file_path"] = str(target_file)
            dataset["updated_at"] = datetime.now().isoformat()
            
            # Save index
            self._save_index(index)
            
            logger.info(f"Organized dataset {dataset['name']} ({dataset_id}) to {target_dir}")
            return dataset
        
        except Exception as e:
            logger.error(f"Error organizing dataset: {str(e)}")
            return None
    
    def index_existing_datasets(self, directory: str = None) -> Dict[str, Any]:
        """Index all datasets in a directory
        
        Args:
            directory: Directory to scan for datasets (defaults to datasets_dir)
            
        Returns:
            Dictionary with results
        """
        if directory:
            scan_dir = Path(directory)
        else:
            scan_dir = self.datasets_dir
        
        results = {
            "total_files": 0,
            "indexed": 0,
            "skipped": 0,
            "errors": 0
        }
        
        # Get list of all files in directory (recursively)
        for root, _, files in os.walk(scan_dir):
            for file in files:
                file_path = os.path.join(root, file)
                
                # Skip non-data files
                file_ext = os.path.splitext(file)[1].lower()
                if file_ext not in ['.csv', '.tsv', '.xlsx', '.xls', '.json', '.parquet', '.pq']:
                    results["skipped"] += 1
                    continue
                
                results["total_files"] += 1
                
                try:
                    # Index the dataset
                    self.index_dataset(file_path)
                    results["indexed"] += 1
                except Exception as e:
                    logger.error(f"Error indexing file {file_path}: {str(e)}")
                    results["errors"] += 1
        
        logger.info(f"Indexed {results['indexed']} datasets, skipped {results['skipped']}, errors {results['errors']}")
        return results 
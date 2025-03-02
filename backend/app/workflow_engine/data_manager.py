"""
Data Manager Module

This module handles data passing between nodes in a workflow.
It provides functionality for data validation, transformation, and caching.
"""

import pandas as pd
import numpy as np
import json
import logging
from typing import Dict, Any, Optional, List, Union
from pathlib import Path
import os
import tempfile
import uuid

from .exceptions import DataValidationError

logger = logging.getLogger(__name__)

class DataManager:
    """
    Manages data passing between nodes in a workflow.
    
    This class handles:
    - Data validation
    - Data transformation
    - Data caching
    - Data persistence
    """
    
    def __init__(self, workflow_id: str, cache_dir: Optional[str] = None):
        """
        Initialize the DataManager.
        
        Args:
            workflow_id: The ID of the workflow
            cache_dir: Directory to use for caching data (optional)
        """
        self.workflow_id = workflow_id
        self.cache_dir = cache_dir or os.path.join(tempfile.gettempdir(), "workflow_cache")
        self.workflow_cache_dir = os.path.join(self.cache_dir, workflow_id)
        self.data_cache = {}  # In-memory cache
        
        # Create cache directory if it doesn't exist
        os.makedirs(self.workflow_cache_dir, exist_ok=True)
        
        logger.info(f"DataManager initialized for workflow {workflow_id}")
        logger.info(f"Cache directory: {self.workflow_cache_dir}")
    
    def store_data(self, node_id: str, data: Any, output_name: str = "default") -> str:
        """
        Store data from a node.
        
        Args:
            node_id: The ID of the node that produced the data
            data: The data to store
            output_name: Name of the output (for nodes with multiple outputs)
            
        Returns:
            data_id: A unique identifier for the stored data
        """
        data_id = f"{node_id}:{output_name}"
        
        # Store in memory for small data
        if self._is_small_data(data):
            self.data_cache[data_id] = data
            logger.debug(f"Data from node {node_id} stored in memory (ID: {data_id})")
            return data_id
        
        # Store on disk for larger data
        file_path = self._get_cache_file_path(data_id)
        self._save_data_to_disk(data, file_path)
        
        # Store reference in memory
        self.data_cache[data_id] = {"_file_reference": str(file_path)}
        
        logger.debug(f"Data from node {node_id} stored on disk (ID: {data_id}, Path: {file_path})")
        return data_id
    
    def get_data(self, data_id: str) -> Any:
        """
        Retrieve data by its ID.
        
        Args:
            data_id: The ID of the data to retrieve
            
        Returns:
            The retrieved data
        """
        if data_id not in self.data_cache:
            raise KeyError(f"Data with ID {data_id} not found in cache")
        
        data = self.data_cache[data_id]
        
        # Check if it's a file reference
        if isinstance(data, dict) and "_file_reference" in data:
            file_path = data["_file_reference"]
            return self._load_data_from_disk(file_path)
        
        return data
    
    def get_node_input_data(self, node_id: str, edges: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Get all input data for a node based on incoming edges.
        
        Args:
            node_id: The ID of the node
            edges: List of edges in the workflow
            
        Returns:
            Dictionary mapping input names to data
        """
        input_data = {}
        
        # Find all edges where this node is the target
        incoming_edges = [edge for edge in edges if edge["target"] == node_id]
        
        for edge in incoming_edges:
            source_node_id = edge["source"]
            source_handle = edge.get("sourceHandle", "default")
            target_handle = edge.get("targetHandle", "default")
            
            # Get data from source node
            data_id = f"{source_node_id}:{source_handle}"
            try:
                data = self.get_data(data_id)
                input_data[target_handle] = data
            except KeyError:
                logger.warning(f"Data not found for edge {source_node_id} -> {node_id}")
        
        return input_data
    
    def validate_data_schema(self, data: Any, expected_schema: Dict[str, Any], node_id: str) -> None:
        """
        Validate that data conforms to an expected schema.
        
        Args:
            data: The data to validate
            expected_schema: The expected schema
            node_id: The ID of the node (for error reporting)
            
        Raises:
            DataValidationError: If validation fails
        """
        validation_errors = []
        
        # Handle pandas DataFrame
        if expected_schema.get("type") == "dataframe":
            if not isinstance(data, pd.DataFrame):
                raise DataValidationError(
                    "Expected DataFrame but got different type",
                    node_id,
                    [f"Expected DataFrame, got {type(data).__name__}"]
                )
            
            # Validate columns if specified
            if "columns" in expected_schema:
                required_columns = expected_schema["columns"]
                missing_columns = [col for col in required_columns if col not in data.columns]
                
                if missing_columns:
                    validation_errors.append(f"Missing required columns: {', '.join(missing_columns)}")
            
            # Validate column types if specified
            if "column_types" in expected_schema:
                for col, expected_type in expected_schema["column_types"].items():
                    if col not in data.columns:
                        continue
                    
                    # Check if column type matches expected type
                    actual_type = data[col].dtype
                    if not self._check_dtype_compatibility(actual_type, expected_type):
                        validation_errors.append(
                            f"Column '{col}' has type {actual_type}, expected {expected_type}"
                        )
        
        # Handle other data types as needed
        # ...
        
        if validation_errors:
            raise DataValidationError(
                "Data validation failed",
                node_id,
                validation_errors
            )
    
    def clear_cache(self, node_ids: Optional[List[str]] = None) -> None:
        """
        Clear cached data.
        
        Args:
            node_ids: List of node IDs to clear (if None, clear all)
        """
        if node_ids is None:
            # Clear all cache
            self.data_cache.clear()
            
            # Remove cache directory
            import shutil
            if os.path.exists(self.workflow_cache_dir):
                shutil.rmtree(self.workflow_cache_dir)
                os.makedirs(self.workflow_cache_dir, exist_ok=True)
            
            logger.info(f"Cleared all cache for workflow {self.workflow_id}")
        else:
            # Clear specific nodes
            for node_id in node_ids:
                keys_to_remove = [k for k in self.data_cache.keys() if k.startswith(f"{node_id}:")]
                
                for key in keys_to_remove:
                    data = self.data_cache[key]
                    if isinstance(data, dict) and "_file_reference" in data:
                        file_path = data["_file_reference"]
                        if os.path.exists(file_path):
                            os.remove(file_path)
                    
                    del self.data_cache[key]
            
            logger.info(f"Cleared cache for nodes {', '.join(node_ids)}")
    
    def _is_small_data(self, data: Any) -> bool:
        """
        Check if data is small enough to store in memory.
        
        Args:
            data: The data to check
            
        Returns:
            True if data is small, False otherwise
        """
        # For pandas DataFrame
        if isinstance(data, pd.DataFrame):
            # Estimate memory usage (in MB)
            memory_usage = data.memory_usage(deep=True).sum() / (1024 * 1024)
            return memory_usage < 10  # Store in memory if less than 10MB
        
        # For numpy arrays
        if isinstance(data, np.ndarray):
            memory_usage = data.nbytes / (1024 * 1024)
            return memory_usage < 10
        
        # For other types, assume small
        return True
    
    def _get_cache_file_path(self, data_id: str) -> Path:
        """
        Get the file path for caching data.
        
        Args:
            data_id: The ID of the data
            
        Returns:
            Path to the cache file
        """
        # Replace any characters that might be invalid in filenames
        safe_id = data_id.replace(":", "_").replace("/", "_")
        return Path(self.workflow_cache_dir) / f"{safe_id}.pkl"
    
    def _save_data_to_disk(self, data: Any, file_path: Path) -> None:
        """
        Save data to disk.
        
        Args:
            data: The data to save
            file_path: Path to save the data to
        """
        # For pandas DataFrame
        if isinstance(data, pd.DataFrame):
            data.to_pickle(file_path)
        
        # For numpy arrays
        elif isinstance(data, np.ndarray):
            np.save(file_path, data)
        
        # For other types
        else:
            import pickle
            with open(file_path, 'wb') as f:
                pickle.dump(data, f)
    
    def _load_data_from_disk(self, file_path: str) -> Any:
        """
        Load data from disk.
        
        Args:
            file_path: Path to load the data from
            
        Returns:
            The loaded data
        """
        path = Path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"Cache file not found: {file_path}")
        
        # Check file extension to determine how to load
        if path.suffix == '.pkl':
            try:
                # Try loading as DataFrame first
                return pd.read_pickle(path)
            except:
                # Fall back to pickle
                import pickle
                with open(path, 'rb') as f:
                    return pickle.load(f)
        
        elif path.suffix == '.npy':
            return np.load(path)
        
        else:
            # Default to pickle
            import pickle
            with open(path, 'rb') as f:
                return pickle.load(f)
    
    def _check_dtype_compatibility(self, actual_dtype, expected_dtype) -> bool:
        """
        Check if a pandas dtype is compatible with an expected type.
        
        Args:
            actual_dtype: The actual dtype
            expected_dtype: The expected dtype
            
        Returns:
            True if compatible, False otherwise
        """
        # Convert to strings for comparison
        actual = str(actual_dtype)
        expected = str(expected_dtype)
        
        # Exact match
        if actual == expected:
            return True
        
        # Check numeric types
        if expected in ['numeric', 'number']:
            return 'int' in actual or 'float' in actual
        
        # Check string types
        if expected in ['string', 'text']:
            return 'object' in actual or 'string' in actual
        
        # Check datetime types
        if expected in ['datetime', 'date']:
            return 'datetime' in actual
        
        return False 
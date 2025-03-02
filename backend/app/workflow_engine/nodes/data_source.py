"""
Data Source Processor Module

This module defines the DataSourceProcessor class for handling data ingestion from various sources.
"""

import logging
import pandas as pd
import numpy as np
import json
import os
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
import sqlite3
import requests
from io import StringIO

from ..node_processor import NodeProcessor
from ..exceptions import NodeExecutionError, DataValidationError
from ..data_manager import DataManager

logger = logging.getLogger(__name__)

class DataSourceProcessor(NodeProcessor):
    """
    Processor for data source nodes.
    
    Handles loading data from various sources:
    - CSV files
    - Excel files
    - JSON files
    - Databases (SQL)
    - APIs
    - Uploaded files
    """
    
    def __init__(self, node_id: str, node_config: Dict[str, Any]):
        """
        Initialize the DataSourceProcessor.
        
        Args:
            node_id: The ID of the node
            node_config: Configuration for the node
        """
        super().__init__(node_id, node_config)
        
        # Extract source type from config
        self.source_type = node_config.get("source_type", "file")
        self.source_path = node_config.get("source_path", "")
        self.file_type = node_config.get("file_type", "csv")
        self.connection_string = node_config.get("connection_string", "")
        self.query = node_config.get("query", "")
        self.api_url = node_config.get("api_url", "")
        self.api_method = node_config.get("api_method", "GET")
        self.api_headers = node_config.get("api_headers", {})
        self.api_params = node_config.get("api_params", {})
        self.api_body = node_config.get("api_body", {})
        self.api_response_format = node_config.get("api_response_format", "json")
        self.api_data_path = node_config.get("api_data_path", "")
        
        # Data processing options
        self.delimiter = node_config.get("delimiter", ",")
        self.encoding = node_config.get("encoding", "utf-8")
        self.sheet_name = node_config.get("sheet_name", 0)
        self.header_row = node_config.get("header_row", 0)
        self.skip_rows = node_config.get("skip_rows", 0)
        self.use_columns = node_config.get("use_columns", None)
        self.dtypes = node_config.get("dtypes", {})
        self.parse_dates = node_config.get("parse_dates", [])
        self.index_col = node_config.get("index_col", None)
        
        # Validation options
        self.validate_schema = node_config.get("validate_schema", False)
        self.expected_schema = node_config.get("expected_schema", {})
        self.validate_data = node_config.get("validate_data", False)
        self.validation_rules = node_config.get("validation_rules", [])
        
    def execute(self, input_data: Dict[str, Any], data_manager: DataManager) -> Dict[str, Any]:
        """
        Execute the data source node.
        
        Args:
            input_data: Dictionary of input data (usually empty for source nodes)
            data_manager: DataManager instance for data handling
            
        Returns:
            Dictionary with loaded data
        """
        self.update_progress(10, "loading data")
        
        try:
            # Load data based on source type
            if self.source_type == "file":
                df = self._load_from_file()
            elif self.source_type == "database":
                df = self._load_from_database()
            elif self.source_type == "api":
                df = self._load_from_api()
            elif self.source_type == "uploaded":
                df = self._load_from_uploaded_file(input_data)
            elif self.source_type == "inline":
                df = self._load_from_inline_data(input_data)
            else:
                raise NodeExecutionError(
                    message=f"Unsupported source type: {self.source_type}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
            
            self.update_progress(70, "data loaded")
            
            # Apply data transformations
            df = self._apply_transformations(df)
            
            self.update_progress(80, "transformations applied")
            
            # Validate data if required
            if self.validate_schema:
                self._validate_schema(df)
            
            if self.validate_data:
                self._validate_data(df)
            
            self.update_progress(90, "validation completed")
            
            # Generate data profile
            profile = self._generate_data_profile(df)
            
            return {
                "default": df,
                "profile": profile
            }
            
        except Exception as e:
            logger.exception(f"Error loading data in node {self.node_id}")
            raise NodeExecutionError(
                message=f"Error loading data: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _load_from_file(self) -> pd.DataFrame:
        """
        Load data from a file.
        
        Returns:
            Pandas DataFrame with loaded data
        """
        if not os.path.exists(self.source_path):
            raise NodeExecutionError(
                message=f"File not found: {self.source_path}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        try:
            if self.file_type.lower() == "csv":
                return pd.read_csv(
                    self.source_path,
                    delimiter=self.delimiter,
                    encoding=self.encoding,
                    header=self.header_row,
                    skiprows=self.skip_rows,
                    usecols=self.use_columns,
                    dtype=self.dtypes,
                    parse_dates=self.parse_dates,
                    index_col=self.index_col
                )
            elif self.file_type.lower() == "excel" or self.file_type.lower() == "xlsx":
                return pd.read_excel(
                    self.source_path,
                    sheet_name=self.sheet_name,
                    header=self.header_row,
                    skiprows=self.skip_rows,
                    usecols=self.use_columns,
                    dtype=self.dtypes,
                    parse_dates=self.parse_dates,
                    index_col=self.index_col
                )
            elif self.file_type.lower() == "json":
                return pd.read_json(
                    self.source_path,
                    encoding=self.encoding,
                    dtype=self.dtypes,
                    convert_dates=self.parse_dates
                )
            else:
                raise NodeExecutionError(
                    message=f"Unsupported file type: {self.file_type}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error reading file: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _load_from_database(self) -> pd.DataFrame:
        """
        Load data from a database.
        
        Returns:
            Pandas DataFrame with loaded data
        """
        try:
            # For SQLite
            if self.connection_string.startswith("sqlite:///"):
                db_path = self.connection_string.replace("sqlite:///", "")
                conn = sqlite3.connect(db_path)
                return pd.read_sql(self.query, conn)
            
            # For other databases, use SQLAlchemy
            return pd.read_sql(self.query, self.connection_string)
            
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error querying database: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _load_from_api(self) -> pd.DataFrame:
        """
        Load data from an API.
        
        Returns:
            Pandas DataFrame with loaded data
        """
        try:
            # Make API request
            if self.api_method.upper() == "GET":
                response = requests.get(
                    self.api_url,
                    headers=self.api_headers,
                    params=self.api_params
                )
            elif self.api_method.upper() == "POST":
                response = requests.post(
                    self.api_url,
                    headers=self.api_headers,
                    params=self.api_params,
                    json=self.api_body
                )
            else:
                raise NodeExecutionError(
                    message=f"Unsupported API method: {self.api_method}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
            
            response.raise_for_status()
            
            # Parse response based on format
            if self.api_response_format.lower() == "json":
                data = response.json()
                
                # Extract data using path if provided
                if self.api_data_path:
                    for key in self.api_data_path.split('.'):
                        if key.isdigit():
                            data = data[int(key)]
                        else:
                            data = data[key]
                
                return pd.DataFrame(data)
                
            elif self.api_response_format.lower() == "csv":
                return pd.read_csv(StringIO(response.text))
                
            else:
                raise NodeExecutionError(
                    message=f"Unsupported API response format: {self.api_response_format}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
                
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error fetching data from API: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _load_from_uploaded_file(self, input_data: Dict[str, Any]) -> pd.DataFrame:
        """
        Load data from an uploaded file.
        
        Args:
            input_data: Dictionary containing uploaded file information
            
        Returns:
            Pandas DataFrame with loaded data
        """
        if "file_path" not in input_data:
            raise NodeExecutionError(
                message="No file path provided in input data",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        file_path = input_data["file_path"]
        file_type = input_data.get("file_type", self.file_type)
        
        # Override source path and file type
        self.source_path = file_path
        self.file_type = file_type
        
        return self._load_from_file()
    
    def _load_from_inline_data(self, input_data: Dict[str, Any]) -> pd.DataFrame:
        """
        Load data from inline data in the input.
        
        Args:
            input_data: Dictionary containing inline data
            
        Returns:
            Pandas DataFrame with loaded data
        """
        if "data" not in input_data:
            raise NodeExecutionError(
                message="No inline data provided in input data",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        data = input_data["data"]
        
        if isinstance(data, pd.DataFrame):
            return data
        elif isinstance(data, list):
            return pd.DataFrame(data)
        elif isinstance(data, dict):
            return pd.DataFrame.from_dict(data)
        else:
            raise NodeExecutionError(
                message=f"Unsupported inline data type: {type(data).__name__}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
    
    def _apply_transformations(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply basic transformations to the loaded data.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Transformed DataFrame
        """
        # Apply column renaming if specified
        column_rename = self.node_config.get("column_rename", {})
        if column_rename:
            df = df.rename(columns=column_rename)
        
        # Apply column type conversions
        column_types = self.node_config.get("column_types", {})
        if column_types:
            for col, dtype in column_types.items():
                if col in df.columns:
                    try:
                        df[col] = df[col].astype(dtype)
                    except Exception as e:
                        logger.warning(f"Error converting column {col} to type {dtype}: {str(e)}")
        
        # Apply column filtering if specified
        columns_to_keep = self.node_config.get("columns_to_keep", None)
        if columns_to_keep:
            df = df[columns_to_keep]
        
        # Apply row filtering if specified
        row_limit = self.node_config.get("row_limit", None)
        if row_limit:
            df = df.head(row_limit)
        
        return df
    
    def _validate_schema(self, df: pd.DataFrame) -> None:
        """
        Validate the DataFrame schema against expected schema.
        
        Args:
            df: DataFrame to validate
            
        Raises:
            DataValidationError: If validation fails
        """
        validation_errors = []
        
        # Check for required columns
        required_columns = self.expected_schema.get("required_columns", [])
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            validation_errors.append(f"Missing required columns: {', '.join(missing_columns)}")
        
        # Check column types
        column_types = self.expected_schema.get("column_types", {})
        for col, expected_type in column_types.items():
            if col in df.columns:
                actual_type = df[col].dtype
                if not self._check_dtype_compatibility(actual_type, expected_type):
                    validation_errors.append(f"Column '{col}' has type {actual_type}, expected {expected_type}")
        
        if validation_errors:
            raise DataValidationError(
                message="Schema validation failed",
                node_id=self.node_id,
                validation_errors=validation_errors,
                node_type=self.__class__.__name__
            )
    
    def _validate_data(self, df: pd.DataFrame) -> None:
        """
        Validate the DataFrame data against validation rules.
        
        Args:
            df: DataFrame to validate
            
        Raises:
            DataValidationError: If validation fails
        """
        validation_errors = []
        
        for rule in self.validation_rules:
            rule_type = rule.get("type", "")
            column = rule.get("column", "")
            
            if column not in df.columns:
                validation_errors.append(f"Validation rule references non-existent column: {column}")
                continue
            
            if rule_type == "no_nulls":
                null_count = df[column].isnull().sum()
                if null_count > 0:
                    validation_errors.append(f"Column '{column}' contains {null_count} null values")
            
            elif rule_type == "unique":
                if not df[column].is_unique:
                    validation_errors.append(f"Column '{column}' contains duplicate values")
            
            elif rule_type == "range":
                min_val = rule.get("min")
                max_val = rule.get("max")
                
                if min_val is not None and df[column].min() < min_val:
                    validation_errors.append(f"Column '{column}' contains values below minimum: {min_val}")
                
                if max_val is not None and df[column].max() > max_val:
                    validation_errors.append(f"Column '{column}' contains values above maximum: {max_val}")
            
            elif rule_type == "regex":
                pattern = rule.get("pattern", "")
                if not all(df[column].astype(str).str.match(pattern)):
                    validation_errors.append(f"Column '{column}' contains values that don't match pattern: {pattern}")
        
        if validation_errors:
            raise DataValidationError(
                message="Data validation failed",
                node_id=self.node_id,
                validation_errors=validation_errors,
                node_type=self.__class__.__name__
            )
    
    def _generate_data_profile(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate a profile of the DataFrame.
        
        Args:
            df: DataFrame to profile
            
        Returns:
            Dictionary with profile information
        """
        profile = {
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": {},
            "memory_usage": df.memory_usage(deep=True).sum(),
            "null_count": df.isnull().sum().sum(),
            "null_percentage": (df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100 if len(df) > 0 and len(df.columns) > 0 else 0
        }
        
        # Generate column profiles
        for column in df.columns:
            col_data = df[column]
            col_profile = {
                "dtype": str(col_data.dtype),
                "null_count": col_data.isnull().sum(),
                "null_percentage": (col_data.isnull().sum() / len(df)) * 100 if len(df) > 0 else 0,
                "unique_count": col_data.nunique()
            }
            
            # Add numeric statistics if applicable
            if pd.api.types.is_numeric_dtype(col_data):
                col_profile.update({
                    "min": col_data.min() if not col_data.isnull().all() else None,
                    "max": col_data.max() if not col_data.isnull().all() else None,
                    "mean": col_data.mean() if not col_data.isnull().all() else None,
                    "median": col_data.median() if not col_data.isnull().all() else None,
                    "std": col_data.std() if not col_data.isnull().all() else None
                })
            
            # Add categorical statistics if applicable
            if pd.api.types.is_object_dtype(col_data) or pd.api.types.is_categorical_dtype(col_data):
                # Get value counts for top 10 values
                value_counts = col_data.value_counts().head(10).to_dict()
                col_profile["top_values"] = value_counts
            
            profile["columns"][column] = col_profile
        
        return profile
    
    def _check_dtype_compatibility(self, actual_dtype, expected_dtype) -> bool:
        """
        Check if a DataFrame column dtype is compatible with an expected dtype.
        
        Args:
            actual_dtype: Actual dtype of the column
            expected_dtype: Expected dtype
            
        Returns:
            True if compatible, False otherwise
        """
        actual_dtype_str = str(actual_dtype).lower()
        expected_dtype_str = str(expected_dtype).lower()
        
        # Check for exact match
        if actual_dtype_str == expected_dtype_str:
            return True
        
        # Check for numeric compatibility
        if expected_dtype_str in ["int", "integer", "int64", "int32"]:
            return "int" in actual_dtype_str or "float" in actual_dtype_str
        
        if expected_dtype_str in ["float", "float64", "float32"]:
            return "float" in actual_dtype_str
        
        # Check for string compatibility
        if expected_dtype_str in ["str", "string", "object"]:
            return "object" in actual_dtype_str or "string" in actual_dtype_str
        
        # Check for datetime compatibility
        if expected_dtype_str in ["datetime", "datetime64"]:
            return "datetime" in actual_dtype_str
        
        return False
    
    def get_required_inputs(self) -> List[str]:
        """
        Get the list of required input names for this node.
        
        Returns:
            List of required input names
        """
        if self.source_type == "uploaded":
            return ["file_path"]
        elif self.source_type == "inline":
            return ["data"]
        return []
    
    def get_expected_outputs(self) -> List[str]:
        """
        Get the list of expected output names for this node.
        
        Returns:
            List of expected output names
        """
        return ["default", "profile"] 
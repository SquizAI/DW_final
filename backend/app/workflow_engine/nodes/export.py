"""
Export Processor Module

This module defines the ExportProcessor class for handling data export operations.
"""

import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union
import json
import os
import csv
import sqlite3
from pathlib import Path
import requests
import base64
from io import BytesIO, StringIO

from ..node_processor import NodeProcessor
from ..exceptions import NodeExecutionError, DataValidationError
from ..data_manager import DataManager

logger = logging.getLogger(__name__)

class ExportProcessor(NodeProcessor):
    """
    Processor for export nodes.
    
    Handles exporting data to various formats:
    - CSV files
    - Excel files
    - JSON files
    - Databases
    - APIs
    - Memory (for downstream nodes)
    """
    
    def __init__(self, node_id: str, node_config: Dict[str, Any]):
        """
        Initialize the ExportProcessor.
        
        Args:
            node_id: The ID of the node
            node_config: Configuration for the node
        """
        super().__init__(node_id, node_config)
        
        # Extract export type from config
        self.export_type = node_config.get("export_type", "csv")
        
        # Common options
        self.output_path = node_config.get("output_path", "")
        self.connection_string = node_config.get("connection_string", "")
        self.table_name = node_config.get("table_name", "")
        self.api_url = node_config.get("api_url", "")
        self.api_method = node_config.get("api_method", "POST")
        self.api_headers = node_config.get("api_headers", {})
        self.api_params = node_config.get("api_params", {})
        
        # CSV options
        self.delimiter = node_config.get("delimiter", ",")
        self.encoding = node_config.get("encoding", "utf-8")
        self.index = node_config.get("index", False)
        self.header = node_config.get("header", True)
        self.quoting = node_config.get("quoting", csv.QUOTE_MINIMAL)
        
        # Excel options
        self.sheet_name = node_config.get("sheet_name", "Sheet1")
        self.excel_engine = node_config.get("excel_engine", "openpyxl")
        
        # JSON options
        self.orient = node_config.get("orient", "records")
        self.date_format = node_config.get("date_format", "iso")
        self.indent = node_config.get("indent", 4)
        
        # Database options
        self.if_exists = node_config.get("if_exists", "fail")
        self.chunksize = node_config.get("chunksize", None)
        
    def execute(self, input_data: Dict[str, Any], data_manager: DataManager) -> Dict[str, Any]:
        """
        Execute the export node.
        
        Args:
            input_data: Dictionary of input data
            data_manager: DataManager instance for data handling
            
        Returns:
            Dictionary with export results
        """
        self.update_progress(10, "starting export")
        
        # Get input dataframe
        if "default" not in input_data:
            raise NodeExecutionError(
                message="No input data provided",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        df = input_data["default"]
        
        if not isinstance(df, pd.DataFrame):
            raise NodeExecutionError(
                message=f"Input data is not a DataFrame: {type(df).__name__}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        self.update_progress(20, "exporting data")
        
        try:
            # Export data based on type
            if self.export_type == "csv":
                result = self._export_to_csv(df)
            elif self.export_type == "excel":
                result = self._export_to_excel(df)
            elif self.export_type == "json":
                result = self._export_to_json(df)
            elif self.export_type == "database":
                result = self._export_to_database(df)
            elif self.export_type == "api":
                result = self._export_to_api(df)
            elif self.export_type == "memory":
                result = self._export_to_memory(df)
            else:
                raise NodeExecutionError(
                    message=f"Unsupported export type: {self.export_type}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
            
            self.update_progress(90, "export completed")
            
            return {
                "default": df,
                "result": result
            }
            
        except Exception as e:
            logger.exception(f"Error exporting data in node {self.node_id}")
            raise NodeExecutionError(
                message=f"Error exporting data: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _export_to_csv(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Export data to a CSV file.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with export results
        """
        if not self.output_path:
            raise NodeExecutionError(
                message="No output path specified for CSV export",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(os.path.abspath(self.output_path)), exist_ok=True)
        
        # Export to CSV
        df.to_csv(
            self.output_path,
            sep=self.delimiter,
            encoding=self.encoding,
            index=self.index,
            header=self.header,
            quoting=self.quoting
        )
        
        # Get file size
        file_size = os.path.getsize(self.output_path)
        
        return {
            "export_type": "csv",
            "output_path": self.output_path,
            "file_size": file_size,
            "row_count": len(df),
            "column_count": len(df.columns)
        }
    
    def _export_to_excel(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Export data to an Excel file.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with export results
        """
        if not self.output_path:
            raise NodeExecutionError(
                message="No output path specified for Excel export",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(os.path.abspath(self.output_path)), exist_ok=True)
        
        # Export to Excel
        df.to_excel(
            self.output_path,
            sheet_name=self.sheet_name,
            index=self.index,
            engine=self.excel_engine
        )
        
        # Get file size
        file_size = os.path.getsize(self.output_path)
        
        return {
            "export_type": "excel",
            "output_path": self.output_path,
            "file_size": file_size,
            "row_count": len(df),
            "column_count": len(df.columns),
            "sheet_name": self.sheet_name
        }
    
    def _export_to_json(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Export data to a JSON file.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with export results
        """
        if not self.output_path:
            raise NodeExecutionError(
                message="No output path specified for JSON export",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(os.path.abspath(self.output_path)), exist_ok=True)
        
        # Export to JSON
        df.to_json(
            self.output_path,
            orient=self.orient,
            date_format=self.date_format,
            indent=self.indent
        )
        
        # Get file size
        file_size = os.path.getsize(self.output_path)
        
        return {
            "export_type": "json",
            "output_path": self.output_path,
            "file_size": file_size,
            "row_count": len(df),
            "column_count": len(df.columns),
            "orient": self.orient
        }
    
    def _export_to_database(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Export data to a database.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with export results
        """
        if not self.connection_string:
            raise NodeExecutionError(
                message="No connection string specified for database export",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        if not self.table_name:
            raise NodeExecutionError(
                message="No table name specified for database export",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Export to database
        if self.connection_string.startswith("sqlite:///"):
            # SQLite connection
            db_path = self.connection_string.replace("sqlite:///", "")
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
            
            conn = sqlite3.connect(db_path)
            df.to_sql(
                self.table_name,
                conn,
                if_exists=self.if_exists,
                index=self.index,
                chunksize=self.chunksize
            )
            conn.close()
            
            # Get file size if it's a file-based database
            file_size = os.path.getsize(db_path) if os.path.exists(db_path) else None
            
        else:
            # Other database connections using SQLAlchemy
            df.to_sql(
                self.table_name,
                self.connection_string,
                if_exists=self.if_exists,
                index=self.index,
                chunksize=self.chunksize
            )
            
            file_size = None
        
        return {
            "export_type": "database",
            "connection_string": self.connection_string,
            "table_name": self.table_name,
            "file_size": file_size,
            "row_count": len(df),
            "column_count": len(df.columns),
            "if_exists": self.if_exists
        }
    
    def _export_to_api(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Export data to an API.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with export results
        """
        if not self.api_url:
            raise NodeExecutionError(
                message="No API URL specified for API export",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Convert DataFrame to JSON
        json_data = df.to_json(orient=self.orient, date_format=self.date_format)
        
        # Make API request
        if self.api_method.upper() == "POST":
            response = requests.post(
                self.api_url,
                headers=self.api_headers,
                params=self.api_params,
                json=json.loads(json_data)
            )
        elif self.api_method.upper() == "PUT":
            response = requests.put(
                self.api_url,
                headers=self.api_headers,
                params=self.api_params,
                json=json.loads(json_data)
            )
        else:
            raise NodeExecutionError(
                message=f"Unsupported API method: {self.api_method}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Check response
        response.raise_for_status()
        
        return {
            "export_type": "api",
            "api_url": self.api_url,
            "api_method": self.api_method,
            "status_code": response.status_code,
            "response": response.text[:1000] if len(response.text) > 1000 else response.text,
            "row_count": len(df),
            "column_count": len(df.columns)
        }
    
    def _export_to_memory(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Export data to memory for downstream nodes.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with export results
        """
        # No actual export needed, just return metadata
        return {
            "export_type": "memory",
            "row_count": len(df),
            "column_count": len(df.columns),
            "memory_usage": df.memory_usage(deep=True).sum()
        }
    
    def get_required_inputs(self) -> List[str]:
        """
        Get the list of required input names for this node.
        
        Returns:
            List of required input names
        """
        return ["default"]
    
    def get_expected_outputs(self) -> List[str]:
        """
        Get the list of expected output names for this node.
        
        Returns:
            List of expected output names
        """
        return ["default", "result"]
    
    def validate_inputs(self, input_data: Dict[str, Any]) -> None:
        """
        Validate the input data for this node.
        
        Args:
            input_data: Dictionary of input data
            
        Raises:
            DataValidationError: If validation fails
        """
        super().validate_inputs(input_data)
        
        # Check that input data is a DataFrame
        if "default" in input_data and not isinstance(input_data["default"], pd.DataFrame):
            raise DataValidationError(
                message=f"Input data is not a DataFrame: {type(input_data['default']).__name__}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) 
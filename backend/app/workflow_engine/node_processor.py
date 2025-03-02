"""
Node Processor Module

This module defines the NodeProcessor class and NodeProcessorFactory for processing
different types of workflow nodes.
"""

import logging
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Callable, Type, Union
import pandas as pd
import numpy as np
from pydantic import BaseModel, ValidationError

from .exceptions import NodeExecutionError, NodeConfigurationError, DataValidationError
from .data_manager import DataManager

logger = logging.getLogger(__name__)

class NodeProcessor(ABC):
    """
    Abstract base class for node processors.
    
    Each node type in the workflow should have a corresponding NodeProcessor
    implementation that handles its specific processing logic.
    """
    
    def __init__(self, node_id: str, node_config: Dict[str, Any]):
        """
        Initialize the NodeProcessor.
        
        Args:
            node_id: The ID of the node
            node_config: Configuration for the node
        """
        self.node_id = node_id
        self.node_config = node_config
        self.progress_callback = None
        self.status = "initialized"
        self.progress = 0
        self.result = None
        self.error = None
        
    def set_progress_callback(self, callback: Callable[[str, float, Dict[str, Any]], None]) -> None:
        """
        Set a callback function to report progress.
        
        Args:
            callback: Function that takes node_id, progress (0-100), and status info
        """
        self.progress_callback = callback
        
    def update_progress(self, progress: float, status: str = None, details: Dict[str, Any] = None) -> None:
        """
        Update the progress of node execution.
        
        Args:
            progress: Progress value (0-100)
            status: Status message
            details: Additional details about the progress
        """
        self.progress = progress
        if status:
            self.status = status
            
        if self.progress_callback:
            self.progress_callback(
                self.node_id, 
                progress, 
                {"status": self.status, **(details or {})}
            )
        
    def process(self, input_data: Dict[str, Any], data_manager: DataManager) -> Dict[str, Any]:
        """
        Process the node with the given input data.
        
        Args:
            input_data: Dictionary of input data
            data_manager: DataManager instance for data handling
            
        Returns:
            Dictionary of output data
        """
        try:
            self.status = "running"
            self.update_progress(0, "starting")
            
            # Validate input data
            self.validate_inputs(input_data)
            self.update_progress(10, "inputs validated")
            
            # Execute node-specific processing
            start_time = time.time()
            output_data = self.execute(input_data, data_manager)
            execution_time = time.time() - start_time
            
            # Validate output data
            self.validate_outputs(output_data)
            
            self.status = "completed"
            self.update_progress(100, "completed", {
                "execution_time": execution_time,
                "output_summary": self.summarize_output(output_data)
            })
            
            self.result = output_data
            return output_data
            
        except Exception as e:
            self.status = "error"
            self.error = str(e)
            
            if isinstance(e, (NodeExecutionError, NodeConfigurationError, DataValidationError)):
                logger.error(f"Node execution error: {e}")
                raise
            else:
                logger.exception(f"Unexpected error in node {self.node_id}")
                raise NodeExecutionError(
                    message=f"Error executing node: {str(e)}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__,
                    details={"exception_type": type(e).__name__}
                ) from e
    
    @abstractmethod
    def execute(self, input_data: Dict[str, Any], data_manager: DataManager) -> Dict[str, Any]:
        """
        Execute the node's specific processing logic.
        
        Args:
            input_data: Dictionary of input data
            data_manager: DataManager instance for data handling
            
        Returns:
            Dictionary of output data
        """
        pass
    
    def validate_inputs(self, input_data: Dict[str, Any]) -> None:
        """
        Validate the input data for this node.
        
        Args:
            input_data: Dictionary of input data
            
        Raises:
            DataValidationError: If validation fails
        """
        # Default implementation - override in subclasses for specific validation
        required_inputs = self.get_required_inputs()
        missing_inputs = [input_name for input_name in required_inputs if input_name not in input_data]
        
        if missing_inputs:
            raise DataValidationError(
                message=f"Missing required inputs: {', '.join(missing_inputs)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
    
    def validate_outputs(self, output_data: Dict[str, Any]) -> None:
        """
        Validate the output data from this node.
        
        Args:
            output_data: Dictionary of output data
            
        Raises:
            DataValidationError: If validation fails
        """
        # Default implementation - override in subclasses for specific validation
        expected_outputs = self.get_expected_outputs()
        missing_outputs = [output_name for output_name in expected_outputs if output_name not in output_data]
        
        if missing_outputs:
            raise DataValidationError(
                message=f"Missing expected outputs: {', '.join(missing_outputs)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
    
    def get_required_inputs(self) -> List[str]:
        """
        Get the list of required input names for this node.
        
        Returns:
            List of required input names
        """
        # Default implementation - override in subclasses
        return []
    
    def get_expected_outputs(self) -> List[str]:
        """
        Get the list of expected output names for this node.
        
        Returns:
            List of expected output names
        """
        # Default implementation - override in subclasses
        return ["default"]
    
    def summarize_output(self, output_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a summary of the output data.
        
        Args:
            output_data: Dictionary of output data
            
        Returns:
            Dictionary with summary information
        """
        # Default implementation - override in subclasses for specific summaries
        summary = {}
        
        for key, value in output_data.items():
            if isinstance(value, pd.DataFrame):
                summary[key] = {
                    "type": "dataframe",
                    "shape": value.shape,
                    "columns": list(value.columns),
                }
            elif isinstance(value, np.ndarray):
                summary[key] = {
                    "type": "ndarray",
                    "shape": value.shape,
                    "dtype": str(value.dtype),
                }
            else:
                summary[key] = {
                    "type": type(value).__name__
                }
                
        return summary


class NodeProcessorFactory:
    """
    Factory for creating NodeProcessor instances based on node type.
    """
    
    _processors: Dict[str, Type[NodeProcessor]] = {}
    
    @classmethod
    def register(cls, node_type: str, processor_class: Type[NodeProcessor]) -> None:
        """
        Register a NodeProcessor class for a specific node type.
        
        Args:
            node_type: The type of node
            processor_class: The NodeProcessor class to use for this node type
        """
        cls._processors[node_type] = processor_class
        logger.debug(f"Registered processor {processor_class.__name__} for node type {node_type}")
    
    @classmethod
    def create(cls, node_type: str, node_id: str, node_config: Dict[str, Any]) -> NodeProcessor:
        """
        Create a NodeProcessor instance for the given node type.
        
        Args:
            node_type: The type of node
            node_id: The ID of the node
            node_config: Configuration for the node
            
        Returns:
            NodeProcessor instance
            
        Raises:
            NodeConfigurationError: If no processor is registered for the node type
        """
        if node_type not in cls._processors:
            raise NodeConfigurationError(
                message=f"No processor registered for node type: {node_type}",
                node_id=node_id
            )
        
        processor_class = cls._processors[node_type]
        return processor_class(node_id, node_config)


# Import and register specific node processors
from .nodes import (
    DataSourceProcessor,
    DataTransformationProcessor,
    AnalysisProcessor,
    VisualizationProcessor,
    ExportProcessor
)

# Register node processors
NodeProcessorFactory.register("data_source", DataSourceProcessor)
NodeProcessorFactory.register("data_transformation", DataTransformationProcessor)
NodeProcessorFactory.register("analysis", AnalysisProcessor)
NodeProcessorFactory.register("visualization", VisualizationProcessor)
NodeProcessorFactory.register("export", ExportProcessor) 
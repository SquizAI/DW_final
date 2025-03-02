"""
Workflow Engine Module

This module provides the core functionality for executing data processing workflows.
It includes components for node processing, workflow execution, and data passing between nodes.
"""

from .executor import WorkflowExecutor
from .node_processor import NodeProcessor, NodeProcessorFactory
from .data_manager import DataManager
from .exceptions import WorkflowExecutionError, NodeExecutionError

__all__ = [
    'WorkflowExecutor',
    'NodeProcessor',
    'NodeProcessorFactory',
    'DataManager',
    'WorkflowExecutionError',
    'NodeExecutionError'
] 
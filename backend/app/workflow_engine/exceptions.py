"""
Workflow Engine Exceptions

This module defines exceptions specific to the workflow engine.
"""

class WorkflowExecutionError(Exception):
    """Exception raised for errors during workflow execution."""
    
    def __init__(self, message, workflow_id=None, node_id=None, details=None):
        self.message = message
        self.workflow_id = workflow_id
        self.node_id = node_id
        self.details = details or {}
        super().__init__(self.message)
    
    def __str__(self):
        error_msg = self.message
        if self.workflow_id:
            error_msg += f" (Workflow ID: {self.workflow_id})"
        if self.node_id:
            error_msg += f" (Node ID: {self.node_id})"
        return error_msg


class NodeExecutionError(WorkflowExecutionError):
    """Exception raised for errors during node execution."""
    
    def __init__(self, message, node_id, node_type=None, workflow_id=None, details=None):
        self.node_type = node_type
        super().__init__(message, workflow_id, node_id, details)
    
    def __str__(self):
        error_msg = super().__str__()
        if self.node_type:
            error_msg += f" (Node Type: {self.node_type})"
        return error_msg


class DataValidationError(NodeExecutionError):
    """Exception raised for data validation errors."""
    
    def __init__(self, message, node_id, validation_errors=None, node_type=None, workflow_id=None):
        details = {"validation_errors": validation_errors or []}
        super().__init__(message, node_id, node_type, workflow_id, details)


class NodeConfigurationError(NodeExecutionError):
    """Exception raised for node configuration errors."""
    
    def __init__(self, message, node_id, config_errors=None, node_type=None, workflow_id=None):
        details = {"config_errors": config_errors or []}
        super().__init__(message, node_id, node_type, workflow_id, details) 
# Data Whisperer Workflow Feature

This directory contains the workflow builder feature of the Data Whisperer application, which allows users to create, edit, and execute data processing workflows.

## Directory Structure

- **WorkflowContext.tsx**: Context provider for workflow state management
- **WorkflowPageNew.tsx**: Main workflow builder interface
- **DataSourceManager.tsx**: Component for managing data sources
- **components/**: UI components used in the workflow builder
  - **analytics/**: Components for workflow analytics and metrics
  - **canvas/**: Components for the workflow canvas (ReactFlow integration)
  - **config/**: Components for node configuration
  - **data/**: Components for data preview and manipulation
  - **execution/**: Components for workflow execution
  - **header/**: Header components for the workflow interface
  - **lineage/**: Components for data lineage visualization
  - **modals/**: Modal dialogs used in the workflow interface
  - **sidebar/**: Sidebar components for node selection
- **nodes/**: Node type definitions and implementations
- **utils/**: Utility functions for workflow operations
- **old/**: Legacy components (see old/README.md for details)

## Key Components

- **WorkflowPageNew**: The main workflow builder interface
- **WorkflowCanvas**: The canvas where nodes are placed and connected
- **WorkflowSidebar**: The sidebar for selecting and adding nodes
- **NodeConfigPanel**: Panel for configuring selected nodes
- **NodePreview**: Component for previewing node execution results

## State Management

The workflow state is managed through the WorkflowContext provider, which includes:

- Nodes and edges in the workflow
- Selected node information
- Workflow metadata (name, description)
- Execution state and progress

## Usage

The workflow feature is accessible at the `/workflow` route in the application. It can be used standalone or embedded in other pages. 
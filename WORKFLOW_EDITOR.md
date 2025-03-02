# Workflow Editor Documentation

## Overview

The Workflow Editor is a powerful visual interface for creating, editing, and executing data processing workflows. It provides a drag-and-drop interface for connecting various data processing nodes to create complex data transformation pipelines.

## Architecture

The Workflow Editor is built using React and TypeScript, with the following key components:

### Frontend Structure

```
frontend/src/features/workflow/
├── WorkflowContext.tsx       # Context provider for workflow state management
├── WorkflowPageNew.tsx       # Main workflow editor page component
├── nodes/                    # Node type definitions and components
│   ├── index.ts              # Node type registry
│   ├── types.ts              # TypeScript interfaces for node data
│   ├── DatasetLoaderNode.tsx # Dataset loader node component
│   ├── StructuralAnalysisNode.tsx
│   ├── QualityCheckerNode.tsx
│   └── ... (other node components)
├── components/               # UI components for the workflow editor
│   ├── canvas/               # Canvas-related components
│   ├── sidebar/              # Sidebar components for node selection
│   ├── header/               # Header components
│   ├── config/               # Node configuration components
│   ├── execution/            # Workflow execution components
│   └── ... (other component categories)
└── utils/                    # Utility functions
    └── nodeUtils.ts          # Node-related utility functions
```

### Backend Structure

```
backend/app/
├── api/
│   └── workflows/
│       └── router.py         # API endpoints for workflows
├── workflow_engine/          # Workflow execution engine
│   ├── nodes/                # Node implementations
│   └── node_processor.py     # Node processing logic
└── models/                   # Database models
    └── workflow.py           # Workflow data model
```

## Node Types

The Workflow Editor supports the following node types:

1. **Dataset Loader** (`datasetLoader`): Loads data from various sources (files, databases, APIs)
2. **Structural Analysis** (`structuralAnalysis`): Analyzes the structure of the data
3. **Quality Checker** (`qualityChecker`): Checks data quality and identifies issues
4. **Data Merger** (`dataMerger`): Merges multiple datasets
5. **Data Binning** (`dataBinning`): Bins continuous data into discrete categories
6. **Lambda Function** (`lambdaFunction`): Executes custom code on the data
7. **Feature Engineer** (`featureEngineer`): Creates and transforms features
8. **EDA Analysis** (`edaAnalysis`): Performs exploratory data analysis
9. **Feature Importance** (`featureImportance`): Calculates feature importance scores
10. **Binary Classifier** (`binaryClassifier`): Trains a binary classification model
11. **Report Generator** (`reportGenerator`): Generates reports from workflow results

## State Management

The workflow state is managed using React Context through the `WorkflowContext.tsx` provider, which includes:

- Nodes and edges in the workflow
- Selected node for configuration
- Workflow metadata (name, description, ID)
- Execution state (progress, status)

## User Interface

The Workflow Editor UI consists of:

1. **Header**: Contains workflow name, save button, and other controls
2. **Sidebar**: Provides access to available nodes organized by category
3. **Canvas**: The main area where nodes are placed and connected
4. **Configuration Panel**: Displays configuration options for the selected node
5. **Execution Panel**: Shows execution status and results

## Workflow Execution

Workflows are executed by:

1. Validating the workflow structure
2. Topologically sorting nodes to determine execution order
3. Executing each node in sequence, passing data between connected nodes
4. Updating the UI with execution progress and results

## Data Persistence

Workflows are persisted in a PostgreSQL database using SQLAlchemy ORM, with the following models:

- **Workflow**: Stores workflow metadata
- **WorkflowNode**: Stores node data and position
- **WorkflowEdge**: Stores connections between nodes

## AI Integration

The Workflow Editor includes AI capabilities:

1. **AI Assistant**: Provides suggestions for workflow improvements
2. **Template Generation**: Generates workflow templates based on data and goals
3. **Node Configuration**: Suggests optimal configurations for nodes

## Future Enhancements

Planned enhancements for the Workflow Editor include:

1. **Real-time Collaboration**: Allow multiple users to edit workflows simultaneously
2. **Version Control**: Track changes to workflows over time
3. **Advanced Execution**: Support for distributed execution of workflows
4. **Custom Node Creation**: Allow users to create custom node types
5. **Workflow Marketplace**: Share and discover workflow templates 
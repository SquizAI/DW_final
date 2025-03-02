# Data Whisperer Workflow Documentation

## Summary

This documentation provides a comprehensive overview of the Data Whisperer workflow editor, its components, and functionality. The workflow editor has been redesigned as a standalone experience that allows users to create, edit, and execute data processing workflows through an intuitive drag-and-drop interface.

Key improvements in the latest version:
- Standalone full-screen experience without the main navigation
- Enhanced header with workflow controls (Add Data, Save, Execute, etc.)
- Improved sidebar with detailed node information and "Add to Workflow" functionality
- Fixed canvas with proper node selection and display
- Integration with application-wide data sources
- Comprehensive documentation of all components and node types

Note: The original WorkflowPage and WorkflowComparisonPage components have been moved to the old folder for reference.

## Layout and Navigation Issues

### Understanding the Layout Structure

The Data Whisperer application uses a nested layout structure:

1. **ProtectedLayout** - The main application layout that includes:
   - Main header with app navigation
   - Main sidebar with application-wide navigation
   - Content area where page components are rendered

2. **WorkflowPageNew** - The new workflow editor component that:
   - Implements its own full-screen layout
   - Has its own header with workflow-specific controls
   - Includes a workflow-specific sidebar
   - Renders the workflow canvas in the main area

### Layout Conflict Resolution

The issue with the workflow editor showing both the main application header/sidebar and its own header/sidebar was caused by the routing configuration. The WorkflowPageNew component was being rendered inside the ProtectedLayout, causing both layouts to be visible simultaneously.

To resolve this issue:
1. The original WorkflowPage component was moved to `frontend/src/features/workflow/old/` for reference
2. The router configuration was updated to ensure WorkflowPageNew is used for all workflow routes
3. The WorkflowPageNew component was designed to take over the entire viewport using fixed positioning:
   ```css
   {
     position: 'fixed',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     zIndex: 1000
   }
   ```
   This positioning ensures the workflow editor appears above the main application layout.
4. The WorkflowPageNew component includes its own navigation controls to return to the dashboard.
5. The workflow routes were moved outside of the ProtectedLayout in the router configuration, making them truly standalone pages while still maintaining authentication protection.

### Current Implementation

The current implementation uses a clean approach:
- The WorkflowPageNew component is rendered as a standalone page outside of the ProtectedLayout
- Authentication is still enforced using the AuthGuard component
- The workflow editor has its own header, sidebar, and navigation controls
- The user can navigate back to the main application using the "Back to Dashboard" button
- This approach provides a focused, distraction-free editing experience while maintaining security

## Overview

The Data Whisperer workflow editor is a visual interface for creating, editing, and executing data processing workflows. It provides a drag-and-drop interface for connecting various data processing nodes to create complex data transformation pipelines.

## Architecture

### Components Structure

```
frontend/src/features/workflow/
├── WorkflowContext.tsx       # Context provider for workflow state management
├── WorkflowPageNew.tsx       # New standalone workflow editor page
├── components/               # UI components for the workflow editor
│   ├── canvas/               # Canvas-related components
│   │   └── WorkflowCanvas.tsx # Main canvas component for node rendering
│   ├── sidebar/              # Sidebar components for node selection
│   │   └── WorkflowSidebar.tsx # Main sidebar component for node selection
│   ├── header/               # Header components
│   ├── config/               # Node configuration components
│   │   └── NodeConfigPanel.tsx # Panel for configuring selected nodes
│   ├── execution/            # Workflow execution components
│   ├── ai/                   # AI assistant components
│   ├── lineage/              # Data lineage components
│   └── modals/               # Modal dialogs
├── nodes/                    # Node type definitions and implementations
│   ├── index.ts              # Node type registry
│   ├── types.ts              # TypeScript interfaces for node data
│   ├── DatasetLoaderNode.tsx # Dataset loader node component
│   ├── StructuralAnalysisNode.tsx
│   ├── QualityCheckerNode.tsx
│   └── ... (other node components)
└── utils/                    # Utility functions
    └── nodeUtils.ts          # Node-related utility functions
```

### State Management

The workflow state is managed using React Context through the `WorkflowContext.tsx` provider, which includes:

- Nodes and edges in the workflow
- Selected node for configuration
- Workflow metadata (name, description, ID)
- Execution state (progress, status)

## Key Components

### WorkflowPageNew

The main container component for the workflow editor. It provides a standalone experience with:

- Custom header with workflow controls
- Sidebar for node selection
- Canvas for node placement and connection
- Configuration panel for selected nodes
- Execution panel for workflow execution

### WorkflowSidebar

The sidebar component displays available nodes organized by category:

- Data Sources: Nodes for loading and importing data
- Transformation: Nodes for transforming and preparing data
- Analysis: Nodes for analyzing and extracting insights
- Export: Nodes for exporting and reporting results

Features:
- Search functionality to find nodes
- Category filtering
- Favorites system
- Detailed node information panel
- "Add to Workflow" button to add nodes to the canvas

### WorkflowCanvas

The canvas component renders the workflow nodes and connections:

- Uses ReactFlow for node rendering and connection management
- Supports node selection, dragging, and connecting
- Provides zoom and pan controls
- Shows tooltips for nodes
- Handles node selection for configuration

### NodeConfigPanel

The configuration panel for the selected node:

- Displays node-specific configuration options
- Updates node data when configuration changes
- Shows input/output information
- Provides validation feedback

## Node Types

### Data Sources

#### Dataset Loader
- **Type**: `datasetLoader`
- **Description**: Loads data from various sources including files, databases, and APIs
- **Inputs**: None
- **Outputs**: Dataset
- **Configuration**:
  - Source Type (file, database, API)
  - File Type (CSV, JSON, etc.)
  - Has Header (boolean)

#### Structural Analysis
- **Type**: `structuralAnalysis`
- **Description**: Analyzes the structure of the data, including data types, missing values, and patterns
- **Inputs**: Dataset
- **Outputs**: Analysis Results
- **Configuration**:
  - Analyze Data Types (boolean)
  - Detect Missing Values (boolean)
  - Analyze Unique Values (boolean)

#### Quality Checker
- **Type**: `qualityChecker`
- **Description**: Checks data quality and identifies issues
- **Inputs**: Dataset
- **Outputs**: Quality Report
- **Configuration**:
  - Check Missing Values (boolean)
  - Check Outliers (boolean)
  - Check Duplicates (boolean)

#### Data Merger
- **Type**: `dataMerger`
- **Description**: Merges multiple datasets
- **Inputs**: Two Datasets
- **Outputs**: Merged Dataset
- **Configuration**:
  - Merge Type (inner, left, right, outer)
  - Join Key (column name)

### Transformation

#### Data Binning
- **Type**: `dataBinning`
- **Description**: Bins continuous data into categories
- **Inputs**: Dataset
- **Outputs**: Binned Dataset
- **Configuration**:
  - Binning Method (equal_width, equal_frequency, kmeans, custom)
  - Number of Bins (number)
  - Target Column (string)

#### Lambda Function
- **Type**: `lambdaFunction`
- **Description**: Apply custom code to transform data
- **Inputs**: Dataset
- **Outputs**: Transformed Dataset
- **Configuration**:
  - Language (python, javascript, sql)
  - Code (string)

#### Feature Engineer
- **Type**: `featureEngineer`
- **Description**: Create new features from existing data
- **Inputs**: Dataset
- **Outputs**: Dataset with New Features
- **Configuration**:
  - Operations (array)

### Analysis

#### EDA Analysis
- **Type**: `edaAnalysis`
- **Description**: Exploratory data analysis
- **Inputs**: Dataset
- **Outputs**: Analysis Results
- **Configuration**:
  - Univariate Analysis (boolean)
  - Bivariate Analysis (boolean)
  - Correlation Analysis (boolean)
  - Sample Size (number)

#### Feature Importance
- **Type**: `featureImportance`
- **Description**: Analyze feature importance
- **Inputs**: Dataset
- **Outputs**: Importance Scores
- **Configuration**:
  - Method (random_forest, permutation, shap)
  - Target Column (string)

#### Binary Classifier
- **Type**: `binaryClassifier`
- **Description**: Train a binary classification model
- **Inputs**: Dataset
- **Outputs**: Trained Model
- **Configuration**:
  - Model Type (logistic_regression, random_forest, svm, xgboost)
  - Target Column (string)
  - Test Size (number)

### Export

#### Report Generator
- **Type**: `reportGenerator`
- **Description**: Generate comprehensive reports
- **Inputs**: Dataset
- **Outputs**: Report
- **Configuration**:
  - Report Format (html, pdf, markdown, json)
  - Include Visualizations (boolean)
  - Include Data Samples (boolean)
  - Include Code Snippets (boolean)

## Workflow Execution

The workflow execution process:

1. Validate the workflow structure
2. Topologically sort nodes to determine execution order
3. Execute each node in sequence
4. Pass data between connected nodes
5. Update UI with execution progress and results

## Known Issues and Fixes

### Fixed Issues

- WorkflowPage component import issue in router.tsx (fixed by updating import statement)
- ReactFlow container sizing issues (fixed by adding proper CSS styles)
- Sidebar drag-and-drop functionality (fixed by implementing custom drag-and-drop solution)
- Workflow sidebar node configuration (fixed by implementing detailed node configuration panel)
- Workflow page layout conflicts with main navigation (fixed by making it a standalone page)

### Current Issues

- Multiple backend instances causing "Address already in use" errors
- Console warnings about Emotion React loading
- Node configuration functionality needs implementation
- Data source integration with application-wide data sources

## Development Notes

- The workflow editor is designed to be a standalone page without the main navigation
- The sidebar should display all available node types and allow adding them to the canvas
- The canvas should support drag-and-drop, node selection, and connection
- The configuration panel should display node-specific options
- The header should provide workflow-level controls (save, execute, etc.)
- A comparison page is available at `/test/workflow` to view both the original WorkflowPage and the new WorkflowPageNew side by side

## Recent Changes

- Updated WorkflowPageNew to be a standalone page without main navigation
- Enhanced header with more functionality (Add Data, Save, Execute, etc.)
- Fixed WorkflowSidebar to properly add nodes to the canvas
- Updated WorkflowCanvas to handle node selection and display
- Added DataSourceManager modal for adding data sources
- Created WorkflowComparisonPage at `/test/workflow` to compare both workflow implementations
- Created comprehensive documentation for workflow components and functionality
- Moved original WorkflowPage to `frontend/src/features/workflow/old/` for reference
- Fixed layout conflict between main application layout and workflow editor by using fixed positioning
- Updated router to import WorkflowPage from the old folder location
- Fixed import paths in the moved WorkflowPage component to maintain functionality
- Moved WorkflowComparisonPage to old folder and removed from router
- Made workflow page a truly standalone page by moving routes outside of ProtectedLayout

## Next Steps

- Implement node configuration functionality
- Connect to application-wide data sources
- Enhance node visualization and feedback
- Implement workflow templates gallery
- Add automated data quality scoring 
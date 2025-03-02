# Workflow Node Types

This document provides detailed information about the node types available in the Data Whisperer workflow editor.

## Overview

The workflow editor supports various node types for data processing, analysis, and visualization. Each node type has specific inputs, outputs, and configuration options.

## Node Categories

Nodes are organized into the following categories:

1. **Data Sources**: Nodes for loading and importing data
2. **Data Preparation**: Nodes for cleaning and transforming data
3. **Analysis**: Nodes for analyzing data
4. **Visualization**: Nodes for creating visualizations
5. **Machine Learning**: Nodes for training and evaluating models
6. **Output**: Nodes for exporting and reporting results

## Node Types

### Data Sources

#### Dataset Loader

**Type ID**: `datasetLoader`

**Description**: Loads data from various sources including files, databases, and APIs.

**Configuration Options**:
- Source Type: File, Database, or API
- Location: Path or connection string
- Format: CSV, JSON, Parquet, etc.
- Credentials: Authentication details (if required)

**Outputs**:
- Data: The loaded dataset
- Metadata: Information about the dataset

**Example Usage**:
```json
{
  "type": "datasetLoader",
  "source": {
    "type": "file",
    "location": "/path/to/data.csv",
    "format": "csv"
  }
}
```

### Data Preparation

#### Structural Analysis

**Type ID**: `structuralAnalysis`

**Description**: Analyzes the structure of the data, including data types, missing values, and patterns.

**Inputs**:
- Data: The dataset to analyze

**Outputs**:
- Analysis: Structural analysis results
- Report: Summary of findings

**Example Usage**:
```json
{
  "type": "structuralAnalysis"
}
```

#### Quality Checker

**Type ID**: `qualityChecker`

**Description**: Checks data quality and identifies issues such as missing values, outliers, and inconsistencies.

**Inputs**:
- Data: The dataset to check

**Configuration Options**:
- Checks: Types of quality checks to perform
- Thresholds: Thresholds for quality metrics

**Outputs**:
- Quality Score: Overall data quality score
- Issues: Identified quality issues
- Recommendations: Suggestions for improving data quality

**Example Usage**:
```json
{
  "type": "qualityChecker",
  "quality": {
    "checks": ["missing", "outliers", "duplicates"]
  }
}
```

#### Data Merger

**Type ID**: `dataMerger`

**Description**: Merges multiple datasets based on common keys.

**Inputs**:
- Primary Data: The primary dataset
- Secondary Data: The secondary dataset(s)

**Configuration Options**:
- Merge Type: Inner, Left, Right, or Outer
- Keys: Columns to use as merge keys
- Conflict Resolution: How to handle conflicting values

**Outputs**:
- Merged Data: The merged dataset
- Merge Statistics: Information about the merge operation

**Example Usage**:
```json
{
  "type": "dataMerger",
  "merge": {
    "type": "inner",
    "keys": ["id", "date"]
  }
}
```

#### Data Binning

**Type ID**: `dataBinning`

**Description**: Bins continuous data into discrete categories.

**Inputs**:
- Data: The dataset to bin

**Configuration Options**:
- Method: Equal Width, Equal Frequency, or Custom
- Bins: Number of bins or custom bin edges
- Columns: Columns to bin

**Outputs**:
- Binned Data: The dataset with binned columns
- Bin Statistics: Information about the binning operation

**Example Usage**:
```json
{
  "type": "dataBinning",
  "binning": {
    "method": "equal_width",
    "bins": 10,
    "columns": ["age", "income"]
  }
}
```

#### Lambda Function

**Type ID**: `lambdaFunction`

**Description**: Executes custom code on the data.

**Inputs**:
- Data: The dataset to process

**Configuration Options**:
- Code: Custom code to execute
- Language: Python, R, or SQL
- Parameters: Parameters for the code

**Outputs**:
- Processed Data: The processed dataset
- Execution Results: Results of the code execution

**Example Usage**:
```json
{
  "type": "lambdaFunction",
  "function": {
    "code": "def process(df):\n    return df.dropna()",
    "language": "python"
  }
}
```

#### Feature Engineer

**Type ID**: `featureEngineer`

**Description**: Creates and transforms features for machine learning.

**Inputs**:
- Data: The dataset to engineer features for

**Configuration Options**:
- New Features: Features to create
- Transformations: Transformations to apply
- Encoding: Encoding methods for categorical features
- Scaling: Scaling methods for numerical features

**Outputs**:
- Engineered Data: The dataset with engineered features
- Feature Metadata: Information about the engineered features

**Example Usage**:
```json
{
  "type": "featureEngineer",
  "features": {
    "new": ["age_squared", "income_log"],
    "encoded": {
      "category": "one_hot"
    },
    "scaled": {
      "age": { "min": 0, "max": 1 }
    }
  }
}
```

### Analysis

#### EDA Analysis

**Type ID**: `edaAnalysis`

**Description**: Performs exploratory data analysis.

**Inputs**:
- Data: The dataset to analyze

**Configuration Options**:
- Analysis Types: Types of analysis to perform
- Variables: Variables to include in the analysis

**Outputs**:
- Analysis Results: Results of the analysis
- Visualizations: Generated visualizations
- Insights: Discovered insights

**Example Usage**:
```json
{
  "type": "edaAnalysis",
  "analysis": {
    "univariate": true,
    "bivariate": true,
    "correlations": true
  }
}
```

#### Feature Importance

**Type ID**: `featureImportance`

**Description**: Calculates feature importance scores.

**Inputs**:
- Data: The dataset with features
- Target: The target variable

**Configuration Options**:
- Methods: Methods for calculating importance
- Parameters: Parameters for the methods

**Outputs**:
- Importance Scores: Feature importance scores
- Rankings: Ranked features by importance
- Visualizations: Importance visualizations

**Example Usage**:
```json
{
  "type": "featureImportance",
  "importance": {
    "methods": {
      "permutation": true,
      "shap": true
    }
  }
}
```

### Machine Learning

#### Binary Classifier

**Type ID**: `binaryClassifier`

**Description**: Trains a binary classification model.

**Inputs**:
- Data: The training dataset
- Features: The feature columns
- Target: The target column

**Configuration Options**:
- Model Type: Logistic Regression, Random Forest, etc.
- Parameters: Model parameters
- Evaluation: Evaluation metrics

**Outputs**:
- Model: The trained model
- Performance: Model performance metrics
- Predictions: Predictions on the data

**Example Usage**:
```json
{
  "type": "binaryClassifier",
  "model": {
    "type": "logistic_regression",
    "params": {
      "C": 1.0,
      "penalty": "l2"
    }
  }
}
```

### Output

#### Report Generator

**Type ID**: `reportGenerator`

**Description**: Generates reports from workflow results.

**Inputs**:
- Data: The dataset to report on
- Analysis: Analysis results
- Models: Trained models

**Configuration Options**:
- Sections: Report sections
- Format: HTML, PDF, or Notebook
- Styling: Report styling options

**Outputs**:
- Report: The generated report
- Export Files: Exported report files

**Example Usage**:
```json
{
  "type": "reportGenerator",
  "report": {
    "sections": [
      { "title": "Data Overview", "type": "text" },
      { "title": "Data Quality", "type": "table" },
      { "title": "Feature Importance", "type": "plot" }
    ],
    "format": "html"
  }
}
```

## Node Connections

Nodes can be connected to create a workflow. Each node has input and output ports that can be connected to other nodes. The data flows from one node to another through these connections.

## Node State

Each node has a state that indicates its current status:

- **Idle**: The node is waiting for input or execution
- **Learning**: The node is analyzing the data
- **Working**: The node is processing the data
- **Completed**: The node has completed its processing
- **Error**: The node encountered an error during processing

## Node Validation

Nodes validate their inputs and configuration before execution. If validation fails, the node will enter an error state and provide information about the validation errors. 
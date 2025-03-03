# Data Whisperer Workflow Nodes

This document provides a comprehensive guide to the node types available in the Data Whisperer workflow editor, including their configurations, capabilities, and integration with the FastAPI backend.

## Node Architecture

Each node in the Data Whisperer workflow follows a consistent architecture that enables seamless integration between the frontend and backend:

### Frontend Components

- **React Component**: A React component that renders the node in the workflow canvas
- **Configuration Panel**: A form interface for setting node parameters
- **Preview Component**: A visualization of the node's output
- **Style Definitions**: Visual styling based on node type and state

### Backend Components

- **FastAPI Endpoint**: An API endpoint that processes the node's operation
- **Data Processor**: Python code that executes the node's functionality
- **Validation Logic**: Rules that validate the node's configuration
- **Caching Mechanism**: System for storing intermediate results

### Data Flow

1. User configures a node in the frontend
2. Configuration is sent to the backend via API
3. Backend processes the data according to the configuration
4. Results are returned to the frontend
5. Frontend displays the results and passes them to connected nodes

## Node Categories

### Data Source Nodes

Nodes for loading data from various sources.

#### Dataset Loader

**Purpose**: Load datasets from various sources including files, databases, and APIs.

**Configuration Options**:
- **Source Type**: File, Database, API, or Kaggle
- **File Format**: CSV, JSON, Excel, Parquet
- **Connection Details**: Database credentials or API keys
- **Query/Filter**: SQL query or filter criteria

**Backend Integration**:
- **Endpoint**: `POST /api/data/load`
- **Processing**: Reads data from the specified source
- **Output**: Dataset with schema information and statistics

**Example Usage**:
```json
{
  "type": "datasetLoader",
  "config": {
    "sourceType": "file",
    "format": "csv",
    "path": "data/sales.csv",
    "hasHeader": true
  }
}
```

#### Database Connector

**Purpose**: Connect to databases and execute SQL queries.

**Configuration Options**:
- **Database Type**: PostgreSQL, MySQL, SQLite, etc.
- **Connection String**: Database connection details
- **Query**: SQL query to execute
- **Authentication**: Username/password or key-based

**Backend Integration**:
- **Endpoint**: `POST /api/data/query`
- **Processing**: Executes SQL query against the database
- **Output**: Query results as a dataset

**Example Usage**:
```json
{
  "type": "databaseConnector",
  "config": {
    "dbType": "postgresql",
    "connectionString": "postgresql://user:password@localhost:5432/mydatabase",
    "query": "SELECT * FROM sales WHERE region = 'North'"
  }
}
```

#### API Data Fetcher

**Purpose**: Retrieve data from REST or GraphQL APIs.

**Configuration Options**:
- **API Type**: REST or GraphQL
- **Endpoint URL**: API endpoint
- **Method**: GET, POST, PUT, DELETE
- **Headers**: Custom HTTP headers
- **Body/Query**: Request payload or query parameters
- **Authentication**: API key, OAuth, or Basic Auth

**Backend Integration**:
- **Endpoint**: `POST /api/data/fetch-api`
- **Processing**: Makes API requests and processes responses
- **Output**: API response data as a structured dataset

**Example Usage**:
```json
{
  "type": "apiDataFetcher",
  "config": {
    "apiType": "rest",
    "url": "https://api.example.com/data",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer ${API_KEY}"
    }
  }
}
```

### Data Transformation Nodes

Nodes for cleaning, transforming, and preparing data.

#### Structural Analysis

**Purpose**: Analyze the structure of a dataset and provide statistics.

**Configuration Options**:
- **Analysis Level**: Basic, Detailed, or Comprehensive
- **Include Nulls**: Whether to include null values in analysis
- **Sample Size**: Number of rows to analyze (0 for all)

**Backend Integration**:
- **Endpoint**: `POST /api/data/analyze`
- **Processing**: Analyzes dataset structure and generates statistics
- **Output**: Dataset statistics including data types, missing values, and distributions

**Example Usage**:
```json
{
  "type": "structuralAnalysis",
  "config": {
    "analysisLevel": "detailed",
    "includeNulls": true,
    "sampleSize": 1000
  }
}
```

#### Quality Checker

**Purpose**: Identify and fix data quality issues.

**Configuration Options**:
- **Check Types**: Missing values, outliers, duplicates, type inconsistencies
- **Threshold**: Tolerance level for issues
- **Auto Fix**: Whether to automatically fix issues
- **Fix Strategy**: Strategy for handling each issue type

**Backend Integration**:
- **Endpoint**: `POST /api/data/quality-check`
- **Processing**: Identifies quality issues and applies fixes
- **Output**: Cleaned dataset and quality report

**Example Usage**:
```json
{
  "type": "qualityChecker",
  "config": {
    "checkTypes": ["missing", "outliers", "duplicates"],
    "threshold": 0.05,
    "autoFix": true,
    "fixStrategy": {
      "missing": "mean",
      "outliers": "clip",
      "duplicates": "remove"
    }
  }
}
```

#### Data Merger

**Purpose**: Combine multiple datasets.

**Configuration Options**:
- **Merge Type**: Join, Union, or Concatenate
- **Join Keys**: Columns to join on
- **Join Type**: Inner, Left, Right, or Full
- **Conflict Resolution**: How to handle conflicting columns

**Backend Integration**:
- **Endpoint**: `POST /api/data/merge`
- **Processing**: Combines datasets according to specified method
- **Output**: Merged dataset

**Example Usage**:
```json
{
  "type": "dataMerger",
  "config": {
    "mergeType": "join",
    "joinKeys": ["customer_id"],
    "joinType": "left",
    "conflictResolution": "suffix"
  }
}
```

#### Data Binning

**Purpose**: Group continuous data into discrete bins.

**Configuration Options**:
- **Target Column**: Column to bin
- **Bin Method**: Equal width, equal frequency, or custom
- **Bin Count**: Number of bins
- **Custom Bins**: Custom bin boundaries
- **Labels**: Custom labels for bins

**Backend Integration**:
- **Endpoint**: `POST /api/data/bin`
- **Processing**: Creates bins from continuous data
- **Output**: Dataset with binned column added

**Example Usage**:
```json
{
  "type": "dataBinning",
  "config": {
    "targetColumn": "age",
    "binMethod": "equal_width",
    "binCount": 5,
    "labels": ["Very Young", "Young", "Middle", "Senior", "Elderly"]
  }
}
```

#### Lambda Function

**Purpose**: Apply custom transformations using code.

**Configuration Options**:
- **Language**: Python or JavaScript
- **Function Code**: Custom code to execute
- **Input Columns**: Columns to use as input
- **Output Column**: Column to store the result

**Backend Integration**:
- **Endpoint**: `POST /api/data/lambda`
- **Processing**: Executes custom code in a sandboxed environment
- **Output**: Dataset with transformed data

**Example Usage**:
```json
{
  "type": "lambdaFunction",
  "config": {
    "language": "python",
    "code": "def transform(row):\n    return row['price'] * (1 + row['tax_rate'])",
    "inputColumns": ["price", "tax_rate"],
    "outputColumn": "total_price"
  }
}
```

#### Feature Engineer

**Purpose**: Create new features from existing data.

**Configuration Options**:
- **Feature Type**: Interaction, Polynomial, Aggregate, or Time-based
- **Source Columns**: Columns to use as input
- **Operation**: Mathematical operation to apply
- **Output Column**: Name for the new feature

**Backend Integration**:
- **Endpoint**: `POST /api/data/feature-engineer`
- **Processing**: Creates new features based on existing data
- **Output**: Dataset with new features added

**Example Usage**:
```json
{
  "type": "featureEngineer",
  "config": {
    "featureType": "interaction",
    "sourceColumns": ["height", "width"],
    "operation": "multiply",
    "outputColumn": "area"
  }
}
```

### Analysis Nodes

Nodes for analyzing and visualizing data.

#### EDA Analysis

**Purpose**: Perform exploratory data analysis.

**Configuration Options**:
- **Analysis Type**: Univariate, Bivariate, or Multivariate
- **Target Columns**: Columns to analyze
- **Visualization Types**: Histogram, scatter plot, box plot, etc.
- **Statistics**: Mean, median, standard deviation, etc.

**Backend Integration**:
- **Endpoint**: `POST /api/analysis/eda`
- **Processing**: Generates statistical analysis and visualizations
- **Output**: Analysis results and visualization data

**Example Usage**:
```json
{
  "type": "edaAnalysis",
  "config": {
    "analysisType": "bivariate",
    "targetColumns": ["income", "education"],
    "visualizationTypes": ["scatter", "heatmap"],
    "statistics": ["correlation", "covariance"]
  }
}
```

#### Feature Importance

**Purpose**: Determine the importance of features for a target variable.

**Configuration Options**:
- **Target Column**: Column to predict
- **Feature Columns**: Columns to evaluate
- **Method**: Correlation, mutual information, or model-based
- **Model Type**: Random Forest, XGBoost, etc. (for model-based)

**Backend Integration**:
- **Endpoint**: `POST /api/analysis/feature-importance`
- **Processing**: Calculates feature importance scores
- **Output**: Feature importance rankings and visualizations

**Example Usage**:
```json
{
  "type": "featureImportance",
  "config": {
    "targetColumn": "sales",
    "featureColumns": ["price", "promotion", "season", "location"],
    "method": "model_based",
    "modelType": "random_forest"
  }
}
```

#### Binary Classifier

**Purpose**: Train a binary classification model.

**Configuration Options**:
- **Target Column**: Column to predict
- **Feature Columns**: Columns to use as features
- **Model Type**: Logistic Regression, Random Forest, etc.
- **Hyperparameters**: Model-specific parameters
- **Validation Method**: Cross-validation, train-test split, etc.
- **Metrics**: Accuracy, precision, recall, F1, etc.

**Backend Integration**:
- **Endpoint**: `POST /api/analysis/binary-classifier`
- **Processing**: Trains and evaluates a binary classification model
- **Output**: Trained model, performance metrics, and predictions

**Example Usage**:
```json
{
  "type": "binaryClassifier",
  "config": {
    "targetColumn": "churn",
    "featureColumns": ["usage", "tenure", "plan_type", "support_calls"],
    "modelType": "random_forest",
    "hyperparameters": {
      "n_estimators": 100,
      "max_depth": 10
    },
    "validationMethod": "cross_validation",
    "metrics": ["accuracy", "precision", "recall", "f1"]
  }
}
```

### Export Nodes

Nodes for exporting and reporting results.

#### Report Generator

**Purpose**: Create reports from analysis results.

**Configuration Options**:
- **Report Type**: PDF, HTML, or Markdown
- **Sections**: Analysis sections to include
- **Visualizations**: Charts and graphs to include
- **Template**: Report template to use
- **Branding**: Logo and color scheme

**Backend Integration**:
- **Endpoint**: `POST /api/export/report`
- **Processing**: Generates a formatted report
- **Output**: Report file in the specified format

**Example Usage**:
```json
{
  "type": "reportGenerator",
  "config": {
    "reportType": "pdf",
    "sections": ["summary", "data_quality", "analysis", "recommendations"],
    "visualizations": ["feature_importance", "correlation_matrix"],
    "template": "executive_summary",
    "branding": {
      "logo": "company_logo.png",
      "primaryColor": "#0066cc"
    }
  }
}
```

#### Data Exporter

**Purpose**: Export data to various formats and destinations.

**Configuration Options**:
- **Export Format**: CSV, JSON, Excel, Parquet, etc.
- **Destination**: File system, database, cloud storage, etc.
- **Path/Connection**: Destination path or connection details
- **Compression**: None, gzip, zip, etc.
- **Partitioning**: Column to partition by (if applicable)

**Backend Integration**:
- **Endpoint**: `POST /api/export/data`
- **Processing**: Exports data to the specified destination
- **Output**: Export status and location information

**Example Usage**:
```json
{
  "type": "dataExporter",
  "config": {
    "exportFormat": "parquet",
    "destination": "s3",
    "path": "s3://my-bucket/exports/",
    "compression": "gzip",
    "partitioning": "date"
  }
}
```

## Node Execution

### Execution Flow

When a node is executed, the following process occurs:

1. **Validation**: The node's configuration is validated against its schema
2. **Input Collection**: Data is collected from connected input nodes
3. **Processing**: The node's operation is performed on the input data
4. **Output Generation**: Results are formatted and made available to downstream nodes
5. **Caching**: Results are cached for future use if caching is enabled

### Execution Modes

Nodes can be executed in different modes:

- **Preview Mode**: Executes on a sample of the data to provide quick feedback
- **Full Mode**: Executes on the complete dataset
- **Debug Mode**: Provides detailed logging and intermediate results
- **Batch Mode**: Processes data in batches for large datasets

### Error Handling

When errors occur during node execution:

1. **Error Detection**: The system identifies the error type and location
2. **Error Classification**: Errors are classified as configuration, data, or system errors
3. **Error Reporting**: Detailed error information is provided to the user
4. **Recovery Options**: Suggestions for resolving the error are provided

## Node Development

### Creating Custom Nodes

Data Whisperer supports the development of custom nodes:

1. **Frontend Component**: Create a React component that extends the base node class
2. **Configuration Schema**: Define the configuration options using JSON Schema
3. **Backend Processor**: Implement the processing logic in Python
4. **Registration**: Register the node with the system

### Node Testing

Custom nodes should be tested thoroughly:

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test interaction with other nodes
3. **Performance Tests**: Test with various data sizes
4. **UI Tests**: Test the node's user interface

## Best Practices

### Node Configuration

- **Use descriptive names**: Choose clear names for nodes and outputs
- **Set appropriate defaults**: Provide sensible default values
- **Include validation**: Define validation rules for configuration options
- **Add help text**: Provide guidance for each configuration option

### Node Performance

- **Optimize for large data**: Design nodes to handle large datasets efficiently
- **Use incremental processing**: Process data in chunks when possible
- **Implement caching**: Cache results to avoid redundant computation
- **Monitor resource usage**: Track memory and CPU usage during execution

### Node Integration

- **Follow the schema**: Adhere to the input/output schema for compatibility
- **Handle errors gracefully**: Provide clear error messages and recovery options
- **Document dependencies**: Specify required libraries and versions
- **Support versioning**: Maintain backward compatibility when updating nodes

## Related Documentation

- [Workflow Editor](./WORKFLOW_EDITOR.md): Guide to using the workflow editor
- [API Reference](./API_REFERENCE.md): Details of the backend API endpoints
- [Custom Node Development](./CUSTOM_NODE_DEVELOPMENT.md): Guide to creating custom nodes 
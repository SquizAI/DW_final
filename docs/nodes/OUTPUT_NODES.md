# Output Nodes

Output nodes are responsible for exporting, saving, and presenting the results of your workflow. These nodes serve as the final step in the data processing pipeline, transforming insights into actionable formats.

## Available Output Nodes

### Report Generator

**Type ID**: `reportGenerator`

**Description**: Creates comprehensive reports from workflow results.

**Frontend Component**: `ReportGeneratorNode.tsx`

**Backend Processor**: `ReportGeneratorProcessor.py`

**Inputs**:
- **Data**: Dataset(s) to include in the report
- **Visualizations**: Visualizations to include in the report
- **Analysis Results**: Results from analysis nodes

**Configuration Options**:
- **Report Format**:
  - PDF
  - HTML
  - Word Document
  - Markdown
  - Jupyter Notebook
- **Template**: Report template to use
- **Sections**: Sections to include in the report
- **Styling**: Styling options for the report
- **Metadata**: Report metadata (title, author, date, etc.)

**Outputs**:
- **Report**: The generated report
- **Export URL**: URL to access the report
- **Notification**: Notification about report generation

**Example Configuration**:
```json
{
  "type": "reportGenerator",
  "format": {
    "type": "pdf",
    "options": {
      "pageSize": "letter",
      "orientation": "portrait",
      "margins": {
        "top": 1,
        "right": 1,
        "bottom": 1,
        "left": 1
      },
      "headerFooter": true
    }
  },
  "template": {
    "id": "data_analysis_report",
    "customCss": null
  },
  "content": {
    "title": "Data Analysis Report",
    "subtitle": "Insights and Findings",
    "author": "Data Whisperer",
    "date": "auto",
    "logo": "https://example.com/logo.png",
    "sections": [
      {
        "id": "executive_summary",
        "title": "Executive Summary",
        "content": "This report provides an analysis of the dataset...",
        "level": 1
      },
      {
        "id": "data_overview",
        "title": "Data Overview",
        "content": "The dataset contains {row_count} rows and {column_count} columns...",
        "level": 1,
        "includeDataSummary": true
      },
      {
        "id": "visualizations",
        "title": "Key Visualizations",
        "content": "The following visualizations highlight important patterns in the data...",
        "level": 1,
        "visualizations": ["viz_1", "viz_2", "viz_3"]
      },
      {
        "id": "findings",
        "title": "Key Findings",
        "content": "Based on the analysis, we have identified the following insights...",
        "level": 1,
        "includeAnalysisResults": true
      },
      {
        "id": "recommendations",
        "title": "Recommendations",
        "content": "Based on the findings, we recommend the following actions...",
        "level": 1
      },
      {
        "id": "appendix",
        "title": "Appendix",
        "content": "Additional details and methodology...",
        "level": 1,
        "includeMethodology": true
      }
    ]
  },
  "styling": {
    "theme": "professional",
    "colors": {
      "primary": "#1f77b4",
      "secondary": "#ff7f0e",
      "text": "#333333",
      "background": "#ffffff",
      "accent": "#2ca02c"
    },
    "fonts": {
      "title": "Roboto, sans-serif",
      "body": "Open Sans, sans-serif",
      "code": "Consolas, monospace"
    }
  },
  "distribution": {
    "email": {
      "enabled": false,
      "recipients": [],
      "subject": "Data Analysis Report"
    },
    "save": {
      "enabled": true,
      "location": "reports/",
      "filename": "data_analysis_report_{date}"
    }
  }
}
```

### Data Exporter

**Type ID**: `dataExporter`

**Description**: Exports data to various file formats and destinations.

**Frontend Component**: `DataExporterNode.tsx`

**Backend Processor**: `DataExporterProcessor.py`

**Inputs**:
- **Data**: Dataset to export

**Configuration Options**:
- **Format**:
  - CSV
  - Excel
  - JSON
  - Parquet
  - SQL
  - Avro
- **Destination**:
  - Local File
  - Cloud Storage (S3, GCS, Azure)
  - Database
  - API Endpoint
- **Options**:
  - Compression
  - Encoding
  - Partitioning
  - Schema

**Outputs**:
- **Export Status**: Status of the export operation
- **Export Location**: Location of the exported data
- **Export Metadata**: Metadata about the exported data

**Example Configuration**:
```json
{
  "type": "dataExporter",
  "format": {
    "type": "csv",
    "options": {
      "delimiter": ",",
      "quoteChar": "\"",
      "escapeChar": "\\",
      "header": true,
      "index": false,
      "dateFormat": "YYYY-MM-DD",
      "encoding": "utf-8"
    }
  },
  "destination": {
    "type": "s3",
    "options": {
      "bucket": "data-exports",
      "path": "projects/project-123/exports/",
      "filename": "data_export_{timestamp}.csv",
      "credentials": {
        "type": "iam_role",
        "role": "arn:aws:iam::123456789012:role/export-role"
      }
    }
  },
  "data": {
    "columns": ["id", "name", "value", "category", "date"],
    "filter": {
      "enabled": true,
      "conditions": [
        {
          "column": "value",
          "operator": ">",
          "value": 100
        }
      ]
    },
    "sort": {
      "enabled": true,
      "columns": [
        {
          "name": "date",
          "direction": "descending"
        }
      ]
    },
    "limit": 10000
  },
  "options": {
    "compression": {
      "enabled": true,
      "type": "gzip"
    },
    "partitioning": {
      "enabled": false,
      "columns": ["date"],
      "maxRowsPerFile": 1000000
    },
    "overwrite": true,
    "includeMetadata": true
  }
}
```

### Database Writer

**Type ID**: `databaseWriter`

**Description**: Writes data to a database table.

**Frontend Component**: `DatabaseWriterNode.tsx`

**Backend Processor**: `DatabaseWriterProcessor.py`

**Inputs**:
- **Data**: Dataset to write to the database

**Configuration Options**:
- **Connection**:
  - Database Type
  - Connection Details
  - Authentication
- **Table**:
  - Table Name
  - Schema
  - Create Table
  - Append/Replace
- **Options**:
  - Batch Size
  - Commit Interval
  - Error Handling

**Outputs**:
- **Write Status**: Status of the write operation
- **Row Count**: Number of rows written
- **Error Log**: Log of any errors encountered

**Example Configuration**:
```json
{
  "type": "databaseWriter",
  "connection": {
    "type": "postgresql",
    "host": "db.example.com",
    "port": 5432,
    "database": "analytics",
    "schema": "public",
    "authentication": {
      "type": "username_password",
      "username": "writer_user",
      "passwordSecretId": "db-password-456"
    },
    "ssl": {
      "enabled": true,
      "mode": "require"
    }
  },
  "table": {
    "name": "processed_data",
    "createIfNotExists": true,
    "schema": {
      "id": "INTEGER PRIMARY KEY",
      "name": "VARCHAR(255)",
      "value": "NUMERIC(10,2)",
      "category": "VARCHAR(100)",
      "processed_date": "TIMESTAMP",
      "is_valid": "BOOLEAN"
    },
    "writeMode": "append",
    "indexColumns": ["id", "category"]
  },
  "options": {
    "batchSize": 1000,
    "commitInterval": 5000,
    "errorHandling": {
      "onError": "continue",
      "maxErrors": 100,
      "logErrors": true
    },
    "preWriteSQL": "TRUNCATE TABLE temp_processed_data;",
    "postWriteSQL": "UPDATE stats SET last_update = NOW() WHERE table_name = 'processed_data';"
  }
}
```

### API Publisher

**Type ID**: `apiPublisher`

**Description**: Publishes data to an API endpoint.

**Frontend Component**: `ApiPublisherNode.tsx`

**Backend Processor**: `ApiPublisherProcessor.py`

**Inputs**:
- **Data**: Dataset to publish to the API

**Configuration Options**:
- **Endpoint**: API endpoint details
- **Method**: HTTP method (POST, PUT, PATCH)
- **Authentication**: API authentication details
- **Payload Format**: Format of the API payload
- **Batch Options**: Options for batch publishing

**Outputs**:
- **Publish Status**: Status of the publish operation
- **Response Data**: Data returned from the API
- **Error Log**: Log of any errors encountered

**Example Configuration**:
```json
{
  "type": "apiPublisher",
  "endpoint": {
    "url": "https://api.example.com/v1/data",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "DataWhisperer/1.0"
    }
  },
  "authentication": {
    "type": "oauth2",
    "tokenUrl": "https://auth.example.com/oauth/token",
    "clientId": "client-123",
    "clientSecretId": "api-client-secret-789",
    "scope": "data:write"
  },
  "payload": {
    "format": "json",
    "rootKey": "items",
    "dateFormat": "ISO8601",
    "nullHandling": "include",
    "transformations": [
      {
        "column": "name",
        "newName": "fullName"
      },
      {
        "column": "value",
        "newName": "amount",
        "format": "{:.2f}"
      }
    ]
  },
  "batchOptions": {
    "enabled": true,
    "size": 100,
    "concurrency": 5,
    "retryOptions": {
      "maxRetries": 3,
      "initialDelay": 1000,
      "backoffFactor": 2,
      "maxDelay": 10000
    }
  },
  "responseHandling": {
    "successPath": "$.status",
    "successValue": "success",
    "idPath": "$.id",
    "errorPath": "$.error.message",
    "saveResponses": true
  }
}
```

### Notification Sender

**Type ID**: `notificationSender`

**Description**: Sends notifications about workflow results.

**Frontend Component**: `NotificationSenderNode.tsx`

**Backend Processor**: `NotificationSenderProcessor.py`

**Inputs**:
- **Data**: Data to include in the notification
- **Workflow Status**: Status of the workflow

**Configuration Options**:
- **Channel**:
  - Email
  - Slack
  - Microsoft Teams
  - Webhook
  - SMS
- **Recipients**: Recipients of the notification
- **Message**: Message template
- **Attachments**: Files to attach
- **Conditions**: Conditions for sending notifications

**Outputs**:
- **Send Status**: Status of the notification send operation
- **Delivery Status**: Status of notification delivery
- **Error Log**: Log of any errors encountered

**Example Configuration**:
```json
{
  "type": "notificationSender",
  "channel": {
    "type": "email",
    "service": {
      "type": "smtp",
      "host": "smtp.example.com",
      "port": 587,
      "security": "tls",
      "authentication": {
        "username": "notifications@example.com",
        "passwordSecretId": "smtp-password-123"
      }
    }
  },
  "recipients": {
    "to": ["team@example.com", "manager@example.com"],
    "cc": ["supervisor@example.com"],
    "bcc": []
  },
  "message": {
    "subject": "Workflow '{workflow_name}' Completed - {status}",
    "body": {
      "type": "html",
      "template": "<h1>Workflow Results</h1><p>The workflow '{workflow_name}' has completed with status: <strong>{status}</strong>.</p><p>Summary:</p><ul><li>Processed Records: {record_count}</li><li>Success Rate: {success_rate}%</li><li>Processing Time: {processing_time} seconds</li></ul><p>Please see the attached report for details.</p>",
      "variables": {
        "workflow_name": "{context.workflow_name}",
        "status": "{context.status}",
        "record_count": "{data.count()}",
        "success_rate": "{data.success_rate * 100:.1f}",
        "processing_time": "{context.execution_time:.2f}"
      }
    }
  },
  "attachments": [
    {
      "type": "report",
      "source": "node_output",
      "nodeId": "report_generator_1",
      "outputName": "report"
    },
    {
      "type": "data",
      "source": "input_data",
      "format": "csv",
      "filename": "results_{date}.csv",
      "includeColumns": ["id", "name", "status", "processed_date"]
    }
  ],
  "conditions": {
    "operator": "or",
    "conditions": [
      {
        "type": "status",
        "status": ["completed", "failed"]
      },
      {
        "type": "data",
        "column": "error_count",
        "operator": ">",
        "value": 0
      }
    ]
  },
  "tracking": {
    "enabled": true,
    "saveNotifications": true,
    "requestDeliveryReceipts": true
  }
}
```

### Model Deployer

**Type ID**: `modelDeployer`

**Description**: Deploys machine learning models to production environments.

**Frontend Component**: `ModelDeployerNode.tsx`

**Backend Processor**: `ModelDeployerProcessor.py`

**Inputs**:
- **Model**: Trained machine learning model
- **Model Metadata**: Metadata about the model

**Configuration Options**:
- **Deployment Target**:
  - REST API
  - Batch Prediction
  - Real-time Inference
  - Edge Device
- **Environment**:
  - Development
  - Staging
  - Production
- **Versioning**: Model versioning options
- **Monitoring**: Model monitoring options
- **Scaling**: Scaling options for the deployment

**Outputs**:
- **Deployment Status**: Status of the deployment operation
- **Endpoint**: Endpoint for accessing the deployed model
- **Deployment Metadata**: Metadata about the deployment

**Example Configuration**:
```json
{
  "type": "modelDeployer",
  "deploymentTarget": {
    "type": "restApi",
    "framework": "fastapi",
    "hosting": {
      "type": "kubernetes",
      "namespace": "ml-models",
      "resources": {
        "cpu": "1",
        "memory": "2Gi",
        "gpu": "0"
      }
    }
  },
  "environment": {
    "name": "production",
    "region": "us-west-2",
    "tags": {
      "project": "customer-churn",
      "department": "marketing",
      "owner": "data-science-team"
    }
  },
  "model": {
    "preprocessing": {
      "includePreprocessing": true,
      "savePreprocessors": true
    },
    "format": {
      "type": "onnx",
      "options": {
        "opset": 12,
        "optimize": true
      }
    },
    "artifacts": {
      "saveLocation": "s3://model-registry/customer-churn/",
      "includeTrainingMetadata": true
    }
  },
  "api": {
    "endpoints": [
      {
        "path": "/predict",
        "method": "POST",
        "inputSchema": {
          "type": "object",
          "properties": {
            "customer_id": {"type": "string"},
            "tenure": {"type": "number"},
            "monthly_charges": {"type": "number"},
            "total_charges": {"type": "number"}
          },
          "required": ["customer_id", "tenure", "monthly_charges"]
        },
        "outputSchema": {
          "type": "object",
          "properties": {
            "customer_id": {"type": "string"},
            "churn_probability": {"type": "number"},
            "prediction": {"type": "boolean"},
            "confidence": {"type": "number"}
          }
        },
        "batchSupport": true,
        "maxBatchSize": 100
      }
    ],
    "authentication": {
      "type": "api_key",
      "headerName": "X-API-Key"
    },
    "rateLimit": {
      "enabled": true,
      "requestsPerMinute": 1000
    }
  },
  "versioning": {
    "strategy": "semantic",
    "autoIncrement": "patch",
    "labelingStrategy": "timestamp"
  },
  "monitoring": {
    "enabled": true,
    "metrics": ["latency", "throughput", "error_rate", "data_drift"],
    "alerts": {
      "enabled": true,
      "channels": ["email", "slack"],
      "thresholds": {
        "error_rate": 0.05,
        "data_drift": 0.2
      }
    },
    "logging": {
      "enabled": true,
      "level": "info",
      "includeInputs": false,
      "includeOutputs": true
    }
  },
  "scaling": {
    "minReplicas": 2,
    "maxReplicas": 10,
    "targetCpuUtilization": 70,
    "scaleDownDelay": 300
  }
}
```

### Workflow Scheduler

**Type ID**: `workflowScheduler`

**Description**: Schedules workflows to run at specified intervals.

**Frontend Component**: `WorkflowSchedulerNode.tsx`

**Backend Processor**: `WorkflowSchedulerProcessor.py`

**Inputs**:
- **Workflow**: Workflow to schedule
- **Workflow Parameters**: Parameters for the workflow

**Configuration Options**:
- **Schedule**:
  - One-time
  - Recurring (cron expression)
  - Event-triggered
- **Parameters**: Dynamic parameters for the workflow
- **Notifications**: Notification settings
- **Retry Policy**: Policy for retrying failed workflows

**Outputs**:
- **Schedule Status**: Status of the scheduling operation
- **Next Run Time**: Time of the next scheduled run
- **Schedule Metadata**: Metadata about the schedule

**Example Configuration**:
```json
{
  "type": "workflowScheduler",
  "schedule": {
    "type": "recurring",
    "expression": "0 0 * * *",
    "timezone": "America/New_York",
    "startDate": "2023-01-01",
    "endDate": null,
    "exclusions": [
      {
        "type": "holiday",
        "country": "US"
      },
      {
        "type": "date",
        "dates": ["2023-12-25", "2024-01-01"]
      }
    ]
  },
  "workflow": {
    "id": "data_processing_workflow",
    "version": "latest",
    "parameters": {
      "date": "{execution_date}",
      "region": "all",
      "includeHistorical": false
    }
  },
  "execution": {
    "timeout": 3600,
    "priority": "normal",
    "concurrency": {
      "allowConcurrent": false,
      "maxConcurrent": 1
    },
    "dependencies": [
      {
        "workflowId": "data_ingestion_workflow",
        "status": "completed"
      }
    ]
  },
  "retryPolicy": {
    "enabled": true,
    "maxRetries": 3,
    "initialDelay": 300,
    "backoffFactor": 2,
    "maxDelay": 3600,
    "retryOnStatuses": ["failed", "timeout"]
  },
  "notifications": {
    "onStart": {
      "enabled": false,
      "channels": []
    },
    "onSuccess": {
      "enabled": true,
      "channels": ["email"]
    },
    "onFailure": {
      "enabled": true,
      "channels": ["email", "slack"]
    }
  },
  "logging": {
    "level": "info",
    "retention": "30d"
  }
}
```

## Best Practices

1. **Data Validation**: Validate data before exporting to ensure quality
2. **Error Handling**: Implement robust error handling for output operations
3. **Security**: Secure sensitive information in reports and exports
4. **Automation**: Automate report generation and distribution
5. **Versioning**: Maintain versions of reports and exports
6. **Monitoring**: Monitor the status of output operations
7. **Feedback Loop**: Collect feedback on reports and exports to improve them

## Troubleshooting

### Common Issues

1. **Export Failures**:
   - Check destination permissions
   - Verify network connectivity
   - Ensure data format is compatible with destination

2. **Report Generation Issues**:
   - Check template compatibility
   - Verify data is in expected format
   - Check for missing dependencies

3. **Notification Problems**:
   - Verify recipient information
   - Check authentication credentials
   - Ensure message format is valid

4. **Deployment Failures**:
   - Check environment configuration
   - Verify model compatibility
   - Ensure resources are sufficient 
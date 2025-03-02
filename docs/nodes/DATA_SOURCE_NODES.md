# Data Source Nodes

Data Source nodes are responsible for loading data into the workflow from various sources. These nodes serve as the entry points for data in the Data Whisperer platform.

## Available Data Source Nodes

### Dataset Loader

**Type ID**: `datasetLoader`

**Description**: Loads data from various sources including files, databases, and APIs.

**Frontend Component**: `DatasetLoaderNode.tsx`

**Backend Processor**: `DatasetLoaderProcessor.py`

**Configuration Options**:
- **Source Type**: 
  - File (local or remote)
  - Database (SQL, NoSQL)
  - API (REST, GraphQL)
  - Data Warehouse (Snowflake, BigQuery, Redshift)
- **Location**: Path, URL, or connection string
- **Format**: CSV, JSON, Parquet, Avro, ORC, Excel, etc.
- **Authentication**:
  - API Key
  - OAuth
  - Username/Password
  - Connection String
- **Advanced Options**:
  - Chunk Size: For loading large datasets in chunks
  - Caching: Enable/disable caching of loaded data
  - Compression: Specify compression format (gzip, zip, etc.)
  - Encoding: Specify character encoding (UTF-8, Latin-1, etc.)

**Outputs**:
- **Data**: The loaded dataset as a DataFrame
- **Schema**: Inferred schema of the dataset
- **Metadata**: Information about the dataset (size, row count, etc.)

**Example Configuration**:
```json
{
  "type": "datasetLoader",
  "source": {
    "type": "file",
    "location": "/path/to/data.csv",
    "format": "csv",
    "options": {
      "delimiter": ",",
      "header": true,
      "inferTypes": true
    }
  },
  "caching": {
    "enabled": true,
    "ttl": 3600
  }
}
```

### Database Connector

**Type ID**: `databaseConnector`

**Description**: Establishes a connection to a database and executes SQL queries to retrieve data.

**Frontend Component**: `DatabaseConnectorNode.tsx`

**Backend Processor**: `DatabaseConnectorProcessor.py`

**Configuration Options**:
- **Database Type**: PostgreSQL, MySQL, SQLite, SQL Server, Oracle, etc.
- **Connection Details**:
  - Host
  - Port
  - Database Name
  - Schema
  - Username
  - Password (securely stored)
- **Query Options**:
  - SQL Query: Custom SQL query to execute
  - Table Selection: Select tables and columns
  - Join Builder: Visual interface for building joins
- **Performance Options**:
  - Connection Pooling
  - Query Timeout
  - Batch Size

**Outputs**:
- **Data**: The query results as a DataFrame
- **Schema**: Schema of the result set
- **Query Metadata**: Execution time, row count, etc.

**Example Configuration**:
```json
{
  "type": "databaseConnector",
  "connection": {
    "type": "postgresql",
    "host": "db.example.com",
    "port": 5432,
    "database": "analytics",
    "schema": "public",
    "username": "analyst",
    "passwordSecretId": "db-password-123"
  },
  "query": {
    "sql": "SELECT * FROM customers WHERE region = 'Europe' LIMIT 1000",
    "parameters": {
      "region": "Europe"
    }
  },
  "options": {
    "timeout": 30,
    "batchSize": 500
  }
}
```

### API Connector

**Type ID**: `apiConnector`

**Description**: Connects to REST or GraphQL APIs to fetch data.

**Frontend Component**: `ApiConnectorNode.tsx`

**Backend Processor**: `ApiConnectorProcessor.py`

**Configuration Options**:
- **API Type**: REST, GraphQL, SOAP
- **Endpoint**: URL of the API endpoint
- **Method**: GET, POST, PUT, DELETE
- **Headers**: Custom HTTP headers
- **Authentication**:
  - API Key
  - OAuth 2.0
  - Bearer Token
  - Basic Auth
- **Request Body**: JSON, Form Data, or XML
- **Pagination**: Options for handling paginated responses
- **Rate Limiting**: Controls for respecting API rate limits

**Outputs**:
- **Data**: The API response data as a DataFrame
- **Response Metadata**: Status code, headers, etc.
- **Pagination Info**: Current page, total pages, etc.

**Example Configuration**:
```json
{
  "type": "apiConnector",
  "api": {
    "type": "rest",
    "endpoint": "https://api.example.com/v1/products",
    "method": "GET",
    "headers": {
      "Accept": "application/json",
      "User-Agent": "DataWhisperer/1.0"
    }
  },
  "authentication": {
    "type": "bearer",
    "tokenSecretId": "api-token-456"
  },
  "pagination": {
    "enabled": true,
    "strategy": "offset",
    "limitParam": "limit",
    "offsetParam": "offset",
    "pageSize": 100,
    "maxPages": 10
  }
}
```

### File Upload

**Type ID**: `fileUpload`

**Description**: Allows users to upload files directly into the workflow.

**Frontend Component**: `FileUploadNode.tsx`

**Backend Processor**: `FileUploadProcessor.py`

**Configuration Options**:
- **Allowed Formats**: CSV, JSON, Excel, etc.
- **Size Limit**: Maximum file size in MB
- **Validation Rules**: Schema validation, data type checking
- **Processing Options**:
  - Header Row: Specify if the file has a header row
  - Skip Rows: Number of rows to skip
  - Column Types: Manual specification of column data types

**Outputs**:
- **Data**: The uploaded file as a DataFrame
- **Upload Metadata**: File name, size, upload time, etc.
- **Validation Results**: Any validation errors or warnings

**Example Configuration**:
```json
{
  "type": "fileUpload",
  "options": {
    "allowedFormats": ["csv", "xlsx", "json"],
    "sizeLimit": 50,
    "validation": {
      "requireHeader": true,
      "allowMissingValues": true,
      "columnTypes": {
        "id": "integer",
        "name": "string",
        "price": "float",
        "date": "datetime"
      }
    }
  }
}
```

### Streaming Data Source

**Type ID**: `streamingSource`

**Description**: Connects to streaming data sources like Kafka, Kinesis, or websockets.

**Frontend Component**: `StreamingSourceNode.tsx`

**Backend Processor**: `StreamingSourceProcessor.py`

**Configuration Options**:
- **Stream Type**: Kafka, Kinesis, RabbitMQ, Websocket
- **Connection Details**:
  - Brokers/Endpoints
  - Topics/Streams
  - Consumer Group
- **Processing Options**:
  - Window Size: Time or count-based windowing
  - Batch Size: Number of messages to process at once
  - Offset Management: Latest, earliest, or custom offset
- **Schema**: Schema definition for the streaming data

**Outputs**:
- **Data Stream**: Continuous stream of data
- **Window Statistics**: Statistics about the current window
- **Stream Health**: Metrics about the stream connection

**Example Configuration**:
```json
{
  "type": "streamingSource",
  "stream": {
    "type": "kafka",
    "brokers": ["kafka1.example.com:9092", "kafka2.example.com:9092"],
    "topic": "user-events",
    "consumerGroup": "data-whisperer-1"
  },
  "processing": {
    "windowType": "time",
    "windowSize": 60,
    "batchSize": 1000,
    "offsetReset": "latest"
  },
  "schema": {
    "type": "avro",
    "definition": "https://schema-registry.example.com/schemas/user-events/latest"
  }
}
```

## Best Practices

1. **Security**: Always use secure connections and credential management for database and API connections
2. **Performance**: Use appropriate batch sizes and pagination for large datasets
3. **Error Handling**: Configure retry logic and fallback options for unreliable sources
4. **Monitoring**: Enable logging and monitoring for data source connections
5. **Caching**: Use caching for frequently accessed data that doesn't change often

## Troubleshooting

### Common Issues

1. **Connection Failures**:
   - Check network connectivity
   - Verify credentials
   - Ensure firewall rules allow the connection

2. **Performance Problems**:
   - Reduce batch size
   - Implement pagination
   - Use more efficient data formats (Parquet instead of CSV)

3. **Data Quality Issues**:
   - Configure explicit schema validation
   - Use data quality nodes after data source nodes
   - Implement appropriate error handling for malformed data 
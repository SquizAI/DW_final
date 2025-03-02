# Data Whisperer Technical Overview - Part 3: Backend Architecture

## 6. Backend Core Structure

### 6.1 Server Entry Points

- **backend/main.py** - PRIMARY ACTIVE
  - Main FastAPI application entry point
  - Imports: FastAPI, routes, middleware, dependencies
  - Features:
    - API server configuration
    - CORS middleware setup
    - Route registration
    - Error handling middleware
    - Health check endpoint
  - Called by: Server startup scripts, Docker entrypoint
  - Calls: Route handlers, database connections

- **backend/app/main.py** - ACTIVE
  - Secondary/newer FastAPI application entry point
  - Imports: FastAPI, routes, middleware, dependencies
  - Features:
    - Similar to main.py but with newer architecture
    - More modular route organization
  - Called by: Alternate server startup scripts
  - Calls: App-based route handlers, database connections

- **backend/run_server.py**, **backend/run.py** - ACTIVE
  - Server runner scripts
  - Imports: uvicorn, main application
  - Features:
    - Server configuration (host, port, workers)
    - Development/production mode toggles
    - Optional debug settings
  - Called by: Command line, Docker entrypoint
  - Calls: main.py or app/main.py

- **backend/run_server_fixed.py** - SECONDARY/BACKUP
  - Fixed version of server runner
  - Used if standard runner has issues
  - Features: Similar to run_server.py but with fixes

- **backend/run_server_with_kaggle.py**, **backend/run_kaggle_debug_server.py** - SPECIALIZED
  - Kaggle integration-specific server runners
  - Features:
    - Kaggle API configuration
    - Debug settings for Kaggle integration
  - Used for: Testing and debugging Kaggle integration

### 6.2 Database & Models

- **backend/app/database.py** - PRIMARY ACTIVE
  - Database connection management
  - Imports: SQLAlchemy, configuration
  - Features:
    - Database URL construction
    - Engine configuration
    - Session management
    - Connection pooling
  - Called by: Models, CRUD operations, API routes
  - Calls: Database connection, transaction management

- **backend/app/models.py** - PRIMARY ACTIVE
  - SQLAlchemy ORM models
  - Imports: SQLAlchemy, database.py
  - Models defined:
    - Dataset (metadata, location, status)
    - Workflow (name, description, status)
    - WorkflowNode (type, configuration, position)
    - WorkflowEdge (connections between nodes)
    - User (if authentication implemented)
  - Called by: CRUD operations, route handlers
  - Used for: Database schema representation

- **backend/app/schemas.py** - PRIMARY ACTIVE
  - Pydantic data validation schemas
  - Imports: Pydantic
  - Features:
    - Request validation schemas
    - Response serialization schemas
    - Nested object validation
  - Called by: Route handlers for request/response validation
  - Used for: Data validation, API documentation

- **backend/app/crud.py** - PRIMARY ACTIVE
  - CRUD operations for database models
  - Imports: SQLAlchemy, models, schemas
  - Features:
    - Create, read, update, delete functions
    - Query builders
    - Transaction management
  - Called by: Route handlers
  - Calls: Database operations via SQLAlchemy

### 6.3 Database Migration & Initialization

- **backend/app/init_db.py**, **backend/init_db.py** - ACTIVE
  - Database initialization scripts
  - Imports: SQLAlchemy, models
  - Features:
    - Initial database setup
    - Table creation
    - Initial data seeding
  - Called by: First-time setup, docker initialization

- **backend/app/create_migration.py** - ACTIVE
  - Migration script creation
  - Imports: Alembic
  - Features:
    - Generate migration scripts based on model changes
  - Called by: Development processes when models change

- **backend/app/run_migrations.py** - ACTIVE
  - Apply database migrations
  - Imports: Alembic
  - Features:
    - Run pending migrations
    - Update database schema
  - Called by: Application startup, CI/CD deployment

- **backend/migrations/env.py** - ACTIVE
  - Alembic migration environment
  - Imports: Alembic, SQLAlchemy, models
  - Features:
    - Migration configuration
    - Model metadata access
  - Called by: Alembic migration commands

### 6.4 API Routes

#### 6.4.1 Core API Routes

- **backend/app/routes/datasets.py** - PRIMARY ACTIVE
  - Dataset API endpoints
  - Imports: FastAPI, crud, models, schemas
  - Endpoints:
    - GET /datasets - List datasets
    - POST /datasets - Create dataset
    - GET /datasets/{id} - Get dataset details
    - PUT /datasets/{id} - Update dataset
    - DELETE /datasets/{id} - Delete dataset
  - Called by: main.py router inclusion
  - Calls: CRUD operations, file system operations

- **backend/app/routes/workflows.py** - PRIMARY ACTIVE
  - Workflow API endpoints
  - Imports: FastAPI, crud, models, schemas
  - Endpoints:
    - GET /workflows - List workflows
    - POST /workflows - Create workflow
    - GET /workflows/{id} - Get workflow details
    - PUT /workflows/{id} - Update workflow
    - DELETE /workflows/{id} - Delete workflow
    - POST /workflows/{id}/execute - Execute workflow
  - Called by: main.py router inclusion
  - Calls: CRUD operations, workflow engine

- **backend/app/routes/kaggle.py** - PRIMARY ACTIVE
  - Kaggle integration endpoints
  - Imports: FastAPI, kaggle service modules
  - Endpoints:
    - GET /kaggle/datasets - Search Kaggle datasets
    - POST /kaggle/datasets/{id}/download - Download dataset
    - GET /kaggle/local - List local Kaggle datasets
    - DELETE /kaggle/local/{id} - Delete local dataset
  - Called by: main.py router inclusion
  - Calls: Kaggle service modules

#### 6.4.2 Legacy/Additional Routes

- **backend/routes/datasets.py** - LEGACY/SECONDARY
  - Older dataset endpoints
  - May still be used in some contexts
  - Being replaced by app/routes/datasets.py

- **backend/routes/workflows.py** - LEGACY/SECONDARY
  - Older workflow endpoints
  - May still be used in some contexts
  - Being replaced by app/routes/workflows.py

- **backend/routes/analysis.py** - ACTIVE
  - Data analysis endpoints
  - Endpoints for performing data analysis operations

- **backend/routes/data_management.py** - ACTIVE
  - General data management endpoints
  - Features: Data import/export, data operations

- **backend/routes/wrangling.py** - ACTIVE
  - Data wrangling endpoints
  - Features: Data cleaning, transformation, filtering

- **backend/routes/dataset_organization.py** - ACTIVE
  - Dataset organization endpoints
  - Features: Dataset categorization, tagging, grouping

- **backend/routes/report.py** - ACTIVE
  - Report generation endpoints
  - Features: Generate analysis reports from data

- **backend/routes/landing.py** - SECONDARY
  - Landing page data endpoints
  - Features: Statistics and information for landing page

### 6.5 Services

- **backend/services/data_service.py** - ACTIVE
  - Core data service functions
  - Imports: File libraries, data processing libraries
  - Features:
    - Data file parsing
    - Data transformation
    - Data validation
  - Called by: Route handlers requiring data operations
  - Calls: File system operations, data processing libraries

- **backend/services/report_generator.py** - ACTIVE
  - Report generation service
  - Imports: Templating engine, data visualization
  - Features:
    - Report template rendering
    - Chart generation
    - PDF creation
  - Called by: Report-related routes
  - Calls: Templating engine, visualization libraries

- **backend/app/services/ai_service.py** - ACTIVE
  - Core AI service
  - Imports: AI/ML libraries
  - Features:
    - AI model access
    - Inference execution
    - Result processing
  - Called by: AI-related routes
  - Calls: AI models, libraries

- **backend/app/services/ai_analysis.py** - ACTIVE
  - AI-powered data analysis
  - Imports: AI service, data analysis libraries
  - Features:
    - Automated insight generation
    - Pattern detection
    - Anomaly identification
  - Called by: Analysis routes, workflow nodes
  - Calls: AI service, analysis libraries

- **backend/app/services/ai_model_optimization.py** - PARTIALLY IMPLEMENTED
  - AI model optimization
  - Imports: ML libraries, optimization techniques
  - Features: 
    - Model hyperparameter tuning
    - Model selection
    - Training optimization
  - Limited implementation currently

- **backend/app/services/ai_visualization.py** - PARTIALLY IMPLEMENTED
  - AI-powered visualization
  - Imports: Visualization libraries, AI service
  - Features:
    - Automatic visualization suggestion
    - Chart type selection
    - Layout optimization
  - Limited implementation currently

- **backend/app/services/kaggle_service.py** - ACTIVE
  - Kaggle service integration
  - Imports: Kaggle API, file operations
  - Features:
    - Kaggle API integration
    - Dataset download management
    - Dataset extraction and processing
  - Called by: Kaggle routes
  - Calls: Kaggle modules, file system operations

## 7. Backend Specialized Modules

### 7.1 Kaggle Integration

- **backend/app/kaggle/__init__.py** - ACTIVE
  - Kaggle module initialization
  - Package structure organization

- **backend/app/kaggle/auth.py** - ACTIVE
  - Kaggle authentication
  - Imports: Kaggle API, configuration
  - Features:
    - API key management
    - Authentication setup
    - Credential validation
  - Called by: Other Kaggle modules
  - Calls: Kaggle API authentication

- **backend/app/kaggle/discovery.py** - ACTIVE
  - Kaggle dataset discovery
  - Imports: Kaggle API
  - Features:
    - Dataset search
    - Metadata retrieval
    - Category browsing
  - Called by: Kaggle routes, router.py
  - Calls: Kaggle API for dataset discovery

- **backend/app/kaggle/retrieval.py** - ACTIVE
  - Dataset retrieval from Kaggle
  - Imports: Kaggle API, file system operations
  - Features:
    - Dataset download
    - Progress tracking
    - Download validation
  - Called by: Kaggle routes, router.py
  - Calls: Kaggle API for dataset download

- **backend/app/kaggle/local.py** - ACTIVE
  - Local Kaggle dataset management
  - Imports: File system operations
  - Features:
    - List local datasets
    - Dataset metadata extraction
    - Dataset deletion
  - Called by: Kaggle routes, router.py
  - Calls: File system operations

- **backend/app/kaggle/router.py** - ACTIVE
  - FastAPI router for Kaggle endpoints
  - Imports: FastAPI, other Kaggle modules
  - Features:
    - Route definitions for Kaggle operations
    - Request/response handling
  - Called by: main.py for router inclusion
  - Calls: Other Kaggle modules for implementation

- **backend/app/kaggle/competitions.py** - PARTIALLY IMPLEMENTED
  - Kaggle competitions integration
  - For future competition data access

- **backend/app/kaggle/users.py** - PARTIALLY IMPLEMENTED
  - Kaggle user information
  - For future user profile integration

- **backend/app/kaggle/manipulation.py** - ACTIVE
  - Dataset manipulation after download
  - Imports: Data processing libraries
  - Features:
    - Extraction
    - Conversion
    - Initial processing
  - Called by: retrieval.py after download
  - Calls: File manipulation libraries

- **backend/app/kaggle/debug.py** - UTILITY/DEVELOPMENT
  - Debugging utilities for Kaggle integration
  - Used during development and testing

### 7.2 Dataset Organization System

- **backend/app/dataset_organization/__init__.py** - ACTIVE
  - Dataset organization module initialization
  - Package structure organization

- **backend/app/dataset_organization/bucket_manager.py** - ACTIVE
  - Management of dataset buckets
  - Imports: File system operations
  - Features:
    - Create/delete buckets
    - List buckets
    - Bucket metadata management
  - Called by: Dataset organization routes
  - Calls: File system operations, database functions

- **backend/app/dataset_organization/dataset_indexer.py** - ACTIVE
  - Indexing of datasets
  - Imports: File parsing libraries
  - Features:
    - Dataset metadata extraction
    - Content indexing
    - Search capabilities
  - Called by: Dataset organization routes, bucket manager
  - Calls: File parsing libraries, database functions

- **backend/app/dataset_organization/ai_cataloger.py** - PARTIALLY IMPLEMENTED
  - AI-powered dataset cataloging
  - Imports: AI service, dataset indexer
  - Features:
    - Automatic dataset categorization
    - Tag suggestion
    - Content classification
  - Called by: Dataset organization routes
  - Calls: AI service, dataset indexer

### 7.3 Workflow Engine

- **backend/app/workflow_engine/__init__.py** - ACTIVE
  - Workflow engine module initialization
  - Package structure organization

- **backend/app/workflow_engine/executor.py** - ACTIVE
  - Workflow execution logic
  - Imports: node_processor, data_manager
  - Features:
    - Workflow graph traversal
    - Node execution orchestration
    - Execution state management
    - Error handling
  - Called by: Workflow routes for execution
  - Calls: node_processor for individual nodes

- **backend/app/workflow_engine/node_processor.py** - ACTIVE
  - Processing of workflow nodes
  - Imports: Node type modules
  - Features:
    - Node type resolution
    - Node execution delegation
    - Input/output handling
  - Called by: executor.py
  - Calls: Specific node type implementations

- **backend/app/workflow_engine/data_manager.py** - ACTIVE
  - Data management within workflows
  - Imports: Data libraries
  - Features:
    - Intermediate data storage
    - Data passing between nodes
    - Memory management
  - Called by: executor.py, node_processor.py
  - Calls: File system, memory management

- **backend/app/workflow_engine/exceptions.py** - ACTIVE
  - Workflow-specific exceptions
  - Features:
    - Custom exception classes
    - Error categorization
    - Error messages
  - Called by: Various workflow engine components
  - Used for: Error handling and reporting

#### 7.3.1 Workflow Node Types

- **backend/app/workflow_engine/nodes/__init__.py** - ACTIVE
  - Node types module initialization
  - Node registration

- **backend/app/workflow_engine/nodes/data_source.py** - ACTIVE
  - Data source node types
  - Imports: Data loading libraries
  - Features:
    - File loading nodes
    - Database connection nodes
    - API data source nodes
  - Called by: node_processor.py
  - Calls: Data source libraries, APIs

- **backend/app/workflow_engine/nodes/data_transformation.py** - ACTIVE
  - Data transformation nodes
  - Imports: Data processing libraries
  - Features:
    - Filtering nodes
    - Aggregation nodes
    - Join/merge nodes
    - Calculation nodes
  - Called by: node_processor.py
  - Calls: Data transformation libraries

- **backend/app/workflow_engine/nodes/analysis.py** - ACTIVE
  - Analysis node types
  - Imports: Statistical libraries, AI libraries
  - Features:
    - Statistical analysis nodes
    - Pattern detection nodes
    - Classification nodes
    - Clustering nodes
  - Called by: node_processor.py
  - Calls: Analysis libraries, AI service

- **backend/app/workflow_engine/nodes/visualization.py** - ACTIVE
  - Visualization node types
  - Imports: Visualization libraries
  - Features:
    - Chart nodes
    - Map nodes
    - Network diagram nodes
    - Dashboard nodes
  - Called by: node_processor.py
  - Calls: Visualization libraries

- **backend/app/workflow_engine/nodes/export.py** - ACTIVE
  - Export node types
  - Imports: File export libraries
  - Features:
    - File export nodes
    - Database export nodes
    - API export nodes
    - Report generation nodes
  - Called by: node_processor.py
  - Calls: Export libraries, APIs

### 7.4 AI Agent System

- **backend/api/agents/manager.py** - EVOLVING
  - Agent management system
  - Imports: Agent types, orchestration
  - Features:
    - Agent creation
    - Agent lifecycle management
    - Inter-agent communication
  - Called by: AI routes
  - Calls: Agent type implementations

- **backend/api/agents/types.py** - EVOLVING
  - Agent type definitions
  - Imports: Base agent classes
  - Features:
    - Agent class hierarchies
    - Capability definitions
    - Interface specifications
  - Called by: manager.py
  - Used for: Agent implementation and typing

- **backend/app/agentic_topology/__init__.py** - EVOLVING
  - Agentic topology module initialization
  - Package structure organization

- **backend/app/agentic_topology/agent_manager.py** - EVOLVING
  - Extended agent management
  - Imports: Agent system, orchestration
  - Features:
    - Advanced agent coordination
    - Topology management
    - Agent discovery
  - Called by: AI routes, workflow orchestrator
  - Calls: Agent implementations

- **backend/app/agentic_topology/workflow_orchestrator.py** - EVOLVING
  - Orchestration of AI workflows
  - Imports: Agent manager, workflow engine
  - Features:
    - AI-driven workflow creation
    - Dynamic workflow adjustment
    - AI intervention in workflows
  - Called by: Workflow routes with AI features
  - Calls: Agent manager, workflow engine

- **backend/app/agentic_topology/router.py** - EVOLVING
  - FastAPI router for agent endpoints
  - Imports: FastAPI, agent modules
  - Features:
    - Route definitions for agent operations
    - Request/response handling
  - Called by: main.py for router inclusion
  - Calls: Agent modules for implementation 
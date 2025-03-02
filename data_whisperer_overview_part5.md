# Data Whisperer Technical Overview - Part 5: Data Models, Integrations & Roadmap

## 12. Data Model & Schema

### 12.1 Core Data Models

- **Dataset Model**
  - Primary data entity representing uploaded or imported datasets
  - Key fields:
    - `id`: Unique identifier
    - `name`: Human-readable name
    - `description`: Optional dataset description
    - `file_path`: Physical location on disk
    - `source`: Origin (upload, Kaggle, etc.)
    - `format`: File format (CSV, JSON, etc.)
    - `size`: File size in bytes
    - `row_count`: Number of rows (if applicable)
    - `column_count`: Number of columns (if applicable)
    - `created_at`: Creation timestamp
    - `updated_at`: Last modification timestamp
    - `metadata`: JSON field for extended properties
    - `status`: Processing status
  - Relationships:
    - One-to-many with DatasetVersion
    - Many-to-many with Tags
    - One-to-many with Workflows (as source)

- **Workflow Model**
  - Represents a data processing pipeline
  - Key fields:
    - `id`: Unique identifier
    - `name`: Human-readable name
    - `description`: Optional workflow description
    - `created_at`: Creation timestamp
    - `updated_at`: Last modification timestamp
    - `status`: Current status
    - `last_run`: Last execution timestamp
    - `is_template`: Boolean indicating if it's a template
    - `creator_id`: User who created it (if auth implemented)
  - Relationships:
    - One-to-many with WorkflowNode
    - One-to-many with WorkflowEdge (via nodes)
    - Many-to-one with Dataset (source)
    - Many-to-one with User (creator)

- **WorkflowNode Model**
  - Represents a processing node within a workflow
  - Key fields:
    - `id`: Unique identifier
    - `workflow_id`: Parent workflow reference
    - `type`: Node type (data_source, transformation, analysis, visualization, export)
    - `name`: Human-readable name
    - `configuration`: JSON configuration
    - `position_x`: X coordinate in workflow canvas
    - `position_y`: Y coordinate in workflow canvas
    - `status`: Current node status
    - `execution_time`: Last execution time in ms
  - Relationships:
    - Many-to-one with Workflow
    - One-to-many with WorkflowEdge (as source or target)

- **WorkflowEdge Model**
  - Represents a connection between workflow nodes
  - Key fields:
    - `id`: Unique identifier
    - `workflow_id`: Parent workflow reference
    - `source_node_id`: Source node reference
    - `target_node_id`: Target node reference
    - `configuration`: Optional edge configuration
  - Relationships:
    - Many-to-one with Workflow
    - Many-to-one with WorkflowNode (source)
    - Many-to-one with WorkflowNode (target)

### 12.2 Supporting Data Models

- **User Model** (if authentication implemented)
  - Represents an application user
  - Key fields:
    - `id`: Unique identifier
    - `email`: Email address (unique)
    - `username`: Username (optional)
    - `password_hash`: Hashed password
    - `role`: User role
    - `created_at`: Account creation timestamp
    - `last_login`: Last login timestamp
    - `is_active`: Account status
  - Relationships:
    - One-to-many with Dataset (creator)
    - One-to-many with Workflow (creator)

- **Tag Model**
  - Represents a tag for organizing datasets
  - Key fields:
    - `id`: Unique identifier
    - `name`: Tag name
    - `description`: Optional description
    - `color`: Tag color for UI
  - Relationships:
    - Many-to-many with Dataset

- **DatasetVersion Model**
  - Represents a version of a dataset
  - Key fields:
    - `id`: Unique identifier
    - `dataset_id`: Parent dataset reference
    - `version_number`: Version number
    - `file_path`: Physical location on disk
    - `changes`: Description of changes
    - `created_at`: Creation timestamp
    - `created_by`: User who created this version
  - Relationships:
    - Many-to-one with Dataset
    - Many-to-one with User (creator)

- **AnalysisResult Model**
  - Stores results of data analysis
  - Key fields:
    - `id`: Unique identifier
    - `dataset_id`: Dataset reference
    - `workflow_id`: Optional workflow reference
    - `result_type`: Type of analysis
    - `result_data`: JSON result data
    - `created_at`: Creation timestamp
  - Relationships:
    - Many-to-one with Dataset
    - Many-to-one with Workflow (optional)

### 12.3 Database Schema

- **Table Relationships**
  - One-to-many relationships:
    - User → Dataset
    - User → Workflow
    - Dataset → DatasetVersion
    - Workflow → WorkflowNode
    - Workflow → WorkflowEdge
  - Many-to-many relationships:
    - Dataset ↔ Tag (via dataset_tag junction table)
  - Self-referencing relationships:
    - WorkflowNode → WorkflowNode (via WorkflowEdge)

- **Indexes**
  - Primary key indexes on all tables
  - Foreign key indexes for relationships
  - Additional indexes:
    - Dataset: name, created_at, status
    - User: email, username
    - Workflow: name, status, last_run
    - Tags: name

- **Constraints**
  - Foreign key constraints
  - Unique constraints:
    - User: email, username
    - Dataset: name (per user)
    - Workflow: name (per user)
    - Tag: name

## 13. API & Integration Points

### 13.1 REST API Endpoints

#### 13.1.1 Authentication Endpoints

- **POST /api/auth/register**
  - Register a new user
  - Parameters: email, password, username
  - Response: User info and access token

- **POST /api/auth/login**
  - Log in an existing user
  - Parameters: email/username, password
  - Response: User info and access token

- **POST /api/auth/logout**
  - Log out the current user
  - Parameters: None
  - Response: Success confirmation

- **GET /api/auth/me**
  - Get current user information
  - Parameters: None (uses token)
  - Response: User details

- **POST /api/auth/password-reset**
  - Request password reset
  - Parameters: email
  - Response: Success confirmation

#### 13.1.2 Dataset Endpoints

- **GET /api/datasets**
  - List all datasets
  - Parameters: page, limit, filters
  - Response: List of datasets

- **POST /api/datasets**
  - Create a new dataset
  - Parameters: name, description, file (multipart)
  - Response: Created dataset

- **GET /api/datasets/{id}**
  - Get dataset details
  - Parameters: dataset id
  - Response: Dataset details

- **PUT /api/datasets/{id}**
  - Update dataset details
  - Parameters: dataset id, updated fields
  - Response: Updated dataset

- **DELETE /api/datasets/{id}**
  - Delete a dataset
  - Parameters: dataset id
  - Response: Success confirmation

- **GET /api/datasets/{id}/preview**
  - Get dataset preview
  - Parameters: dataset id, limit
  - Response: Sample data

- **GET /api/datasets/{id}/analysis**
  - Get dataset analysis
  - Parameters: dataset id, analysis type
  - Response: Analysis results

#### 13.1.3 Workflow Endpoints

- **GET /api/workflows**
  - List all workflows
  - Parameters: page, limit, filters
  - Response: List of workflows

- **POST /api/workflows**
  - Create a new workflow
  - Parameters: name, description, source dataset
  - Response: Created workflow

- **GET /api/workflows/{id}**
  - Get workflow details
  - Parameters: workflow id
  - Response: Workflow details with nodes and edges

- **PUT /api/workflows/{id}**
  - Update workflow details
  - Parameters: workflow id, updated fields
  - Response: Updated workflow

- **DELETE /api/workflows/{id}**
  - Delete a workflow
  - Parameters: workflow id
  - Response: Success confirmation

- **POST /api/workflows/{id}/execute**
  - Execute a workflow
  - Parameters: workflow id, execution options
  - Response: Execution status

- **GET /api/workflows/{id}/results**
  - Get workflow execution results
  - Parameters: workflow id
  - Response: Execution results

- **POST /api/workflows/{id}/duplicate**
  - Duplicate a workflow
  - Parameters: workflow id, new name
  - Response: New workflow

#### 13.1.4 Kaggle Integration Endpoints

- **GET /api/kaggle/datasets**
  - Search Kaggle datasets
  - Parameters: query, page, limit
  - Response: List of Kaggle datasets

- **POST /api/kaggle/datasets/{id}/download**
  - Download a Kaggle dataset
  - Parameters: Kaggle dataset id, options
  - Response: Download status

- **GET /api/kaggle/local**
  - List locally downloaded Kaggle datasets
  - Parameters: page, limit, filters
  - Response: List of local Kaggle datasets

- **DELETE /api/kaggle/local/{id}**
  - Delete a local Kaggle dataset
  - Parameters: local dataset id
  - Response: Success confirmation

#### 13.1.5 Analysis & Visualization Endpoints

- **POST /api/analysis/statistical**
  - Perform statistical analysis
  - Parameters: dataset id, columns, options
  - Response: Statistical analysis results

- **POST /api/analysis/correlation**
  - Perform correlation analysis
  - Parameters: dataset id, columns, options
  - Response: Correlation analysis results

- **POST /api/analysis/clustering**
  - Perform clustering analysis
  - Parameters: dataset id, columns, options
  - Response: Clustering results

- **POST /api/visualizations/generate**
  - Generate visualizations
  - Parameters: dataset id, visualization type, options
  - Response: Visualization data

- **GET /api/visualizations/recommendations**
  - Get visualization recommendations
  - Parameters: dataset id
  - Response: Recommended visualizations

### 13.2 External Integrations

#### 13.2.1 Kaggle Integration

- **Authentication**
  - Uses Kaggle API key for authentication
  - Stored securely in environment variables
  - Used by: Kaggle service modules

- **Dataset Discovery**
  - Search Kaggle datasets
  - Browse Kaggle dataset categories
  - Get dataset metadata

- **Dataset Retrieval**
  - Download datasets from Kaggle
  - Track download progress
  - Extract and process downloaded datasets
  - Store local metadata

- **User & Competition Integration**
  - Browse Kaggle competitions (partially implemented)
  - View Kaggle user profiles (partially implemented)

#### 13.2.2 OpenAI Integration

- **Authentication**
  - Uses OpenAI API key for authentication
  - Stored securely in environment variables
  - Used by: AI service modules

- **AI Analysis**
  - Generate insights from data
  - Answer natural language questions about data
  - Suggest data transformations

- **AI Assistant**
  - Chat interface for data-related questions
  - Schema suggestion based on data
  - Query suggestion based on data structure

- **Function Calling**
  - Structure outputs for consistent processing
  - Function-based API interaction
  - Validation with Zod schemas

#### 13.2.3 Storage Integrations

- **Local File System**
  - Primary storage for development
  - Used for dataset storage
  - Used for workflow execution results

- **S3 Compatible Storage** (planned)
  - Support for cloud storage
  - Configurable through environment variables
  - Used for dataset storage in production

## 14. Status & Roadmap

### 14.1 Current Implementation Status

#### 14.1.1 Core Features

- **Dataset Management**
  - **Implemented:**
    - File upload and import
    - Dataset listing and details
    - Basic dataset preview
    - Dataset deletion
  - **Partially Implemented:**
    - Dataset versioning
    - Dataset tagging and organization
    - Advanced preview options

- **Workflow System**
  - **Implemented:**
    - Workflow creation and editing
    - Basic node types (source, transformation, export)
    - Workflow execution
    - Visual workflow builder
  - **Partially Implemented:**
    - Advanced node types
    - Node configuration UI
    - Execution history
    - Error handling

- **Kaggle Integration**
  - **Implemented:**
    - Dataset search
    - Dataset download
    - Local dataset management
    - Download status tracking
  - **Partially Implemented:**
    - Competition integration
    - User profile integration
    - Advanced search options

- **Authentication**
  - **Implemented:**
    - Basic authentication flow
    - JWT-based tokens
    - Protected routes
  - **Partially Implemented:**
    - Role-based access control
    - Social authentication
    - Password reset

- **UI/UX**
  - **Implemented:**
    - Responsive layout
    - Core navigation
    - Data table components
    - Basic visualizations
  - **Partially Implemented:**
    - Advanced visualizations
    - Theme customization
    - Accessibility features

#### 14.1.2 Database & Persistence

- **Implemented:**
  - PostgreSQL integration
  - SQLAlchemy ORM models
  - Database migrations
  - CRUD operations
- **Partially Implemented:**
  - Performance optimizations
  - Data sharding
  - Read replicas

#### 14.1.3 AI & Analysis

- **Implemented:**
  - Basic statistical analysis
  - Data profiling
  - AI-driven text analysis
- **Partially Implemented:**
  - Advanced AI insights
  - ML model training
  - Time series analysis

### 14.2 Technical Debt

- **Code Structure**
  - Inconsistent file organization
  - Duplicated code between legacy and newer patterns
  - Unfinished refactoring from in-memory to database

- **Frontend Issues**
  - Inconsistent state management approaches
  - Mixed component patterns
  - Limited test coverage
  - Performance optimizations needed

- **Backend Issues**
  - Incomplete error handling
  - Inconsistent API response formats
  - Missing validation in some endpoints
  - Parallel development in both /app and root structure

- **Documentation**
  - Incomplete API documentation
  - Missing component documentation
  - Outdated architecture diagrams

- **Testing**
  - Limited test coverage
  - Missing integration tests
  - No end-to-end testing

### 14.3 Future Roadmap

#### 14.3.1 Near-Term Priorities

- **Stabilization**
  - Complete error handling throughout the application
  - Standardize API responses
  - Fix UI inconsistencies
  - Complete core CRUD operations

- **Testing Improvements**
  - Increase unit test coverage
  - Add integration tests for critical flows
  - Implement end-to-end testing

- **Documentation**
  - Complete API documentation
  - Update architecture diagrams
  - Improve development documentation

#### 14.3.2 Medium-Term Goals

- **Advanced Workflow Features**
  - Implement all node types
  - Add node configuration UI
  - Add execution history
  - Implement workflow templates

- **Extended AI Integration**
  - Implement AI-driven data insights
  - Add natural language query system
  - Add AI-driven visualization recommendations
  - Implement code generation for data transformations

- **Data Organization**
  - Complete dataset versioning
  - Implement tagging system
  - Add advanced search and filtering
  - Implement data lineage tracking

#### 14.3.3 Long-Term Vision

- **Multi-User Collaboration**
  - Real-time collaboration on workflows
  - Shared workspaces
  - Access control and permissions
  - Activity tracking

- **Advanced Analytics**
  - Time series forecasting
  - Advanced ML model training
  - Model deployment and monitoring
  - Automated report generation

- **Enterprise Features**
  - SSO integration
  - Audit logging
  - Compliance features
  - White-label customization

- **Scalability Improvements**
  - Distributed workflow execution
  - Horizontal scaling
  - Performance optimizations
  - Resource management

## 15. Development & Contribution Guide

### 15.1 Development Environment Setup

- **Prerequisites**
  - Docker and Docker Compose
  - Node.js (v16+)
  - Python (3.9+)
  - PostgreSQL (optional for local development)

- **Initial Setup**
  1. Clone the repository
  2. Copy `.env.example` to `.env` and configure
  3. Run Docker Compose: `docker-compose up -d`
  4. Initialize the database: `docker-compose exec backend python -m app.init_db`
  5. Access the application at `http://localhost:3000`

- **Alternative Local Setup**
  1. Clone the repository
  2. Set up frontend:
     - `cd frontend`
     - `npm install`
     - `npm start`
  3. Set up backend:
     - `cd backend`
     - `python -m venv venv`
     - `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
     - `pip install -r requirements.txt`
     - `python run_server.py`
  4. Access the application at `http://localhost:3000`

### 15.2 Development Workflow

- **Git Workflow**
  - Main branches: `main` (production), `develop` (integration)
  - Feature branches: `feature/feature-name`
  - Bug fix branches: `fix/bug-name`
  - Pull request required for merging
  - CI checks must pass before merging

- **Code Style**
  - Backend: PEP 8, Black formatter
  - Frontend: ESLint, Prettier
  - Commit messages: Conventional Commits format
  - Documentation for all public APIs

- **Review Process**
  - Code review required for all changes
  - Automated tests must pass
  - Manual testing for UI changes
  - Documentation updates required for API changes

### 15.3 Contribution Areas

- **Bug Fixes**
  - Frontend UI issues
  - Backend error handling
  - API consistency
  - Performance issues

- **Feature Implementation**
  - Complete partially implemented features
  - Add new visualizations
  - Enhance workflow capabilities
  - Improve AI integration

- **Documentation**
  - Improve API documentation
  - Add component documentation
  - Update architecture diagrams
  - Create user guides

- **Testing**
  - Add unit tests
  - Create integration tests
  - Implement end-to-end tests
  - Create test fixtures and utilities

### 15.4 Release Process

- **Version Numbering**
  - Semantic versioning: MAJOR.MINOR.PATCH
  - MAJOR: Breaking changes
  - MINOR: New features, non-breaking
  - PATCH: Bug fixes, non-breaking

- **Release Preparation**
  - Feature freeze period
  - Release candidate testing
  - Documentation updates
  - Change log creation

- **Deployment**
  - Docker-based deployment
  - Database migrations
  - Environment configuration
  - Health checks
  - Rollback procedures 
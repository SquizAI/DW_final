# Data Wrangler Backend

This is the backend for the Data Wrangler application, providing APIs for data processing, transformation, and analysis.

## Features

- Dataset management (upload, download, search)
- Workflow creation and execution
- Kaggle integration
- Data analysis and visualization
- AI-powered insights and workflow generation

## Technology Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM)
- **PostgreSQL**: Robust, scalable database for persistent storage
- **Alembic**: Database migration tool
- **Pandas/NumPy**: Data processing and analysis
- **OpenAI**: AI-powered insights and workflow generation
- **Kaggle API**: Integration with Kaggle datasets

## Kaggle Integration Structure

The Kaggle API integration is organized in a modular structure under `app/kaggle/`:

```
app/kaggle/
├── __init__.py           # Exports all components
├── README.md             # Documentation for Kaggle integration
├── auth.py               # Authentication with Kaggle API
├── discovery.py          # Dataset discovery operations
├── retrieval.py          # Dataset retrieval operations
├── manipulation.py       # Dataset manipulation operations
├── competitions.py       # Competition integration
├── users.py              # User management
├── local.py              # Local dataset management
└── router.py             # FastAPI router for all Kaggle endpoints
```

This modular approach provides:
- Clear separation of concerns
- Easy maintenance and extension
- Comprehensive documentation
- Testable components

To use the Kaggle integration, import the router in your main application:

```python
from app.kaggle import kaggle_router
app.include_router(kaggle_router)
```

## Database Schema

The application uses a PostgreSQL database with the following main tables:

- **datasets**: Stores metadata about uploaded datasets
- **workflows**: Stores workflow definitions
- **workflow_nodes**: Stores nodes within workflows
- **workflow_edges**: Stores connections between nodes

## Setup and Installation

### Prerequisites

- Python 3.11+
- PostgreSQL
- Docker and Docker Compose (optional)

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Database Settings
DATABASE_URL=postgresql://postgres:postgres@db:5432/datawrangler
DATABASE_ECHO=true

# Kaggle API Credentials
KAGGLE_USERNAME=your_kaggle_username
KAGGLE_KEY=your_kaggle_api_key

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# File Storage
DATA_DIR=/app/data
UPLOAD_DIR=/app/uploads
EXPORT_DIR=/app/exports
```

### Running with Docker

The easiest way to run the application is using Docker Compose:

```bash
docker-compose up -d
```

This will start the backend, frontend, and database services.

### Running Locally

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run database migrations:

```bash
python -m app.run_migrations
```

3. Initialize the database:

```bash
python -m app.run_init
```

4. Start the application:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Management

### Creating Migrations

To create a new migration:

```bash
python -m app.create_migration
```

### Running Migrations

To run migrations:

```bash
python -m app.run_migrations
```

### Migrating Existing Data

To migrate existing data from JSON files to the database:

```bash
python -m app.migrate_data
```

## Development

### Project Structure

- `app/`: Main application package
  - `main.py`: Application entry point
  - `database.py`: Database configuration
  - `models.py`: SQLAlchemy models
  - `schemas.py`: Pydantic schemas
  - `crud.py`: CRUD operations
  - `init_db.py`: Database initialization
  - `migrate_data.py`: Data migration
  - `run_migrations.py`: Migration runner
  - `create_migration.py`: Migration creator
  - `create_sample_data.py`: Sample data generator
  - `kaggle/`: Kaggle API integration
- `routes/`: API routes
  - `datasets.py`: Dataset management
  - `workflows.py`: Workflow management
  - `analysis.py`: Data analysis
  - `wrangling.py`: Data wrangling
- `migrations/`: Alembic migrations
  - `versions/`: Migration versions
  - `env.py`: Alembic environment
  - `script.py.mako`: Migration template
- `data/`: Data storage
  - `samples/`: Sample datasets
  - `kaggle/`: Kaggle datasets
- `uploads/`: Uploaded files
- `exports/`: Exported files 
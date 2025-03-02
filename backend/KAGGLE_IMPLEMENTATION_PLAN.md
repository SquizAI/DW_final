# Kaggle Integration Implementation Plan

This document outlines the detailed implementation plan for consolidating all Kaggle-related code into a single, well-organized structure under `/backend/app/kaggle/`.

## Current Code Analysis

### 1. `/backend/routes/kaggle.py`
- **Router Prefix**: `/api/kaggle`
- **Endpoints**:
  - `POST /api/kaggle/credentials`: Save Kaggle API credentials
  - `GET /api/kaggle/search`: Search for datasets on Kaggle
  - `POST /api/kaggle/download`: Download a dataset from Kaggle
- **Dependencies**: Requires SQLAlchemy Session for database operations
- **Features**:
  - Saves credentials to both `~/.kaggle/kaggle.json` and application directory
  - Searches for datasets using Kaggle API
  - Downloads datasets and creates database entries

### 2. `/backend/routes/kaggle_fixed.py`
- **Router Prefix**: No prefix (uses full paths)
- **Endpoints**:
  - `POST /api/kaggle/credentials`: Save Kaggle API credentials
  - `GET /api/kaggle/search`: Search for datasets on Kaggle
  - `POST /api/kaggle/download`: Download a dataset from Kaggle
- **Dependencies**: No database dependencies
- **Features**:
  - Similar to `kaggle.py` but with some fixes
  - Does not create database entries for downloaded datasets

### 3. `/backend/debug_kaggle_server.py`
- **Server Type**: Standalone FastAPI server
- **Endpoints**:
  - `GET /api/health`: Health check endpoint
  - `GET /api/kaggle/search`: Search for datasets on Kaggle (returns sample data)
  - `GET /kaggle/search`: Alternative path for search
  - `POST /api/kaggle/download`: Download a dataset from Kaggle (mock implementation)
  - `POST /kaggle/download`: Alternative path for download
- **Features**:
  - Mock implementation for testing without actual Kaggle API
  - Logs request headers and parameters
  - Returns sample datasets

### 4. `/backend/app/kaggle/`
- **Structure**: Well-organized modular components
- **Files**:
  - `__init__.py`: Exports all components
  - `auth.py`: Authentication with Kaggle API
  - `discovery.py`: Dataset discovery operations
  - `retrieval.py`: Dataset retrieval operations
  - `manipulation.py`: Dataset manipulation operations
  - `competitions.py`: Competition integration
  - `users.py`: User management
  - `local.py`: Local dataset management
  - `router.py`: FastAPI router for all Kaggle endpoints
- **Features**:
  - Comprehensive implementation of Kaggle API integration
  - Modular design with clear separation of concerns
  - Extensive error handling and logging
  - Support for various Kaggle features beyond just dataset search and download

## Implementation Steps

### 1. Update Router Implementation

The current `/backend/app/kaggle/router.py` is already comprehensive, but we need to ensure it covers all the functionality from the other implementations:

1. **Verify Endpoints**:
   - Ensure all endpoints from `kaggle.py` and `kaggle_fixed.py` are covered
   - Check for any differences in parameter handling or response formats

2. **Database Integration**:
   - Add database dependencies where needed
   - Ensure downloaded datasets are properly registered in the database

3. **Path Consistency**:
   - Ensure all endpoints use the correct path prefix (`/api/kaggle`)
   - Add alternative paths if needed for backward compatibility

### 2. Create Debug Module

Create a new file `/backend/app/kaggle/debug.py` to incorporate the functionality from `debug_kaggle_server.py`:

```python
"""
Kaggle Debug Module

This module provides mock implementations for testing Kaggle API integration
without requiring actual Kaggle credentials or API access.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

logger = logging.getLogger(__name__)

# Sample Kaggle datasets
SAMPLE_DATASETS = [
    {
        "ref": "heptapod/titanic",
        "title": "Titanic",
        "size": "11KB",
        "lastUpdated": "2017-05-16 08:14:22",
        "downloadCount": 102385,
        "description": "Suited for binary logistic regression",
        "url": "https://www.kaggle.com/datasets/heptapod/titanic"
    },
    # ... other sample datasets
]

def create_debug_app():
    """Create a FastAPI app with mock Kaggle endpoints"""
    app = FastAPI(
        title="Debug Kaggle API Server",
        description="A simple server for debugging Kaggle API integration",
        version="1.0.0"
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Health check endpoint
    @app.get("/api/health")
    async def health_check():
        """Health check endpoint"""
        return {"status": "healthy", "version": "1.0.0"}
    
    # Kaggle search endpoint
    @app.get("/api/kaggle/search")
    async def search_datasets(query: str = ""):
        """Search for datasets on Kaggle"""
        logger.info(f"Received search request with query: {query}")
        return SAMPLE_DATASETS
    
    # Alternative path
    @app.get("/kaggle/search")
    async def search_datasets_alt(query: str = ""):
        """Search for datasets on Kaggle (alternative path)"""
        logger.info(f"Received search request with query: {query} (alternative path)")
        return SAMPLE_DATASETS
    
    # Kaggle download endpoint
    @app.post("/api/kaggle/download")
    async def download_dataset(dataset_ref: str):
        """Download a dataset from Kaggle"""
        logger.info(f"Received download request for dataset: {dataset_ref}")
        return {
            "message": "Dataset downloaded successfully",
            "dataset_id": f"kaggle_{dataset_ref.replace('/', '_')}",
            "name": f"Kaggle: {dataset_ref.split('/')[-1]}",
            "file_path": f"data/kaggle/{dataset_ref.replace('/', '/')}/dataset.csv"
        }
    
    # Alternative path
    @app.post("/kaggle/download")
    async def download_dataset_alt(dataset_ref: str):
        """Download a dataset from Kaggle (alternative path)"""
        logger.info(f"Received download request for dataset: {dataset_ref} (alternative path)")
        return {
            "message": "Dataset downloaded successfully",
            "dataset_id": f"kaggle_{dataset_ref.replace('/', '_')}",
            "name": f"Kaggle: {dataset_ref.split('/')[-1]}",
            "file_path": f"data/kaggle/{dataset_ref.replace('/', '/')}/dataset.csv"
        }
    
    return app

def run_debug_server():
    """Run the debug server"""
    # Create data directory
    os.makedirs("data/kaggle", exist_ok=True)
    
    # Create app
    app = create_debug_app()
    
    # Run the server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )

if __name__ == "__main__":
    run_debug_server()
```

### 3. Update Main Application

Update `/backend/app/main.py` to use the consolidated Kaggle router:

```python
# Import the Kaggle router
from app.kaggle import kaggle_router

# Include the router in the application
app.include_router(kaggle_router)
```

### 4. Create Debug Server Script

Create a new script `/backend/run_kaggle_debug_server.py` to run the debug server:

```python
"""
Run Kaggle Debug Server

This script runs a debug server for testing Kaggle API integration
without requiring actual Kaggle credentials or API access.
"""

from app.kaggle.debug import run_debug_server

if __name__ == "__main__":
    run_debug_server()
```

### 5. Update Documentation

Update the README in `/backend/app/kaggle/` to include information about the debug server:

```markdown
## Debug Server

For testing without actual Kaggle API access, you can use the debug server:

```python
from app.kaggle.debug import create_debug_app

# Create a FastAPI app with mock Kaggle endpoints
app = create_debug_app()
```

Or run the debug server directly:

```bash
python run_kaggle_debug_server.py
```

This will start a server with mock implementations of the Kaggle API endpoints.
```

### 6. Clean Up

Remove the following files:
- `/backend/routes/kaggle.py`
- `/backend/routes/kaggle_fixed.py`
- `/backend/debug_kaggle_server.py`

### 7. Testing

1. **Run Tests**:
   - Run the test script `/backend/test_kaggle_integration.py`
   - Verify that all tests pass

2. **Manual Testing**:
   - Start the application
   - Test the Kaggle API endpoints
   - Verify that the functionality works as expected

## Implementation Timeline

1. **Update Router Implementation**: 1 day
2. **Create Debug Module**: 0.5 day
3. **Update Main Application**: 0.5 day
4. **Create Debug Server Script**: 0.5 day
5. **Update Documentation**: 0.5 day
6. **Clean Up**: 0.5 day
7. **Testing**: 1 day

**Total Estimated Time**: 4.5 days 
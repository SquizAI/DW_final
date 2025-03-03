from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import logging
from dotenv import load_dotenv
import uvicorn
from pathlib import Path

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routes import datasets, analysis, wrangling, landing, workflows, dataset_organization, data_management

# Import the Kaggle router
from app.kaggle.router import router as kaggle_router

# Import our API router
from app.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Data Whisperer",
    description="Intelligent data science platform with agentic topology for workflow orchestration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],  # Frontend Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handling middleware
@app.middleware("http")
async def error_handling_middleware(request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Unhandled error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error. Please check the logs for more details."
        )

# Include routers with proper prefixes
app.include_router(
    landing.router,  # Include landing router first
    tags=["landing"]
)

app.include_router(
    workflows.router,  # Add workflows router
    tags=["workflows"]
)

app.include_router(
    datasets.router,
    prefix="/api",
    tags=["datasets"]
)

app.include_router(
    dataset_organization.router,
    prefix="/api",
    tags=["dataset_organization"]
)

app.include_router(
    data_management.router,
    prefix="/api",
    tags=["data_management"]
)

app.include_router(
    analysis.router,
    prefix="/api/data",
    tags=["analysis"]
)

app.include_router(
    wrangling.router,
    prefix="/api/data",
    tags=["wrangling"]
)

# Add the Kaggle router to the app
app.include_router(kaggle_router, prefix="/api")

# Add our API router
app.include_router(api_router, prefix="/api")

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify API status"""
    try:
        # Use local data directory path instead of environment variable
        current_dir = Path(os.path.dirname(os.path.abspath(__file__)))
        data_dir = current_dir / "data"
        
        # Create data directory if it doesn't exist
        if not data_dir.exists():
            data_dir.mkdir(parents=True, exist_ok=True)
        
        # Check if Kaggle credentials are configured
        kaggle_username = os.getenv('KAGGLE_USERNAME')
        kaggle_key = os.getenv('KAGGLE_KEY')
        
        # Check if data directory is writable
        test_file = data_dir / '.test'
        try:
            with open(test_file, 'w') as f:
                f.write('test')
            test_file.unlink()  # Remove the test file
            is_writable = True
        except Exception as e:
            logger.error(f"Data directory write test failed: {str(e)}")
            is_writable = False
        
        return {
            "status": "healthy",
            "version": "1.0.0",
            "data_dir": {
                "path": str(data_dir),
                "exists": data_dir.exists(),
                "writable": is_writable
            },
            "kaggle_configured": bool(kaggle_username and kaggle_key)
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Health check failed: {str(e)}"
        )

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.getenv('PORT', 8000))
    
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    ) 
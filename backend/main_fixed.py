from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import logging
from dotenv import load_dotenv
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Data Wrangling API",
    description="API for data wrangling, analysis, and Kaggle integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend Vite dev server
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

# Import routes directly
from routes.kaggle_fixed import router as kaggle_router

# Include the Kaggle router
app.include_router(kaggle_router)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify API status"""
    try:
        # Check if data directory exists and is writable
        data_dir = os.getenv('DATA_DIR', 'data')
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        
        # Check if Kaggle credentials are configured
        kaggle_username = os.getenv('KAGGLE_USERNAME')
        kaggle_key = os.getenv('KAGGLE_KEY')
        
        # Check if data directory is writable
        test_file = os.path.join(data_dir, '.test')
        try:
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)
            is_writable = True
        except:
            is_writable = False
        
        return {
            "status": "healthy",
            "version": "1.0.0",
            "data_dir": {
                "exists": os.path.exists(data_dir),
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

# Simple endpoints for datasets and workflows
@app.get("/api/datasets")
async def get_datasets():
    """Get all datasets"""
    return []

@app.get("/api/workflows")
async def get_workflows():
    """Get all workflows"""
    return []

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.getenv('PORT', 8000))
    
    # Run the application
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    ) 
import os
import sys
import logging
import uvicorn
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_server():
    """Run the backend server"""
    logger.info("Starting backend server...")
    
    # Set environment variables for SQLite testing
    os.environ["USE_SQLITE_FOR_TESTING"] = "true"
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    
    # Set local paths for data directories
    current_dir = Path(__file__).parent.absolute()
    data_dir = current_dir / "data"
    uploads_dir = current_dir / "uploads"
    exports_dir = current_dir / "exports"
    
    # Create directories if they don't exist
    data_dir.mkdir(exist_ok=True)
    uploads_dir.mkdir(exist_ok=True)
    exports_dir.mkdir(exist_ok=True)
    
    # Set environment variables for local paths
    os.environ["DATA_DIR"] = str(data_dir)
    os.environ["UPLOAD_DIR"] = str(uploads_dir)
    os.environ["EXPORT_DIR"] = str(exports_dir)
    
    # Set Kaggle credentials from .env file
    from dotenv import load_dotenv
    load_dotenv()
    
    # Make sure Kaggle credentials are set
    kaggle_username = os.getenv('KAGGLE_USERNAME')
    kaggle_key = os.getenv('KAGGLE_KEY')
    
    if not kaggle_username or not kaggle_key:
        logger.warning("Kaggle credentials not found in environment variables")
        logger.warning("Setting default test credentials")
        os.environ['KAGGLE_USERNAME'] = 'mattysquarzoni'
        os.environ['KAGGLE_KEY'] = 'b4a1d95f67a5d2f482d1353f230a7009'
    
    # Initialize the database
    try:
        from init_db import init_db
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
    
    # Run the server
    try:
        logger.info("Starting uvicorn server...")
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="debug"
        )
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_server() 
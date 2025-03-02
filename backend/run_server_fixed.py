import os
import sys
import logging
import uvicorn
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Set environment variable to use SQLite for testing
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

def run_server():
    """Run the backend server"""
    logger.info("Starting backend server...")
    logger.info(f"Using database URL: {os.environ.get('DATABASE_URL')}")
    logger.info(f"Using data directory: {os.environ.get('DATA_DIR')}")
    
    # Initialize the database
    logger.info("Initializing database...")
    try:
        from init_db import init_db
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
    
    try:
        # Run the server
        uvicorn.run(
            "main_fixed:app",
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
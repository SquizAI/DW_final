import os
import sys
import logging
import subprocess
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_migrations():
    """Run database migrations using Alembic"""
    logger.info("Running database migrations")
    
    # Get the backend directory
    backend_dir = Path(os.path.dirname(os.path.dirname(__file__)))
    
    try:
        # Run Alembic migrations
        subprocess.run(
            ["alembic", "upgrade", "head"],
            cwd=str(backend_dir),
            check=True
        )
        logger.info("Database migrations completed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error running migrations: {e}")
        raise

if __name__ == "__main__":
    run_migrations() 
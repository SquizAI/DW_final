import os
import sys
import logging
import subprocess
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_migration():
    """Create an initial database migration using Alembic"""
    logger.info("Creating initial database migration")
    
    # Get the backend directory
    backend_dir = Path(os.path.dirname(os.path.dirname(__file__)))
    
    try:
        # Create initial migration
        subprocess.run(
            ["alembic", "revision", "--autogenerate", "-m", "Initial migration"],
            cwd=str(backend_dir),
            check=True
        )
        logger.info("Initial migration created successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error creating migration: {e}")
        raise

if __name__ == "__main__":
    create_migration() 
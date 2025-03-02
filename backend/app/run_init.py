import logging
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """Run the initialization process"""
    logger.info("Starting initialization process")
    
    # Test database connection
    logger.info("Testing database connection")
    try:
        from .test_db import test_database_connection
        if not test_database_connection():
            logger.error("Database connection test failed, aborting initialization")
            return
    except Exception as e:
        logger.error(f"Error testing database connection: {str(e)}")
        raise
    
    # Create sample data directory
    sample_dir = Path(os.path.dirname(os.path.dirname(__file__))) / "data" / "samples"
    sample_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate sample data files
    logger.info("Generating sample data files")
    try:
        from .create_sample_data import main as create_sample_data
        create_sample_data()
    except Exception as e:
        logger.error(f"Error generating sample data: {str(e)}")
        raise
    
    # Run database migrations
    logger.info("Running database migrations")
    try:
        from .run_migrations import run_migrations
        run_migrations()
    except Exception as e:
        logger.error(f"Error running migrations: {str(e)}")
        raise
    
    # Migrate existing data to database
    logger.info("Migrating existing data to database")
    try:
        from .migrate_data import main as migrate_data
        migrate_data()
    except Exception as e:
        logger.error(f"Error migrating data: {str(e)}")
        raise
    
    # Initialize database
    logger.info("Initializing database")
    try:
        from .init_db import main as init_db
        init_db()
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise
    
    logger.info("Initialization process completed successfully")

if __name__ == "__main__":
    main() 
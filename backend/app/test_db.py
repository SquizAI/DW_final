import os
import logging
from sqlalchemy import text
from .database import engine, SessionLocal

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_database_connection():
    """Test the database connection"""
    logger.info("Testing database connection")
    
    try:
        # Get database URL from environment
        db_url = os.getenv('DATABASE_URL', 'sqlite:///./app.db')
        logger.info(f"Using database URL: {db_url}")
        
        # Test connection with a simple query
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            logger.info(f"Database connection successful: {result.scalar()}")
        
        # Test session creation
        db = SessionLocal()
        try:
            # Try to execute a simple query
            result = db.execute(text("SELECT 1")).scalar()
            logger.info(f"Database session successful: {result}")
        finally:
            db.close()
        
        logger.info("Database connection tests passed")
        return True
    
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_database_connection()
#!/usr/bin/env python
"""
Initialize Database

This script initializes the database by creating all tables.
"""

import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def init_db():
    """Initialize the database by creating all tables"""
    try:
        # Import database dependencies
        from app.database import engine, Base
        from app import models
        
        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Print created tables
        logger.info(f"Created tables: {', '.join(Base.metadata.tables.keys())}")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")

if __name__ == "__main__":
    init_db() 
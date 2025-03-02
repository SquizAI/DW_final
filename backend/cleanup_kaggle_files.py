#!/usr/bin/env python
"""
Clean Up Kaggle Files

This script removes the old Kaggle files that are no longer needed after the consolidation.
"""

import os
import sys
import logging
import shutil
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Files to remove
FILES_TO_REMOVE = [
    'routes/kaggle.py',
    'routes/kaggle_fixed.py',
    'debug_kaggle_server.py'
]

def cleanup_files():
    """Remove old Kaggle files"""
    logger.info("Cleaning up old Kaggle files...")
    
    # Get the backend directory
    backend_dir = Path(__file__).parent
    
    # Remove each file
    for file_path in FILES_TO_REMOVE:
        full_path = backend_dir / file_path
        if full_path.exists():
            if full_path.is_file():
                logger.info(f"Removing file: {full_path}")
                full_path.unlink()
            elif full_path.is_dir():
                logger.info(f"Removing directory: {full_path}")
                shutil.rmtree(full_path)
            logger.info(f"Removed: {file_path}")
        else:
            logger.info(f"File not found: {file_path}")
    
    logger.info("Cleanup completed")

if __name__ == "__main__":
    cleanup_files() 
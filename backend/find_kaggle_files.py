#!/usr/bin/env python
"""
Find Kaggle Files

This script helps locate downloaded Kaggle files in the data directory.
"""

import os
import sys
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def find_kaggle_files():
    """Find downloaded Kaggle files"""
    logger.info("Searching for downloaded Kaggle files...")
    
    # Get the current directory
    current_dir = os.getcwd()
    logger.info(f"Current directory: {current_dir}")
    
    # Define possible data directories
    possible_dirs = [
        os.path.join(current_dir, "data"),
        os.path.join(current_dir, "backend", "data"),
        os.path.join(current_dir, "..", "data"),
        os.path.join(current_dir, "backend", "..", "data"),
    ]
    
    # Search for Kaggle files
    found_files = []
    
    for base_dir in possible_dirs:
        kaggle_dir = os.path.join(base_dir, "kaggle")
        if os.path.exists(kaggle_dir):
            logger.info(f"Found Kaggle directory: {kaggle_dir}")
            
            # Walk through the directory structure
            for root, dirs, files in os.walk(kaggle_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    file_size = os.path.getsize(file_path)
                    found_files.append({
                        "path": file_path,
                        "size": file_size,
                        "name": file
                    })
    
    # Print the results
    if found_files:
        logger.info(f"Found {len(found_files)} Kaggle files:")
        for i, file in enumerate(found_files):
            size_str = format_file_size(file["size"])
            logger.info(f"{i+1}. {file['name']} ({size_str}): {file['path']}")
    else:
        logger.info("No Kaggle files found.")
        logger.info("Searched directories:")
        for dir_path in possible_dirs:
            logger.info(f"- {dir_path}")

def format_file_size(bytes):
    """Format file size for better readability"""
    if bytes == 0:
        return "0 Bytes"
    
    k = 1024
    sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    i = int(math.floor(math.log(bytes) / math.log(k)))
    
    return f"{bytes / (k ** i):.2f} {sizes[i]}"

if __name__ == "__main__":
    # Import math here to avoid polluting the global namespace
    import math
    
    find_kaggle_files() 
#!/usr/bin/env python
"""
Run Server with Kaggle API

This script runs the backend server with the consolidated Kaggle API implementation.
It ensures all Kaggle API endpoints are properly set up and available to the main application.
"""

import os
import sys
import logging
import uvicorn
from pathlib import Path
import json
import shutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_server():
    """Run the backend server with Kaggle API integration"""
    logger.info("Starting backend server with Kaggle API integration...")
    
    # Get the backend directory
    backend_dir = Path(__file__).parent.absolute()
    
    # Set environment variables
    os.environ["DATA_DIR"] = str(backend_dir / "data")
    os.environ["UPLOAD_DIR"] = str(backend_dir / "uploads")
    os.environ["EXPORT_DIR"] = str(backend_dir / "exports")
    
    # Create necessary directories
    os.makedirs(os.environ["DATA_DIR"], exist_ok=True)
    os.makedirs(os.path.join(os.environ["DATA_DIR"], "kaggle"), exist_ok=True)
    os.makedirs(os.environ["UPLOAD_DIR"], exist_ok=True)
    os.makedirs(os.environ["EXPORT_DIR"], exist_ok=True)
    
    # Check for Kaggle credentials
    kaggle_username = os.environ.get("KAGGLE_USERNAME")
    kaggle_key = os.environ.get("KAGGLE_KEY")
    
    if not kaggle_username or not kaggle_key:
        logger.warning("Kaggle credentials not found in environment variables")
        logger.warning("You can set them using:")
        logger.warning("  export KAGGLE_USERNAME=your_username")
        logger.warning("  export KAGGLE_KEY=your_api_key")
        logger.warning("Or by creating a .env file with these variables")
        
        # Try to load from .env file
        try:
            from dotenv import load_dotenv
            load_dotenv()
            
            # Check again after loading .env
            kaggle_username = os.environ.get("KAGGLE_USERNAME")
            kaggle_key = os.environ.get("KAGGLE_KEY")
            
            if kaggle_username and kaggle_key:
                logger.info("Loaded Kaggle credentials from .env file")
            else:
                logger.warning("Could not load Kaggle credentials from .env file")
        except ImportError:
            logger.warning("python-dotenv not installed, skipping .env file loading")
    
    # Initialize Kaggle API
    if kaggle_username and kaggle_key:
        # Create kaggle directory if it doesn't exist
        kaggle_dir = os.path.join(os.path.expanduser("~"), ".kaggle")
        os.makedirs(kaggle_dir, exist_ok=True)
        
        # Save credentials to kaggle.json
        kaggle_json_path = os.path.join(kaggle_dir, "kaggle.json")
        with open(kaggle_json_path, "w") as f:
            f.write(f'{{"username":"{kaggle_username}","key":"{kaggle_key}"}}')
        
        # Set permissions to 600 (required by Kaggle)
        os.chmod(kaggle_json_path, 0o600)
        
        logger.info(f"Saved Kaggle credentials for user {kaggle_username}")
        
        # Verify Kaggle API installation
        try:
            import kaggle
            from kaggle.api.kaggle_api_extended import KaggleApi
            logger.info("Kaggle API package is installed")
            
            # Test authentication
            try:
                api = KaggleApi()
                api.authenticate()
                logger.info("Kaggle API authentication successful")
            except Exception as e:
                logger.error(f"Kaggle API authentication failed: {str(e)}")
                logger.error("Please check your credentials and try again")
        except ImportError:
            logger.error("Kaggle API package is not installed")
            logger.error("Please install it using: pip install kaggle")
            logger.error("Then run this script again")
    else:
        logger.warning("Running without Kaggle credentials - some features may not work")
        logger.warning("To use Kaggle integration, please set KAGGLE_USERNAME and KAGGLE_KEY")
    
    # Print usage instructions
    print("\n" + "="*80)
    print("KAGGLE INTEGRATION USAGE INSTRUCTIONS")
    print("="*80)
    print("\nThe Kaggle integration is now available in the main application.")
    print("You can access it through:")
    print("\n1. Data Upload Page: Click on the 'Kaggle Datasets' tab")
    print("2. Kaggle Manager: Navigate to /kaggle/manager in the application")
    print("\nMake sure your Kaggle credentials are properly set up to use all features.")
    print("="*80 + "\n")
    
    # Run the server
    logger.info("Starting server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    run_server() 
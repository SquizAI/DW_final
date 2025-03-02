import os
import sys
import logging
import json
from pathlib import Path
from kaggle.api.kaggle_api_extended import KaggleApi

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def setup_kaggle_credentials():
    """Set up Kaggle credentials"""
    # Set Kaggle credentials
    username = os.getenv('KAGGLE_USERNAME', 'mattysquarzoni')
    key = os.getenv('KAGGLE_KEY', 'b4a1d95f67a5d2f482d1353f230a7009')
    
    logger.info(f"Using Kaggle credentials: username={username}, key={key[:4]}...")
    
    # Set environment variables
    os.environ['KAGGLE_USERNAME'] = username
    os.environ['KAGGLE_KEY'] = key
    
    # Create kaggle directory if it doesn't exist
    kaggle_dir = os.path.join(os.path.expanduser("~"), ".kaggle")
    os.makedirs(kaggle_dir, exist_ok=True)
    logger.info(f"Kaggle directory: {kaggle_dir}")
    
    # Save credentials to kaggle.json
    kaggle_json_path = os.path.join(kaggle_dir, "kaggle.json")
    with open(kaggle_json_path, "w") as f:
        f.write(f'{{"username":"{username}","key":"{key}"}}')
    
    # Set permissions to 600 (required by Kaggle)
    os.chmod(kaggle_json_path, 0o600)
    logger.info(f"Saved credentials to {kaggle_json_path}")
    
    return username, key

def test_kaggle_api():
    """Test the Kaggle API"""
    try:
        # Set up credentials
        setup_kaggle_credentials()
        
        # Initialize Kaggle API
        logger.info("Initializing Kaggle API...")
        api = KaggleApi()
        api.authenticate()
        logger.info("Kaggle API authenticated successfully")
        
        # Test search
        query = "titanic"
        logger.info(f"Searching for datasets with query: {query}")
        datasets = api.dataset_list(search=query)
        logger.info(f"Found {len(datasets)} datasets")
        
        # Print details of first few datasets
        for i, dataset in enumerate(datasets[:5]):
            logger.info(f"Dataset {i+1}:")
            logger.info(f"  Ref: {dataset.ref}")
            logger.info(f"  Title: {dataset.title}")
            logger.info(f"  Size: {dataset.size}")  # Size is already a string
            logger.info(f"  Last Updated: {dataset.lastUpdated}")
            logger.info(f"  Download Count: {dataset.downloadCount}")
            
            # Print all available attributes
            logger.info("  All attributes:")
            for attr in dir(dataset):
                if not attr.startswith('_') and not callable(getattr(dataset, attr)):
                    try:
                        value = getattr(dataset, attr)
                        logger.info(f"    {attr}: {value}")
                    except Exception as e:
                        logger.info(f"    {attr}: Error: {str(e)}")
        
        return True
    except Exception as e:
        logger.error(f"Error testing Kaggle API: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

def main():
    """Main function"""
    logger.info("Starting Kaggle API test...")
    
    # Test Kaggle API
    success = test_kaggle_api()
    
    if success:
        logger.info("Kaggle API test completed successfully")
    else:
        logger.error("Kaggle API test failed")

if __name__ == "__main__":
    main() 
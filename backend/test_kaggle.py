import os
import logging
import kaggle
from kaggle.api.kaggle_api_extended import KaggleApi
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_kaggle_api():
    """Test the Kaggle API connection"""
    try:
        # Load environment variables
        load_dotenv()
        
        # Get Kaggle credentials from environment
        username = os.getenv('KAGGLE_USERNAME')
        key = os.getenv('KAGGLE_KEY')
        
        if not username or not key:
            logger.error("Kaggle credentials not found in environment variables")
            return False
        
        logger.info(f"Using Kaggle credentials: username={username}, key={key[:4]}...")
        
        # Set Kaggle credentials in environment
        os.environ['KAGGLE_USERNAME'] = username
        os.environ['KAGGLE_KEY'] = key
        
        # Create kaggle directory if it doesn't exist
        kaggle_dir = os.path.join(os.path.expanduser("~"), ".kaggle")
        os.makedirs(kaggle_dir, exist_ok=True)
        
        # Save credentials to kaggle.json
        kaggle_json_path = os.path.join(kaggle_dir, "kaggle.json")
        with open(kaggle_json_path, "w") as f:
            f.write(f'{{"username":"{username}","key":"{key}"}}')
        
        # Set permissions to 600 (required by Kaggle)
        os.chmod(kaggle_json_path, 0o600)
        
        # Initialize Kaggle API
        api = KaggleApi()
        api.authenticate()
        
        # Test API by searching for datasets
        logger.info("Testing Kaggle API by searching for datasets...")
        datasets = api.dataset_list(search="cars")
        
        if datasets:
            logger.info(f"Successfully found {len(datasets)} datasets")
            for i, dataset in enumerate(datasets[:3]):  # Show first 3 datasets
                logger.info(f"Dataset {i+1}: {dataset.ref} - {dataset.title}")
            return True
        else:
            logger.warning("No datasets found")
            return False
        
    except Exception as e:
        logger.error(f"Kaggle API test failed: {str(e)}")
        return False

if __name__ == "__main__":
    if test_kaggle_api():
        print("Kaggle API test passed!")
    else:
        print("Kaggle API test failed!") 
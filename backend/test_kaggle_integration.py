"""
Test script for Kaggle API integration.

This script tests the various components of the Kaggle API integration.
"""

import os
import sys
import logging
import asyncio
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

from app.kaggle.auth import KaggleAuth
from app.kaggle.discovery import DatasetDiscovery, DatasetSortBy
from app.kaggle.retrieval import DatasetRetrieval
from app.kaggle.local import LocalDatasetManagement
from app.kaggle.competitions import CompetitionIntegration
from app.kaggle.users import UserManagement

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_auth():
    """Test Kaggle authentication"""
    logger.info("Testing Kaggle authentication...")
    
    auth = KaggleAuth()
    success, error = auth.authenticate()
    
    if success:
        logger.info("Authentication successful!")
        return True
    else:
        logger.error(f"Authentication failed: {error}")
        return False

async def test_dataset_discovery():
    """Test dataset discovery"""
    logger.info("Testing dataset discovery...")
    
    auth = KaggleAuth()
    discovery = DatasetDiscovery(auth=auth)
    
    # Search for datasets
    query = "titanic"
    logger.info(f"Searching for datasets with query: {query}")
    
    datasets = await discovery.search_datasets(
        query=query,
        sort_by=DatasetSortBy.DOWNLOADS,
        page_size=5
    )
    
    if datasets:
        logger.info(f"Found {len(datasets)} datasets")
        for i, dataset in enumerate(datasets):
            logger.info(f"Dataset {i+1}: {dataset.title} ({dataset.ref})")
        return True
    else:
        logger.error("No datasets found")
        return False

async def test_dataset_retrieval():
    """Test dataset retrieval"""
    logger.info("Testing dataset retrieval...")
    
    auth = KaggleAuth()
    retrieval = DatasetRetrieval(auth=auth)
    
    # Download a dataset
    dataset_ref = "heptapod/titanic"
    logger.info(f"Downloading dataset: {dataset_ref}")
    
    result = await retrieval.download_dataset(
        dataset_ref=dataset_ref,
        unzip=True,
        force=False
    )
    
    if result.get("success", False):
        logger.info(f"Dataset downloaded successfully to {result.get('download_path')}")
        logger.info(f"Files: {[f['name'] for f in result.get('files', [])]}")
        return True
    else:
        logger.error(f"Failed to download dataset: {result.get('message')}")
        return False

async def test_local_dataset_management():
    """Test local dataset management"""
    logger.info("Testing local dataset management...")
    
    auth = KaggleAuth()
    local_mgmt = LocalDatasetManagement(auth=auth)
    
    # List local datasets
    logger.info("Listing local datasets...")
    
    datasets = await local_mgmt.list_local_datasets()
    
    if datasets:
        logger.info(f"Found {len(datasets)} local datasets")
        for i, dataset in enumerate(datasets):
            logger.info(f"Dataset {i+1}: {dataset.title} ({dataset.ref})")
        
        # Get details for the first dataset
        dataset_ref = datasets[0].ref
        logger.info(f"Getting details for dataset: {dataset_ref}")
        
        dataset = await local_mgmt.get_local_dataset(dataset_ref)
        logger.info(f"Dataset details: {dataset.title}, {dataset.file_count} files, {dataset.size_bytes} bytes")
        
        return True
    else:
        logger.info("No local datasets found")
        
        # Register a test dataset
        dataset_ref = "test/dataset"
        title = "Test Dataset"
        
        logger.info(f"Registering test dataset: {dataset_ref}")
        
        # Create test directory and file
        dataset_path = os.path.join(local_mgmt.kaggle_dir, "test", "dataset")
        os.makedirs(dataset_path, exist_ok=True)
        
        with open(os.path.join(dataset_path, "test.csv"), "w") as f:
            f.write("id,value\n1,100\n2,200\n3,300\n")
        
        # Register dataset
        dataset = await local_mgmt.register_dataset(
            dataset_ref=dataset_ref,
            title=title,
            metadata={"source": "test"}
        )
        
        logger.info(f"Dataset registered: {dataset.title} ({dataset.ref})")
        
        # Unregister dataset
        result = await local_mgmt.unregister_dataset(
            dataset_ref=dataset_ref,
            delete_files=True
        )
        
        logger.info(f"Dataset unregistered: {result.get('message')}")
        
        return True

async def test_competitions():
    """Test competition integration"""
    logger.info("Testing competition integration...")
    
    auth = KaggleAuth()
    competition = CompetitionIntegration(auth=auth)
    
    # List competitions
    logger.info("Listing competitions...")
    
    competitions = await competition.list_competitions(
        sort_by="latestDeadline",
        page=1
    )
    
    if competitions:
        logger.info(f"Found {len(competitions)} competitions")
        for i, comp in enumerate(competitions[:3]):
            logger.info(f"Competition {i+1}: {comp.title} ({comp.ref})")
        
        # Get details for the first competition
        competition_ref = competitions[0].ref
        logger.info(f"Getting details for competition: {competition_ref}")
        
        comp_details = await competition.get_competition_details(competition_ref)
        logger.info(f"Competition details: {comp_details.title}, deadline: {comp_details.deadline}")
        
        return True
    else:
        logger.error("No competitions found")
        return False

async def test_users():
    """Test user management"""
    logger.info("Testing user management...")
    
    auth = KaggleAuth()
    user_mgmt = UserManagement(auth=auth)
    
    # Get current user profile
    logger.info("Getting current user profile...")
    
    try:
        user = await user_mgmt.get_current_user_profile()
        logger.info(f"Current user: {user.displayName} ({user.username})")
        
        # List user datasets
        logger.info(f"Listing datasets for user: {user.username}")
        
        datasets = await user_mgmt.list_user_datasets(user.username)
        
        if datasets:
            logger.info(f"Found {len(datasets)} datasets")
            for i, dataset in enumerate(datasets[:3]):
                logger.info(f"Dataset {i+1}: {dataset.get('title')} ({dataset.get('ref')})")
        else:
            logger.info("No datasets found for user")
        
        return True
    except Exception as e:
        logger.error(f"Failed to get user profile: {str(e)}")
        return False

async def main():
    """Main test function"""
    logger.info("Starting Kaggle API integration tests...")
    
    # Test authentication
    auth_result = await test_auth()
    if not auth_result:
        logger.error("Authentication test failed, aborting further tests")
        return
    
    # Test dataset discovery
    discovery_result = await test_dataset_discovery()
    
    # Test dataset retrieval
    retrieval_result = await test_dataset_retrieval()
    
    # Test local dataset management
    local_mgmt_result = await test_local_dataset_management()
    
    # Test competitions
    competitions_result = await test_competitions()
    
    # Test users
    users_result = await test_users()
    
    # Print test results
    logger.info("\n=== TEST RESULTS ===")
    logger.info(f"Authentication: {'PASS' if auth_result else 'FAIL'}")
    logger.info(f"Dataset Discovery: {'PASS' if discovery_result else 'FAIL'}")
    logger.info(f"Dataset Retrieval: {'PASS' if retrieval_result else 'FAIL'}")
    logger.info(f"Local Dataset Management: {'PASS' if local_mgmt_result else 'FAIL'}")
    logger.info(f"Competitions: {'PASS' if competitions_result else 'FAIL'}")
    logger.info(f"Users: {'PASS' if users_result else 'FAIL'}")
    
    # Overall result
    overall_result = all([
        auth_result,
        discovery_result,
        retrieval_result,
        local_mgmt_result,
        competitions_result,
        users_result
    ])
    
    logger.info(f"\nOverall Result: {'PASS' if overall_result else 'FAIL'}")

if __name__ == "__main__":
    asyncio.run(main()) 
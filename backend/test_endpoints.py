import requests
import logging
import time
import os
import sys
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Base URL for API
BASE_URL = "http://localhost:8000/api"

def test_health_endpoint():
    """Test the health check endpoint"""
    logger.info("Testing health check endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            logger.info(f"Health check response: {response.json()}")
            return True
        else:
            logger.error(f"Health check failed with status code: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return False

def test_kaggle_endpoint():
    """Test the Kaggle search endpoint"""
    logger.info("Testing Kaggle search endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/kaggle/search?query=cars")
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Kaggle search response: Found {len(data)} datasets")
            if len(data) > 0:
                logger.info(f"First dataset: {data[0].get('title', 'Unknown')}")
            return True
        else:
            logger.error(f"Kaggle search failed with status code: {response.status_code}")
            logger.error(f"Response: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Kaggle search failed: {str(e)}")
        return False

def test_datasets_endpoint():
    """Test the datasets endpoint"""
    logger.info("Testing datasets endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/datasets")
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Datasets response: {data}")
            return True
        else:
            logger.error(f"Datasets endpoint failed with status code: {response.status_code}")
            logger.error(f"Response: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Datasets endpoint failed: {str(e)}")
        return False

def test_workflows_endpoint():
    """Test the workflows endpoint"""
    logger.info("Testing workflows endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/workflows")
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Workflows response: {data}")
            return True
        else:
            logger.error(f"Workflows endpoint failed with status code: {response.status_code}")
            logger.error(f"Response: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Workflows endpoint failed: {str(e)}")
        return False

def main():
    """Run the test"""
    logger.info("Starting test...")
    
    # Make sure the server is running
    logger.info("Checking if server is running...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        if response.status_code != 200:
            logger.error("Server is not running or not responding correctly")
            return
    except:
        logger.error("Server is not running. Please start the server first with 'python run_server_fixed.py'")
        return
    
    # Test the health endpoint
    health_result = test_health_endpoint()
    
    # Test the Kaggle endpoint
    kaggle_result = test_kaggle_endpoint()
    
    # Test the datasets endpoint
    datasets_result = test_datasets_endpoint()
    
    # Test the workflows endpoint
    workflows_result = test_workflows_endpoint()
    
    # Print summary
    logger.info("\n=== TEST RESULTS ===")
    logger.info(f"Health Check: {'PASS' if health_result else 'FAIL'}")
    logger.info(f"Kaggle Endpoint: {'PASS' if kaggle_result else 'FAIL'}")
    logger.info(f"Datasets Endpoint: {'PASS' if datasets_result else 'FAIL'}")
    logger.info(f"Workflows Endpoint: {'PASS' if workflows_result else 'FAIL'}")
    
    # Overall result
    overall_result = all([health_result, kaggle_result, datasets_result, workflows_result])
    logger.info(f"\nOverall Result: {'PASS' if overall_result else 'FAIL'}")

if __name__ == "__main__":
    main() 
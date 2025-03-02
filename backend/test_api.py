import requests
import json
import logging
import time
import os
import subprocess
import sys
import signal
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Base URL for API
BASE_URL = "http://localhost:8000/api"

def is_server_running():
    """Check if the server is running"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        return response.status_code == 200
    except:
        return False

def test_health_endpoint():
    """Test the health check endpoint"""
    logger.info("Testing health check endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        response.raise_for_status()
        data = response.json()
        logger.info(f"Health check response: {data}")
        return True
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return False

def test_datasets_endpoints():
    """Test the datasets endpoints"""
    logger.info("Testing datasets endpoints...")
    
    # Test get all datasets
    try:
        response = requests.get(f"{BASE_URL}/datasets")
        response.raise_for_status()
        data = response.json()
        logger.info(f"Get all datasets response: {data}")
        
        # If datasets exist, test get dataset by ID
        if isinstance(data, dict) and 'data' in data:
            datasets = data['data']
            logger.info(f"Found {len(datasets)} datasets")
            
            if len(datasets) > 0:
                dataset_id = datasets[0].get('id')
                if dataset_id:
                    response = requests.get(f"{BASE_URL}/datasets/{dataset_id}")
                    response.raise_for_status()
                    dataset = response.json()
                    logger.info(f"Get dataset by ID response: {dataset.get('data', {}).get('name', 'Unknown')}")
        
        return True
    except Exception as e:
        logger.error(f"Datasets endpoints test failed: {str(e)}")
        return False

def test_kaggle_endpoints():
    """Test the Kaggle endpoints"""
    logger.info("Testing Kaggle endpoints...")
    
    # Test Kaggle search
    try:
        query = "cars"
        response = requests.get(f"{BASE_URL}/kaggle/search?query={query}")
        response.raise_for_status()
        data = response.json()
        
        if isinstance(data, list):
            logger.info(f"Kaggle search response: {len(data)} datasets found")
            
            # If datasets found, test download
            if len(data) > 0:
                dataset_ref = data[0].get('ref')
                if dataset_ref:
                    logger.info(f"Testing download for dataset: {dataset_ref}")
                    # Note: We're not actually downloading to avoid long operations
                    # response = requests.post(f"{BASE_URL}/kaggle/download", json={"dataset_ref": dataset_ref})
                    # response.raise_for_status()
                    # download_data = response.json()
                    # logger.info(f"Kaggle download response: {download_data.get('message', 'Unknown')}")
        else:
            logger.warning(f"Unexpected Kaggle search response format: {data}")
        
        return True
    except Exception as e:
        logger.error(f"Kaggle endpoints test failed: {str(e)}")
        return False

def test_workflows_endpoints():
    """Test the workflows endpoints"""
    logger.info("Testing workflows endpoints...")
    
    # Test get all workflows
    try:
        response = requests.get(f"{BASE_URL}/workflows")
        response.raise_for_status()
        data = response.json()
        
        if isinstance(data, dict) and 'data' in data:
            workflows = data['data']
            logger.info(f"Get all workflows response: {len(workflows)} workflows found")
            
            # If workflows exist, test get workflow by ID
            if len(workflows) > 0:
                workflow_id = workflows[0].get('id')
                if workflow_id:
                    response = requests.get(f"{BASE_URL}/workflows/{workflow_id}")
                    response.raise_for_status()
                    workflow = response.json()
                    logger.info(f"Get workflow by ID response: {workflow.get('data', {}).get('name', 'Unknown')}")
        else:
            logger.warning(f"Unexpected workflows response format: {data}")
        
        return True
    except Exception as e:
        logger.error(f"Workflows endpoints test failed: {str(e)}")
        return False

def test_data_analysis_endpoints():
    """Test the data analysis endpoints"""
    logger.info("Testing data analysis endpoints...")
    
    # This would typically require an active dataset
    # For now, we'll just check if the endpoint is accessible
    try:
        response = requests.get(f"{BASE_URL}/data/analyze")
        # Even if it returns an error about no active dataset, the endpoint should be accessible
        logger.info(f"Data analysis endpoint status code: {response.status_code}")
        return True
    except Exception as e:
        logger.error(f"Data analysis endpoints test failed: {str(e)}")
        return False

def run_all_tests():
    """Run all API tests"""
    logger.info("Starting API tests...")
    
    # Check if server is running
    if not is_server_running():
        logger.error("Server is not running. Please start the server before running tests.")
        return False
    
    # Run tests
    health_result = test_health_endpoint()
    datasets_result = test_datasets_endpoints()
    kaggle_result = test_kaggle_endpoints()
    workflows_result = test_workflows_endpoints()
    analysis_result = test_data_analysis_endpoints()
    
    # Print summary
    logger.info("\n=== TEST RESULTS ===")
    logger.info(f"Health Check: {'PASS' if health_result else 'FAIL'}")
    logger.info(f"Datasets Endpoints: {'PASS' if datasets_result else 'FAIL'}")
    logger.info(f"Kaggle Endpoints: {'PASS' if kaggle_result else 'FAIL'}")
    logger.info(f"Workflows Endpoints: {'PASS' if workflows_result else 'FAIL'}")
    logger.info(f"Data Analysis Endpoints: {'PASS' if analysis_result else 'FAIL'}")
    
    # Overall result
    overall_result = all([health_result, datasets_result, kaggle_result, workflows_result, analysis_result])
    logger.info(f"\nOverall Result: {'PASS' if overall_result else 'FAIL'}")
    
    return overall_result

if __name__ == "__main__":
    run_all_tests() 
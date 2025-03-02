import requests
import logging
import time
import os
from pathlib import Path
import subprocess
import sys
import signal
import threading

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Base URL for API
BASE_URL = "http://localhost:8000/api"

# Server process and output threads
server_process = None
stdout_thread = None
stderr_thread = None

def read_process_output(process, prefix="SERVER:"):
    """Read and log the output from the server process"""
    for line in iter(process.stdout.readline, b''):
        if line:
            logger.info(f"{prefix} {line.decode('utf-8').strip()}")

def read_process_error(process, prefix="SERVER ERROR:"):
    """Read and log the error output from the server process"""
    for line in iter(process.stderr.readline, b''):
        if line:
            logger.error(f"{prefix} {line.decode('utf-8').strip()}")

def start_server():
    """Start the backend server"""
    global server_process, stdout_thread, stderr_thread
    
    logger.info("Starting backend server...")
    
    # Set environment variables for SQLite testing
    os.environ['DB_TYPE'] = 'sqlite'
    os.environ['SQLITE_DB_PATH'] = 'test.db'
    os.environ['DATA_DIR'] = './data'
    
    # Start the server with debug log level
    server_process = subprocess.Popen(
        ["python", "run_server.py", "--log-level", "debug"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=False,
        bufsize=1
    )
    
    # Create threads to read and log server output
    stdout_thread = threading.Thread(target=read_process_output, args=(server_process,))
    stderr_thread = threading.Thread(target=read_process_error, args=(server_process,))
    
    stdout_thread.daemon = True
    stderr_thread.daemon = True
    
    stdout_thread.start()
    stderr_thread.start()
    
    # Wait for server to start
    logger.info("Waiting for server to start...")
    time.sleep(3)

def stop_server():
    """Stop the backend server"""
    global server_process
    if server_process:
        logger.info("Stopping backend server...")
        server_process.terminate()
        server_process.wait(timeout=5)
        server_process = None

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:8000/api/health")
        if response.status_code == 200:
            logger.info(f"Health check response: {response.json()}")
            return True
        else:
            logger.error(f"Health check failed with status code: {response.status_code}")
            logger.error(f"Response: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error testing health endpoint: {str(e)}")
        return False

def test_kaggle_endpoint():
    """Test the Kaggle search endpoint"""
    try:
        # Use the correct endpoint URL from the OpenAPI schema
        response = requests.get("http://localhost:8000/api/kaggle/kaggle/search?query=cars")
        if response.status_code == 200:
            results = response.json()
            logger.info(f"Kaggle search found {len(results)} datasets")
            if results and len(results) > 0:
                logger.info(f"First dataset title: {results[0]['title']}")
            return True
        else:
            logger.error(f"Kaggle search failed with status code: {response.status_code}")
            logger.error(f"Response: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error testing Kaggle endpoint: {str(e)}")
        return False

def test_datasets_endpoint():
    """Test the datasets endpoint"""
    try:
        response = requests.get("http://localhost:8000/api/datasets/")
        if response.status_code == 200:
            logger.info(f"Datasets endpoint response: {response.json()}")
            return True
        else:
            logger.error(f"Datasets endpoint failed with status code: {response.status_code}")
            logger.error(f"Response: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error testing datasets endpoint: {str(e)}")
        return False

def test_workflows_endpoint():
    """Test the workflows endpoint"""
    try:
        response = requests.get("http://localhost:8000/api/workflows/")
        if response.status_code == 200:
            logger.info(f"Workflows endpoint response: {response.json()}")
            return True
        else:
            logger.error(f"Workflows endpoint failed with status code: {response.status_code}")
            logger.error(f"Response: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error testing workflows endpoint: {str(e)}")
        return False

def main():
    """Main test function"""
    logger.info("Starting test...")
    
    # Start the server
    start_server()
    
    try:
        # Test endpoints
        health_result = test_health_endpoint()
        kaggle_result = test_kaggle_endpoint()
        datasets_result = test_datasets_endpoint()
        workflows_result = test_workflows_endpoint()
        
        # Print test results
        logger.info("=== TEST RESULTS ===")
        logger.info(f"Health Check: {'PASS' if health_result else 'FAIL'}")
        logger.info(f"Kaggle Search: {'PASS' if kaggle_result else 'FAIL'}")
        logger.info(f"Datasets: {'PASS' if datasets_result else 'FAIL'}")
        logger.info(f"Workflows: {'PASS' if workflows_result else 'FAIL'}")
        
        # Overall result
        overall_result = all([health_result, kaggle_result, datasets_result, workflows_result])
        logger.info(f"Overall Result: {'PASS' if overall_result else 'FAIL'}")
        
    finally:
        # Stop the server
        stop_server()

if __name__ == "__main__":
    main() 
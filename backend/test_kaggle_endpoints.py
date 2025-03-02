#!/usr/bin/env python
"""
Test Kaggle API Endpoints

This script tests the Kaggle API endpoints to verify that they are working correctly.
"""

import requests
import json
import sys

def test_kaggle_search():
    """Test the Kaggle search endpoint"""
    print("Testing Kaggle search endpoint...")
    
    # Make a request to the search endpoint
    response = requests.get("http://localhost:8000/api/kaggle/search?query=titanic")
    
    # Check if the request was successful
    if response.status_code == 200:
        # Parse the response
        data = response.json()
        
        # Print the results
        print(f"Found {len(data)} datasets")
        for i, dataset in enumerate(data[:3]):  # Print first 3 datasets
            print(f"Dataset {i+1}: {dataset.get('title')} ({dataset.get('ref')})")
        
        return True
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return False

def test_kaggle_download():
    """Test the Kaggle download endpoint"""
    print("\nTesting Kaggle download endpoint...")
    
    # Make a request to the download endpoint
    response = requests.post(
        "http://localhost:8000/api/kaggle/download",
        json={"dataset_ref": "heptapod/titanic"}
    )
    
    # Check if the request was successful
    if response.status_code == 200:
        # Parse the response
        data = response.json()
        
        # Print the results
        print(f"Download successful: {data.get('message')}")
        print(f"Dataset ID: {data.get('dataset_id')}")
        print(f"File path: {data.get('file_path')}")
        print(f"Files: {len(data.get('files', []))}")
        
        return True
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return False

def test_kaggle_download_status():
    """Test the Kaggle download status endpoint"""
    print("\nTesting Kaggle download status endpoint...")
    
    # Make a request to the download status endpoint
    response = requests.get("http://localhost:8000/api/kaggle/datasets/download/status/heptapod/titanic")
    
    # Check if the request was successful
    if response.status_code == 200:
        # Parse the response
        data = response.json()
        
        # Print the results
        print(f"Status: {data.get('status')}")
        print(f"Progress: {data.get('progress')}%")
        print(f"Files: {data.get('file_count')}")
        print(f"Total size: {data.get('total_size')} bytes")
        
        return True
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return False

def test_kaggle_local_datasets():
    """Test the Kaggle local datasets endpoint"""
    print("\nTesting Kaggle local datasets endpoint...")
    
    # Make a request to the local datasets endpoint
    response = requests.get("http://localhost:8000/api/kaggle/local/datasets")
    
    # Check if the request was successful
    if response.status_code == 200:
        # Parse the response
        data = response.json()
        
        # Print the results
        print(f"Found {len(data)} local datasets")
        for i, dataset in enumerate(data[:3]):  # Print first 3 datasets
            print(f"Dataset {i+1}: {dataset.get('title')} ({dataset.get('ref')})")
        
        return True
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return False

def main():
    """Run all tests"""
    print("=== Testing Kaggle API Endpoints ===\n")
    
    # Run the tests
    search_result = test_kaggle_search()
    download_result = test_kaggle_download()
    status_result = test_kaggle_download_status()
    local_result = test_kaggle_local_datasets()
    
    # Print the results
    print("\n=== Test Results ===")
    print(f"Search: {'PASS' if search_result else 'FAIL'}")
    print(f"Download: {'PASS' if download_result else 'FAIL'}")
    print(f"Download Status: {'PASS' if status_result else 'FAIL'}")
    print(f"Local Datasets: {'PASS' if local_result else 'FAIL'}")
    
    # Return success if all tests passed
    return all([search_result, download_result, status_result, local_result])

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 
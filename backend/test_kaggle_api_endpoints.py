#!/usr/bin/env python
"""
Test Kaggle API Endpoints

This script tests all Kaggle API endpoints to ensure they are working correctly.
It can be used to verify the consolidated Kaggle integration.
"""

import os
import sys
import logging
import asyncio
import json
import requests
from pathlib import Path
from typing import Dict, Any, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Base URL for API
BASE_URL = "http://localhost:8000/api"

class KaggleAPITester:
    """Class to test Kaggle API endpoints"""
    
    def __init__(self, base_url: str = BASE_URL):
        """Initialize the tester
        
        Args:
            base_url: Base URL for the API
        """
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = {}
    
    async def test_health(self) -> bool:
        """Test the health check endpoint
        
        Returns:
            True if the test passed, False otherwise
        """
        endpoint = f"{self.base_url}/health"
        logger.info(f"Testing health check endpoint: {endpoint}")
        
        try:
            response = self.session.get(endpoint)
            response.raise_for_status()
            data = response.json()
            
            logger.info(f"Health check response: {data}")
            self.test_results["health"] = {
                "status": "PASS",
                "response": data
            }
            return True
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            self.test_results["health"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    async def test_kaggle_auth_status(self) -> bool:
        """Test the Kaggle auth status endpoint
        
        Returns:
            True if the test passed, False otherwise
        """
        endpoint = f"{self.base_url}/kaggle/auth/status"
        logger.info(f"Testing Kaggle auth status endpoint: {endpoint}")
        
        try:
            response = self.session.get(endpoint)
            response.raise_for_status()
            data = response.json()
            
            logger.info(f"Kaggle auth status response: {data}")
            self.test_results["kaggle_auth_status"] = {
                "status": "PASS",
                "response": data
            }
            return True
        except Exception as e:
            logger.error(f"Kaggle auth status failed: {str(e)}")
            self.test_results["kaggle_auth_status"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    async def test_kaggle_search(self, query: str = "titanic") -> bool:
        """Test the Kaggle search endpoint
        
        Args:
            query: Search query
            
        Returns:
            True if the test passed, False otherwise
        """
        endpoint = f"{self.base_url}/kaggle/datasets/search?query={query}"
        logger.info(f"Testing Kaggle search endpoint: {endpoint}")
        
        try:
            response = self.session.get(endpoint)
            response.raise_for_status()
            data = response.json()
            
            if isinstance(data, list):
                logger.info(f"Kaggle search response: Found {len(data)} datasets")
                if data:
                    logger.info(f"First dataset: {data[0].get('title', 'Unknown')}")
            else:
                logger.info(f"Kaggle search response: {data}")
            
            self.test_results["kaggle_search"] = {
                "status": "PASS",
                "response": data if isinstance(data, dict) else {"count": len(data)}
            }
            return True
        except Exception as e:
            logger.error(f"Kaggle search failed: {str(e)}")
            self.test_results["kaggle_search"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    async def test_kaggle_trending(self) -> bool:
        """Test the Kaggle trending datasets endpoint
        
        Returns:
            True if the test passed, False otherwise
        """
        endpoint = f"{self.base_url}/kaggle/datasets/trending"
        logger.info(f"Testing Kaggle trending datasets endpoint: {endpoint}")
        
        try:
            response = self.session.get(endpoint)
            response.raise_for_status()
            data = response.json()
            
            if isinstance(data, list):
                logger.info(f"Kaggle trending response: Found {len(data)} datasets")
                if data:
                    logger.info(f"First trending dataset: {data[0].get('title', 'Unknown')}")
            else:
                logger.info(f"Kaggle trending response: {data}")
            
            self.test_results["kaggle_trending"] = {
                "status": "PASS",
                "response": data if isinstance(data, dict) else {"count": len(data)}
            }
            return True
        except Exception as e:
            logger.error(f"Kaggle trending failed: {str(e)}")
            self.test_results["kaggle_trending"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    async def test_kaggle_download(self, dataset_ref: str = "heptapod/titanic") -> bool:
        """Test the Kaggle download endpoint
        
        Args:
            dataset_ref: Dataset reference
            
        Returns:
            True if the test passed, False otherwise
        """
        endpoint = f"{self.base_url}/kaggle/datasets/download"
        logger.info(f"Testing Kaggle download endpoint: {endpoint}")
        
        try:
            response = self.session.post(
                endpoint,
                json={"dataset_ref": dataset_ref}
            )
            response.raise_for_status()
            data = response.json()
            
            logger.info(f"Kaggle download response: {data}")
            self.test_results["kaggle_download"] = {
                "status": "PASS",
                "response": data
            }
            return True
        except Exception as e:
            logger.error(f"Kaggle download failed: {str(e)}")
            self.test_results["kaggle_download"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    async def test_kaggle_download_status(self, dataset_ref: str = "heptapod/titanic") -> bool:
        """Test the Kaggle download status endpoint
        
        Args:
            dataset_ref: Dataset reference
            
        Returns:
            True if the test passed, False otherwise
        """
        endpoint = f"{self.base_url}/kaggle/datasets/download/status/{dataset_ref}"
        logger.info(f"Testing Kaggle download status endpoint: {endpoint}")
        
        try:
            response = self.session.get(endpoint)
            # This might return 404 if no download is in progress, which is fine
            if response.status_code == 404:
                logger.info(f"No active download found for dataset {dataset_ref}")
                self.test_results["kaggle_download_status"] = {
                    "status": "PASS",
                    "response": {"message": f"No active download found for dataset {dataset_ref}"}
                }
                return True
            
            response.raise_for_status()
            data = response.json()
            
            logger.info(f"Kaggle download status response: {data}")
            self.test_results["kaggle_download_status"] = {
                "status": "PASS",
                "response": data
            }
            return True
        except Exception as e:
            logger.error(f"Kaggle download status failed: {str(e)}")
            self.test_results["kaggle_download_status"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    async def test_kaggle_all_download_statuses(self) -> bool:
        """Test the Kaggle all download statuses endpoint
        
        Returns:
            True if the test passed, False otherwise
        """
        endpoint = f"{self.base_url}/kaggle/datasets/download/status"
        logger.info(f"Testing Kaggle all download statuses endpoint: {endpoint}")
        
        try:
            response = self.session.get(endpoint)
            response.raise_for_status()
            data = response.json()
            
            if isinstance(data, list):
                logger.info(f"Kaggle all download statuses response: Found {len(data)} downloads")
            else:
                logger.info(f"Kaggle all download statuses response: {data}")
            
            self.test_results["kaggle_all_download_statuses"] = {
                "status": "PASS",
                "response": data if isinstance(data, dict) else {"count": len(data)}
            }
            return True
        except Exception as e:
            logger.error(f"Kaggle all download statuses failed: {str(e)}")
            self.test_results["kaggle_all_download_statuses"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    async def test_kaggle_dataset_tags(self) -> bool:
        """Test the Kaggle dataset tags endpoint
        
        Returns:
            True if the test passed, False otherwise
        """
        endpoint = f"{self.base_url}/kaggle/datasets/tags"
        logger.info(f"Testing Kaggle dataset tags endpoint: {endpoint}")
        
        try:
            response = self.session.get(endpoint)
            response.raise_for_status()
            data = response.json()
            
            if isinstance(data, list):
                logger.info(f"Kaggle dataset tags response: Found {len(data)} tags")
                if data:
                    logger.info(f"First tag: {data[0].get('name', 'Unknown')}")
            else:
                logger.info(f"Kaggle dataset tags response: {data}")
            
            self.test_results["kaggle_dataset_tags"] = {
                "status": "PASS",
                "response": data if isinstance(data, dict) else {"count": len(data)}
            }
            return True
        except Exception as e:
            logger.error(f"Kaggle dataset tags failed: {str(e)}")
            self.test_results["kaggle_dataset_tags"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    async def test_kaggle_local_datasets(self) -> bool:
        """Test the Kaggle local datasets endpoint
        
        Returns:
            True if the test passed, False otherwise
        """
        endpoint = f"{self.base_url}/kaggle/local/datasets"
        logger.info(f"Testing Kaggle local datasets endpoint: {endpoint}")
        
        try:
            response = self.session.get(endpoint)
            response.raise_for_status()
            data = response.json()
            
            if isinstance(data, list):
                logger.info(f"Kaggle local datasets response: Found {len(data)} datasets")
                if data:
                    logger.info(f"First local dataset: {data[0].get('title', 'Unknown')}")
            else:
                logger.info(f"Kaggle local datasets response: {data}")
            
            self.test_results["kaggle_local_datasets"] = {
                "status": "PASS",
                "response": data if isinstance(data, dict) else {"count": len(data)}
            }
            return True
        except Exception as e:
            logger.error(f"Kaggle local datasets failed: {str(e)}")
            self.test_results["kaggle_local_datasets"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests
        
        Returns:
            Dictionary with test results
        """
        logger.info("Running all Kaggle API tests...")
        
        # Run tests
        await self.test_health()
        await self.test_kaggle_auth_status()
        await self.test_kaggle_search()
        await self.test_kaggle_trending()
        await self.test_kaggle_download()
        await self.test_kaggle_download_status()
        await self.test_kaggle_all_download_statuses()
        await self.test_kaggle_dataset_tags()
        await self.test_kaggle_local_datasets()
        
        # Print summary
        logger.info("\n=== TEST RESULTS ===")
        for test_name, result in self.test_results.items():
            logger.info(f"{test_name}: {result['status']}")
        
        # Overall result
        passed = sum(1 for result in self.test_results.values() if result["status"] == "PASS")
        total = len(self.test_results)
        logger.info(f"\nOverall Result: {passed}/{total} tests passed")
        
        return self.test_results
    
    def save_results(self, file_path: str = "kaggle_api_test_results.json") -> None:
        """Save test results to a file
        
        Args:
            file_path: Path to save the results to
        """
        with open(file_path, "w") as f:
            json.dump(self.test_results, f, indent=2)
        
        logger.info(f"Test results saved to {file_path}")

async def main():
    """Main function"""
    tester = KaggleAPITester()
    await tester.run_all_tests()
    tester.save_results()

if __name__ == "__main__":
    asyncio.run(main()) 
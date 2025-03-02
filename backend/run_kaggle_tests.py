#!/usr/bin/env python
"""
Run Kaggle Integration Tests

This script runs the tests for the Kaggle API integration.
"""

import os
import sys
import logging
import asyncio
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

from test_kaggle_integration import main

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run the tests
    asyncio.run(main()) 
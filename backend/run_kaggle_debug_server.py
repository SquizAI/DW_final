#!/usr/bin/env python
"""
Run Kaggle Debug Server

This script runs a debug server with mock implementations of the Kaggle API endpoints.
It's useful for testing the Kaggle integration without requiring actual Kaggle credentials.
"""

import os
import logging
from app.kaggle.debug import run_debug_server

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    # Create necessary directories
    os.makedirs("data/kaggle", exist_ok=True)
    
    # Print usage instructions
    print("\n" + "="*80)
    print("KAGGLE DEBUG SERVER")
    print("="*80)
    print("\nThis server provides mock implementations of the Kaggle API endpoints.")
    print("It's useful for testing the Kaggle integration without requiring actual Kaggle credentials.")
    print("\nYou can access the Kaggle integration through:")
    print("1. Data Upload Page: Click on the 'Kaggle Datasets' tab")
    print("2. Kaggle Manager: Navigate to /kaggle/manager in the application")
    print("\nAvailable mock datasets:")
    print("- heptapod/titanic")
    print("- brendan45774/test-file")
    print("- azeembootwala/titanic")
    print("- austinreese/craigslist-carstrucks-data")
    print("- camnugent/california-traffic-collision-data-from-switrs")
    print("- aaronschlegel/tesla-stock-data")
    print("\nNote: This is a debug server with mock data. For real Kaggle integration,")
    print("use the run_server_with_kaggle.py script instead.")
    print("="*80 + "\n")
    
    # Run the debug server
    run_debug_server(host="0.0.0.0", port=8000) 
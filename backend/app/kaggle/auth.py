"""
Kaggle Authentication Component

This component handles authentication with the Kaggle API, including:
- Setting up and validating credentials
- Secure storage of API keys
- Authentication error handling
"""

import os
import json
import logging
from pathlib import Path
from typing import Tuple, Dict, Optional
from pydantic import BaseModel
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class KaggleCredentials(BaseModel):
    """Model for Kaggle API credentials"""
    username: str
    key: str

class KaggleAuth:
    """Handles authentication with the Kaggle API"""
    
    def __init__(self, data_dir: str = None):
        """Initialize the authentication handler
        
        Args:
            data_dir: Directory to store credentials
        """
        self.data_dir = data_dir or os.getenv('DATA_DIR', 'data')
        self.kaggle_dir = os.path.join(os.path.expanduser("~"), ".kaggle")
        self.app_kaggle_dir = os.path.join(self.data_dir, "kaggle_credentials")
        
        # Create necessary directories
        os.makedirs(self.kaggle_dir, exist_ok=True)
        os.makedirs(self.app_kaggle_dir, exist_ok=True)
    
    def get_credentials(self) -> Optional[KaggleCredentials]:
        """Get Kaggle credentials from environment or stored file
        
        Returns:
            KaggleCredentials object if found, None otherwise
        """
        # Try to get from environment variables first
        username = os.getenv('KAGGLE_USERNAME')
        key = os.getenv('KAGGLE_KEY')
        
        if username and key:
            logger.info(f"Using Kaggle credentials from environment: username={username}")
            return KaggleCredentials(username=username, key=key)
        
        # Try to get from kaggle.json file
        kaggle_json_path = os.path.join(self.kaggle_dir, "kaggle.json")
        if os.path.exists(kaggle_json_path):
            try:
                with open(kaggle_json_path, 'r') as f:
                    creds = json.load(f)
                    if 'username' in creds and 'key' in creds:
                        logger.info(f"Using Kaggle credentials from {kaggle_json_path}")
                        return KaggleCredentials(username=creds['username'], key=creds['key'])
            except Exception as e:
                logger.error(f"Error reading Kaggle credentials from {kaggle_json_path}: {str(e)}")
        
        # Try to get from app credentials file
        app_kaggle_json_path = os.path.join(self.app_kaggle_dir, "kaggle.json")
        if os.path.exists(app_kaggle_json_path):
            try:
                with open(app_kaggle_json_path, 'r') as f:
                    creds = json.load(f)
                    if 'username' in creds and 'key' in creds:
                        logger.info(f"Using Kaggle credentials from {app_kaggle_json_path}")
                        return KaggleCredentials(username=creds['username'], key=creds['key'])
            except Exception as e:
                logger.error(f"Error reading Kaggle credentials from {app_kaggle_json_path}: {str(e)}")
        
        logger.warning("No Kaggle credentials found")
        return None
    
    def save_credentials(self, credentials: KaggleCredentials) -> bool:
        """Save Kaggle credentials to files and environment
        
        Args:
            credentials: KaggleCredentials object
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Save to environment variables
            os.environ['KAGGLE_USERNAME'] = credentials.username
            os.environ['KAGGLE_KEY'] = credentials.key
            
            # Save to kaggle.json
            kaggle_json_path = os.path.join(self.kaggle_dir, "kaggle.json")
            with open(kaggle_json_path, "w") as f:
                f.write(json.dumps({"username": credentials.username, "key": credentials.key}))
            
            # Set permissions to 600 (required by Kaggle)
            os.chmod(kaggle_json_path, 0o600)
            
            # Save to app credentials file
            app_kaggle_json_path = os.path.join(self.app_kaggle_dir, "kaggle.json")
            with open(app_kaggle_json_path, "w") as f:
                f.write(json.dumps({"username": credentials.username, "key": credentials.key}))
            
            logger.info(f"Saved Kaggle credentials for user {credentials.username}")
            return True
        except Exception as e:
            logger.error(f"Error saving Kaggle credentials: {str(e)}")
            return False
    
    def validate_credentials(self) -> bool:
        """Validate that Kaggle credentials are properly set up
        
        Returns:
            True if credentials are valid, False otherwise
        """
        credentials = self.get_credentials()
        if not credentials:
            return False
        
        # Check if kaggle.json exists and has correct permissions
        kaggle_json_path = os.path.join(self.kaggle_dir, "kaggle.json")
        if not os.path.exists(kaggle_json_path):
            logger.warning(f"Kaggle credentials file {kaggle_json_path} does not exist")
            return False
        
        # Check file permissions (should be 600)
        try:
            import stat
            file_stat = os.stat(kaggle_json_path)
            if file_stat.st_mode & 0o777 != 0o600:
                logger.warning(f"Kaggle credentials file {kaggle_json_path} has incorrect permissions")
                # Try to fix permissions
                os.chmod(kaggle_json_path, 0o600)
        except Exception as e:
            logger.error(f"Error checking Kaggle credentials file permissions: {str(e)}")
            return False
        
        return True
    
    def authenticate(self) -> Tuple[bool, Optional[str]]:
        """Authenticate with the Kaggle API
        
        Returns:
            Tuple of (success, error_message)
        """
        if not self.validate_credentials():
            return False, "Invalid or missing Kaggle credentials"
        
        try:
            from kaggle.api.kaggle_api_extended import KaggleApi
            api = KaggleApi()
            api.authenticate()
            logger.info("Successfully authenticated with Kaggle API")
            return True, None
        except Exception as e:
            error_msg = f"Failed to authenticate with Kaggle API: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
    
    def get_authenticated_api(self):
        """Get an authenticated Kaggle API instance
        
        Returns:
            KaggleApi instance
            
        Raises:
            HTTPException: If authentication fails
        """
        success, error = self.authenticate()
        if not success:
            raise HTTPException(
                status_code=401,
                detail=error or "Failed to authenticate with Kaggle API"
            )
        
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        return api 
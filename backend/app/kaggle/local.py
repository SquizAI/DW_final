"""
Kaggle Local Dataset Management Component

This component handles local dataset management operations, including:
- Storing downloaded datasets in organized structure
- Tracking local datasets and their origins
- Synchronizing local datasets with Kaggle
- Managing dataset versions locally
"""

import os
import json
import logging
import shutil
import time
from typing import Dict, List, Optional, Any, Union
from pathlib import Path
from fastapi import HTTPException
from pydantic import BaseModel, Field
from datetime import datetime

from .auth import KaggleAuth

logger = logging.getLogger(__name__)

class LocalDatasetInfo(BaseModel):
    """Model for local dataset information"""
    ref: str
    title: str
    local_path: str
    download_date: str
    size_bytes: int
    file_count: int
    files: List[Dict[str, Any]]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    last_sync: Optional[str] = None
    version: Optional[str] = None

class LocalDatasetManagement:
    """Handles local dataset management operations"""
    
    def __init__(self, auth: KaggleAuth = None, data_dir: str = None):
        """Initialize the local dataset management handler
        
        Args:
            auth: KaggleAuth instance
            data_dir: Directory to store datasets
        """
        self.auth = auth or KaggleAuth()
        self.data_dir = data_dir or os.getenv('DATA_DIR', 'data')
        self.kaggle_dir = os.path.join(self.data_dir, "kaggle")
        self.index_file = os.path.join(self.kaggle_dir, "dataset_index.json")
        
        # Create necessary directories
        os.makedirs(self.kaggle_dir, exist_ok=True)
        
        # Initialize dataset index
        self._init_dataset_index()
    
    def _init_dataset_index(self) -> None:
        """Initialize the dataset index file if it doesn't exist"""
        if not os.path.exists(self.index_file):
            with open(self.index_file, "w") as f:
                json.dump({"datasets": {}}, f, indent=2)
    
    def _load_dataset_index(self) -> Dict[str, Any]:
        """Load the dataset index
        
        Returns:
            Dictionary with dataset index
        """
        try:
            with open(self.index_file, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load dataset index: {str(e)}")
            return {"datasets": {}}
    
    def _save_dataset_index(self, index: Dict[str, Any]) -> None:
        """Save the dataset index
        
        Args:
            index: Dataset index to save
        """
        try:
            with open(self.index_file, "w") as f:
                json.dump(index, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save dataset index: {str(e)}")
    
    def _get_dataset_path(self, dataset_ref: str) -> str:
        """Get the path for a dataset
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            
        Returns:
            Path to the dataset directory
        """
        # Parse owner and dataset from the reference
        parts = dataset_ref.split('/')
        if len(parts) != 2:
            raise ValueError("Invalid dataset reference. Format should be 'owner/dataset'")
        
        owner, dataset = parts
        return os.path.join(self.kaggle_dir, owner, dataset)
    
    def _scan_dataset_directory(self, dataset_path: str) -> Dict[str, Any]:
        """Scan a dataset directory for files
        
        Args:
            dataset_path: Path to the dataset directory
            
        Returns:
            Dictionary with dataset information
        """
        if not os.path.exists(dataset_path):
            return {
                "file_count": 0,
                "size_bytes": 0,
                "files": []
            }
        
        files = []
        total_size = 0
        
        for root, _, filenames in os.walk(dataset_path):
            for filename in filenames:
                if filename.endswith('.zip'):
                    continue  # Skip zip files
                
                file_path = os.path.join(root, filename)
                rel_path = os.path.relpath(file_path, dataset_path)
                size = os.path.getsize(file_path)
                total_size += size
                
                files.append({
                    "name": filename,
                    "path": rel_path,
                    "size": size,
                    "modified": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
                })
        
        return {
            "file_count": len(files),
            "size_bytes": total_size,
            "files": files
        }
    
    async def register_dataset(
        self,
        dataset_ref: str,
        title: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> LocalDatasetInfo:
        """Register a dataset in the local index
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            title: Dataset title
            metadata: Additional metadata
            
        Returns:
            LocalDatasetInfo object
        """
        try:
            logger.info(f"Registering dataset: {dataset_ref}")
            
            # Get dataset path
            dataset_path = self._get_dataset_path(dataset_ref)
            
            # Scan dataset directory
            scan_result = self._scan_dataset_directory(dataset_path)
            
            # Create dataset info
            dataset_info = {
                "ref": dataset_ref,
                "title": title,
                "local_path": dataset_path,
                "download_date": datetime.now().isoformat(),
                "size_bytes": scan_result["size_bytes"],
                "file_count": scan_result["file_count"],
                "files": scan_result["files"],
                "metadata": metadata or {}
            }
            
            # Update index
            index = self._load_dataset_index()
            index["datasets"][dataset_ref] = dataset_info
            self._save_dataset_index(index)
            
            logger.info(f"Dataset {dataset_ref} registered successfully")
            
            return LocalDatasetInfo(**dataset_info)
            
        except Exception as e:
            logger.error(f"Failed to register dataset: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to register dataset: {str(e)}"
            )
    
    async def unregister_dataset(self, dataset_ref: str, delete_files: bool = False) -> Dict[str, Any]:
        """Unregister a dataset from the local index
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            delete_files: Whether to delete the dataset files
            
        Returns:
            Dictionary with unregister information
        """
        try:
            logger.info(f"Unregistering dataset: {dataset_ref}")
            
            # Get dataset path
            dataset_path = self._get_dataset_path(dataset_ref)
            
            # Update index
            index = self._load_dataset_index()
            if dataset_ref in index["datasets"]:
                del index["datasets"][dataset_ref]
                self._save_dataset_index(index)
            
            # Delete files if requested
            if delete_files and os.path.exists(dataset_path):
                shutil.rmtree(dataset_path)
                logger.info(f"Deleted dataset files at {dataset_path}")
            
            logger.info(f"Dataset {dataset_ref} unregistered successfully")
            
            return {
                "success": True,
                "message": f"Dataset {dataset_ref} unregistered successfully",
                "dataset_ref": dataset_ref,
                "files_deleted": delete_files
            }
            
        except Exception as e:
            logger.error(f"Failed to unregister dataset: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to unregister dataset: {str(e)}"
            )
    
    async def list_local_datasets(self) -> List[LocalDatasetInfo]:
        """List all locally registered datasets
        
        Returns:
            List of LocalDatasetInfo objects
        """
        try:
            logger.info("Listing local datasets")
            
            # Load index
            index = self._load_dataset_index()
            
            # Convert to response format
            results = []
            for dataset_ref, dataset_info in index["datasets"].items():
                results.append(LocalDatasetInfo(**dataset_info))
            
            logger.info(f"Found {len(results)} local datasets")
            return results
            
        except Exception as e:
            logger.error(f"Failed to list local datasets: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to list local datasets: {str(e)}"
            )
    
    async def get_local_dataset(self, dataset_ref: str) -> LocalDatasetInfo:
        """Get information about a locally registered dataset
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            
        Returns:
            LocalDatasetInfo object
        """
        try:
            logger.info(f"Getting information for dataset: {dataset_ref}")
            
            # Load index
            index = self._load_dataset_index()
            
            # Check if dataset exists
            if dataset_ref not in index["datasets"]:
                raise HTTPException(
                    status_code=404,
                    detail=f"Dataset {dataset_ref} not found in local index"
                )
            
            # Get dataset info
            dataset_info = index["datasets"][dataset_ref]
            
            # Refresh file information
            dataset_path = self._get_dataset_path(dataset_ref)
            scan_result = self._scan_dataset_directory(dataset_path)
            
            # Update dataset info
            dataset_info["size_bytes"] = scan_result["size_bytes"]
            dataset_info["file_count"] = scan_result["file_count"]
            dataset_info["files"] = scan_result["files"]
            
            # Update index
            index["datasets"][dataset_ref] = dataset_info
            self._save_dataset_index(index)
            
            return LocalDatasetInfo(**dataset_info)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to get local dataset: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get local dataset: {str(e)}"
            )
    
    async def update_dataset_metadata(
        self,
        dataset_ref: str,
        metadata: Dict[str, Any]
    ) -> LocalDatasetInfo:
        """Update metadata for a locally registered dataset
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            metadata: New metadata
            
        Returns:
            LocalDatasetInfo object
        """
        try:
            logger.info(f"Updating metadata for dataset: {dataset_ref}")
            
            # Load index
            index = self._load_dataset_index()
            
            # Check if dataset exists
            if dataset_ref not in index["datasets"]:
                raise HTTPException(
                    status_code=404,
                    detail=f"Dataset {dataset_ref} not found in local index"
                )
            
            # Update metadata
            index["datasets"][dataset_ref]["metadata"] = metadata
            self._save_dataset_index(index)
            
            logger.info(f"Metadata updated for dataset {dataset_ref}")
            
            return LocalDatasetInfo(**index["datasets"][dataset_ref])
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to update dataset metadata: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update dataset metadata: {str(e)}"
            )
    
    async def sync_dataset(self, dataset_ref: str) -> Dict[str, Any]:
        """Synchronize a local dataset with Kaggle
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            
        Returns:
            Dictionary with sync information
        """
        try:
            logger.info(f"Synchronizing dataset: {dataset_ref}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get dataset path
            dataset_path = self._get_dataset_path(dataset_ref)
            
            # Get dataset metadata from Kaggle
            try:
                kaggle_dataset = api.dataset_view(dataset_ref)
                kaggle_metadata = {
                    "title": kaggle_dataset.title,
                    "size": str(kaggle_dataset.size),
                    "lastUpdated": str(kaggle_dataset.lastUpdated),
                    "downloadCount": kaggle_dataset.downloadCount,
                    "voteCount": getattr(kaggle_dataset, "voteCount", None),
                    "description": getattr(kaggle_dataset, "subtitle", "") or getattr(kaggle_dataset, "description", ""),
                    "url": kaggle_dataset.url,
                    "version": getattr(kaggle_dataset, "currentVersionNumber", None)
                }
            except Exception as e:
                logger.error(f"Failed to get dataset metadata from Kaggle: {str(e)}")
                kaggle_metadata = None
            
            # Load index
            index = self._load_dataset_index()
            
            # Check if dataset exists
            if dataset_ref not in index["datasets"]:
                raise HTTPException(
                    status_code=404,
                    detail=f"Dataset {dataset_ref} not found in local index"
                )
            
            # Get local dataset info
            local_dataset = index["datasets"][dataset_ref]
            
            # Check if update is needed
            needs_update = False
            if kaggle_metadata:
                local_version = local_dataset.get("version")
                kaggle_version = kaggle_metadata.get("version")
                
                if local_version != kaggle_version:
                    needs_update = True
            
            # Update dataset if needed
            if needs_update:
                logger.info(f"Updating dataset {dataset_ref} from Kaggle")
                
                # Download dataset files
                api.dataset_download_files(
                    dataset=dataset_ref,
                    path=dataset_path,
                    unzip=True,
                    force=True,
                    quiet=False
                )
                
                # Scan dataset directory
                scan_result = self._scan_dataset_directory(dataset_path)
                
                # Update dataset info
                local_dataset["size_bytes"] = scan_result["size_bytes"]
                local_dataset["file_count"] = scan_result["file_count"]
                local_dataset["files"] = scan_result["files"]
                local_dataset["last_sync"] = datetime.now().isoformat()
                
                if kaggle_metadata:
                    local_dataset["version"] = kaggle_metadata.get("version")
                    local_dataset["metadata"]["kaggle"] = kaggle_metadata
                
                # Update index
                index["datasets"][dataset_ref] = local_dataset
                self._save_dataset_index(index)
                
                logger.info(f"Dataset {dataset_ref} updated successfully")
                
                return {
                    "success": True,
                    "message": f"Dataset {dataset_ref} updated successfully",
                    "dataset_ref": dataset_ref,
                    "updated": True,
                    "version": local_dataset.get("version")
                }
            else:
                logger.info(f"Dataset {dataset_ref} is already up to date")
                
                # Update last sync time
                local_dataset["last_sync"] = datetime.now().isoformat()
                
                # Update index
                index["datasets"][dataset_ref] = local_dataset
                self._save_dataset_index(index)
                
                return {
                    "success": True,
                    "message": f"Dataset {dataset_ref} is already up to date",
                    "dataset_ref": dataset_ref,
                    "updated": False,
                    "version": local_dataset.get("version")
                }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to sync dataset: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to sync dataset: {str(e)}"
            )
    
    async def clean_up_old_datasets(self, days_threshold: int = 30) -> Dict[str, Any]:
        """Clean up old datasets that haven't been accessed recently
        
        Args:
            days_threshold: Number of days since last access to consider a dataset old
            
        Returns:
            Dictionary with cleanup information
        """
        try:
            logger.info(f"Cleaning up old datasets (threshold: {days_threshold} days)")
            
            # Load index
            index = self._load_dataset_index()
            
            # Get current time
            now = datetime.now()
            
            # Find old datasets
            old_datasets = []
            for dataset_ref, dataset_info in list(index["datasets"].items()):
                # Get last access time
                last_access = dataset_info.get("last_access")
                if not last_access:
                    continue
                
                # Parse last access time
                try:
                    last_access_time = datetime.fromisoformat(last_access)
                    days_since_access = (now - last_access_time).days
                    
                    if days_since_access > days_threshold:
                        old_datasets.append(dataset_ref)
                except:
                    continue
            
            # Delete old datasets
            deleted_count = 0
            for dataset_ref in old_datasets:
                try:
                    # Get dataset path
                    dataset_path = self._get_dataset_path(dataset_ref)
                    
                    # Delete dataset files
                    if os.path.exists(dataset_path):
                        shutil.rmtree(dataset_path)
                    
                    # Remove from index
                    del index["datasets"][dataset_ref]
                    
                    deleted_count += 1
                    logger.info(f"Deleted old dataset: {dataset_ref}")
                except Exception as e:
                    logger.error(f"Failed to delete old dataset {dataset_ref}: {str(e)}")
            
            # Save index
            self._save_dataset_index(index)
            
            logger.info(f"Cleaned up {deleted_count} old datasets")
            
            return {
                "success": True,
                "message": f"Cleaned up {deleted_count} old datasets",
                "deleted_count": deleted_count,
                "threshold_days": days_threshold
            }
            
        except Exception as e:
            logger.error(f"Failed to clean up old datasets: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to clean up old datasets: {str(e)}"
            )
    
    async def update_last_access(self, dataset_ref: str) -> None:
        """Update the last access time for a dataset
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
        """
        try:
            # Load index
            index = self._load_dataset_index()
            
            # Check if dataset exists
            if dataset_ref in index["datasets"]:
                # Update last access time
                index["datasets"][dataset_ref]["last_access"] = datetime.now().isoformat()
                self._save_dataset_index(index)
        except Exception as e:
            logger.error(f"Failed to update last access time for dataset {dataset_ref}: {str(e)}")
            # Don't raise an exception, just log the error 
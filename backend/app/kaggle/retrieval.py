"""
Kaggle Dataset Retrieval Component

This component handles dataset retrieval operations with the Kaggle API, including:
- Downloading complete datasets
- Downloading specific files from datasets
- Resuming interrupted downloads
- Tracking download progress
"""

import os
import logging
import shutil
import time
import threading
from typing import Dict, List, Optional, Tuple, Callable, Any
from pathlib import Path
from fastapi import HTTPException
from pydantic import BaseModel

from .auth import KaggleAuth

logger = logging.getLogger(__name__)

class DownloadProgress(BaseModel):
    """Model for tracking download progress"""
    dataset_ref: str
    status: str  # 'pending', 'downloading', 'completed', 'failed'
    progress: float  # 0-100
    total_size: int  # in bytes
    downloaded_size: int  # in bytes
    start_time: float
    end_time: Optional[float] = None
    error: Optional[str] = None
    files: List[Dict[str, Any]] = []

class DatasetRetrieval:
    """Handles dataset retrieval operations with the Kaggle API"""
    
    def __init__(self, auth: KaggleAuth = None, data_dir: str = None):
        """Initialize the dataset retrieval handler
        
        Args:
            auth: KaggleAuth instance
            data_dir: Directory to store downloaded datasets
        """
        self.auth = auth or KaggleAuth()
        self.data_dir = data_dir or os.getenv('DATA_DIR', 'data')
        self.kaggle_dir = os.path.join(self.data_dir, "kaggle")
        
        # Create necessary directories
        os.makedirs(self.kaggle_dir, exist_ok=True)
        
        # Track active downloads
        self.active_downloads: Dict[str, DownloadProgress] = {}
        self.download_lock = threading.Lock()
    
    def _get_download_path(self, dataset_ref: str) -> str:
        """Get the download path for a dataset
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            
        Returns:
            Path to the download directory
        """
        # Parse owner and dataset from the reference
        parts = dataset_ref.split('/')
        if len(parts) != 2:
            raise ValueError("Invalid dataset reference. Format should be 'owner/dataset'")
        
        owner, dataset = parts
        return os.path.join(self.kaggle_dir, owner, dataset)
    
    def _track_download_progress(
        self, 
        dataset_ref: str, 
        total_size: int,
        progress_callback: Optional[Callable[[float], None]] = None
    ) -> None:
        """Track download progress by monitoring file size changes
        
        Args:
            dataset_ref: Dataset reference
            total_size: Total size in bytes
            progress_callback: Optional callback function for progress updates
        """
        download_path = self._get_download_path(dataset_ref)
        
        # Initialize progress
        with self.download_lock:
            if dataset_ref not in self.active_downloads:
                return
            
            progress = self.active_downloads[dataset_ref]
            progress.status = "downloading"
        
        # Monitor download progress
        while True:
            with self.download_lock:
                if dataset_ref not in self.active_downloads:
                    return
                
                progress = self.active_downloads[dataset_ref]
                if progress.status not in ["downloading", "pending"]:
                    return
            
            # Calculate current size
            current_size = 0
            for root, _, files in os.walk(download_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    if os.path.exists(file_path):
                        current_size += os.path.getsize(file_path)
            
            # Update progress
            with self.download_lock:
                if dataset_ref not in self.active_downloads:
                    return
                
                progress = self.active_downloads[dataset_ref]
                progress.downloaded_size = current_size
                
                if total_size > 0:
                    progress.progress = min(99.0, (current_size / total_size) * 100)
                else:
                    # If total size is unknown, estimate based on time
                    elapsed = time.time() - progress.start_time
                    if elapsed > 0:
                        # Arbitrary progress estimation
                        progress.progress = min(95.0, (elapsed / 60.0) * 10)  # 10% per minute, max 95%
            
            # Call progress callback if provided
            if progress_callback:
                progress_callback(progress.progress)
            
            # Sleep before next check
            time.sleep(1)
    
    async def download_dataset(
        self, 
        dataset_ref: str,
        unzip: bool = True,
        force: bool = False,
        progress_callback: Optional[Callable[[float], None]] = None
    ) -> Dict[str, Any]:
        """Download a complete dataset from Kaggle
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            unzip: Whether to unzip the downloaded files
            force: Whether to force re-download if the dataset already exists
            progress_callback: Optional callback function for progress updates
            
        Returns:
            Dictionary with download information
        """
        try:
            logger.info(f"Starting download for dataset: {dataset_ref}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get download path
            download_path = self._get_download_path(dataset_ref)
            
            # Check if dataset already exists
            if os.path.exists(download_path) and not force:
                logger.info(f"Dataset {dataset_ref} already exists at {download_path}")
                
                # Get list of files
                files = []
                for root, _, filenames in os.walk(download_path):
                    for filename in filenames:
                        if not filename.endswith('.zip'):  # Skip zip files
                            file_path = os.path.join(root, filename)
                            rel_path = os.path.relpath(file_path, download_path)
                            files.append({
                                "name": filename,
                                "path": rel_path,
                                "size": os.path.getsize(file_path)
                            })
                
                return {
                    "success": True,
                    "message": f"Dataset {dataset_ref} already exists",
                    "dataset_ref": dataset_ref,
                    "download_path": download_path,
                    "files": files
                }
            
            # Create directory if it doesn't exist
            os.makedirs(download_path, exist_ok=True)
            
            # Get dataset metadata to estimate size
            try:
                dataset_info = api.dataset_view(dataset_ref)
                total_size = getattr(dataset_info, "totalBytes", 0)
            except:
                total_size = 0
            
            # Initialize progress tracking
            progress = DownloadProgress(
                dataset_ref=dataset_ref,
                status="pending",
                progress=0.0,
                total_size=total_size,
                downloaded_size=0,
                start_time=time.time()
            )
            
            with self.download_lock:
                self.active_downloads[dataset_ref] = progress
            
            # Start progress tracking in a separate thread
            progress_thread = threading.Thread(
                target=self._track_download_progress,
                args=(dataset_ref, total_size, progress_callback)
            )
            progress_thread.daemon = True
            progress_thread.start()
            
            try:
                # Download the dataset
                api.dataset_download_files(
                    dataset=dataset_ref,
                    path=download_path,
                    unzip=unzip,
                    quiet=False
                )
                
                # Update progress to completed
                with self.download_lock:
                    if dataset_ref in self.active_downloads:
                        progress = self.active_downloads[dataset_ref]
                        progress.status = "completed"
                        progress.progress = 100.0
                        progress.end_time = time.time()
                
                logger.info(f"Dataset {dataset_ref} downloaded successfully to {download_path}")
                
                # Get list of files
                files = []
                for root, _, filenames in os.walk(download_path):
                    for filename in filenames:
                        if not filename.endswith('.zip'):  # Skip zip files
                            file_path = os.path.join(root, filename)
                            rel_path = os.path.relpath(file_path, download_path)
                            file_info = {
                                "name": filename,
                                "path": rel_path,
                                "size": os.path.getsize(file_path)
                            }
                            files.append(file_info)
                            
                            # Update progress with file list
                            with self.download_lock:
                                if dataset_ref in self.active_downloads:
                                    self.active_downloads[dataset_ref].files.append(file_info)
                
                return {
                    "success": True,
                    "message": f"Dataset {dataset_ref} downloaded successfully",
                    "dataset_ref": dataset_ref,
                    "download_path": download_path,
                    "files": files
                }
                
            except Exception as e:
                # Update progress to failed
                with self.download_lock:
                    if dataset_ref in self.active_downloads:
                        progress = self.active_downloads[dataset_ref]
                        progress.status = "failed"
                        progress.error = str(e)
                        progress.end_time = time.time()
                
                logger.error(f"Failed to download dataset {dataset_ref}: {str(e)}")
                raise
                
        except Exception as e:
            logger.error(f"Failed to download dataset: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to download dataset: {str(e)}"
            )
    
    async def download_dataset_file(
        self, 
        dataset_ref: str,
        file_name: str,
        force: bool = False
    ) -> Dict[str, Any]:
        """Download a specific file from a dataset
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            file_name: Name of the file to download
            force: Whether to force re-download if the file already exists
            
        Returns:
            Dictionary with download information
        """
        try:
            logger.info(f"Starting download for file {file_name} from dataset: {dataset_ref}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get download path
            download_path = self._get_download_path(dataset_ref)
            
            # Create directory if it doesn't exist
            os.makedirs(download_path, exist_ok=True)
            
            # Check if file already exists
            file_path = os.path.join(download_path, file_name)
            if os.path.exists(file_path) and not force:
                logger.info(f"File {file_name} already exists at {file_path}")
                return {
                    "success": True,
                    "message": f"File {file_name} already exists",
                    "dataset_ref": dataset_ref,
                    "file_name": file_name,
                    "file_path": file_path,
                    "size": os.path.getsize(file_path)
                }
            
            # Download the file
            api.dataset_download_file(
                dataset=dataset_ref,
                file_name=file_name,
                path=download_path,
                quiet=False
            )
            
            logger.info(f"File {file_name} downloaded successfully to {file_path}")
            
            return {
                "success": True,
                "message": f"File {file_name} downloaded successfully",
                "dataset_ref": dataset_ref,
                "file_name": file_name,
                "file_path": file_path,
                "size": os.path.getsize(file_path)
            }
            
        except Exception as e:
            logger.error(f"Failed to download file {file_name} from dataset {dataset_ref}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to download file: {str(e)}"
            )
    
    def get_download_status(self, dataset_ref: str) -> Optional[DownloadProgress]:
        """Get the status of a dataset download
        
        Args:
            dataset_ref: Dataset reference
            
        Returns:
            DownloadProgress object if found, None otherwise
        """
        with self.download_lock:
            return self.active_downloads.get(dataset_ref)
    
    def get_all_download_statuses(self) -> List[DownloadProgress]:
        """Get the status of all active downloads
        
        Returns:
            List of DownloadProgress objects
        """
        with self.download_lock:
            return list(self.active_downloads.values())
    
    def cancel_download(self, dataset_ref: str) -> bool:
        """Cancel a dataset download
        
        Args:
            dataset_ref: Dataset reference
            
        Returns:
            True if the download was cancelled, False otherwise
        """
        with self.download_lock:
            if dataset_ref not in self.active_downloads:
                return False
            
            progress = self.active_downloads[dataset_ref]
            progress.status = "cancelled"
            progress.end_time = time.time()
            
            # Remove from active downloads
            del self.active_downloads[dataset_ref]
        
        return True
    
    def clean_up_download(self, dataset_ref: str) -> bool:
        """Clean up a downloaded dataset
        
        Args:
            dataset_ref: Dataset reference
            
        Returns:
            True if the dataset was cleaned up, False otherwise
        """
        try:
            # Get download path
            download_path = self._get_download_path(dataset_ref)
            
            # Check if dataset exists
            if not os.path.exists(download_path):
                return False
            
            # Remove the dataset directory
            shutil.rmtree(download_path)
            
            # Remove from active downloads
            with self.download_lock:
                if dataset_ref in self.active_downloads:
                    del self.active_downloads[dataset_ref]
            
            return True
        except Exception as e:
            logger.error(f"Failed to clean up dataset {dataset_ref}: {str(e)}")
            return False 
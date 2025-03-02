"""
Kaggle Dataset Manipulation Component

This component handles dataset manipulation operations with the Kaggle API, including:
- Creating new datasets
- Updating existing datasets
- Adding files to datasets
- Deleting files from datasets
- Managing dataset metadata and settings
"""

import os
import logging
import json
import shutil
from typing import Dict, List, Optional, Any, Union
from pathlib import Path
from fastapi import HTTPException, UploadFile
from pydantic import BaseModel, Field

from .auth import KaggleAuth

logger = logging.getLogger(__name__)

class DatasetMetadata(BaseModel):
    """Model for dataset metadata"""
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    id: Optional[str] = None
    licenses: List[str] = Field(default_factory=lambda: ["cc0-1.0"])
    keywords: List[str] = Field(default_factory=list)
    collaborators: List[str] = Field(default_factory=list)
    data: Optional[Dict[str, Any]] = None

class DatasetFile(BaseModel):
    """Model for dataset file"""
    path: str
    description: Optional[str] = None
    name: Optional[str] = None

class DatasetManipulation:
    """Handles dataset manipulation operations with the Kaggle API"""
    
    def __init__(self, auth: KaggleAuth = None, data_dir: str = None):
        """Initialize the dataset manipulation handler
        
        Args:
            auth: KaggleAuth instance
            data_dir: Directory to store dataset files
        """
        self.auth = auth or KaggleAuth()
        self.data_dir = data_dir or os.getenv('DATA_DIR', 'data')
        self.kaggle_dir = os.path.join(self.data_dir, "kaggle")
        self.temp_dir = os.path.join(self.data_dir, "temp")
        
        # Create necessary directories
        os.makedirs(self.kaggle_dir, exist_ok=True)
        os.makedirs(self.temp_dir, exist_ok=True)
    
    async def create_dataset(
        self,
        metadata: DatasetMetadata,
        files: List[Union[str, DatasetFile]],
        public: bool = True
    ) -> Dict[str, Any]:
        """Create a new dataset on Kaggle
        
        Args:
            metadata: Dataset metadata
            files: List of files to include in the dataset
            public: Whether the dataset should be public
            
        Returns:
            Dictionary with creation information
        """
        try:
            logger.info(f"Creating new dataset: {metadata.title}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Create a temporary directory for the dataset
            dataset_dir = os.path.join(self.temp_dir, f"dataset_{metadata.title.replace(' ', '_').lower()}")
            os.makedirs(dataset_dir, exist_ok=True)
            
            # Process files
            dataset_files = []
            for file in files:
                if isinstance(file, str):
                    # File path provided
                    file_path = file
                    file_name = os.path.basename(file_path)
                    description = None
                else:
                    # DatasetFile object provided
                    file_path = file.path
                    file_name = file.name or os.path.basename(file_path)
                    description = file.description
                
                # Check if file exists
                if not os.path.exists(file_path):
                    raise ValueError(f"File not found: {file_path}")
                
                # Copy file to dataset directory
                dest_path = os.path.join(dataset_dir, file_name)
                shutil.copy2(file_path, dest_path)
                
                # Add to dataset files
                dataset_files.append({
                    "path": dest_path,
                    "name": file_name,
                    "description": description
                })
            
            # Create dataset metadata file
            metadata_dict = metadata.dict(exclude_none=True)
            metadata_path = os.path.join(dataset_dir, "dataset-metadata.json")
            
            with open(metadata_path, "w") as f:
                json.dump({
                    "id": metadata_dict.get("id", f"{api.config.username}/{metadata.title.replace(' ', '-').lower()}"),
                    "title": metadata.title,
                    "subtitle": metadata.subtitle,
                    "description": metadata.description,
                    "licenses": metadata.licenses,
                    "keywords": metadata.keywords,
                    "collaborators": metadata.collaborators,
                    "data": metadata.data
                }, f, indent=2)
            
            # Create the dataset on Kaggle
            result = api.dataset_create_new(
                folder=dataset_dir,
                public=public,
                convert_to_csv=False,
                dir_mode="zip"
            )
            
            # Clean up temporary directory
            shutil.rmtree(dataset_dir)
            
            logger.info(f"Dataset created successfully: {result['url']}")
            
            return {
                "success": True,
                "message": "Dataset created successfully",
                "dataset_ref": result["ref"],
                "url": result["url"],
                "files": [f["name"] for f in dataset_files]
            }
            
        except Exception as e:
            logger.error(f"Failed to create dataset: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create dataset: {str(e)}"
            )
    
    async def update_dataset(
        self,
        dataset_ref: str,
        metadata: Optional[DatasetMetadata] = None,
        files_to_add: List[Union[str, DatasetFile]] = None,
        files_to_remove: List[str] = None,
        new_version_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update an existing dataset on Kaggle
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            metadata: Updated dataset metadata
            files_to_add: List of files to add to the dataset
            files_to_remove: List of files to remove from the dataset
            new_version_notes: Notes for the new version
            
        Returns:
            Dictionary with update information
        """
        try:
            logger.info(f"Updating dataset: {dataset_ref}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Check if the user owns the dataset
            parts = dataset_ref.split('/')
            if len(parts) != 2:
                raise ValueError("Invalid dataset reference. Format should be 'owner/dataset'")
            
            owner, dataset_slug = parts
            if owner != api.config.username:
                raise HTTPException(
                    status_code=403,
                    detail=f"You don't have permission to update dataset {dataset_ref}"
                )
            
            # Download the current version of the dataset
            dataset_dir = os.path.join(self.temp_dir, f"dataset_{dataset_slug}")
            if os.path.exists(dataset_dir):
                shutil.rmtree(dataset_dir)
            os.makedirs(dataset_dir, exist_ok=True)
            
            # Download dataset files
            api.dataset_download_files(
                dataset=dataset_ref,
                path=dataset_dir,
                unzip=True,
                quiet=False
            )
            
            # Get current metadata
            try:
                dataset_info = api.dataset_view(dataset_ref)
                current_metadata = {
                    "id": dataset_ref,
                    "title": dataset_info.title,
                    "subtitle": getattr(dataset_info, "subtitle", None),
                    "description": getattr(dataset_info, "description", None),
                    "licenses": [getattr(dataset_info, "licenseName", "cc0-1.0")],
                    "keywords": [str(tag) for tag in getattr(dataset_info, "tags", [])],
                    "collaborators": []
                }
            except Exception as e:
                logger.error(f"Failed to get dataset metadata: {str(e)}")
                current_metadata = {
                    "id": dataset_ref,
                    "title": dataset_slug,
                    "licenses": ["cc0-1.0"],
                    "keywords": [],
                    "collaborators": []
                }
            
            # Update metadata if provided
            if metadata:
                metadata_dict = metadata.dict(exclude_none=True)
                for key, value in metadata_dict.items():
                    if key != "id":  # Don't update the ID
                        current_metadata[key] = value
            
            # Remove files if specified
            if files_to_remove:
                for file_name in files_to_remove:
                    file_path = os.path.join(dataset_dir, file_name)
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        logger.info(f"Removed file: {file_name}")
            
            # Add files if specified
            added_files = []
            if files_to_add:
                for file in files_to_add:
                    if isinstance(file, str):
                        # File path provided
                        file_path = file
                        file_name = os.path.basename(file_path)
                        description = None
                    else:
                        # DatasetFile object provided
                        file_path = file.path
                        file_name = file.name or os.path.basename(file_path)
                        description = file.description
                    
                    # Check if file exists
                    if not os.path.exists(file_path):
                        raise ValueError(f"File not found: {file_path}")
                    
                    # Copy file to dataset directory
                    dest_path = os.path.join(dataset_dir, file_name)
                    shutil.copy2(file_path, dest_path)
                    
                    # Add to added files
                    added_files.append(file_name)
                    logger.info(f"Added file: {file_name}")
            
            # Create dataset metadata file
            metadata_path = os.path.join(dataset_dir, "dataset-metadata.json")
            with open(metadata_path, "w") as f:
                json.dump(current_metadata, f, indent=2)
            
            # Update the dataset on Kaggle
            result = api.dataset_create_version(
                folder=dataset_dir,
                version_notes=new_version_notes or "Updated dataset",
                convert_to_csv=False,
                delete_old_versions=False,
                dir_mode="zip"
            )
            
            # Clean up temporary directory
            shutil.rmtree(dataset_dir)
            
            logger.info(f"Dataset updated successfully: {result['url']}")
            
            return {
                "success": True,
                "message": "Dataset updated successfully",
                "dataset_ref": dataset_ref,
                "url": result["url"],
                "files_added": added_files,
                "files_removed": files_to_remove or []
            }
            
        except Exception as e:
            logger.error(f"Failed to update dataset: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update dataset: {str(e)}"
            )
    
    async def upload_file_to_dataset(
        self,
        dataset_ref: str,
        file: UploadFile,
        description: Optional[str] = None,
        new_version_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload a file to an existing dataset
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            file: File to upload
            description: File description
            new_version_notes: Notes for the new version
            
        Returns:
            Dictionary with upload information
        """
        try:
            logger.info(f"Uploading file {file.filename} to dataset: {dataset_ref}")
            
            # Save the uploaded file to a temporary location
            temp_file_path = os.path.join(self.temp_dir, file.filename)
            with open(temp_file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            # Create a DatasetFile object
            dataset_file = DatasetFile(
                path=temp_file_path,
                name=file.filename,
                description=description
            )
            
            # Update the dataset with the new file
            result = await self.update_dataset(
                dataset_ref=dataset_ref,
                files_to_add=[dataset_file],
                new_version_notes=new_version_notes or f"Added file: {file.filename}"
            )
            
            # Clean up temporary file
            os.remove(temp_file_path)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to upload file to dataset: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload file to dataset: {str(e)}"
            )
    
    async def delete_dataset(self, dataset_ref: str) -> Dict[str, Any]:
        """Delete a dataset from Kaggle
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            
        Returns:
            Dictionary with deletion information
        """
        try:
            logger.info(f"Deleting dataset: {dataset_ref}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Check if the user owns the dataset
            parts = dataset_ref.split('/')
            if len(parts) != 2:
                raise ValueError("Invalid dataset reference. Format should be 'owner/dataset'")
            
            owner, dataset_slug = parts
            if owner != api.config.username:
                raise HTTPException(
                    status_code=403,
                    detail=f"You don't have permission to delete dataset {dataset_ref}"
                )
            
            # Delete the dataset
            api.dataset_delete(dataset_ref)
            
            logger.info(f"Dataset {dataset_ref} deleted successfully")
            
            return {
                "success": True,
                "message": f"Dataset {dataset_ref} deleted successfully",
                "dataset_ref": dataset_ref
            }
            
        except Exception as e:
            logger.error(f"Failed to delete dataset: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete dataset: {str(e)}"
            ) 
"""
Kaggle Dataset Discovery Component

This component handles dataset discovery operations with the Kaggle API, including:
- Searching for datasets with customizable queries
- Listing datasets by specific criteria
- Sorting and filtering datasets
"""

import logging
from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field
from fastapi import HTTPException, Query

from .auth import KaggleAuth

logger = logging.getLogger(__name__)

class DatasetSortBy(str, Enum):
    """Sort options for datasets"""
    HOTNESS = "hotness"
    VOTES = "votes"
    UPDATED = "updated"
    RELEVANCE = "relevance"
    DOWNLOADS = "downloads"

class DatasetFileType(str, Enum):
    """File types for datasets"""
    ALL = "all"
    CSV = "csv"
    JSON = "json"
    SQLITE = "sqlite"
    BIGQUERY = "bigQuery"
    PARQUET = "parquet"

class DatasetLicense(str, Enum):
    """License types for datasets"""
    ALL = "all"
    CC0 = "cc0-1.0"
    CC_BY = "cc-by-4.0"
    CC_BY_SA = "cc-by-sa-4.0"
    GPL = "gpl-2.0"
    ODB = "odbl-1.0"
    OTHER = "other"

class KaggleDatasetMetadata(BaseModel):
    """Metadata for a Kaggle dataset"""
    ref: str
    title: str
    size: str
    lastUpdated: str
    downloadCount: int
    voteCount: Optional[int] = None
    usabilityRating: Optional[float] = None
    description: str
    ownerName: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)
    license: Optional[str] = None
    url: str
    fileTypes: Optional[List[str]] = Field(default_factory=list)
    totalBytes: Optional[int] = None

class DatasetDiscovery:
    """Handles dataset discovery operations with the Kaggle API"""
    
    def __init__(self, auth: KaggleAuth = None):
        """Initialize the dataset discovery handler
        
        Args:
            auth: KaggleAuth instance
        """
        self.auth = auth or KaggleAuth()
    
    async def search_datasets(
        self,
        query: str,
        sort_by: DatasetSortBy = DatasetSortBy.RELEVANCE,
        file_type: DatasetFileType = DatasetFileType.ALL,
        license_type: DatasetLicense = DatasetLicense.ALL,
        tag_ids: Optional[List[str]] = None,
        search_in: Optional[str] = None,
        user: Optional[str] = None,
        max_size: Optional[int] = None,
        min_votes: Optional[int] = None,
        page: int = 1,
        page_size: int = 20
    ) -> List[KaggleDatasetMetadata]:
        """Search for datasets on Kaggle
        
        Args:
            query: Search query
            sort_by: Sort order for results
            file_type: Filter by file type
            license_type: Filter by license type
            tag_ids: Filter by tag IDs
            search_in: Search in specific fields (title, description, etc.)
            user: Filter by user/owner
            max_size: Maximum dataset size in bytes
            min_votes: Minimum number of votes
            page: Page number
            page_size: Number of results per page
            
        Returns:
            List of KaggleDatasetMetadata objects
        """
        try:
            logger.info(f"Searching for datasets with query: {query}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Build search parameters
            search_params = {
                "search": query,
                "sort_by": sort_by.value,
                "page": page,
                "page_size": page_size
            }
            
            # Add optional filters
            if file_type != DatasetFileType.ALL:
                search_params["file_type"] = file_type.value
            
            if license_type != DatasetLicense.ALL:
                search_params["license_name"] = license_type.value
            
            if tag_ids:
                search_params["tag_ids"] = tag_ids
            
            if user:
                search_params["user"] = user
            
            # Execute search
            logger.info(f"Executing dataset search with params: {search_params}")
            datasets = api.dataset_list(**search_params)
            
            # Process results
            results = []
            for dataset in datasets:
                try:
                    # Skip datasets that don't match our filters
                    if max_size and getattr(dataset, "totalBytes", 0) > max_size:
                        continue
                    
                    if min_votes and getattr(dataset, "voteCount", 0) < min_votes:
                        continue
                    
                    # Convert to our metadata model
                    metadata = KaggleDatasetMetadata(
                        ref=f"{dataset.ownerRef}/{dataset.ref.split('/')[-1] if '/' in dataset.ref else dataset.ref}",
                        title=dataset.title,
                        size=str(dataset.size),  # Size is already a string like "11KB"
                        lastUpdated=str(dataset.lastUpdated),
                        downloadCount=dataset.downloadCount,
                        voteCount=getattr(dataset, "voteCount", None),
                        usabilityRating=getattr(dataset, "usabilityRating", None),
                        description=getattr(dataset, "subtitle", "") or getattr(dataset, "description", ""),
                        ownerName=getattr(dataset, "ownerName", None),
                        tags=[str(tag) for tag in getattr(dataset, "tags", [])],
                        license=getattr(dataset, "licenseName", None),
                        url=dataset.url,
                        fileTypes=getattr(dataset, "fileTypes", []),
                        totalBytes=getattr(dataset, "totalBytes", None)
                    )
                    results.append(metadata)
                except Exception as e:
                    logger.error(f"Error processing dataset {getattr(dataset, 'ref', 'unknown')}: {str(e)}")
                    continue
            
            logger.info(f"Found {len(results)} datasets for query: {query}")
            return results
            
        except Exception as e:
            logger.error(f"Failed to search Kaggle datasets: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to search Kaggle datasets: {str(e)}"
            )
    
    async def get_dataset_tags(self) -> List[Dict[str, Any]]:
        """Get all available dataset tags
        
        Returns:
            List of tag objects with id, name, and description
        """
        try:
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get tags
            tags = api.dataset_list_tags()
            
            # Convert to dict format
            tag_list = []
            for tag in tags:
                tag_list.append({
                    "id": tag.id,
                    "name": tag.name,
                    "description": tag.description,
                    "ref": tag.ref,
                    "count": tag.datasetCount
                })
            
            return tag_list
        except Exception as e:
            logger.error(f"Failed to get dataset tags: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get dataset tags: {str(e)}"
            )
    
    async def get_dataset_details(self, dataset_ref: str) -> Dict[str, Any]:
        """Get detailed information about a specific dataset
        
        Args:
            dataset_ref: Dataset reference in format "owner/dataset"
            
        Returns:
            Dictionary with dataset details
        """
        try:
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get dataset details
            dataset = api.dataset_view(dataset_ref)
            
            # Convert to dict format
            details = {
                "ref": dataset_ref,
                "title": dataset.title,
                "subtitle": dataset.subtitle,
                "description": dataset.description,
                "isPrivate": dataset.isPrivate,
                "licenseName": dataset.licenseName,
                "ownerName": dataset.ownerName,
                "ownerRef": dataset.ownerRef,
                "lastUpdated": str(dataset.lastUpdated),
                "totalBytes": dataset.totalBytes,
                "url": dataset.url,
                "downloadCount": dataset.downloadCount,
                "voteCount": dataset.voteCount,
                "usabilityRating": dataset.usabilityRating,
                "tags": [str(tag) for tag in dataset.tags],
                "files": []
            }
            
            # Get dataset files
            files = api.dataset_list_files(dataset_ref)
            for file in files:
                details["files"].append({
                    "name": file.name,
                    "size": file.size,
                    "creationDate": str(file.creationDate)
                })
            
            return details
        except Exception as e:
            logger.error(f"Failed to get dataset details for {dataset_ref}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get dataset details: {str(e)}"
            )
    
    async def get_trending_datasets(self, limit: int = 10) -> List[KaggleDatasetMetadata]:
        """Get trending datasets
        
        Args:
            limit: Maximum number of datasets to return
            
        Returns:
            List of KaggleDatasetMetadata objects
        """
        return await self.search_datasets(
            query="",
            sort_by=DatasetSortBy.HOTNESS,
            page_size=limit
        )
    
    async def get_popular_datasets(self, limit: int = 10) -> List[KaggleDatasetMetadata]:
        """Get popular datasets based on download count
        
        Args:
            limit: Maximum number of datasets to return
            
        Returns:
            List of KaggleDatasetMetadata objects
        """
        return await self.search_datasets(
            query="",
            sort_by=DatasetSortBy.DOWNLOADS,
            page_size=limit
        ) 
"""
Kaggle User Management Component

This component handles user-related operations with the Kaggle API, including:
- Viewing user profiles and datasets
- Following/unfollowing users
- Listing followed users and their activities
"""

import logging
from typing import Dict, List, Optional, Any
from fastapi import HTTPException
from pydantic import BaseModel

from .auth import KaggleAuth

logger = logging.getLogger(__name__)

class KaggleUser(BaseModel):
    """Model for Kaggle user"""
    username: str
    displayName: str
    url: str
    thumbnailUrl: Optional[str] = None
    tier: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    organization: Optional[str] = None
    followerCount: Optional[int] = None
    datasetCount: Optional[int] = None
    notebookCount: Optional[int] = None
    isFollowing: bool = False

class UserManagement:
    """Handles user-related operations with the Kaggle API"""
    
    def __init__(self, auth: KaggleAuth = None):
        """Initialize the user management handler
        
        Args:
            auth: KaggleAuth instance
        """
        self.auth = auth or KaggleAuth()
    
    async def get_user_profile(self, username: str) -> KaggleUser:
        """Get a user's profile
        
        Args:
            username: Kaggle username
            
        Returns:
            KaggleUser object
        """
        try:
            logger.info(f"Getting profile for user: {username}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get user profile
            user = api.user_view(username)
            
            # Convert to response format
            profile = KaggleUser(
                username=user.username,
                displayName=user.displayName,
                url=user.url,
                thumbnailUrl=getattr(user, "thumbnailUrl", None),
                tier=getattr(user, "tier", None),
                bio=getattr(user, "bio", None),
                location=getattr(user, "location", None),
                occupation=getattr(user, "occupation", None),
                organization=getattr(user, "organization", None),
                followerCount=getattr(user, "followerCount", None),
                datasetCount=getattr(user, "datasetCount", None),
                notebookCount=getattr(user, "notebookCount", None),
                isFollowing=getattr(user, "isFollowing", False)
            )
            
            return profile
            
        except Exception as e:
            logger.error(f"Failed to get user profile: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get user profile: {str(e)}"
            )
    
    async def get_current_user_profile(self) -> KaggleUser:
        """Get the current user's profile
        
        Returns:
            KaggleUser object
        """
        try:
            logger.info("Getting current user profile")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get current username
            username = api.config.username
            
            # Get user profile
            return await self.get_user_profile(username)
            
        except Exception as e:
            logger.error(f"Failed to get current user profile: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get current user profile: {str(e)}"
            )
    
    async def list_user_datasets(self, username: str) -> List[Dict[str, Any]]:
        """List datasets created by a user
        
        Args:
            username: Kaggle username
            
        Returns:
            List of dataset objects
        """
        try:
            logger.info(f"Listing datasets for user: {username}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get user datasets
            datasets = api.dataset_list(user=username)
            
            # Convert to response format
            results = []
            for dataset in datasets:
                try:
                    results.append({
                        "ref": dataset.ref,
                        "title": dataset.title,
                        "size": str(dataset.size),
                        "lastUpdated": str(dataset.lastUpdated),
                        "downloadCount": dataset.downloadCount,
                        "voteCount": getattr(dataset, "voteCount", None),
                        "description": getattr(dataset, "subtitle", "") or getattr(dataset, "description", ""),
                        "url": dataset.url
                    })
                except Exception as e:
                    logger.error(f"Error processing dataset {getattr(dataset, 'ref', 'unknown')}: {str(e)}")
                    continue
            
            logger.info(f"Found {len(results)} datasets for user {username}")
            return results
            
        except Exception as e:
            logger.error(f"Failed to list user datasets: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to list user datasets: {str(e)}"
            )
    
    async def follow_user(self, username: str) -> Dict[str, Any]:
        """Follow a user
        
        Args:
            username: Kaggle username to follow
            
        Returns:
            Dictionary with follow information
        """
        try:
            logger.info(f"Following user: {username}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Follow user
            api.user_follow(username)
            
            logger.info(f"Successfully followed user {username}")
            
            return {
                "success": True,
                "message": f"Successfully followed user {username}",
                "username": username
            }
            
        except Exception as e:
            logger.error(f"Failed to follow user: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to follow user: {str(e)}"
            )
    
    async def unfollow_user(self, username: str) -> Dict[str, Any]:
        """Unfollow a user
        
        Args:
            username: Kaggle username to unfollow
            
        Returns:
            Dictionary with unfollow information
        """
        try:
            logger.info(f"Unfollowing user: {username}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Unfollow user
            api.user_unfollow(username)
            
            logger.info(f"Successfully unfollowed user {username}")
            
            return {
                "success": True,
                "message": f"Successfully unfollowed user {username}",
                "username": username
            }
            
        except Exception as e:
            logger.error(f"Failed to unfollow user: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to unfollow user: {str(e)}"
            )
    
    async def list_followed_users(self) -> List[KaggleUser]:
        """List users followed by the current user
        
        Returns:
            List of KaggleUser objects
        """
        try:
            logger.info("Listing followed users")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get followed users
            users = api.user_list_followed()
            
            # Convert to response format
            results = []
            for user in users:
                try:
                    results.append(KaggleUser(
                        username=user.username,
                        displayName=user.displayName,
                        url=user.url,
                        thumbnailUrl=getattr(user, "thumbnailUrl", None),
                        tier=getattr(user, "tier", None),
                        bio=getattr(user, "bio", None),
                        location=getattr(user, "location", None),
                        occupation=getattr(user, "occupation", None),
                        organization=getattr(user, "organization", None),
                        followerCount=getattr(user, "followerCount", None),
                        datasetCount=getattr(user, "datasetCount", None),
                        notebookCount=getattr(user, "notebookCount", None),
                        isFollowing=True
                    ))
                except Exception as e:
                    logger.error(f"Error processing user {getattr(user, 'username', 'unknown')}: {str(e)}")
                    continue
            
            logger.info(f"Found {len(results)} followed users")
            return results
            
        except Exception as e:
            logger.error(f"Failed to list followed users: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to list followed users: {str(e)}"
            )
    
    async def list_user_followers(self, username: str) -> List[KaggleUser]:
        """List followers of a user
        
        Args:
            username: Kaggle username
            
        Returns:
            List of KaggleUser objects
        """
        try:
            logger.info(f"Listing followers for user: {username}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get user followers
            users = api.user_list_followers(username)
            
            # Convert to response format
            results = []
            for user in users:
                try:
                    results.append(KaggleUser(
                        username=user.username,
                        displayName=user.displayName,
                        url=user.url,
                        thumbnailUrl=getattr(user, "thumbnailUrl", None),
                        tier=getattr(user, "tier", None),
                        bio=getattr(user, "bio", None),
                        location=getattr(user, "location", None),
                        occupation=getattr(user, "occupation", None),
                        organization=getattr(user, "organization", None),
                        followerCount=getattr(user, "followerCount", None),
                        datasetCount=getattr(user, "datasetCount", None),
                        notebookCount=getattr(user, "notebookCount", None),
                        isFollowing=getattr(user, "isFollowing", False)
                    ))
                except Exception as e:
                    logger.error(f"Error processing user {getattr(user, 'username', 'unknown')}: {str(e)}")
                    continue
            
            logger.info(f"Found {len(results)} followers for user {username}")
            return results
            
        except Exception as e:
            logger.error(f"Failed to list user followers: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to list user followers: {str(e)}"
            ) 
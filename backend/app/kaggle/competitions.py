"""
Kaggle Competition Integration Component

This component handles competition operations with the Kaggle API, including:
- Listing available competitions
- Downloading competition datasets
- Submitting competition entries
- Viewing competition leaderboards
"""

import os
import logging
import shutil
from typing import Dict, List, Optional, Any
from pathlib import Path
from fastapi import HTTPException, UploadFile
from pydantic import BaseModel, Field

from .auth import KaggleAuth

logger = logging.getLogger(__name__)

class CompetitionDetails(BaseModel):
    """Model for competition details"""
    ref: str
    title: str
    url: str
    description: Optional[str] = None
    deadline: Optional[str] = None
    category: Optional[str] = None
    reward: Optional[str] = None
    teamCount: Optional[int] = None
    userHasEntered: bool = False
    userRank: Optional[int] = None
    userTeam: Optional[str] = None

class LeaderboardEntry(BaseModel):
    """Model for leaderboard entry"""
    teamId: str
    teamName: str
    submissionDate: str
    score: float
    rank: int

class SubmissionResult(BaseModel):
    """Model for submission result"""
    success: bool
    message: str
    submissionId: Optional[str] = None
    url: Optional[str] = None
    status: Optional[str] = None
    score: Optional[float] = None

class CompetitionIntegration:
    """Handles competition operations with the Kaggle API"""
    
    def __init__(self, auth: KaggleAuth = None, data_dir: str = None):
        """Initialize the competition integration handler
        
        Args:
            auth: KaggleAuth instance
            data_dir: Directory to store competition files
        """
        self.auth = auth or KaggleAuth()
        self.data_dir = data_dir or os.getenv('DATA_DIR', 'data')
        self.competitions_dir = os.path.join(self.data_dir, "competitions")
        self.temp_dir = os.path.join(self.data_dir, "temp")
        
        # Create necessary directories
        os.makedirs(self.competitions_dir, exist_ok=True)
        os.makedirs(self.temp_dir, exist_ok=True)
    
    async def list_competitions(
        self,
        category: Optional[str] = None,
        sort_by: str = "latestDeadline",
        page: int = 1,
        search: Optional[str] = None
    ) -> List[CompetitionDetails]:
        """List available competitions
        
        Args:
            category: Filter by category
            sort_by: Sort order (latestDeadline, prize, recentlyCreated, etc.)
            page: Page number
            search: Search query
            
        Returns:
            List of CompetitionDetails objects
        """
        try:
            logger.info("Listing Kaggle competitions")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Build search parameters
            params = {
                "page": page,
                "sortBy": sort_by
            }
            
            if category:
                params["category"] = category
            
            if search:
                params["search"] = search
            
            # Get competitions
            competitions = api.competitions_list(**params)
            
            # Convert to response format
            results = []
            for comp in competitions:
                try:
                    details = CompetitionDetails(
                        ref=comp.ref,
                        title=comp.title,
                        url=comp.url,
                        description=getattr(comp, "description", None),
                        deadline=str(getattr(comp, "deadline", "")),
                        category=getattr(comp, "category", None),
                        reward=getattr(comp, "reward", None),
                        teamCount=getattr(comp, "teamCount", None),
                        userHasEntered=getattr(comp, "userHasEntered", False),
                        userRank=getattr(comp, "userRank", None),
                        userTeam=getattr(comp, "userTeam", None)
                    )
                    results.append(details)
                except Exception as e:
                    logger.error(f"Error processing competition {getattr(comp, 'ref', 'unknown')}: {str(e)}")
                    continue
            
            logger.info(f"Found {len(results)} competitions")
            return results
            
        except Exception as e:
            logger.error(f"Failed to list competitions: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to list competitions: {str(e)}"
            )
    
    async def get_competition_details(self, competition_ref: str) -> CompetitionDetails:
        """Get details for a specific competition
        
        Args:
            competition_ref: Competition reference
            
        Returns:
            CompetitionDetails object
        """
        try:
            logger.info(f"Getting details for competition: {competition_ref}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get competition details
            comp = api.competition_view(competition_ref)
            
            # Convert to response format
            details = CompetitionDetails(
                ref=comp.ref,
                title=comp.title,
                url=comp.url,
                description=getattr(comp, "description", None),
                deadline=str(getattr(comp, "deadline", "")),
                category=getattr(comp, "category", None),
                reward=getattr(comp, "reward", None),
                teamCount=getattr(comp, "teamCount", None),
                userHasEntered=getattr(comp, "userHasEntered", False),
                userRank=getattr(comp, "userRank", None),
                userTeam=getattr(comp, "userTeam", None)
            )
            
            return details
            
        except Exception as e:
            logger.error(f"Failed to get competition details: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get competition details: {str(e)}"
            )
    
    async def download_competition_files(
        self,
        competition_ref: str,
        force: bool = False
    ) -> Dict[str, Any]:
        """Download files for a competition
        
        Args:
            competition_ref: Competition reference
            force: Whether to force re-download if files already exist
            
        Returns:
            Dictionary with download information
        """
        try:
            logger.info(f"Downloading files for competition: {competition_ref}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get download path
            download_path = os.path.join(self.competitions_dir, competition_ref)
            
            # Check if files already exist
            if os.path.exists(download_path) and not force:
                logger.info(f"Competition files already exist at {download_path}")
                
                # Get list of files
                files = []
                for root, _, filenames in os.walk(download_path):
                    for filename in filenames:
                        file_path = os.path.join(root, filename)
                        rel_path = os.path.relpath(file_path, download_path)
                        files.append({
                            "name": filename,
                            "path": rel_path,
                            "size": os.path.getsize(file_path)
                        })
                
                return {
                    "success": True,
                    "message": f"Competition files already exist",
                    "competition_ref": competition_ref,
                    "download_path": download_path,
                    "files": files
                }
            
            # Create directory if it doesn't exist
            os.makedirs(download_path, exist_ok=True)
            
            # Download competition files
            api.competition_download_files(
                competition=competition_ref,
                path=download_path,
                quiet=False
            )
            
            logger.info(f"Competition files downloaded successfully to {download_path}")
            
            # Get list of files
            files = []
            for root, _, filenames in os.walk(download_path):
                for filename in filenames:
                    file_path = os.path.join(root, filename)
                    rel_path = os.path.relpath(file_path, download_path)
                    files.append({
                        "name": filename,
                        "path": rel_path,
                        "size": os.path.getsize(file_path)
                    })
            
            return {
                "success": True,
                "message": f"Competition files downloaded successfully",
                "competition_ref": competition_ref,
                "download_path": download_path,
                "files": files
            }
            
        except Exception as e:
            logger.error(f"Failed to download competition files: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to download competition files: {str(e)}"
            )
    
    async def get_competition_leaderboard(
        self,
        competition_ref: str,
        page: int = 1
    ) -> List[LeaderboardEntry]:
        """Get the leaderboard for a competition
        
        Args:
            competition_ref: Competition reference
            page: Page number
            
        Returns:
            List of LeaderboardEntry objects
        """
        try:
            logger.info(f"Getting leaderboard for competition: {competition_ref}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get leaderboard
            leaderboard = api.competition_leaderboard_view(competition_ref, page=page)
            
            # Convert to response format
            results = []
            for entry in leaderboard:
                try:
                    results.append(LeaderboardEntry(
                        teamId=entry.teamId,
                        teamName=entry.teamName,
                        submissionDate=str(entry.submissionDate),
                        score=float(entry.score),
                        rank=int(entry.rank)
                    ))
                except Exception as e:
                    logger.error(f"Error processing leaderboard entry: {str(e)}")
                    continue
            
            logger.info(f"Found {len(results)} leaderboard entries")
            return results
            
        except Exception as e:
            logger.error(f"Failed to get competition leaderboard: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get competition leaderboard: {str(e)}"
            )
    
    async def submit_to_competition(
        self,
        competition_ref: str,
        file: UploadFile,
        message: str
    ) -> SubmissionResult:
        """Submit an entry to a competition
        
        Args:
            competition_ref: Competition reference
            file: File to submit
            message: Submission message
            
        Returns:
            SubmissionResult object
        """
        try:
            logger.info(f"Submitting to competition: {competition_ref}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Save the uploaded file to a temporary location
            temp_file_path = os.path.join(self.temp_dir, file.filename)
            with open(temp_file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            # Submit to competition
            result = api.competition_submit(
                file_path=temp_file_path,
                message=message,
                competition=competition_ref,
                quiet=False
            )
            
            # Clean up temporary file
            os.remove(temp_file_path)
            
            logger.info(f"Submission successful: {result}")
            
            return SubmissionResult(
                success=True,
                message="Submission successful",
                submissionId=result.get("submissionId"),
                url=result.get("url"),
                status=result.get("status")
            )
            
        except Exception as e:
            logger.error(f"Failed to submit to competition: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to submit to competition: {str(e)}"
            )
    
    async def get_competition_submissions(self, competition_ref: str) -> List[Dict[str, Any]]:
        """Get submissions for a competition
        
        Args:
            competition_ref: Competition reference
            
        Returns:
            List of submission objects
        """
        try:
            logger.info(f"Getting submissions for competition: {competition_ref}")
            
            # Get authenticated API
            api = self.auth.get_authenticated_api()
            
            # Get submissions
            submissions = api.competition_submissions(competition_ref)
            
            # Convert to response format
            results = []
            for submission in submissions:
                results.append({
                    "id": submission.id,
                    "status": submission.status,
                    "score": submission.score,
                    "date": str(submission.date),
                    "description": submission.description,
                    "fileName": submission.fileName,
                    "publicScore": submission.publicScore,
                    "privateScore": submission.privateScore
                })
            
            logger.info(f"Found {len(results)} submissions")
            return results
            
        except Exception as e:
            logger.error(f"Failed to get competition submissions: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get competition submissions: {str(e)}"
            ) 
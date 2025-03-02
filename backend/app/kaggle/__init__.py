"""
Kaggle API Integration Module

This module provides comprehensive integration with the Kaggle API,
allowing users to discover, retrieve, and manipulate datasets from Kaggle.
"""

__version__ = "0.1.0"

from .router import router as kaggle_router
from .auth import KaggleAuth, KaggleCredentials
from .discovery import DatasetDiscovery, KaggleDatasetMetadata
from .retrieval import DatasetRetrieval, DownloadProgress
from .manipulation import DatasetManipulation, DatasetMetadata, DatasetFile
from .competitions import CompetitionIntegration, CompetitionDetails, LeaderboardEntry, SubmissionResult
from .users import UserManagement, KaggleUser
from .local import LocalDatasetManagement, LocalDatasetInfo

__all__ = [
    'kaggle_router',
    'KaggleAuth',
    'KaggleCredentials',
    'DatasetDiscovery',
    'KaggleDatasetMetadata',
    'DatasetRetrieval',
    'DownloadProgress',
    'DatasetManipulation',
    'DatasetMetadata',
    'DatasetFile',
    'CompetitionIntegration',
    'CompetitionDetails',
    'LeaderboardEntry',
    'SubmissionResult',
    'UserManagement',
    'KaggleUser',
    'LocalDatasetManagement',
    'LocalDatasetInfo'
] 
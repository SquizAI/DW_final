# Kaggle API Integration

This module provides comprehensive integration with the Kaggle API, allowing users to discover, retrieve, and manipulate datasets from Kaggle.

## Features

### Authentication and Setup
- Kaggle API credentials configuration (username/key)
- Secure storage of credentials
- Authentication validation and error handling

### Dataset Discovery
- Search datasets with customizable queries
- List datasets by specific criteria (tags, file types, licenses)
- Sort datasets by relevance, date, downloads, etc.
- Filter datasets by size, file format, or other metadata

### Dataset Retrieval
- Download complete datasets
- Download specific files from datasets
- Resume interrupted downloads
- Track download progress

### Dataset Metadata
- View dataset details (title, description, size)
- Access dataset statistics (download count, last updated)
- List dataset files and their properties
- View dataset versions and changelog

### Dataset Manipulation
- Create new datasets
- Update existing datasets
- Add files to datasets
- Delete files from datasets
- Manage dataset metadata and settings

### Competition Integration
- List available competitions
- Download competition datasets
- Submit competition entries
- View competition leaderboards

### User Management
- View user profiles and datasets
- Follow/unfollow users
- List followed users and their activities

### Local Dataset Management
- Store downloaded datasets in organized structure
- Track local datasets and their origins
- Synchronize local datasets with Kaggle
- Manage dataset versions locally

## Usage

### Authentication

```python
from app.kaggle import KaggleAuth, KaggleCredentials

# Create auth handler
auth = KaggleAuth()

# Save credentials
credentials = KaggleCredentials(username="your_username", key="your_api_key")
auth.save_credentials(credentials)

# Test authentication
success, error = auth.authenticate()
if success:
    print("Authentication successful!")
else:
    print(f"Authentication failed: {error}")
```

### Dataset Discovery

```python
from app.kaggle import DatasetDiscovery, DatasetSortBy, DatasetFileType, DatasetLicense

# Create discovery handler
discovery = DatasetDiscovery()

# Search for datasets
datasets = await discovery.search_datasets(
    query="titanic",
    sort_by=DatasetSortBy.DOWNLOADS,
    file_type=DatasetFileType.CSV,
    license_type=DatasetLicense.CC0,
    page=1,
    page_size=10
)

# Get trending datasets
trending = await discovery.get_trending_datasets(limit=5)

# Get dataset details
details = await discovery.get_dataset_details("heptapod/titanic")
```

### Dataset Retrieval

```python
from app.kaggle import DatasetRetrieval

# Create retrieval handler
retrieval = DatasetRetrieval()

# Download a dataset
result = await retrieval.download_dataset(
    dataset_ref="heptapod/titanic",
    unzip=True,
    force=False
)

# Download a specific file
file_result = await retrieval.download_dataset_file(
    dataset_ref="heptapod/titanic",
    file_name="train.csv",
    force=False
)

# Get download status
status = retrieval.get_download_status("heptapod/titanic")
```

### Dataset Manipulation

```python
from app.kaggle import DatasetManipulation, DatasetMetadata

# Create manipulation handler
manipulation = DatasetManipulation()

# Create a new dataset
metadata = DatasetMetadata(
    title="My Dataset",
    subtitle="A sample dataset",
    description="This is a sample dataset for testing",
    licenses=["cc0-1.0"],
    keywords=["sample", "test"]
)

result = await manipulation.create_dataset(
    metadata=metadata,
    files=["data/file1.csv", "data/file2.csv"],
    public=True
)

# Update an existing dataset
update_result = await manipulation.update_dataset(
    dataset_ref="username/my-dataset",
    metadata=metadata,
    files_to_add=["data/file3.csv"],
    files_to_remove=["file1.csv"],
    new_version_notes="Added file3.csv, removed file1.csv"
)
```

### Competition Integration

```python
from app.kaggle import CompetitionIntegration

# Create competition handler
competition = CompetitionIntegration()

# List competitions
competitions = await competition.list_competitions(
    category="featured",
    sort_by="latestDeadline",
    page=1
)

# Get competition details
details = await competition.get_competition_details("titanic")

# Download competition files
files = await competition.download_competition_files(
    competition_ref="titanic",
    force=False
)

# Get competition leaderboard
leaderboard = await competition.get_competition_leaderboard(
    competition_ref="titanic",
    page=1
)
```

### User Management

```python
from app.kaggle import UserManagement

# Create user management handler
user_mgmt = UserManagement()

# Get current user profile
profile = await user_mgmt.get_current_user_profile()

# Get user profile
user = await user_mgmt.get_user_profile("username")

# List user datasets
datasets = await user_mgmt.list_user_datasets("username")

# Follow/unfollow user
follow_result = await user_mgmt.follow_user("username")
unfollow_result = await user_mgmt.unfollow_user("username")

# List followed users
followed = await user_mgmt.list_followed_users()
```

### Local Dataset Management

```python
from app.kaggle import LocalDatasetManagement

# Create local dataset management handler
local_mgmt = LocalDatasetManagement()

# List local datasets
datasets = await local_mgmt.list_local_datasets()

# Get local dataset details
dataset = await local_mgmt.get_local_dataset("username/dataset")

# Update dataset metadata
updated = await local_mgmt.update_dataset_metadata(
    dataset_ref="username/dataset",
    metadata={"tags": ["sample", "test"]}
)

# Synchronize dataset with Kaggle
sync_result = await local_mgmt.sync_dataset("username/dataset")

# Clean up old datasets
cleanup_result = await local_mgmt.clean_up_old_datasets(days_threshold=30)
```

## Debug Server

For testing without actual Kaggle API access, you can use the debug server:

```python
from app.kaggle.debug import create_debug_app

# Create a FastAPI app with mock Kaggle endpoints
app = create_debug_app()
```

Or run the debug server directly:

```bash
python run_kaggle_debug_server.py
```

This will start a server with mock implementations of the Kaggle API endpoints, including:

- `GET /api/kaggle/search`: Search for datasets (returns sample data)
- `POST /api/kaggle/download`: Download a dataset (creates a mock CSV file)
- `POST /api/kaggle/credentials`: Save Kaggle API credentials (mock implementation)
- `GET /api/kaggle/auth/status`: Check authentication status (always returns success)

The debug server also supports alternative paths without the `/api` prefix for backward compatibility.

## API Endpoints

The module provides a FastAPI router with the following endpoints:

### Authentication
- `POST /api/kaggle/credentials`: Save Kaggle API credentials
- `GET /api/kaggle/auth/status`: Check authentication status

### Dataset Discovery
- `GET /api/kaggle/datasets/search`: Search for datasets
- `GET /api/kaggle/datasets/tags`: Get all available dataset tags
- `GET /api/kaggle/datasets/{dataset_ref}`: Get dataset details
- `GET /api/kaggle/datasets/trending`: Get trending datasets
- `GET /api/kaggle/datasets/popular`: Get popular datasets

### Dataset Retrieval
- `POST /api/kaggle/datasets/download`: Download a dataset
- `POST /api/kaggle/datasets/download/file`: Download a specific file
- `GET /api/kaggle/datasets/download/status/{dataset_ref}`: Get download status
- `GET /api/kaggle/datasets/download/status`: Get all download statuses
- `POST /api/kaggle/datasets/download/cancel/{dataset_ref}`: Cancel a download

### Dataset Manipulation
- `POST /api/kaggle/datasets/create`: Create a new dataset
- `POST /api/kaggle/datasets/update/{dataset_ref}`: Update a dataset
- `POST /api/kaggle/datasets/upload/{dataset_ref}`: Upload a file to a dataset
- `DELETE /api/kaggle/datasets/{dataset_ref}`: Delete a dataset

### Competition Integration
- `GET /api/kaggle/competitions`: List competitions
- `GET /api/kaggle/competitions/{competition_ref}`: Get competition details
- `POST /api/kaggle/competitions/download/{competition_ref}`: Download competition files
- `GET /api/kaggle/competitions/{competition_ref}/leaderboard`: Get competition leaderboard
- `POST /api/kaggle/competitions/{competition_ref}/submit`: Submit to a competition
- `GET /api/kaggle/competitions/{competition_ref}/submissions`: Get competition submissions

### User Management
- `GET /api/kaggle/users/{username}`: Get user profile
- `GET /api/kaggle/users/me`: Get current user profile
- `GET /api/kaggle/users/{username}/datasets`: List user datasets
- `POST /api/kaggle/users/follow/{username}`: Follow a user
- `POST /api/kaggle/users/unfollow/{username}`: Unfollow a user
- `GET /api/kaggle/users/followed`: List followed users
- `GET /api/kaggle/users/{username}/followers`: List user followers

### Local Dataset Management
- `GET /api/kaggle/local/datasets`: List local datasets
- `GET /api/kaggle/local/datasets/{dataset_ref}`: Get local dataset details
- `POST /api/kaggle/local/datasets/{dataset_ref}/metadata`: Update dataset metadata
- `POST /api/kaggle/local/datasets/{dataset_ref}/sync`: Synchronize dataset with Kaggle
- `DELETE /api/kaggle/local/datasets/{dataset_ref}`: Unregister a dataset
- `POST /api/kaggle/local/cleanup`: Clean up old datasets

## Testing

To test the Kaggle API integration, run the test script:

```bash
python test_kaggle_integration.py
```

This script tests all components of the Kaggle API integration, including authentication, dataset discovery, retrieval, manipulation, competition integration, user management, and local dataset management.

## Dependencies

- `kaggle`: Kaggle API client
- `fastapi`: FastAPI framework
- `pydantic`: Data validation and settings management
- `httpx`: HTTP client
- `aiofiles`: Asynchronous file operations 
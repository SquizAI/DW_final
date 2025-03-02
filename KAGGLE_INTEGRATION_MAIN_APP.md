# Kaggle Integration in the Main Application

This document explains how to use the Kaggle integration features in the main application.

## Overview

The Kaggle integration allows you to:

1. **Search for datasets** on Kaggle directly from the application
2. **Download datasets** to your local machine
3. **Manage downloaded datasets** through a dedicated interface
4. **Track download progress and status**

## Accessing Kaggle Features

The Kaggle integration is available in two main places:

### 1. Data Upload Page

The Data Upload page includes a dedicated "Kaggle Datasets" tab that allows you to:

- Search for datasets on Kaggle
- View dataset details including size, download count, and description
- Download datasets directly to your application

To access this feature:
1. Navigate to the Data Upload page
2. Click on the "Kaggle Datasets" tab
3. Enter a search term and click "Search"
4. Browse the results and click "Download" on any dataset you want to use

### 2. Kaggle Manager

The Kaggle Manager is a dedicated page for managing all aspects of your Kaggle integration:

- View all locally downloaded datasets
- Search for new datasets on Kaggle
- Track download status and progress
- View detailed information about downloaded files
- Delete datasets you no longer need

To access the Kaggle Manager:
1. Navigate to `/kaggle/manager` in the application
2. Use the tabs to switch between local datasets, search, and download status

## Setting Up Kaggle Credentials

To use the Kaggle integration with the real Kaggle API, you need to set up your credentials:

1. Create a Kaggle account at [kaggle.com](https://www.kaggle.com/) if you don't have one
2. Go to your account settings: https://www.kaggle.com/settings
3. Scroll down to the "API" section
4. Click "Create New API Token" to download a `kaggle.json` file
5. This file contains your API credentials in the format:
   ```json
   {"username":"your_username","key":"your_api_key"}
   ```

You can set up your credentials in several ways:

### Option 1: Environment Variables

Set the following environment variables:

```bash
export KAGGLE_USERNAME=your_username
export KAGGLE_KEY=your_api_key
```

### Option 2: .env File

Create a `.env` file in the backend directory with the following content:

```
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_api_key
```

## Running the Application with Kaggle Integration

### Option 1: Debug Server (Mock Data)

For testing without actual Kaggle credentials:

```bash
cd backend
./run_kaggle_debug_server.py
```

This starts a server with mock implementations of the Kaggle API endpoints, allowing you to test the integration without real credentials.

Available mock datasets:
- heptapod/titanic
- brendan45774/test-file
- azeembootwala/titanic
- austinreese/craigslist-carstrucks-data
- camnugent/california-traffic-collision-data-from-switrs
- aaronschlegel/tesla-stock-data

### Option 2: Real Server (Actual Kaggle API)

To use the actual Kaggle API:

```bash
cd backend
./run_server_with_kaggle.py
```

This starts the server with the consolidated Kaggle API implementation, allowing you to access real Kaggle datasets.

## Using Downloaded Datasets

Once you've downloaded a dataset:

1. It will appear in your local datasets list
2. You can view its details including file names, sizes, and paths
3. The dataset will be available for use in your data processing workflows
4. You can find the downloaded files in the `backend/data/kaggle` directory

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Make sure your Kaggle API credentials are correctly set up
2. **Download Failures**: Check your internet connection and Kaggle API status
3. **Missing Files**: Verify that the data directory exists and is writable

### Finding Downloaded Files

Downloaded Kaggle files are stored in:

```
backend/data/kaggle/<owner>/<dataset>/
```

For example, a dataset with reference `username/dataset-name` would be stored in:

```
backend/data/kaggle/username/dataset-name/
```

## Additional Resources

- [Kaggle API Documentation](https://github.com/Kaggle/kaggle-api)
- [Kaggle Datasets](https://www.kaggle.com/datasets)
- [Kaggle API Python Client](https://github.com/Kaggle/kaggle-api#api-credentials) 
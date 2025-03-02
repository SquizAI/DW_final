# Kaggle Integration

This project includes comprehensive integration with the Kaggle API, allowing you to search, download, and manage Kaggle datasets directly from the application.

## Features

- **Search Kaggle Datasets**: Search for datasets on Kaggle using keywords
- **Download Datasets**: Download datasets directly from Kaggle
- **Manage Local Datasets**: View, manage, and delete downloaded datasets
- **Track Downloads**: Monitor download progress and status

## Getting Started

### Prerequisites

1. **Kaggle Account**: You need a Kaggle account to use the Kaggle API
2. **Kaggle API Credentials**: Generate API credentials from your Kaggle account settings

### Setting Up Kaggle Credentials

1. Go to your Kaggle account settings: https://www.kaggle.com/settings
2. Scroll down to the "API" section
3. Click "Create New API Token" to download a `kaggle.json` file
4. This file contains your API credentials in the format:
   ```json
   {"username":"your_username","key":"your_api_key"}
   ```

### Configuring the Application

There are several ways to set up your Kaggle credentials:

#### Option 1: Environment Variables

Set the following environment variables:

```bash
export KAGGLE_USERNAME=your_username
export KAGGLE_KEY=your_api_key
```

#### Option 2: .env File

Create a `.env` file in the backend directory with the following content:

```
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_api_key
```

#### Option 3: Manual Configuration

The application will guide you through the setup process if credentials are not found.

## Running the Application

### Debug Server (Mock Data)

For testing without actual Kaggle credentials:

```bash
cd backend
python run_kaggle_debug_server.py
```

This starts a server with mock implementations of the Kaggle API endpoints.

### Real Server (Actual Kaggle API)

To use the actual Kaggle API:

```bash
cd backend
python run_server_with_kaggle.py
```

This starts the server with the consolidated Kaggle API implementation.

## Using the Kaggle Integration

### Kaggle Manager

Navigate to the Kaggle Manager page at `/kaggle/manager` to:

1. **Search for Datasets**: Use the search tab to find datasets on Kaggle
2. **Download Datasets**: Download datasets directly to your local machine
3. **Manage Local Datasets**: View, explore, and delete downloaded datasets
4. **Track Downloads**: Monitor the status of your downloads

### Kaggle API Test

For developers, there's a test page at `/test/kaggle` that allows you to:

1. Test all Kaggle API endpoints
2. Verify that the integration is working correctly
3. Debug any issues with the Kaggle API

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Make sure your Kaggle API credentials are correctly set up
2. **Download Failures**: Check your internet connection and Kaggle API status
3. **Missing Files**: Verify that the data directory exists and is writable

### Finding Downloaded Files

To locate downloaded Kaggle files:

```bash
cd backend
python find_kaggle_files.py
```

This script will search for and list all downloaded Kaggle files.

## Architecture

The Kaggle API integration is organized in a modular structure under `/backend/app/kaggle/`:

```
app/kaggle/
├── __init__.py           # Exports all components
├── README.md             # Documentation for Kaggle integration
├── auth.py               # Authentication with Kaggle API
├── discovery.py          # Dataset discovery operations
├── retrieval.py          # Dataset retrieval operations
├── manipulation.py       # Dataset manipulation operations
├── competitions.py       # Competition integration
├── users.py              # User management
├── local.py              # Local dataset management
├── router.py             # FastAPI router for all Kaggle endpoints
└── debug.py              # Debug module for testing without Kaggle API
```

This modular approach provides:
- Clear separation of concerns
- Easy maintenance and extension
- Comprehensive documentation
- Testable components 
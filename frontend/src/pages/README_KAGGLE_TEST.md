# Kaggle API Integration Test Page

This page provides a comprehensive testing interface for the Kaggle API integration. It allows you to test all the Kaggle API endpoints and verify that they are working correctly.

## Features

- Test all Kaggle API endpoints from a single interface
- View detailed test results with response data
- Run individual tests or all tests at once
- Customize search queries and dataset references
- View test status with visual indicators (pass/fail)

## Available Tests

The following tests are available:

1. **Health Check**: Tests the API health endpoint
2. **Kaggle Auth Status**: Tests the Kaggle authentication status endpoint
3. **Kaggle Search**: Tests the Kaggle dataset search endpoint
4. **Kaggle Trending**: Tests the Kaggle trending datasets endpoint
5. **Kaggle Download**: Tests the Kaggle dataset download endpoint
6. **Kaggle Download Status**: Tests the Kaggle download status endpoint
7. **Kaggle All Download Statuses**: Tests the endpoint for all download statuses
8. **Kaggle Dataset Tags**: Tests the Kaggle dataset tags endpoint
9. **Kaggle Local Datasets**: Tests the Kaggle local datasets endpoint

## How to Use

1. Navigate to `/test/kaggle` in your browser
2. Use the search query input to customize your search
3. Use the dataset reference input to specify a dataset to download
4. Click the "Test" button next to each endpoint to run an individual test
5. Click the "Run All Tests" button to run all tests at once
6. View the test results in the "Test Results" tab
7. View the available endpoints in the "Endpoints" tab

## Test Results

The test results are displayed in an accordion panel, with each test showing:

- Test name
- Test status (PASS/FAIL/PENDING)
- Response data (for successful tests)
- Error message (for failed tests)

## Implementation Details

The test page is implemented using:

- React with TypeScript
- Mantine UI components
- Axios for API requests
- React Router for navigation

## Endpoints Tested

The following endpoints are tested:

- `GET /api/health`: Health check endpoint
- `GET /api/kaggle/auth/status`: Kaggle authentication status
- `GET /api/kaggle/datasets/search`: Search for datasets
- `GET /api/kaggle/datasets/trending`: Get trending datasets
- `POST /api/kaggle/datasets/download`: Download a dataset
- `GET /api/kaggle/datasets/download/status/{dataset_ref}`: Get download status
- `GET /api/kaggle/datasets/download/status`: Get all download statuses
- `GET /api/kaggle/datasets/tags`: Get dataset tags
- `GET /api/kaggle/local/datasets`: Get local datasets 
# Dataset Organization System

This document describes the dataset organization system, which provides a structured way to organize, categorize, and manage datasets.

## Overview

The dataset organization system consists of three main components:

1. **Bucket Manager**: Organizes datasets into buckets (categories or groups)
2. **Dataset Indexer**: Indexes and manages dataset metadata
3. **AI Cataloger**: Uses AI to automatically categorize and tag datasets

## Features

### Bucket System

- **Create Buckets**: Create custom buckets to organize datasets
- **Add Datasets to Buckets**: Add datasets to one or more buckets
- **Remove Datasets from Buckets**: Remove datasets from buckets
- **View Datasets in Buckets**: View all datasets in a specific bucket
- **Default Buckets**: System comes with default buckets for common categories

### Dataset Indexing

- **Index Datasets**: Extract metadata from dataset files
- **Search Datasets**: Search for datasets by name, description, or tags
- **Filter Datasets**: Filter datasets by tags or source
- **Organize Datasets**: Move datasets to appropriate directories
- **Update Dataset Metadata**: Update dataset information

### AI Cataloging

- **Automatic Categorization**: Automatically categorize datasets based on content
- **Tag Generation**: Generate relevant tags for datasets
- **Description Generation**: Generate descriptions for datasets
- **Search by Content**: Search for datasets based on content, not just metadata
- **Category-based Organization**: Organize datasets into predefined categories

## Directory Structure

The dataset organization system creates the following directory structure:

```
data/
├── buckets/           # Bucket system data
│   └── index.json     # Bucket index file
├── catalog/           # AI catalog data
│   └── ai_catalog.json # AI catalog file
├── datasets/          # Organized datasets
│   ├── general/       # General datasets
│   ├── kaggle/        # Kaggle datasets
│   ├── machine_learning/ # Machine learning datasets
│   ├── visualization/ # Visualization datasets
│   └── analysis/      # Analysis datasets
├── index/             # Dataset index data
│   └── datasets.json  # Dataset index file
└── kaggle/            # Kaggle datasets (original location)
```

## API Endpoints

The dataset organization system provides the following API endpoints:

### Bucket Management

- `GET /api/datasets/organization/buckets`: Get all buckets
- `GET /api/datasets/organization/buckets/{bucket_id}`: Get a specific bucket
- `POST /api/datasets/organization/buckets`: Create a new bucket
- `PUT /api/datasets/organization/buckets/{bucket_id}`: Update a bucket
- `DELETE /api/datasets/organization/buckets/{bucket_id}`: Delete a bucket
- `POST /api/datasets/organization/buckets/{bucket_id}/datasets`: Add a dataset to a bucket
- `DELETE /api/datasets/organization/buckets/{bucket_id}/datasets/{dataset_id}`: Remove a dataset from a bucket
- `GET /api/datasets/organization/buckets/{bucket_id}/datasets`: Get all datasets in a bucket

### Dataset Indexing

- `GET /api/datasets/organization/index`: Get all indexed datasets
- `GET /api/datasets/organization/index/{dataset_id}`: Get a specific indexed dataset
- `POST /api/datasets/organization/index`: Index a dataset file
- `PUT /api/datasets/organization/index/{dataset_id}`: Update an indexed dataset
- `DELETE /api/datasets/organization/index/{dataset_id}`: Delete an indexed dataset
- `GET /api/datasets/organization/index/search`: Search for indexed datasets
- `GET /api/datasets/organization/index/tag/{tag}`: Get all datasets with a specific tag
- `GET /api/datasets/organization/index/source/{source}`: Get all datasets from a specific source
- `POST /api/datasets/organization/index/organize`: Organize a dataset by moving it to a target directory
- `POST /api/datasets/organization/index/scan`: Scan a directory for datasets and index them

### AI Cataloging

- `GET /api/datasets/organization/catalog`: Get the AI catalog
- `GET /api/datasets/organization/catalog/{dataset_id}`: Get catalog information for a dataset
- `POST /api/datasets/organization/catalog/{dataset_id}`: Catalog a dataset using AI
- `PUT /api/datasets/organization/catalog/{dataset_id}`: Update catalog information for a dataset
- `DELETE /api/datasets/organization/catalog/{dataset_id}`: Remove a dataset from the catalog
- `GET /api/datasets/organization/catalog/category/{category}`: Get all datasets in a category
- `GET /api/datasets/organization/catalog/tag/{tag}`: Get all datasets with a specific tag
- `GET /api/datasets/organization/catalog/search`: Search for datasets in the catalog
- `POST /api/datasets/organization/catalog/all`: Catalog all indexed datasets

### Initialization

- `POST /api/datasets/organization/initialize`: Initialize the dataset organization system

## Usage

### Initializing the System

To initialize the dataset organization system, run:

```bash
python initialize_dataset_organization.py
```

Or use the API endpoint:

```bash
curl -X POST "http://localhost:8000/api/datasets/organization/initialize" \
  -H "Content-Type: application/json" \
  -d '{"scan_dirs": ["/path/to/datasets"], "use_ai": true}'
```

### Creating a Bucket

```bash
curl -X POST "http://localhost:8000/api/datasets/organization/buckets" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Bucket", "description": "My custom bucket"}'
```

### Adding a Dataset to a Bucket

```bash
curl -X POST "http://localhost:8000/api/datasets/organization/buckets/my_bucket/datasets" \
  -H "Content-Type: application/json" \
  -d '{"dataset_id": "dataset-uuid"}'
```

### Cataloging a Dataset with AI

```bash
curl -X POST "http://localhost:8000/api/datasets/organization/catalog/dataset-uuid" \
  -H "Content-Type: application/json" \
  -d '{"file_path": "/path/to/dataset.csv"}'
```

## AI Cataloging Categories

The AI cataloger categorizes datasets into the following categories:

- **Tabular Data**: Structured data in rows and columns
- **Time Series**: Data points indexed in time order
- **Text Data**: Natural language text data
- **Image Data**: Image or visual data
- **Geospatial Data**: Data with geographic coordinates
- **Financial Data**: Financial or economic data
- **Scientific Data**: Scientific or research data
- **Healthcare Data**: Medical or healthcare data
- **Other**: Other types of data

## Implementation Details

### Bucket Manager

The bucket manager stores bucket information in a JSON file at `data/buckets/index.json`. Each bucket has:

- **ID**: Unique identifier for the bucket
- **Name**: Display name for the bucket
- **Description**: Description of the bucket
- **Datasets**: List of dataset IDs in the bucket
- **Created At**: Timestamp when the bucket was created
- **Updated At**: Timestamp when the bucket was last updated

### Dataset Indexer

The dataset indexer stores dataset information in a JSON file at `data/index/datasets.json`. Each dataset entry has:

- **ID**: Unique identifier for the dataset
- **Name**: Name of the dataset
- **Description**: Description of the dataset
- **File Path**: Path to the dataset file
- **Tags**: List of tags for the dataset
- **Source**: Source of the dataset (e.g., "upload", "kaggle")
- **Metadata**: Additional metadata about the dataset
- **Indexed At**: Timestamp when the dataset was indexed
- **Updated At**: Timestamp when the dataset was last updated

### AI Cataloger

The AI cataloger uses OpenAI's API to analyze dataset content and generate:

- **Description**: A concise description of the dataset
- **Tags**: Relevant tags for the dataset
- **Category**: The most appropriate category for the dataset

This information is stored in a JSON file at `data/catalog/ai_catalog.json`. 
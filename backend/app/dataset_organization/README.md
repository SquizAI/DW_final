# Dataset Organization System

This module provides a comprehensive system for organizing, categorizing, and managing datasets within the application.

## Components

### 1. Bucket Manager (`bucket_manager.py`)

The Bucket Manager allows you to organize datasets into buckets (categories or groups). It provides functionality for:

- Creating and managing buckets
- Adding datasets to buckets
- Removing datasets from buckets
- Retrieving datasets in a bucket
- Finding buckets containing a specific dataset

### 2. Dataset Indexer (`dataset_indexer.py`)

The Dataset Indexer maintains an index of all datasets in the system. It provides functionality for:

- Indexing datasets and extracting metadata
- Searching for datasets by name, description, or tags
- Filtering datasets by tags or source
- Organizing datasets into appropriate directories

### 3. AI Cataloger (`ai_cataloger.py`)

The AI Cataloger uses OpenAI's API to automatically categorize and tag datasets based on their content. It provides functionality for:

- Analyzing dataset content and structure
- Generating descriptions, tags, and categories
- Organizing datasets into predefined categories
- Searching for datasets based on content

## Usage

### Initialization

To initialize the dataset organization system, run:

```bash
python initialize_dataset_organization.py
```

This will:
1. Create the necessary directory structure
2. Index existing datasets from the database
3. Organize datasets into buckets
4. Catalog datasets using AI (if enabled)

### API Endpoints

The dataset organization system is accessible through the following API endpoints:

- `/api/datasets/organization/buckets`: Manage buckets
- `/api/datasets/organization/index`: Access the dataset index
- `/api/datasets/organization/catalog`: Access the AI catalog

### Frontend Integration

The dataset organization system is integrated into the frontend through the Dataset Organization page, which provides a user-friendly interface for:

- Creating and managing buckets
- Viewing and searching datasets
- Organizing datasets into buckets
- Updating dataset catalog information

## Directory Structure

The dataset organization system creates the following directory structure:

```
data/
├── buckets/           # Bucket system data
│   └── index.json     # Bucket index file
├── catalog/           # AI catalog data
│   └── ai_catalog.json # AI catalog file
├── index/             # Dataset index data
│   └── datasets.json  # Dataset index file
```

## Configuration

The dataset organization system can be configured through environment variables:

- `DATA_DIR`: Base directory for data storage
- `OPENAI_API_KEY`: API key for OpenAI (required for AI cataloging)

## Dependencies

- `openai`: For AI-powered cataloging
- `pandas`: For dataset analysis
- `sqlalchemy`: For database integration 
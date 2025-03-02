import os
from typing import List, Dict, Optional
import kaggle
from kaggle.api.kaggle_api_extended import KaggleApi
from fastapi import HTTPException
import pandas as pd

def setup_kaggle_api() -> KaggleApi:
    """Initialize and authenticate Kaggle API."""
    try:
        api = KaggleApi()
        api.authenticate()
        return api
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to authenticate Kaggle API: {str(e)}")

def convert_size_to_mb(size_str: str) -> float:
    """Convert Kaggle dataset size string to MB."""
    try:
        size = float(size_str.split()[0])
        unit = size_str.split()[1].lower()
        
        if unit == 'kb':
            return size / 1024
        elif unit == 'mb':
            return size
        elif unit == 'gb':
            return size * 1024
        else:
            return 0
    except:
        return 0

def search_kaggle_datasets(query: str, max_results: int = 10) -> Dict:
    """Search Kaggle datasets and return metadata."""
    try:
        api = KaggleApi()
        api.authenticate()
        
        datasets = api.dataset_list(search=query, sort_by='hottest')
        results = []
        
        for dataset in datasets[:max_results]:
            try:
                results.append({
                    "ref": f"{dataset.owner_username}/{dataset.slug}",
                    "title": dataset.title,
                    "size": str(dataset.size),
                    "last_updated": str(dataset.lastUpdated),
                    "download_count": dataset.downloadCount,
                    "description": dataset.description,
                    "url": f"https://www.kaggle.com/datasets/{dataset.owner_username}/{dataset.slug}"
                })
            except Exception as e:
                print(f"Error processing dataset {dataset.ref}: {str(e)}")
                continue
        
        return {
            "success": True,
            "datasets": results
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def download_kaggle_dataset(dataset_ref: str) -> Dict:
    """Download a Kaggle dataset and return its contents."""
    try:
        api = KaggleApi()
        api.authenticate()
        
        # Create data directory if it doesn't exist
        data_dir = os.path.join("data", "kaggle")
        os.makedirs(data_dir, exist_ok=True)
        
        # Download dataset
        try:
            api.dataset_download_files(
                dataset=dataset_ref,
                path=data_dir,
                unzip=True,
                quiet=False
            )
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to download dataset: {str(e)}"
            }
        
        # Find CSV files in the downloaded content
        csv_files = []
        for root, _, files in os.walk(data_dir):
            for file in files:
                if file.endswith('.csv'):
                    csv_files.append(os.path.join(root, file))
        
        if not csv_files:
            return {
                "success": False,
                "error": "No CSV files found in dataset"
            }
        
        # Read the first CSV file
        try:
            df = pd.read_csv(csv_files[0])
            
            # Get basic dataset info
            info = {
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": df.columns.tolist(),
                "memory_usage_mb": df.memory_usage(deep=True).sum() / (1024 * 1024),
                "file_size_mb": os.path.getsize(csv_files[0]) / (1024 * 1024)
            }
            
            return {
                "success": True,
                "message": f"Dataset downloaded successfully",
                "info": info,
                "filename": os.path.basename(csv_files[0]),
                "path": csv_files[0]
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to read dataset: {str(e)}"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Kaggle API error: {str(e)}"
        } 
"""
Kaggle Debug Module

This module provides mock implementations for testing Kaggle API integration
without requiring actual Kaggle credentials or API access.
"""

import logging
from fastapi import FastAPI, Body, Path
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from typing import List, Optional, Dict, Any

logger = logging.getLogger(__name__)

# Sample Kaggle datasets
SAMPLE_DATASETS = [
    {
        "ref": "heptapod/titanic",
        "title": "Titanic",
        "size": "11KB",
        "lastUpdated": "2017-05-16 08:14:22",
        "downloadCount": 102385,
        "description": "Suited for binary logistic regression",
        "url": "https://www.kaggle.com/datasets/heptapod/titanic"
    },
    {
        "ref": "brendan45774/test-file",
        "title": "Titanic dataset",
        "size": "11KB",
        "lastUpdated": "2021-12-02 16:11:42",
        "downloadCount": 157994,
        "description": "Gender submission and test file merged",
        "url": "https://www.kaggle.com/datasets/brendan45774/test-file"
    },
    {
        "ref": "azeembootwala/titanic",
        "title": "Titanic",
        "size": "12KB",
        "lastUpdated": "2017-06-05 12:14:37",
        "downloadCount": 22938,
        "description": "For Binary logistic regression",
        "url": "https://www.kaggle.com/datasets/azeembootwala/titanic"
    },
    {
        "ref": "austinreese/craigslist-carstrucks-data",
        "title": "Vehicles from Craigslist",
        "size": "1.4GB",
        "lastUpdated": "2021-12-14 08:23:44",
        "downloadCount": 87654,
        "description": "Used vehicles listings from Craigslist",
        "url": "https://www.kaggle.com/datasets/austinreese/craigslist-carstrucks-data"
    },
    {
        "ref": "camnugent/california-traffic-collision-data-from-switrs",
        "title": "California Traffic Collision Data",
        "size": "258MB",
        "lastUpdated": "2020-09-04 15:32:11",
        "downloadCount": 45678,
        "description": "Traffic collision data from California Highway Patrol",
        "url": "https://www.kaggle.com/datasets/camnugent/california-traffic-collision-data-from-switrs"
    },
    {
        "ref": "aaronschlegel/tesla-stock-data",
        "title": "Tesla Stock Data",
        "size": "125KB",
        "lastUpdated": "2022-01-15 10:45:22",
        "downloadCount": 34567,
        "description": "Historical stock data for Tesla Motors",
        "url": "https://www.kaggle.com/datasets/aaronschlegel/tesla-stock-data"
    }
]

# Create the FastAPI app
app = FastAPI(
    title="Debug Kaggle API Server",
    description="A simple server for debugging Kaggle API integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

# Kaggle search endpoint
@app.get("/api/kaggle/search")
async def search_datasets(query: str = ""):
    """Search for datasets on Kaggle"""
    logger.info(f"Received search request with query: {query}")
    
    # Filter datasets based on query if provided
    if query:
        filtered_datasets = [
            dataset for dataset in SAMPLE_DATASETS
            if query.lower() in dataset["title"].lower() or 
               query.lower() in dataset["description"].lower()
        ]
        logger.info(f"Filtered to {len(filtered_datasets)} datasets matching query: {query}")
        return filtered_datasets
    
    # Return all sample datasets
    logger.info(f"Returning all {len(SAMPLE_DATASETS)} sample datasets")
    return SAMPLE_DATASETS

# Alternative path for search
@app.get("/kaggle/search")
async def search_datasets_alt(query: str = ""):
    """Search for datasets on Kaggle (alternative path)"""
    logger.info(f"Received search request with query: {query} (alternative path)")
    return await search_datasets(query)

# Kaggle download endpoint
@app.post("/api/kaggle/download")
async def download_dataset(dataset_ref: str = Body(..., embed=True)):
    """Download a dataset from Kaggle"""
    logger.info(f"Received download request for dataset: {dataset_ref}")
    
    # Parse owner and dataset from the reference
    parts = dataset_ref.split('/')
    if len(parts) != 2:
        logger.error(f"Invalid dataset reference: {dataset_ref}")
        return {
            "success": False,
            "message": "Invalid dataset reference. Format should be 'owner/dataset'"
        }
    
    owner, dataset = parts
    
    # Create a more visible path in the current directory
    base_dir = os.path.abspath(os.path.join(os.getcwd(), "data"))
    download_path = os.path.join(base_dir, "kaggle", owner, dataset)
    
    # Create directory if it doesn't exist
    os.makedirs(download_path, exist_ok=True)
    
    # Create multiple mock files based on the dataset
    files = []
    
    # Create a mock CSV file
    csv_file_path = os.path.join(download_path, f"{dataset}.csv")
    with open(csv_file_path, "w") as f:
        if "titanic" in dataset.lower():
            f.write("PassengerId,Survived,Pclass,Name,Sex,Age,SibSp,Parch,Ticket,Fare,Cabin,Embarked\n")
            f.write("1,0,3,\"Braund, Mr. Owen Harris\",male,22,1,0,A/5 21171,7.25,,S\n")
            f.write("2,1,1,\"Cumings, Mrs. John Bradley (Florence Briggs Thayer)\",female,38,1,0,PC 17599,71.2833,C85,C\n")
            f.write("3,1,3,\"Heikkinen, Miss. Laina\",female,26,0,0,STON/O2. 3101282,7.925,,S\n")
        elif "car" in dataset.lower() or "vehicle" in dataset.lower():
            f.write("id,make,model,year,price,mileage,color,transmission\n")
            f.write("1,Toyota,Camry,2018,25000,35000,Silver,Automatic\n")
            f.write("2,Honda,Civic,2019,22000,28000,Black,Automatic\n")
            f.write("3,Ford,Mustang,2017,32000,40000,Red,Manual\n")
        else:
            f.write("id,value,category,date\n")
            f.write("1,100,A,2023-01-01\n")
            f.write("2,200,B,2023-01-02\n")
            f.write("3,300,C,2023-01-03\n")
    
    files.append({
        "name": f"{dataset}.csv",
        "path": csv_file_path,
        "size": os.path.getsize(csv_file_path)
    })
    
    # Create a mock README file
    readme_path = os.path.join(download_path, "README.md")
    with open(readme_path, "w") as f:
        f.write(f"# {dataset.capitalize()} Dataset\n\n")
        f.write(f"This dataset was created by {owner} and downloaded from Kaggle.\n\n")
        f.write("## Files\n\n")
        f.write(f"- {dataset}.csv: Main data file\n")
        f.write("- README.md: This file\n\n")
        f.write("## Description\n\n")
        f.write("This is a mock dataset created for testing purposes.\n")
    
    files.append({
        "name": "README.md",
        "path": readme_path,
        "size": os.path.getsize(readme_path)
    })
    
    # Log the file creation
    for file in files:
        logger.info(f"Created mock file: {file['path']} ({file['size']} bytes)")
    
    # Return success response with detailed information
    return {
        "success": True,
        "message": f"Dataset downloaded successfully to {download_path}",
        "dataset_id": f"kaggle_{owner}_{dataset}",
        "name": f"Kaggle: {dataset}",
        "file_path": download_path,
        "files": files,
        "absolute_path": os.path.abspath(download_path),
        "total_size": sum(file["size"] for file in files),
        "file_count": len(files)
    }

# Alternative path for download
@app.post("/kaggle/download")
async def download_dataset_alt(dataset_ref: str = Body(..., embed=True)):
    """Download a dataset from Kaggle (alternative path)"""
    logger.info(f"Received download request for dataset: {dataset_ref} (alternative path)")
    return await download_dataset(dataset_ref)

# Kaggle credentials endpoint
@app.post("/api/kaggle/credentials")
async def save_kaggle_credentials(username: str = Body(..., embed=True), api_key: str = Body(..., embed=True)):
    """Save Kaggle API credentials"""
    logger.info(f"Received credentials for user: {username}")
    return {"message": "Kaggle credentials saved successfully (mock)"}

# Alternative path for credentials
@app.post("/kaggle/credentials")
async def save_kaggle_credentials_alt(username: str = Body(..., embed=True), api_key: str = Body(..., embed=True)):
    """Save Kaggle API credentials (alternative path)"""
    logger.info(f"Received credentials for user: {username} (alternative path)")
    return await save_kaggle_credentials(username, api_key)

# Kaggle auth status endpoint
@app.get("/api/kaggle/auth/status")
async def check_auth_status():
    """Check Kaggle API authentication status"""
    logger.info("Received auth status request")
    return {
        "authenticated": True,
        "error": None
    }

# Alternative path for auth status
@app.get("/kaggle/auth/status")
async def check_auth_status_alt():
    """Check Kaggle API authentication status (alternative path)"""
    logger.info("Received auth status request (alternative path)")
    return await check_auth_status()

# Add endpoints for the test page
@app.get("/api/kaggle/datasets/search")
async def datasets_search(query: str = ""):
    """Search for datasets on Kaggle"""
    logger.info(f"Received datasets search request with query: {query}")
    return await search_datasets(query)

@app.get("/api/kaggle/datasets/trending")
async def trending_datasets():
    """Get trending datasets on Kaggle"""
    logger.info("Received trending datasets request")
    return SAMPLE_DATASETS[:2]  # Return first 2 datasets as trending

@app.post("/api/kaggle/datasets/download")
async def datasets_download(dataset_ref: str = Body(..., embed=True)):
    """Download a dataset from Kaggle"""
    logger.info(f"Received datasets download request for dataset: {dataset_ref}")
    return await download_dataset(dataset_ref)

# Fix for the download status endpoint to handle path parameters correctly
@app.get("/api/kaggle/datasets/download/status/{dataset_ref:path}")
async def download_status(dataset_ref: str):
    """Get download status for a dataset"""
    logger.info(f"Received download status request for dataset: {dataset_ref}")
    
    # Parse owner and dataset from the reference
    parts = dataset_ref.split('/')
    if len(parts) != 2:
        logger.error(f"Invalid dataset reference: {dataset_ref}")
        return {
            "success": False,
            "message": "Invalid dataset reference. Format should be 'owner/dataset'"
        }
    
    owner, dataset = parts
    
    # Get the download path
    base_dir = os.path.abspath(os.path.join(os.getcwd(), "data"))
    download_path = os.path.join(base_dir, "kaggle", owner, dataset)
    
    # Check if the dataset has been downloaded
    if not os.path.exists(download_path):
        return {
            "status": "not_found",
            "message": f"Dataset {dataset_ref} has not been downloaded yet",
            "dataset_ref": dataset_ref
        }
    
    # Get the list of files
    files = []
    total_size = 0
    
    for file_name in os.listdir(download_path):
        file_path = os.path.join(download_path, file_name)
        if os.path.isfile(file_path):
            size = os.path.getsize(file_path)
            files.append({
                "name": file_name,
                "path": file_path,
                "size": size,
                "last_modified": os.path.getmtime(file_path)
            })
            total_size += size
    
    # Return the status
    return {
        "status": "completed",
        "progress": 100,
        "dataset_ref": dataset_ref,
        "files": files,
        "file_count": len(files),
        "total_size": total_size,
        "download_path": download_path,
        "absolute_path": os.path.abspath(download_path),
        "download_time": "2023-02-25T12:00:00Z"  # Mock download time
    }

@app.get("/api/kaggle/datasets/download/status")
async def all_download_statuses():
    """Get all download statuses"""
    logger.info("Received all download statuses request")
    
    # Get the base directory
    base_dir = os.path.abspath(os.path.join(os.getcwd(), "data", "kaggle"))
    
    # Check if the directory exists
    if not os.path.exists(base_dir):
        return []
    
    # Get all downloaded datasets
    statuses = []
    
    # Walk through the directory structure
    for owner_dir in os.listdir(base_dir):
        owner_path = os.path.join(base_dir, owner_dir)
        if os.path.isdir(owner_path):
            for dataset_dir in os.listdir(owner_path):
                dataset_path = os.path.join(owner_path, dataset_dir)
                if os.path.isdir(dataset_path):
                    # Get the list of files
                    files = []
                    total_size = 0
                    
                    for file_name in os.listdir(dataset_path):
                        file_path = os.path.join(dataset_path, file_name)
                        if os.path.isfile(file_path):
                            size = os.path.getsize(file_path)
                            files.append({
                                "name": file_name,
                                "path": file_path,
                                "size": size,
                                "last_modified": os.path.getmtime(file_path)
                            })
                            total_size += size
                    
                    # Add the status
                    statuses.append({
                        "status": "completed",
                        "progress": 100,
                        "dataset_ref": f"{owner_dir}/{dataset_dir}",
                        "files": files,
                        "file_count": len(files),
                        "total_size": total_size,
                        "download_path": dataset_path,
                        "absolute_path": os.path.abspath(dataset_path),
                        "download_time": "2023-02-25T12:00:00Z"  # Mock download time
                    })
    
    return statuses

@app.get("/api/kaggle/datasets/tags")
async def dataset_tags():
    """Get dataset tags"""
    logger.info("Received dataset tags request")
    return [
        {"id": "1", "name": "tabular", "description": "Tabular data", "count": 1000},
        {"id": "2", "name": "csv", "description": "CSV files", "count": 800},
        {"id": "3", "name": "titanic", "description": "Titanic dataset", "count": 50},
        {"id": "4", "name": "cars", "description": "Car and vehicle datasets", "count": 250},
        {"id": "5", "name": "traffic", "description": "Traffic and transportation data", "count": 150}
    ]

@app.get("/api/kaggle/local/datasets")
async def local_datasets():
    """Get local datasets"""
    logger.info("Received local datasets request")
    return [
        {
            "ref": "heptapod/titanic",
            "title": "Titanic",
            "local_path": "data/kaggle/heptapod/titanic",
            "download_date": "2023-01-01T12:00:00Z",
            "size_bytes": 1024,
            "file_count": 1,
            "files": [
                {"name": "dataset.csv", "size": 1024}
            ]
        },
        {
            "ref": "austinreese/craigslist-carstrucks-data",
            "title": "Vehicles from Craigslist",
            "local_path": "data/kaggle/austinreese/craigslist-carstrucks-data",
            "download_date": "2023-02-15T09:30:00Z",
            "size_bytes": 1458000000,
            "file_count": 2,
            "files": [
                {"name": "vehicles.csv", "size": 1450000000},
                {"name": "README.md", "size": 8000000}
            ]
        }
    ]

def run_debug_server(host: str = "0.0.0.0", port: int = 8000):
    """Run the debug server
    
    Args:
        host: Host to bind the server to
        port: Port to bind the server to
    """
    # Create data directory
    os.makedirs("data/kaggle", exist_ok=True)
    
    # Run the server
    logger.info(f"Starting Kaggle debug server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Run the server
    run_debug_server() 
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
import logging
import uvicorn
from pydantic import BaseModel
from kaggle.api.kaggle_api_extended import KaggleApi

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Kaggle API Server",
    description="A simple server for Kaggle API integration",
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

# Kaggle dataset model
class KaggleDataset(BaseModel):
    ref: str
    title: str
    size: str
    lastUpdated: str
    downloadCount: int
    description: str
    url: str

# Set up Kaggle credentials
def setup_kaggle_credentials():
    """Set up Kaggle credentials"""
    # Set Kaggle credentials
    username = os.getenv('KAGGLE_USERNAME', 'mattysquarzoni')
    key = os.getenv('KAGGLE_KEY', 'b4a1d95f67a5d2f482d1353f230a7009')
    
    logger.info(f"Using Kaggle credentials: username={username}, key={key[:4]}...")
    
    # Set environment variables
    os.environ['KAGGLE_USERNAME'] = username
    os.environ['KAGGLE_KEY'] = key
    
    # Create kaggle directory if it doesn't exist
    kaggle_dir = os.path.join(os.path.expanduser("~"), ".kaggle")
    os.makedirs(kaggle_dir, exist_ok=True)
    logger.info(f"Kaggle directory: {kaggle_dir}")
    
    # Save credentials to kaggle.json
    kaggle_json_path = os.path.join(kaggle_dir, "kaggle.json")
    with open(kaggle_json_path, "w") as f:
        f.write(f'{{"username":"{username}","key":"{key}"}}')
    
    # Set permissions to 600 (required by Kaggle)
    os.chmod(kaggle_json_path, 0o600)
    logger.info(f"Saved credentials to {kaggle_json_path}")
    
    return username, key

# Set up Kaggle credentials on startup
@app.on_event("startup")
async def startup_event():
    """Set up Kaggle credentials on startup"""
    setup_kaggle_credentials()

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

# Kaggle search endpoint
@app.get("/api/kaggle/search", response_model=List[KaggleDataset])
async def search_datasets(query: str):
    """Search for datasets on Kaggle"""
    try:
        logger.info(f"Starting Kaggle search for query: {query}")
        
        # Initialize Kaggle API
        logger.info("Initializing Kaggle API...")
        api = KaggleApi()
        api.authenticate()
        logger.info("Kaggle API authenticated successfully")
        
        # Search for datasets
        logger.info(f"Searching for datasets with query: {query}")
        try:
            datasets = api.dataset_list(search=query)
            logger.info(f"Raw API response: Found {len(datasets)} datasets")
            
            # Log the first dataset if available
            if datasets and len(datasets) > 0:
                first_dataset = datasets[0]
                logger.info(f"First dataset: {first_dataset.ref} - {first_dataset.title}")
        except Exception as e:
            logger.error(f"Error during dataset_list call: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            raise
        
        # Convert to response format
        results = []
        for dataset in datasets:
            try:
                logger.info(f"Processing dataset: {dataset.ref}")
                
                # Create KaggleDataset object with the correct attributes
                dataset_obj = KaggleDataset(
                    ref=f"{dataset.ownerRef}/{dataset.ref.split('/')[-1] if '/' in dataset.ref else dataset.ref}",
                    title=dataset.title,
                    size=dataset.size,  # Size is already a string like "11KB"
                    lastUpdated=dataset.lastUpdated,
                    downloadCount=dataset.downloadCount,
                    description=dataset.subtitle if hasattr(dataset, 'subtitle') else "",
                    url=dataset.url
                )
                results.append(dataset_obj)
                logger.info(f"Successfully processed dataset: {dataset.ref}")
            except Exception as e:
                logger.error(f"Error processing dataset {dataset.ref}: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
                continue
        
        logger.info(f"Found {len(results)} datasets for query: {query}")
        return results[:10]  # Return top 10 results
        
    except Exception as e:
        logger.error(f"Failed to search Kaggle datasets: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search Kaggle datasets: {str(e)}"
        )

# Kaggle download endpoint
@app.post("/api/kaggle/download")
async def download_dataset(dataset_ref: str):
    """Download a dataset from Kaggle"""
    try:
        logger.info(f"Starting download for dataset: {dataset_ref}")
        
        # Initialize Kaggle API
        api = KaggleApi()
        api.authenticate()
        
        # Parse owner and dataset from the reference
        parts = dataset_ref.split('/')
        if len(parts) != 2:
            raise HTTPException(
                status_code=400,
                detail="Invalid dataset reference. Format should be 'owner/dataset'"
            )
        
        owner, dataset = parts
        download_path = os.path.join("data", "kaggle", owner, dataset)
        
        # Create directory if it doesn't exist
        os.makedirs(download_path, exist_ok=True)
        
        # Download the dataset
        api.dataset_download_files(
            dataset_ref,
            path=download_path,
            unzip=True
        )
        
        # Find CSV files in the downloaded dataset
        csv_files = []
        for root, _, files in os.walk(download_path):
            for file in files:
                if file.endswith('.csv'):
                    csv_files.append(os.path.join(root, file))
        
        if not csv_files:
            raise HTTPException(
                status_code=404,
                detail="No CSV files found in the downloaded dataset"
            )
        
        # Use the first CSV file as the dataset
        file_path = csv_files[0]
        
        return {
            "message": "Dataset downloaded successfully",
            "dataset_id": f"kaggle_{owner}_{dataset}",
            "name": f"Kaggle: {dataset}",
            "file_path": file_path
        }
        
    except Exception as e:
        logger.error(f"Failed to download dataset: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download dataset: {str(e)}"
        )

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "standalone_kaggle_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    ) 
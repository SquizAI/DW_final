@router.get("/search", response_model=List[KaggleDataset])
async def search_datasets(query: str):
    """Search for datasets on Kaggle"""
    try:
        logger.info(f"Starting Kaggle search for query: {query}")
        
        # Get Kaggle credentials from environment
        username = os.getenv('KAGGLE_USERNAME')
        key = os.getenv('KAGGLE_KEY')
        
        logger.info(f"Kaggle credentials: username={username is not None}, key={key is not None}")
        
        if not username or not key:
            logger.error("Kaggle credentials not found in environment variables")
            raise HTTPException(
                status_code=500,
                detail="Kaggle credentials not found. Please set KAGGLE_USERNAME and KAGGLE_KEY environment variables."
            )
        
        logger.info(f"Using Kaggle credentials: username={username}, key={key[:4]}...")
        
        # Set Kaggle credentials in environment
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
            raise
        
        # Convert to response format
        results = []
        for dataset in datasets:
            try:
                logger.info(f"Processing dataset: {dataset.ref}")
                results.append(KaggleDataset(
                    ref=f"{dataset.owner}/{dataset.slug}",
                    title=dataset.title,
                    size=f"{dataset.size / 1024 / 1024:.1f}MB",
                    lastUpdated=dataset.lastUpdated,
                    downloadCount=dataset.downloadCount,
                    description=dataset.description,
                    url=dataset.url
                ))
            except Exception as e:
                logger.error(f"Error processing dataset {dataset.ref}: {str(e)}")
                continue
        
        logger.info(f"Found {len(results)} datasets for query: {query}")
        return results[:10]  # Return top 10 results
        
    except Exception as e:
        logger.error(f"Failed to search Kaggle datasets: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search Kaggle datasets: {str(e)}"
        ) 
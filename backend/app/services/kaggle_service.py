from typing import List, Dict, Any, Optional
import kaggle
from kaggle.api.kaggle_api_extended import KaggleApi
from app.config import settings
import os
import logging
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

class KaggleService:
    def __init__(self):
        self.api = KaggleApi()
        self.api.authenticate()
        self._ensure_kaggle_dir()

    def _ensure_kaggle_dir(self):
        """Ensure Kaggle directory exists with proper credentials"""
        kaggle_dir = Path.home() / '.kaggle'
        kaggle_dir.mkdir(exist_ok=True)
        
        # Create kaggle.json if it doesn't exist
        kaggle_json = kaggle_dir / 'kaggle.json'
        if not kaggle_json.exists() and settings.KAGGLE_USERNAME and settings.KAGGLE_KEY:
            kaggle_json.write_text(
                f'{{"username":"{settings.KAGGLE_USERNAME}","key":"{settings.KAGGLE_KEY}"}}'
            )
            kaggle_json.chmod(0o600)

    def _safe_get_attr(self, obj: Any, attr: str, default: Any = None) -> Any:
        """Safely get an attribute from an object"""
        try:
            return getattr(obj, attr, default)
        except:
            return default

    def _format_datetime(self, dt: Any) -> str:
        """Format datetime object as ISO string"""
        if isinstance(dt, datetime):
            return dt.isoformat()
        return str(dt)

    async def search_datasets(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """Search for datasets on Kaggle"""
        try:
            # Get list of datasets matching the query
            datasets = []
            for dataset in self.api.dataset_list(search=query):
                if len(datasets) >= max_results:
                    break
                datasets.append(dataset)

            results = []
            for dataset in datasets:
                # Extract dataset information safely
                try:
                    # Get basic attributes safely
                    ref = self._safe_get_attr(dataset, 'ref', '')
                    title = self._safe_get_attr(dataset, 'title', ref.split('/')[-1] if ref else 'Unknown')
                    size_bytes = self._safe_get_attr(dataset, 'size', 0)
                    size = self._format_size(size_bytes) if isinstance(size_bytes, (int, float)) else 'Unknown'
                    
                    # Format datetime as string
                    last_updated = self._format_datetime(self._safe_get_attr(dataset, 'lastUpdated', datetime.now()))
                    
                    results.append({
                        "ref": ref,
                        "title": title,
                        "size": size,
                        "lastUpdated": last_updated,
                        "downloadCount": int(self._safe_get_attr(dataset, 'downloadCount', 0)),
                        "voteCount": int(self._safe_get_attr(dataset, 'voteCount', 0)),
                        "usabilityRating": float(self._safe_get_attr(dataset, 'usabilityRating', 0.0)),
                        "description": str(self._safe_get_attr(dataset, 'description', ''))
                    })
                except Exception as e:
                    logger.warning(f"Error processing dataset: {str(e)}")
                    continue
            
            return results
        except Exception as e:
            logger.error(f"Error searching Kaggle datasets: {str(e)}")
            raise

    async def download_dataset(self, dataset_ref: str, path: Optional[str] = None) -> Dict[str, Any]:
        """Download a dataset from Kaggle"""
        try:
            download_path = path or os.path.join(settings.DATA_DIR, 'kaggle_downloads')
            os.makedirs(download_path, exist_ok=True)
            
            # Download the dataset
            self.api.dataset_download_files(
                dataset=dataset_ref,
                path=download_path,
                unzip=True,
                quiet=False  # Show progress
            )
            
            # List downloaded files
            downloaded_files = []
            total_size = 0
            
            for file_path in Path(download_path).glob('*'):
                if file_path.is_file():
                    try:
                        stats = file_path.stat()
                        total_size += stats.st_size
                        downloaded_files.append({
                            "name": file_path.name,
                            "size": self._format_size(stats.st_size),
                            "path": str(file_path.relative_to(settings.DATA_DIR))
                        })
                    except Exception as e:
                        logger.warning(f"Error processing file {file_path}: {str(e)}")
                        continue
            
            return {
                "ref": dataset_ref,
                "title": dataset_ref.split('/')[-1],
                "files": downloaded_files,
                "downloadPath": str(Path(download_path).relative_to(settings.DATA_DIR)),
                "totalSize": self._format_size(total_size),
                "fileCount": len(downloaded_files)
            }
        except Exception as e:
            logger.error(f"Error downloading Kaggle dataset: {str(e)}")
            raise

    def _format_size(self, size_bytes: int) -> str:
        """Format size in bytes to human readable format"""
        try:
            size_bytes = int(size_bytes)
            for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
                if size_bytes < 1024:
                    return f"{size_bytes:.1f} {unit}"
                size_bytes /= 1024
            return f"{size_bytes:.1f} PB"
        except:
            return "Unknown"

# Create a singleton instance
kaggle_service = KaggleService() 
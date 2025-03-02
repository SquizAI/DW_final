"""
AI Cataloger

This module provides AI-powered functionality for automatically categorizing and tagging datasets
based on their content, structure, and metadata.
"""

import os
import json
import logging
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import openai
from openai import OpenAI

logger = logging.getLogger(__name__)

class AICataloger:
    """AI-powered dataset cataloging and organization"""
    
    def __init__(self, data_dir: str = None, api_key: str = None):
        """Initialize the AI cataloger
        
        Args:
            data_dir: Base data directory
            api_key: OpenAI API key (defaults to environment variable)
        """
        self.data_dir = Path(data_dir or os.getenv('DATA_DIR', 'data'))
        self.catalog_dir = self.data_dir / "catalog"
        self.catalog_file = self.catalog_dir / "ai_catalog.json"
        
        # Create necessary directories
        self.catalog_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize OpenAI client
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            logger.warning("OpenAI API key not provided. AI cataloging will be limited.")
            self.client = None
        
        # Initialize catalog if it doesn't exist
        if not self.catalog_file.exists():
            self._initialize_catalog()
    
    def _initialize_catalog(self) -> None:
        """Initialize the AI catalog file"""
        catalog = {
            "datasets": {},
            "tags": {},
            "categories": {
                "tabular": {
                    "name": "Tabular Data",
                    "description": "Structured data in rows and columns",
                    "datasets": []
                },
                "time_series": {
                    "name": "Time Series",
                    "description": "Data points indexed in time order",
                    "datasets": []
                },
                "text": {
                    "name": "Text Data",
                    "description": "Natural language text data",
                    "datasets": []
                },
                "image": {
                    "name": "Image Data",
                    "description": "Image or visual data",
                    "datasets": []
                },
                "geospatial": {
                    "name": "Geospatial Data",
                    "description": "Data with geographic coordinates",
                    "datasets": []
                },
                "financial": {
                    "name": "Financial Data",
                    "description": "Financial or economic data",
                    "datasets": []
                },
                "scientific": {
                    "name": "Scientific Data",
                    "description": "Scientific or research data",
                    "datasets": []
                },
                "healthcare": {
                    "name": "Healthcare Data",
                    "description": "Medical or healthcare data",
                    "datasets": []
                },
                "other": {
                    "name": "Other",
                    "description": "Other types of data",
                    "datasets": []
                }
            },
            "last_updated": datetime.now().isoformat()
        }
        
        with open(self.catalog_file, 'w') as f:
            json.dump(catalog, f, indent=2)
        
        logger.info(f"Initialized AI catalog at {self.catalog_file}")
    
    def _load_catalog(self) -> Dict[str, Any]:
        """Load the AI catalog from file
        
        Returns:
            Dictionary containing catalog information
        """
        if not self.catalog_file.exists():
            self._initialize_catalog()
        
        with open(self.catalog_file, 'r') as f:
            return json.load(f)
    
    def _save_catalog(self, catalog: Dict[str, Any]) -> None:
        """Save the AI catalog to file
        
        Args:
            catalog: Dictionary containing catalog information
        """
        # Update last_updated timestamp
        catalog["last_updated"] = datetime.now().isoformat()
        
        with open(self.catalog_file, 'w') as f:
            json.dump(catalog, f, indent=2)
    
    def _analyze_dataset_structure(self, file_path: str) -> Dict[str, Any]:
        """Analyze the structure of a dataset file
        
        Args:
            file_path: Path to the dataset file
            
        Returns:
            Dictionary with structural information about the dataset
        """
        try:
            # Determine file type
            file_ext = Path(file_path).suffix.lower()
            
            if file_ext in ['.csv', '.tsv']:
                # Read CSV file
                df = pd.read_csv(file_path, nrows=1000)  # Read first 1000 rows for analysis
                return self._analyze_dataframe(df)
            
            elif file_ext in ['.xlsx', '.xls']:
                # Read Excel file
                df = pd.read_excel(file_path, nrows=1000)
                return self._analyze_dataframe(df)
            
            elif file_ext == '.json':
                # Read JSON file
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                # If it's a list of records, convert to DataFrame
                if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
                    df = pd.DataFrame(data[:1000])  # First 1000 records
                    return self._analyze_dataframe(df)
                else:
                    return {
                        "type": "json",
                        "structure": "nested",
                        "size": os.path.getsize(file_path),
                        "complexity": "high"
                    }
            
            else:
                # Unknown file type
                return {
                    "type": "unknown",
                    "file_extension": file_ext,
                    "size": os.path.getsize(file_path)
                }
        
        except Exception as e:
            logger.error(f"Error analyzing dataset structure: {str(e)}")
            return {
                "type": "error",
                "error": str(e),
                "file_extension": Path(file_path).suffix.lower(),
                "size": os.path.getsize(file_path)
            }
    
    def _analyze_dataframe(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze a pandas DataFrame
        
        Args:
            df: DataFrame to analyze
            
        Returns:
            Dictionary with analysis results
        """
        # Get basic information
        num_rows, num_cols = df.shape
        
        # Analyze column types
        column_types = {}
        numeric_cols = []
        categorical_cols = []
        datetime_cols = []
        text_cols = []
        
        for col in df.columns:
            dtype = df[col].dtype
            
            if pd.api.types.is_numeric_dtype(dtype):
                column_types[col] = "numeric"
                numeric_cols.append(col)
            
            elif pd.api.types.is_datetime64_dtype(dtype):
                column_types[col] = "datetime"
                datetime_cols.append(col)
            
            else:
                # Check if it's categorical or text
                unique_count = df[col].nunique()
                if unique_count < 20 or unique_count / len(df) < 0.1:
                    column_types[col] = "categorical"
                    categorical_cols.append(col)
                else:
                    column_types[col] = "text"
                    text_cols.append(col)
        
        # Check for time series data
        has_time_index = len(datetime_cols) > 0
        
        # Check for geospatial data
        geo_columns = [col for col in df.columns if col.lower() in [
            'latitude', 'lat', 'longitude', 'long', 'lng', 'lon',
            'geolocation', 'coordinates', 'location'
        ]]
        has_geo_data = len(geo_columns) > 0
        
        # Determine dataset type
        dataset_type = "tabular"
        if has_time_index:
            dataset_type = "time_series"
        elif has_geo_data:
            dataset_type = "geospatial"
        
        return {
            "type": dataset_type,
            "rows": num_rows,
            "columns": num_cols,
            "column_types": column_types,
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "datetime_columns": datetime_cols,
            "text_columns": text_cols,
            "has_time_index": has_time_index,
            "has_geo_data": has_geo_data
        }
    
    def _generate_ai_description(self, dataset_info: Dict[str, Any], sample_data: pd.DataFrame = None) -> Tuple[str, List[str], str]:
        """Generate an AI description, tags, and category for a dataset
        
        Args:
            dataset_info: Information about the dataset
            sample_data: Sample data from the dataset (optional)
            
        Returns:
            Tuple of (description, tags, category)
        """
        if not self.client:
            # Return default values if no OpenAI client
            return (
                "No AI-generated description available (API key not provided)",
                ["unclassified"],
                "other"
            )
        
        try:
            # Prepare prompt with dataset information
            prompt = f"""
            I have a dataset with the following characteristics:
            - Type: {dataset_info.get('type', 'unknown')}
            - Rows: {dataset_info.get('rows', 'unknown')}
            - Columns: {dataset_info.get('columns', 'unknown')}
            
            Column information:
            - Numeric columns: {', '.join(dataset_info.get('numeric_columns', []))}
            - Categorical columns: {', '.join(dataset_info.get('categorical_columns', []))}
            - Datetime columns: {', '.join(dataset_info.get('datetime_columns', []))}
            - Text columns: {', '.join(dataset_info.get('text_columns', []))}
            
            Additional information:
            - Has time index: {dataset_info.get('has_time_index', False)}
            - Has geospatial data: {dataset_info.get('has_geo_data', False)}
            """
            
            # Add sample data if available
            if sample_data is not None:
                prompt += f"\nHere's a sample of the data:\n{sample_data.head(5).to_string()}\n"
            
            prompt += """
            Based on this information, please provide:
            1. A concise description of what this dataset likely contains (2-3 sentences)
            2. A list of 3-5 relevant tags for this dataset (comma-separated)
            3. The most appropriate category from this list: tabular, time_series, text, image, geospatial, financial, scientific, healthcare, other
            
            Format your response as:
            Description: [description]
            Tags: [tag1, tag2, tag3]
            Category: [category]
            """
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a data scientist specializing in dataset analysis and categorization."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            # Parse response
            response_text = response.choices[0].message.content
            
            # Extract description, tags, and category
            description = ""
            tags = []
            category = "other"
            
            for line in response_text.split('\n'):
                if line.startswith("Description:"):
                    description = line.replace("Description:", "").strip()
                elif line.startswith("Tags:"):
                    tags_text = line.replace("Tags:", "").strip()
                    tags = [tag.strip() for tag in tags_text.split(',')]
                elif line.startswith("Category:"):
                    category = line.replace("Category:", "").strip().lower()
            
            # Validate category
            valid_categories = ["tabular", "time_series", "text", "image", "geospatial", "financial", "scientific", "healthcare", "other"]
            if category not in valid_categories:
                category = "other"
            
            return description, tags, category
        
        except Exception as e:
            logger.error(f"Error generating AI description: {str(e)}")
            return (
                f"Error generating description: {str(e)}",
                ["error"],
                "other"
            )
    
    def catalog_dataset(self, dataset_id: str, file_path: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Catalog a dataset using AI
        
        Args:
            dataset_id: ID of the dataset
            file_path: Path to the dataset file
            metadata: Additional metadata about the dataset (optional)
            
        Returns:
            Dictionary with catalog information
        """
        logger.info(f"Cataloging dataset: {dataset_id}")
        
        # Load catalog
        catalog = self._load_catalog()
        
        # Check if dataset is already cataloged
        if dataset_id in catalog["datasets"]:
            logger.info(f"Dataset {dataset_id} is already cataloged")
            return catalog["datasets"][dataset_id]
        
        # Analyze dataset structure
        structure = self._analyze_dataset_structure(file_path)
        
        # Get sample data for AI analysis
        sample_data = None
        try:
            file_ext = Path(file_path).suffix.lower()
            if file_ext in ['.csv', '.tsv']:
                sample_data = pd.read_csv(file_path, nrows=10)
            elif file_ext in ['.xlsx', '.xls']:
                sample_data = pd.read_excel(file_path, nrows=10)
        except Exception as e:
            logger.warning(f"Could not read sample data: {str(e)}")
        
        # Generate AI description, tags, and category
        description, tags, category = self._generate_ai_description(structure, sample_data)
        
        # Create catalog entry
        catalog_entry = {
            "id": dataset_id,
            "file_path": str(file_path),
            "structure": structure,
            "description": description,
            "tags": tags,
            "category": category,
            "cataloged_at": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        # Add to catalog
        catalog["datasets"][dataset_id] = catalog_entry
        
        # Add to category
        if category in catalog["categories"]:
            if dataset_id not in catalog["categories"][category]["datasets"]:
                catalog["categories"][category]["datasets"].append(dataset_id)
        
        # Add to tags
        for tag in tags:
            if tag not in catalog["tags"]:
                catalog["tags"][tag] = {
                    "name": tag,
                    "datasets": []
                }
            
            if dataset_id not in catalog["tags"][tag]["datasets"]:
                catalog["tags"][tag]["datasets"].append(dataset_id)
        
        # Save catalog
        self._save_catalog(catalog)
        
        logger.info(f"Cataloged dataset {dataset_id} as {category} with tags: {', '.join(tags)}")
        return catalog_entry
    
    def get_dataset_catalog(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        """Get catalog information for a dataset
        
        Args:
            dataset_id: ID of the dataset
            
        Returns:
            Catalog entry for the dataset, or None if not found
        """
        catalog = self._load_catalog()
        return catalog["datasets"].get(dataset_id)
    
    def get_datasets_by_category(self, category: str) -> List[str]:
        """Get all datasets in a category
        
        Args:
            category: Category to get datasets for
            
        Returns:
            List of dataset IDs in the category
        """
        catalog = self._load_catalog()
        if category in catalog["categories"]:
            return catalog["categories"][category]["datasets"]
        return []
    
    def get_datasets_by_tag(self, tag: str) -> List[str]:
        """Get all datasets with a specific tag
        
        Args:
            tag: Tag to get datasets for
            
        Returns:
            List of dataset IDs with the tag
        """
        catalog = self._load_catalog()
        if tag in catalog["tags"]:
            return catalog["tags"][tag]["datasets"]
        return []
    
    def search_datasets(self, query: str) -> List[Dict[str, Any]]:
        """Search for datasets in the catalog
        
        Args:
            query: Search query
            
        Returns:
            List of matching dataset catalog entries
        """
        catalog = self._load_catalog()
        results = []
        
        query = query.lower()
        
        for dataset_id, entry in catalog["datasets"].items():
            # Check if query matches dataset ID, description, or tags
            if (query in dataset_id.lower() or
                query in entry["description"].lower() or
                any(query in tag.lower() for tag in entry["tags"])):
                results.append(entry)
        
        return results
    
    def update_dataset_catalog(self, dataset_id: str, description: str = None, tags: List[str] = None, category: str = None) -> Optional[Dict[str, Any]]:
        """Update catalog information for a dataset
        
        Args:
            dataset_id: ID of the dataset
            description: New description (optional)
            tags: New tags (optional)
            category: New category (optional)
            
        Returns:
            Updated catalog entry, or None if dataset not found
        """
        catalog = self._load_catalog()
        
        if dataset_id not in catalog["datasets"]:
            logger.warning(f"Dataset {dataset_id} not found in catalog")
            return None
        
        entry = catalog["datasets"][dataset_id]
        
        # Update description if provided
        if description:
            entry["description"] = description
        
        # Update category if provided
        if category:
            old_category = entry["category"]
            
            # Remove from old category
            if old_category in catalog["categories"]:
                if dataset_id in catalog["categories"][old_category]["datasets"]:
                    catalog["categories"][old_category]["datasets"].remove(dataset_id)
            
            # Add to new category
            entry["category"] = category
            if category in catalog["categories"]:
                if dataset_id not in catalog["categories"][category]["datasets"]:
                    catalog["categories"][category]["datasets"].append(dataset_id)
        
        # Update tags if provided
        if tags:
            old_tags = entry["tags"]
            
            # Remove from old tags
            for tag in old_tags:
                if tag in catalog["tags"]:
                    if dataset_id in catalog["tags"][tag]["datasets"]:
                        catalog["tags"][tag]["datasets"].remove(dataset_id)
            
            # Add to new tags
            entry["tags"] = tags
            for tag in tags:
                if tag not in catalog["tags"]:
                    catalog["tags"][tag] = {
                        "name": tag,
                        "datasets": []
                    }
                
                if dataset_id not in catalog["tags"][tag]["datasets"]:
                    catalog["tags"][tag]["datasets"].append(dataset_id)
        
        # Save catalog
        self._save_catalog(catalog)
        
        logger.info(f"Updated catalog for dataset {dataset_id}")
        return entry
    
    def remove_dataset_from_catalog(self, dataset_id: str) -> bool:
        """Remove a dataset from the catalog
        
        Args:
            dataset_id: ID of the dataset to remove
            
        Returns:
            True if dataset was removed, False otherwise
        """
        catalog = self._load_catalog()
        
        if dataset_id not in catalog["datasets"]:
            logger.warning(f"Dataset {dataset_id} not found in catalog")
            return False
        
        entry = catalog["datasets"][dataset_id]
        
        # Remove from category
        category = entry["category"]
        if category in catalog["categories"]:
            if dataset_id in catalog["categories"][category]["datasets"]:
                catalog["categories"][category]["datasets"].remove(dataset_id)
        
        # Remove from tags
        for tag in entry["tags"]:
            if tag in catalog["tags"]:
                if dataset_id in catalog["tags"][tag]["datasets"]:
                    catalog["tags"][tag]["datasets"].remove(dataset_id)
        
        # Remove from datasets
        del catalog["datasets"][dataset_id]
        
        # Save catalog
        self._save_catalog(catalog)
        
        logger.info(f"Removed dataset {dataset_id} from catalog")
        return True
    
    def catalog_all_datasets(self, datasets: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Catalog all datasets
        
        Args:
            datasets: List of dataset objects with id and file_path
            
        Returns:
            Dictionary with results
        """
        results = {
            "total": len(datasets),
            "successful": 0,
            "failed": 0,
            "failures": []
        }
        
        for dataset in datasets:
            dataset_id = dataset["id"]
            file_path = dataset["file_path"]
            
            try:
                self.catalog_dataset(dataset_id, file_path, dataset.get("metadata"))
                results["successful"] += 1
            except Exception as e:
                logger.error(f"Error cataloging dataset {dataset_id}: {str(e)}")
                results["failed"] += 1
                results["failures"].append({
                    "dataset_id": dataset_id,
                    "error": str(e)
                })
        
        logger.info(f"Cataloged {results['successful']} datasets, {results['failed']} failed")
        return results 
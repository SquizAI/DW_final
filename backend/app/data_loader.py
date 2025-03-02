import pandas as pd
from typing import Dict, Any, List
import json
from pathlib import Path
import os

class DataLoader:
    def __init__(self):
        self.upload_dir = Path("uploads")
        self.upload_dir.mkdir(exist_ok=True)
        
        self.exports_dir = Path("exports")
        self.exports_dir.mkdir(exist_ok=True)
    
    async def save_uploaded_file(self, file, filename: str) -> str:
        """Save an uploaded file and return its path."""
        file_path = self.upload_dir / filename
        
        # Write file content
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        return str(file_path)
    
    def load_data(self, file_path: str) -> List[Dict[str, Any]]:
        """Load data from a file into a list of dictionaries."""
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Determine file type from extension
        file_type = file_path.suffix.lower()
        
        try:
            if file_type == '.csv':
                df = pd.read_csv(file_path)
            elif file_type == '.json':
                df = pd.read_json(file_path)
            elif file_type == '.parquet':
                df = pd.read_parquet(file_path)
            elif file_type in ['.xls', '.xlsx']:
                df = pd.read_excel(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
            # Convert DataFrame to list of dictionaries
            return df.to_dict('records')
        
        except Exception as e:
            raise ValueError(f"Error loading data from {file_path}: {str(e)}")
    
    def get_data_info(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get information about the loaded data."""
        df = pd.DataFrame(data)
        
        return {
            "columns": df.columns.tolist(),
            "row_count": len(df),
            "column_count": len(df.columns),
            "data_types": df.dtypes.astype(str).to_dict(),
            "missing_values": df.isnull().sum().to_dict(),
            "sample": df.head(5).to_dict('records')
        }
    
    def validate_data(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate the loaded data and return any issues."""
        df = pd.DataFrame(data)
        issues = []
        
        # Check for missing values
        missing = df.isnull().sum()
        for col, count in missing.items():
            if count > 0:
                issues.append({
                    "type": "missing_values",
                    "column": col,
                    "count": int(count),
                    "percentage": float(count / len(df) * 100)
                })
        
        # Check for duplicate rows
        duplicates = df.duplicated().sum()
        if duplicates > 0:
            issues.append({
                "type": "duplicate_rows",
                "count": int(duplicates),
                "percentage": float(duplicates / len(df) * 100)
            })
        
        # Check data types
        type_issues = []
        for col in df.columns:
            if df[col].dtype == 'object':
                # Check if column might be numeric
                try:
                    pd.to_numeric(df[col], errors='raise')
                    type_issues.append({
                        "column": col,
                        "current_type": "object",
                        "suggested_type": "numeric"
                    })
                except:
                    pass
                
                # Check if column might be datetime
                try:
                    pd.to_datetime(df[col], errors='raise')
                    type_issues.append({
                        "column": col,
                        "current_type": "object",
                        "suggested_type": "datetime"
                    })
                except:
                    pass
        
        if type_issues:
            issues.append({
                "type": "data_type_suggestions",
                "suggestions": type_issues
            })
        
        return {
            "valid": len(issues) == 0,
            "issues": issues
        }
    
    def clean_old_files(self, max_age_hours: int = 24):
        """Clean up old uploaded and exported files."""
        current_time = pd.Timestamp.now()
        
        # Clean uploads
        for file_path in self.upload_dir.glob("*"):
            if file_path.is_file():
                file_age = current_time - pd.Timestamp.fromtimestamp(file_path.stat().st_mtime)
                if file_age.total_seconds() > max_age_hours * 3600:
                    os.remove(file_path)
        
        # Clean exports
        for file_path in self.exports_dir.glob("*"):
            if file_path.is_file():
                file_age = current_time - pd.Timestamp.fromtimestamp(file_path.stat().st_mtime)
                if file_age.total_seconds() > max_age_hours * 3600:
                    os.remove(file_path)

data_loader = DataLoader() 
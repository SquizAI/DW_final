from typing import Optional, Dict, List
import pandas as pd
import numpy as np
from pathlib import Path
import json
import os

# Global state for active dataset
_active_dataset: Optional[pd.DataFrame] = None
_active_dataset_info: Optional[Dict] = None

def get_active_dataset() -> Optional[pd.DataFrame]:
    """Get the currently active dataset."""
    return _active_dataset

def get_active_dataset_info() -> Optional[Dict]:
    """Get information about the currently active dataset."""
    return _active_dataset_info

def set_active_dataset(data: pd.DataFrame, info: Dict) -> None:
    """Set the active dataset and its metadata."""
    global _active_dataset, _active_dataset_info
    _active_dataset = data
    _active_dataset_info = info

def clear_active_dataset() -> None:
    """Clear the active dataset."""
    global _active_dataset, _active_dataset_info
    _active_dataset = None
    _active_dataset_info = None

def load_dataset(file_path: str) -> tuple[pd.DataFrame, Dict]:
    """Load a dataset from a file and return the data and metadata."""
    file_path = Path(file_path)
    
    # Load data based on file extension
    if file_path.suffix == '.csv':
        data = pd.read_csv(file_path)
    elif file_path.suffix in ['.xls', '.xlsx']:
        data = pd.read_excel(file_path)
    elif file_path.suffix == '.json':
        data = pd.read_json(file_path)
    elif file_path.suffix == '.parquet':
        data = pd.read_parquet(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_path.suffix}")
    
    # Generate dataset info
    info = {
        'filename': file_path.name,
        'format': file_path.suffix[1:],
        'size': os.path.getsize(file_path),
        'rows': len(data),
        'columns': len(data.columns),
        'column_info': get_column_info(data),
        'memory_usage': data.memory_usage(deep=True).sum(),
        'missing_values': data.isnull().sum().to_dict(),
        'loaded_at': pd.Timestamp.now().isoformat(),
    }
    
    return data, info

def get_column_info(data: pd.DataFrame) -> List[Dict]:
    """Get detailed information about DataFrame columns."""
    columns = []
    
    for col in data.columns:
        col_data = data[col]
        col_type = str(col_data.dtype)
        
        info = {
            'name': col,
            'type': col_type,
            'missing': col_data.isnull().sum(),
            'unique': col_data.nunique(),
        }
        
        # Add numeric statistics
        if np.issubdtype(col_data.dtype, np.number):
            info.update({
                'mean': float(col_data.mean()) if not col_data.isnull().all() else None,
                'std': float(col_data.std()) if not col_data.isnull().all() else None,
                'min': float(col_data.min()) if not col_data.isnull().all() else None,
                'max': float(col_data.max()) if not col_data.isnull().all() else None,
                'skewness': float(col_data.skew()) if not col_data.isnull().all() else None,
                'kurtosis': float(col_data.kurtosis()) if not col_data.isnull().all() else None,
            })
        
        # Add categorical statistics
        elif col_data.dtype == 'object' or col_data.dtype.name == 'category':
            value_counts = col_data.value_counts()
            info.update({
                'top_values': [
                    {'value': str(value), 'count': int(count)}
                    for value, count in value_counts.head(5).items()
                ],
                'total_categories': len(value_counts),
            })
        
        # Add datetime statistics
        elif np.issubdtype(col_data.dtype, np.datetime64):
            info.update({
                'min': col_data.min().isoformat() if not col_data.isnull().all() else None,
                'max': col_data.max().isoformat() if not col_data.isnull().all() else None,
                'range_days': (col_data.max() - col_data.min()).days if not col_data.isnull().all() else None,
            })
        
        columns.append(info)
    
    return columns

def save_dataset(data: pd.DataFrame, file_path: str, format: str = None) -> None:
    """Save a dataset to a file."""
    if format is None:
        format = Path(file_path).suffix[1:]
    
    if format == 'csv':
        data.to_csv(file_path, index=False)
    elif format in ['xls', 'xlsx']:
        data.to_excel(file_path, index=False)
    elif format == 'json':
        data.to_json(file_path, orient='records')
    elif format == 'parquet':
        data.to_parquet(file_path, index=False)
    else:
        raise ValueError(f"Unsupported format: {format}")

def get_dataset_preview(data: pd.DataFrame, n_rows: int = 5) -> Dict:
    """Get a preview of the dataset including sample rows and column statistics."""
    return {
        'columns': get_column_info(data),
        'sample_rows': data.head(n_rows).to_dict(orient='records'),
        'total_rows': len(data),
        'memory_usage': data.memory_usage(deep=True).sum(),
    }

def filter_dataset(
    data: pd.DataFrame,
    conditions: List[Dict]
) -> pd.DataFrame:
    """Filter dataset based on conditions."""
    filtered_data = data.copy()
    
    for condition in conditions:
        column = condition['column']
        operator = condition['operator']
        value = condition['value']
        
        if operator == 'equals':
            filtered_data = filtered_data[filtered_data[column] == value]
        elif operator == 'not_equals':
            filtered_data = filtered_data[filtered_data[column] != value]
        elif operator == 'greater_than':
            filtered_data = filtered_data[filtered_data[column] > value]
        elif operator == 'less_than':
            filtered_data = filtered_data[filtered_data[column] < value]
        elif operator == 'contains':
            filtered_data = filtered_data[filtered_data[column].astype(str).str.contains(str(value))]
        elif operator == 'not_contains':
            filtered_data = filtered_data[~filtered_data[column].astype(str).str.contains(str(value))]
        elif operator == 'in':
            filtered_data = filtered_data[filtered_data[column].isin(value)]
        elif operator == 'not_in':
            filtered_data = filtered_data[~filtered_data[column].isin(value)]
        elif operator == 'is_null':
            filtered_data = filtered_data[filtered_data[column].isnull()]
        elif operator == 'is_not_null':
            filtered_data = filtered_data[~filtered_data[column].isnull()]
    
    return filtered_data

def sort_dataset(
    data: pd.DataFrame,
    columns: List[str],
    ascending: List[bool] = None
) -> pd.DataFrame:
    """Sort dataset by specified columns."""
    if ascending is None:
        ascending = [True] * len(columns)
    return data.sort_values(columns, ascending=ascending)

def get_column_statistics(data: pd.DataFrame, column: str) -> Dict:
    """Get detailed statistics for a specific column."""
    col_data = data[column]
    stats = {
        'name': column,
        'type': str(col_data.dtype),
        'missing': int(col_data.isnull().sum()),
        'unique': int(col_data.nunique()),
    }
    
    if np.issubdtype(col_data.dtype, np.number):
        # Numeric column statistics
        stats.update({
            'mean': float(col_data.mean()) if not col_data.isnull().all() else None,
            'median': float(col_data.median()) if not col_data.isnull().all() else None,
            'std': float(col_data.std()) if not col_data.isnull().all() else None,
            'min': float(col_data.min()) if not col_data.isnull().all() else None,
            'max': float(col_data.max()) if not col_data.isnull().all() else None,
            'q1': float(col_data.quantile(0.25)) if not col_data.isnull().all() else None,
            'q3': float(col_data.quantile(0.75)) if not col_data.isnull().all() else None,
            'skewness': float(col_data.skew()) if not col_data.isnull().all() else None,
            'kurtosis': float(col_data.kurtosis()) if not col_data.isnull().all() else None,
            'zero_count': int((col_data == 0).sum()),
            'negative_count': int((col_data < 0).sum()),
        })
        
        # Generate histogram data
        hist_data = np.histogram(col_data.dropna(), bins='auto')
        stats['distribution'] = {
            'bins': hist_data[1].tolist(),
            'counts': hist_data[0].tolist(),
        }
        
    elif col_data.dtype == 'object' or col_data.dtype.name == 'category':
        # Categorical column statistics
        value_counts = col_data.value_counts()
        total_count = value_counts.sum()
        
        stats.update({
            'total_categories': len(value_counts),
            'top_categories': [
                {
                    'value': str(value),
                    'count': int(count),
                    'percentage': float(count / total_count * 100)
                }
                for value, count in value_counts.head(10).items()
            ],
            'category_counts': {
                str(value): int(count)
                for value, count in value_counts.items()
            },
        })
        
    elif np.issubdtype(col_data.dtype, np.datetime64):
        # Datetime column statistics
        stats.update({
            'min': col_data.min().isoformat() if not col_data.isnull().all() else None,
            'max': col_data.max().isoformat() if not col_data.isnull().all() else None,
            'range_days': int((col_data.max() - col_data.min()).days) if not col_data.isnull().all() else None,
            'weekday_distribution': col_data.dt.dayofweek.value_counts().to_dict(),
            'month_distribution': col_data.dt.month.value_counts().to_dict(),
            'year_distribution': col_data.dt.year.value_counts().to_dict(),
        })
    
    return stats 
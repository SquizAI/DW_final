import streamlit as st
from datetime import datetime
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from components.ui_components import Card, DataGrid, StatusMessage, ModuleHeader, Section
import os
import kaggle
from kaggle.api.kaggle_api_extended import KaggleApi

def log_error(message: str):
    """Centralized error logging with a toast notification."""
    if 'error_log' not in st.session_state:
        st.session_state.error_log = []
    error_msg = f"{datetime.now().strftime('%H:%M:%S')} - {message}"
    st.session_state.error_log.append(error_msg)
    StatusMessage(message, "error")

def show_notification(message: str, type_: str = "info"):
    """Display popup notifications."""
    StatusMessage(message, type_)

def create_module_header(title: str, description: str):
    """Create a consistent modern header for all modules"""
    ModuleHeader(title, description)

def create_3d_scatter(df: pd.DataFrame, x_col: str, y_col: str, z_col: str, color_col: str = None):
    """Create an interactive 3D scatter plot"""
    fig = go.Figure(data=[go.Scatter3d(
        x=df[x_col],
        y=df[y_col],
        z=df[z_col],
        mode='markers',
        marker=dict(
            size=6,
            color=df[color_col] if color_col else None,
            colorscale='Viridis',
            opacity=0.8
        ),
        text=df.index if color_col is None else df[color_col],
        hoverinfo='text'
    )])
    
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        scene=dict(
            xaxis_title=x_col,
            yaxis_title=y_col,
            zaxis_title=z_col
        )
    )
    return fig

def create_correlation_heatmap(df: pd.DataFrame):
    """Create an interactive correlation heatmap"""
    corr = df.select_dtypes(include=[np.number]).corr()
    
    fig = go.Figure(data=go.Heatmap(
        z=corr,
        x=corr.columns,
        y=corr.columns,
        colorscale='RdBu',
        zmid=0
    ))
    
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        title="Feature Correlation Heatmap"
    )
    return fig

def create_animated_scatter(df: pd.DataFrame, x_col: str, y_col: str, color_col: str = None):
    """Create an animated scatter plot with transitions"""
    fig = px.scatter(
        df,
        x=x_col,
        y=y_col,
        color=color_col,
        color_continuous_scale='Viridis',
        template='plotly_dark'
    )
    
    fig.update_traces(
        marker=dict(size=10),
        selector=dict(mode='markers')
    )
    
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        xaxis=dict(gridcolor='rgba(128, 128, 128, 0.2)'),
        yaxis=dict(gridcolor='rgba(128, 128, 128, 0.2)'),
        showlegend=True,
        transition={'duration': 500}
    )
    
    return fig

def create_animated_line(df: pd.DataFrame, x_col: str, y_col: str):
    """Create an animated line plot with smooth transitions"""
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=df[x_col],
        y=df[y_col],
        mode='lines+markers',
        line=dict(width=3, color='#3498DB'),
        marker=dict(size=8, symbol='circle')
    ))
    
    fig.update_layout(
        template='plotly_dark',
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        xaxis=dict(gridcolor='rgba(128, 128, 128, 0.2)'),
        yaxis=dict(gridcolor='rgba(128, 128, 128, 0.2)'),
        showlegend=False,
        transition={'duration': 500}
    )
    
    return fig

def create_pca_visualization(df: pd.DataFrame):
    """Create PCA visualization for dimensionality reduction"""
    # Select numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) < 3:
        return None, "Not enough numeric columns for PCA visualization"
    
    # Standardize the features
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df[numeric_cols])
    
    # Apply PCA
    pca = PCA(n_components=3)
    pca_result = pca.fit_transform(scaled_data)
    
    # Create DataFrame with PCA results
    pca_df = pd.DataFrame(
        data=pca_result,
        columns=['PC1', 'PC2', 'PC3']
    )
    
    # Create 3D scatter plot
    fig = go.Figure(data=[go.Scatter3d(
        x=pca_df['PC1'],
        y=pca_df['PC2'],
        z=pca_df['PC3'],
        mode='markers',
        marker=dict(
            size=6,
            colorscale='Viridis',
            opacity=0.8
        )
    )])
    
    # Update layout
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        scene=dict(
            xaxis_title="First Principal Component",
            yaxis_title="Second Principal Component",
            zaxis_title="Third Principal Component"
        ),
        title="PCA 3D Visualization"
    )
    
    # Calculate explained variance
    explained_variance = pca.explained_variance_ratio_
    
    return fig, explained_variance

def analyze_dataset(df: pd.DataFrame) -> str:
    """Generate an AI-powered analysis of the dataset"""
    analysis = []
    
    # Basic dataset information
    analysis.append(f"Dataset Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    
    # Data types analysis
    dtypes = df.dtypes.value_counts()
    analysis.append("\nColumn Data Types:")
    for dtype, count in dtypes.items():
        analysis.append(f"- {dtype}: {count} columns")
    
    # Missing values analysis
    missing = df.isnull().sum()
    if missing.any():
        analysis.append("\nMissing Values:")
        for col, count in missing[missing > 0].items():
            percentage = (count / len(df)) * 100
            analysis.append(f"- {col}: {count} missing values ({percentage:.2f}%)")
    
    # Numeric columns analysis
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        analysis.append("\nNumeric Columns Statistics:")
        for col in numeric_cols:
            stats = df[col].describe()
            analysis.append(f"\n{col}:")
            analysis.append(f"- Range: {stats['min']:.2f} to {stats['max']:.2f}")
            analysis.append(f"- Mean: {stats['mean']:.2f}")
            analysis.append(f"- Std Dev: {stats['std']:.2f}")
    
    # Categorical columns analysis
    cat_cols = df.select_dtypes(include=['object', 'category']).columns
    if len(cat_cols) > 0:
        analysis.append("\nCategorical Columns Analysis:")
        for col in cat_cols:
            unique_count = df[col].nunique()
            top_values = df[col].value_counts().head(3)
            analysis.append(f"\n{col}:")
            analysis.append(f"- Unique values: {unique_count}")
            analysis.append("- Top 3 values:")
            for val, count in top_values.items():
                percentage = (count / len(df)) * 100
                analysis.append(f"  * {val}: {count} ({percentage:.2f}%)")
    
    return "\n".join(analysis)

def review_data(df: pd.DataFrame) -> None:
    """Generate a modern data review using the component system."""
    n_rows, n_cols = df.shape
    dtypes = df.dtypes
    missing_data = df.isnull().sum()
    
    # Dataset Overview
    overview_data = [
        {
            "Metric": "Rows",
            "Value": f"{n_rows:,}"
        },
        {
            "Metric": "Columns",
            "Value": str(n_cols)
        },
        {
            "Metric": "Memory Usage",
            "Value": f"{df.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB"
        }
    ]
    
    Section("Dataset Overview")
    DataGrid(overview_data, ["Metric", "Value"])
    
    # Column Details
    Section("Column Details")
    column_data = []
    for col in df.columns:
        dtype = dtypes[col]
        missing = missing_data[col]
        missing_pct = (missing / n_rows) * 100
        unique_count = df[col].nunique()
        sample_values = ', '.join(map(str, df[col].dropna().sample(min(3, len(df))).values))
        
        column_data.append({
            "Column": col,
            "Type": str(dtype),
            "Unique Values": f"{unique_count:,}",
            "Missing": f"{missing:,} ({missing_pct:.1f}%)",
            "Sample Values": sample_values
        })
    
    DataGrid(column_data, ["Column", "Type", "Unique Values", "Missing", "Sample Values"])

def log_activity(activity_type: str, message: str):
    """Log an activity to the session state activity log."""
    if 'activity_log' not in st.session_state:
        st.session_state.activity_log = []
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    st.session_state.activity_log.append({
        'timestamp': timestamp,
        'type': activity_type,
        'message': message
    })

def setup_kaggle_api():
    """Set up and verify Kaggle API credentials."""
    try:
        api = KaggleApi()
        api.authenticate()
        return True, api
    except Exception as e:
        log_error(f"Kaggle API setup failed: {str(e)}")
        return False, None

def convert_size_to_mb(size_str: str) -> float:
    """Convert a size string (e.g., '7KB', '8MB', '1GB') to megabytes."""
    try:
        # Remove any whitespace and convert to uppercase
        size_str = size_str.strip().upper()
        
        # Extract the numeric value and unit
        if size_str.endswith('KB'):
            return float(size_str[:-2]) / 1024  # Convert KB to MB
        elif size_str.endswith('MB'):
            return float(size_str[:-2])  # Already in MB
        elif size_str.endswith('GB'):
            return float(size_str[:-2]) * 1024  # Convert GB to MB
        else:
            return float(size_str)  # Assume MB if no unit
    except (ValueError, AttributeError):
        return 0.0  # Return 0 if conversion fails

def search_kaggle_datasets(query: str, max_results: int = 5):
    """Search Kaggle datasets with proper error handling and metadata extraction."""
    try:
        api = KaggleApi()
        api.authenticate()
        
        datasets = api.dataset_list(search=query, sort_by='hottest', max_size=None, file_type='csv')
        results = []
        
        for dataset in datasets[:max_results]:
            try:
                # Convert size to MB and format it
                size_mb = convert_size_to_mb(str(getattr(dataset, 'size', '0')))
                
                # Safely extract dataset information
                dataset_info = {
                    'ref': f"{dataset.ref}",
                    'title': getattr(dataset, 'title', 'Untitled'),
                    'size': f"{size_mb:.1f} MB",
                    'last_updated': str(getattr(dataset, 'lastUpdated', 'Unknown')),
                    'download_count': getattr(dataset, 'downloadCount', 0)
                }
                results.append(dataset_info)
            except Exception as e:
                log_error(f"Error processing dataset {dataset.ref}: {str(e)}")
                continue
        
        return {"success": True, "datasets": results}
    except Exception as e:
        log_error(f"Kaggle search failed: {str(e)}")
        return {"success": False, "error": f"Search failed: {str(e)}"}

def download_kaggle_dataset(dataset_ref: str, target_dir: str = "data"):
    """
    Download a dataset from Kaggle with improved error handling.
    dataset_ref should be in format 'owner/dataset-name'
    """
    try:
        # Create target directory if it doesn't exist
        os.makedirs(target_dir, exist_ok=True)
        
        # Initialize and authenticate Kaggle API
        api = KaggleApi()
        api.authenticate()
        
        # Download the dataset
        api.dataset_download_files(
            dataset_ref,
            path=target_dir,
            unzip=True,
            quiet=False  # Show progress
        )
        
        # Verify downloaded files
        csv_files = [f for f in os.listdir(target_dir) if f.endswith('.csv')]
        if not csv_files:
            raise Exception("No CSV files found in the downloaded dataset")
        
        # Load the first CSV file
        df = pd.read_csv(os.path.join(target_dir, csv_files[0]))
        
        # Log successful download
        log_activity("Kaggle", f"Successfully downloaded dataset: {dataset_ref}")
        
        return {
            "success": True,
            "message": f"Dataset downloaded to {target_dir}",
            "dataframe": df,
            "files": csv_files
        }
    except Exception as e:
        error_msg = f"Failed to download dataset {dataset_ref}: {str(e)}"
        log_error(error_msg)
        return {
            "success": False,
            "error": error_msg
        }
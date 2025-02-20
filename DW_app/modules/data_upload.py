import streamlit as st
import pandas as pd
import numpy as np
from components.ui_components import ModuleHeader, Section, Card, StatusMessage, DataGrid
from utils import review_data, log_activity, search_kaggle_datasets, download_kaggle_dataset
import os
from typing import List, Dict

def format_dataset_overview(df: pd.DataFrame) -> List[Dict[str, str]]:
    """Format dataset overview for display in DataGrid."""
    try:
        # Calculate memory usage
        memory_usage = df.memory_usage(deep=True).sum() / (1024 * 1024)  # Convert to MB
        
        # Count data types
        numeric_cols = len(df.select_dtypes(include=['int64', 'float64']).columns)
        categorical_cols = len(df.select_dtypes(include=['object', 'category', 'bool']).columns)
        
        # Count missing values
        total_missing = df.isnull().sum().sum()
        
        return [
            {
                "Metric": "Number of Records",
                "Value": f"{df.shape[0]:,}"
            },
            {
                "Metric": "Number of Features",
                "Value": f"{df.shape[1]:,}"
            },
            {
                "Metric": "Missing Values",
                "Value": f"{total_missing:,}"
            },
            {
                "Metric": "Numeric Features",
                "Value": str(numeric_cols)
            },
            {
                "Metric": "Categorical Features",
                "Value": str(categorical_cols)
            },
            {
                "Metric": "Memory Usage",
                "Value": f"{memory_usage:.2f} MB"
            }
        ]
    except Exception as e:
        st.error(f"Error formatting dataset overview: {str(e)}")
        return []

def format_column_details(df: pd.DataFrame) -> List[Dict[str, str]]:
    """Format column details for display in DataGrid."""
    try:
        details = []
        for col in df.columns:
            try:
                # Get column statistics
                dtype = df[col].dtype
                unique_count = df[col].nunique()
                missing = df[col].isnull().sum()
                missing_pct = (missing / len(df)) * 100
                
                # Get sample values with proper formatting
                try:
                    if pd.api.types.is_numeric_dtype(dtype):
                        if pd.api.types.is_integer_dtype(dtype):
                            sample_values = df[col].dropna().sample(min(3, len(df))).apply(lambda x: f"{int(x):,}")
                        else:
                            sample_values = df[col].dropna().sample(min(3, len(df))).apply(lambda x: f"{float(x):,.2f}")
                    elif pd.api.types.is_bool_dtype(dtype):
                        sample_values = df[col].dropna().sample(min(3, len(df))).astype(str)
                    else:
                        sample_values = df[col].dropna().sample(min(3, len(df))).astype(str)
                    
                    sample_str = ", ".join(sample_values)
                except:
                    sample_str = "N/A"
                
                details.append({
                    "Column": col,
                    "Type": str(dtype),
                    "Unique Values": f"{unique_count:,}",
                    "Missing": f"{missing:,} ({missing_pct:.1f}%)",
                    "Sample Values": sample_str
                })
            except Exception as col_error:
                st.warning(f"Error processing column {col}: {str(col_error)}")
                continue
        
        return details
    except Exception as e:
        st.error(f"Error formatting column details: {str(e)}")
        return []

def data_upload_page():
    ModuleHeader(
        "Data Upload & Import",
        "Upload your dataset or connect to external data sources"
    )
    
    # Multiple ways to load data
    st.markdown("### Choose Your Data Source")
    
    tabs = st.tabs(["📤 File Upload", "🔍 Kaggle Datasets", "🔌 Database Connect", "🌐 URL Import", "📊 Sample Data"])
    
    # File Upload Tab
    with tabs[0]:
        Section("Upload Your Files")
        
        # Multi-file uploader
        uploaded_files = st.file_uploader(
            "Drop your data files here",
            type=["csv", "xlsx", "json", "parquet", "sql", "txt"],
            accept_multiple_files=True,
            help="Support for CSV, Excel, JSON, Parquet, SQL, and text files"
        )
        
        if uploaded_files:
            for file in uploaded_files:
                try:
                    # Detect file type and read accordingly
                    if file.name.endswith('.csv'):
                        df = pd.read_csv(file)
                    elif file.name.endswith('.xlsx'):
                        df = pd.read_excel(file)
                    elif file.name.endswith('.json'):
                        df = pd.read_json(file)
                    elif file.name.endswith('.parquet'):
                        df = pd.read_parquet(file)
                    else:
                        # Try to intelligently detect the format
                        df = pd.read_csv(file, sep=None, engine='python')
                    
                    st.session_state.df = df.copy()
                    st.session_state.cleaned_df = df.copy()
                    st.session_state.current_dataset = file.name
                    
                    # Dataset Overview
                    Section("Dataset Overview")
                    overview_data = format_dataset_overview(df)
                    DataGrid(["Metric", "Value"], overview_data)
                    
                    # Show data preview
                    Section("Data Preview")
                    st.dataframe(df.head(), use_container_width=True)
                    
                    # Column Details
                    Section("Column Details")
                    column_data = format_column_details(df)
                    DataGrid(
                        ["Column", "Type", "Unique Values", "Missing", "Sample Values"],
                        column_data
                    )
                    
                    log_activity("Data Upload", f"Successfully loaded {file.name}")
                    StatusMessage(f"✅ {file.name} loaded successfully!", "success")
                    
                except Exception as e:
                    StatusMessage(f"Error reading {file.name}: {str(e)}", "error")
    
    # Kaggle Datasets Tab
    with tabs[1]:
        Section("Search Kaggle Datasets")
        
        search_query = st.text_input(
            "Search for datasets",
            placeholder="Example: titanic, housing prices, covid-19",
            help="Enter keywords to search for datasets on Kaggle"
        )
        
        col1, col2 = st.columns([3, 1])
        with col1:
            max_results = st.slider("Maximum number of results", 5, 20, 10)
        
        if st.button("🔍 Search Datasets", use_container_width=True):
            if search_query:
                with st.spinner("Searching Kaggle datasets..."):
                    results = search_kaggle_datasets(search_query, max_results)
                    
                    if not results.get("success", False):
                        StatusMessage(results.get("error", "Search failed"), "error")
                    else:
                        datasets = results["datasets"]
                        for dataset in datasets:
                            with st.expander(f"📊 {dataset['title']}"):
                                st.markdown(f"""
                                    - **Size:** {dataset['size']}
                                    - **Last Updated:** {dataset['last_updated']}
                                    - **Downloads:** {dataset['download_count']:,}
                                """)
                                
                                if st.button("Download Dataset", key=f"download_{dataset['ref']}"):
                                    with st.spinner("Downloading dataset..."):
                                        download_result = download_kaggle_dataset(dataset['ref'])
                                        if not download_result.get("success", False):
                                            StatusMessage(download_result.get("error", "Download failed"), "error")
                                        else:
                                            StatusMessage(download_result["message"], "success")
                                            if "dataframe" in download_result:
                                                df = download_result["dataframe"]
                                                st.session_state.df = df.copy()
                                                st.session_state.cleaned_df = df.copy()
                                                st.session_state.current_dataset = dataset['title']
                                                
                                                # Show dataset overview
                                                Section("Dataset Overview")
                                                overview_data = format_dataset_overview(df)
                                                DataGrid(["Metric", "Value"], overview_data)
                                                
                                                # Show data preview
                                                Section("Data Preview")
                                                st.dataframe(df.head(), use_container_width=True)
                                                
                                                # Show column details
                                                Section("Column Details")
                                                column_data = format_column_details(df)
                                                DataGrid(
                                                    ["Column", "Type", "Unique Values", "Missing", "Sample Values"],
                                                    column_data
                                                )
            else:
                StatusMessage("Please enter a search query", "warning")
    
    # Database Connection Tab
    with tabs[2]:
        Section("Connect to Database")
        db_type = st.selectbox(
            "Select Database Type",
            ["PostgreSQL", "MySQL", "SQLite", "MongoDB", "BigQuery"]
        )
        
        if db_type in ["PostgreSQL", "MySQL"]:
            col1, col2 = st.columns(2)
            with col1:
                host = st.text_input("Host")
                database = st.text_input("Database")
            with col2:
                username = st.text_input("Username")
                password = st.text_input("Password", type="password")
            
            if st.button("Connect to Database"):
                StatusMessage("Database connection feature coming soon!", "info")
    
    # URL Import Tab
    with tabs[3]:
        Section("Import from URL")
        url = st.text_input("Enter Data URL", placeholder="https://example.com/data.csv")
        
        if url:
            try:
                df = pd.read_csv(url)
                st.session_state.df = df.copy()
                st.session_state.cleaned_df = df.copy()
                
                Section("Data Preview")
                st.dataframe(df.head(), use_container_width=True)
                review_data(df)
                
                log_activity("Data Upload", f"Successfully loaded data from URL")
                StatusMessage("✅ Data loaded successfully from URL!", "success")
            except Exception as e:
                StatusMessage(f"Error loading from URL: {str(e)}", "error")
    
    # Sample Data Tab
    with tabs[4]:
        Section("Sample Datasets")
        sample_datasets = {
            "Titanic Survival": "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/titanic.csv",
            "Iris Flowers": "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv",
            "Penguins": "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv",
            "Diamond Prices": "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/diamonds.csv",
            "Flight Delays": "https://raw.githubusercontent.com/mwaskom/seaborn-data/master/flights.csv"
        }
        
        for name, url in sample_datasets.items():
            if st.button(f"📥 Load {name} Dataset", key=f"sample_{name}", use_container_width=True):
                try:
                    df = pd.read_csv(url)
                    st.session_state.df = df.copy()
                    st.session_state.cleaned_df = df.copy()
                    
                    Section("Data Preview")
                    st.dataframe(df.head(), use_container_width=True)
                    review_data(df)
                    
                    log_activity("Data Upload", f"Loaded {name} sample dataset")
                    StatusMessage(f"✅ {name} dataset loaded successfully!", "success")
                except Exception as e:
                    StatusMessage(f"Error loading {name} dataset: {str(e)}", "error")

def review_dataset(df: pd.DataFrame) -> None:
    """Generate a comprehensive dataset review."""
    try:
        # Dataset Overview
        Section("Dataset Overview")
        overview_data = format_dataset_overview(df)
        if overview_data:
            DataGrid(["Metric", "Value"], overview_data)
        
        # Column Details
        Section("Column Details")
        column_data = format_column_details(df)
        if column_data:
            DataGrid(
                ["Column", "Type", "Unique Values", "Missing", "Sample Values"],
                column_data
            )
    except Exception as e:
        st.error(f"Error reviewing dataset: {str(e)}")

def analyze_dataset_quality(df: pd.DataFrame) -> None:
    """Analyze dataset quality and display warnings."""
    try:
        warnings = []
        
        # Check for missing values
        missing_cols = df.isnull().sum()
        for col, missing in missing_cols.items():
            if missing > 0:
                missing_pct = (missing / len(df)) * 100
                warnings.append(f"⚠️ Column '{col}' has {missing:,} missing values ({missing_pct:.1f}%)")
        
        # Check for potential ID columns
        for col in df.columns:
            if df[col].nunique() == len(df):
                warnings.append(f"ℹ️ Column '{col}' might be an ID column (unique for each row)")
        
        # Display warnings if any
        if warnings:
            Section("Data Quality Warnings")
            Card("AI Analysis Results", "\n".join(warnings))
    except Exception as e:
        st.error(f"Error analyzing dataset quality: {str(e)}")
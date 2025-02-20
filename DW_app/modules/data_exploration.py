import streamlit as st
import pandas as pd
from components.layout import create_module_layout, render_card, render_section, render_info, render_error, render_success
from components.ui_components import DataGrid, ProgressTracker

@create_module_layout(
    title="Data Exploration",
    description="Explore and understand your dataset with powerful analysis tools."
)
def data_exploration():
    # Progress tracking
    steps = [
        "Upload Data",
        "Basic Info",
        "Data Preview",
        "Statistical Summary",
        "Data Quality"
    ]
    current_step = 0  # This would be managed by session state in a real app
    
    # Show progress
    ProgressTracker(steps, current_step)
    
    # File upload section
    render_section("Upload Your Dataset", "Upload a CSV, Excel, or JSON file to begin exploration.")
    uploaded_file = st.file_uploader("Choose a file", type=["csv", "xlsx", "json"])
    
    if uploaded_file is not None:
        try:
            # Load data based on file type
            if uploaded_file.name.endswith(".csv"):
                df = pd.read_csv(uploaded_file)
            elif uploaded_file.name.endswith(".xlsx"):
                df = pd.read_excel(uploaded_file)
            else:
                df = pd.read_json(uploaded_file)
            
            # Basic dataset info
            render_card(
                "Dataset Overview",
                f"""
                - **Rows**: {df.shape[0]:,}
                - **Columns**: {df.shape[1]:,}
                - **Memory Usage**: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB
                """,
                variant="info"
            )
            
            # Column information
            col_info = []
            for col in df.columns:
                dtype = str(df[col].dtype)
                missing = df[col].isna().sum()
                unique = df[col].nunique()
                col_info.append([col, dtype, f"{missing:,}", f"{unique:,}"])
            
            render_section("Column Information", "Detailed information about each column in your dataset.")
            DataGrid(
                headers=["Column Name", "Data Type", "Missing Values", "Unique Values"],
                rows=col_info
            )
            
            # Data preview
            render_section("Data Preview", "First few rows of your dataset.")
            st.dataframe(df.head(), use_container_width=True)
            
            # Basic statistics
            if df.select_dtypes(include=["number"]).columns.any():
                render_section("Statistical Summary", "Basic statistical measures for numeric columns.")
                st.dataframe(df.describe(), use_container_width=True)
            
            # Success message
            render_success("Dataset loaded and analyzed successfully!")
            
        except Exception as e:
            render_error(f"Error processing file: {str(e)}")
    else:
        render_info("Please upload a file to begin exploration.") 
import streamlit as st
import pandas as pd
from io import StringIO
from components.ui_components import ModuleHeader, Section, Card, StatusMessage, DataGrid

def final_report_page():
    ModuleHeader(
        "Final Report",
        "Review and download a summary report of your data processing workflow."
    )
    
    if st.session_state.get('cleaned_df') is None:
        StatusMessage("No cleaned dataset available for generating a final report.", "warning")
        return

    df = st.session_state.cleaned_df.copy()
    
    # Dataset Overview
    Section("Dataset Overview")
    
    overview_data = [
        {
            "Metric": "Rows",
            "Value": str(df.shape[0])
        },
        {
            "Metric": "Columns",
            "Value": str(df.shape[1])
        },
        {
            "Metric": "Memory Usage",
            "Value": f"{df.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB"
        }
    ]
    
    Card("Dataset Statistics", "Current Dataset")
    DataGrid(overview_data, ["Metric", "Value"])
    
    # Descriptive Statistics
    Section("Descriptive Statistics")
    
    # Create descriptive statistics for numeric columns
    desc_stats = df.describe()
    stats_data = []
    
    for column in desc_stats.columns:
        stats_data.append({
            "Column": column,
            "Mean": f"{desc_stats[column]['mean']:.2f}",
            "Std": f"{desc_stats[column]['std']:.2f}",
            "Min": f"{desc_stats[column]['min']:.2f}",
            "25%": f"{desc_stats[column]['25%']:.2f}",
            "50%": f"{desc_stats[column]['50%']:.2f}",
            "75%": f"{desc_stats[column]['75%']:.2f}",
            "Max": f"{desc_stats[column]['max']:.2f}"
        })
    
    Card("Numeric Column Statistics", "Statistical Summary")
    DataGrid(stats_data, ["Column", "Mean", "Std", "Min", "25%", "50%", "75%", "Max"])
    
    # Generate full report text
    report = []
    report.append(f"Dataset Shape: {df.shape[0]} rows x {df.shape[1]} columns")
    report.append("\n\nDescriptive Statistics:\n")
    report.append(df.describe().to_string())
    report_text = "\n\n".join(report)
    
    Section("Full Report")
    st.text_area("Report Summary", value=report_text, height=300)
    
    # Provide download button for the report as a text file
    report_bytes = report_text.encode("utf-8")
    st.download_button(
        label="Download Report",
        data=report_bytes,
        file_name="final_report.txt",
        mime="text/plain"
    ) 
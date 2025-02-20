import streamlit as st
import pandas as pd
from io import BytesIO
from components.ui_components import ModuleHeader, Section, Card, StatusMessage, DataGrid

def data_export_page():
    ModuleHeader(
        "Data Export",
        "Export your processed dataset in CSV or Excel format."
    )
    
    if st.session_state.get("cleaned_df") is None:
        StatusMessage("Please generate a cleaned dataset using the Data Wrangling module.", "warning")
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
            "Metric": "Memory Size",
            "Value": f"{df.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB"
        }
    ]
    
    Card("Dataset Statistics", "Current Dataset")
    DataGrid(overview_data, ["Metric", "Value"])
    
    # Export Options
    Section("Export Options")
    
    export_format = st.selectbox("Select export format", ["CSV", "Excel"], key="export_format")
    
    if export_format == "CSV":
        csv = df.to_csv(index=False).encode("utf-8")
        st.download_button(
            label="Download CSV",
            data=csv,
            file_name="exported_data.csv",
            mime="text/csv"
        )
        
        StatusMessage("Your data is ready to be downloaded as a CSV file.", "info")
    else:
        output = BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False, sheet_name="Sheet1")
        processed_data = output.getvalue()
        st.download_button(
            label="Download Excel",
            data=processed_data,
            file_name="exported_data.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
        StatusMessage("Your data is ready to be downloaded as an Excel file.", "info") 
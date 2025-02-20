import streamlit as st
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from components.ui_components import ModuleHeader, Section, Card, StatusMessage, DataGrid
from utils import log_activity

def data_wrangling_page():
    ModuleHeader(
        "Data Wrangling & Preprocessing",
        "Clean, transform, and prepare your dataset with intuitive controls."
    )
    
    if st.session_state.get('df') is None:
        StatusMessage("Please upload a dataset first using the Data Upload module.", "warning")
        return
    
    # Work on a copy of the dataset
    df = st.session_state.df.copy()
    
    # Initial Dataset Preview
    Section("Initial Dataset Preview")
    
    stats_data = [
        {
            "Metric": "Shape",
            "Value": f"{df.shape[0]} rows × {df.shape[1]} columns"
        },
        {
            "Metric": "Memory Usage",
            "Value": f"{df.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB"
        }
    ]
    
    Card("Dataset Statistics", "Current Dataset")
    DataGrid(stats_data, ["Metric", "Value"])
    st.dataframe(df.head())
    
    # Basic Operations
    Section("Basic Operations")
    
    # Drop Columns
    with st.expander("Drop Columns", expanded=False):
        drop_cols = st.multiselect(
            "Select columns to drop:", 
            options=df.columns.tolist(), 
            key="drop_cols"
        )
        if st.button("Drop Selected Columns", key="drop_cols_btn"):
            if drop_cols:
                df = df.drop(columns=drop_cols)
                StatusMessage(f"Dropped columns: {', '.join(drop_cols)}", "success")
            else:
                StatusMessage("No columns selected to drop.", "warning")
    
    # Rename Columns
    with st.expander("Rename Columns", expanded=False):
        rename_dict = {}
        for col in df.columns:
            new_name = st.text_input(f"Rename '{col}' to:", value=col, key=f"rename_{col}")
            if new_name != col:
                rename_dict[col] = new_name
        if st.button("Apply Renaming", key="rename_btn"):
            if rename_dict:
                df = df.rename(columns=rename_dict)
                StatusMessage("Columns renamed successfully.", "success")
            else:
                StatusMessage("No renaming changes applied.", "warning")
    
    # Convert Data Types
    with st.expander("Convert Data Types", expanded=False):
        obj_cols = df.select_dtypes(include="object").columns.tolist()
        conv_cols = st.multiselect(
            "Select columns to convert to 'category':", 
            options=obj_cols, 
            key="conv_cols"
        )
        if st.button("Convert to Category", key="conv_btn"):
            for col in conv_cols:
                df[col] = df[col].astype("category")
            StatusMessage("Selected columns converted to category.", "success")
    
    # Filter Rows
    with st.expander("Filter Rows", expanded=False):
        filter_cond = st.text_input(
            "Enter filter condition (e.g., `Age > 30`):", 
            key="filter_cond"
        )
        if st.button("Apply Filter", key="filter_btn"):
            try:
                filtered_df = df.query(filter_cond)
                StatusMessage(f"Filter applied. Rows reduced from {df.shape[0]} to {filtered_df.shape[0]}.", "success")
                df = filtered_df
            except Exception as e:
                StatusMessage(f"Filter error: {str(e)}", "error")
    
    # Handle Duplicates
    with st.expander("Handle Duplicates", expanded=False):
        dup_cols = st.multiselect(
            "Select columns for duplicate check (leave blank for all):", 
            options=df.columns.tolist(), 
            key="dup_cols"
        )
        if st.button("Show Duplicates", key="show_dups"):
            dup_rows = df[df.duplicated(subset=(dup_cols if dup_cols else None), keep=False)]
            Section(f"Duplicate Rows ({dup_rows.shape[0]} found)")
            st.dataframe(dup_rows)
            
        if st.button("Drop Duplicates (Keep First)", key="drop_dups"):
            df = df.drop_duplicates(subset=(dup_cols if dup_cols else None), keep="first")
            StatusMessage("Duplicates dropped successfully.", "success")
    
    # Handle Missing Values
    with st.expander("Handle Missing Values", expanded=False):
        missing_strategy = st.selectbox(
            "Choose Missing Value Strategy", 
            options=["drop", "mean", "median", "mode"], 
            key="missing_strategy"
        )
        if st.button("Apply Missing Value Handling", key="missing_val"):
            if missing_strategy == "drop":
                df = df.dropna()
                StatusMessage("Rows with missing values dropped.", "success")
            else:
                num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
                for col in num_cols:
                    if df[col].isna().sum() > 0:
                        if missing_strategy == "mean":
                            df[col].fillna(df[col].mean(), inplace=True)
                        elif missing_strategy == "median":
                            df[col].fillna(df[col].median(), inplace=True)
                        elif missing_strategy == "mode":
                            df[col].fillna(df[col].mode()[0], inplace=True)
                StatusMessage(f"Missing values imputed using {missing_strategy} strategy.", "success")
    
    # Standardize Numeric Columns
    with st.expander("Standardize Numeric Columns", expanded=False):
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if num_cols and st.button("Standardize", key="standardize_btn"):
            scaler = StandardScaler()
            df[num_cols] = scaler.fit_transform(df[num_cols])
            StatusMessage("Numeric columns standardized successfully.", "success")
    
    # Encode Categorical Columns
    with st.expander("Encode Categorical Columns", expanded=False):
        cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
        if cat_cols and st.button("Encode", key="encode_btn"):
            for col in cat_cols:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
            StatusMessage("Categorical columns encoded successfully.", "success")
    
    # Outlier Detection & Removal
    with st.expander("Outlier Detection & Removal", expanded=False):
        if num_cols:
            if st.button("Detect Outliers", key="detect_outliers"):
                z_scores = np.abs((df[num_cols] - df[num_cols].mean()) / df[num_cols].std())
                outliers_count = (z_scores > 3).sum().sum()
                StatusMessage(f"Detected {outliers_count} outlier data points (Z-score > 3).", "warning")
                
            if st.button("Remove Outliers (Z-score > 3)", key="remove_outliers"):
                z_scores = np.abs((df[num_cols] - df[num_cols].mean()) / df[num_cols].std())
                df = df[(z_scores < 3).all(axis=1)]
                StatusMessage("Outliers removed successfully.", "success")
    
    # Final Dataset Preview
    Section("Cleaned Dataset Preview")
    
    final_stats = [
        {
            "Metric": "Shape",
            "Value": f"{df.shape[0]} rows × {df.shape[1]} columns"
        },
        {
            "Metric": "Memory Usage",
            "Value": f"{df.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB"
        }
    ]
    
    Card("Final Dataset Statistics", "Cleaned Dataset")
    DataGrid(final_stats, ["Metric", "Value"])
    st.dataframe(df.head())
    
    # Update session state
    st.session_state.cleaned_df = df
    st.session_state.df = df
    log_activity("Data Wrangling", "Dataset cleaned and preprocessed successfully.") 
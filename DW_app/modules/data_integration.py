import streamlit as st
import pandas as pd
from components.ui_components import ModuleHeader, Section, Card, StatusMessage, DataGrid
from utils import log_activity

def data_integration_page():
    ModuleHeader(
        "Data Integration",
        "Merge a secondary dataset with your primary dataset seamlessly."
    )
    
    # Check if primary dataset is loaded
    if st.session_state.get('df') is None:
        StatusMessage("No Primary Dataset. Please upload the primary dataset first using the Data Upload module.", "warning")
        return
    
    # Display primary dataset preview
    Section("Primary Dataset")
    
    stats_data = [
        {
            "Metric": "Shape",
            "Value": f"{st.session_state.df.shape[0]} rows × {st.session_state.df.shape[1]} columns"
        }
    ]
    
    Card("Dataset Preview", "Dataset Statistics")
    DataGrid(stats_data, ["Metric", "Value"])
    st.dataframe(st.session_state.df.head(), use_container_width=True)
    
    # Upload second dataset section
    Section("Upload Second Dataset")
    StatusMessage("Upload a secondary dataset to merge with your primary dataset. Ensure both datasets have matching columns for merging.", "info")
    
    uploaded_file2 = st.file_uploader(
        "Upload Second CSV File",
        type=["csv"],
        key="upload_csv2",
        help="Upload a secondary dataset to merge with your primary dataset"
    )
    
    if uploaded_file2 is not None:
        try:
            df2 = pd.read_csv(uploaded_file2)
            st.session_state.df2 = df2.copy()
            log_activity("Data Integration", f"Secondary dataset uploaded: {df2.shape[0]} rows, {df2.shape[1]} columns")
            
            StatusMessage(f"Secondary Dataset Loaded Successfully: {df2.shape[0]} rows, {df2.shape[1]} columns", "success")
            
            # Second dataset preview
            Section("Secondary Dataset")
            
            stats_data2 = [
                {
                    "Metric": "Shape",
                    "Value": f"{df2.shape[0]} rows × {df2.shape[1]} columns"
                }
            ]
            
            Card("Dataset Preview", "Dataset Statistics")
            DataGrid(stats_data2, ["Metric", "Value"])
            st.dataframe(df2.head(), use_container_width=True)
            
            # Merge settings
            Section("Merge Configuration")
            
            col1, col2 = st.columns(2)
            with col1:
                merge_key1 = st.selectbox(
                    "Select merge key from Primary Dataset",
                    options=st.session_state.df.columns.tolist(),
                    key="merge_key1",
                    help="Choose the column from your primary dataset to use as the merge key"
                )
            
            with col2:
                merge_key2 = st.selectbox(
                    "Select merge key from Secondary Dataset",
                    options=df2.columns.tolist(),
                    key="merge_key2",
                    help="Choose the column from your secondary dataset to use as the merge key"
                )
            
            join_type = st.selectbox(
                "Select type of join",
                options=["inner", "left", "right", "outer"],
                key="join_type",
                help="""
                - inner: use intersection of keys from both frames
                - left: use only keys from left frame
                - right: use only keys from right frame
                - outer: use union of keys from both frames
                """
            )
            
            if st.button("🔄 Merge Datasets", key="merge_button", help="Click to merge the datasets"):
                try:
                    merged_df = pd.merge(
                        st.session_state.df, 
                        df2, 
                        left_on=merge_key1, 
                        right_on=merge_key2, 
                        how=join_type
                    )
                    st.session_state.merged_df = merged_df.copy()
                    log_activity("Data Integration", f"Datasets merged successfully: {merged_df.shape[0]} rows, {merged_df.shape[1]} columns")
                    
                    StatusMessage(f"Datasets Merged Successfully: {merged_df.shape[0]} rows, {merged_df.shape[1]} columns", "success")
                    
                    # Merged dataset preview
                    Section("Merged Dataset")
                    
                    merge_stats = [
                        {
                            "Metric": "Shape",
                            "Value": f"{merged_df.shape[0]} rows × {merged_df.shape[1]} columns"
                        },
                        {
                            "Metric": "Join Type",
                            "Value": join_type
                        },
                        {
                            "Metric": "Merge Keys",
                            "Value": f"{merge_key1} ↔ {merge_key2}"
                        }
                    ]
                    
                    Card("Dataset Preview", "Merge Statistics")
                    DataGrid(merge_stats, ["Metric", "Value"])
                    st.dataframe(merged_df.head(), use_container_width=True)
                    
                except Exception as e:
                    StatusMessage(f"Merge Error: {str(e)}", "error")
                    
        except Exception as e:
            StatusMessage(f"Error Reading Second Dataset: {str(e)}", "error") 
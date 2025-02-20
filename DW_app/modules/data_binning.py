import streamlit as st
import pandas as pd
import plotly.express as px
from components.ui_components import ModuleHeader, Section, Card, StatusMessage, DataGrid
from utils import log_activity

def data_binning_page():
    ModuleHeader(
        "Data Binning",
        "Transform numeric columns into categorical bins for better segmentation and insights."
    )

    # Verify cleaned dataset is available
    if st.session_state.get('cleaned_df') is None:
        StatusMessage("Please process your dataset through Data Wrangling first.", "warning")
        return

    df = st.session_state.cleaned_df.copy()
    num_cols = df.select_dtypes(include=["number"]).columns.tolist()
    
    if not num_cols:
        StatusMessage("No numeric columns available for binning.", "error")
        return
    
    # Column Selection
    Section("Binning Configuration")
    StatusMessage("Select a numeric column and specify the number of bins to create categorical segments of your data.", "info")
    
    col1, col2 = st.columns([2, 1])
    with col1:
        col_to_bin = st.selectbox(
            "Select a numeric column to bin:",
            options=num_cols,
            key="binning_col",
            help="Choose the numeric column you want to divide into bins"
        )
    
    with col2:
        num_bins = st.slider(
            "Number of bins",
            min_value=2,
            max_value=20,
            value=5,
            key="num_bins",
            help="Specify how many categories you want to create"
        )
    
    # Original Distribution
    Section("Original Distribution")
    fig_original = px.histogram(
        df,
        x=col_to_bin,
        title=f"Distribution of {col_to_bin}",
        template="plotly_dark"
    )
    fig_original.update_layout(
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        margin=dict(t=30, l=0, r=0, b=0)
    )
    st.plotly_chart(fig_original, use_container_width=True)
    
    if st.button("Apply Binning", key="binning_btn"):
        try:
            # Create bin labels for a cleaner display
            bin_labels = [f"Bin {i+1}" for i in range(num_bins)]
            binned_series = pd.cut(df[col_to_bin], bins=num_bins, labels=bin_labels, include_lowest=True)
            df[f"{col_to_bin}_binned"] = binned_series
            
            # Log the activity
            log_activity("Data Binning", f"Created {num_bins} bins for column '{col_to_bin}'")
            
            # Success message with bin information
            StatusMessage(f"Binning applied successfully. New column '{col_to_bin}_binned' created with {num_bins} bins.", "success")
            
            # Binned Distribution
            Section("Binned Distribution")
            
            # Display bin statistics
            stats_data = [
                {
                    "Metric": "Original Column",
                    "Value": col_to_bin
                },
                {
                    "Metric": "Number of Bins",
                    "Value": str(num_bins)
                },
                {
                    "Metric": "New Column",
                    "Value": f"{col_to_bin}_binned"
                }
            ]
            
            Card("Bin Statistics", "Binning Details")
            DataGrid(stats_data, ["Metric", "Value"])
            
            # Create binned distribution plot
            fig_binned = px.histogram(
                df,
                x=f"{col_to_bin}_binned",
                title=f"Binned Distribution of {col_to_bin}",
                template="plotly_dark",
                color_discrete_sequence=["#3498DB"]
            )
            fig_binned.update_layout(
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
                margin=dict(t=30, l=0, r=0, b=0)
            )
            st.plotly_chart(fig_binned, use_container_width=True)
            
            # Display bin value counts
            Section("Bin Details")
            value_counts = df[f"{col_to_bin}_binned"].value_counts().sort_index()
            
            counts_data = [
                {
                    "Bin": bin_,
                    "Count": f"{count:,}",
                    "Percentage": f"{count/len(df)*100:.1f}%"
                }
                for bin_, count in value_counts.items()
            ]
            
            Card("Value Counts per Bin", "Distribution Details")
            DataGrid(counts_data, ["Bin", "Count", "Percentage"])
            
            # Update session state
            st.session_state.cleaned_df = df
            st.session_state.df = df
            
        except Exception as e:
            StatusMessage(f"Binning error: {str(e)}", "error") 
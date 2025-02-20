import streamlit as st
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from components.ui_components import ModuleHeader, StatusMessage, Card, Section, DataGrid
from utils import create_3d_scatter, create_correlation_heatmap, create_pca_visualization, analyze_dataset, review_data, log_activity

def data_analysis_page():
    """Data Analysis and EDA page with modern styling and advanced visualizations."""
    ModuleHeader(
        "Data Analysis & EDA",
        "Explore and analyze your data with interactive visualizations and statistical insights."
    )
    
    if 'cleaned_df' not in st.session_state:
        StatusMessage("Please upload and clean your data first.", "warning")
        return
    
    df = st.session_state.cleaned_df
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    # AI-Powered Dataset Analysis
    Section("🤖 AI-Powered Dataset Analysis")
    analysis_text = analyze_dataset(df)
    st.code(analysis_text, language="text")
    
    # Interactive Data Preview
    Section("📊 Interactive Data Preview")
    review_data(df)  
    
    # Correlation Analysis
    Section("🔄 Correlation Analysis")
    if len(numeric_cols) > 1:
        st.plotly_chart(create_correlation_heatmap(df), use_container_width=True)
    else:
        StatusMessage("Not enough numeric columns for correlation analysis", "warning")
    
    # PCA Analysis
    Section("🔄 Principal Component Analysis")
    if len(numeric_cols) >= 3:
        pca = PCA()
        pca_data = pca.fit_transform(df[numeric_cols])
        explained_variance = pca.explained_variance_ratio_[:3]  # Get top 3 components
        
        # Create PCA results card
        Card("PCA Results", "Explained Variance Ratio")
        
        # Display variance data in a grid
        variance_data = [
            {"Component": f"PC{i+1}", "Variance": f"{var:.2%}"}
            for i, var in enumerate(explained_variance)
        ]
        DataGrid(variance_data, ["Component", "Variance"])
    else:
        StatusMessage("Not enough numeric columns for PCA visualization (minimum 3 required)", "warning")
    
    # Interactive Feature Exploration
    Section("🔍 Interactive Feature Exploration")
    if len(numeric_cols) >= 3:
        col1, col2 = st.columns(2)
        with col1:
            x_col = st.selectbox("Select X-axis feature", numeric_cols)
        with col2:
            y_col = st.selectbox("Select Y-axis feature", numeric_cols, index=1 if len(numeric_cols) > 1 else 0)
        
        z_col = st.selectbox("Select Z-axis feature", numeric_cols, index=2 if len(numeric_cols) > 2 else 0)
        color_col = st.selectbox("Select color feature (optional)", ['None'] + list(df.columns))
        
        fig = create_3d_scatter(
            df,
            x_col,
            y_col,
            z_col,
            color_col if color_col != 'None' else None
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        StatusMessage("Not enough numeric columns for 3D visualization (minimum 3 required)", "warning")
    
    log_activity("data_analysis", "Completed data analysis") 
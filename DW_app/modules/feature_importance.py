import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from components.ui_components import ModuleHeader, Section, Card, StatusMessage, DataGrid
from utils import log_activity

def feature_importance_page():
    ModuleHeader(
        "Feature Importance Analysis",
        "Discover which features have the most impact on your target variable."
    )
    
    if 'cleaned_df' not in st.session_state or st.session_state.cleaned_df is None:
        StatusMessage("Please process your dataset through Data Wrangling first.", "warning")
        return
    
    df = st.session_state.cleaned_df.copy()
    
    # Dataset Overview
    Section("Dataset Context")
    
    # Create dataset stats
    stats_data = [
        {
            "Metric": "Shape",
            "Value": f"{df.shape[0]} rows × {df.shape[1]} columns"
        },
        {
            "Metric": "Numeric Columns",
            "Value": str(len(df.select_dtypes(include=[np.number]).columns))
        },
        {
            "Metric": "Categorical Columns",
            "Value": str(len(df.select_dtypes(include=['object', 'category']).columns))
        }
    ]
    
    Card("Current Dataset", "Dataset Statistics")
    DataGrid(stats_data, ["Metric", "Value"])
    
    # Feature Selection
    Section("Feature Configuration")
    StatusMessage("Select your target variable and features to analyze their importance.", "info")
    
    col1, col2 = st.columns([2, 1])
    with col1:
        target_variable = st.selectbox(
            "Select Target Variable",
            options=df.columns.tolist(),
            help="Choose the variable you want to predict"
        )
    
    with col2:
        n_features = st.slider(
            "Number of Top Features",
            min_value=3,
            max_value=min(20, len(df.columns) - 1),
            value=10,
            help="Number of most important features to display"
        )
    
    features = [col for col in df.columns if col != target_variable]
    
    if st.button("Calculate Feature Importance", key="calc_importance"):
        try:
            # Prepare the data
            X = df[features].copy()
            y = df[target_variable].copy()
            
            # Encode categorical variables
            for col in X.select_dtypes(include=['object', 'category']).columns:
                X[col] = LabelEncoder().fit_transform(X[col].astype(str))
            
            if y.dtype == 'object' or y.dtype.name == 'category':
                y = LabelEncoder().fit_transform(y.astype(str))
            
            # Train a Random Forest model
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X, y)
            
            # Get feature importance scores
            importance_scores = model.feature_importances_
            feature_importance = pd.DataFrame({
                'Feature': features,
                'Importance': importance_scores
            })
            feature_importance = feature_importance.sort_values('Importance', ascending=False).head(n_features)
            
            # Log activity
            log_activity("Feature Importance", f"Calculated importance scores for {n_features} features")
            
            # Display results
            Section("Feature Importance Results")
            
            # Create importance data for grid
            importance_data = [
                {
                    "Feature": row['Feature'],
                    "Importance Score": f"{row['Importance']:.4f}",
                    "Relative Importance": f"{(row['Importance'] / importance_scores.sum() * 100):.1f}%"
                }
                for _, row in feature_importance.iterrows()
            ]
            
            Card("Top Features by Importance", "Feature Rankings")
            DataGrid(importance_data, ["Feature", "Importance Score", "Relative Importance"])
            
            # Create visualization
            fig = px.bar(
                feature_importance,
                x='Feature',
                y='Importance',
                title=f"Top {n_features} Most Important Features",
                template="plotly_dark"
            )
            
            fig.update_layout(
                xaxis_title="Feature",
                yaxis_title="Importance Score",
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)"
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
            # Feature correlations
            Section("Feature Correlations")
            numeric_features = df[features].select_dtypes(include=[np.number]).columns
            if len(numeric_features) > 1:
                corr_matrix = df[numeric_features].corr()
                fig_corr = px.imshow(
                    corr_matrix,
                    title="Feature Correlation Matrix",
                    template="plotly_dark"
                )
                fig_corr.update_layout(
                    plot_bgcolor="rgba(0,0,0,0)",
                    paper_bgcolor="rgba(0,0,0,0)"
                )
                st.plotly_chart(fig_corr, use_container_width=True)
            else:
                StatusMessage("Not enough numeric features for correlation analysis.", "info")
            
        except Exception as e:
            StatusMessage(f"Error calculating feature importance: {str(e)}", "error") 
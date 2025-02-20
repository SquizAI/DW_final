import streamlit as st
import pandas as pd
import numpy as np
from components.ui_components import ModuleHeader, Section, Card, StatusMessage, DataGrid
from utils import log_activity

def lambda_feature_engineering_page():
    ModuleHeader(
        "Lambda & Feature Engineering",
        "Apply AI-powered or custom lambda functions for advanced feature engineering."
    )
    
    # Check if cleaned data exists
    if 'cleaned_df' not in st.session_state or st.session_state.cleaned_df is None:
        StatusMessage("Please run the Data Wrangling module first to prepare your dataset.", "warning")
        return
    
    df = st.session_state.cleaned_df.copy()
    
    # Dataset Overview
    Section("Dataset Overview")
    
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
    
    # Lambda Function Configuration
    Section("Lambda Function Configuration")
    
    examples = [
        {
            "Example": "x + 1",
            "Description": "Add 1 to each value"
        },
        {
            "Example": "x * 2",
            "Description": "Multiply each value by 2"
        },
        {
            "Example": "x.upper()",
            "Description": "Convert strings to uppercase"
        },
        {
            "Example": "np.log1p(x)",
            "Description": "Logarithmic transformation"
        }
    ]
    
    Card("Lambda Function Examples", "Common Transformations")
    DataGrid(examples, ["Example", "Description"])
    
    col1, col2 = st.columns([2, 1])
    with col1:
        target_columns = st.multiselect(
            "Select columns to transform",
            options=df.columns.tolist(),
            help="Choose the columns you want to apply the transformation to"
        )
    
    with col2:
        preview_rows = st.number_input(
            "Preview Rows",
            min_value=1,
            max_value=10,
            value=5,
            help="Number of rows to preview after transformation"
        )
    
    user_lambda = st.text_area(
        "Enter your lambda transformation:",
        placeholder="Example: x + 1",
        help="Use 'x' as the variable in your lambda function"
    )
    
    if st.button("Apply Transformation", help="Click to apply the lambda transformation"):
        if not target_columns:
            StatusMessage("Please select at least one column to transform.", "error")
            return
            
        if not user_lambda:
            StatusMessage("Please enter a lambda transformation.", "error")
            return
            
        try:
            # Create a copy of the dataframe for transformation
            df_transformed = df.copy()
            
            # Create the lambda function
            transformation = eval(f"lambda x: {user_lambda}")
            
            # Apply transformation to selected columns
            for col in target_columns:
                try:
                    df_transformed[f"{col}_transformed"] = df[col].apply(transformation)
                    log_activity(
                        "Feature Engineering",
                        f"Applied transformation '{user_lambda}' to column '{col}'"
                    )
                except Exception as col_error:
                    StatusMessage(f"Error transforming column '{col}': {str(col_error)}", "error")
                    continue
            
            # Show preview of transformed data
            Section("Transformation Preview")
            StatusMessage("Transformation applied successfully!", "success")
            
            # Display comparison of original and transformed columns
            for col in target_columns:
                transformation_info = [
                    {
                        "Property": "Transformation",
                        "Value": user_lambda
                    },
                    {
                        "Property": "New Column",
                        "Value": f"{col}_transformed"
                    }
                ]
                
                Card(f"Column: {col}", "Transformation Details")
                DataGrid(transformation_info, ["Property", "Value"])
                
                comparison_df = pd.DataFrame({
                    'Original': df[col].head(preview_rows),
                    'Transformed': df_transformed[f"{col}_transformed"].head(preview_rows)
                })
                st.dataframe(comparison_df, use_container_width=True)
                
                # Show basic statistics for numeric columns
                if pd.api.types.is_numeric_dtype(df_transformed[f"{col}_transformed"]):
                    stats_df = pd.DataFrame({
                        'Metric': ['Mean', 'Std Dev', 'Min', 'Max'],
                        'Original': [
                            f"{df[col].mean():.2f}",
                            f"{df[col].std():.2f}",
                            f"{df[col].min():.2f}",
                            f"{df[col].max():.2f}"
                        ],
                        'Transformed': [
                            f"{df_transformed[f'{col}_transformed'].mean():.2f}",
                            f"{df_transformed[f'{col}_transformed'].std():.2f}",
                            f"{df_transformed[f'{col}_transformed'].min():.2f}",
                            f"{df_transformed[f'{col}_transformed'].max():.2f}"
                        ]
                    })
                    
                    Card("Statistical Comparison", "Before vs After Transformation")
                    st.dataframe(stats_df, use_container_width=True)
            
            # Update session state with transformed data
            st.session_state.cleaned_df = df_transformed
            st.session_state.df = df_transformed
            
        except Exception as e:
            StatusMessage(f"Error applying transformation: {str(e)}", "error") 
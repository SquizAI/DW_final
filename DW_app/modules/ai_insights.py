import streamlit as st
import pandas as pd
import numpy as np
from typing import List, Dict
import openai
from components.ui_components import (
    ModuleHeader,
    StatusMessage,
    Card,
    ChatMessage,
    Section,
    DataGrid
)
from utils import log_activity

def ai_insights_page():
    ModuleHeader(
        "AI Insights & Analysis",
        "Get AI-powered insights and analysis of your data"
    )
    
    if 'cleaned_df' not in st.session_state or st.session_state.cleaned_df is None:
        StatusMessage("Please process your dataset through Data Wrangling first.", "warning")
        return
    
    df = st.session_state.cleaned_df.copy()
    
    if 'chat_history' not in st.session_state:
        st.session_state.chat_history = []
    
    # AI Analysis Tabs
    tabs = st.tabs([
        "🤖 Smart Analysis",
        "💡 Feature Engineering",
        "📊 Pattern Discovery",
        "❓ Data Chat"
    ])
    
    # Smart Analysis Tab
    with tabs[0]:
        Section("🔍 Automated Data Analysis")
        if st.button("Generate Smart Analysis", use_container_width=True):
            with st.spinner("AI is analyzing your dataset..."):
                # Basic Stats
                stats_data = analyze_dataset(df)
                
                # Correlation Analysis
                corr_matrix = df.select_dtypes(include=[np.number]).corr()
                
                # Generate Insights
                insights = []
                
                # Check for strong correlations
                for i in range(len(corr_matrix.columns)):
                    for j in range(i+1, len(corr_matrix.columns)):
                        corr = corr_matrix.iloc[i, j]
                        if abs(corr) > 0.7:
                            insights.append(f"💡 Strong correlation ({corr:.2f}) found between {corr_matrix.columns[i]} and {corr_matrix.columns[j]}")
                
                # Check for data quality issues
                for col in df.columns:
                    missing = df[col].isnull().sum()
                    if missing > 0:
                        pct = (missing / len(df)) * 100
                        insights.append(f"⚠️ Column '{col}' has {missing} missing values ({pct:.1f}%)")
                    
                    if df[col].dtype in ['object', 'category']:
                        if df[col].nunique() == 1:
                            insights.append(f"⚠️ Column '{col}' has only one unique value")
                        elif df[col].nunique() == len(df):
                            insights.append(f"ℹ️ Column '{col}' is unique for each row (possible ID)")
                
                # Display Results
                Card("AI Analysis Results", "\n".join(insights))
    
    # Feature Engineering Tab
    with tabs[1]:
        Section("🛠 AI-Powered Feature Engineering")
        if st.button("Generate Feature Suggestions", use_container_width=True):
            with st.spinner("AI is generating feature suggestions..."):
                suggestions = []
                
                # Datetime Features
                for col in df.columns:
                    try:
                        pd.to_datetime(df[col])
                        suggestions.append({
                            "Feature": f"{col}_year",
                            "Type": "Datetime",
                            "Description": f"Extract year from {col}",
                            "Code": f"df['{col}_year'] = pd.to_datetime(df['{col}']).dt.year"
                        })
                    except:
                        pass
                
                # Numeric Features
                num_cols = df.select_dtypes(include=[np.number]).columns
                if len(num_cols) >= 2:
                    for i in range(len(num_cols)):
                        for j in range(i+1, len(num_cols)):
                            col1, col2 = num_cols[i], num_cols[j]
                            suggestions.append({
                                "Feature": f"{col1}_{col2}_ratio",
                                "Type": "Numeric",
                                "Description": f"Ratio between {col1} and {col2}",
                                "Code": f"df['{col1}_{col2}_ratio'] = df['{col1}'] / df['{col2}']"
                            })
                
                # Categorical Features
                cat_cols = df.select_dtypes(include=['object', 'category']).columns
                for col in cat_cols:
                    if df[col].nunique() < 10:  # For low cardinality
                        suggestions.append({
                            "Feature": f"{col}_encoded",
                            "Type": "Categorical",
                            "Description": f"One-hot encode {col}",
                            "Code": f"pd.get_dummies(df['{col}'], prefix='{col}')"
                        })
                
                # Display suggestions
                if suggestions:
                    for suggestion in suggestions:
                        with st.expander(f"✨ {suggestion['Feature']}"):
                            st.markdown(f"**Type:** {suggestion['Type']}")
                            st.markdown(f"**Description:** {suggestion['Description']}")
                            st.code(suggestion['Code'], language='python')
                            if st.button("Apply This Feature", key=f"apply_{suggestion['Feature']}"):
                                try:
                                    exec(suggestion['Code'])
                                    st.success("Feature added successfully!")
                                except Exception as e:
                                    st.error(f"Error applying feature: {str(e)}")
    
    # Pattern Discovery Tab
    with tabs[2]:
        Section("🔍 Pattern Discovery")
        if st.button("Discover Patterns", use_container_width=True):
            with st.spinner("AI is discovering patterns..."):
                patterns = []
                
                # Distribution Patterns
                for col in df.select_dtypes(include=[np.number]).columns:
                    skew = df[col].skew()
                    if abs(skew) > 1:
                        patterns.append(f"📊 {col} shows {'positive' if skew > 0 else 'negative'} skew ({skew:.2f})")
                
                # Outlier Patterns
                for col in df.select_dtypes(include=[np.number]).columns:
                    z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
                    outliers = (z_scores > 3).sum()
                    if outliers > 0:
                        patterns.append(f"⚠️ {col} has {outliers} potential outliers")
                
                # Value Patterns
                for col in df.select_dtypes(include=['object', 'category']).columns:
                    mode_pct = (df[col].value_counts().iloc[0] / len(df)) * 100
                    if mode_pct > 90:
                        patterns.append(f"📌 {col} is dominated by a single value ({mode_pct:.1f}%)")
                
                # Display patterns
                if patterns:
                    Card("Discovered Patterns", "\n".join(patterns))
    
    # Data Chat Tab
    with tabs[3]:
        Section("💬 Chat with Your Data")
        
        # Display chat history
        for msg in st.session_state.chat_history:
            ChatMessage(
                role="You" if msg['role'] == 'user' else "AI Assistant",
                content=msg['content']
            )
        
        # Chat input
        user_input = st.text_input(
            "Ask about your data...",
            placeholder="e.g., 'What's the correlation between age and salary?'",
            key="chat_input"
        )
        
        if user_input:
            process_user_query(user_input, df)

def analyze_dataset(df: pd.DataFrame):
    """Perform quick analysis of the dataset."""
    try:
        # Basic statistics
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        # Prepare statistics data
        stats_data = [
            {
                "Metric": "Number of Records",
                "Value": f"{len(df):,}"
            },
            {
                "Metric": "Missing Values",
                "Value": f"{df.isnull().sum().sum():,}"
            },
            {
                "Metric": "Numeric Features",
                "Value": str(len(numeric_cols))
            },
            {
                "Metric": "Categorical Features",
                "Value": str(len(df.select_dtypes(include=['object']).columns))
            }
        ]
        
        Card("Quick Analysis Results", "Key Statistics")
        DataGrid(stats_data, ["Metric", "Value"])
        
        log_activity("AI Insights", "Performed quick dataset analysis")
        
    except Exception as e:
        StatusMessage(f"Analysis error: {str(e)}", "error")

def suggest_features(df: pd.DataFrame):
    """Generate AI-powered feature engineering suggestions."""
    try:
        # Example suggestions (replace with actual AI logic)
        suggestions = [
            "Create age groups using binning",
            "Extract title from name (Mr, Mrs, etc.)",
            "Create family size feature",
            "Combine deck information from cabin",
            "Create fare per person feature"
        ]
        
        suggestions_data = [{"Suggestion": s} for s in suggestions]
        
        Card("Feature Engineering Suggestions", "Suggested Features")
        DataGrid(suggestions_data, ["Suggestion"])
        
        log_activity("AI Insights", "Generated feature engineering suggestions")
        
    except Exception as e:
        StatusMessage(f"Suggestion error: {str(e)}", "error")

def explain_patterns(df: pd.DataFrame):
    """Discover and explain patterns in the data."""
    try:
        # Example patterns (replace with actual AI analysis)
        patterns = [
            "Strong correlation between fare and survival",
            "Higher survival rate for women",
            "First class passengers had better survival odds",
            "Large families had lower survival rates",
            "Age shows non-linear relationship with survival"
        ]
        
        patterns_data = [{"Pattern": p} for p in patterns]
        
        Card("Pattern Analysis", "Discovered Patterns")
        DataGrid(patterns_data, ["Pattern"])
        
        log_activity("AI Insights", "Analyzed data patterns")
        
    except Exception as e:
        StatusMessage(f"Pattern analysis error: {str(e)}", "error")

def process_user_query(query: str, df: pd.DataFrame):
    """Process user's natural language query about the data."""
    try:
        # Add user message to chat history
        st.session_state.chat_history.append({
            'role': 'user',
            'content': query
        })
        
        # Process query using OpenAI (replace with your actual implementation)
        response = "I understand you're asking about [query]. Based on the data..."
        
        # Add AI response to chat history
        st.session_state.chat_history.append({
            'role': 'assistant',
            'content': response
        })
        
        log_activity("AI Insights", f"Processed user query: {query}")
        
        # Force streamlit to rerun to update chat history
        st.rerun()
        
    except Exception as e:
        StatusMessage(f"Error processing query: {str(e)}", "error") 
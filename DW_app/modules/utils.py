import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

def create_module_header(title: str, description: str):
    """Create a consistent modern header for all modules"""
    st.markdown(f"""
        <div style='
            background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 20px 0 rgba(0,0,0,0.2);
        '>
            <div style='display: flex; align-items: center; justify-content: space-between;'>
                <div>
                    <h1 style='color: #ffffff; margin: 0; font-size: 2.5rem; font-weight: 600;'>
                        {title}
                    </h1>
                    <p style='color: #b2bac2; margin-top: 0.5rem; font-size: 1.1rem;'>
                        {description}
                    </p>
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)

def create_3d_scatter(df: pd.DataFrame, x_col: str, y_col: str, z_col: str, color_col: str = None):
    """Create an interactive 3D scatter plot"""
    fig = go.Figure(data=[go.Scatter3d(
        x=df[x_col],
        y=df[y_col],
        z=df[z_col],
        mode='markers',
        marker=dict(
            size=6,
            color=df[color_col] if color_col else None,
            colorscale='Viridis',
            opacity=0.8
        ),
        text=df.index if color_col is None else df[color_col],
        hoverinfo='text'
    )])
    
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        scene=dict(
            xaxis_title=x_col,
            yaxis_title=y_col,
            zaxis_title=z_col
        )
    )
    return fig

def create_correlation_heatmap(df: pd.DataFrame):
    """Create an interactive correlation heatmap"""
    corr = df.select_dtypes(include=[np.number]).corr()
    
    fig = go.Figure(data=go.Heatmap(
        z=corr,
        x=corr.columns,
        y=corr.columns,
        colorscale='RdBu',
        zmid=0
    ))
    
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        title="Feature Correlation Heatmap"
    )
    return fig

def create_pca_visualization(df: pd.DataFrame):
    """Create PCA visualization for dimensionality reduction"""
    # Select numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) < 3:
        return None, "Not enough numeric columns for PCA visualization"
    
    # Standardize the features
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df[numeric_cols])
    
    # Apply PCA
    pca = PCA(n_components=3)
    pca_result = pca.fit_transform(scaled_data)
    
    # Create DataFrame with PCA results
    pca_df = pd.DataFrame(
        data=pca_result,
        columns=['PC1', 'PC2', 'PC3']
    )
    
    # Create 3D scatter plot
    fig = go.Figure(data=[go.Scatter3d(
        x=pca_df['PC1'],
        y=pca_df['PC2'],
        z=pca_df['PC3'],
        mode='markers',
        marker=dict(
            size=6,
            colorscale='Viridis',
            opacity=0.8
        )
    )])
    
    # Update layout
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        scene=dict(
            xaxis_title="First Principal Component",
            yaxis_title="Second Principal Component",
            zaxis_title="Third Principal Component"
        ),
        title="PCA 3D Visualization"
    )
    
    # Calculate explained variance
    explained_variance = pca.explained_variance_ratio_
    
    return fig, explained_variance

def analyze_dataset(df: pd.DataFrame) -> str:
    """Generate an AI-powered analysis of the dataset"""
    analysis = []
    
    # Basic dataset information
    analysis.append(f"Dataset Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    
    # Data types analysis
    dtypes = df.dtypes.value_counts()
    analysis.append("\nColumn Data Types:")
    for dtype, count in dtypes.items():
        analysis.append(f"- {dtype}: {count} columns")
    
    # Missing values analysis
    missing = df.isnull().sum()
    if missing.any():
        analysis.append("\nMissing Values:")
        for col, count in missing[missing > 0].items():
            percentage = (count / len(df)) * 100
            analysis.append(f"- {col}: {count} missing values ({percentage:.2f}%)")
    
    # Numeric columns analysis
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        analysis.append("\nNumeric Columns Statistics:")
        for col in numeric_cols:
            stats = df[col].describe()
            analysis.append(f"\n{col}:")
            analysis.append(f"- Range: {stats['min']:.2f} to {stats['max']:.2f}")
            analysis.append(f"- Mean: {stats['mean']:.2f}")
            analysis.append(f"- Std Dev: {stats['std']:.2f}")
    
    # Categorical columns analysis
    cat_cols = df.select_dtypes(include=['object', 'category']).columns
    if len(cat_cols) > 0:
        analysis.append("\nCategorical Columns Analysis:")
        for col in cat_cols:
            unique_count = df[col].nunique()
            top_values = df[col].value_counts().head(3)
            analysis.append(f"\n{col}:")
            analysis.append(f"- Unique values: {unique_count}")
            analysis.append("- Top 3 values:")
            for val, count in top_values.items():
                percentage = (count / len(df)) * 100
                analysis.append(f"  * {val}: {count} ({percentage:.2f}%)")
    
    return "\n".join(analysis)

def review_data(df: pd.DataFrame) -> str:
    """Generate a modern HTML report summarizing the dataframe with advanced analytics."""
    n_rows, n_cols = df.shape
    
    # Get basic statistics
    numeric_stats = df.describe().round(2)
    missing_data = df.isnull().sum()
    dtypes = df.dtypes
    
    html = f"""
    <div style='
        background: rgba(19, 47, 76, 0.4);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1rem 0;
        color: #ffffff;
    '>
        <h4 style='color: #ffffff; margin: 0 0 1rem 0;'>Dataset Overview</h4>
        <div style='display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;'>
            <div style='background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;'>
                <div style='font-size: 0.875rem; color: #b2bac2;'>Rows</div>
                <div style='font-size: 1.5rem; font-weight: 500;'>{n_rows:,}</div>
            </div>
            <div style='background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;'>
                <div style='font-size: 0.875rem; color: #b2bac2;'>Columns</div>
                <div style='font-size: 1.5rem; font-weight: 500;'>{n_cols}</div>
            </div>
            <div style='background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;'>
                <div style='font-size: 0.875rem; color: #b2bac2;'>Memory Usage</div>
                <div style='font-size: 1.5rem; font-weight: 500;'>{df.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB</div>
            </div>
        </div>
        
        <div style='margin-top: 1.5rem;'>
            <h5 style='color: #b2bac2; margin-bottom: 1rem;'>Column Details:</h5>
            <div style='display: grid; gap: 0.5rem;'>
    """
    
    for col in df.columns:
        dtype = dtypes[col]
        missing = missing_data[col]
        missing_pct = (missing / n_rows) * 100
        unique_count = df[col].nunique()
        
        html += f"""
            <div style='
                background: rgba(255,255,255,0.05);
                padding: 1rem;
                border-radius: 8px;
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                gap: 1rem;
                align-items: center;
            '>
                <div>
                    <div style='font-weight: 500;'>{col}</div>
                    <div style='color: #b2bac2; font-size: 0.875rem;'>{dtype}</div>
                </div>
                <div>
                    <div style='font-size: 0.875rem; color: #b2bac2;'>Unique Values</div>
                    <div>{unique_count:,}</div>
                </div>
                <div>
                    <div style='font-size: 0.875rem; color: #b2bac2;'>Missing</div>
                    <div>{missing:,} ({missing_pct:.1f}%)</div>
                </div>
                <div>
                    <div style='font-size: 0.875rem; color: #b2bac2;'>Sample Values</div>
                    <div style='font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis;'>
                        {', '.join(map(str, df[col].dropna().sample(min(3, len(df))).values))}
                    </div>
                </div>
            </div>
        """
    
    html += """
            </div>
        </div>
    </div>
    """
    
    return html

def log_error(message: str):
    """Log an error message to session state and display it using Streamlit."""
    if 'error_log' not in st.session_state:
        st.session_state.error_log = []
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    st.session_state.error_log.append(f"{timestamp} - {message}")
    st.error(message)

def log_activity(activity_type: str, message: str):
    """Log an activity to the session state activity log."""
    if 'activity_log' not in st.session_state:
        st.session_state.activity_log = []
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    st.session_state.activity_log.append({
        'timestamp': timestamp,
        'type': activity_type,
        'message': message
    }) 
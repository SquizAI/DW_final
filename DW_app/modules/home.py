import streamlit as st
from datetime import datetime
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np
from components.ui_components import Section, Card, StatusMessage, DataGrid, ModuleHeader

def custom_workflow_manager():
    """Create a modern workflow manager with improved styling."""
    Section("Build Your Custom Workflow")
    StatusMessage(
        "Select the steps you want in your workflow, then click 'Start Custom Workflow' to begin.",
        "info"
    )
    
    options = [
        "📤 Data Upload",
        "🔗 Data Integration",
        "🧹 Data Wrangling",
        "🛠 Data Binning",
        "⚙ Lambda & Feature Engineering",
        "📊 Data Analysis & EDA",
        "📊 Feature Importance",
        "🤖 AI Insights & Data Chat",
        "📉 Binary Classification & Resampling",
        "📥 Data Export",
        "📝 Final Report"
    ]
    
    selected_steps = st.multiselect(
        "Select Workflow Steps (in desired order):",
        options,
        default=options,
        help="Choose and order the steps for your custom workflow"
    )
    
    col1, col2 = st.columns([3, 1])
    with col2:
        start_workflow = st.button(
            "🚀 Start Custom Workflow",
            help="Begin your custom workflow with the selected steps",
            use_container_width=True
        )
    
    if start_workflow:
        if selected_steps:
            st.session_state.custom_workflow = selected_steps
            st.session_state.current_workflow_index = 0
            Card(
                "Workflow Created",
                f"Your custom workflow with {len(selected_steps)} steps has been created. Click 'Go To Module' to start working on the first step."
            )
            
            workflow_data = [{"Step": step} for step in selected_steps]
            DataGrid(workflow_data, ["Step"])
            
            if st.button("Go To Module", use_container_width=True):
                st.session_state.selected_module = selected_steps[0]
                st.experimental_rerun()
        else:
            StatusMessage("Please select at least one step for your workflow.", "warning")

def create_workflow_progress_chart():
    """Create an animated workflow progress chart."""
    if 'progress' not in st.session_state:
        return None
    
    progress_data = [
        {
            "Module": "Data Upload",
            "Status": "✅" if "data upload" in st.session_state.progress else "⏳"
        },
        {
            "Module": "Data Integration",
            "Status": "✅" if "data integration" in st.session_state.progress else "⏳"
        },
        {
            "Module": "Data Wrangling",
            "Status": "✅" if "data wrangling" in st.session_state.progress else "⏳"
        },
        {
            "Module": "Feature Engineering",
            "Status": "✅" if "feature engineering" in st.session_state.progress else "⏳"
        }
    ]
    
    Section("Workflow Progress")
    DataGrid(progress_data, ["Module", "Status"])

def create_ml_metrics_dashboard():
    """Create a modern ML metrics dashboard with animations."""
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=("Model Performance", "Feature Importance", "Data Distribution", "Training Progress"),
        specs=[[{"type": "indicator"}, {"type": "bar"}],
               [{"type": "box"}, {"type": "scatter"}]]
    )
    
    # Sample metrics (replace with actual data when available)
    fig.add_trace(
        go.Indicator(
            mode="number+delta",
            value=85.5,
            delta={'reference': 80, 'relative': True},
            title={"text": "Accuracy %"},
            domain={'x': [0, 1], 'y': [0, 1]}
        ),
        row=1, col=1
    )
    
    # Sample feature importance
    fig.add_trace(
        go.Bar(
            x=['Feature 1', 'Feature 2', 'Feature 3'],
            y=[0.8, 0.6, 0.4],
            marker_color='#3498DB'
        ),
        row=1, col=2
    )
    
    # Sample distribution
    fig.add_trace(
        go.Box(
            y=[1, 2, 3, 4, 5],
            name="Distribution",
            marker_color='#3498DB'
        ),
        row=2, col=1
    )
    
    # Sample training progress
    fig.add_trace(
        go.Scatter(
            x=[1, 2, 3, 4, 5],
            y=[0.6, 0.7, 0.8, 0.85, 0.85],
            mode='lines+markers',
            name="Training",
            line=dict(color='#3498DB')
        ),
        row=2, col=2
    )
    
    fig.update_layout(
        height=600,
        showlegend=False,
        paper_bgcolor="#1E1E1E",
        plot_bgcolor="#1E1E1E",
        font={'color': "#ECF0F1"},
        margin=dict(t=30)
    )
    
    return fig

def create_stats_cards():
    """Create modern statistics cards."""
    stats_data = [
        {
            "Metric": "Processed Datasets",
            "Value": len(st.session_state.get('processed_datasets', []))
        },
        {
            "Metric": "Active Models",
            "Value": len(st.session_state.get('active_models', []))
        },
        {
            "Metric": "Total Features",
            "Value": len(st.session_state.get('features', []))
        }
    ]
    
    Card("Project Statistics", "Key Metrics")
    DataGrid(stats_data, ["Metric", "Value"])

def create_modern_metrics_dashboard():
    """Create a modern metrics dashboard with animations."""
    Section("Project Metrics")
    
    # Create sample data
    x = np.linspace(0, 10, 100)
    y1 = np.sin(x)
    y2 = np.cos(x)
    
    # Create figure with secondary y-axis
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=(
            'Model Performance',
            'Resource Usage',
            'Training Progress',
            'Feature Distribution'
        )
    )
    
    # Add traces
    fig.add_trace(
        go.Indicator(
            mode="gauge+number+delta",
            value=87.5,
            delta={'reference': 85.0},
            gauge={
                'axis': {'range': [None, 100]},
                'bar': {'color': "#1a237e"},
                'steps': [
                    {'range': [0, 50], 'color': "#b71c1c"},
                    {'range': [50, 75], 'color': "#f57f17"},
                    {'range': [75, 100], 'color': "#1b5e20"}
                ]
            },
            title={'text': "Accuracy"}
        ),
        row=1, col=1
    )
    
    # Add violin plot
    fig.add_trace(
        go.Violin(
            y=np.random.normal(0, 1, 100),
            box_visible=True,
            line_color='#1a237e',
            fillcolor='#3949ab',
            opacity=0.6
        ),
        row=1, col=2
    )
    
    # Add scatter plot
    fig.add_trace(
        go.Scatter(
            x=x,
            y=y1,
            mode='lines',
            name='Training',
            line=dict(color='#1a237e', width=2)
        ),
        row=2, col=1
    )
    
    # Add bar chart
    fig.add_trace(
        go.Bar(
            x=['CPU', 'Memory', 'GPU', 'Disk'],
            y=[65, 43, 78, 32],
            marker_color=['#1a237e', '#0d47a1', '#1565c0', '#1976d2']
        ),
        row=2, col=2
    )
    
    # Update layout
    fig.update_layout(
        height=600,
        showlegend=False,
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        margin=dict(t=30),
        font=dict(color='#ffffff')
    )
    
    return fig

def create_quick_actions():
    """Create modern quick action cards."""
    Section("Quick Actions")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if st.button("📤 Upload Data", use_container_width=True):
            st.session_state.selected_module = "📤 Data Upload"
            st.rerun()
    
    with col2:
        if st.button("🧹 Clean Data", use_container_width=True):
            st.session_state.selected_module = "🧹 Data Wrangling"
            st.rerun()
    
    with col3:
        if st.button("⚙️ Engineer Features", use_container_width=True):
            st.session_state.selected_module = "⚙ Lambda & Feature Engineering"
            st.rerun()
    
    with col4:
        if st.button("📊 Analyze Data", use_container_width=True):
            st.session_state.selected_module = "📊 Data Analysis & EDA"
            st.rerun()

def create_activity_timeline():
    """Create a modern activity timeline."""
    if not st.session_state.activity_log:
        return
    
    Section("Recent Activity")
    
    activities = [
        {
            "Time": activity['timestamp'],
            "Activity": f"{activity['type']}: {activity['message']}"
        }
        for activity in st.session_state.activity_log[-5:]  # Show last 5 activities
    ]
    
    DataGrid(activities, ["Time", "Activity"])

def home_page():
    """Modern home page with advanced UI components."""
    ModuleHeader(
        "Advanced Data Wrangling & Analysis",
        "Welcome to your AI-powered data analysis workspace"
    )
    
    # Create quick actions for common tasks
    create_quick_actions()
    
    # Custom Workflow Manager
    custom_workflow_manager()
    
    # Activity Timeline
    create_activity_timeline()
    
    # Stats Cards
    create_stats_cards()
    
    # ML Metrics Dashboard
    if st.session_state.get('show_ml_metrics', False):
        fig = create_ml_metrics_dashboard()
        st.plotly_chart(fig, use_container_width=True)
    
    # Modern Metrics Dashboard
    fig = create_modern_metrics_dashboard()
    st.plotly_chart(fig, use_container_width=True)
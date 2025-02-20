import streamlit as st
import pandas as pd

# Configure Streamlit page - MUST BE FIRST STREAMLIT COMMAND
st.set_page_config(
    page_title="Data Whisperer",
    page_icon="🌟",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Standard library imports
import os
from pathlib import Path
import sys
from dotenv import load_dotenv

# Add the DW_app directory to Python path for module imports
app_dir = Path(__file__).parent
if str(app_dir) not in sys.path:
    sys.path.append(str(app_dir))

# After page config, we can import our components
from components.ui_components import *

# Load environment variables early
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize session state variables
if "current_module" not in st.session_state:
    st.session_state.current_module = "🏠 Home"
if "progress" not in st.session_state:
    st.session_state.progress = set()
if "activity_log" not in st.session_state:
    st.session_state.activity_log = []
if "error_log" not in st.session_state:
    st.session_state.error_log = []

# Load custom CSS
def load_css():
    """Load custom CSS styles."""
    css_path = Path(__file__).parent / "assets" / "style.css"
    if css_path.exists():
        with open(css_path) as f:
            st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
    else:
        st.error("CSS file not found. Please ensure assets/style.css exists.")
        
    # Add additional custom styles for the sidebar
    st.markdown("""
        <style>
            section[data-testid="stSidebar"] {
                background-color: rgba(20, 24, 50, 0.8);
                backdrop-filter: blur(10px);
                padding: 1rem;
            }
            section[data-testid="stSidebar"] > div {
                padding: 1rem;
                border-radius: 12px;
            }
            .sidebar-content {
                background: rgba(255, 255, 255, 0.05);
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
            }
        </style>
    """, unsafe_allow_html=True)

# Import modules
try:
    from modules.home_page import home_page
    from modules.data_upload import data_upload_page
    from modules.data_integration import data_integration_page
    from modules.data_wrangling import data_wrangling_page
    from modules.data_binning import data_binning_page
    from modules.lambda_feature_engineering import lambda_feature_engineering_page
    from modules.data_analysis import data_analysis_page
    from modules.feature_importance import feature_importance_page
    from modules.visualizations import visualizations_page
    from modules.ai_insights import ai_insights_page
    from modules.classification import classification_page
    from modules.data_export import data_export_page
    from modules.final_report import final_report_page
except ImportError as e:
    st.error(f"Error importing modules: {str(e)}")
    st.info("Please ensure all required modules are in the correct directory structure.")
    st.stop()

# Module mapping
MODULES = {
    "🏠 Home": home_page,
    "📤 Data Upload": data_upload_page,
    "🔗 Data Integration": data_integration_page,
    "🧹 Data Wrangling": data_wrangling_page,
    "🛠 Data Binning": data_binning_page,
    "⚙ Lambda & Feature Engineering": lambda_feature_engineering_page,
    "📊 Data Analysis & EDA": data_analysis_page,
    "📊 Feature Importance": feature_importance_page,
    "📈 Visualizations": visualizations_page,
    "🤖 AI Insights & Data Chat": ai_insights_page,
    "📉 Binary Classification & Resampling": classification_page,
    "📥 Data Export": data_export_page,
    "📝 Final Report": final_report_page
}

# Build sidebar before dispatching modules
def build_sidebar():
    with st.sidebar:
        # Logo and Title
        if os.path.exists("DW_app/assets/logo.png"):
            st.image("DW_app/assets/logo.png", width=50)
        st.markdown("### Data Whisperer")
        st.markdown("---")
        
        # Data Management Section
        st.markdown("#### 📊 Data Management")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🏠 Home", use_container_width=True):
                st.session_state.current_module = "🏠 Home"
            if st.button("📤 Upload", use_container_width=True):
                st.session_state.current_module = "📤 Data Upload"
        with col2:
            if st.button("🔗 Integration", use_container_width=True):
                st.session_state.current_module = "🔗 Data Integration"
            if st.button("🧹 Wrangling", use_container_width=True):
                st.session_state.current_module = "🧹 Data Wrangling"
        
        st.markdown("---")
        # Analysis Tools Section
        st.markdown("#### 🔍 Analysis Tools")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("📈 Visualize", use_container_width=True):
                st.session_state.current_module = "📈 Visualizations"
            if st.button("🤖 AI Analysis", use_container_width=True):
                st.session_state.current_module = "🤖 AI Insights & Data Chat"
        with col2:
            if st.button("📊 Feature Importance", use_container_width=True):
                st.session_state.current_module = "📊 Feature Importance"
            if st.button("📉 Classification", use_container_width=True):
                st.session_state.current_module = "📉 Binary Classification & Resampling"
        
        st.markdown("---")
        # Advanced Tools Section
        st.markdown("#### 🛠️ Advanced Tools")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("⚙️ Feature Eng.", use_container_width=True):
                st.session_state.current_module = "⚙ Lambda & Feature Engineering"
            if st.button("🛠 Data Binning", use_container_width=True):
                st.session_state.current_module = "🛠 Data Binning"
        with col2:
            if st.button("📥 Export", use_container_width=True):
                st.session_state.current_module = "📥 Data Export"
            if st.button("📝 Report", use_container_width=True):
                st.session_state.current_module = "📝 Final Report"
        
        # Status Section
        st.markdown("---")
        st.markdown("##### 📌 Status")
        if "current_dataset" in st.session_state:
            st.info(f"Active Dataset: {st.session_state.current_dataset}")
        
        # Version info
        st.caption("Version 1.0.0")
        
        # Show workflow progress
        if 'progress' in st.session_state:
            Section(
                "Workflow Progress",
                "Track your data processing pipeline progress"
            )
            progress_data = [
                {"Step": step, "Status": "✅"} for step in st.session_state.progress
            ]
            if progress_data:
                DataGrid(progress_data, ["Step", "Status"])
        
        # Show recent activity
        if 'activity_log' in st.session_state and st.session_state.activity_log:
            Section(
                "Recent Activity",
                "Latest actions and updates in your workflow"
            )
            activities = st.session_state.activity_log[-3:]  # Show last 3 activities
            activity_data = [
                {
                    "Time": activity['timestamp'],
                    "Activity": activity['message']
                }
                for activity in activities
            ]
            DataGrid(activity_data, ["Time", "Activity"])
        
        return MODULES.get(st.session_state.current_module, home_page)

def main():
    """Main application logic"""
    # Load CSS
    load_css()
    
    # Build sidebar and get selected module
    module_func = build_sidebar()
    
    # Run selected module
    module_func()

if __name__ == "__main__":
    main() 
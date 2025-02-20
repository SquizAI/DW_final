import streamlit as st
from datetime import datetime
from components.ui_components import Card, StatusMessage, DataGrid, Section

def build_sidebar():
    """Build the enhanced sidebar with modern navigation and workflow management"""
    with st.sidebar:
        # Module Selector: this always appears at the top
        st.session_state.selected_module = st.selectbox(
            "Select Module",
            [
                "🏠 Home",
                "📤 Data Upload",
                "🔗 Data Integration",
                "🧹 Data Wrangling",
                "🛠 Data Binning",
                "⚙ Lambda & Feature Engineering",
                "📊 Data Analysis & EDA",
                "📊 Feature Importance",
                "📈 Visualizations",
                "🤖 AI Insights & Data Chat",
                "📉 Binary Classification & Resampling",
                "📥 Data Export",
                "📝 Final Report"
            ],
            key="module_selector"
        )
        
        st.markdown("---")
        
        # Workflow Stats
        completed = len(st.session_state.progress)
        total = 13  # Total number of modules
        progress_pct = (completed / total) * 100
        
        stats_data = [
            {
                "Metric": "Progress",
                "Value": f"{progress_pct:.1f}%"
            },
            {
                "Metric": "Steps Completed",
                "Value": f"{completed}/{total}"
            }
        ]
        
        Card("Workflow Progress", "Current Status")
        DataGrid(stats_data, ["Metric", "Value"])
        
        # Activity Monitor
        with st.expander("📊 Activity Monitor", expanded=False):
            if st.session_state.activity_log:
                activities = [
                    {
                        "Time": entry.get('timestamp', 'N/A'),
                        "Activity": entry.get('message', '')
                    }
                    for entry in reversed(st.session_state.activity_log[-3:])
                ]
                DataGrid(activities, ["Time", "Activity"])
            else:
                StatusMessage("No recent activity", "info")
        
        # Quick Actions
        with st.expander("⚡ Quick Actions", expanded=False):
            if st.button("📥 Load Sample Data"):
                st.session_state.selected_module = "📤 Data Upload"
                st.session_state.load_sample = True
                st.rerun()
            
            if st.button("🔄 Reset Progress"):
                st.session_state.progress = set()
                st.session_state.activity_log = []
                st.rerun()
        
        # Help & Resources
        with st.expander("❓ Help & Resources", expanded=False):
            resources = [
                {
                    "Resource": "Documentation",
                    "Link": "📚 View Docs"
                },
                {
                    "Resource": "Tutorials",
                    "Link": "🎓 View Tutorials"
                },
                {
                    "Resource": "Community",
                    "Link": "🤝 Join Community"
                }
            ]
            DataGrid(resources, ["Resource", "Link"])

    # File Manager
    with st.sidebar.expander("📁 File Manager"):
        files = [
            {
                "File": "app.py",
                "Description": "Main entry point"
            },
            {
                "File": "sidebar.py",
                "Description": "Sidebar components"
            },
            {
                "File": "utils.py",
                "Description": "Utility functions"
            },
            {
                "File": "modules/",
                "Description": "Module pages"
            },
            {
                "File": "requirements.txt",
                "Description": "Dependencies"
            }
        ]
        DataGrid(files, ["File", "Description"])

    # Dynamic Help & Documentation
    with st.sidebar.expander("❓ Help & Documentation"):
        search_query = st.text_input("Search Documentation", key="help_search")
        docs = {
            "Data Upload": "How to upload or load datasets.",
            "Data Integration": "Merge datasets efficiently.",
            "Data Wrangling": "Clean and preprocess your data.",
            "Feature Engineering": "AI-powered or manual transformations.",
            "AI Insights": "Ask questions and get analytics.",
            "Error Handling": "Review errors and logs.",
            "Export": "Export data and generate reports."
        }
        
        docs_data = [
            {
                "Topic": topic,
                "Description": desc
            }
            for topic, desc in docs.items()
            if search_query.lower() in topic.lower() or search_query == ""
        ]
        
        if docs_data:
            DataGrid(docs_data, ["Topic", "Description"])
        else:
            StatusMessage("No matching topics found.", "info")

    # User Feedback & Bug Reporting
    with st.sidebar.expander("✉️ Feedback & Bug Reporting"):
        feedback = st.text_area("Enter your feedback or bug report:", key="user_feedback")
        if st.button("Submit Feedback", key="submit_feedback"):
            StatusMessage("Thank you for your feedback!", "success")
            if 'feedback_log' not in st.session_state:
                st.session_state.feedback_log = []
            st.session_state.feedback_log.append(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - {feedback}") 
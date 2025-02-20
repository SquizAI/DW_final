import streamlit as st
from typing import List, Dict, Callable
from .ui_components import Card, Section, StatusMessage, Spacer, ProgressTracker, ModuleHeader

def create_progress_tracker():
    """Create a floating progress tracker that shows the user's progress through the pipeline."""
    workflow_steps = [
        ("Data Upload", "📤"),
        ("Data Integration", "🔗"),
        ("Data Wrangling", "🧹"),
        ("Feature Engineering", "⚙"),
        ("Analysis & EDA", "📊"),
        ("AI Insights", "🤖"),
        ("Classification", "📉"),
        ("Export & Report", "📥")
    ]
    
    current_step = 0
    for i, (step, _) in enumerate(workflow_steps):
        if step.lower() in st.session_state.progress:
            current_step = i + 1
    
    ProgressTracker(workflow_steps, current_step)
    Spacer(2)  # Add spacing after tracker

def create_ai_assistant():
    """Create a floating AI assistant button that expands into a chat interface."""
    with st.sidebar:
        if st.button("🤖 AI Assistant", help="Click to get AI help"):
            st.session_state.show_ai = not st.session_state.get('show_ai', False)
        
        if st.session_state.get('show_ai', False):
            with st.expander("AI Assistant", expanded=True):
                Card(
                    "AI Assistant Commands",
                    """
                    - `/analyze` - Analyze current dataset
                    - `/suggest` - Get feature engineering suggestions
                    - `/optimize` - Get model optimization tips
                    - `/explain` - Explain current results
                    - `/help` - List all available commands
                    """
                )
                
                user_input = st.text_input("Ask me anything...", key="ai_input")
                if user_input:
                    if user_input.startswith('/'):
                        handle_command(user_input)
                    else:
                        StatusMessage("How can I help you with your data analysis?", "info")

def handle_command(cmd: str):
    """Handle AI assistant commands."""
    commands = {
        '/analyze': lambda: analyze_current_data(),
        '/suggest': lambda: suggest_features(),
        '/optimize': lambda: optimize_model(),
        '/explain': lambda: explain_results(),
        '/help': lambda: show_help()
    }
    
    cmd = cmd.split()[0].lower()
    if cmd in commands:
        commands[cmd]()
    else:
        StatusMessage("Unknown command. Type /help to see available commands.", "error")

def analyze_current_data():
    if 'df' in st.session_state:
        StatusMessage("Analyzing your dataset...", "info")
        # Add your analysis logic here
    else:
        StatusMessage("Please upload a dataset first!", "warning")

def suggest_features():
    if 'df' in st.session_state:
        StatusMessage("Suggesting feature engineering steps...", "info")
        # Add your feature suggestion logic here
    else:
        StatusMessage("Please upload a dataset first!", "warning")

def optimize_model():
    if 'model' in st.session_state:
        StatusMessage("Suggesting optimization steps...", "info")
        # Add your model optimization logic here
    else:
        StatusMessage("Please train a model first!", "warning")

def explain_results():
    if 'results' in st.session_state:
        StatusMessage("Explaining your results...", "info")
        # Add your explanation logic here
    else:
        StatusMessage("No results to explain yet!", "warning")

def show_help():
    Card(
        "Available Commands",
        """
        - `/analyze` - Analyze current dataset
        - `/suggest` - Get feature engineering suggestions
        - `/optimize` - Get model optimization tips
        - `/explain` - Explain current results
        - `/help` - Show this help message
        """
    )

def create_layout(content_fn: Callable):
    """Main layout wrapper that includes progress tracker and AI assistant."""
    # Add progress tracker at the top
    create_progress_tracker()
    
    # Add AI assistant
    create_ai_assistant()
    
    # Main content
    content_fn()
    
    # Add any additional layout elements here
    with st.sidebar:
        st.markdown("---")
        Section("Quick Actions")
        if st.button("📊 View Dataset"):
            if 'df' in st.session_state:
                st.dataframe(st.session_state.df.head())
            else:
                StatusMessage("No dataset loaded", "warning")

def create_sidebar():
    """Create a modern sidebar with navigation and workflow management."""
    with st.sidebar:
        # App Title
        st.title("Data Wrangler Pro")
        
        # Module Selection
        Section("Navigation")
        modules = [
            "Home",
            "Data Upload",
            "Data Integration",
            "Data Wrangling",
            "Data Export",
            "Final Report"
        ]
        
        selected_module = st.selectbox(
            "Select Module",
            modules,
            index=modules.index(st.session_state.get('selected_module', 'Home'))
        )
        
        if selected_module != st.session_state.get('selected_module'):
            st.session_state.selected_module = selected_module
            st.experimental_rerun()
        
        # Workflow Progress
        if 'progress' in st.session_state:
            Section("Workflow Progress")
            progress_data = [
                {"Step": step, "Status": "✅"} for step in st.session_state.progress
            ]
            if progress_data:
                for item in progress_data:
                    StatusMessage(f"{item['Step']}: {item['Status']}", "success")
        
        # Activity Monitor
        if 'activity_log' in st.session_state and st.session_state.activity_log:
            Section("Recent Activity")
            for activity in st.session_state.activity_log[-3:]:
                StatusMessage(
                    f"{activity['timestamp']}: {activity['message']}",
                    activity['type']
                )
        
        # Help & Resources
        Section("Help & Resources")
        Card(
            "Documentation",
            "Access guides and tutorials to make the most of Data Wrangler Pro."
        )
        
        # Add spacing at the bottom
        Spacer()

def render_content():
    """Render the main content area"""
    with st.container():
        render_header()
        Spacer(2)  # 2rem spacing
        render_body()

def create_module_layout(title: str, description: str = None):
    """
    Creates a consistent layout for all modules.
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Header
            ModuleHeader(title, description)
            
            # Content container
            with st.container():
                # Module content
                result = func(*args, **kwargs)
                
                # Footer spacing
                Spacer(2)
                
                return result
        return wrapper
    return decorator

def render_error(message: str):
    """Render an error message with consistent styling."""
    StatusMessage(message, "error")

def render_success(message: str):
    """Render a success message with consistent styling."""
    StatusMessage(message, "success")

def render_warning(message: str):
    """Render a warning message with consistent styling."""
    StatusMessage(message, "warning")

def render_info(message: str):
    """Render an info message with consistent styling."""
    StatusMessage(message, "info")

def render_section(title: str, content: str):
    """Render a section with consistent styling."""
    Section(title, content)

def render_card(title: str, content: str, variant: str = "default"):
    """Render a card with consistent styling."""
    Card(title, content, variant) 
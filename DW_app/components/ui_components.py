import streamlit as st
from typing import List, Dict, Optional, Union

# First, let's define our global CSS styles
def _inject_custom_css():
    """Inject custom CSS for all components."""
    st.markdown("""
        <style>
            /* Global Styles */
            :root {
                --primary-color: #1a237e;
                --secondary-color: #0d47a1;
                --success-color: #2ecc71;
                --warning-color: #f39c12;
                --error-color: #e74c3c;
                --info-color: #3498db;
                --bg-primary: rgba(20, 24, 50, 0.4);
                --bg-secondary: rgba(30, 34, 60, 0.4);
                --border-radius: 12px;
                --text-primary: #ffffff;
                --text-secondary: #b2bac2;
            }

            /* Section Component */
            .dw-section {
                background: var(--bg-primary);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: var(--border-radius);
                padding: 1.5rem;
                margin: 1rem 0;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .dw-section:hover {
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
            }
            .dw-section-title {
                color: var(--text-primary);
                font-weight: 600;
                margin-bottom: 1rem;
                font-size: 1.25rem;
            }
            .dw-section-content {
                color: var(--text-secondary);
            }

            /* Card Component */
            .dw-card {
                background: var(--bg-secondary);
                border-radius: var(--border-radius);
                padding: 1.5rem;
                margin: 1rem 0;
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }
            .dw-card:hover {
                box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
                transform: translateY(-2px);
            }
            .dw-card-title {
                color: var(--text-primary);
                font-weight: 600;
                margin-bottom: 1rem;
            }
            .dw-card-content {
                color: var(--text-secondary);
            }

            /* Status Message Component */
            .dw-status {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem;
                margin: 1rem 0;
                border-radius: var(--border-radius);
                background: var(--bg-secondary);
                border: 1px solid rgba(255,255,255,0.1);
            }
            .dw-status-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
            .dw-status-message {
                color: var(--text-secondary);
            }

            /* DataGrid Component */
            .dw-grid {
                background: var(--bg-secondary);
                border-radius: var(--border-radius);
                padding: 1rem;
                margin: 1rem 0;
                overflow-x: auto;
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .dw-grid-header {
                display: grid;
                gap: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: var(--text-primary);
            }
            .dw-grid-row {
                display: grid;
                gap: 1rem;
                padding: 0.75rem 0;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                transition: background-color 0.2s ease;
            }
            .dw-grid-row:hover {
                background: rgba(255,255,255,0.05);
            }
            .dw-grid-cell {
                color: var(--text-secondary);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            /* Animation Keyframes */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Sidebar Styling */
            section[data-testid="stSidebar"] {
                background-color: var(--bg-primary);
                backdrop-filter: blur(10px);
            }
            section[data-testid="stSidebar"] > div {
                background-color: transparent;
            }
            .sidebar-content {
                background: rgba(255, 255, 255, 0.05);
                padding: 1rem;
                border-radius: var(--border-radius);
                margin-bottom: 1rem;
            }

            /* AI Assistant Button */
            .dw-ai-assistant-button {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 60px;
                height: 60px;
                border-radius: 30px;
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: var(--shadow-lg);
                transition: all 0.3s ease;
                z-index: 1000;
            }
            
            .dw-ai-assistant-button:hover {
                transform: scale(1.1);
            }
            
            .dw-ai-assistant-icon {
                font-size: 24px;
                color: white;
            }
            
            .dw-ai-assistant-tooltip {
                position: absolute;
                right: 70px;
                background: var(--bg-secondary);
                padding: 0.5rem 1rem;
                border-radius: var(--border-radius);
                color: var(--text-primary);
                font-size: 0.875rem;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                white-space: nowrap;
            }
            
            .dw-ai-assistant-button:hover .dw-ai-assistant-tooltip {
                opacity: 1;
            }
            
            /* AI Chat Interface */
            .dw-ai-chat-container {
                position: fixed;
                bottom: 6rem;
                right: 2rem;
                width: 400px;
                height: 600px;
                background: var(--bg-primary);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                display: flex;
                flex-direction: column;
                z-index: 999;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .dw-ai-chat-header {
                padding: 1rem;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .dw-ai-chat-title {
                color: var(--text-primary);
                font-weight: 600;
            }
            
            .dw-ai-chat-close {
                cursor: pointer;
                color: var(--text-secondary);
                font-size: 1.5rem;
            }
            
            .dw-ai-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .dw-ai-chat-message {
                display: flex;
                gap: 0.75rem;
                max-width: 80%;
            }
            
            .dw-ai-chat-message.user {
                align-self: flex-end;
                flex-direction: row-reverse;
            }
            
            .dw-ai-chat-avatar {
                width: 32px;
                height: 32px;
                border-radius: 16px;
                background: var(--bg-secondary);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
            }
            
            .dw-ai-chat-content {
                background: var(--bg-secondary);
                padding: 0.75rem 1rem;
                border-radius: var(--border-radius);
                color: var(--text-primary);
            }
            
            .dw-ai-chat-message.user .dw-ai-chat-content {
                background: var(--primary-color);
            }
            
            .dw-ai-chat-input {
                padding: 1rem;
                border-top: 1px solid rgba(255,255,255,0.1);
                display: flex;
                gap: 0.5rem;
            }
            
            .dw-ai-chat-input input {
                flex: 1;
                background: var(--bg-secondary);
                border: none;
                padding: 0.75rem 1rem;
                border-radius: var(--border-radius);
                color: var(--text-primary);
            }
            
            .dw-ai-chat-input button {
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: var(--border-radius);
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .dw-ai-chat-input button:hover {
                background: var(--secondary-color);
            }
            
            /* AI Magic Button */
            .dw-ai-magic-button {
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: var(--border-radius);
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
                font-weight: 500;
            }
            
            .dw-ai-magic-button:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }
            
            .dw-ai-magic-button .icon {
                font-size: 1.25rem;
            }
        </style>
    """, unsafe_allow_html=True)

# Call this at the start of each component that needs the CSS
_inject_custom_css()

def Card(title: str, content: str, variant: str = "default"):
    """
    Renders a modern card component with title and content.
    Variants: default, glass, success, warning, error, info
    """
    html = f"""
    <div class="dw-component dw-card dw-card-{variant}">
        <div class="dw-card-title">{title}</div>
        <div class="dw-card-content">{content}</div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)

def Section(title: str, content: str = ""):
    """
    Renders a section with title and content.
    If no content is provided, only the title will be shown.
    """
    html = f"""
    <div class="dw-component dw-section">
        <div class="dw-section-title">{title}</div>
        {f'<div class="dw-section-content">{content}</div>' if content else ''}
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)

def StatusMessage(message: str, status: str = "info"):
    """
    Renders a status message with icon.
    Status: success, warning, error, info
    """
    icons = {
        "success": "✓",
        "warning": "⚠",
        "error": "✕",
        "info": "ℹ"
    }
    html = f"""
    <div class="dw-component dw-status dw-status-{status}">
        <div class="dw-status-icon">{icons[status]}</div>
        <div class="dw-status-message">{message}</div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)

def DataGrid(headers: list, rows: list):
    """
    Renders a data grid with headers and rows.
    Handles both list and dictionary inputs.
    """
    try:
        # Convert dictionary rows to list format if needed
        formatted_rows = []
        if rows and isinstance(rows[0], dict):
            formatted_rows = [[str(row.get(header, '')) for header in headers] for row in rows]
        else:
            formatted_rows = [[str(cell) for cell in row] for row in rows]

        # Calculate column widths based on content
        col_widths = []
        for i in range(len(headers)):
            # Get max width of header and all values in this column
            header_width = len(str(headers[i]))
            value_widths = [len(str(row[i])) if i < len(row) else 0 for row in formatted_rows]
            col_widths.append(max([header_width] + value_widths))
        
        # Create grid template with proportional widths
        total_width = sum(col_widths)
        if total_width == 0:
            # Fallback to equal widths if no content
            grid_template = f"grid-template-columns: repeat({len(headers)}, 1fr)"
        else:
            grid_template = f"grid-template-columns: {' '.join([f'{(w/total_width)*100}fr' for w in col_widths])}"

        html = f"""
        <div class="dw-component dw-grid">
            <div class="dw-grid-header" style="{grid_template}">
                {" ".join(f'<div class="dw-grid-cell">{str(header)}</div>' for header in headers)}
            </div>
            {"".join(f'''
                <div class="dw-grid-row" style="{grid_template}">
                    {" ".join(f'<div class="dw-grid-cell">{cell}</div>' for cell in row)}
                </div>
            ''' for row in formatted_rows)}
        </div>
        """
        
        # Add additional CSS for better grid display
        st.markdown("""
            <style>
                .dw-grid {
                    width: 100%;
                    overflow-x: auto;
                    background: var(--bg-secondary);
                    border-radius: var(--border-radius);
                    border: 1px solid rgba(255,255,255,0.1);
                    margin: 1rem 0;
                }
                .dw-grid-header, .dw-grid-row {
                    display: grid;
                    gap: 1rem;
                    padding: 0.75rem 1rem;
                    align-items: center;
                }
                .dw-grid-header {
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    background: rgba(0,0,0,0.2);
                }
                .dw-grid-cell {
                    padding: 0.5rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    min-width: 0;
                }
                .dw-grid-header .dw-grid-cell {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .dw-grid-row .dw-grid-cell {
                    color: var(--text-secondary);
                }
                .dw-grid-row:hover {
                    background: rgba(255,255,255,0.05);
                }
                .dw-grid-row:not(:last-child) {
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
            </style>
        """, unsafe_allow_html=True)
        
        st.markdown(html, unsafe_allow_html=True)
    except Exception as e:
        st.error(f"Error rendering data grid: {str(e)}")
        # Fallback to basic table display
        st.table(rows)

def ProgressTracker(steps: list, current_step: int):
    """
    Renders a progress tracker with steps.
    """
    progress_width = f"{(current_step / (len(steps) - 1)) * 100}%"
    html = f"""
    <div class="dw-component dw-progress-tracker">
        <div class="dw-progress-bar" style="width: {progress_width}"></div>
        <div class="dw-steps">
            {"".join(f'''
                <div class="dw-step {
                    'completed' if i < current_step else 
                    'current' if i == current_step else ''
                }">
                    <div class="dw-step-icon">{i + 1}</div>
                    <div class="dw-step-label">{step}</div>
                </div>
            ''' for i, step in enumerate(steps))}
        </div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)

def ChatMessage(role: str, content: str, avatar_url: str = None):
    """
    Renders a chat message with role and content.
    """
    avatar_style = f"background-image: url('{avatar_url}')" if avatar_url else ""
    html = f"""
    <div class="dw-component dw-chat-message">
        <div class="dw-chat-avatar" style="{avatar_style}"></div>
        <div class="dw-chat-content">
            <div class="dw-chat-role">{role}</div>
            <div class="dw-chat-text">{content}</div>
        </div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)

def ModuleHeader(title: str, description: str = None):
    """
    Renders a module header with title and optional description.
    """
    html = f"""
    <div class="dw-component dw-module-header">
        <div class="dw-module-title">{title}</div>
        {f'<div class="dw-module-description">{description}</div>' if description else ''}
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)

def Spacer(height: float = 1):
    """
    Adds vertical spacing between components.
    """
    st.markdown(f'<div style="margin-bottom: {height}rem;"></div>', unsafe_allow_html=True)

def AIAssistantButton(callback_key: str, tooltip: str = "Ask AI Assistant"):
    """Renders a floating AI Assistant button."""
    html = f"""
    <div class="dw-ai-assistant-button" onclick="document.dispatchEvent(new CustomEvent('aiButtonClick', {{detail: '{callback_key}'}})">
        <div class="dw-ai-assistant-icon">🤖</div>
        <div class="dw-ai-assistant-tooltip">{tooltip}</div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)

def AIChatInterface(messages: list = None):
    """Renders an AI chat interface with message history."""
    html = """
    <div class="dw-ai-chat-container">
        <div class="dw-ai-chat-header">
            <div class="dw-ai-chat-title">AI Assistant</div>
            <div class="dw-ai-chat-close">×</div>
        </div>
        <div class="dw-ai-chat-messages">
    """
    
    if messages:
        for msg in messages:
            role_class = "user" if msg["role"] == "user" else "assistant"
            html += f"""
            <div class="dw-ai-chat-message {role_class}">
                <div class="dw-ai-chat-avatar">{msg.get("avatar", "🤖" if role_class == "assistant" else "👤")}</div>
                <div class="dw-ai-chat-content">{msg["content"]}</div>
            </div>
            """
    
    html += """
        </div>
        <div class="dw-ai-chat-input">
            <input type="text" placeholder="Ask me anything..." />
            <button>Send</button>
        </div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)

def AIMagicButton(text: str, icon: str = "✨"):
    """Renders a magic AI action button."""
    html = f"""
    <button class="dw-ai-magic-button">
        <span class="icon">{icon}</span>
        <span>{text}</span>
    </button>
    """
    st.markdown(html, unsafe_allow_html=True) 
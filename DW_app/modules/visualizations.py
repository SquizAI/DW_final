import streamlit as st
import plotly.express as px
from components.ui_components import ModuleHeader, Section, Card, StatusMessage, DataGrid

def visualizations_page():
    ModuleHeader(
        "Visualizations",
        "Generate custom visualizations of your data."
    )
    
    if 'cleaned_df' not in st.session_state or st.session_state.cleaned_df is None:
        StatusMessage("No cleaned data available. Please run the Data Wrangling module first.", "error")
        return
    
    df = st.session_state.cleaned_df.copy()
    
    # Dataset Overview
    Section("Dataset Overview")
    
    overview_data = [
        {
            "Metric": "Rows",
            "Value": str(df.shape[0])
        },
        {
            "Metric": "Columns",
            "Value": str(df.shape[1])
        },
        {
            "Metric": "Numeric Columns",
            "Value": str(len(df.select_dtypes(include=['number']).columns))
        }
    ]
    
    Card("Dataset Statistics", "Current Dataset")
    DataGrid(overview_data, ["Metric", "Value"])
    
    # Visualization Configuration
    Section("Visualization Configuration")
    
    chart_type = st.selectbox(
        "Select Chart Type",
        ["Histogram", "Scatter", "Line"],
        help="Choose the type of visualization you want to create"
    )
    
    col_selection = st.multiselect(
        "Select Columns",
        options=df.columns.tolist(),
        default=df.columns.tolist(),
        help="Select the columns to include in your visualization"
    )
    
    if st.button("Generate Visualization"):
        try:
            Section("Generated Visualization")
            
            if chart_type == "Histogram":
                if not col_selection:
                    StatusMessage("Please select at least one column for the histogram.", "warning")
                    return
                    
                fig = px.histogram(
                    df,
                    x=col_selection[0],
                    title=f"Histogram of {col_selection[0]}",
                    template="plotly_dark"
                )
                
            elif chart_type == "Scatter":
                if len(col_selection) < 2:
                    StatusMessage("Select at least two columns for a scatter plot.", "warning")
                    return
                    
                fig = px.scatter(
                    df,
                    x=col_selection[0],
                    y=col_selection[1],
                    title=f"Scatter Plot: {col_selection[0]} vs {col_selection[1]}",
                    template="plotly_dark"
                )
                
            elif chart_type == "Line":
                if len(col_selection) < 2:
                    StatusMessage("Select at least two columns for a line plot.", "warning")
                    return
                    
                fig = px.line(
                    df,
                    x=col_selection[0],
                    y=col_selection[1],
                    title=f"Line Plot: {col_selection[0]} vs {col_selection[1]}",
                    template="plotly_dark"
                )
            
            # Update layout for dark theme compatibility
            fig.update_layout(
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
                font_color="#ffffff"
            )
            
            st.plotly_chart(fig, use_container_width=True)
            StatusMessage("Visualization generated successfully!", "success")
            
        except Exception as e:
            StatusMessage(f"Error generating visualization: {str(e)}", "error") 
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from components.ui_components import ModuleHeader, Section, Card, AIAssistantButton, AIChatInterface, AIMagicButton, StatusMessage
from modules.ai_handler import analyze_data, suggest_visualizations, clean_data, generate_insights, chat_with_data, predict_trends
import os

def generate_sample_data():
    # Generate sample car data
    np.random.seed(42)
    n_cars = 100
    years = np.random.randint(1970, 1983, n_cars)
    cars = pd.DataFrame({
        'Year': years,
        'Horsepower': np.random.normal(120, 40, n_cars),
        'Miles_per_Gallon': np.random.normal(20, 5, n_cars),
        'Weight_in_lbs': np.random.normal(3000, 500, n_cars),
        'Origin': np.random.choice(['USA', 'Europe', 'Japan'], n_cars),
        'Name': [f'Car_{i}' for i in range(n_cars)]
    })
    
    # Generate sample stock data
    dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
    n_days = len(dates)
    price = 100
    prices = []
    for _ in range(n_days):
        price *= (1 + np.random.normal(0, 0.02))
        prices.append(price)
    
    stocks = pd.DataFrame({
        'date': dates,
        'close': prices,
        'open': [p * (1 + np.random.normal(0, 0.01)) for p in prices],
        'high': [p * (1 + abs(np.random.normal(0, 0.02))) for p in prices],
        'low': [p * (1 - abs(np.random.normal(0, 0.02))) for p in prices]
    })
    
    # Generate sample weather data (reduced to 100 days for better visualization)
    dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
    n_days = len(dates)
    weather = pd.DataFrame({
        'date': dates,
        'temp_max': np.random.normal(70, 15, n_days) + 10 * np.sin(np.linspace(0, 2*np.pi, n_days)),
        'precipitation': np.random.exponential(0.1, n_days),
        'wind': np.random.normal(10, 5, n_days),
        'weather': np.random.choice(['sunny', 'cloudy', 'rainy', 'stormy'], n_days, 
                                  p=[0.4, 0.3, 0.2, 0.1])
    })
    
    return cars, stocks, weather

def handle_ai_action(action: str, df: pd.DataFrame = None):
    """Handle AI button actions and return appropriate response."""
    try:
        if df is None and "cleaned_df" in st.session_state:
            df = st.session_state.cleaned_df
        
        if df is None:
            StatusMessage("Please upload a dataset first!", "warning")
            return
        
        with st.spinner("AI is processing your request..."):
            if action == "auto_import":
                # Analyze data structure and suggest import settings
                insights = analyze_data(df)
                st.json(insights)
                StatusMessage("✨ Data structure analyzed successfully!", "success")
            
            elif action == "clean_data":
                # Get cleaning suggestions
                cleaning_suggestions = clean_data(df)
                st.markdown("### 🧹 Cleaning Suggestions")
                st.json(cleaning_suggestions)
                StatusMessage("✨ Cleaning suggestions generated!", "success")
            
            elif action == "generate_insights":
                # Generate data insights
                insights = generate_insights(df)
                st.markdown("### 💡 Generated Insights")
                st.json(insights)
                StatusMessage("✨ Insights generated successfully!", "success")
            
            elif action == "analyze_trends":
                # Analyze trends in the data
                if 'date' in df.columns or any('date' in col.lower() for col in df.columns):
                    date_col = next(col for col in df.columns if 'date' in col.lower())
                    trends = predict_trends(df, date_col)
                    st.markdown("### 📈 Trend Analysis")
                    st.json(trends)
                    StatusMessage("✨ Trends analyzed successfully!", "success")
                else:
                    StatusMessage("No date column found for trend analysis", "warning")
            
            elif action == "find_patterns":
                # Find patterns in the data
                patterns = analyze_data(df)
                st.markdown("### 🔍 Pattern Analysis")
                st.json(patterns)
                StatusMessage("✨ Patterns discovered!", "success")
            
            elif action == "predict_future":
                # Make predictions
                if 'date' in df.columns or any('date' in col.lower() for col in df.columns):
                    date_col = next(col for col in df.columns if 'date' in col.lower())
                    predictions = predict_trends(df, date_col)
                    st.markdown("### 🔮 Predictions")
                    st.json(predictions)
                    StatusMessage("✨ Predictions generated!", "success")
                else:
                    StatusMessage("No date column found for predictions", "warning")
            
            elif action == "suggest_viz":
                # Suggest visualizations
                suggestions = suggest_visualizations(df)
                st.markdown("### 📊 Visualization Suggestions")
                st.json(suggestions)
                StatusMessage("✨ Visualization suggestions ready!", "success")
            
            elif action == "explain_insights":
                # Generate explanatory insights
                explanations = generate_insights(df, focus="explanation")
                st.markdown("### 🔍 Explanatory Insights")
                st.json(explanations)
                StatusMessage("✨ Explanations generated!", "success")

    except Exception as e:
        StatusMessage(f"Error processing AI action: {str(e)}", "error")

def home_page():
    # Initialize session state for AI chat
    if "ai_chat_messages" not in st.session_state:
        st.session_state.ai_chat_messages = []
    if "show_ai_chat" not in st.session_state:
        st.session_state.show_ai_chat = False
    
    # Logo display with controlled size
    logo_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "logo.png")
    if os.path.exists(logo_path):
        col1, col2, col3 = st.columns([1,2,1])
        with col2:
            st.image(logo_path, width=200)
    
    # Dynamic Header
    st.markdown("""
        <div style='text-align: center; margin-bottom: 2rem;'>
            <h1 style='color: #ffffff; font-size: 2.5rem; margin-bottom: 1rem;'>
                Data Whisperer
            </h1>
            <p style='color: #b2bac2; font-size: 1.2rem;'>
                Transform Your Data Journey with AI-Powered Analytics
            </p>
        </div>
    """, unsafe_allow_html=True)
    
    # Interactive Feature Showcase with AI Magic
    tab1, tab2, tab3 = st.tabs(["🎯 Key Features", "📊 Advanced Analytics", "🤖 AI Capabilities"])
    
    with tab1:
        col1, col2, col3 = st.columns(3)
        with col1:
            Card("📊 Smart Data Import",
                 """
                 - Drag & drop upload
                 - Auto schema detection
                 - Quality assessment
                 - Format validation
                 """)
            if st.button("🔮 Auto-Import Data", key="auto_import"):
                handle_ai_action("auto_import")
        
        with col2:
            Card("🧮 Intelligent Wrangling",
                 """
                 - One-click cleaning
                 - Smart type conversion
                 - Duplicate detection
                 - Missing value handling
                 """)
            if st.button("🧹 Clean Data", key="clean_data"):
                handle_ai_action("clean_data")
        
        with col3:
            Card("🤖 AI-Powered Analysis",
                 """
                 - Auto insights
                 - Pattern detection
                 - Trend prediction
                 - NL queries
                 """)
            if st.button("💡 Generate Insights", key="generate_insights"):
                handle_ai_action("generate_insights")
    
    with tab2:
        # AI Controls for Analytics
        st.markdown("""
            <div style='display: flex; gap: 1rem; margin-bottom: 1rem;'>
                <div style='flex: 1;'>
                    <h4 style='color: #ffffff;'>AI-Powered Analytics</h4>
                    <p style='color: #b2bac2;'>Let AI help you discover insights in your data</p>
                </div>
            </div>
        """, unsafe_allow_html=True)
        
        col1, col2, col3 = st.columns([1,1,1])
        with col1:
            if st.button("📈 Analyze Trends", key="analyze_trends"):
                handle_ai_action("analyze_trends")
        with col2:
            if st.button("🔍 Find Patterns", key="find_patterns"):
                handle_ai_action("find_patterns")
        with col3:
            if st.button("🔮 Predict Future", key="predict_future"):
                handle_ai_action("predict_future")
        
        # Generate advanced sample visualizations
        col1, col2 = st.columns(2)
        
        with col1:
            # Create advanced time series with multiple components
            dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
            trend = np.linspace(0, 2, 100)
            seasonal = np.sin(np.linspace(0, 8*np.pi, 100)) * 0.5
            noise = np.random.normal(0, 0.1, 100)
            value = trend + seasonal + noise
            
            df_complex = pd.DataFrame({
                'Date': dates,
                'Trend': trend,
                'Seasonal': seasonal,
                'Noise': noise,
                'Value': value
            })
            
            fig1 = go.Figure()
            fig1.add_trace(go.Scatter(x=dates, y=value, name='Combined', line=dict(color='#3498db', width=2)))
            fig1.add_trace(go.Scatter(x=dates, y=trend, name='Trend', line=dict(color='#2ecc71', width=1, dash='dash')))
            fig1.add_trace(go.Scatter(x=dates, y=seasonal, name='Seasonal', line=dict(color='#e74c3c', width=1, dash='dot')))
            
            fig1.update_layout(
                title='Complex Time Series Decomposition',
                template='plotly_dark',
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                height=400
            )
            st.plotly_chart(fig1, use_container_width=True)
        
        with col2:
            # Create 3D scatter plot with clusters
            n_points = 200
            cluster1 = np.random.normal(0, 1, (n_points//2, 3))
            cluster2 = np.random.normal(3, 1, (n_points//2, 3))
            points = np.vstack([cluster1, cluster2])
            
            df_3d = pd.DataFrame(points, columns=['X', 'Y', 'Z'])
            df_3d['Cluster'] = ['A'] * (n_points//2) + ['B'] * (n_points//2)
            
            fig2 = go.Figure(data=[go.Scatter3d(
                x=df_3d['X'],
                y=df_3d['Y'],
                z=df_3d['Z'],
                mode='markers',
                marker=dict(
                    size=6,
                    color=df_3d['Cluster'].map({'A': '#3498db', 'B': '#e74c3c'}),
                    opacity=0.8
                ),
                text=df_3d['Cluster']
            )])
            
            fig2.update_layout(
                title='3D Cluster Analysis',
                template='plotly_dark',
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                height=400
            )
            st.plotly_chart(fig2, use_container_width=True)
        
        # Advanced heatmap
        df_correlation = pd.DataFrame(np.random.randn(8, 8), 
                                    columns=['Var' + str(i) for i in range(1, 9)])
        correlation_matrix = df_correlation.corr()
        
        fig3 = go.Figure(data=go.Heatmap(
            z=correlation_matrix,
            x=correlation_matrix.columns,
            y=correlation_matrix.columns,
            colorscale='RdBu',
            zmid=0
        ))
        
        fig3.update_layout(
            title='Feature Correlation Matrix',
            template='plotly_dark',
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            height=400
        )
        st.plotly_chart(fig3, use_container_width=True)
    
    with tab3:
        # AI Action Buttons
        st.markdown("### 🎯 Quick AI Actions")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🔍 Analyze Dataset", key="analyze_dataset"):
                handle_ai_action("analyze_data")
            if st.button("📊 Suggest Visualizations", key="suggest_viz"):
                handle_ai_action("suggest_viz")
        with col2:
            if st.button("💡 Explain Insights", key="explain_insights"):
                handle_ai_action("explain_insights")
            if st.button("🤖 Chat with Data", key="chat_data"):
                st.session_state.show_ai_chat = True
    
    # Floating AI Assistant Button
    if st.button("🤖 AI Assistant", key="ai_assistant"):
        st.session_state.show_ai_chat = not st.session_state.show_ai_chat
    
    # AI Chat Interface
    if st.session_state.show_ai_chat:
        st.markdown("### 💬 Chat with Your Data")
        user_input = st.text_input("Ask anything about your data...", key="chat_input")
        if user_input:
            if "cleaned_df" in st.session_state:
                with st.spinner("AI is thinking..."):
                    response = chat_with_data(st.session_state.cleaned_df, user_input)
                    st.session_state.ai_chat_messages.append({
                        "role": "user",
                        "content": user_input
                    })
                    st.session_state.ai_chat_messages.append({
                        "role": "assistant",
                        "content": response["response"]
                    })
            else:
                StatusMessage("Please upload a dataset first!", "warning")
    
    # Display chat history
    if st.session_state.ai_chat_messages:
        for msg in st.session_state.ai_chat_messages:
            with st.chat_message(msg["role"]):
                st.write(msg["content"])
    
    # Call-to-action with AI twist
    st.markdown("---")
    col1, col2, col3 = st.columns([1,2,1])
    with col2:
        st.markdown("""
            <div style='text-align: center;'>
                <h3 style='color: #ffffff;'>Ready to Transform Your Data?</h3>
                <p style='color: #b2bac2;'>Let AI guide you through your data journey</p>
            </div>
        """, unsafe_allow_html=True)
        if st.button("🚀 Start AI-Powered Analysis", use_container_width=True):
            st.session_state.current_module = "📤 Data Upload"
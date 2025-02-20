import streamlit as st
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import plotly.express as px
from components.ui_components import ModuleHeader, StatusMessage, Card, Section, DataGrid


def classification_page():
    ModuleHeader(
        "Binary Classification & Resampling",
        "Build and evaluate a binary classification model using a RandomForest classifier."
    )
    
    if st.session_state.get('cleaned_df') is None:
        StatusMessage("Please generate a cleaned dataset using the Data Wrangling module.", "warning")
        return
    
    df = st.session_state.cleaned_df.copy()

    Section("Model Setup")
    target = st.selectbox("Select the target (binary) column:", options=df.columns.tolist(), key="clf_target")
    features = st.multiselect("Select feature columns (default: all other columns):", 
                                options=[col for col in df.columns if col != target], 
                                default=[col for col in df.columns if col != target], 
                                key="clf_features")
    
    # Verify that target is binary
    if df[target].nunique() != 2:
        StatusMessage("The selected target is not binary. Please choose a binary target column.", "error")
        return

    if st.button("Train Classifier", key="train_classifier"):
        try:
            X = df[features].copy()
            y = df[target].copy()
            
            # Encode categorical features if needed
            for col in X.select_dtypes(include=['object', 'category']).columns:
                X[col] = X[col].astype('category').cat.codes
            y = y.astype('category').cat.codes
            
            # Train test split
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            
            # Calculate metrics
            metrics_data = [
                {
                    "Metric": "Accuracy",
                    "Value": f"{accuracy_score(y_test, preds):.2f}"
                },
                {
                    "Metric": "Precision",
                    "Value": f"{precision_score(y_test, preds):.2f}"
                },
                {
                    "Metric": "Recall",
                    "Value": f"{recall_score(y_test, preds):.2f}"
                },
                {
                    "Metric": "F1 Score",
                    "Value": f"{f1_score(y_test, preds):.2f}"
                }
            ]
            
            StatusMessage("Model trained successfully!", "success")
            
            # Display metrics
            Card("Model Performance", "Classification Metrics")
            DataGrid(metrics_data, ["Metric", "Value"])
            
            # Display confusion matrix
            cm = confusion_matrix(y_test, preds)
            cm_fig = px.imshow(cm, text_auto=True, title="Confusion Matrix")
            st.plotly_chart(cm_fig, use_container_width=True)
            
        except Exception as e:
            StatusMessage(f"Error training classifier: {e}", "error") 
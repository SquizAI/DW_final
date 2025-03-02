from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import openai
from app.config import settings

class AIVisualizationGenerator:
    def __init__(self):
        self.last_figures = []
        self.last_insights = {}

    async def generate_visualizations(
        self,
        df: pd.DataFrame,
        target_col: Optional[str] = None,
        task_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered visualizations for data insights.
        """
        try:
            # Get AI suggestions for visualizations
            viz_suggestions = await self._get_visualization_suggestions(df, target_col, task_type)
            
            figures = []
            insights = []

            for viz in viz_suggestions["visualizations"]:
                if viz["type"] == "distribution":
                    fig = self._create_distribution_plot(df, viz["columns"], viz["settings"])
                    figures.append({
                        "figure": fig,
                        "title": viz["title"],
                        "description": viz["description"]
                    })

                elif viz["type"] == "correlation":
                    fig = self._create_correlation_plot(df, viz["columns"], viz["settings"])
                    figures.append({
                        "figure": fig,
                        "title": viz["title"],
                        "description": viz["description"]
                    })

                elif viz["type"] == "feature_importance":
                    if target_col:
                        fig = self._create_feature_importance_plot(df, target_col, viz["settings"])
                        figures.append({
                            "figure": fig,
                            "title": viz["title"],
                            "description": viz["description"]
                        })

                elif viz["type"] == "scatter_matrix":
                    fig = self._create_scatter_matrix(df, viz["columns"], viz["settings"])
                    figures.append({
                        "figure": fig,
                        "title": viz["title"],
                        "description": viz["description"]
                    })

                elif viz["type"] == "time_series":
                    if "date_column" in viz:
                        fig = self._create_time_series_plot(df, viz["date_column"], viz["columns"], viz["settings"])
                        figures.append({
                            "figure": fig,
                            "title": viz["title"],
                            "description": viz["description"]
                        })

            # Get AI insights about the visualizations
            viz_insights = await self._get_visualization_insights(figures, df, target_col)
            
            self.last_figures = figures
            self.last_insights = viz_insights

            return {
                "figures": [fig["figure"].to_json() for fig in figures],
                "titles": [fig["title"] for fig in figures],
                "descriptions": [fig["description"] for fig in figures],
                "insights": viz_insights,
            }

        except Exception as e:
            print(f"Error in visualization generation: {e}")
            return {"error": str(e)}

    async def _get_visualization_suggestions(
        self,
        df: pd.DataFrame,
        target_col: Optional[str],
        task_type: Optional[str]
    ) -> Dict[str, Any]:
        """
        Get AI suggestions for which visualizations to create.
        """
        try:
            # Prepare context for AI
            context = {
                "columns": df.columns.tolist(),
                "dtypes": df.dtypes.astype(str).to_dict(),
                "numeric_columns": df.select_dtypes(include=[np.number]).columns.tolist(),
                "categorical_columns": df.select_dtypes(include=['object', 'category']).columns.tolist(),
                "target_column": target_col,
                "task_type": task_type,
                "n_samples": len(df),
            }

            prompt = f"""Suggest optimal data visualizations:
            {context}
            
            Consider:
            1. Data types and distributions
            2. Relationships between variables
            3. Target variable insights (if applicable)
            4. Temporal patterns (if applicable)
            5. Outliers and anomalies
            
            Format response as a JSON object with visualization specifications."""

            response = await openai.ChatCompletion.acreate(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a data visualization expert."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"Error in visualization suggestions: {e}")
            return self._get_default_visualizations(df, target_col)

    def _get_default_visualizations(
        self,
        df: pd.DataFrame,
        target_col: Optional[str]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Get default visualization specifications."""
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()

        visualizations = []

        # Distribution plots for numeric columns
        if numeric_cols:
            visualizations.append({
                "type": "distribution",
                "columns": numeric_cols[:5],  # Limit to first 5 columns
                "settings": {"type": "histogram"},
                "title": "Numeric Distributions",
                "description": "Distribution of numeric variables"
            })

        # Correlation plot for numeric columns
        if len(numeric_cols) > 1:
            visualizations.append({
                "type": "correlation",
                "columns": numeric_cols,
                "settings": {"colorscale": "RdBu"},
                "title": "Feature Correlations",
                "description": "Correlation matrix of numeric features"
            })

        # Feature importance if target column exists
        if target_col:
            visualizations.append({
                "type": "feature_importance",
                "settings": {"top_n": 10},
                "title": "Feature Importance",
                "description": "Importance of features for prediction"
            })

        return {"visualizations": visualizations}

    def _create_distribution_plot(
        self,
        df: pd.DataFrame,
        columns: List[str],
        settings: Dict[str, Any]
    ) -> go.Figure:
        """Create distribution plots."""
        fig = make_subplots(rows=len(columns), cols=1, subplot_titles=columns)
        
        for i, col in enumerate(columns, 1):
            if settings.get("type") == "histogram":
                fig.add_trace(
                    go.Histogram(x=df[col], name=col),
                    row=i, col=1
                )
            else:
                fig.add_trace(
                    go.Box(x=df[col], name=col),
                    row=i, col=1
                )

        fig.update_layout(height=300 * len(columns), showlegend=False)
        return fig

    def _create_correlation_plot(
        self,
        df: pd.DataFrame,
        columns: List[str],
        settings: Dict[str, Any]
    ) -> go.Figure:
        """Create correlation heatmap."""
        corr = df[columns].corr()
        
        fig = go.Figure(data=go.Heatmap(
            z=corr.values,
            x=corr.columns,
            y=corr.columns,
            colorscale=settings.get("colorscale", "RdBu"),
            zmin=-1,
            zmax=1
        ))
        
        fig.update_layout(
            height=600,
            width=800,
            title="Feature Correlations"
        )
        return fig

    def _create_feature_importance_plot(
        self,
        df: pd.DataFrame,
        target_col: str,
        settings: Dict[str, Any]
    ) -> go.Figure:
        """Create feature importance plot."""
        from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
        
        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        if df[target_col].dtype == 'object':
            model = RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            
        model.fit(X, y)
        importance = model.feature_importances_
        
        # Sort by importance
        idx = np.argsort(importance)
        top_n = settings.get("top_n", 10)
        
        fig = go.Figure(data=go.Bar(
            x=importance[idx[-top_n:]],
            y=X.columns[idx[-top_n:]],
            orientation='h'
        ))
        
        fig.update_layout(
            height=400,
            title="Feature Importance",
            xaxis_title="Importance Score",
            yaxis_title="Feature"
        )
        return fig

    def _create_scatter_matrix(
        self,
        df: pd.DataFrame,
        columns: List[str],
        settings: Dict[str, Any]
    ) -> go.Figure:
        """Create scatter matrix plot."""
        fig = px.scatter_matrix(
            df[columns],
            dimensions=columns,
            color=settings.get("color"),
            title="Feature Relationships"
        )
        
        fig.update_layout(
            height=800,
            width=800
        )
        return fig

    def _create_time_series_plot(
        self,
        df: pd.DataFrame,
        date_column: str,
        columns: List[str],
        settings: Dict[str, Any]
    ) -> go.Figure:
        """Create time series plot."""
        fig = go.Figure()
        
        for col in columns:
            fig.add_trace(go.Scatter(
                x=df[date_column],
                y=df[col],
                name=col,
                mode='lines+markers'
            ))
        
        fig.update_layout(
            height=400,
            title="Time Series Analysis",
            xaxis_title=date_column,
            yaxis_title="Value"
        )
        return fig

    async def _get_visualization_insights(
        self,
        figures: List[Dict[str, Any]],
        df: pd.DataFrame,
        target_col: Optional[str]
    ) -> Dict[str, Any]:
        """
        Get AI insights about the visualizations.
        """
        try:
            # Prepare visualization context
            context = {
                "visualizations": [
                    {
                        "type": fig.get("type"),
                        "title": fig.get("title"),
                        "description": fig.get("description"),
                    }
                    for fig in figures
                ],
                "data_summary": {
                    "n_samples": len(df),
                    "n_features": len(df.columns),
                    "target_column": target_col,
                },
            }

            prompt = f"""Analyze these data visualizations:
            {context}
            
            Provide insights about:
            1. Key patterns and trends
            2. Notable relationships
            3. Potential outliers or anomalies
            4. Important features
            5. Recommendations for further analysis
            
            Format response as a JSON object with detailed insights."""

            response = await openai.ChatCompletion.acreate(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a data visualization expert."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"Error in visualization insights: {e}")
            return {
                "patterns": [],
                "relationships": [],
                "anomalies": [],
                "recommendations": []
            } 
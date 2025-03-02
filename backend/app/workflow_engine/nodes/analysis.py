"""
Analysis Processor Module

This module defines the AnalysisProcessor class for handling data analysis operations
such as statistical analysis, correlation analysis, and machine learning.
"""

import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union
import json
from scipy import stats
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, precision_score, recall_score, f1_score

from ..node_processor import NodeProcessor
from ..exceptions import NodeExecutionError, DataValidationError
from ..data_manager import DataManager

logger = logging.getLogger(__name__)

class AnalysisProcessor(NodeProcessor):
    """
    Processor for analysis nodes.
    
    Handles various data analysis operations:
    - Statistical analysis
    - Correlation analysis
    - Principal Component Analysis (PCA)
    - Clustering
    - Regression analysis
    - Classification
    """
    
    def __init__(self, node_id: str, node_config: Dict[str, Any]):
        """
        Initialize the AnalysisProcessor.
        
        Args:
            node_id: The ID of the node
            node_config: Configuration for the node
        """
        super().__init__(node_id, node_config)
        
        # Extract analysis type from config
        self.analysis_type = node_config.get("analysis_type", "statistical")
        
        # Common options
        self.target_column = node_config.get("target_column", "")
        self.feature_columns = node_config.get("feature_columns", [])
        self.test_size = node_config.get("test_size", 0.2)
        self.random_state = node_config.get("random_state", 42)
        
    def execute(self, input_data: Dict[str, Any], data_manager: DataManager) -> Dict[str, Any]:
        """
        Execute the analysis node.
        
        Args:
            input_data: Dictionary of input data
            data_manager: DataManager instance for data handling
            
        Returns:
            Dictionary with analysis results
        """
        self.update_progress(10, "starting analysis")
        
        # Get input dataframe
        if "default" not in input_data:
            raise NodeExecutionError(
                message="No input data provided",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        df = input_data["default"]
        
        if not isinstance(df, pd.DataFrame):
            raise NodeExecutionError(
                message=f"Input data is not a DataFrame: {type(df).__name__}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        self.update_progress(20, "applying analysis")
        
        try:
            # Apply analysis based on type
            if self.analysis_type == "statistical":
                result = self._statistical_analysis(df)
            elif self.analysis_type == "correlation":
                result = self._correlation_analysis(df)
            elif self.analysis_type == "pca":
                result = self._pca_analysis(df)
            elif self.analysis_type == "clustering":
                result = self._clustering_analysis(df)
            elif self.analysis_type == "regression":
                result = self._regression_analysis(df)
            elif self.analysis_type == "classification":
                result = self._classification_analysis(df)
            else:
                raise NodeExecutionError(
                    message=f"Unsupported analysis type: {self.analysis_type}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
            
            self.update_progress(90, "analysis completed")
            
            return {
                "default": df,
                "result": result
            }
            
        except Exception as e:
            logger.exception(f"Error performing analysis in node {self.node_id}")
            raise NodeExecutionError(
                message=f"Error performing analysis: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _statistical_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Perform statistical analysis on the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with statistical analysis results
        """
        columns = self.node_config.get("columns", df.columns.tolist())
        
        # Filter to only include numeric columns if not specified
        if not columns:
            columns = df.select_dtypes(include=['number']).columns.tolist()
        
        result = {
            "analysis_type": "statistical",
            "columns_analyzed": columns,
            "statistics": {}
        }
        
        for column in columns:
            if column not in df.columns:
                continue
                
            # Skip non-numeric columns
            if not pd.api.types.is_numeric_dtype(df[column]):
                continue
                
            column_data = df[column].dropna()
            
            if len(column_data) == 0:
                continue
                
            result["statistics"][column] = {
                "count": len(column_data),
                "mean": float(column_data.mean()),
                "median": float(column_data.median()),
                "std": float(column_data.std()),
                "min": float(column_data.min()),
                "max": float(column_data.max()),
                "q1": float(column_data.quantile(0.25)),
                "q3": float(column_data.quantile(0.75)),
                "skewness": float(stats.skew(column_data)),
                "kurtosis": float(stats.kurtosis(column_data))
            }
        
        return result
    
    def _correlation_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Perform correlation analysis on the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with correlation analysis results
        """
        columns = self.node_config.get("columns", [])
        method = self.node_config.get("method", "pearson")
        
        # Filter to only include numeric columns if not specified
        if not columns:
            columns = df.select_dtypes(include=['number']).columns.tolist()
        else:
            # Filter out non-existent columns
            columns = [col for col in columns if col in df.columns]
        
        if len(columns) < 2:
            raise NodeExecutionError(
                message="At least two numeric columns are required for correlation analysis",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Calculate correlation matrix
        corr_matrix = df[columns].corr(method=method)
        
        # Convert to serializable format
        corr_data = []
        for i, col1 in enumerate(columns):
            for j, col2 in enumerate(columns):
                if i < j:  # Only include each pair once
                    corr_data.append({
                        "column1": col1,
                        "column2": col2,
                        "correlation": float(corr_matrix.loc[col1, col2])
                    })
        
        # Sort by absolute correlation value
        corr_data.sort(key=lambda x: abs(x["correlation"]), reverse=True)
        
        result = {
            "analysis_type": "correlation",
            "method": method,
            "columns_analyzed": columns,
            "correlations": corr_data
        }
        
        return result
    
    def _pca_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Perform Principal Component Analysis (PCA) on the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with PCA results
        """
        columns = self.node_config.get("columns", [])
        n_components = self.node_config.get("n_components", 2)
        
        # Filter to only include numeric columns if not specified
        if not columns:
            columns = df.select_dtypes(include=['number']).columns.tolist()
        else:
            # Filter out non-existent columns
            columns = [col for col in columns if col in df.columns]
        
        if len(columns) < 2:
            raise NodeExecutionError(
                message="At least two numeric columns are required for PCA",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Scale the data
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(df[columns])
        
        # Apply PCA
        pca = PCA(n_components=min(n_components, len(columns)))
        principal_components = pca.fit_transform(scaled_data)
        
        # Create DataFrame with principal components
        pc_df = pd.DataFrame(
            data=principal_components,
            columns=[f'PC{i+1}' for i in range(pca.n_components_)]
        )
        
        # Prepare result
        result = {
            "analysis_type": "pca",
            "n_components": pca.n_components_,
            "explained_variance_ratio": [float(x) for x in pca.explained_variance_ratio_],
            "cumulative_explained_variance": [float(sum(pca.explained_variance_ratio_[:i+1])) for i in range(pca.n_components_)],
            "feature_importance": {}
        }
        
        # Feature importance (loadings)
        for i, component in enumerate(pca.components_):
            loadings = dict(zip(columns, component))
            result["feature_importance"][f'PC{i+1}'] = {col: float(val) for col, val in loadings.items()}
        
        return result
    
    def _clustering_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Perform clustering analysis on the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with clustering results
        """
        columns = self.node_config.get("columns", [])
        n_clusters = self.node_config.get("n_clusters", 3)
        algorithm = self.node_config.get("algorithm", "kmeans")
        
        # Filter to only include numeric columns if not specified
        if not columns:
            columns = df.select_dtypes(include=['number']).columns.tolist()
        else:
            # Filter out non-existent columns
            columns = [col for col in columns if col in df.columns]
        
        if len(columns) < 1:
            raise NodeExecutionError(
                message="At least one numeric column is required for clustering",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Scale the data
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(df[columns])
        
        # Apply clustering
        if algorithm.lower() == "kmeans":
            model = KMeans(n_clusters=n_clusters, random_state=self.random_state)
            clusters = model.fit_predict(scaled_data)
            
            # Calculate cluster centers in original feature space
            cluster_centers = scaler.inverse_transform(model.cluster_centers_)
            
            # Calculate inertia (sum of squared distances to closest centroid)
            inertia = model.inertia_
            
            # Count samples in each cluster
            cluster_counts = np.bincount(clusters)
            
            result = {
                "analysis_type": "clustering",
                "algorithm": "kmeans",
                "n_clusters": n_clusters,
                "inertia": float(inertia),
                "cluster_counts": [int(count) for count in cluster_counts],
                "cluster_centers": {
                    f"cluster_{i}": {col: float(val) for col, val in zip(columns, center)}
                    for i, center in enumerate(cluster_centers)
                }
            }
            
            # Add cluster labels to the DataFrame
            df['cluster'] = clusters
            
        else:
            raise NodeExecutionError(
                message=f"Unsupported clustering algorithm: {algorithm}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        return result
    
    def _regression_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Perform regression analysis on the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with regression results
        """
        target_column = self.target_column
        feature_columns = self.feature_columns
        algorithm = self.node_config.get("algorithm", "linear")
        
        if not target_column or target_column not in df.columns:
            raise NodeExecutionError(
                message=f"Invalid target column: {target_column}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Filter to only include numeric columns if not specified
        if not feature_columns:
            feature_columns = df.select_dtypes(include=['number']).columns.tolist()
            # Remove target column from features if present
            if target_column in feature_columns:
                feature_columns.remove(target_column)
        else:
            # Filter out non-existent columns
            feature_columns = [col for col in feature_columns if col in df.columns]
        
        if len(feature_columns) < 1:
            raise NodeExecutionError(
                message="At least one numeric feature column is required for regression",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Prepare data
        X = df[feature_columns].dropna()
        y = df.loc[X.index, target_column]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=self.test_size, random_state=self.random_state
        )
        
        # Train model
        if algorithm.lower() == "linear":
            model = LinearRegression()
        elif algorithm.lower() == "random_forest":
            model = RandomForestRegressor(random_state=self.random_state)
        else:
            raise NodeExecutionError(
                message=f"Unsupported regression algorithm: {algorithm}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)
        
        # Calculate metrics
        train_mse = mean_squared_error(y_train, y_pred_train)
        test_mse = mean_squared_error(y_test, y_pred_test)
        train_r2 = r2_score(y_train, y_pred_train)
        test_r2 = r2_score(y_test, y_pred_test)
        
        # Prepare result
        result = {
            "analysis_type": "regression",
            "algorithm": algorithm,
            "target_column": target_column,
            "feature_columns": feature_columns,
            "metrics": {
                "train_mse": float(train_mse),
                "test_mse": float(test_mse),
                "train_r2": float(train_r2),
                "test_r2": float(test_r2)
            },
            "feature_importance": {}
        }
        
        # Add feature importance if available
        if hasattr(model, 'coef_'):
            result["feature_importance"] = {
                col: float(coef) for col, coef in zip(feature_columns, model.coef_)
            }
        elif hasattr(model, 'feature_importances_'):
            result["feature_importance"] = {
                col: float(imp) for col, imp in zip(feature_columns, model.feature_importances_)
            }
        
        return result
    
    def _classification_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Perform classification analysis on the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with classification results
        """
        target_column = self.target_column
        feature_columns = self.feature_columns
        algorithm = self.node_config.get("algorithm", "logistic")
        
        if not target_column or target_column not in df.columns:
            raise NodeExecutionError(
                message=f"Invalid target column: {target_column}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Filter to only include numeric columns if not specified
        if not feature_columns:
            feature_columns = df.select_dtypes(include=['number']).columns.tolist()
            # Remove target column from features if present
            if target_column in feature_columns:
                feature_columns.remove(target_column)
        else:
            # Filter out non-existent columns
            feature_columns = [col for col in feature_columns if col in df.columns]
        
        if len(feature_columns) < 1:
            raise NodeExecutionError(
                message="At least one numeric feature column is required for classification",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Prepare data
        X = df[feature_columns].dropna()
        y = df.loc[X.index, target_column]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=self.test_size, random_state=self.random_state
        )
        
        # Train model
        if algorithm.lower() == "logistic":
            model = LogisticRegression(random_state=self.random_state)
        elif algorithm.lower() == "random_forest":
            model = RandomForestClassifier(random_state=self.random_state)
        else:
            raise NodeExecutionError(
                message=f"Unsupported classification algorithm: {algorithm}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)
        
        # Calculate metrics
        train_accuracy = accuracy_score(y_train, y_pred_train)
        test_accuracy = accuracy_score(y_test, y_pred_test)
        
        # Calculate additional metrics if binary classification
        is_binary = len(np.unique(y)) == 2
        if is_binary:
            train_precision = precision_score(y_train, y_pred_train, average='binary')
            test_precision = precision_score(y_test, y_pred_test, average='binary')
            train_recall = recall_score(y_train, y_pred_train, average='binary')
            test_recall = recall_score(y_test, y_pred_test, average='binary')
            train_f1 = f1_score(y_train, y_pred_train, average='binary')
            test_f1 = f1_score(y_test, y_pred_test, average='binary')
        else:
            train_precision = precision_score(y_train, y_pred_train, average='weighted')
            test_precision = precision_score(y_test, y_pred_test, average='weighted')
            train_recall = recall_score(y_train, y_pred_train, average='weighted')
            test_recall = recall_score(y_test, y_pred_test, average='weighted')
            train_f1 = f1_score(y_train, y_pred_train, average='weighted')
            test_f1 = f1_score(y_test, y_pred_test, average='weighted')
        
        # Prepare result
        result = {
            "analysis_type": "classification",
            "algorithm": algorithm,
            "target_column": target_column,
            "feature_columns": feature_columns,
            "metrics": {
                "train_accuracy": float(train_accuracy),
                "test_accuracy": float(test_accuracy),
                "train_precision": float(train_precision),
                "test_precision": float(test_precision),
                "train_recall": float(train_recall),
                "test_recall": float(test_recall),
                "train_f1": float(train_f1),
                "test_f1": float(test_f1)
            },
            "feature_importance": {}
        }
        
        # Add feature importance if available
        if hasattr(model, 'coef_'):
            result["feature_importance"] = {
                col: float(coef) for col, coef in zip(feature_columns, model.coef_[0])
            }
        elif hasattr(model, 'feature_importances_'):
            result["feature_importance"] = {
                col: float(imp) for col, imp in zip(feature_columns, model.feature_importances_)
            }
        
        return result
    
    def get_required_inputs(self) -> List[str]:
        """
        Get the list of required input names for this node.
        
        Returns:
            List of required input names
        """
        return ["default"]
    
    def get_expected_outputs(self) -> List[str]:
        """
        Get the list of expected output names for this node.
        
        Returns:
            List of expected output names
        """
        return ["default", "result"]
    
    def validate_inputs(self, input_data: Dict[str, Any]) -> None:
        """
        Validate the input data for this node.
        
        Args:
            input_data: Dictionary of input data
            
        Raises:
            DataValidationError: If validation fails
        """
        super().validate_inputs(input_data)
        
        # Check that input data is a DataFrame
        if "default" in input_data and not isinstance(input_data["default"], pd.DataFrame):
            raise DataValidationError(
                message=f"Input data is not a DataFrame: {type(input_data['default']).__name__}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) 
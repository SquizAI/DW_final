# Machine Learning Nodes

Machine Learning nodes enable users to train, evaluate, and deploy predictive models. These nodes handle various machine learning tasks including classification, regression, clustering, and more.

## Available Machine Learning Nodes

### Binary Classifier

**Type ID**: `binaryClassifier`

**Description**: Trains and evaluates binary classification models.

**Frontend Component**: `BinaryClassifierNode.tsx`

**Backend Processor**: `BinaryClassifierProcessor.py`

**Inputs**:
- **Training Data**: Dataset for training the model
- **Validation Data**: Optional dataset for validation
- **Test Data**: Optional dataset for testing

**Configuration Options**:
- **Model Type**:
  - Logistic Regression
  - Random Forest
  - Gradient Boosting
  - Support Vector Machine
  - Neural Network
- **Target Column**: Column containing the binary target variable
- **Feature Columns**: Columns to use as features
- **Hyperparameters**: Model-specific hyperparameters
- **Training Options**:
  - Train/Test Split: Ratio for splitting data
  - Cross-Validation: K-fold cross-validation settings
  - Class Weights: Handling class imbalance
- **Evaluation Metrics**:
  - Accuracy
  - Precision
  - Recall
  - F1 Score
  - AUC-ROC

**Outputs**:
- **Trained Model**: The trained classification model
- **Predictions**: Predictions on test data
- **Evaluation Results**: Performance metrics
- **Feature Importance**: Importance scores for features
- **Confusion Matrix**: Matrix showing prediction results

**Example Configuration**:
```json
{
  "type": "binaryClassifier",
  "model": {
    "type": "randomForest",
    "hyperparameters": {
      "n_estimators": 100,
      "max_depth": 10,
      "min_samples_split": 2,
      "min_samples_leaf": 1,
      "bootstrap": true,
      "class_weight": "balanced"
    }
  },
  "data": {
    "targetColumn": "churn",
    "featureColumns": ["age", "tenure", "monthly_charges", "total_charges", "gender", "partner", "dependents"],
    "categoricalColumns": ["gender", "partner", "dependents"],
    "trainTestSplit": 0.2,
    "randomState": 42,
    "stratify": true
  },
  "training": {
    "crossValidation": {
      "enabled": true,
      "folds": 5,
      "stratified": true
    },
    "earlyStop": {
      "enabled": true,
      "patience": 5,
      "metric": "auc"
    }
  },
  "evaluation": {
    "metrics": ["accuracy", "precision", "recall", "f1", "auc"],
    "thresholdOptimization": {
      "enabled": true,
      "metric": "f1"
    }
  },
  "output": {
    "savePredictions": true,
    "saveFeatureImportance": true,
    "saveProbabilities": true,
    "generateReport": true
  }
}
```

### Multi-Class Classifier

**Type ID**: `multiClassClassifier`

**Description**: Trains and evaluates multi-class classification models.

**Frontend Component**: `MultiClassClassifierNode.tsx`

**Backend Processor**: `MultiClassClassifierProcessor.py`

**Inputs**:
- **Training Data**: Dataset for training the model
- **Validation Data**: Optional dataset for validation
- **Test Data**: Optional dataset for testing

**Configuration Options**:
- **Model Type**:
  - Random Forest
  - Gradient Boosting
  - Support Vector Machine
  - Neural Network
  - K-Nearest Neighbors
- **Target Column**: Column containing the multi-class target variable
- **Feature Columns**: Columns to use as features
- **Hyperparameters**: Model-specific hyperparameters
- **Training Options**:
  - Train/Test Split: Ratio for splitting data
  - Cross-Validation: K-fold cross-validation settings
  - Class Weights: Handling class imbalance
- **Evaluation Metrics**:
  - Accuracy
  - Precision (macro, micro, weighted)
  - Recall (macro, micro, weighted)
  - F1 Score (macro, micro, weighted)

**Outputs**:
- **Trained Model**: The trained classification model
- **Predictions**: Predictions on test data
- **Evaluation Results**: Performance metrics
- **Feature Importance**: Importance scores for features
- **Confusion Matrix**: Matrix showing prediction results

**Example Configuration**:
```json
{
  "type": "multiClassClassifier",
  "model": {
    "type": "gradientBoosting",
    "hyperparameters": {
      "n_estimators": 200,
      "learning_rate": 0.1,
      "max_depth": 5,
      "subsample": 0.8,
      "colsample_bytree": 0.8
    }
  },
  "data": {
    "targetColumn": "species",
    "featureColumns": ["sepal_length", "sepal_width", "petal_length", "petal_width"],
    "categoricalColumns": [],
    "trainTestSplit": 0.2,
    "randomState": 42,
    "stratify": true
  },
  "training": {
    "crossValidation": {
      "enabled": true,
      "folds": 5,
      "stratified": true
    },
    "earlyStop": {
      "enabled": true,
      "patience": 10,
      "metric": "accuracy"
    }
  },
  "evaluation": {
    "metrics": ["accuracy", "precision_macro", "recall_macro", "f1_macro"],
    "confusionMatrix": true
  },
  "output": {
    "savePredictions": true,
    "saveFeatureImportance": true,
    "saveProbabilities": true,
    "generateReport": true
  }
}
```

### Regression Model

**Type ID**: `regressionModel`

**Description**: Trains and evaluates regression models for predicting continuous values.

**Frontend Component**: `RegressionModelNode.tsx`

**Backend Processor**: `RegressionModelProcessor.py`

**Inputs**:
- **Training Data**: Dataset for training the model
- **Validation Data**: Optional dataset for validation
- **Test Data**: Optional dataset for testing

**Configuration Options**:
- **Model Type**:
  - Linear Regression
  - Ridge Regression
  - Lasso Regression
  - Elastic Net
  - Random Forest Regressor
  - Gradient Boosting Regressor
  - Support Vector Regressor
- **Target Column**: Column containing the continuous target variable
- **Feature Columns**: Columns to use as features
- **Hyperparameters**: Model-specific hyperparameters
- **Training Options**:
  - Train/Test Split: Ratio for splitting data
  - Cross-Validation: K-fold cross-validation settings
- **Evaluation Metrics**:
  - Mean Squared Error (MSE)
  - Root Mean Squared Error (RMSE)
  - Mean Absolute Error (MAE)
  - R-squared
  - Adjusted R-squared

**Outputs**:
- **Trained Model**: The trained regression model
- **Predictions**: Predictions on test data
- **Evaluation Results**: Performance metrics
- **Feature Importance**: Importance scores for features
- **Residual Analysis**: Analysis of prediction residuals

**Example Configuration**:
```json
{
  "type": "regressionModel",
  "model": {
    "type": "randomForestRegressor",
    "hyperparameters": {
      "n_estimators": 100,
      "max_depth": 15,
      "min_samples_split": 2,
      "min_samples_leaf": 1,
      "bootstrap": true
    }
  },
  "data": {
    "targetColumn": "price",
    "featureColumns": ["bedrooms", "bathrooms", "sqft_living", "sqft_lot", "floors", "waterfront", "view", "condition", "grade", "yr_built"],
    "categoricalColumns": ["waterfront", "view", "condition", "grade"],
    "trainTestSplit": 0.2,
    "randomState": 42
  },
  "training": {
    "crossValidation": {
      "enabled": true,
      "folds": 5
    },
    "earlyStop": {
      "enabled": true,
      "patience": 10,
      "metric": "rmse"
    }
  },
  "evaluation": {
    "metrics": ["mse", "rmse", "mae", "r2", "adjusted_r2"],
    "residualAnalysis": true
  },
  "output": {
    "savePredictions": true,
    "saveFeatureImportance": true,
    "generateReport": true
  }
}
```

### Clustering Model

**Type ID**: `clusteringModel`

**Description**: Performs unsupervised clustering to group similar data points.

**Frontend Component**: `ClusteringModelNode.tsx`

**Backend Processor**: `ClusteringModelProcessor.py`

**Inputs**:
- **Data**: Dataset to cluster

**Configuration Options**:
- **Algorithm**:
  - K-Means
  - DBSCAN
  - Hierarchical Clustering
  - Gaussian Mixture Model
  - OPTICS
- **Feature Columns**: Columns to use for clustering
- **Hyperparameters**: Algorithm-specific parameters
  - K-Means: Number of clusters, initialization method
  - DBSCAN: Epsilon, min_samples
  - Hierarchical: Linkage method, distance metric
- **Preprocessing**:
  - Scaling: Standardization or normalization
  - Dimensionality Reduction: PCA, t-SNE, UMAP
- **Evaluation Metrics**:
  - Silhouette Score
  - Davies-Bouldin Index
  - Calinski-Harabasz Index
  - Inertia (for K-Means)

**Outputs**:
- **Cluster Assignments**: Cluster labels for each data point
- **Cluster Centers**: Centers of each cluster (for applicable algorithms)
- **Evaluation Results**: Clustering quality metrics
- **Visualization Data**: Data for visualizing clusters

**Example Configuration**:
```json
{
  "type": "clusteringModel",
  "algorithm": {
    "type": "kMeans",
    "hyperparameters": {
      "n_clusters": 5,
      "init": "k-means++",
      "n_init": 10,
      "max_iter": 300,
      "random_state": 42
    }
  },
  "data": {
    "featureColumns": ["recency", "frequency", "monetary"],
    "categoricalColumns": []
  },
  "preprocessing": {
    "scaling": {
      "method": "standardization",
      "robustScaling": false
    },
    "dimensionalityReduction": {
      "enabled": false,
      "method": "pca",
      "n_components": 2
    }
  },
  "evaluation": {
    "metrics": ["silhouette", "davies_bouldin", "calinski_harabasz", "inertia"],
    "findOptimalClusters": {
      "enabled": true,
      "method": "elbow",
      "range": [2, 10],
      "metric": "inertia"
    }
  },
  "output": {
    "saveClusterAssignments": true,
    "saveClusterCenters": true,
    "generateVisualization": true,
    "generateReport": true
  }
}
```

### Time Series Forecaster

**Type ID**: `timeSeriesForecaster`

**Description**: Trains and evaluates time series forecasting models.

**Frontend Component**: `TimeSeriesForecasterNode.tsx`

**Backend Processor**: `TimeSeriesForecasterProcessor.py`

**Inputs**:
- **Time Series Data**: Dataset containing time series data

**Configuration Options**:
- **Model Type**:
  - ARIMA
  - SARIMA
  - Prophet
  - Exponential Smoothing
  - LSTM
  - XGBoost
- **Time Column**: Column containing timestamps
- **Target Column**: Column containing the values to forecast
- **Exogenous Variables**: Additional variables to include in the model
- **Time Features**:
  - Seasonality: Daily, weekly, monthly, yearly
  - Holidays: Include holiday effects
  - Trend: Linear, logistic, or custom
- **Forecast Horizon**: Number of periods to forecast
- **Training Options**:
  - Train/Test Split: Ratio or date for splitting data
  - Cross-Validation: Time series cross-validation settings
- **Evaluation Metrics**:
  - Mean Absolute Error (MAE)
  - Mean Squared Error (MSE)
  - Root Mean Squared Error (RMSE)
  - Mean Absolute Percentage Error (MAPE)

**Outputs**:
- **Trained Model**: The trained forecasting model
- **Forecasts**: Future predictions
- **Evaluation Results**: Performance metrics
- **Component Analysis**: Trend, seasonality, and residual components
- **Confidence Intervals**: Uncertainty bounds for forecasts

**Example Configuration**:
```json
{
  "type": "timeSeriesForecaster",
  "model": {
    "type": "prophet",
    "hyperparameters": {
      "growth": "linear",
      "changepoints": null,
      "n_changepoints": 25,
      "changepoint_prior_scale": 0.05,
      "seasonality_mode": "additive",
      "seasonality_prior_scale": 10.0
    }
  },
  "data": {
    "timeColumn": "date",
    "targetColumn": "sales",
    "exogenousVariables": ["price", "promotion", "holiday"],
    "frequency": "D"
  },
  "timeFeatures": {
    "seasonality": {
      "yearly": true,
      "weekly": true,
      "daily": false,
      "custom": []
    },
    "holidays": {
      "enabled": true,
      "country": "US",
      "customHolidays": []
    }
  },
  "forecast": {
    "horizon": 30,
    "confidenceInterval": 0.95
  },
  "training": {
    "trainTestSplit": {
      "method": "date",
      "value": "2023-01-01"
    },
    "crossValidation": {
      "enabled": true,
      "initialWindow": 365,
      "horizon": 30,
      "period": 30
    }
  },
  "evaluation": {
    "metrics": ["mae", "mse", "rmse", "mape"],
    "backtest": {
      "enabled": true,
      "periods": 3
    }
  },
  "output": {
    "saveForecasts": true,
    "saveComponents": true,
    "saveConfidenceIntervals": true,
    "generateReport": true
  }
}
```

### Anomaly Detector

**Type ID**: `anomalyDetector`

**Description**: Detects anomalies and outliers in data.

**Frontend Component**: `AnomalyDetectorNode.tsx`

**Backend Processor**: `AnomalyDetectorProcessor.py`

**Inputs**:
- **Data**: Dataset to analyze for anomalies

**Configuration Options**:
- **Algorithm**:
  - Statistical (Z-score, IQR)
  - Isolation Forest
  - One-Class SVM
  - Local Outlier Factor
  - DBSCAN
  - Autoencoder
- **Feature Columns**: Columns to use for anomaly detection
- **Hyperparameters**: Algorithm-specific parameters
- **Threshold**: Threshold for anomaly classification
- **Context**:
  - Time-based: Consider temporal patterns
  - Seasonal: Account for seasonality
  - Multivariate: Consider relationships between variables

**Outputs**:
- **Anomaly Scores**: Anomaly scores for each data point
- **Anomaly Labels**: Binary classification of normal vs. anomalous
- **Explanation**: Explanation of why points were flagged as anomalies
- **Visualization Data**: Data for visualizing anomalies

**Example Configuration**:
```json
{
  "type": "anomalyDetector",
  "algorithm": {
    "type": "isolationForest",
    "hyperparameters": {
      "n_estimators": 100,
      "contamination": "auto",
      "max_samples": "auto",
      "random_state": 42
    }
  },
  "data": {
    "featureColumns": ["cpu_usage", "memory_usage", "network_traffic", "disk_io"],
    "categoricalColumns": []
  },
  "preprocessing": {
    "scaling": {
      "method": "robust",
      "withMean": true,
      "withStd": true
    }
  },
  "detection": {
    "threshold": {
      "method": "auto",
      "value": null,
      "percentile": 99
    },
    "context": {
      "timeBased": {
        "enabled": true,
        "timeColumn": "timestamp",
        "windowSize": 24
      },
      "seasonal": {
        "enabled": false,
        "period": 24
      }
    }
  },
  "evaluation": {
    "metrics": ["precision", "recall", "f1"],
    "crossValidation": {
      "enabled": true,
      "folds": 5
    }
  },
  "output": {
    "saveAnomalyScores": true,
    "saveAnomalyLabels": true,
    "generateExplanation": true,
    "generateVisualization": true
  }
}
```

### Model Evaluator

**Type ID**: `modelEvaluator`

**Description**: Evaluates and compares multiple machine learning models.

**Frontend Component**: `ModelEvaluatorNode.tsx`

**Backend Processor**: `ModelEvaluatorProcessor.py`

**Inputs**:
- **Models**: Multiple trained models to evaluate
- **Test Data**: Dataset for evaluating models

**Configuration Options**:
- **Evaluation Metrics**: Metrics to use for evaluation
  - Classification: Accuracy, precision, recall, F1, AUC
  - Regression: MSE, RMSE, MAE, R-squared
- **Comparison Method**:
  - Cross-Validation
  - Hold-Out Validation
  - Bootstrap Validation
- **Statistical Tests**:
  - T-test
  - ANOVA
  - McNemar's Test
  - Wilcoxon Signed-Rank Test
- **Visualization**:
  - ROC Curves
  - Precision-Recall Curves
  - Learning Curves
  - Residual Plots

**Outputs**:
- **Evaluation Results**: Performance metrics for each model
- **Comparison Results**: Statistical comparison between models
- **Visualization Data**: Data for visualizing model performance
- **Recommendation**: Recommended model based on criteria

**Example Configuration**:
```json
{
  "type": "modelEvaluator",
  "evaluation": {
    "metrics": {
      "classification": ["accuracy", "precision", "recall", "f1", "auc"],
      "regression": ["mse", "rmse", "mae", "r2"]
    },
    "method": {
      "type": "crossValidation",
      "folds": 5,
      "stratified": true,
      "shuffle": true,
      "randomState": 42
    }
  },
  "comparison": {
    "statisticalTests": {
      "enabled": true,
      "tests": ["ttest", "wilcoxon"],
      "alpha": 0.05
    },
    "rankingCriteria": {
      "primary": "f1",
      "secondary": "auc"
    }
  },
  "visualization": {
    "enabled": true,
    "plots": ["roc", "precision_recall", "confusion_matrix", "learning_curve"],
    "format": "interactive"
  },
  "output": {
    "saveResults": true,
    "generateReport": true,
    "exportModels": true
  }
}
```

### Hyperparameter Tuner

**Type ID**: `hyperparameterTuner`

**Description**: Optimizes model hyperparameters to improve performance.

**Frontend Component**: `HyperparameterTunerNode.tsx`

**Backend Processor**: `HyperparameterTunerProcessor.py`

**Inputs**:
- **Base Model**: Model to optimize
- **Training Data**: Dataset for training and validation

**Configuration Options**:
- **Search Method**:
  - Grid Search
  - Random Search
  - Bayesian Optimization
  - Genetic Algorithm
  - Hyperband
- **Hyperparameter Space**: Range of values for each hyperparameter
- **Evaluation Metric**: Metric to optimize
- **Cross-Validation**: K-fold cross-validation settings
- **Resource Constraints**:
  - Max Iterations
  - Time Limit
  - Parallel Jobs

**Outputs**:
- **Optimized Model**: Model with best hyperparameters
- **Search Results**: Results of all hyperparameter combinations
- **Learning Curves**: Performance across iterations
- **Importance Analysis**: Importance of each hyperparameter

**Example Configuration**:
```json
{
  "type": "hyperparameterTuner",
  "baseModel": {
    "type": "randomForest",
    "task": "classification"
  },
  "search": {
    "method": "bayesianOptimization",
    "iterations": 50,
    "randomState": 42
  },
  "hyperparameterSpace": {
    "n_estimators": {
      "type": "integer",
      "min": 50,
      "max": 500,
      "step": 50
    },
    "max_depth": {
      "type": "integer",
      "min": 3,
      "max": 20,
      "step": 1
    },
    "min_samples_split": {
      "type": "integer",
      "min": 2,
      "max": 10,
      "step": 1
    },
    "min_samples_leaf": {
      "type": "integer",
      "min": 1,
      "max": 10,
      "step": 1
    },
    "max_features": {
      "type": "categorical",
      "values": ["sqrt", "log2", null]
    }
  },
  "evaluation": {
    "metric": "f1",
    "crossValidation": {
      "folds": 5,
      "stratified": true
    }
  },
  "resources": {
    "parallelJobs": 4,
    "timeLimit": 3600,
    "earlyStop": {
      "enabled": true,
      "patience": 10,
      "minDelta": 0.001
    }
  },
  "output": {
    "saveOptimizedModel": true,
    "saveSearchResults": true,
    "generateLearningCurves": true,
    "generateImportanceAnalysis": true
  }
}
```

## Best Practices

1. **Data Preparation**: Ensure data is properly cleaned, normalized, and balanced before training models
2. **Feature Selection**: Use feature importance and selection techniques to improve model performance
3. **Cross-Validation**: Always use cross-validation to get reliable performance estimates
4. **Hyperparameter Tuning**: Optimize hyperparameters to improve model performance
5. **Model Evaluation**: Use multiple metrics to evaluate models comprehensively
6. **Interpretability**: Consider model interpretability alongside performance
7. **Deployment Considerations**: Think about model size, inference time, and maintenance requirements

## Troubleshooting

### Common Issues

1. **Overfitting**:
   - Reduce model complexity
   - Use regularization
   - Increase training data
   - Implement early stopping

2. **Underfitting**:
   - Increase model complexity
   - Add more features
   - Reduce regularization
   - Try more powerful models

3. **Class Imbalance**:
   - Use class weights
   - Apply oversampling or undersampling
   - Use specialized algorithms
   - Choose appropriate evaluation metrics

4. **Performance Issues**:
   - Optimize feature engineering
   - Try different algorithms
   - Tune hyperparameters
   - Ensemble multiple models 
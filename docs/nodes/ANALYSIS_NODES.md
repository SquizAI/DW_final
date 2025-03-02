# Analysis Nodes

Analysis nodes are designed to extract insights and patterns from data. These nodes perform statistical analysis, exploratory data analysis, and other analytical techniques to help users understand their data better.

## Available Analysis Nodes

### EDA Analysis

**Type ID**: `edaAnalysis`

**Description**: Performs exploratory data analysis to understand the distribution, relationships, and patterns in the data.

**Frontend Component**: `EDAAnalysisNode.tsx`

**Backend Processor**: `EDAAnalysisProcessor.py`

**Inputs**:
- **Data**: The dataset to analyze

**Configuration Options**:
- **Analysis Types**:
  - Univariate Analysis: Distribution of individual variables
  - Bivariate Analysis: Relationships between pairs of variables
  - Multivariate Analysis: Relationships between multiple variables
- **Variable Selection**:
  - Include/Exclude specific variables
  - Variable types to analyze (numerical, categorical, datetime)
- **Visualization Options**:
  - Plot types (histograms, box plots, scatter plots, etc.)
  - Color schemes and styling
  - Plot dimensions and layout
- **Statistical Tests**:
  - Normality tests
  - Correlation tests
  - Hypothesis tests

**Outputs**:
- **Analysis Report**: Comprehensive report of the analysis
- **Visualizations**: Generated plots and charts
- **Statistics**: Statistical summaries and test results
- **Insights**: Automatically detected insights and patterns

**Example Configuration**:
```json
{
  "type": "edaAnalysis",
  "analysis": {
    "univariate": {
      "enabled": true,
      "numerical": {
        "plots": ["histogram", "boxplot", "violin"],
        "statistics": ["mean", "median", "std", "min", "max", "quantiles"]
      },
      "categorical": {
        "plots": ["bar", "pie"],
        "statistics": ["count", "frequency", "mode"]
      },
      "datetime": {
        "plots": ["line", "calendar_heatmap"],
        "resample": "monthly"
      }
    },
    "bivariate": {
      "enabled": true,
      "numerical_vs_numerical": {
        "plots": ["scatter", "hexbin", "contour"],
        "statistics": ["correlation", "covariance"]
      },
      "numerical_vs_categorical": {
        "plots": ["boxplot", "violin", "swarm"],
        "statistics": ["anova", "kruskal"]
      },
      "categorical_vs_categorical": {
        "plots": ["heatmap", "mosaic"],
        "statistics": ["chi_square", "cramer_v"]
      }
    },
    "multivariate": {
      "enabled": true,
      "plots": ["pairplot", "parallel_coordinates", "andrews_curves"],
      "dimensionality_reduction": {
        "method": "pca",
        "components": 2
      }
    }
  },
  "variables": {
    "include": ["*"],
    "exclude": ["id", "created_at"],
    "types": {
      "numerical": true,
      "categorical": true,
      "datetime": true,
      "text": false
    }
  },
  "visualization": {
    "theme": "seaborn",
    "colormap": "viridis",
    "dimensions": {
      "width": 800,
      "height": 600
    },
    "export": {
      "formats": ["png", "svg", "html"],
      "dpi": 300
    }
  },
  "insights": {
    "enabled": true,
    "significance_threshold": 0.05,
    "max_insights": 10
  }
}
```

### Statistical Analysis

**Type ID**: `statisticalAnalysis`

**Description**: Performs statistical tests and analyses to validate hypotheses and identify significant patterns.

**Frontend Component**: `StatisticalAnalysisNode.tsx`

**Backend Processor**: `StatisticalAnalysisProcessor.py`

**Inputs**:
- **Data**: The dataset to analyze

**Configuration Options**:
- **Test Types**:
  - Parametric Tests: t-tests, ANOVA, etc.
  - Non-parametric Tests: Mann-Whitney U, Kruskal-Wallis, etc.
  - Correlation Tests: Pearson, Spearman, etc.
  - Distribution Tests: Shapiro-Wilk, Kolmogorov-Smirnov, etc.
- **Test Parameters**:
  - Significance Level (alpha)
  - Confidence Interval
  - Tail Type (one-tailed, two-tailed)
- **Multiple Testing Correction**:
  - Bonferroni, Holm, Benjamini-Hochberg, etc.

**Outputs**:
- **Test Results**: Results of the statistical tests
- **P-values**: P-values for each test
- **Effect Sizes**: Effect sizes for each test
- **Visualizations**: Visual representations of the results

**Example Configuration**:
```json
{
  "type": "statisticalAnalysis",
  "tests": {
    "parametric": {
      "t_test": {
        "enabled": true,
        "variables": [
          {
            "group1": {
              "column": "treatment_group",
              "value": "A"
            },
            "group2": {
              "column": "treatment_group",
              "value": "B"
            },
            "measure": "response"
          }
        ],
        "paired": false,
        "equal_variance": false
      },
      "anova": {
        "enabled": true,
        "dependent": "score",
        "factors": ["group", "gender"]
      }
    },
    "nonparametric": {
      "mann_whitney": {
        "enabled": true,
        "variables": [
          {
            "group1": {
              "column": "treatment_group",
              "value": "A"
            },
            "group2": {
              "column": "treatment_group",
              "value": "B"
            },
            "measure": "response"
          }
        ]
      },
      "kruskal_wallis": {
        "enabled": true,
        "dependent": "score",
        "factor": "group"
      }
    },
    "correlation": {
      "pearson": {
        "enabled": true,
        "variables": [["age", "income"], ["height", "weight"]]
      },
      "spearman": {
        "enabled": true,
        "variables": [["rank", "score"], ["experience", "salary"]]
      }
    },
    "distribution": {
      "shapiro_wilk": {
        "enabled": true,
        "variables": ["age", "income", "score"]
      },
      "ks_test": {
        "enabled": true,
        "variables": ["age", "income", "score"],
        "distribution": "normal"
      }
    }
  },
  "parameters": {
    "alpha": 0.05,
    "confidence_interval": 0.95,
    "tail": "two-tailed"
  },
  "multiple_testing": {
    "correction": "benjamini_hochberg"
  },
  "visualization": {
    "enabled": true,
    "plots": ["forest", "volcano", "manhattan"]
  }
}
```

### Correlation Analysis

**Type ID**: `correlationAnalysis`

**Description**: Analyzes correlations between variables to identify relationships and dependencies.

**Frontend Component**: `CorrelationAnalysisNode.tsx`

**Backend Processor**: `CorrelationAnalysisProcessor.py`

**Inputs**:
- **Data**: The dataset to analyze

**Configuration Options**:
- **Correlation Methods**:
  - Pearson: Linear correlation
  - Spearman: Rank correlation
  - Kendall: Ordinal correlation
  - Distance: Distance correlation
- **Variable Selection**:
  - Include/Exclude specific variables
  - Variable types to analyze
- **Visualization Options**:
  - Heatmap settings
  - Network graph settings
  - Threshold for visualization

**Outputs**:
- **Correlation Matrix**: Matrix of correlation coefficients
- **P-values**: Matrix of p-values for correlation tests
- **Visualizations**: Heatmaps, network graphs, etc.
- **Top Correlations**: List of strongest correlations

**Example Configuration**:
```json
{
  "type": "correlationAnalysis",
  "correlation": {
    "methods": {
      "pearson": {
        "enabled": true
      },
      "spearman": {
        "enabled": true
      },
      "kendall": {
        "enabled": false
      },
      "distance": {
        "enabled": false
      }
    },
    "pairwise": true,
    "min_periods": 30
  },
  "variables": {
    "include": ["*"],
    "exclude": ["id", "name", "date"],
    "types": {
      "numerical": true,
      "categorical": false,
      "datetime": false
    }
  },
  "visualization": {
    "heatmap": {
      "enabled": true,
      "colormap": "RdBu_r",
      "mask_upper": true,
      "annotate": true
    },
    "network": {
      "enabled": true,
      "threshold": 0.5,
      "layout": "spring",
      "node_size_factor": "degree"
    }
  },
  "output": {
    "top_n": 10,
    "min_correlation": 0.3,
    "max_p_value": 0.05
  }
}
```

### Feature Importance

**Type ID**: `featureImportance`

**Description**: Calculates feature importance scores to identify the most influential variables for a target variable.

**Frontend Component**: `FeatureImportanceNode.tsx`

**Backend Processor**: `FeatureImportanceProcessor.py`

**Inputs**:
- **Data**: The dataset with features
- **Target**: The target variable

**Configuration Options**:
- **Methods**:
  - Statistical: Correlation, mutual information, chi-square
  - Model-based: Random Forest, Gradient Boosting, etc.
  - Permutation: Permutation importance
  - SHAP: SHapley Additive exPlanations
- **Cross-validation**: Options for cross-validation
- **Aggregation**: How to aggregate importance scores

**Outputs**:
- **Importance Scores**: Feature importance scores
- **Rankings**: Ranked features by importance
- **Visualizations**: Bar charts, SHAP plots, etc.
- **Feature Groups**: Grouped features by importance

**Example Configuration**:
```json
{
  "type": "featureImportance",
  "importance": {
    "target": "target_column",
    "methods": {
      "statistical": {
        "correlation": {
          "enabled": true,
          "method": "pearson"
        },
        "mutual_information": {
          "enabled": true,
          "discrete_features": false
        },
        "chi_square": {
          "enabled": true,
          "for_categorical_target": true
        }
      },
      "model_based": {
        "random_forest": {
          "enabled": true,
          "n_estimators": 100,
          "max_depth": 10
        },
        "gradient_boosting": {
          "enabled": false
        }
      },
      "permutation": {
        "enabled": true,
        "n_repeats": 10,
        "scoring": "r2"
      },
      "shap": {
        "enabled": true,
        "model_type": "tree",
        "n_samples": 1000
      }
    }
  },
  "cross_validation": {
    "enabled": true,
    "n_splits": 5,
    "shuffle": true,
    "random_state": 42
  },
  "aggregation": {
    "method": "mean",
    "normalize": true
  },
  "visualization": {
    "bar_chart": {
      "enabled": true,
      "top_n": 20,
      "sort": "descending"
    },
    "shap_summary": {
      "enabled": true,
      "plot_type": "bar",
      "max_display": 20
    },
    "shap_dependence": {
      "enabled": true,
      "top_n": 5
    }
  },
  "output": {
    "threshold": 0.01,
    "group_threshold": 0.9
  }
}
```

### Time Series Analysis

**Type ID**: `timeSeriesAnalysis`

**Description**: Analyzes time series data to identify trends, seasonality, and other temporal patterns.

**Frontend Component**: `TimeSeriesAnalysisNode.tsx`

**Backend Processor**: `TimeSeriesAnalysisProcessor.py`

**Inputs**:
- **Data**: The time series dataset

**Configuration Options**:
- **Decomposition**:
  - Method: Additive, Multiplicative, STL, etc.
  - Period: Seasonality period
- **Stationarity Tests**:
  - ADF, KPSS, etc.
- **Autocorrelation**:
  - ACF, PACF
  - Lag range
- **Spectral Analysis**:
  - Periodogram
  - Wavelet analysis

**Outputs**:
- **Decomposition Components**: Trend, seasonality, residual
- **Stationarity Results**: Results of stationarity tests
- **Autocorrelation Results**: ACF and PACF values
- **Spectral Analysis Results**: Frequency domain analysis
- **Visualizations**: Time series plots, decomposition plots, etc.

**Example Configuration**:
```json
{
  "type": "timeSeriesAnalysis",
  "time_series": {
    "time_column": "date",
    "value_columns": ["sales", "temperature"],
    "frequency": "D",
    "resample": {
      "enabled": true,
      "rule": "W",
      "aggregation": "mean"
    }
  },
  "decomposition": {
    "enabled": true,
    "method": "stl",
    "period": 7,
    "robust": true
  },
  "stationarity": {
    "enabled": true,
    "tests": {
      "adf": {
        "enabled": true,
        "regression": "ct"
      },
      "kpss": {
        "enabled": true,
        "regression": "ct"
      }
    },
    "differencing": {
      "enabled": true,
      "max_d": 2
    }
  },
  "autocorrelation": {
    "enabled": true,
    "acf": {
      "enabled": true,
      "lags": 40,
      "alpha": 0.05
    },
    "pacf": {
      "enabled": true,
      "lags": 40,
      "alpha": 0.05
    }
  },
  "spectral": {
    "enabled": true,
    "periodogram": {
      "enabled": true,
      "detrend": "linear"
    },
    "wavelet": {
      "enabled": false,
      "wavelet": "morlet"
    }
  },
  "visualization": {
    "time_plot": {
      "enabled": true,
      "style": "line",
      "markers": false
    },
    "decomposition_plot": {
      "enabled": true,
      "components": ["trend", "seasonal", "residual"]
    },
    "acf_pacf_plot": {
      "enabled": true,
      "layout": "vertical"
    },
    "periodogram_plot": {
      "enabled": true,
      "scale": "log"
    }
  }
}
```

### Cluster Analysis

**Type ID**: `clusterAnalysis`

**Description**: Performs cluster analysis to identify groups of similar data points.

**Frontend Component**: `ClusterAnalysisNode.tsx`

**Backend Processor**: `ClusterAnalysisProcessor.py`

**Inputs**:
- **Data**: The dataset to cluster

**Configuration Options**:
- **Algorithms**:
  - K-means
  - DBSCAN
  - Hierarchical Clustering
  - Gaussian Mixture Models
  - OPTICS
- **Feature Selection**:
  - Features to use for clustering
  - Feature scaling options
- **Hyperparameters**:
  - Algorithm-specific parameters
  - Number of clusters or estimation method
- **Evaluation**:
  - Silhouette score
  - Davies-Bouldin index
  - Calinski-Harabasz index

**Outputs**:
- **Cluster Assignments**: Cluster labels for each data point
- **Cluster Statistics**: Statistics for each cluster
- **Evaluation Metrics**: Metrics for cluster quality
- **Visualizations**: Cluster plots, dendrograms, etc.

**Example Configuration**:
```json
{
  "type": "clusterAnalysis",
  "clustering": {
    "algorithms": {
      "kmeans": {
        "enabled": true,
        "n_clusters": 5,
        "init": "k-means++",
        "n_init": 10,
        "random_state": 42
      },
      "dbscan": {
        "enabled": true,
        "eps": 0.5,
        "min_samples": 5,
        "metric": "euclidean"
      },
      "hierarchical": {
        "enabled": true,
        "n_clusters": 5,
        "linkage": "ward",
        "distance_threshold": null
      },
      "gaussian_mixture": {
        "enabled": false,
        "n_components": 5,
        "covariance_type": "full"
      },
      "optics": {
        "enabled": false,
        "min_samples": 5,
        "xi": 0.05
      }
    },
    "optimal_clusters": {
      "enabled": true,
      "method": "silhouette",
      "range": [2, 10]
    }
  },
  "features": {
    "include": ["feature1", "feature2", "feature3"],
    "scaling": {
      "method": "standard",
      "with_mean": true,
      "with_std": true
    },
    "dimensionality_reduction": {
      "enabled": true,
      "method": "pca",
      "n_components": 2
    }
  },
  "evaluation": {
    "metrics": {
      "silhouette": {
        "enabled": true
      },
      "davies_bouldin": {
        "enabled": true
      },
      "calinski_harabasz": {
        "enabled": true
      }
    },
    "cross_validation": {
      "enabled": false,
      "n_splits": 5
    }
  },
  "visualization": {
    "scatter_plot": {
      "enabled": true,
      "dimensions": 2,
      "color_by": "cluster"
    },
    "dendrogram": {
      "enabled": true,
      "orientation": "top",
      "truncate_mode": "level",
      "p": 5
    },
    "cluster_profiles": {
      "enabled": true,
      "plot_type": "radar",
      "normalize": true
    }
  },
  "output": {
    "add_cluster_column": true,
    "column_name": "cluster",
    "include_probabilities": true
  }
}
```

### Anomaly Detection

**Type ID**: `anomalyDetection`

**Description**: Detects anomalies and outliers in the data.

**Frontend Component**: `AnomalyDetectionNode.tsx`

**Backend Processor**: `AnomalyDetectionProcessor.py`

**Inputs**:
- **Data**: The dataset to analyze for anomalies

**Configuration Options**:
- **Algorithms**:
  - Statistical: Z-score, IQR, etc.
  - Distance-based: Local Outlier Factor, DBSCAN, etc.
  - Density-based: Isolation Forest, One-Class SVM, etc.
  - Ensemble: Combination of multiple methods
- **Feature Selection**:
  - Features to use for anomaly detection
  - Feature scaling options
- **Thresholds**:
  - Anomaly score threshold
  - Contamination rate

**Outputs**:
- **Anomaly Scores**: Anomaly scores for each data point
- **Anomaly Flags**: Binary flags indicating anomalies
- **Anomaly Explanations**: Explanations for detected anomalies
- **Visualizations**: Anomaly plots, score distributions, etc.

**Example Configuration**:
```json
{
  "type": "anomalyDetection",
  "detection": {
    "algorithms": {
      "statistical": {
        "z_score": {
          "enabled": true,
          "threshold": 3.0
        },
        "iqr": {
          "enabled": true,
          "factor": 1.5
        },
        "mad": {
          "enabled": false,
          "threshold": 3.0
        }
      },
      "distance_based": {
        "lof": {
          "enabled": true,
          "n_neighbors": 20,
          "contamination": 0.05
        },
        "knn": {
          "enabled": false,
          "n_neighbors": 5,
          "method": "mean"
        }
      },
      "density_based": {
        "isolation_forest": {
          "enabled": true,
          "n_estimators": 100,
          "contamination": 0.05,
          "random_state": 42
        },
        "one_class_svm": {
          "enabled": false,
          "nu": 0.05,
          "kernel": "rbf"
        }
      },
      "ensemble": {
        "enabled": true,
        "methods": ["z_score", "iqr", "isolation_forest"],
        "voting": "majority"
      }
    }
  },
  "features": {
    "include": ["*"],
    "exclude": ["id", "timestamp"],
    "scaling": {
      "method": "robust",
      "with_centering": true,
      "with_scaling": true
    }
  },
  "thresholds": {
    "score_threshold": 0.9,
    "contamination": 0.05,
    "adaptive": {
      "enabled": true,
      "method": "elbow"
    }
  },
  "context": {
    "time_aware": {
      "enabled": true,
      "time_column": "timestamp",
      "window_size": 24
    },
    "segmentation": {
      "enabled": true,
      "segment_column": "category",
      "min_segment_size": 50
    }
  },
  "visualization": {
    "scatter_plot": {
      "enabled": true,
      "dimensions": 2,
      "color_by": "anomaly"
    },
    "score_distribution": {
      "enabled": true,
      "plot_type": "histogram",
      "show_threshold": true
    },
    "time_series": {
      "enabled": true,
      "highlight_anomalies": true
    }
  },
  "output": {
    "add_score_column": true,
    "score_column_name": "anomaly_score",
    "add_flag_column": true,
    "flag_column_name": "is_anomaly",
    "explanation": {
      "enabled": true,
      "method": "feature_contribution",
      "top_features": 5
    }
  }
}
```

## Best Practices

1. **Data Preparation**: Ensure data is properly cleaned and prepared before analysis
2. **Feature Selection**: Use relevant features for analysis to avoid noise and spurious correlations
3. **Validation**: Validate analysis results using multiple methods and cross-validation
4. **Interpretation**: Focus on interpretability of results, especially for complex analyses
5. **Visualization**: Use appropriate visualizations to communicate findings effectively

## Troubleshooting

### Common Issues

1. **Performance Issues**:
   - Use sampling for large datasets
   - Reduce the number of features or use dimensionality reduction
   - Optimize algorithm parameters for performance

2. **Misleading Results**:
   - Check for data quality issues
   - Validate assumptions of statistical tests
   - Use multiple methods to confirm findings

3. **Visualization Problems**:
   - Adjust plot parameters for better readability
   - Use appropriate plot types for the data
   - Consider interactive visualizations for complex data 
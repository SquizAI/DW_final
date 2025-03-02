# Data Preparation Nodes

Data Preparation nodes are designed to clean, transform, and enhance data for analysis. These nodes handle tasks such as data cleaning, feature engineering, and data transformation.

## Available Data Preparation Nodes

### Structural Analysis

**Type ID**: `structuralAnalysis`

**Description**: Analyzes the structure of the data, including data types, missing values, and patterns.

**Frontend Component**: `StructuralAnalysisNode.tsx`

**Backend Processor**: `StructuralAnalysisProcessor.py`

**Inputs**:
- **Data**: The dataset to analyze

**Configuration Options**:
- **Analysis Depth**: Basic, Standard, or Deep
- **Type Inference**: Options for inferring data types
- **Pattern Detection**: Enable/disable pattern detection in string columns
- **Correlation Analysis**: Enable/disable correlation analysis between columns
- **Performance Options**: Sampling rate, timeout settings

**Outputs**:
- **Analysis Report**: Detailed report of the data structure
- **Data Types**: Inferred data types for each column
- **Missing Values**: Statistics on missing values
- **Patterns**: Detected patterns in string columns
- **Correlations**: Correlation matrix for numerical columns

**Example Configuration**:
```json
{
  "type": "structuralAnalysis",
  "options": {
    "analysisDepth": "standard",
    "typeInference": {
      "enabled": true,
      "strictness": "moderate"
    },
    "patternDetection": {
      "enabled": true,
      "minConfidence": 0.8
    },
    "correlationAnalysis": {
      "enabled": true,
      "method": "pearson"
    },
    "performance": {
      "samplingRate": 0.5,
      "timeout": 120
    }
  }
}
```

### Quality Checker

**Type ID**: `qualityChecker`

**Description**: Checks data quality and identifies issues such as missing values, outliers, and inconsistencies.

**Frontend Component**: `QualityCheckerNode.tsx`

**Backend Processor**: `QualityCheckerProcessor.py`

**Inputs**:
- **Data**: The dataset to check

**Configuration Options**:
- **Quality Checks**:
  - Missing Values: Thresholds and detection strategies
  - Outliers: Detection methods and thresholds
  - Duplicates: Exact or fuzzy duplicate detection
  - Consistency: Cross-field validation rules
  - Format Validation: Regex patterns for string columns
- **Severity Levels**: Configure severity for different issues
- **Reporting Options**: Detail level, visualization options

**Outputs**:
- **Quality Score**: Overall data quality score (0-100)
- **Issue Report**: Detailed report of identified issues
- **Recommendations**: Suggested actions to improve data quality
- **Visualizations**: Visual representations of quality issues

**Example Configuration**:
```json
{
  "type": "qualityChecker",
  "checks": {
    "missingValues": {
      "enabled": true,
      "threshold": 0.1,
      "severity": "high"
    },
    "outliers": {
      "enabled": true,
      "method": "iqr",
      "factor": 1.5,
      "severity": "medium"
    },
    "duplicates": {
      "enabled": true,
      "columns": ["id", "email"],
      "fuzzyMatching": false,
      "severity": "high"
    },
    "consistency": {
      "enabled": true,
      "rules": [
        {
          "condition": "age >= 18 if role == 'employee'",
          "message": "Employees must be at least 18 years old",
          "severity": "high"
        }
      ]
    },
    "formatValidation": {
      "enabled": true,
      "patterns": {
        "email": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
        "phone": "^\\+?[1-9]\\d{1,14}$"
      },
      "severity": "medium"
    }
  },
  "reporting": {
    "detailLevel": "comprehensive",
    "includeVisualizations": true,
    "maxIssues": 1000
  }
}
```

### Data Cleaner

**Type ID**: `dataCleaner`

**Description**: Cleans data by handling missing values, removing duplicates, and fixing inconsistencies.

**Frontend Component**: `DataCleanerNode.tsx`

**Backend Processor**: `DataCleanerProcessor.py`

**Inputs**:
- **Data**: The dataset to clean
- **Quality Report** (optional): Quality report from a Quality Checker node

**Configuration Options**:
- **Missing Value Handling**:
  - Strategy: Remove, Impute, or Flag
  - Imputation Method: Mean, Median, Mode, Constant, KNN, etc.
- **Duplicate Handling**:
  - Strategy: Remove First, Remove Last, Keep All with Flag
  - Columns: Columns to consider for duplicate detection
- **Outlier Handling**:
  - Strategy: Remove, Cap, Transform, or Flag
  - Detection Method: Z-score, IQR, Isolation Forest, etc.
- **Data Type Conversion**:
  - Type Mappings: Specify target types for columns
- **String Cleaning**:
  - Case Normalization: Upper, Lower, Title
  - Whitespace Handling: Trim, Normalize
  - Special Character Handling: Remove, Replace

**Outputs**:
- **Cleaned Data**: The cleaned dataset
- **Cleaning Report**: Details of the cleaning operations performed
- **Removed Records**: Records that were removed during cleaning

**Example Configuration**:
```json
{
  "type": "dataCleaner",
  "missingValues": {
    "strategy": "impute",
    "methods": {
      "numerical": {
        "method": "median"
      },
      "categorical": {
        "method": "mode"
      },
      "datetime": {
        "method": "forward_fill"
      }
    },
    "columns": {
      "age": {
        "method": "constant",
        "value": 30
      }
    }
  },
  "duplicates": {
    "strategy": "remove_first",
    "columns": ["id", "email"],
    "keepIndex": true
  },
  "outliers": {
    "strategy": "cap",
    "method": "iqr",
    "factor": 1.5,
    "columns": ["salary", "age"]
  },
  "typeConversion": {
    "columns": {
      "age": "integer",
      "joined_date": "datetime",
      "is_active": "boolean"
    }
  },
  "stringCleaning": {
    "case": "lower",
    "whitespace": "trim",
    "specialChars": {
      "strategy": "replace",
      "replacements": {
        "\\n": " ",
        "\\t": " "
      }
    },
    "columns": ["name", "description", "address"]
  }
}
```

### Data Merger

**Type ID**: `dataMerger`

**Description**: Merges multiple datasets based on common keys.

**Frontend Component**: `DataMergerNode.tsx`

**Backend Processor**: `DataMergerProcessor.py`

**Inputs**:
- **Primary Data**: The primary dataset
- **Secondary Data**: One or more secondary datasets

**Configuration Options**:
- **Merge Type**: Inner, Left, Right, Outer, Cross
- **Keys**: Columns to use as merge keys
- **Key Mapping**: Map keys with different names between datasets
- **Conflict Resolution**:
  - Strategy: First, Last, Sum, Mean, Custom
  - Column-specific strategies
- **Result Columns**: Specify which columns to include in the result
- **Validation**: Options for validating the merge result

**Outputs**:
- **Merged Data**: The merged dataset
- **Merge Statistics**: Information about the merge operation
- **Unmatched Records**: Records that couldn't be matched

**Example Configuration**:
```json
{
  "type": "dataMerger",
  "merge": {
    "type": "left",
    "keys": {
      "primary": ["customer_id"],
      "secondary": ["id"]
    },
    "conflicts": {
      "strategy": "last",
      "columns": {
        "total_purchases": {
          "strategy": "sum"
        },
        "last_updated": {
          "strategy": "max"
        }
      }
    },
    "resultColumns": {
      "include": ["*"],
      "exclude": ["_merge_key", "duplicate_col"],
      "rename": {
        "customer_name_x": "customer_name",
        "address_y": "shipping_address"
      }
    },
    "validation": {
      "requireUniqueKeys": true,
      "validateTypes": true
    }
  }
}
```

### Data Transformer

**Type ID**: `dataTransformer`

**Description**: Applies transformations to data columns, such as normalization, encoding, and mathematical operations.

**Frontend Component**: `DataTransformerNode.tsx`

**Backend Processor**: `DataTransformerProcessor.py`

**Inputs**:
- **Data**: The dataset to transform

**Configuration Options**:
- **Numerical Transformations**:
  - Scaling: Min-Max, Z-score, Robust, etc.
  - Mathematical: Log, Square Root, Power, etc.
  - Binning: Equal-width, Equal-frequency, Custom
- **Categorical Transformations**:
  - Encoding: One-Hot, Label, Target, Frequency, etc.
  - Grouping: Group rare categories
- **Text Transformations**:
  - Tokenization: Word, Character, N-gram
  - Vectorization: Count, TF-IDF, Word Embeddings
- **Datetime Transformations**:
  - Extract: Year, Month, Day, Hour, etc.
  - Difference: Calculate time differences
  - Periodicity: Extract cyclical features

**Outputs**:
- **Transformed Data**: The dataset with transformed columns
- **Transformation Metadata**: Information about the transformations applied
- **Transformation Models**: Fitted transformation models (for scaling, encoding, etc.)

**Example Configuration**:
```json
{
  "type": "dataTransformer",
  "transformations": {
    "numerical": {
      "scaling": {
        "method": "minmax",
        "columns": ["age", "income", "score"],
        "range": [0, 1]
      },
      "mathematical": {
        "log": {
          "columns": ["population", "area"],
          "base": 10,
          "addConstant": 1
        },
        "power": {
          "columns": ["distance"],
          "exponent": 2
        }
      },
      "binning": {
        "method": "equal_width",
        "columns": ["age"],
        "bins": 5,
        "labels": ["very_young", "young", "middle", "senior", "elderly"]
      }
    },
    "categorical": {
      "encoding": {
        "one_hot": {
          "columns": ["color", "size"],
          "dropFirst": true
        },
        "label": {
          "columns": ["status"]
        }
      },
      "grouping": {
        "columns": ["country"],
        "threshold": 0.01,
        "otherLabel": "Other Countries"
      }
    },
    "text": {
      "vectorization": {
        "method": "tfidf",
        "columns": ["description", "comments"],
        "maxFeatures": 1000,
        "minDocumentFrequency": 2
      }
    },
    "datetime": {
      "extract": {
        "columns": ["purchase_date"],
        "components": ["year", "month", "day", "dayofweek", "quarter"]
      },
      "difference": {
        "columns": [["signup_date", "last_active"]],
        "unit": "days",
        "resultNames": ["days_active"]
      }
    }
  },
  "options": {
    "inplace": false,
    "dropOriginal": true,
    "handleInvalid": "error"
  }
}
```

### Feature Engineer

**Type ID**: `featureEngineer`

**Description**: Creates new features from existing data through various engineering techniques.

**Frontend Component**: `FeatureEngineerNode.tsx`

**Backend Processor**: `FeatureEngineerProcessor.py`

**Inputs**:
- **Data**: The dataset to engineer features for

**Configuration Options**:
- **Feature Creation**:
  - Arithmetic: Create features using arithmetic operations
  - Aggregation: Create features by aggregating data
  - Interaction: Create interaction features between columns
  - Window Functions: Create features using window functions
- **Feature Selection**:
  - Methods: Variance, Correlation, Importance, etc.
  - Threshold: Threshold for feature selection
- **Dimensionality Reduction**:
  - Method: PCA, t-SNE, UMAP, etc.
  - Components: Number of components to keep

**Outputs**:
- **Engineered Data**: The dataset with engineered features
- **Feature Metadata**: Information about the engineered features
- **Selection Results**: Results of feature selection

**Example Configuration**:
```json
{
  "type": "featureEngineer",
  "features": {
    "creation": {
      "arithmetic": [
        {
          "name": "bmi",
          "expression": "weight / (height * height)",
          "description": "Body Mass Index"
        },
        {
          "name": "price_per_sqft",
          "expression": "price / square_feet",
          "description": "Price per square foot"
        }
      ],
      "aggregation": [
        {
          "name": "avg_transaction",
          "groupBy": ["customer_id"],
          "column": "amount",
          "function": "mean",
          "description": "Average transaction amount per customer"
        }
      ],
      "interaction": [
        {
          "columns": ["age", "income"],
          "method": "product",
          "name": "age_income_interaction"
        }
      ],
      "window": [
        {
          "name": "rolling_avg_sales",
          "column": "sales",
          "function": "mean",
          "window": 3,
          "orderBy": "date"
        }
      ]
    },
    "selection": {
      "method": "variance",
      "threshold": 0.01,
      "maxFeatures": 50
    },
    "dimensionality": {
      "method": "pca",
      "components": 10,
      "explainedVariance": 0.95
    }
  },
  "options": {
    "keepOriginal": true,
    "handleMissing": "drop",
    "handleInfinite": "replace",
    "infiniteValue": 999999
  }
}
```

### Data Binning

**Type ID**: `dataBinning`

**Description**: Bins continuous data into discrete categories.

**Frontend Component**: `DataBinningNode.tsx`

**Backend Processor**: `DataBinningProcessor.py`

**Inputs**:
- **Data**: The dataset to bin

**Configuration Options**:
- **Binning Method**:
  - Equal Width: Divide range into equal-width bins
  - Equal Frequency: Create bins with equal number of samples
  - K-means: Use k-means clustering for binning
  - Custom: User-defined bin edges
- **Bin Options**:
  - Number of Bins: For equal width and equal frequency
  - Bin Labels: Custom labels for bins
  - Include Edges: Whether to include bin edges in labels
- **Output Options**:
  - Output Type: Category, Ordinal, or One-Hot
  - Keep Original: Whether to keep original columns

**Outputs**:
- **Binned Data**: The dataset with binned columns
- **Bin Edges**: The edges used for binning
- **Bin Statistics**: Statistics about the bins (count, mean, etc.)

**Example Configuration**:
```json
{
  "type": "dataBinning",
  "binning": {
    "method": "equal_width",
    "columns": ["age", "income", "score"],
    "options": {
      "bins": 5,
      "labels": ["very_low", "low", "medium", "high", "very_high"],
      "includeEdges": false,
      "rightInclusive": true
    },
    "custom": {
      "age": {
        "edges": [0, 18, 30, 50, 65, 100],
        "labels": ["child", "young_adult", "adult", "middle_age", "senior"]
      }
    },
    "output": {
      "type": "category",
      "keepOriginal": true,
      "suffix": "_binned"
    }
  }
}
```

## Best Practices

1. **Pipeline Order**: Place data preparation nodes in a logical order (e.g., cleaning before transformation)
2. **Data Validation**: Use Quality Checker nodes before and after transformations to validate results
3. **Documentation**: Document the purpose and configuration of each preparation step
4. **Reproducibility**: Use fixed random seeds for operations that involve randomness
5. **Performance**: Use sampling for large datasets during the exploration phase

## Troubleshooting

### Common Issues

1. **Data Type Errors**:
   - Ensure data types are correctly specified
   - Use type conversion before operations that require specific types

2. **Missing Value Errors**:
   - Handle missing values before transformations that don't support them
   - Check for missing values introduced during transformations

3. **Memory Issues**:
   - Reduce the number of generated features
   - Use more memory-efficient transformations
   - Process data in chunks when possible 
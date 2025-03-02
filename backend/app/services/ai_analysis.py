from typing import Dict, Any, List
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.feature_selection import mutual_info_classif, SelectKBest, f_classif
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer, KNNImputer
import openai
from app.config import settings

async def analyze_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze dataset characteristics and quality using AI.
    """
    # Basic quality checks
    quality_issues = []
    quality_score = 1.0

    # Check for missing values
    missing_percentages = df.isnull().mean()
    if missing_percentages.max() > 0:
        quality_issues.append(f"Found {(missing_percentages.max() * 100):.1f}% missing values in column {missing_percentages.idxmax()}")
        quality_score -= 0.1 * missing_percentages.max()

    # Check for data type consistency
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns

    # Check for outliers in numeric columns
    for col in numeric_cols:
        z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
        outliers_pct = (z_scores > 3).mean()
        if outliers_pct > 0.01:
            quality_issues.append(f"Found {(outliers_pct * 100):.1f}% outliers in column {col}")
            quality_score -= 0.05

    # Check for high cardinality in categorical columns
    for col in categorical_cols:
        unique_ratio = df[col].nunique() / len(df)
        if unique_ratio > 0.9:
            quality_issues.append(f"High cardinality in column {col} ({df[col].nunique()} unique values)")
            quality_score -= 0.05

    # Use OpenAI to analyze column semantics and relationships
    column_descriptions = await analyze_column_semantics(df)

    return {
        "quality": {
            "score": max(0.0, quality_score),
            "issues": quality_issues
        },
        "column_analysis": column_descriptions
    }

async def suggest_workflow(
    df: pd.DataFrame,
    analysis: Dict[str, Any],
    available_nodes: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Suggest optimal workflows based on dataset characteristics and analysis.
    """
    # Analyze target variable candidates
    potential_targets = []
    for col in df.columns:
        if df[col].dtype in ['object', 'category']:
            unique_ratio = df[col].nunique() / len(df)
            if 0.01 < unique_ratio < 0.2:  # Good candidate for classification
                potential_targets.append({
                    "column": col,
                    "type": "classification",
                    "classes": df[col].nunique()
                })
        elif df[col].dtype in [np.number]:
            # Check if it's a good regression target
            if df[col].std() > 0:
                potential_targets.append({
                    "column": col,
                    "type": "regression",
                    "range": [float(df[col].min()), float(df[col].max())]
                })

    # Use OpenAI to generate workflow suggestions
    workflow_suggestions = await generate_workflow_suggestions(
        df=df,
        analysis=analysis,
        potential_targets=potential_targets,
        available_nodes=available_nodes
    )

    return workflow_suggestions

async def analyze_column_semantics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Use OpenAI to analyze column meanings and relationships.
    """
    try:
        # Prepare column information for AI analysis
        column_info = []
        for col in df.columns:
            info = {
                "name": col,
                "type": str(df[col].dtype),
                "sample_values": df[col].dropna().head(5).tolist(),
                "unique_count": df[col].nunique(),
            }
            column_info.append(info)

        # Create prompt for OpenAI
        prompt = f"""Analyze these dataset columns and their relationships:
        {column_info}
        
        For each column:
        1. Identify its likely semantic meaning
        2. Suggest potential transformations or preprocessing steps
        3. Identify relationships with other columns
        4. Suggest potential feature engineering ideas
        
        Format the response as a JSON object."""

        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a data science expert analyzing dataset columns."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"Error in AI column analysis: {e}")
        return {}

async def generate_workflow_suggestions(
    df: pd.DataFrame,
    analysis: Dict[str, Any],
    potential_targets: List[Dict[str, Any]],
    available_nodes: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Use OpenAI to generate workflow suggestions based on dataset analysis.
    """
    try:
        # Prepare context for AI
        context = {
            "dataset_info": {
                "rows": len(df),
                "columns": len(df.columns),
                "quality_score": analysis["quality"]["score"],
                "quality_issues": analysis["quality"]["issues"],
            },
            "potential_targets": potential_targets,
            "available_nodes": available_nodes,
        }

        # Create prompt for OpenAI
        prompt = f"""Based on this dataset analysis, suggest optimal data processing workflows:
        {context}
        
        For each suggested workflow:
        1. Determine the most appropriate processing steps
        2. Select and configure relevant nodes
        3. Define node connections and data flow
        4. Explain the rationale for each step
        
        Format the response as a JSON array of workflow objects."""

        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a workflow optimization expert."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )

        workflows = response.choices[0].message.content
        
        # Transform AI suggestions into actual workflow configurations
        return [
            {
                "type": wf["type"],
                "confidence": wf["confidence"],
                "description": wf["description"],
                "nodes": transform_nodes_to_reactflow(wf["nodes"]),
                "edges": transform_edges_to_reactflow(wf["edges"])
            }
            for wf in workflows["workflows"]
        ]

    except Exception as e:
        print(f"Error in workflow generation: {e}")
        return []

def transform_nodes_to_reactflow(nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Transform node configurations into ReactFlow format.
    """
    reactflow_nodes = []
    x, y = 100, 100

    for i, node in enumerate(nodes):
        reactflow_nodes.append({
            "id": str(i + 1),
            "type": node["type"],
            "position": {"x": x, "y": y},
            "data": {
                "label": node["label"],
                "type": node["type"],
                "config": node["config"],
                "capabilities": node["capabilities"]
            }
        })
        x += 200  # Space nodes horizontally

    return reactflow_nodes

def transform_edges_to_reactflow(edges: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Transform edge configurations into ReactFlow format.
    """
    return [
        {
            "id": f"e{edge['source']}-{edge['target']}",
            "source": str(edge["source"]),
            "target": str(edge["target"]),
            "type": "smoothstep"
        }
        for edge in edges
    ]

async def analyze_ml_potential(
    columns: List[Dict[str, Any]],
    row_count: int,
    quality: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Analyze dataset for potential ML tasks and their likelihood of success.
    """
    try:
        # Prepare context for AI analysis
        context = {
            "columns": columns,
            "row_count": row_count,
            "quality": quality,
            "column_types": {col["name"]: col["type"] for col in columns},
            "unique_ratios": {col["name"]: col["uniqueValues"] / row_count for col in columns},
        }

        # Create prompt for OpenAI
        prompt = f"""Analyze this dataset context for machine learning potential:
        {context}
        
        Suggest optimal machine learning tasks considering:
        1. Data characteristics and quality
        2. Column relationships and patterns
        3. Potential target variables
        4. Feature importance and relevance
        5. Dataset complexity and challenges
        
        Format the response as a JSON object with:
        - suggestedTasks: array of ML task recommendations
        - datasetComplexity: complexity metrics
        - potentialChallenges: array of potential issues
        """

        response = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an ML expert analyzing dataset potential."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"Error in ML potential analysis: {e}")
        return {
            "suggestedTasks": [],
            "datasetComplexity": {
                "dimensionality": len(columns),
                "sparsity": 0,
                "classImbalance": None
            }
        }

async def generate_insights(
    columns: List[Dict[str, Any]],
    quality: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate advanced insights about the dataset.
    """
    try:
        # Prepare context for AI analysis
        context = {
            "columns": columns,
            "quality": quality,
            "patterns": [
                col for col in columns
                if col.get("distribution") and len(col.get("distribution", {})) > 0
            ],
        }

        # Create prompt for OpenAI
        prompt = f"""Generate insights for this dataset:
        {context}
        
        Analyze for:
        1. Statistical patterns and distributions
        2. Column relationships and dependencies
        3. Data quality patterns
        4. Potential data generation processes
        5. Business/domain insights
        
        Format the response as a JSON object with:
        - correlations: array of column relationships
        - patterns: array of discovered patterns
        - anomalies: array of unusual patterns
        """

        response = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a data insight expert."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"Error in insight generation: {e}")
        return {
            "correlations": [],
            "patterns": [],
            "anomalies": []
        }

async def recommend_preprocessing(
    columns: List[Dict[str, Any]],
    quality: Dict[str, Any],
    ml_tasks: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Recommend preprocessing steps based on data characteristics and ML tasks.
    """
    try:
        # Prepare context for AI analysis
        context = {
            "columns": columns,
            "quality": quality,
            "ml_tasks": ml_tasks,
            "quality_issues": quality.get("issues", []),
        }

        # Create prompt for OpenAI
        prompt = f"""Recommend preprocessing steps for this dataset:
        {context}
        
        Consider:
        1. Data quality issues
        2. ML task requirements
        3. Feature engineering opportunities
        4. Performance impact
        5. Implementation complexity
        
        Format the response as a JSON object with:
        - preprocessing: array of preprocessing steps
        - featureEngineering: array of feature engineering techniques
        - modelSelection: array of recommended models
        """

        response = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a data preprocessing expert."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )

        recommendations = response.choices[0].message.content

        # Add node connection suggestions
        preprocessing_steps = recommendations.get("preprocessing", [])
        for i, step in enumerate(preprocessing_steps):
            step["sourceNode"] = f"prep_{i}"
            step["targetNode"] = f"prep_{i+1}"

        return recommendations

    except Exception as e:
        print(f"Error in preprocessing recommendations: {e}")
        return {
            "preprocessing": [],
            "featureEngineering": [],
            "modelSelection": []
        }

async def auto_clean_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Automatically clean dataset using AI-guided decisions.
    """
    try:
        # Get cleaning recommendations from AI
        cleaning_context = {
            "columns": df.columns.tolist(),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "missing_stats": df.isnull().sum().to_dict(),
            "unique_counts": df.nunique().to_dict(),
            "sample_values": {col: df[col].dropna().head(5).tolist() for col in df.columns},
        }

        cleaning_prompt = f"""Analyze this dataset for cleaning requirements:
        {cleaning_context}
        
        Recommend cleaning steps considering:
        1. Missing value treatment (imputation strategy per column)
        2. Outlier detection and handling
        3. Data type conversions
        4. Format standardization
        5. Noise reduction techniques
        
        Format response as a JSON object with cleaning instructions per column."""

        response = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a data cleaning expert."},
                {"role": "user", "content": cleaning_prompt}
            ],
            response_format={ "type": "json_object" }
        )

        cleaning_instructions = response.choices[0].message.content

        # Apply cleaning operations
        cleaned_df = df.copy()
        cleaning_logs = []

        for col, instructions in cleaning_instructions["columns"].items():
            if instructions.get("imputation"):
                if instructions["imputation"] == "knn":
                    imputer = KNNImputer(n_neighbors=5)
                    cleaned_df[col] = imputer.fit_transform(df[[col]])
                else:
                    imputer = SimpleImputer(strategy=instructions["imputation"])
                    cleaned_df[col] = imputer.fit_transform(df[[col]])
                cleaning_logs.append(f"Imputed {col} using {instructions['imputation']}")

            if instructions.get("outlier_treatment"):
                if instructions["outlier_treatment"] == "isolation_forest":
                    iso = IsolationForest(contamination=0.1)
                    outliers = iso.fit_predict(df[[col]])
                    cleaned_df[col] = np.where(outliers == -1, np.nan, cleaned_df[col])
                    cleaning_logs.append(f"Removed outliers from {col}")

            if instructions.get("type_conversion"):
                cleaned_df[col] = cleaned_df[col].astype(instructions["type_conversion"])
                cleaning_logs.append(f"Converted {col} to {instructions['type_conversion']}")

        return {
            "cleaned_data": cleaned_df,
            "cleaning_logs": cleaning_logs,
            "quality_improvement": calculate_quality_improvement(df, cleaned_df)
        }

    except Exception as e:
        print(f"Error in auto cleaning: {e}")
        return {"error": str(e)}

async def auto_feature_engineering(df: pd.DataFrame, target_col: str = None) -> Dict[str, Any]:
    """
    Automatically engineer features using AI guidance.
    """
    try:
        # Get feature engineering suggestions from AI
        feature_context = {
            "columns": df.columns.tolist(),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "correlations": df.corr().to_dict() if df.select_dtypes(include=[np.number]).columns.any() else {},
            "target": target_col,
        }

        feature_prompt = f"""Suggest feature engineering operations:
        {feature_context}
        
        Recommend:
        1. Feature combinations and interactions
        2. Mathematical transformations
        3. Temporal features (if applicable)
        4. Categorical encoding strategies
        5. Dimensionality reduction
        
        Format response as a JSON object with feature engineering steps."""

        response = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a feature engineering expert."},
                {"role": "user", "content": feature_prompt}
            ],
            response_format={ "type": "json_object" }
        )

        engineering_steps = response.choices[0].message.content
        engineered_df = df.copy()
        feature_logs = []

        # Apply feature engineering
        for step in engineering_steps["steps"]:
            if step["type"] == "interaction":
                col1, col2 = step["columns"]
                engineered_df[f"{col1}_{col2}_interaction"] = engineered_df[col1] * engineered_df[col2]
                feature_logs.append(f"Created interaction feature: {col1}_{col2}")

            elif step["type"] == "polynomial":
                for col in step["columns"]:
                    engineered_df[f"{col}_squared"] = engineered_df[col] ** 2
                    feature_logs.append(f"Created polynomial feature: {col}_squared")

            elif step["type"] == "encoding":
                for col in step["columns"]:
                    if step["method"] == "target":
                        target_means = engineered_df.groupby(col)[target_col].mean()
                        engineered_df[f"{col}_target_encoded"] = engineered_df[col].map(target_means)
                        feature_logs.append(f"Target encoded: {col}")

            elif step["type"] == "reduction":
                if step["method"] == "pca":
                    numeric_cols = engineered_df.select_dtypes(include=[np.number]).columns
                    pca = PCA(n_components=step["n_components"])
                    pca_features = pca.fit_transform(StandardScaler().fit_transform(engineered_df[numeric_cols]))
                    for i in range(step["n_components"]):
                        engineered_df[f"pca_component_{i+1}"] = pca_features[:, i]
                    feature_logs.append(f"Created {step['n_components']} PCA components")

        return {
            "engineered_data": engineered_df,
            "feature_logs": feature_logs,
            "importance_scores": calculate_feature_importance(engineered_df, target_col) if target_col else None
        }

    except Exception as e:
        print(f"Error in feature engineering: {e}")
        return {"error": str(e)}

async def real_time_workflow_assistance(
    current_nodes: List[Dict[str, Any]],
    current_edges: List[Dict[str, Any]],
    selected_node: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Provide real-time AI assistance during workflow editing.
    """
    try:
        workflow_context = {
            "nodes": current_nodes,
            "edges": current_edges,
            "selected_node": selected_node,
            "workflow_patterns": extract_workflow_patterns(current_nodes, current_edges),
        }

        assistance_prompt = f"""Analyze current workflow state and provide assistance:
        {workflow_context}
        
        Provide:
        1. Next step suggestions
        2. Configuration recommendations
        3. Potential issues or improvements
        4. Best practice recommendations
        5. Performance optimization suggestions
        
        Format response as a JSON object with assistance details."""

        response = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a workflow optimization expert."},
                {"role": "user", "content": assistance_prompt}
            ],
            response_format={ "type": "json_object" }
        )

        assistance = response.choices[0].message.content
        
        # Enhance assistance with specific suggestions
        if selected_node:
            node_suggestions = await get_node_specific_suggestions(selected_node, workflow_context)
            assistance["node_specific"] = node_suggestions

        return assistance

    except Exception as e:
        print(f"Error in real-time assistance: {e}")
        return {"error": str(e)}

def calculate_quality_improvement(original_df: pd.DataFrame, cleaned_df: pd.DataFrame) -> Dict[str, float]:
    """Calculate quality improvement metrics after cleaning."""
    return {
        "missing_values_reduction": (
            original_df.isnull().sum().sum() - cleaned_df.isnull().sum().sum()
        ) / len(original_df),
        "outliers_handled": len(original_df) - len(cleaned_df),
        "completeness_score": (1 - cleaned_df.isnull().sum().sum() / (cleaned_df.shape[0] * cleaned_df.shape[1]))
    }

def calculate_feature_importance(df: pd.DataFrame, target_col: str) -> Dict[str, float]:
    """Calculate feature importance scores."""
    if target_col not in df.columns:
        return {}
    
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    if df[target_col].dtype == 'object':
        importance = mutual_info_classif(X, y)
    else:
        selector = SelectKBest(score_func=f_classif, k='all')
        selector.fit(X, y)
        importance = selector.scores_
    
    return dict(zip(X.columns, importance))

def extract_workflow_patterns(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Extract common workflow patterns for analysis."""
    patterns = []
    
    # Identify linear sequences
    visited = set()
    for edge in edges:
        if edge["source"] not in visited:
            sequence = extract_linear_sequence(edge["source"], edges)
            if len(sequence) > 1:
                patterns.append({
                    "type": "linear_sequence",
                    "nodes": sequence,
                    "length": len(sequence)
                })
        visited.add(edge["source"])
    
    # Identify parallel processing
    for node in nodes:
        outgoing = [e for e in edges if e["source"] == node["id"]]
        if len(outgoing) > 1:
            patterns.append({
                "type": "parallel_processing",
                "source": node["id"],
                "branches": len(outgoing)
            })
    
    return patterns

def extract_linear_sequence(start_node: str, edges: List[Dict[str, Any]]) -> List[str]:
    """Extract a linear sequence of nodes starting from a given node."""
    sequence = [start_node]
    current = start_node
    
    while True:
        next_edges = [e for e in edges if e["source"] == current]
        if len(next_edges) != 1:
            break
        current = next_edges[0]["target"]
        sequence.append(current)
    
    return sequence

async def get_node_specific_suggestions(
    node: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Get AI suggestions specific to a selected node."""
    try:
        node_prompt = f"""Analyze this node and provide specific suggestions:
        Node: {node}
        Context: {context}
        
        Provide:
        1. Optimal configuration settings
        2. Performance optimization tips
        3. Common pitfalls to avoid
        4. Integration recommendations
        5. Best practices for this node type
        
        Format response as a JSON object with node-specific suggestions."""

        response = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a node optimization expert."},
                {"role": "user", "content": node_prompt}
            ],
            response_format={ "type": "json_object" }
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"Error in node suggestions: {e}")
        return {"error": str(e)} 
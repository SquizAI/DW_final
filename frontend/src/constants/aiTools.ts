export interface AITool {
  name: string;
  description: string;
}

export const AITools: AITool[] = [
  { name: 'Workflow Builder', description: 'Create and manage custom agentic workflows for data processing and automation.' },
  { name: 'Data Ingestion', description: 'Fetch and import data from various external sources and APIs.' },
  { name: 'Data Cleaning', description: 'Detect and handle missing values, outliers, and inconsistencies in datasets.' },
  { name: 'Data Transformation', description: 'Apply normalization, scaling, encoding, and other transformations to prepare data.' },
  { name: 'Feature Extraction', description: 'Automatically extract useful features from raw data.' },
  { name: 'Feature Engineering', description: 'Create and refine features to enhance model performance.' },
  { name: 'Algorithm Suggester', description: 'Recommend optimal machine learning algorithms based on data characteristics.' },
  { name: 'Hyperparameter Tuner', description: 'Optimize model parameters using advanced tuning techniques.' },
  { name: 'Model Trainer', description: 'Train machine learning models with integrated AI assistance.' },
  { name: 'Model Evaluator', description: 'Assess model performance using robust metrics and validation processes.' },
  { name: 'Real-Time Analytics', description: 'Monitor and analyze streaming data for instant insights.' },
  { name: 'Data Visualizer', description: 'Generate interactive visualizations to explore data trends.' },
  { name: 'Chart Plotter', description: 'Create various charts (bar, line, scatter, etc.) for data presentation.' },
  { name: 'Statistical Analyzer', description: 'Perform detailed statistical analysis and hypothesis testing.' },
  { name: 'Data Imputation', description: 'Automatically fill in missing values using advanced imputation methods.' },
  { name: 'NLP Processor', description: 'Process and analyze unstructured text data with natural language techniques.' },
  { name: 'Decision Tree Generator', description: 'Construct decision trees for interpretable machine learning models.' },
  { name: 'Anomaly Detector', description: 'Identify outliers and anomalies in datasets effectively.' },
  { name: 'Report Generator', description: 'Automatically compile comprehensive reports and summaries of data analyses.' },
  { name: 'Code Generator', description: 'Generate code snippets for building data processing pipelines and automation tasks.' }
]; 
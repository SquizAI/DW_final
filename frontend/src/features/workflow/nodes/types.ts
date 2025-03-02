import { ReactNode } from 'react';

export interface NodeCapability {
  id: string;
  label: string;
  description?: string;
  function?: (input: any) => Promise<any>;
  config?: Record<string, any>;
  validation?: {
    required?: string[];
    rules?: Record<string, (value: any) => boolean>;
  };
}

export interface BaseValidation {
  required: string[];
  rules: Record<string, (value: any) => boolean>;
}

export interface NodeData {
  label: string;
  icon?: ReactNode;
  description?: string;
  type: string;
  capabilities?: NodeCapability[];
  tags?: string[];
  complexity?: 'beginner' | 'intermediate' | 'advanced';
  state?: {
    status: 'idle' | 'learning' | 'working' | 'completed' | 'error';
    progress: number;
    results?: any;
    insights?: string[];
  };
  settings?: Record<string, any>;
  validation?: BaseValidation;
}

export interface DatasetLoaderValidation {
  schema?: Record<string, string>;
  constraints?: Record<string, any>;
}

export interface DatasetLoaderNodeData extends Omit<NodeData, 'type' | 'validation'> {
  type: 'datasetLoader';
  source?: {
    type: 'file' | 'database' | 'api';
    location: string;
    format?: string;
    credentials?: Record<string, string>;
  };
  validation?: DatasetLoaderValidation;
}

export interface StructuralAnalysisNodeData extends Omit<NodeData, 'type'> {
  type: 'structuralAnalysis';
  analysis?: {
    dataTypes?: Record<string, string>;
    missingValues?: Record<string, number>;
    uniqueValues?: Record<string, number>;
    patterns?: Record<string, string>;
  };
  report?: {
    summary: string;
    details: Record<string, any>;
    recommendations: string[];
  };
}

export interface QualityCheckerNodeData extends Omit<NodeData, 'type'> {
  type: 'qualityChecker';
  quality?: {
    score: number;
    metrics: Record<string, number>;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      recommendation: string;
    }>;
  };
  cleaning?: {
    rules: Record<string, any>;
    actions: string[];
    log: string[];
  };
}

export interface DataMergerNodeData extends Omit<NodeData, 'type'> {
  type: 'dataMerger';
  merge?: {
    type: 'inner' | 'left' | 'right' | 'outer';
    keys: string[];
    conflicts: Record<string, string>;
    validation: Record<string, boolean>;
  };
  preview?: {
    before: any[];
    after: any[];
    stats: Record<string, number>;
  };
}

export interface DataBinningNodeData extends Omit<NodeData, 'type'> {
  type: 'dataBinning';
  binning?: {
    method: 'equal_width' | 'equal_frequency' | 'custom';
    bins: number | number[];
    labels?: string[];
    columns: string[];
  };
  statistics?: {
    distribution: Record<string, number>;
    boundaries: number[];
    counts: number[];
  };
}

export interface LambdaFunctionNodeData extends Omit<NodeData, 'type'> {
  type: 'lambdaFunction';
  function?: {
    code: string;
    language: 'python' | 'r' | 'sql';
    params: Record<string, any>;
    validation: boolean;
  };
  execution?: {
    status: string;
    output: any;
    errors: string[];
    performance: Record<string, number>;
  };
}

export interface FeatureEngineerNodeData extends Omit<NodeData, 'type'> {
  type: 'featureEngineer';
  features?: {
    new: string[];
    transformed: string[];
    encoded: Record<string, string[]>;
    scaled: Record<string, { min: number; max: number }>;
  };
  engineering?: {
    methods: Record<string, any>;
    dependencies: string[];
    impact: Record<string, number>;
  };
}

export interface EDAAnalysisNodeData extends Omit<NodeData, 'type'> {
  type: 'edaAnalysis';
  analysis?: {
    univariate: Record<string, any>;
    bivariate: Record<string, any>;
    multivariate: Record<string, any>;
    correlations: Record<string, number>;
  };
  visualizations?: {
    plots: Array<{
      type: string;
      data: any;
      config: any;
    }>;
    insights: string[];
  };
}

export interface FeatureImportanceNodeData extends Omit<NodeData, 'type'> {
  type: 'featureImportance';
  importance?: {
    scores: Record<string, number>;
    methods: Record<string, any>;
    rankings: Array<{ feature: string; score: number }>;
  };
  interpretation?: {
    shap: Record<string, any>;
    permutation: Record<string, number[]>;
    dependencies: Record<string, string[]>;
  };
}

export interface BinaryClassifierNodeData extends Omit<NodeData, 'type'> {
  type: 'binaryClassifier';
  model?: {
    type: string;
    params: Record<string, any>;
    performance: {
      accuracy: number;
      precision: number;
      recall: number;
      f1: number;
      auc: number;
    };
  };
  resampling?: {
    method: string;
    ratio: number;
    before: Record<string, number>;
    after: Record<string, number>;
  };
}

export interface ReportGeneratorNodeData extends Omit<NodeData, 'type'> {
  type: 'reportGenerator';
  report?: {
    sections: Array<{
      title: string;
      content: any;
      type: 'text' | 'plot' | 'table' | 'code';
    }>;
    metadata: Record<string, any>;
    format: 'html' | 'pdf' | 'notebook';
  };
  export?: {
    files: string[];
    timestamp: string;
    status: string;
  };
}

export type WorkflowNodeData =
  | DatasetLoaderNodeData
  | StructuralAnalysisNodeData
  | QualityCheckerNodeData
  | DataMergerNodeData
  | DataBinningNodeData
  | LambdaFunctionNodeData
  | FeatureEngineerNodeData
  | EDAAnalysisNodeData
  | FeatureImportanceNodeData
  | BinaryClassifierNodeData
  | ReportGeneratorNodeData;

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
} 
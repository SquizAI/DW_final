import { Node, Edge } from 'reactflow';

export type NodeStatus = 'pending' | 'running' | 'complete' | 'error';

export type BaseNodeData = {
  label: string;
  description?: string;
  status?: NodeStatus;
  config?: Record<string, any>;
  preview?: {
    rowCount?: number;
    columnCount?: number;
    sample?: any[];
  };
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
};

export type DataNodeData = BaseNodeData & {
  stats?: {
    rowCount: number;
    columnCount: number;
    missingValues?: Record<string, number>;
    dataTypes?: Record<string, string>;
  };
  source?: {
    type: 'file' | 'database' | 'api';
    location: string;
    format?: string;
  };
};

export type TransformNodeData = BaseNodeData & {
  operation?: string;
  params?: Record<string, any>;
  validation?: {
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
  };
};

export type AnalysisNodeData = BaseNodeData & {
  method?: string;
  metrics?: Record<string, number>;
  insights?: Array<{
    type: string;
    description: string;
    confidence: number;
    metadata?: Record<string, any>;
  }>;
};

export type AINodeData = BaseNodeData & {
  task?: string;
  progress?: number;
  metrics?: Record<string, number>;
  model?: {
    name: string;
    version: string;
    params?: Record<string, any>;
  };
  training?: {
    status: NodeStatus;
    epochs?: number;
    currentEpoch?: number;
    metrics?: Record<string, number[]>;
  };
};

export type VisualNodeData = BaseNodeData & {
  chartType?: string;
  dimensions?: string[];
  config?: {
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
    options?: Record<string, any>;
  };
};

export type ExportNodeData = BaseNodeData & {
  format?: string;
  destination?: string;
  progress?: number;
  options?: {
    compression?: boolean;
    encoding?: string;
    includeHeaders?: boolean;
    dateFormat?: string;
  };
};

export type WorkflowNodeData =
  | ({ type: 'dataNode' } & DataNodeData)
  | ({ type: 'transformNode' } & TransformNodeData)
  | ({ type: 'analysisNode' } & AnalysisNodeData)
  | ({ type: 'aiNode' } & AINodeData)
  | ({ type: 'visualNode' } & VisualNodeData)
  | ({ type: 'exportNode' } & ExportNodeData);

export type WorkflowEdgeData = {
  transformations?: string[];
  status?: NodeStatus;
  validation?: {
    isValid: boolean;
    message?: string;
  };
  metadata?: {
    dataFlow?: {
      rowCount?: number;
      columnCount?: number;
      transformationTime?: number;
    };
  };
};

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge<WorkflowEdgeData>;

export interface NodeTypeConfig {
  type: string;
  label: string;
  icon: any;
  color: string;
  category: 'input' | 'processing' | 'analysis' | 'output';
  description: string;
  maxInputs?: number;
  maxOutputs?: number;
  defaultConfig?: Record<string, any>;
  validation?: {
    required?: string[];
    rules?: Record<string, (value: any) => boolean | string>;
  };
} 
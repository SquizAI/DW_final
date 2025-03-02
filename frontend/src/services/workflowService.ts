import axios from 'axios';
import { Node, Edge } from 'reactflow';

const API_BASE_URL = '/api/workflow';

export interface DataPreview {
  columns: string[];
  sample: Record<string, any>[];
  stats: {
    rowCount: number;
    columnCount: number;
    missingValues: Record<string, number>;
    dataTypes: Record<string, string>;
  };
}

export interface TransformConfig {
  type: string;
  params: Record<string, any>;
}

export interface QualityCheckResult {
  valid: boolean;
  issues: Array<{
    field: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  summary: {
    totalIssues: number;
    criticalIssues: number;
    completeness: number;
  };
}

export interface ExportConfig {
  format: 'csv' | 'json' | 'parquet';
  options?: {
    compression?: boolean;
    encoding?: string;
    delimiter?: string;
  };
}

class WorkflowService {
  async getDataPreview(nodeId: string): Promise<DataPreview> {
    const response = await axios.get(`${API_BASE_URL}/preview/${nodeId}`);
    return response.data;
  }

  async applyTransformation(nodeId: string, config: TransformConfig): Promise<DataPreview> {
    const response = await axios.post(`${API_BASE_URL}/transform/${nodeId}`, config);
    return response.data;
  }

  async runQualityChecks(nodeId: string): Promise<QualityCheckResult> {
    const response = await axios.get(`${API_BASE_URL}/quality/${nodeId}`);
    return response.data;
  }

  async exportData(nodeId: string, config: ExportConfig): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/export/${nodeId}`, config);
    return response.data.downloadUrl;
  }

  async saveWorkflow(workflowId: string, nodes: Node[], edges: Edge[]): Promise<void> {
    await axios.put(`${API_BASE_URL}/${workflowId}`, {
      nodes,
      edges,
    });
  }

  async loadWorkflow(workflowId: string): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const response = await axios.get(`${API_BASE_URL}/${workflowId}`);
    return response.data;
  }

  async getNodeSuggestions(nodeId: string): Promise<{
    suggestions: Array<{
      id: string;
      title: string;
      description: string;
      config: TransformConfig;
    }>;
  }> {
    const response = await axios.get(`${API_BASE_URL}/suggestions/${nodeId}`);
    return response.data;
  }

  async analyzeData(nodeId: string): Promise<{
    insights: Array<{
      type: string;
      description: string;
      confidence: number;
      metadata: Record<string, any>;
    }>;
  }> {
    const response = await axios.get(`${API_BASE_URL}/analyze/${nodeId}`);
    return response.data;
  }
}

export const workflowService = new WorkflowService(); 
export interface DataInsight {
  type: 'warning' | 'suggestion' | 'insight';
  message: string;
  confidence: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface WorkflowStep {
  type: string;
  params: Record<string, any>;
  description: string;
}

export interface WorkflowSuggestion {
  id: string;
  name: string;
  description: string;
  confidence: number;
  steps: WorkflowStep[];
}

export interface AIState {
  isAnalyzing: boolean;
  suggestedWorkflows: WorkflowSuggestion[];
  dataInsights: DataInsight[];
  userIntent: string | null;
  confidence: number;
}

export interface AIContextType extends AIState {
  analyzeUserIntent: (input: string) => Promise<void>;
  executeWorkflow: (workflowId: string) => Promise<void>;
  getDatasetRecommendations: () => Promise<void>;
}

export interface ContextAnalysisResponse {
  insights: DataInsight[];
  suggestedWorkflows: WorkflowSuggestion[];
} 
export interface WorkflowSuggestion {
  title: string;
  description: string;
  steps: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  confidence: number;
}

export interface DatasetWorkflowRequest {
  datasetRef: string;
  columns: string[];
  previewData: any[];
  stats: {
    totalRows: number;
    totalColumns: number;
    memorySizeMb: number;
  };
}

export async function getDatasetWorkflowSuggestions(request: DatasetWorkflowRequest): Promise<WorkflowSuggestion[]> {
  try {
    const response = await fetch('/api/workflows/ai/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataset: {
          ref: request.datasetRef,
          columns: request.columns,
          preview: request.previewData,
          stats: request.stats
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get workflow suggestions');
    }

    const data = await response.json();
    return data.suggestions;
  } catch (error) {
    console.error('Error getting workflow suggestions:', error);
    return [];
  }
} 
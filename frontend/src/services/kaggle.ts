import { api } from '@/api';

export interface KaggleDataset {
  ref: string;
  title: string;
  size: string;
  lastUpdated: string;
  downloadCount: number;
  description: string;
  url: string;
}

export interface DatasetPreview {
  name: string;
  size: number;
  type: string;
  rowCount: number;
  columns: string[];
  sample: Record<string, any>[];
  stats: {
    totalRows: number;
    totalColumns: number;
    numericColumns: number;
    categoricalColumns: number;
    missingValues: Record<string, number>;
    memoryUsage: number;
  };
}

export interface DemoDataset {
  ref: string;
  description: string;
  size: string;
  columns: string[];
}

export async function searchKaggleDatasets(query: string): Promise<KaggleDataset[]> {
  const response = await api.get(`/kaggle/search?query=${encodeURIComponent(query)}`);
  return response.data;
}

export async function downloadKaggleDataset(ref: string): Promise<{ message: string; path: string }> {
  const [owner, dataset] = ref.split('/');
  const response = await api.post(`/kaggle/download/${owner}/${dataset}`);
  return response.data;
}

export const getDemoDatasets = async (): Promise<Record<string, DemoDataset>> => {
  try {
    const response = await api.get('/kaggle/demo/datasets');
    return response.data;
  } catch (error) {
    console.error('Failed to get demo datasets:', error);
    throw error;
  }
};

export const getDatasetPreview = async (datasetRef: string): Promise<DatasetPreview> => {
  try {
    const response = await api.get('/datasets/preview', {
      params: { dataset_ref: datasetRef }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get dataset preview:', error);
    throw error;
  }
};

export const validateKaggleApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await api.post('/kaggle/validate', {
      apiKey
    });
    return response.status === 200;
  } catch (error) {
    console.error('Failed to validate Kaggle API key:', error);
    return false;
  }
}; 
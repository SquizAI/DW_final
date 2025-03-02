import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { notifications } from '@mantine/notifications';

// Global loading state
type LoadingState = {
  [key: string]: boolean;
};

// Extend Axios config type to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    requestKey: string;
  };
}

const loadingState: LoadingState = {};
const loadingListeners: Array<(state: LoadingState) => void> = [];

// Function to subscribe to loading state changes
export const subscribeToLoadingState = (callback: (state: LoadingState) => void) => {
  loadingListeners.push(callback);
  // Initial call with current state
  callback({ ...loadingState });
  
  // Return unsubscribe function
  return () => {
    const index = loadingListeners.indexOf(callback);
    if (index !== -1) {
      loadingListeners.splice(index, 1);
    }
  };
};

// Function to update loading state
const updateLoadingState = (key: string, isLoading: boolean) => {
  loadingState[key] = isLoading;
  // Notify all listeners
  loadingListeners.forEach(listener => listener({ ...loadingState }));
};

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Create GraphQL client
export const graphqlClient = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for multipart/form-data and loading state
api.interceptors.request.use((config: ExtendedAxiosRequestConfig) => {
  // Set content type for form data
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }
  
  // Generate a unique key for this request
  const requestKey = `${config.method}-${config.url}`;
  
  // Update loading state
  updateLoadingState(requestKey, true);
  
  // Store the key in the config for the response interceptor
  config.metadata = { requestKey };
  
  return config;
});

// Add response interceptor for error handling and loading state
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Get the request key from metadata
    const config = response.config as ExtendedAxiosRequestConfig;
    const requestKey = config.metadata?.requestKey;
    if (requestKey) {
      // Update loading state
      updateLoadingState(requestKey, false);
    }
    
    // Show success notification for certain operations
    if (response.config.method !== 'get' && response.status >= 200 && response.status < 300) {
      const operation = response.config.method === 'post' ? 'created' : 
                        response.config.method === 'put' ? 'updated' : 
                        response.config.method === 'delete' ? 'deleted' : 'processed';
      
      notifications.show({
        title: 'Success',
        message: `Operation ${operation} successfully`,
        color: 'green',
        autoClose: 3000,
      });
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Get the request key from metadata
    const config = error.config as ExtendedAxiosRequestConfig | undefined;
    const requestKey = config?.metadata?.requestKey;
    if (requestKey) {
      // Update loading state
      updateLoadingState(requestKey, false);
    }
    
    // Extract error details
    const status = error.response?.status;
    const data = error.response?.data as any;
    const errorMessage = data?.message || data?.error || error.message || 'An error occurred';
    
    // Log error details for debugging
    console.error('API Error:', {
      status,
      url: error.config?.url,
      method: error.config?.method,
      message: errorMessage,
      data: data
    });
    
    // Show user-friendly notification based on error type
    if (status === 404) {
      notifications.show({
        title: 'Resource Not Found',
        message: 'The requested resource could not be found',
        color: 'red',
      });
    } else if (status === 401) {
      notifications.show({
        title: 'Authentication Required',
        message: 'Please log in to continue',
        color: 'red',
      });
      
      // Redirect to login page if needed
      // window.location.href = '/login';
    } else if (status === 403) {
      notifications.show({
        title: 'Access Denied',
        message: 'You do not have permission to perform this action',
        color: 'red',
      });
    } else if (status === 422) {
      // Validation errors
      const validationErrors = data.errors || {};
      const errorMessages = Object.values(validationErrors).flat();
      
      notifications.show({
        title: 'Validation Error',
        message: errorMessages.length > 0 ? errorMessages.join(', ') : errorMessage,
        color: 'red',
      });
    } else if (status === 500) {
      notifications.show({
        title: 'Server Error',
        message: 'An unexpected error occurred on the server',
        color: 'red',
      });
    } else {
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    }
    
    return Promise.reject({
      ...error,
      message: errorMessage,
      status,
      data,
    });
  }
);

// API Types
export interface Dataset {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  file_path: string;
  meta_data?: Record<string, any>;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  created_at: string;
  parent_id?: string;
}

export interface DatasetPreview {
  columns: string[];
  rowCount: number;
  sampleData: Record<string, any>[];
}

export interface UrlUploadData {
  url: string;
  type: 'github' | 'url';
  branch?: string;
  path?: string;
}

export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    [key: string]: any;
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  dataset_id: string | null | undefined;
  template: string;
  nodes: Node[];
  edges: Edge[];
  created_at?: string;
  updated_at?: string;
}

// Helper function to create API request with loading state
export const createApiRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  options: {
    loadingKey?: string;
    successMessage?: string;
    errorMessage?: string;
  } = {}
): Promise<T> => {
  const { loadingKey, successMessage, errorMessage } = options;
  
  // Set custom loading state if provided
  if (loadingKey) {
    updateLoadingState(loadingKey, true);
  }
  
  try {
    const response = await requestFn();
    
    // Show custom success message if provided
    if (successMessage) {
      notifications.show({
        title: 'Success',
        message: successMessage,
        color: 'green',
        autoClose: 3000,
      });
    }
    
    return response.data;
  } catch (error: any) {
    // Show custom error message if provided
    if (errorMessage) {
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    }
    
    throw error;
  } finally {
    // Clear custom loading state if provided
    if (loadingKey) {
      updateLoadingState(loadingKey, false);
    }
  }
};

// Datasets API with enhanced error handling
export const datasetsApi = {
  getAll: () => createApiRequest(() => api.get<Dataset[]>('/datasets/'), {
    loadingKey: 'datasets-getAll',
    errorMessage: 'Failed to fetch datasets'
  }),
  
  getById: (id: string) => createApiRequest(() => api.get<Dataset>(`/datasets/${id}`), {
    loadingKey: `dataset-${id}`,
    errorMessage: `Failed to fetch dataset ${id}`
  }),
  
  create: (data: FormData) => createApiRequest(() => api.post<Dataset>('/datasets/upload', data), {
    loadingKey: 'dataset-create',
    successMessage: 'Dataset created successfully',
    errorMessage: 'Failed to create dataset'
  }),
  
  delete: (id: string) => createApiRequest(() => api.delete(`/datasets/${id}`), {
    loadingKey: `dataset-delete-${id}`,
    successMessage: 'Dataset deleted successfully',
    errorMessage: 'Failed to delete dataset'
  }),
  
  search: (query: string) => createApiRequest(() => api.get<Dataset[]>(`/datasets/search?query=${query}`), {
    loadingKey: `datasets-search-${query}`,
    errorMessage: 'Failed to search datasets'
  }),
  
  analyze: (id: string) => createApiRequest(() => api.get<any>(`/datasets/${id}/analyze`), {
    loadingKey: `dataset-analyze-${id}`,
    errorMessage: 'Failed to analyze dataset'
  }),
  
  getActiveColumns: () => createApiRequest(() => api.get<string[]>('/datasets/active/columns'), {
    loadingKey: 'datasets-active-columns',
    errorMessage: 'Failed to fetch active columns'
  }),
  
  classify: (config: any) => createApiRequest(() => api.post<any>('/data/classify', config), {
    loadingKey: 'data-classify',
    successMessage: 'Classification completed successfully',
    errorMessage: 'Failed to classify data'
  }),
};

// Workflows API with GraphQL
export const workflowsApi = {
  getAll: async () => {
    const response = await graphqlClient.post('/graphql', {
      query: `
        query GetWorkflows {
          workflows {
            id
            name
            description
            dataset_id
            template
            nodes {
              id
              type
              position {
                x
                y
              }
              data {
                label
                type
                config
              }
            }
            edges {
              id
              source
              target
              type
            }
            created_at
            updated_at
          }
        }
      `
    });
    return response.data.data.workflows;
  },
  getById: async (id: string) => {
    const response = await graphqlClient.post('/graphql', {
      query: `
        query GetWorkflow($id: String!) {
          workflow(id: $id) {
            id
            name
            description
            dataset_id
            template
            nodes {
              id
              type
              position {
                x
                y
              }
              data {
                label
                type
                config
              }
            }
            edges {
              id
              source
              target
              type
            }
            created_at
            updated_at
          }
        }
      `,
      variables: { id }
    });
    return response.data.data.workflow;
  },
  create: async (data: Partial<Workflow>) => {
    const response = await graphqlClient.post('/graphql', {
      query: `
        mutation CreateWorkflow($input: WorkflowInput!) {
          createWorkflow(input: $input) {
            id
            name
            description
            dataset_id
            template
            nodes {
              id
              type
              position {
                x
                y
              }
              data {
                label
                type
                config
              }
            }
            edges {
              id
              source
              target
              type
            }
            created_at
            updated_at
          }
        }
      `,
      variables: { input: data }
    });
    return response.data.data.createWorkflow;
  },
  update: async (id: string, data: Partial<Workflow>) => {
    const response = await graphqlClient.post('/graphql', {
      query: `
        mutation UpdateWorkflow($id: String!, $input: WorkflowInput!) {
          updateWorkflow(id: $id, input: $input) {
            id
            name
            description
            dataset_id
            template
            nodes {
              id
              type
              position {
                x
                y
              }
              data {
                label
                type
                config
              }
            }
            edges {
              id
              source
              target
              type
            }
            created_at
            updated_at
          }
        }
      `,
      variables: { id, input: data }
    });
    return response.data.data.updateWorkflow;
  },
  delete: async (id: string) => {
    const response = await graphqlClient.post('/graphql', {
      query: `
        mutation DeleteWorkflow($id: String!) {
          deleteWorkflow(id: $id)
        }
      `,
      variables: { id }
    });
    return response.data.data.deleteWorkflow;
  },
  execute: async (id: string) => {
    const response = await graphqlClient.post('/graphql', {
      query: `
        mutation ExecuteWorkflow($id: String!) {
          executeWorkflow(id: $id)
        }
      `,
      variables: { id }
    });
    return response.data.data.executeWorkflow;
  },
  // Keep the REST API for AI generation
  generateAI: (description: string) => api.post<Workflow>('/workflows/ai/generate', { description }),
};

// Kaggle API
export const kaggleApi = {
  search: (query: string) => api.get<any>(`/kaggle/search?query=${query}`),
  download: (datasetRef: string) => api.post<any>('/kaggle/download', { dataset_ref: datasetRef }),
  getLocalDatasets: () => api.get<any>('/kaggle/local/datasets'),
  getDownloadStatuses: () => api.get<any>('/kaggle/datasets/download/status'),
  getDownloadStatus: (datasetRef: string) => api.get<any>(`/kaggle/datasets/download/status/${datasetRef}`),
  deleteDataset: (datasetRef: string, deleteFiles: boolean = true) => 
    api.delete<any>(`/kaggle/local/datasets/${datasetRef}?delete_files=${deleteFiles}`)
};

// Create a specialized API client for data management operations
export const dataManagementApi = {
  // Get all datasets
  getDatasets: async (path?: string, search?: string) => {
    const params = new URLSearchParams();
    if (path) params.append('path', path);
    if (search) params.append('search', search);
    
    const response = await api.get(`/data-management/datasets?${params.toString()}`);
    return response.data;
  },
  
  // Get all folders
  getFolders: async (path?: string) => {
    const params = new URLSearchParams();
    if (path) params.append('path', path);
    
    const response = await api.get(`/data-management/folders?${params.toString()}`);
    return response.data;
  },
  
  // Create a new folder
  createFolder: async (name: string, path: string = '/') => {
    const response = await api.post('/data-management/folders', { name, path });
    return response.data;
  },
  
  // Upload a file
  uploadFile: async (file: File, path: string = '/', onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    
    const response = await api.post('/data-management/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },
  
  // Import from URL
  importFromUrl: async (urlData: UrlUploadData) => {
    const response = await api.post('/data-management/url', urlData);
    return response.data;
  },
  
  // Get dataset preview
  getDatasetPreview: async (datasetId: string, maxRows: number = 10) => {
    const response = await api.get(`/data-management/datasets/${datasetId}/preview?max_rows=${maxRows}`);
    return response.data;
  },
  
  // Delete dataset
  deleteDataset: async (datasetId: string) => {
    const response = await api.delete(`/data-management/datasets/${datasetId}`);
    return response.data;
  },
  
  // Download dataset
  downloadDataset: (datasetId: string) => {
    return `/api/data-management/datasets/${datasetId}/download`;
  },
};

export default api; 
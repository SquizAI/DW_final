import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  tags: string[];
  nodes: any[];
  edges: any[];
  status: {
    status: string;
    progress: number;
    message: string | null;
    started_at: string | null;
    completed_at: string | null;
    error: string | null;
  };
  created_at: string;
  updated_at: string;
  owner_id: string;
  last_run: string | null;
}

export const fetchWorkflows = async (params?: any): Promise<Workflow[]> => {
  try {
    const response = await axios.get(`${API_URL}/workflows/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching workflows:', error);
    throw error;
  }
};

export const fetchWorkflowById = async (id: string): Promise<Workflow> => {
  try {
    const response = await axios.get(`${API_URL}/workflows/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching workflow with ID ${id}:`, error);
    throw error;
  }
};

export const createWorkflow = async (workflowData: Partial<Workflow>): Promise<Workflow> => {
  try {
    const response = await axios.post(`${API_URL}/workflows/`, workflowData);
    return response.data;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
};

export const updateWorkflow = async (id: string, workflowData: Partial<Workflow>): Promise<Workflow> => {
  try {
    const response = await axios.put(`${API_URL}/workflows/${id}`, workflowData);
    return response.data;
  } catch (error) {
    console.error(`Error updating workflow with ID ${id}:`, error);
    throw error;
  }
};

export const deleteWorkflow = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/workflows/${id}`);
  } catch (error) {
    console.error(`Error deleting workflow with ID ${id}:`, error);
    throw error;
  }
};

export const executeWorkflow = async (id: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/workflows/${id}/execute`);
    return response.data;
  } catch (error) {
    console.error(`Error executing workflow with ID ${id}:`, error);
    throw error;
  }
};

export const getWorkflowStatus = async (id: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/workflows/${id}/status`);
    return response.data;
  } catch (error) {
    console.error(`Error getting status for workflow with ID ${id}:`, error);
    throw error;
  }
}; 
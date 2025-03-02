# index API

## Overview

This documentation is automatically generated for the index API.

## File

```
frontend/src/api/index.ts
```

## Endpoints

```
subscribeToLoadingState = (callback: (state: LoadingState) => void) => {
api = axios.create({
graphqlClient = axios.create({
createApiRequest
datasetsApi = {
workflowsApi = {
kaggleApi = {
dataManagementApi = {
```

## Types

```
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
```

## Last Updated

Wed Feb 26 21:17:52 EST 2025

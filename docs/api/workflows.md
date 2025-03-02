# workflows API

## Overview

This documentation is automatically generated for the workflows API.

## File

```
frontend/src/api/workflows.ts
```

## Endpoints

```
fetchWorkflows
fetchWorkflowById
createWorkflow
updateWorkflow
deleteWorkflow
executeWorkflow
getWorkflowStatus
```

## Types

```
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
```

## Last Updated

Wed Feb 26 21:17:52 EST 2025

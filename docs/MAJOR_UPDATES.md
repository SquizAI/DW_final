# Data Whisperer Major Updates

## Application Analysis

After a thorough analysis of the Data Whisperer application, particularly focusing on the workflow editor, I've identified several critical issues that need to be addressed:

1. **Missing API Integration**: The workflow editor is not properly integrated with the backend APIs. The `executeNodePreview` function in `WorkflowContext.tsx` is using mock data instead of making actual API calls.

2. **Incomplete Backend Endpoints**: The `/api/workflows/node-preview` endpoint mentioned in the documentation doesn't exist in the backend implementation.

3. **Data Management API Issues**: The logs show 404 errors for `/api/data-management/datasets` endpoints, indicating missing or misconfigured API routes.

4. **Simulated Workflow Execution**: The workflow execution is currently simulated rather than using the actual workflow engine available in the backend.

5. **Disconnected Node Types**: The node types defined in the frontend don't match the node processors available in the backend's workflow engine.

## Major Updates Needed (Part 1)

### 1. Implement Node Preview API Endpoint

**Problem**: The node preview functionality is using mock data instead of real API calls.

**Solution**:
- Create a new endpoint in `backend/app/api/workflows/router.py`:
```python
@router.post("/node-preview", response_model=Dict[str, Any])
async def preview_node(node_data: Dict[str, Any]):
    """Execute a single node and return its output for preview"""
    node_id = node_data.get("id", str(uuid.uuid4()))
    node_type = node_data.get("type")
    node_config = node_data.get("config", {})
    
    # Create a node processor for the specified node type
    processor_factory = NodeProcessorFactory()
    processor = processor_factory.create_processor(node_type, node_id, node_config)
    
    # Execute the node
    try:
        result = await processor.process(None)  # No input data for preview
        return {
            "success": True,
            "data": result,
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "data": None,
            "error": str(e)
        }
```

- Update documentation to reflect the actual endpoint implementation.

### 2. Connect Frontend to Node Preview API

**Problem**: The `executeNodePreview` function in `WorkflowContext.tsx` uses mock data.

**Solution**:
- Update the function to make an actual API call:
```typescript
const executeNodePreview = useCallback(async (nodeId: string): Promise<any> => {
  try {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error('Node not found');
    }
    
    // Update node state to show it's executing
    updateNodeData(nodeId, {
      state: {
        status: 'running',
        progress: 0
      }
    });
    
    // Call the API to execute the node preview
    const response = await api.post('/workflows/node-preview', {
      id: nodeId,
      type: node.type,
      config: node.data
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to execute node preview');
    }
    
    // Update node state to show it was executed
    updateNodeData(nodeId, {
      state: {
        status: 'completed',
        progress: 100
      }
    });
    
    notifications.show({
      title: 'Preview Generated',
      message: `Successfully generated preview for ${node.data.label}`,
      color: 'green',
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error executing node preview:', error);
    
    // Update node state to show execution failed
    if (nodeId) {
      updateNodeData(nodeId, {
        state: {
          status: 'error',
          progress: 0,
          results: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
    
    notifications.show({
      title: 'Preview Failed',
      message: `Failed to generate preview for node`,
      color: 'red',
    });
    
    throw error;
  }
}, [nodes, updateNodeData]);
```

### 3. Implement Data Management API Endpoints

**Problem**: The data management API endpoints are returning 404 errors.

**Solution**:
- Create missing endpoints in the backend:
```python
@router.get("/datasets", response_model=List[Dict[str, Any]])
async def get_datasets(path: str = "/"):
    """Get all datasets in the specified path"""
    try:
        # Implementation to list datasets in the given path
        datasets = []  # Replace with actual implementation
        return datasets
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get datasets: {str(e)}"
        )
```

- Update the frontend API client to use the correct endpoints.

### 4. Map Frontend Node Types to Backend Processors

**Problem**: The node types defined in the frontend don't match the node processors in the backend.

**Solution**:
- Create a mapping between frontend node types and backend processors:
```typescript
// In frontend/src/constants/nodeTypes.ts
export const NODE_TYPE_MAPPING = {
  // Data Source Nodes
  datasetLoader: 'DataSourceProcessor',
  databaseConnector: 'DataSourceProcessor',
  apiDataFetcher: 'DataSourceProcessor',
  
  // Transformation Nodes
  structuralAnalysis: 'DataTransformationProcessor',
  qualityChecker: 'DataTransformationProcessor',
  dataMerger: 'DataTransformationProcessor',
  dataBinning: 'DataTransformationProcessor',
  lambdaFunction: 'DataTransformationProcessor',
  featureEngineer: 'DataTransformationProcessor',
  
  // Analysis Nodes
  edaAnalysis: 'AnalysisProcessor',
  featureImportance: 'AnalysisProcessor',
  binaryClassifier: 'AnalysisProcessor',
  
  // Export Nodes
  reportGenerator: 'ExportProcessor',
  dataExporter: 'ExportProcessor'
};
```

- Use this mapping when making API calls to ensure the correct processor is used.

### 5. Implement Real Workflow Execution

**Problem**: The workflow execution is simulated rather than using the actual workflow engine.

**Solution**:
- Update the `executeWorkflow` function in `WorkflowContext.tsx` to use the real API:
```typescript
const executeWorkflow = useCallback(async () => {
  if (!workflowId) {
    throw new Error('No workflow ID provided');
  }
  
  try {
    setIsExecuting(true);
    setExecutionProgress(0);
    
    // Call the API to execute the workflow
    await workflowsApi.execute(workflowId);
    
    // Set up polling for execution status
    const statusInterval = setInterval(async () => {
      try {
        const status = await api.get(`/workflows/${workflowId}/status`);
        
        setExecutionProgress(status.data.progress * 100);
        
        if (status.data.status === 'completed') {
          setIsExecuting(false);
          clearInterval(statusInterval);
          
          notifications.show({
            title: 'Workflow Completed',
            message: 'Workflow execution completed successfully',
            color: 'green',
          });
        } else if (status.data.status === 'failed') {
          setIsExecuting(false);
          clearInterval(statusInterval);
          
          notifications.show({
            title: 'Workflow Failed',
            message: status.data.error || 'Workflow execution failed',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Error polling workflow status:', error);
      }
    }, 1000);
    
    return () => clearInterval(statusInterval);
  } catch (error) {
    setIsExecuting(false);
    console.error('Error executing workflow:', error);
    
    notifications.show({
      title: 'Execution Failed',
      message: error instanceof Error ? error.message : 'Failed to execute workflow',
      color: 'red',
    });
    
    throw error;
  }
}, [workflowId]);
```

### 6. Implement Node Configuration Validation

**Problem**: Node configurations are not validated before execution.

**Solution**:
- Create validation schemas for each node type:
```typescript
// In frontend/src/schemas/nodeValidation.ts
import * as z from 'zod';

export const datasetLoaderSchema = z.object({
  source: z.string().min(1, "Source is required"),
  fileType: z.enum(["csv", "json", "parquet", "excel"]),
  hasHeader: z.boolean().optional().default(true)
});

export const qualityCheckerSchema = z.object({
  checkTypes: z.array(z.enum(["missing", "outliers", "duplicates"])),
  threshold: z.number().min(0).max(1),
  autoFix: z.boolean().optional().default(false),
  fixStrategy: z.object({
    missing: z.enum(["mean", "median", "mode", "constant"]).optional(),
    outliers: z.enum(["clip", "remove", "impute"]).optional(),
    duplicates: z.enum(["remove", "keep_first", "keep_last"]).optional()
  }).optional()
});

// Add schemas for other node types
```

- Add validation before executing nodes:
```typescript
// Validate node configuration before execution
const validateNodeConfig = (node: WorkflowNode): boolean => {
  try {
    const nodeType = node.type as keyof typeof nodeValidationSchemas;
    const schema = nodeValidationSchemas[nodeType];
    
    if (!schema) {
      console.warn(`No validation schema found for node type: ${nodeType}`);
      return true;
    }
    
    schema.parse(node.data);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      notifications.show({
        title: 'Validation Error',
        message: `Invalid node configuration: ${errorMessages}`,
        color: 'red',
      });
    }
    return false;
  }
};
```

### 7. Implement Data Source Integration

**Problem**: Data sources are not properly integrated with the backend.

**Solution**:
- Create a data source context to manage available data sources:
```typescript
// In frontend/src/contexts/DataSourceContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'database' | 'api';
  path?: string;
  connection?: string;
  schema?: any;
}

interface DataSourceContextType {
  dataSources: DataSource[];
  loading: boolean;
  error: string | null;
  refreshDataSources: () => Promise<void>;
  getDataSourceById: (id: string) => DataSource | undefined;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

export const DataSourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refreshDataSources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/data-sources');
      setDataSources(response.data);
    } catch (error) {
      console.error('Error fetching data sources:', error);
      setError('Failed to fetch data sources');
    } finally {
      setLoading(false);
    }
  };
  
  const getDataSourceById = (id: string) => {
    return dataSources.find(ds => ds.id === id);
  };
  
  useEffect(() => {
    refreshDataSources();
  }, []);
  
  return (
    <DataSourceContext.Provider value={{
      dataSources,
      loading,
      error,
      refreshDataSources,
      getDataSourceById
    }}>
      {children}
    </DataSourceContext.Provider>
  );
};

export const useDataSources = () => {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error('useDataSources must be used within a DataSourceProvider');
  }
  return context;
};
```

- Integrate with the dataset loader node.

### 8. Implement Workflow Templates

**Problem**: There's no way to create workflows from templates.

**Solution**:
- Create a templates API and UI:
```typescript
// In frontend/src/api/index.ts
export const templatesApi = {
  getAll: () => api.get<any>('/workflows/templates'),
  getById: (id: string) => api.get<any>(`/workflows/templates/${id}`),
  createFromTemplate: (templateId: string, name: string) => 
    api.post<any>('/workflows/from-template', { template_id: templateId, name })
};

// In frontend/src/components/WorkflowTemplates.tsx
import React, { useState, useEffect } from 'react';
import { Card, Text, Button, Group, SimpleGrid, Loader } from '@mantine/core';
import { templatesApi } from '../api';
import { useNavigate } from 'react-router-dom';

export const WorkflowTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await templatesApi.getAll();
        setTemplates(response.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  const handleCreateFromTemplate = async (templateId: string, name: string) => {
    try {
      const response = await templatesApi.createFromTemplate(templateId, name);
      navigate(`/workflow/${response.data.id}`);
    } catch (error) {
      console.error('Error creating workflow from template:', error);
    }
  };
  
  if (loading) {
    return <Loader />;
  }
  
  return (
    <SimpleGrid cols={3} spacing="md">
      {templates.map(template => (
        <Card key={template.id} shadow="sm" p="lg">
          <Text weight={500} size="lg">{template.name}</Text>
          <Text size="sm" color="dimmed">{template.description}</Text>
          <Button 
            fullWidth 
            mt="md" 
            onClick={() => handleCreateFromTemplate(template.id, template.name)}
          >
            Use Template
          </Button>
        </Card>
      ))}
    </SimpleGrid>
  );
};
```

### 9. Implement Real-time Execution Updates

**Problem**: There's no real-time feedback during workflow execution.

**Solution**:
- Implement WebSocket connection for real-time updates:
```typescript
// In frontend/src/hooks/useWorkflowExecution.ts
import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

export const useWorkflowExecution = (workflowId: string | null) => {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  
  const { lastMessage } = useWebSocket(
    workflowId ? `/api/ws/workflows/${workflowId}/execution` : null
  );
  
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        if (data.type === 'status') {
          setStatus(data.status);
          setProgress(data.progress);
        } else if (data.type === 'node_status') {
          setNodeStatuses(prev => ({
            ...prev,
            [data.node_id]: {
              status: data.status,
              progress: data.progress,
              message: data.message,
              error: data.error
            }
          }));
        } else if (data.type === 'error') {
          setError(data.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage]);
  
  return {
    status,
    progress,
    nodeStatuses,
    error
  };
};
```

- Add WebSocket server implementation in the backend.

### 10. Implement Workflow Validation

**Problem**: Workflows are not validated before execution.

**Solution**:
- Create a workflow validation function:
```typescript
// In frontend/src/utils/workflowValidation.ts
import { Edge } from 'reactflow';
import { WorkflowNode } from '../types';

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export function validateWorkflow(nodes: WorkflowNode[], edges: Edge[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  
  // Check for disconnected nodes
  const connectedNodeIds = new Set<string>();
  
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });
  
  nodes.forEach(node => {
    // Skip source nodes (they don't need inputs)
    if (node.type === 'datasetLoader' || node.type === 'databaseConnector' || node.type === 'apiDataFetcher') {
      return;
    }
    
    if (!connectedNodeIds.has(node.id)) {
      issues.push({
        type: 'error',
        message: `Node "${node.data.label || node.id}" is disconnected`,
        nodeId: node.id
      });
    }
  });
  
  // Check for cycles
  if (detectCycle(nodes, edges)) {
    issues.push({
      type: 'error',
      message: 'Workflow contains cycles, which are not supported'
    });
  }
  
  // Validate node configurations
  nodes.forEach(node => {
    // Implement node-specific validation
    // ...
  });
  
  return {
    valid: issues.filter(issue => issue.type === 'error').length === 0,
    issues
  };
}

function detectCycle(nodes: WorkflowNode[], edges: Edge[]): boolean {
  // Implementation of cycle detection algorithm
  // ...
  return false;
}
```

- Add validation before workflow execution. 
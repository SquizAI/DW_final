import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Edge, Position, XYPosition } from 'reactflow';
import { nodeTypes } from './nodes';
import { WorkflowNode } from './nodes/reactflow';
import { generateNodeId, NodeType } from './utils/nodeUtils';
import { workflowsApi } from '@/api';
import { notifications } from '@mantine/notifications';
import { 
  WorkflowNodeData,
  NodeData,
  DatasetLoaderNodeData,
  StructuralAnalysisNodeData,
  QualityCheckerNodeData,
  DataMergerNodeData,
  DataBinningNodeData,
  LambdaFunctionNodeData,
  FeatureEngineerNodeData,
  EDAAnalysisNodeData,
  FeatureImportanceNodeData,
  BinaryClassifierNodeData,
  ReportGeneratorNodeData,
} from './nodes/types';

function createNodeData(type: NodeType): WorkflowNodeData {
  const baseData: Omit<NodeData, 'type'> = {
    label: String(type).replace(/([A-Z])/g, ' $1').trim(),
    state: {
      status: 'idle' as const,
      progress: 0,
    },
  };

  switch (type) {
    case 'datasetLoader': {
      const data: DatasetLoaderNodeData = {
        ...baseData,
        type: 'datasetLoader',
        validation: {
          schema: {},
          constraints: {},
        },
      };
      return data;
    }
    case 'structuralAnalysis': {
      const data: StructuralAnalysisNodeData = {
        ...baseData,
        type: 'structuralAnalysis',
        analysis: {
          dataTypes: {},
          missingValues: {},
          uniqueValues: {},
          patterns: {},
        },
      };
      return data;
    }
    case 'qualityChecker': {
      const data: QualityCheckerNodeData = {
        ...baseData,
        type: 'qualityChecker',
        quality: {
          score: 0,
          metrics: {},
          issues: [],
        },
      };
      return data;
    }
    case 'dataMerger': {
      const data: DataMergerNodeData = {
        ...baseData,
        type: 'dataMerger',
        merge: {
          type: 'inner',
          keys: [],
          conflicts: {},
          validation: {},
        },
      };
      return data;
    }
    case 'dataBinning': {
      const data: DataBinningNodeData = {
        ...baseData,
        type: 'dataBinning',
        binning: {
          method: 'equal_width',
          bins: 10,
          columns: [],
        },
      };
      return data;
    }
    case 'lambdaFunction': {
      const data: LambdaFunctionNodeData = {
        ...baseData,
        type: 'lambdaFunction',
        function: {
          code: '',
          language: 'python',
          params: {},
          validation: false,
        },
      };
      return data;
    }
    case 'featureEngineer': {
      const data: FeatureEngineerNodeData = {
        ...baseData,
        type: 'featureEngineer',
        features: {
          new: [],
          transformed: [],
          encoded: {},
          scaled: {},
        },
      };
      return data;
    }
    case 'edaAnalysis': {
      const data: EDAAnalysisNodeData = {
        ...baseData,
        type: 'edaAnalysis',
        analysis: {
          univariate: {},
          bivariate: {},
          multivariate: {},
          correlations: {},
        },
      };
      return data;
    }
    case 'featureImportance': {
      const data: FeatureImportanceNodeData = {
        ...baseData,
        type: 'featureImportance',
        importance: {
          scores: {},
          methods: {},
          rankings: [],
        },
      };
      return data;
    }
    case 'binaryClassifier': {
      const data: BinaryClassifierNodeData = {
        ...baseData,
        type: 'binaryClassifier',
        model: {
          type: 'logistic_regression',
          params: {},
          performance: {
            accuracy: 0,
            precision: 0,
            recall: 0,
            f1: 0,
            auc: 0,
          },
        },
      };
      return data;
    }
    case 'reportGenerator': {
      const data: ReportGeneratorNodeData = {
        ...baseData,
        type: 'reportGenerator',
        report: {
          sections: [],
          metadata: {},
          format: 'html',
        },
      };
      return data;
    }
    default: {
      throw new Error(`Unhandled node type: ${type}`);
    }
  }
}

interface WorkflowContextType {
  nodes: WorkflowNode[];
  edges: Edge[];
  selectedNode: WorkflowNode | null;
  workflowId: string | null;
  workflowName: string;
  workflowDescription: string;
  isExecuting: boolean;
  executionProgress: number;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (type: NodeType, position: XYPosition) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  selectNode: (nodeId: string | null) => void;
  deleteNode: (nodeId: string) => void;
  saveWorkflow: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  executeWorkflow: () => Promise<void>;
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (description: string) => void;
  createNewWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState<string>('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionProgress, setExecutionProgress] = useState<number>(0);

  const addNode = useCallback((type: NodeType, position: XYPosition) => {
    const nodeId = generateNodeId();
    const newNode: WorkflowNode = {
      id: nodeId,
      type: String(type),
      position,
      data: createNodeData(type),
    };
    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, []);

  const updateNodeData = useCallback((nodeId: string, data: Partial<WorkflowNodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            } as WorkflowNodeData,
          };
        }
        return node;
      })
    );
  }, []);

  const selectNode = useCallback((nodeId: string | null) => {
    if (nodeId === null) {
      setSelectedNode(null);
      return;
    }
    
    setSelectedNode((prev) => {
      if (prev?.id === nodeId) return prev;
      
      const node = nodes.find((n) => n.id === nodeId);
      return node || null;
    });
  }, [nodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const saveWorkflow = useCallback(async () => {
    try {
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
        template: 'custom',
      };

      let savedWorkflow;
      if (workflowId) {
        savedWorkflow = await workflowsApi.update(workflowId, workflowData);
        notifications.show({
          title: 'Workflow Updated',
          message: `Workflow "${workflowName}" has been updated successfully.`,
          color: 'green',
        });
      } else {
        savedWorkflow = await workflowsApi.create(workflowData);
        setWorkflowId(savedWorkflow.id);
        notifications.show({
          title: 'Workflow Created',
          message: `Workflow "${workflowName}" has been created successfully.`,
          color: 'green',
        });
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save workflow. Please try again.',
        color: 'red',
      });
    }
  }, [workflowId, workflowName, workflowDescription, nodes, edges]);

  const loadWorkflow = useCallback(async (id: string) => {
    try {
      const workflow = await workflowsApi.getById(id);
      if (workflow) {
        setWorkflowId(workflow.id);
        setWorkflowName(workflow.name);
        setWorkflowDescription(workflow.description || '');
        setNodes(workflow.nodes);
        setEdges(workflow.edges);
        notifications.show({
          title: 'Workflow Loaded',
          message: `Workflow "${workflow.name}" has been loaded successfully.`,
          color: 'blue',
        });
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load workflow. Please try again.',
        color: 'red',
      });
    }
  }, []);

  const executeWorkflow = useCallback(async () => {
    if (!workflowId) {
      notifications.show({
        title: 'Error',
        message: 'Please save the workflow before executing it.',
        color: 'red',
      });
      return;
    }

    try {
      setIsExecuting(true);
      setExecutionProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExecutionProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 500);
      
      await workflowsApi.execute(workflowId);
      
      // Ensure we reach 100%
      setExecutionProgress(100);
      
      setTimeout(() => {
        setIsExecuting(false);
        notifications.show({
          title: 'Execution Complete',
          message: `Workflow "${workflowName}" has been executed successfully.`,
          color: 'green',
        });
      }, 500);
    } catch (error) {
      console.error('Error executing workflow:', error);
      setIsExecuting(false);
      notifications.show({
        title: 'Execution Failed',
        message: 'Failed to execute workflow. Please try again.',
        color: 'red',
      });
    }
  }, [workflowId, workflowName]);

  const createNewWorkflow = useCallback(() => {
    setWorkflowId(null);
    setWorkflowName('New Workflow');
    setWorkflowDescription('');
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setIsExecuting(false);
    setExecutionProgress(0);
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        nodes,
        edges,
        selectedNode,
        workflowId,
        workflowName,
        workflowDescription,
        isExecuting,
        executionProgress,
        setNodes,
        setEdges,
        addNode,
        updateNodeData,
        selectNode,
        deleteNode,
        saveWorkflow,
        loadWorkflow,
        executeWorkflow,
        setWorkflowName,
        setWorkflowDescription,
        createNewWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}; 
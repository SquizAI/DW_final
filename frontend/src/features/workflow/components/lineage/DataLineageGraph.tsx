import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node as ReactFlowNode,
  Edge,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  useReactFlow,
  XYPosition,
  ReactFlowProvider,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Paper, 
  Title, 
  Text, 
  Group, 
  Button, 
  Select, 
  Badge, 
  Tooltip, 
  ActionIcon,
  Divider,
  Box,
  ThemeIcon,
  Loader,
  Stack
} from '@mantine/core';
import { 
  IconRefresh, 
  IconDownload, 
  IconMaximize, 
  IconMinimize,
  IconZoomIn,
  IconZoomOut,
  IconFocus,
  IconDatabase,
  IconTable,
  IconArrowsExchange,
  IconChartBar,
  IconFileExport,
  IconInfoCircle
} from '@tabler/icons-react';
import { useWorkflow } from '../../WorkflowContext';

// Custom node types
const nodeTypes: NodeTypes = {
  dataset: ({ data, xPos, yPos, isConnectable, sourcePosition, targetPosition, dragHandle, zIndex, dragging, ...rest }: any) => {
    // Create a separate props object that won't be passed to the DOM
    const flowProps = { xPos, yPos, isConnectable, sourcePosition, targetPosition, dragHandle, zIndex, dragging };
    
    return (
      <div 
        className="dataset-node"
        style={{
          background: data.format === 'csv' ? '#e6f7ff' : 
                     data.format === 'json' ? '#fff7e6' : 
                     data.format === 'parquet' ? '#f6ffed' : '#f9f0ff',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          padding: '10px',
          width: '180px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}
        {...rest}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.label}</div>
        {data.format && (
          <Badge size="sm" color={
            data.format === 'csv' ? 'blue' : 
            data.format === 'json' ? 'orange' : 
            data.format === 'parquet' ? 'green' : 'violet'
          }>
            {data.format.toUpperCase()}
          </Badge>
        )}
        {data.columns && (
          <div style={{ marginTop: '8px', fontSize: '12px' }}>
            <Text size="xs" fw={500}>Columns: {data.columns.length}</Text>
            <div style={{ 
              maxHeight: '60px', 
              overflowY: 'auto', 
              fontSize: '10px',
              marginTop: '4px'
            }}>
              {data.columns.slice(0, 5).map((col: string, i: number) => (
                <div key={i} style={{ padding: '2px 0' }}>{col}</div>
              ))}
              {data.columns.length > 5 && (
                <div style={{ fontStyle: 'italic' }}>+{data.columns.length - 5} more</div>
              )}
            </div>
          </div>
        )}
        <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
        <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
      </div>
    );
  },
  transformation: ({ data, ...props }: any) => (
    <div
      style={{
        padding: '10px',
        borderRadius: '5px',
        background: 'var(--mantine-color-violet-1)',
        border: '1px solid var(--mantine-color-violet-5)',
        width: 180
      }}
      {...props}
    >
      <Group mb={5}>
        <ThemeIcon size="md" variant="light" color="violet" radius="md">
          <IconArrowsExchange size={14} />
        </ThemeIcon>
        <Text size="sm" fw={500}>{data.label}</Text>
      </Group>
      {data.operation && (
        <Badge size="sm" color="violet" variant="light">
          {data.operation}
        </Badge>
      )}
    </div>
  ),
  analysis: ({ data, ...props }: any) => (
    <div
      style={{
        padding: '10px',
        borderRadius: '5px',
        background: 'var(--mantine-color-green-1)',
        border: '1px solid var(--mantine-color-green-5)',
        width: 180
      }}
      {...props}
    >
      <Group mb={5}>
        <ThemeIcon size="md" variant="light" color="green" radius="md">
          <IconChartBar size={14} />
        </ThemeIcon>
        <Text size="sm" fw={500}>{data.label}</Text>
      </Group>
      {data.metrics && (
        <Box 
          style={{ 
            fontSize: '12px', 
            background: 'var(--mantine-color-green-0)',
            padding: '5px',
            borderRadius: '3px'
          }}
        >
          {Object.entries(data.metrics).map(([key, value]: [string, any], i: number) => (
            <div key={i} style={{ marginBottom: '2px' }}>
              <Text size="xs">{key}: <b>{value}</b></Text>
            </div>
          ))}
        </Box>
      )}
    </div>
  ),
  export: ({ data, ...props }: any) => (
    <div
      style={{
        padding: '10px',
        borderRadius: '5px',
        background: 'var(--mantine-color-orange-1)',
        border: '1px solid var(--mantine-color-orange-5)',
        width: 180
      }}
      {...props}
    >
      <Group mb={5}>
        <ThemeIcon size="md" variant="light" color="orange" radius="md">
          <IconFileExport size={14} />
        </ThemeIcon>
        <Text size="sm" fw={500}>{data.label}</Text>
      </Group>
      {data.format && (
        <Badge size="sm" color="orange" variant="light">
          {data.format}
        </Badge>
      )}
    </div>
  )
};

// Define edgeTypes or remove it from ReactFlow
const edgeTypes = {}; // Empty object if no custom edge types are needed

// Define node data types
interface NodeData {
  label: string;
  columns?: string[];
  operation?: string;
  metrics?: Record<string, any>;
  format?: string;
}

// Define custom node type with position
type CustomNode = {
  id: string;
  type: string;
  position: XYPosition;
  data: NodeData;
};

// Sample lineage data
const initialNodes: CustomNode[] = [
  {
    id: 'dataset-1',
    type: 'dataset',
    position: { x: 50, y: 100 },
    data: { 
      label: 'Raw Customer Data',
      columns: ['customer_id', 'name', 'age', 'gender', 'income', 'signup_date']
    }
  },
  {
    id: 'transformation-1',
    type: 'transformation',
    position: { x: 300, y: 50 },
    data: { 
      label: 'Data Cleaning',
      operation: 'Remove Nulls & Duplicates'
    }
  },
  {
    id: 'transformation-2',
    type: 'transformation',
    position: { x: 300, y: 150 },
    data: { 
      label: 'Feature Engineering',
      operation: 'Create Derived Features'
    }
  },
  {
    id: 'dataset-2',
    type: 'dataset',
    position: { x: 550, y: 100 },
    data: { 
      label: 'Processed Data',
      columns: ['customer_id', 'name', 'age', 'gender', 'income', 'signup_date', 'customer_segment', 'days_since_signup']
    }
  },
  {
    id: 'analysis-1',
    type: 'analysis',
    position: { x: 800, y: 50 },
    data: { 
      label: 'Customer Segmentation',
      metrics: {
        'clusters': 4,
        'silhouette': 0.72
      }
    }
  },
  {
    id: 'analysis-2',
    type: 'analysis',
    position: { x: 800, y: 150 },
    data: { 
      label: 'Churn Prediction',
      metrics: {
        'accuracy': '87%',
        'f1_score': 0.83
      }
    }
  },
  {
    id: 'export-1',
    type: 'export',
    position: { x: 1050, y: 100 },
    data: { 
      label: 'Export Results',
      format: 'CSV & Dashboard'
    }
  }
];

const initialEdges: Edge[] = [
  {
    id: 'edge-1',
    source: 'dataset-1',
    target: 'transformation-1',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'edge-2',
    source: 'dataset-1',
    target: 'transformation-2',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'edge-3',
    source: 'transformation-1',
    target: 'dataset-2',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'edge-4',
    source: 'transformation-2',
    target: 'dataset-2',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'edge-5',
    source: 'dataset-2',
    target: 'analysis-1',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'edge-6',
    source: 'dataset-2',
    target: 'analysis-2',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'edge-7',
    source: 'analysis-1',
    target: 'export-1',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'edge-8',
    source: 'analysis-2',
    target: 'export-1',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }
];

interface DataLineageGraphProps {
  workflowId?: string;
  isLoading?: boolean;
  height?: number;
}

export const DataLineageGraphInner: React.FC<DataLineageGraphProps> = ({
  workflowId,
  isLoading = false,
  height = 600
}) => {
  const { nodes: workflowNodes, edges: workflowEdges } = useWorkflow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [viewMode, setViewMode] = useState<'logical' | 'physical'>('logical');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const reactFlowInstance = useReactFlow();
  
  // Generate lineage from workflow
  const generateLineageFromWorkflow = useCallback(() => {
    // This would be implemented to convert workflow nodes/edges to lineage nodes/edges
    // For now, we'll just use the sample data
    console.log('Generating lineage from workflow...');
    setNodes(initialNodes as any);
    setEdges(initialEdges);
  }, [setNodes, setEdges]);
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Handle view mode change
  const handleViewModeChange = (value: string | null) => {
    setViewMode(value as 'logical' | 'physical' || 'logical');
  };
  
  // Export lineage as image
  const exportAsImage = () => {
    // This would be implemented to export the lineage graph as an image
    console.log('Exporting lineage as image...');
  };
  
  // Effect to generate lineage when workflow changes
  useEffect(() => {
    if (workflowNodes.length > 0) {
      generateLineageFromWorkflow();
    }
  }, [workflowNodes, workflowEdges, generateLineageFromWorkflow]);
  
  return (
    <div style={{ 
      width: '100%', 
      height: `${height}px`,
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      position: 'relative'
    }}>
      {isLoading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%' 
        }}>
          <Loader size="lg" />
        </div>
      ) : (
        <>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-left"
            minZoom={0.2}
            maxZoom={2}
            style={{ width: '100%', height: '100%' }}
          >
            <Controls />
            <Background color="#f8f8f8" gap={12} size={1} />
            
            <Panel position="top-right">
              <Group gap={5}>
                <Select
                  size="xs"
                  value={viewMode}
                  onChange={handleViewModeChange}
                  data={[
                    { value: 'default', label: 'Default View' },
                    { value: 'data-flow', label: 'Data Flow' },
                    { value: 'dependency', label: 'Dependencies' }
                  ]}
                  style={{ width: 150 }}
                />
                <Tooltip label="Export as Image">
                  <ActionIcon size="sm" variant="light" onClick={exportAsImage}>
                    <IconDownload size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Fullscreen">
                  <ActionIcon size="sm" variant="light" onClick={toggleFullscreen}>
                    <IconMaximize size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Panel>
          </ReactFlow>
        </>
      )}
    </div>
  );
};

// Wrap with ReactFlow provider
export const DataLineageGraph: React.FC<DataLineageGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <DataLineageGraphInner {...props} />
    </ReactFlowProvider>
  );
};

export default DataLineageGraph; 
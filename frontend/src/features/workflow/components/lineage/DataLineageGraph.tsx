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
  dataset: ({ data, xPos, yPos, isConnectable, sourcePosition, targetPosition, dragHandle, zIndex, dragging, selected, id, ...rest }: any) => {
    // Filter out React Flow specific props that shouldn't be passed to DOM
    const { style, ...domProps } = rest;
    
    // Convert any camelCase props to lowercase for DOM elements
    const sanitizedProps = Object.keys(domProps).reduce((acc, key) => {
      const newKey = key.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
      return { ...acc, [newKey]: domProps[key] };
    }, {});
    
    return (
      <div 
        className="dataset-node"
        style={{
          background: '#e6f7ff',
          border: `1px solid ${selected ? '#1890ff' : '#d9d9d9'}`,
          borderRadius: '4px',
          padding: '10px',
          width: '180px',
          boxShadow: selected ? '0 0 0 2px #1890ff' : '0 2px 5px rgba(0,0,0,0.1)',
          ...style
        }}
        {...sanitizedProps}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.label || 'Dataset'}</div>
        {data.format && (
          <Badge size="sm" color="blue">
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
        
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#1890ff' }}
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#1890ff' }}
          isConnectable={isConnectable}
        />
      </div>
    );
  },
  transformation: ({ data, ...props }: any) => (
    <div
      style={{
        padding: '10px',
        borderRadius: '5px',
        background: 'var(--mantine-color-blue-1)',
        border: '1px solid var(--mantine-color-blue-5)',
        width: 180
      }}
      {...Object.entries(props).reduce((acc, [key, value]) => {
        if (['sourcePosition', 'targetPosition', 'isConnectable', 'dragging', 'dragHandle', 'zIndex', 'xPos', 'yPos'].includes(key)) {
          return acc;
        }
        const domKey = key.toLowerCase();
        return { ...acc, [domKey]: value };
      }, {})}
    >
      <Group mb={5}>
        <ThemeIcon size="md" variant="light" color="blue" radius="md">
          <IconArrowsExchange size={14} />
        </ThemeIcon>
        <Text size="sm" fw={500}>{data.label}</Text>
      </Group>
      {data.operation && (
        <Badge size="xs" color="blue" variant="light" mb={5}>
          {data.operation}
        </Badge>
      )}
    </div>
  ),
  source: ({ data, xPos, yPos, isConnectable, sourcePosition, targetPosition, dragHandle, zIndex, dragging, selected, id, ...rest }: any) => {
    // Filter out React Flow specific props
    const { style, ...domProps } = rest;
    
    // Convert any camelCase props to lowercase for DOM elements
    const sanitizedProps = Object.keys(domProps).reduce((acc, key) => {
      const newKey = key.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
      return { ...acc, [newKey]: domProps[key] };
    }, {});
    
    return (
      <div 
        className="source-node"
        style={{
          background: '#e6fcf5',
          border: `1px solid ${selected ? '#13c2c2' : '#d9d9d9'}`,
          borderRadius: '4px',
          padding: '10px',
          width: '180px',
          boxShadow: selected ? '0 0 0 2px #13c2c2' : '0 2px 5px rgba(0,0,0,0.1)',
          ...style
        }}
        {...sanitizedProps}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.label || 'Data Source'}</div>
        {data.source && (
          <Badge size="sm" color="teal">
            {data.source.toUpperCase()}
          </Badge>
        )}
        {data.metrics && (
          <div style={{ marginTop: '8px', fontSize: '12px' }}>
            <Text size="xs" fw={500}>Records: {data.metrics.records || 0}</Text>
            <Text size="xs">Size: {data.metrics.size || '0 KB'}</Text>
          </div>
        )}
        
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#13c2c2' }}
          isConnectable={isConnectable}
        />
      </div>
    );
  },
  analysis: ({ data, xPos, yPos, isConnectable, sourcePosition, targetPosition, dragHandle, zIndex, dragging, selected, id, ...rest }: any) => {
    // Filter out React Flow specific props
    const { style, ...domProps } = rest;
    
    // Convert any camelCase props to lowercase for DOM elements
    const sanitizedProps = Object.keys(domProps).reduce((acc, key) => {
      const newKey = key.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
      return { ...acc, [newKey]: domProps[key] };
    }, {});
    
    return (
      <div 
        className="analysis-node"
        style={{
          background: '#f6ffed',
          border: `1px solid ${selected ? '#52c41a' : '#d9d9d9'}`,
          borderRadius: '4px',
          padding: '10px',
          width: '180px',
          boxShadow: selected ? '0 0 0 2px #52c41a' : '0 2px 5px rgba(0,0,0,0.1)',
          ...style
        }}
        {...sanitizedProps}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.label || 'Analysis'}</div>
        {data.type && (
          <Badge size="sm" color="green">
            {data.type.toUpperCase()}
          </Badge>
        )}
        {data.metrics && (
          <div style={{ marginTop: '8px', fontSize: '12px' }}>
            <Text size="xs">Features: {data.metrics.features || 0}</Text>
            <Text size="xs">Score: {data.metrics.score || 'N/A'}</Text>
          </div>
        )}
        
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#52c41a' }}
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#52c41a' }}
          isConnectable={isConnectable}
        />
      </div>
    );
  },
  export: ({ data, xPos, yPos, isConnectable, sourcePosition, targetPosition, dragHandle, zIndex, dragging, selected, id, ...rest }: any) => {
    // Filter out React Flow specific props
    const { style, ...domProps } = rest;
    
    // Convert any camelCase props to lowercase for DOM elements
    const sanitizedProps = Object.keys(domProps).reduce((acc, key) => {
      const newKey = key.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`);
      return { ...acc, [newKey]: domProps[key] };
    }, {});
    
    return (
      <div 
        className="export-node"
        style={{
          background: '#fff7e6',
          border: `1px solid ${selected ? '#fa8c16' : '#d9d9d9'}`,
          borderRadius: '4px',
          padding: '10px',
          width: '180px',
          boxShadow: selected ? '0 0 0 2px #fa8c16' : '0 2px 5px rgba(0,0,0,0.1)',
          ...style
        }}
        {...sanitizedProps}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.label || 'Export'}</div>
        {data.format && (
          <Badge size="sm" color="orange">
            {data.format.toUpperCase()}
          </Badge>
        )}
        {data.destination && (
          <div style={{ marginTop: '8px', fontSize: '12px' }}>
            <Text size="xs" fw={500}>Destination: {data.destination}</Text>
          </div>
        )}
        
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#fa8c16' }}
          isConnectable={isConnectable}
        />
      </div>
    );
  }
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
      border: '1px solid var(--mantine-color-gray-3)',
      borderRadius: 'var(--mantine-radius-md)',
      overflow: 'hidden'
    }}>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
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
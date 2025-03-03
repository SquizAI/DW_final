import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
  Connection,
  Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  NodeTypes,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflow } from '../../WorkflowContext';
import { Box, ActionIcon, Tooltip, Group, Paper, Text, RingProgress } from '@mantine/core';
import { 
  IconZoomIn, 
  IconZoomOut, 
  IconMaximize, 
  IconArrowsMinimize,
  IconArrowLeft,
  IconArrowRight,
  IconInfoCircle,
  IconBrain
} from '@tabler/icons-react';
import { nodeTypes } from '../../nodes';
import { WorkflowNode } from '../../nodes/reactflow';

// CSS styles for ReactFlow
const reactFlowContainerStyle = {
  width: '100%',
  height: '100%',
  position: 'relative' as const,
  flex: 1,
  display: 'flex' as const,
  overflow: 'hidden',
};

const reactFlowStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute' as const,
  top: 0,
  left: 0,
};

const nodeTooltipStyle = {
  position: 'fixed' as const,
  zIndex: 1000,
  pointerEvents: 'none' as const,
};

// Enhanced node tooltip component
interface NodeTooltipProps {
  node: WorkflowNode;
}

const NodeTooltip: React.FC<NodeTooltipProps> = ({ node }) => {
  return (
    <Paper p="xs" shadow="md" style={{ maxWidth: 300 }}>
      <Text fw={700} mb={5}>{node.data.label}</Text>
      <Text size="sm" mb={10}>{node.data.description || 'No description available'}</Text>
      
      {node.data.state?.status && (
        <Group mb={5}>
          <Text size="xs" fw={500}>Status:</Text>
          <Text 
            size="xs" 
            c={
              node.data.state.status === 'completed' ? 'green' :
              node.data.state.status === 'error' ? 'red' :
              node.data.state.status === 'working' ? 'blue' : 'gray'
            }
          >
            {node.data.state.status}
          </Text>
        </Group>
      )}
      
      {node.data.state?.progress !== undefined && (
        <Group mb={5}>
          <Text size="xs" fw={500}>Progress:</Text>
          <RingProgress 
            size={24} 
            thickness={3} 
            roundCaps 
            sections={[{ value: node.data.state.progress, color: 'blue' }]} 
            label={
              <Text size="xs" ta="center">{node.data.state.progress}%</Text>
            }
          />
        </Group>
      )}
      
      <Group mt={10} justify="flex-end">
        <ActionIcon size="sm" variant="subtle">
          <IconBrain size={16} />
        </ActionIcon>
      </Group>
    </Paper>
  );
};

interface WorkflowCanvasProps {
  showMinimap?: boolean;
  showControls?: boolean;
  showTooltips?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  showMinimap = true,
  showControls = true,
  showTooltips = true,
  canvasWidth,
  canvasHeight
}) => {
  const { 
    nodes, 
    edges, 
    setNodes,
    setEdges,
    selectNode,
    selectedNode
  } = useWorkflow();
  
  const [hoveredNode, setHoveredNode] = useState<WorkflowNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const reactFlowInstance = useReactFlow();
  
  // Create a style object that includes the provided dimensions
  const containerStyle = {
    width: canvasWidth ? `${canvasWidth}px` : '100%',
    height: canvasHeight ? `${canvasHeight}px` : '100%', // Changed from fixed 600px to 100%
    background: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    flex: 1,
    overflow: 'hidden'
  };
  
  // Handle node changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nodes) => {
        try {
          const updatedNodes = applyNodeChanges(changes, nodes as any);
          return updatedNodes as any;
        } catch (error) {
          console.error('Error applying node changes:', error);
          return nodes; // Return original nodes if there's an error
        }
      });
    },
    [setNodes]
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((edges) => {
        try {
          const updatedEdges = applyEdgeChanges(changes, edges as any);
          return updatedEdges as any;
        } catch (error) {
          console.error('Error applying edge changes:', error);
          return edges; // Return original edges if there's an error
        }
      });
    },
    [setEdges]
  );

  // Handle connection changes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((edges) => {
        try {
          const updatedEdges = addEdge(connection, edges as any);
          return updatedEdges as any;
        } catch (error) {
          console.error('Error connecting edges:', error);
          return edges; // Return original edges if there's an error
        }
      });
    },
    [setEdges]
  );
  
  // Handle node hover
  const handleNodeMouseEnter = useCallback((event: React.MouseEvent, node: Node) => {
    setHoveredNode(node as WorkflowNode);
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY - 10
    });
  }, []);
  
  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);
  
  // Handle node selection
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    selectNode(node.id);
  }, [selectNode]);
  
  // Zoom controls
  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);
  
  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);
  
  const handleZoomToFit = useCallback(() => {
    reactFlowInstance.fitView();
  }, [reactFlowInstance]);
  
  const handleZoomReset = useCallback(() => {
    reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
  }, [reactFlowInstance]);
  
  // Update zoom state when viewport changes
  const handleViewportChange = useCallback(({ viewport }: { viewport: { zoom: number } }) => {
    setZoom(viewport.zoom);
  }, []);
  
  return (
    <div style={containerStyle}>
      <ReactFlow
        nodes={nodes as any}
        edges={edges as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => selectNode(node.id)}
        onNodeMouseEnter={handleNodeMouseEnter as any}
        onNodeMouseLeave={handleNodeMouseLeave}
        onPaneClick={() => selectNode(null)}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--mantine-color-gray-0)',
          borderRadius: '4px'
        }}
      >
        {showControls && (
          <Controls 
            position="bottom-right"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '8px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              margin: '16px'
            }}
          />
        )}
        
        {showMinimap && (
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              switch (node.type) {
                case 'datasetLoader':
                  return '#1890ff';
                case 'structuralAnalysis':
                  return '#52c41a';
                case 'qualityChecker':
                  return '#fa8c16';
                default:
                  return '#d9d9d9';
              }
            }}
            style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              margin: '16px'
            }}
          />
        )}
        
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="rgba(0,0,0,0.05)"
        />
      </ReactFlow>
      
      {showTooltips && hoveredNode && (
        <NodeTooltip node={hoveredNode} />
      )}
    </div>
  );
};

// Wrap with ReactFlowProvider to ensure context is available
const WorkflowCanvasWithProvider: React.FC<WorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvasWithProvider; 
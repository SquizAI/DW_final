import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  Panel,
  useReactFlow,
  BackgroundVariant,
  SelectionMode,
} from 'reactflow';
import { Box, ActionIcon, Tooltip, Group } from '@mantine/core';
import { 
  IconZoomIn, 
  IconZoomOut, 
  IconMaximize, 
  IconLock, 
  IconLockOpen 
} from '@tabler/icons-react';
import { nodeTypes } from './nodes';
import { WorkflowNode, WorkflowEdge, WorkflowNodeData } from './types';
import { useCallback, useState } from 'react';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  onNodeSelect?: (node: WorkflowNode | null) => void;
  readOnly?: boolean;
}

export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  readOnly = false,
}: WorkflowCanvasProps) {
  const [localNodes, setLocalNodes] = useNodesState(nodes);
  const [localEdges, setLocalEdges] = useEdgesState(edges);
  const [isLocked, setIsLocked] = useState(readOnly);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleNodesChange = useCallback((changes: any) => {
    if (isLocked) return;
    setLocalNodes(changes);
    onNodesChange(changes);
  }, [isLocked, setLocalNodes, onNodesChange]);

  const handleEdgesChange = useCallback((changes: any) => {
    if (isLocked) return;
    setLocalEdges(changes);
    onEdgesChange(changes);
  }, [isLocked, setLocalEdges, onEdgesChange]);

  const handleConnect = useCallback((connection: Connection) => {
    if (isLocked) return;
    
    const sourceNode = localNodes.find(n => n.id === connection.source);
    const targetNode = localNodes.find(n => n.id === connection.target);
    
    if (!sourceNode || !targetNode) return;
    
    const newEdge: WorkflowEdge = {
      id: `e${connection.source}-${connection.target}`,
      source: connection.source || '',
      target: connection.target || '',
      animated: true,
      style: { 
        stroke: 'var(--mantine-color-blue-5)',
        strokeWidth: 2,
        opacity: 0.8,
      },
      data: {
        status: 'pending',
        metadata: {
          dataFlow: {
            rowCount: sourceNode.data.preview?.rowCount,
            columnCount: sourceNode.data.preview?.columnCount,
          }
        }
      }
    };

    setLocalEdges((eds) => [...eds, newEdge]);
    onEdgesChange([...edges, newEdge]);
  }, [isLocked, localNodes, edges, setLocalEdges, onEdgesChange]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    if (isLocked) return;
    
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !['dataNode', 'transformNode', 'analysisNode', 'aiNode', 'visualNode', 'exportNode'].includes(type)) return;

    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type: type as WorkflowNodeData['type'],
      position,
      data: { 
        type: type as WorkflowNodeData['type'],
        label: `${type} ${localNodes.length + 1}`,
        status: 'pending',
        createdAt: new Date(),
      },
    };

    setLocalNodes((nds) => [...nds, newNode]);
    onNodesChange([...nodes, newNode]);
  }, [isLocked, localNodes, nodes, setLocalNodes, onNodesChange]);

  return (
    <Box style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={(_, node) => !isLocked && onNodeSelect?.(node)}
        onPaneClick={() => !isLocked && onNodeSelect?.(null)}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={isLocked ? null : 'Delete'}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        selectionMode={SelectionMode.Full}
        minZoom={0.1}
        maxZoom={4}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: 'var(--mantine-color-blue-5)', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color="var(--mantine-color-gray-3)"
        />
        <Controls showInteractive={false} />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'dataNode': return 'var(--mantine-color-blue-6)';
              case 'transformNode': return 'var(--mantine-color-orange-6)';
              case 'analysisNode': return 'var(--mantine-color-green-6)';
              case 'aiNode': return 'var(--mantine-color-grape-6)';
              case 'visualNode': return 'var(--mantine-color-violet-6)';
              case 'exportNode': return 'var(--mantine-color-cyan-6)';
              default: return 'var(--mantine-color-gray-6)';
            }
          }}
          maskColor="rgba(255, 255, 255, 0.8)"
          style={{
            backgroundColor: 'var(--mantine-color-gray-0)',
            border: '1px solid var(--mantine-color-gray-3)',
          }}
        />
        <Panel position="top-right" style={{ gap: 8 }}>
          <Group gap="xs">
            <Tooltip label="Zoom In">
              <ActionIcon variant="light" onClick={() => zoomIn()}>
                <IconZoomIn size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Zoom Out">
              <ActionIcon variant="light" onClick={() => zoomOut()}>
                <IconZoomOut size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Fit View">
              <ActionIcon variant="light" onClick={() => fitView()}>
                <IconMaximize size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={isLocked ? "Unlock Canvas" : "Lock Canvas"}>
              <ActionIcon 
                variant="light" 
                color={isLocked ? "orange" : "blue"}
                onClick={() => setIsLocked(!isLocked)}
              >
                {isLocked ? <IconLock size={18} /> : <IconLockOpen size={18} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Panel>
      </ReactFlow>
    </Box>
  );
} 
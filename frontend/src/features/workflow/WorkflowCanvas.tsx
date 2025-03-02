import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import { Box } from '@mantine/core';
import { nodeTypes } from './nodes';

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onNodeSelect?: (node: Node | null) => void;
}

export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
}: WorkflowCanvasProps) {
  const [localNodes, setLocalNodes] = useNodesState(nodes);
  const [localEdges, setLocalEdges] = useEdgesState(edges);

  const handleNodesChange = (changes: any) => {
    setLocalNodes(changes);
    onNodesChange(changes);
  };

  const handleEdgesChange = (changes: any) => {
    setLocalEdges(changes);
    onEdgesChange(changes);
  };

  const handleConnect = (connection: Connection) => {
    const newEdge: Edge = {
      id: `e${connection.source}-${connection.target}`,
      source: connection.source || '',
      target: connection.target || '',
      animated: true,
      style: { stroke: 'var(--mantine-color-blue-5)' },
    };
    setLocalEdges((eds) => [...eds, newEdge]);
    onEdgesChange([...edges, newEdge]);
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode: Node = {
      id: `${type}-${localNodes.length + 1}`,
      type,
      position,
      data: { 
        label: `${type} ${localNodes.length + 1}`,
        status: 'pending',
      },
    };

    setLocalNodes((nds) => [...nds, newNode]);
    onNodesChange([...nodes, newNode]);
  };

  return (
    <Box style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={(_, node) => onNodeSelect?.(node)}
        onPaneClick={() => onNodeSelect?.(null)}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'dataNode': return 'var(--mantine-color-blue-6)';
              case 'transformNode': return 'var(--mantine-color-orange-6)';
              case 'analysisNode': return 'var(--mantine-color-green-6)';
              case 'aiNode': return 'var(--mantine-color-grape-6)';
              case 'visualNode': return 'var(--mantine-color-pink-6)';
              case 'exportNode': return 'var(--mantine-color-cyan-6)';
              default: return 'var(--mantine-color-gray-6)';
            }
          }}
        />
      </ReactFlow>
    </Box>
  );
}
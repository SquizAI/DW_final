import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
} from 'reactflow';
import { Paper, Title, Text, Group, Badge, Stack, Card, Loader, Box } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import 'reactflow/dist/style.css';

interface LineageNode {
  id: string;
  type: string;
  name: string;
  source: string;
  created_at: string;
  metadata: Record<string, any>;
}

interface LineageEdge {
  id: string;
  source_node: string;
  target_node: string;
  operation: string;
  created_at: string;
  metadata: Record<string, any>;
}

interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

// Custom Node Component
function LineageNodeComponent({ data }: { data: any }) {
  return (
    <Card shadow="sm" p="xs" style={{ minWidth: 180 }}>
      <Group justify="space-between" mb="xs">
        <Text fw={500}>{data.name}</Text>
        <Badge>{data.type}</Badge>
      </Group>
      <Text size="sm" c="dimmed">Source: {data.source}</Text>
      {data.metadata && Object.keys(data.metadata).length > 0 && (
        <Stack gap="xs" mt="xs">
          {Object.entries(data.metadata).map(([key, value]) => (
            <Text key={key} size="xs">
              {key}: {String(value)}
            </Text>
          ))}
        </Stack>
      )}
    </Card>
  );
}

export function DataLineageGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Fetch lineage data
  const { data: lineageData, isLoading } = useQuery({
    queryKey: ['lineageGraph'],
    queryFn: async () => {
      const response = await axios.get<LineageGraph>('/lineage/graph');
      return response.data;
    },
  });

  // Convert lineage data to ReactFlow format
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!lineageData) return { flowNodes: [], flowEdges: [] };

    const nodeWidth = 180;
    const nodeHeight = 100;
    const levelWidth = 300;
    const levelHeight = 150;

    // Create a map of node levels
    const nodeLevels = new Map<string, number>();
    const nodeColumns = new Map<string, number>();
    let maxLevel = 0;

    // Helper function to calculate node levels
    const calculateLevels = (nodeId: string, level: number, visited: Set<string>) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const currentLevel = nodeLevels.get(nodeId) || 0;
      nodeLevels.set(nodeId, Math.max(currentLevel, level));
      maxLevel = Math.max(maxLevel, level);

      // Find all edges where this node is the source
      const outgoingEdges = lineageData.edges.filter(e => e.source_node === nodeId);
      outgoingEdges.forEach(edge => {
        calculateLevels(edge.target_node, level + 1, visited);
      });
    };

    // Calculate levels starting from nodes with no incoming edges
    const nodesWithNoIncoming = lineageData.nodes
      .filter(node => !lineageData.edges.some(e => e.target_node === node.id))
      .map(node => node.id);

    nodesWithNoIncoming.forEach(nodeId => {
      calculateLevels(nodeId, 0, new Set());
    });

    // Calculate columns for each level
    const nodesByLevel = new Map<number, string[]>();
    nodeLevels.forEach((level, nodeId) => {
      const nodes = nodesByLevel.get(level) || [];
      nodes.push(nodeId);
      nodesByLevel.set(level, nodes);
    });

    nodesByLevel.forEach((nodes, level) => {
      nodes.forEach((nodeId, index) => {
        nodeColumns.set(nodeId, index);
      });
    });

    // Create ReactFlow nodes
    const flowNodes = lineageData.nodes.map(node => ({
      id: node.id,
      type: 'lineageNode',
      position: {
        x: (nodeColumns.get(node.id) || 0) * levelWidth,
        y: (nodeLevels.get(node.id) || 0) * levelHeight,
      },
      data: {
        ...node,
        label: node.name,
      },
    }));

    // Create ReactFlow edges
    const flowEdges = lineageData.edges.map(edge => ({
      id: edge.id,
      source: edge.source_node,
      target: edge.target_node,
      label: edge.operation,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { stroke: '#888' },
    }));

    return { flowNodes, flowEdges };
  }, [lineageData]);

  // Update nodes and edges when data changes
  useCallback(() => {
    if (flowNodes && flowEdges) {
      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  // Memoize node types
  const nodeTypes = useMemo(() => ({
    lineageNode: LineageNodeComponent,
  }), []);

  if (isLoading) {
    return (
      <Box ta="center" py="xl">
        <Loader />
        <Text size="sm" c="dimmed" mt="xs">Loading data lineage graph...</Text>
      </Box>
    );
  }

  return (
    <Paper p="md" style={{ height: '100%' }}>
      <Title order={3} mb="md">Data Lineage</Title>
      
      <div style={{ height: 'calc(100% - 60px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </Paper>
  );
} 
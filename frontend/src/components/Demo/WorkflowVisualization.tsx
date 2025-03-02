import React, { useEffect, useState } from 'react';
import {
  Paper,
  Text,
  Group,
  Stack,
  ThemeIcon,
  Badge,
  Card,
  SimpleGrid,
  useMantineTheme,
} from '@mantine/core';
import {
  IconDatabase,
  IconWand,
  IconBrain,
  IconChartBar,
  IconArrowRight,
} from '@tabler/icons-react';

interface Node {
  id: string;
  type: string;
  data: {
    label: string;
    [key: string]: any;
  };
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

interface WorkflowVisualizationProps {
  workflow: {
    id: string;
    name: string;
    nodes: Node[];
    edges: Edge[];
  } | null;
}

export function WorkflowVisualization({ workflow }: WorkflowVisualizationProps) {
  const theme = useMantineTheme();
  
  if (!workflow) {
    return (
      <Paper p="md" withBorder>
        <Text>No workflow data available.</Text>
      </Paper>
    );
  }

  // Get node by ID
  const getNodeById = (id: string) => {
    return workflow.nodes.find(node => node.id === id);
  };

  // Get icon for node type
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'data_source':
        return <IconDatabase size={20} />;
      case 'data_transformation':
        return <IconWand size={20} />;
      case 'analysis':
        return <IconBrain size={20} />;
      case 'visualization':
        return <IconChartBar size={20} />;
      default:
        return <IconDatabase size={20} />;
    }
  };

  // Get color for node type
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'data_source':
        return 'blue';
      case 'data_transformation':
        return 'orange';
      case 'analysis':
        return 'green';
      case 'visualization':
        return 'violet';
      default:
        return 'gray';
    }
  };

  return (
    <Stack gap="xl">
      <Paper p="md" withBorder>
        <Group justify="space-between">
          <Text fw={700} size="lg">{workflow.name}</Text>
          <Badge>{workflow.nodes.length} nodes</Badge>
        </Group>
      </Paper>

      {/* Workflow Graph */}
      <div style={{ position: 'relative', minHeight: '300px' }}>
        {/* Nodes */}
        {workflow.nodes.map((node, index) => {
          const xPosition = 150 + (index * 200);
          const yPosition = 100;
          
          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: `${xPosition}px`,
                top: `${yPosition}px`,
                width: '180px',
                zIndex: 2,
              }}
            >
              <Card withBorder shadow="sm" p="md">
                <Stack gap="xs">
                  <Group>
                    <ThemeIcon size="md" color={getNodeColor(node.type)}>
                      {getNodeIcon(node.type)}
                    </ThemeIcon>
                    <Text fw={600} size="sm">{node.data.label}</Text>
                  </Group>
                  <Badge size="xs" color={getNodeColor(node.type)}>
                    {node.type.replace('_', ' ')}
                  </Badge>
                </Stack>
              </Card>
            </div>
          );
        })}

        {/* Edges */}
        {workflow.edges.map(edge => {
          const sourceNode = getNodeById(edge.source);
          const targetNode = getNodeById(edge.target);
          
          if (!sourceNode || !targetNode) return null;
          
          const sourceIndex = workflow.nodes.findIndex(n => n.id === edge.source);
          const targetIndex = workflow.nodes.findIndex(n => n.id === edge.target);
          
          const sourceX = 150 + (sourceIndex * 200) + 180; // Right side of source node
          const sourceY = 100 + 30; // Middle of source node
          
          const targetX = 150 + (targetIndex * 200); // Left side of target node
          const targetY = 100 + 30; // Middle of target node
          
          return (
            <svg
              key={edge.id}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            >
              <defs>
                <marker
                  id={`arrowhead-${edge.id}`}
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill={theme.colors.gray[6]}
                  />
                </marker>
              </defs>
              <line
                x1={sourceX}
                y1={sourceY}
                x2={targetX}
                y2={targetY}
                stroke={theme.colors.gray[6]}
                strokeWidth="2"
                markerEnd={`url(#arrowhead-${edge.id})`}
              />
            </svg>
          );
        })}
      </div>

      {/* Node Details */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {workflow.nodes.map(node => (
          <Card key={node.id} withBorder>
            <Stack gap="md">
              <Group>
                <ThemeIcon size="lg" radius="md" color={getNodeColor(node.type)}>
                  {getNodeIcon(node.type)}
                </ThemeIcon>
                <div>
                  <Text fw={700}>{node.data.label}</Text>
                  <Badge color={getNodeColor(node.type)}>
                    {node.type.replace('_', ' ')}
                  </Badge>
                </div>
              </Group>
              
              <Stack gap="xs">
                <Text size="sm" fw={600}>Configuration:</Text>
                {Object.entries(node.data)
                  .filter(([key]) => key !== 'label')
                  .map(([key, value]) => (
                    <Group key={key} justify="space-between" gap="xs">
                      <Text size="xs" c="dimmed">{key.replace('_', ' ')}:</Text>
                      <Text size="xs">{String(value)}</Text>
                    </Group>
                  ))}
              </Stack>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
} 
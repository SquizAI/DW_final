import { Group, Paper, Tooltip, ActionIcon, Text, Stack } from '@mantine/core';
import {
  IconTable,
  IconTransform,
  IconChartBar,
  IconBrain,
  IconChartPie,
  IconFileExport,
} from '@tabler/icons-react';
import { NodeTypeConfig } from './types';

const NODE_TYPES: NodeTypeConfig[] = [
  {
    type: 'dataNode',
    label: 'Data Source',
    icon: IconTable,
    color: 'blue',
    category: 'input',
    description: 'Import data from files, databases, or APIs',
    maxOutputs: 1,
  },
  {
    type: 'transformNode',
    label: 'Transform',
    icon: IconTransform,
    color: 'orange',
    category: 'processing',
    description: 'Apply data transformations and cleaning operations',
    maxInputs: 2,
    maxOutputs: 1,
  },
  {
    type: 'analysisNode',
    label: 'Analysis',
    icon: IconChartBar,
    color: 'green',
    category: 'analysis',
    description: 'Perform statistical analysis and generate insights',
    maxInputs: 1,
    maxOutputs: 1,
  },
  {
    type: 'aiNode',
    label: 'AI/ML',
    icon: IconBrain,
    color: 'grape',
    category: 'analysis',
    description: 'Apply machine learning and AI models',
    maxInputs: 1,
    maxOutputs: 1,
  },
  {
    type: 'visualNode',
    label: 'Visualization',
    icon: IconChartPie,
    color: 'violet',
    category: 'output',
    description: 'Create charts and visual representations',
    maxInputs: 1,
    maxOutputs: 0,
  },
  {
    type: 'exportNode',
    label: 'Export',
    icon: IconFileExport,
    color: 'cyan',
    category: 'output',
    description: 'Export data to files or external systems',
    maxInputs: 1,
    maxOutputs: 0,
  },
];

interface NodeToolbarProps {
  onDragStart?: (event: React.DragEvent, nodeType: string) => void;
}

export function NodeToolbar({ onDragStart }: NodeToolbarProps) {
  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    onDragStart?.(event, nodeType);
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Text size="sm" fw={500}>Workflow Nodes</Text>
        
        <Stack gap="xs">
          <Text size="xs" c="dimmed">Input</Text>
          <Group gap="xs">
            {NODE_TYPES.filter(node => node.category === 'input').map(node => {
              const Icon = node.icon;
              return (
                <Tooltip
                  key={node.type}
                  label={
                    <div>
                      <Text size="sm" fw={500}>{node.label}</Text>
                      <Text size="xs" c="dimmed">{node.description}</Text>
                    </div>
                  }
                  position="right"
                  withArrow
                >
                  <ActionIcon
                    variant="light"
                    color={node.color}
                    size="lg"
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type)}
                    style={{ cursor: 'grab' }}
                  >
                    <Icon size={20} />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Group>
        </Stack>

        <Stack gap="xs">
          <Text size="xs" c="dimmed">Processing</Text>
          <Group gap="xs">
            {NODE_TYPES.filter(node => node.category === 'processing').map(node => {
              const Icon = node.icon;
              return (
                <Tooltip
                  key={node.type}
                  label={
                    <div>
                      <Text size="sm" fw={500}>{node.label}</Text>
                      <Text size="xs" c="dimmed">{node.description}</Text>
                    </div>
                  }
                  position="right"
                  withArrow
                >
                  <ActionIcon
                    variant="light"
                    color={node.color}
                    size="lg"
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type)}
                    style={{ cursor: 'grab' }}
                  >
                    <Icon size={20} />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Group>
        </Stack>

        <Stack gap="xs">
          <Text size="xs" c="dimmed">Analysis</Text>
          <Group gap="xs">
            {NODE_TYPES.filter(node => node.category === 'analysis').map(node => {
              const Icon = node.icon;
              return (
                <Tooltip
                  key={node.type}
                  label={
                    <div>
                      <Text size="sm" fw={500}>{node.label}</Text>
                      <Text size="xs" c="dimmed">{node.description}</Text>
                    </div>
                  }
                  position="right"
                  withArrow
                >
                  <ActionIcon
                    variant="light"
                    color={node.color}
                    size="lg"
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type)}
                    style={{ cursor: 'grab' }}
                  >
                    <Icon size={20} />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Group>
        </Stack>

        <Stack gap="xs">
          <Text size="xs" c="dimmed">Output</Text>
          <Group gap="xs">
            {NODE_TYPES.filter(node => node.category === 'output').map(node => {
              const Icon = node.icon;
              return (
                <Tooltip
                  key={node.type}
                  label={
                    <div>
                      <Text size="sm" fw={500}>{node.label}</Text>
                      <Text size="xs" c="dimmed">{node.description}</Text>
                    </div>
                  }
                  position="right"
                  withArrow
                >
                  <ActionIcon
                    variant="light"
                    color={node.color}
                    size="lg"
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type)}
                    style={{ cursor: 'grab' }}
                  >
                    <Icon size={20} />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
} 
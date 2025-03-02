import { Handle, Position } from 'reactflow';
import { Paper, Text, Group, ThemeIcon, Badge } from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';
import { WorkflowNodeData } from '../types';

interface AnalysisNodeProps {
  data: WorkflowNodeData & {
    method?: string;
    metrics?: Record<string, number>;
  };
}

export function AnalysisNode({ data }: AnalysisNodeProps) {
  return (
    <Paper shadow="sm" p="xs" radius="md" withBorder style={{ minWidth: 180 }}>
      <Handle type="target" position={Position.Left} />
      <Group gap="sm">
        <ThemeIcon color="green" size="lg" variant="light">
          <IconChartBar size={20} />
        </ThemeIcon>
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>{data.label}</Text>
          {data.description && (
            <Text size="xs" c="dimmed">{data.description}</Text>
          )}
          {data.method && (
            <Badge 
              size="sm" 
              variant="light"
              mt="xs"
            >
              {data.method}
            </Badge>
          )}
          {data.metrics && (
            <Group gap="xs" mt="xs">
              {Object.entries(data.metrics).map(([key, value]) => (
                <Badge key={key} size="sm" variant="light">
                  {key}: {value.toFixed(2)}
                </Badge>
              ))}
            </Group>
          )}
        </div>
      </Group>
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
} 
import { Handle, Position } from 'reactflow';
import { Paper, Text, Group, ThemeIcon, Badge } from '@mantine/core';
import { IconChartPie } from '@tabler/icons-react';
import { WorkflowNodeData } from '../types';

interface VisualNodeProps {
  data: WorkflowNodeData & {
    chartType?: string;
    dimensions?: string[];
  };
}

export function VisualNode({ data }: VisualNodeProps) {
  return (
    <Paper shadow="sm" p="xs" radius="md" withBorder style={{ minWidth: 180 }}>
      <Handle type="target" position={Position.Left} />
      <Group gap="sm">
        <ThemeIcon color="violet" size="lg" variant="light">
          <IconChartPie size={20} />
        </ThemeIcon>
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>{data.label}</Text>
          {data.description && (
            <Text size="xs" c="dimmed">{data.description}</Text>
          )}
          {data.chartType && (
            <Badge 
              size="sm" 
              variant="light"
              mt="xs"
            >
              {data.chartType}
            </Badge>
          )}
          {data.dimensions && data.dimensions.length > 0 && (
            <Group gap="xs" mt="xs">
              {data.dimensions.map((dim) => (
                <Badge key={dim} size="sm" variant="dot">
                  {dim}
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
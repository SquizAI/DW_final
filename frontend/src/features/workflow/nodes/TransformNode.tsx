import { Handle, Position } from 'reactflow';
import { Paper, Text, Group, ThemeIcon, Badge } from '@mantine/core';
import { IconTransform } from '@tabler/icons-react';

interface TransformNodeData {
  label: string;
  description?: string;
  operation?: string;
  status?: 'pending' | 'running' | 'complete' | 'error';
}

export function TransformNode({ data }: { data: TransformNodeData }) {
  return (
    <Paper shadow="sm" p="xs" radius="md" withBorder style={{ minWidth: 180 }}>
      <Handle type="target" position={Position.Left} />
      <Group gap="sm">
        <ThemeIcon color="orange" size="lg" variant="light">
          <IconTransform size={20} />
        </ThemeIcon>
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>{data.label}</Text>
          {data.description && (
            <Text size="xs" c="dimmed">{data.description}</Text>
          )}
          {data.operation && (
            <Badge 
              size="sm" 
              variant="light"
              mt="xs"
            >
              {data.operation}
            </Badge>
          )}
          {data.status && (
            <Badge 
              size="sm" 
              variant="light"
              color={
                data.status === 'complete' ? 'green' :
                data.status === 'error' ? 'red' :
                data.status === 'running' ? 'blue' :
                'gray'
              }
              mt="xs"
              ml="xs"
            >
              {data.status}
            </Badge>
          )}
        </div>
      </Group>
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
} 
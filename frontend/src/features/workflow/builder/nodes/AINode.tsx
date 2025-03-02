import { Handle, Position } from 'reactflow';
import { Paper, Text, Group, ThemeIcon, Badge, Progress } from '@mantine/core';
import { IconBrain } from '@tabler/icons-react';
import { WorkflowNodeData } from '../types';

interface AINodeProps {
  data: WorkflowNodeData & {
    task?: string;
    progress?: number;
    metrics?: Record<string, number>;
  };
}

export function AINode({ data }: AINodeProps) {
  return (
    <Paper shadow="sm" p="xs" radius="md" withBorder style={{ minWidth: 180 }}>
      <Handle type="target" position={Position.Left} />
      <Group gap="sm">
        <ThemeIcon color="grape" size="lg" variant="light">
          <IconBrain size={20} />
        </ThemeIcon>
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>{data.label}</Text>
          {data.description && (
            <Text size="xs" c="dimmed">{data.description}</Text>
          )}
          {data.task && (
            <Badge 
              size="sm" 
              variant="light"
              mt="xs"
            >
              {data.task}
            </Badge>
          )}
          {data.status && (
            <Badge 
              size="sm" 
              variant="light"
              color={
                data.status === 'complete' ? 'green' :
                data.status === 'error' ? 'red' :
                'blue'
              }
              mt="xs"
              ml="xs"
            >
              {data.status}
            </Badge>
          )}
          {typeof data.progress === 'number' && (
            <Progress 
              value={data.progress} 
              size="sm" 
              mt="xs"
              color={data.status === 'error' ? 'red' : 'blue'}
              striped={data.status === 'running'}
              animated={data.status === 'running'}
            />
          )}
          {data.metrics && (
            <Group gap="xs" mt="xs">
              {Object.entries(data.metrics).map(([key, value]) => (
                <Badge key={key} size="sm" variant="light">
                  {key}: {value.toFixed(3)}
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
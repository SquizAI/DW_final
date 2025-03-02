import { Handle, Position } from 'reactflow';
import { Paper, Text, Group, ThemeIcon, Badge, Progress } from '@mantine/core';
import { IconFileExport } from '@tabler/icons-react';
import { WorkflowNodeData } from '../types';

interface ExportNodeProps {
  data: WorkflowNodeData & {
    format?: string;
    destination?: string;
    progress?: number;
  };
}

export function ExportNode({ data }: ExportNodeProps) {
  return (
    <Paper shadow="sm" p="xs" radius="md" withBorder style={{ minWidth: 180 }}>
      <Handle type="target" position={Position.Left} />
      <Group gap="sm">
        <ThemeIcon color="orange" size="lg" variant="light">
          <IconFileExport size={20} />
        </ThemeIcon>
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>{data.label}</Text>
          {data.description && (
            <Text size="xs" c="dimmed">{data.description}</Text>
          )}
          {data.format && (
            <Badge 
              size="sm" 
              variant="light"
              mt="xs"
            >
              {data.format}
            </Badge>
          )}
          {data.destination && (
            <Text size="xs" mt="xs" c="dimmed">
              {data.destination}
            </Text>
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
              ml={data.format ? 'xs' : undefined}
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
        </div>
      </Group>
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
} 
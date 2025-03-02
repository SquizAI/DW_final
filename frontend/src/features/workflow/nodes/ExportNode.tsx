import { Handle, Position } from 'reactflow';
import { Paper, Text, Group, ThemeIcon, Badge, Progress } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

interface ExportNodeData {
  label: string;
  description?: string;
  format?: string;
  progress?: number;
  status?: 'pending' | 'exporting' | 'complete' | 'error';
  size?: number;
}

export function ExportNode({ data }: { data: ExportNodeData }) {
  return (
    <Paper shadow="sm" p="xs" radius="md" withBorder style={{ minWidth: 180 }}>
      <Handle type="target" position={Position.Left} />
      <Group gap="sm">
        <ThemeIcon color="cyan" size="lg" variant="light">
          <IconDownload size={20} />
        </ThemeIcon>
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>{data.label}</Text>
          {data.description && (
            <Text size="xs" c="dimmed">{data.description}</Text>
          )}
          <Group gap="xs" mt="xs">
            {data.format && (
              <Badge size="sm" variant="light">
                {data.format}
              </Badge>
            )}
            {data.size && (
              <Badge size="sm" variant="light">
                {(data.size / 1024 / 1024).toFixed(1)} MB
              </Badge>
            )}
            {data.status && (
              <Badge 
                size="sm" 
                variant="light"
                color={
                  data.status === 'complete' ? 'green' :
                  data.status === 'error' ? 'red' :
                  data.status === 'exporting' ? 'blue' :
                  'gray'
                }
              >
                {data.status}
              </Badge>
            )}
          </Group>
          {typeof data.progress === 'number' && (
            <Progress 
              value={data.progress} 
              size="sm" 
              mt="xs"
              color={data.status === 'error' ? 'red' : 'blue'}
              striped={data.status === 'exporting'}
              animated={data.status === 'exporting'}
            />
          )}
        </div>
      </Group>
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
} 
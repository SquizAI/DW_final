import { Handle, Position } from 'reactflow';
import { Paper, Text, Group, ThemeIcon, Badge } from '@mantine/core';
import { IconTable } from '@tabler/icons-react';

interface DataNodeData {
  label: string;
  description?: string;
  stats?: {
    rowCount: number;
    columnCount: number;
  };
}

export function DataNode({ data }: { data: DataNodeData }) {
  return (
    <Paper shadow="sm" p="xs" radius="md" withBorder style={{ minWidth: 180 }}>
      <Handle type="target" position={Position.Left} />
      <Group gap="sm">
        <ThemeIcon color="blue" size="lg" variant="light">
          <IconTable size={20} />
        </ThemeIcon>
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>{data.label}</Text>
          {data.description && (
            <Text size="xs" c="dimmed">{data.description}</Text>
          )}
          {data.stats && (
            <Group gap="xs" mt="xs">
              <Badge size="sm" variant="light">
                {data.stats.rowCount.toLocaleString()} rows
              </Badge>
              <Badge size="sm" variant="light">
                {data.stats.columnCount} columns
              </Badge>
            </Group>
          )}
        </div>
      </Group>
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
} 
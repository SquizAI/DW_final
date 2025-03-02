import { Handle, Position } from 'reactflow';
import { Paper, Text, Group, ThemeIcon } from '@mantine/core';
import { IconChartPie } from '@tabler/icons-react';

export function VisualNode({ data }: { data: any }) {
  return (
    <Paper shadow="sm" p="xs" radius="md" withBorder style={{ minWidth: 180 }}>
      <Handle type="target" position={Position.Left} />
      <Group gap="sm">
        <ThemeIcon color="pink" size="lg" variant="light">
          <IconChartPie size={20} />
        </ThemeIcon>
        <div>
          <Text size="sm" fw={500}>{data.label}</Text>
          {data.description && (
            <Text size="xs" c="dimmed">{data.description}</Text>
          )}
        </div>
      </Group>
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
} 
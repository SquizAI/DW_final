import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import {
  Paper,
  Text,
  Group,
  ThemeIcon,
  Badge,
  Progress,
  ActionIcon,
  Tooltip,
  Collapse,
  Stack,
} from '@mantine/core';
import {
  IconBrain,
  IconEye,
  IconRobot,
  IconWand,
} from '@tabler/icons-react';
import { AgentTopology } from '../agents/AgentTopology';

interface AINodeData {
  id: string;
  label: string;
  description?: string;
  task?: string;
  status?: 'idle' | 'training' | 'predicting' | 'complete' | 'error';
  progress?: number;
  metrics?: Record<string, number>;
  algorithm?: string;
}

export function AINode({ data }: { data: AINodeData }) {
  const [showAgents, setShowAgents] = useState(false);

  const handleAlgorithmSelect = (algorithm: string) => {
    // Here you would typically update the node data through your state management system
    console.log('Selected algorithm:', algorithm);
  };

  return (
    <Paper shadow="sm" p="xs" radius="md" withBorder style={{ minWidth: 180 }}>
      <Handle type="target" position={Position.Left} />
      <Stack gap="sm">
        <Group gap="sm">
          <ThemeIcon color="grape" size="lg" variant="light">
            <IconBrain size={20} />
          </ThemeIcon>
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>{data.label}</Text>
            {data.description && (
              <Text size="xs" c="dimmed">{data.description}</Text>
            )}
          </div>
          <Tooltip label={showAgents ? "Hide Agents" : "Show Agents"}>
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => setShowAgents(!showAgents)}
            >
              <IconRobot size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {data.task && (
          <Badge size="sm" variant="light">
            {data.task}
          </Badge>
        )}

        {data.algorithm && (
          <Badge size="sm" variant="light" color="grape">
            Algorithm: {data.algorithm}
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
          >
            {data.status}
          </Badge>
        )}

        {typeof data.progress === 'number' && (
          <Progress 
            value={data.progress} 
            size="sm"
            color={data.status === 'error' ? 'red' : 'blue'}
            striped={data.status === 'training' || data.status === 'predicting'}
            animated={data.status === 'training' || data.status === 'predicting'}
          />
        )}

        {data.metrics && (
          <Group gap="xs">
            {Object.entries(data.metrics).map(([key, value]) => (
              <Badge key={key} size="sm" variant="light">
                {key}: {value.toFixed(3)}
              </Badge>
            ))}
          </Group>
        )}

        <Collapse in={showAgents}>
          <AgentTopology
            nodeId={data.id}
            task={data.task || 'Unknown Task'}
            onAlgorithmSelect={handleAlgorithmSelect}
          />
        </Collapse>
      </Stack>
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
} 
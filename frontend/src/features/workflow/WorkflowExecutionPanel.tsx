import React from 'react';
import {
  Paper,
  Stack,
  Text,
  Timeline,
  Group,
  Badge,
  Button,
  Code,
  Collapse,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconChevronDown,
  IconChevronUp,
  IconRefresh,
  IconDownload,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

interface NodeResult {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  error?: string;
  output?: any;
}

interface WorkflowExecutionPanelProps {
  nodes: NodeResult[];
  isExecuting: boolean;
  onExecute: () => void;
  onStop: () => void;
  onDownloadResults: (nodeId: string) => void;
}

export function WorkflowExecutionPanel({
  nodes,
  isExecuting,
  onExecute,
  onStop,
  onDownloadResults,
}: WorkflowExecutionPanelProps) {
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status: NodeResult['status']) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'running':
        return 'blue';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start || !end) return '';
    const duration = (end.getTime() - start.getTime()) / 1000;
    return `${duration.toFixed(2)}s`;
  };

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={500}>Workflow Execution</Text>
          <Group>
            {isExecuting ? (
              <Button
                color="red"
                leftSection={<IconPlayerStop size={16} />}
                onClick={onStop}
              >
                Stop
              </Button>
            ) : (
              <Button
                leftSection={<IconPlayerPlay size={16} />}
                onClick={onExecute}
              >
                Execute Workflow
              </Button>
            )}
          </Group>
        </Group>

        <Timeline active={nodes.findIndex(n => n.status === 'running')} bulletSize={24}>
          {nodes.map((node) => (
            <Timeline.Item
              key={node.id}
              title={
                <Group gap="xs">
                  <Text fw={500}>{node.label}</Text>
                  <Badge color={getStatusColor(node.status)}>
                    {node.status.toUpperCase()}
                  </Badge>
                  {node.startTime && node.endTime && (
                    <Text size="xs" c="dimmed">
                      {formatDuration(node.startTime, node.endTime)}
                    </Text>
                  )}
                </Group>
              }
              bullet={
                node.status === 'running' ? (
                  <div className="animate-spin">⚙️</div>
                ) : node.status === 'completed' ? (
                  '✓'
                ) : node.status === 'failed' ? (
                  '✗'
                ) : (
                  '○'
                )
              }
            >
              <Group gap="xs" mt="xs">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => toggleNode(node.id)}
                  leftSection={
                    expandedNodes.has(node.id) ? (
                      <IconChevronUp size={14} />
                    ) : (
                      <IconChevronDown size={14} />
                    )
                  }
                >
                  {expandedNodes.has(node.id) ? 'Hide' : 'Show'} Details
                </Button>
                {node.status === 'completed' && (
                  <Tooltip label="Download Results">
                    <ActionIcon
                      variant="subtle"
                      onClick={() => onDownloadResults(node.id)}
                    >
                      <IconDownload size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>

              <Collapse in={expandedNodes.has(node.id)}>
                <Stack gap="xs" mt="xs">
                  {node.error ? (
                    <Text c="red" size="sm">
                      Error: {node.error}
                    </Text>
                  ) : node.output ? (
                    <>
                      <Text size="sm" fw={500}>
                        Output Preview:
                      </Text>
                      <Code block>
                        {typeof node.output === 'string'
                          ? node.output
                          : JSON.stringify(node.output, null, 2)}
                      </Code>
                    </>
                  ) : (
                    <Text c="dimmed" size="sm">
                      No output available
                    </Text>
                  )}
                </Stack>
              </Collapse>
            </Timeline.Item>
          ))}
        </Timeline>
      </Stack>
    </Paper>
  );
} 
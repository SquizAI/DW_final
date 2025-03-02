import React from 'react';
import {
  Paper,
  Text,
  Group,
  Stack,
  ThemeIcon,
  Badge,
  Card,
  Progress,
  SimpleGrid,
  Timeline,
  useMantineTheme,
} from '@mantine/core';
import {
  IconDatabase,
  IconWand,
  IconBrain,
  IconChartBar,
  IconCheck,
  IconX,
  IconClock,
  IconPlayerPlay,
  IconAlertCircle,
} from '@tabler/icons-react';

interface ExecutionStatusProps {
  status: any;
}

export function ExecutionStatus({ status }: ExecutionStatusProps) {
  const theme = useMantineTheme();
  
  if (!status) {
    return (
      <Paper p="md" withBorder>
        <Text>No execution status available.</Text>
      </Paper>
    );
  }

  // Get icon for node type
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'data_source':
        return <IconDatabase size={20} />;
      case 'data_transformation':
        return <IconWand size={20} />;
      case 'analysis':
        return <IconBrain size={20} />;
      case 'visualization':
        return <IconChartBar size={20} />;
      default:
        return <IconDatabase size={20} />;
    }
  };

  // Get color for node status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'running':
        return 'blue';
      case 'error':
        return 'red';
      case 'waiting':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  // Get icon for node status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <IconCheck size={20} />;
      case 'running':
        return <IconPlayerPlay size={20} />;
      case 'error':
        return <IconX size={20} />;
      case 'waiting':
        return <IconClock size={20} />;
      default:
        return <IconAlertCircle size={20} />;
    }
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!status.node_statuses || Object.keys(status.node_statuses).length === 0) {
      return 0;
    }

    const nodeStatuses = Object.values(status.node_statuses) as any[];
    const totalProgress = nodeStatuses.reduce((sum, node) => sum + (node.progress || 0), 0);
    return totalProgress / nodeStatuses.length;
  };

  const overallProgress = calculateOverallProgress();

  return (
    <Stack gap="xl">
      {/* Overall Status */}
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group>
              <ThemeIcon size="lg" radius="md" color={getStatusColor(status.status)}>
                {getStatusIcon(status.status)}
              </ThemeIcon>
              <div>
                <Text fw={700}>Execution Status: {status.status}</Text>
                <Text size="sm" c="dimmed">
                  Started: {new Date(status.start_time).toLocaleString()}
                  {status.end_time && ` • Completed: ${new Date(status.end_time).toLocaleString()}`}
                </Text>
              </div>
            </Group>
            <Badge size="lg" color={getStatusColor(status.status)}>
              {status.status === 'completed' ? 'Success' : 
               status.status === 'running' ? 'In Progress' :
               status.status === 'error' ? 'Failed' :
               status.status}
            </Badge>
          </Group>

          <Stack gap="xs">
            <Text size="sm">Overall Progress:</Text>
            <Progress 
              value={overallProgress} 
              size="lg" 
              color={getStatusColor(status.status)}
              striped={status.status === 'running'}
              animated={status.status === 'running'}
            />
            <Text size="xs" ta="right">{Math.round(overallProgress)}%</Text>
          </Stack>
        </Stack>
      </Paper>

      {/* Node Execution Timeline */}
      <Paper p="md" withBorder>
        <Text fw={700} mb="md">Execution Timeline</Text>
        <Timeline active={Object.keys(status.node_statuses || {}).findIndex(
          id => status.node_statuses[id].status === 'running'
        )}>
          {Object.entries(status.node_statuses || {}).map(([nodeId, nodeStatus]: [string, any]) => (
            <Timeline.Item
              key={nodeId}
              title={nodeStatus.label || nodeId}
              bullet={
                <ThemeIcon 
                  size="md" 
                  radius="xl" 
                  color={getStatusColor(nodeStatus.status)}
                >
                  {getStatusIcon(nodeStatus.status)}
                </ThemeIcon>
              }
            >
              <Text size="sm">Status: {nodeStatus.status}</Text>
              {nodeStatus.progress !== undefined && (
                <Progress 
                  value={nodeStatus.progress} 
                  size="sm" 
                  mt="xs"
                  color={getStatusColor(nodeStatus.status)}
                  striped={nodeStatus.status === 'running'}
                  animated={nodeStatus.status === 'running'}
                />
              )}
              {nodeStatus.error && (
                <Text size="sm" c="red" mt="xs">
                  Error: {nodeStatus.error}
                </Text>
              )}
            </Timeline.Item>
          ))}
        </Timeline>
      </Paper>

      {/* Node Status Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {Object.entries(status.node_statuses || {}).map(([nodeId, nodeStatus]: [string, any]) => (
          <Card key={nodeId} withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Group>
                  <ThemeIcon 
                    size="md" 
                    radius="md" 
                    color={getStatusColor(nodeStatus.status)}
                  >
                    {getStatusIcon(nodeStatus.status)}
                  </ThemeIcon>
                  <Text fw={700}>{nodeStatus.label || nodeId}</Text>
                </Group>
                <Badge color={getStatusColor(nodeStatus.status)}>
                  {nodeStatus.status}
                </Badge>
              </Group>

              {nodeStatus.progress !== undefined && (
                <Stack gap="xs">
                  <Progress 
                    value={nodeStatus.progress} 
                    size="md" 
                    color={getStatusColor(nodeStatus.status)}
                    striped={nodeStatus.status === 'running'}
                    animated={nodeStatus.status === 'running'}
                  />
                  <Text size="xs" ta="right">{Math.round(nodeStatus.progress)}%</Text>
                </Stack>
              )}

              {nodeStatus.agent_id && (
                <Group>
                  <Text size="sm" c="dimmed">Assigned Agent:</Text>
                  <Badge variant="light">{nodeStatus.agent_id}</Badge>
                </Group>
              )}

              {nodeStatus.execution_time && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Execution Time:</Text>
                  <Text size="sm">{nodeStatus.execution_time.toFixed(2)}s</Text>
                </Group>
              )}

              {nodeStatus.error && (
                <Text size="sm" c="red">
                  Error: {nodeStatus.error}
                </Text>
              )}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
} 
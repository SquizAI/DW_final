import React from 'react';
import {
  Paper,
  Stack,
  Text,
  Group,
  Tabs,
  Card,
  RingProgress,
  Progress,
  Badge,
  SimpleGrid,
  ActionIcon,
  Tooltip,
  Select,
  Button,
} from '@mantine/core';
import {
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconTable,
  IconDownload,
  IconRefresh,
  IconClockHour4,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';

interface NodeMetrics {
  id: string;
  label: string;
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  status: 'success' | 'warning' | 'error';
  errorCount: number;
  warningCount: number;
  dataProcessed: number;
  outputSize: number;
}

interface WorkflowMetrics {
  totalExecutionTime: number;
  averageExecutionTime: number;
  successRate: number;
  totalDataProcessed: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    storage: number;
  };
  nodes: NodeMetrics[];
  executionHistory: {
    timestamp: Date;
    duration: number;
    status: 'success' | 'warning' | 'error';
  }[];
}

interface WorkflowAnalyticsProps {
  metrics: WorkflowMetrics;
  onRefresh: () => void;
  onExport: (format: 'pdf' | 'csv' | 'json') => void;
}

const SAMPLE_METRICS: WorkflowMetrics = {
  totalExecutionTime: 3600,
  averageExecutionTime: 1200,
  successRate: 0.95,
  totalDataProcessed: 1024 * 1024 * 50, // 50MB
  resourceUtilization: {
    cpu: 65,
    memory: 45,
    storage: 30,
  },
  nodes: [
    {
      id: '1',
      label: 'Data Source',
      executionTime: 500,
      memoryUsage: 256,
      cpuUsage: 45,
      status: 'success',
      errorCount: 0,
      warningCount: 2,
      dataProcessed: 1024 * 1024 * 10,
      outputSize: 1024 * 1024 * 8,
    },
    {
      id: '2',
      label: 'Data Transform',
      executionTime: 800,
      memoryUsage: 512,
      cpuUsage: 75,
      status: 'warning',
      errorCount: 0,
      warningCount: 5,
      dataProcessed: 1024 * 1024 * 8,
      outputSize: 1024 * 1024 * 6,
    },
  ],
  executionHistory: [
    {
      timestamp: new Date(),
      duration: 3600,
      status: 'success',
    },
    {
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      duration: 3800,
      status: 'warning',
    },
  ],
};

function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
}

export function WorkflowAnalytics({
  metrics = SAMPLE_METRICS,
  onRefresh,
  onExport,
}: WorkflowAnalyticsProps) {
  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={500}>Workflow Analytics</Text>
          <Group>
            <Select
              placeholder="Export As..."
              data={[
                { value: 'pdf', label: 'PDF Report' },
                { value: 'csv', label: 'CSV Data' },
                { value: 'json', label: 'JSON Data' },
              ]}
              onChange={(value) => {
                if (value === 'pdf' || value === 'csv' || value === 'json') {
                  onExport(value);
                }
              }}
            />
            <Tooltip label="Refresh Analytics">
              <ActionIcon variant="light" onClick={onRefresh}>
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <SimpleGrid cols={4}>
          <Card withBorder>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Total Execution Time</Text>
              <Group>
                <IconClockHour4 size={20} />
                <Text fw={500}>{formatDuration(metrics.totalExecutionTime)}</Text>
              </Group>
            </Stack>
          </Card>

          <Card withBorder>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Success Rate</Text>
              <Group>
                <RingProgress
                  size={40}
                  thickness={4}
                  sections={[{ value: metrics.successRate * 100, color: 'green' }]}
                />
                <Text fw={500}>{(metrics.successRate * 100).toFixed(1)}%</Text>
              </Group>
            </Stack>
          </Card>

          <Card withBorder>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Data Processed</Text>
              <Group>
                <IconChartBar size={20} />
                <Text fw={500}>{formatBytes(metrics.totalDataProcessed)}</Text>
              </Group>
            </Stack>
          </Card>

          <Card withBorder>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">Resource Usage</Text>
              <Progress.Root size="sm">
                <Tooltip label="CPU">
                  <Progress.Section
                    value={metrics.resourceUtilization.cpu}
                    color="blue"
                  />
                </Tooltip>
                <Tooltip label="Memory">
                  <Progress.Section
                    value={metrics.resourceUtilization.memory}
                    color="green"
                  />
                </Tooltip>
                <Tooltip label="Storage">
                  <Progress.Section
                    value={metrics.resourceUtilization.storage}
                    color="yellow"
                  />
                </Tooltip>
              </Progress.Root>
            </Stack>
          </Card>
        </SimpleGrid>

        <Tabs defaultValue="nodes">
          <Tabs.List>
            <Tabs.Tab
              value="nodes"
              leftSection={<IconTable size={14} />}
            >
              Node Performance
            </Tabs.Tab>
            <Tabs.Tab
              value="timeline"
              leftSection={<IconChartLine size={14} />}
            >
              Execution Timeline
            </Tabs.Tab>
            <Tabs.Tab
              value="resources"
              leftSection={<IconChartPie size={14} />}
            >
              Resource Usage
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="nodes" pt="md">
            <Stack gap="md">
              {metrics.nodes.map((node) => (
                <Card key={node.id} withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Text fw={500}>{node.label}</Text>
                        <Badge color={getStatusColor(node.status)}>
                          {node.status.toUpperCase()}
                        </Badge>
                      </Group>
                      <Group gap="xs">
                        {node.warningCount > 0 && (
                          <Tooltip label={`${node.warningCount} warnings`}>
                            <Badge color="yellow" variant="light">
                              <Group gap={4}>
                                <IconAlertTriangle size={14} />
                                {node.warningCount}
                              </Group>
                            </Badge>
                          </Tooltip>
                        )}
                        {node.errorCount > 0 && (
                          <Tooltip label={`${node.errorCount} errors`}>
                            <Badge color="red" variant="light">
                              <Group gap={4}>
                                <IconAlertTriangle size={14} />
                                {node.errorCount}
                              </Group>
                            </Badge>
                          </Tooltip>
                        )}
                      </Group>
                    </Group>

                    <SimpleGrid cols={4}>
                      <Stack gap={0}>
                        <Text size="sm" c="dimmed">Execution Time</Text>
                        <Text size="sm">{formatDuration(node.executionTime)}</Text>
                      </Stack>
                      <Stack gap={0}>
                        <Text size="sm" c="dimmed">Memory Usage</Text>
                        <Text size="sm">{formatBytes(node.memoryUsage)}</Text>
                      </Stack>
                      <Stack gap={0}>
                        <Text size="sm" c="dimmed">CPU Usage</Text>
                        <Text size="sm">{node.cpuUsage}%</Text>
                      </Stack>
                      <Stack gap={0}>
                        <Text size="sm" c="dimmed">Data Processed</Text>
                        <Text size="sm">{formatBytes(node.dataProcessed)}</Text>
                      </Stack>
                    </SimpleGrid>

                    <Progress
                      size="sm"
                      sections={[
                        { value: node.cpuUsage, color: 'blue', label: 'CPU' },
                        { value: (node.memoryUsage / 1024) * 100, color: 'green', label: 'Memory' },
                      ]}
                    />
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="timeline" pt="md">
            <Stack gap="md">
              {metrics.executionHistory.map((execution, index) => (
                <Card key={index} withBorder>
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text size="sm">
                        {execution.timestamp.toLocaleDateString()} {execution.timestamp.toLocaleTimeString()}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Duration: {formatDuration(execution.duration)}
                      </Text>
                    </Stack>
                    <Badge color={getStatusColor(execution.status)}>
                      {execution.status.toUpperCase()}
                    </Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="resources" pt="md">
            <SimpleGrid cols={3}>
              <Card withBorder>
                <Stack gap="xs">
                  <Text fw={500}>CPU Usage</Text>
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[
                      { value: metrics.resourceUtilization.cpu, color: 'blue' },
                    ]}
                    label={
                      <Text ta="center" fw={500}>
                        {metrics.resourceUtilization.cpu}%
                      </Text>
                    }
                  />
                </Stack>
              </Card>

              <Card withBorder>
                <Stack gap="xs">
                  <Text fw={500}>Memory Usage</Text>
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[
                      { value: metrics.resourceUtilization.memory, color: 'green' },
                    ]}
                    label={
                      <Text ta="center" fw={500}>
                        {metrics.resourceUtilization.memory}%
                      </Text>
                    }
                  />
                </Stack>
              </Card>

              <Card withBorder>
                <Stack gap="xs">
                  <Text fw={500}>Storage Usage</Text>
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[
                      { value: metrics.resourceUtilization.storage, color: 'yellow' },
                    ]}
                    label={
                      <Text ta="center" fw={500}>
                        {metrics.resourceUtilization.storage}%
                      </Text>
                    }
                  />
                </Stack>
              </Card>
            </SimpleGrid>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Paper>
  );
} 
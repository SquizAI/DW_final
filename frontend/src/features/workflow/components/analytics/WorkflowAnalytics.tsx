import React, { useState } from 'react';
import { 
  Paper, 
  Title, 
  Text, 
  Group, 
  Stack, 
  Select, 
  Button, 
  Divider, 
  Badge, 
  Card, 
  SimpleGrid,
  RingProgress,
  ThemeIcon,
  Progress,
  Table,
  Tabs
} from '@mantine/core';
import { 
  IconChartBar, 
  IconChartLine, 
  IconChartPie, 
  IconClock, 
  IconDownload,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconArrowUp,
  IconArrowDown,
  IconArrowRight,
  IconCalendar,
  IconFilter
} from '@tabler/icons-react';
import { useWorkflow } from '../../WorkflowContext';

// Sample execution data
const EXECUTIONS = [
  {
    id: 'exec-001',
    startTime: new Date(Date.now() - 3600000 * 24 * 5),
    endTime: new Date(Date.now() - 3600000 * 24 * 5 + 45000),
    status: 'completed',
    duration: 45000,
    nodeStats: {
      total: 8,
      completed: 8,
      failed: 0,
      skipped: 0
    },
    performance: {
      cpu: 35,
      memory: 42,
      io: 28
    },
    errors: []
  },
  {
    id: 'exec-002',
    startTime: new Date(Date.now() - 3600000 * 24 * 3),
    endTime: new Date(Date.now() - 3600000 * 24 * 3 + 62000),
    status: 'completed',
    duration: 62000,
    nodeStats: {
      total: 8,
      completed: 8,
      failed: 0,
      skipped: 0
    },
    performance: {
      cpu: 40,
      memory: 45,
      io: 30
    },
    errors: []
  },
  {
    id: 'exec-003',
    startTime: new Date(Date.now() - 3600000 * 24 * 2),
    endTime: new Date(Date.now() - 3600000 * 24 * 2 + 38000),
    status: 'failed',
    duration: 38000,
    nodeStats: {
      total: 8,
      completed: 5,
      failed: 1,
      skipped: 2
    },
    performance: {
      cpu: 38,
      memory: 50,
      io: 25
    },
    errors: [
      {
        nodeId: 'node-5',
        message: 'Failed to connect to external API: Timeout',
        timestamp: new Date(Date.now() - 3600000 * 24 * 2 + 30000)
      }
    ]
  },
  {
    id: 'exec-004',
    startTime: new Date(Date.now() - 3600000 * 24),
    endTime: new Date(Date.now() - 3600000 * 24 + 41000),
    status: 'completed',
    duration: 41000,
    nodeStats: {
      total: 8,
      completed: 8,
      failed: 0,
      skipped: 0
    },
    performance: {
      cpu: 36,
      memory: 43,
      io: 29
    },
    errors: []
  },
  {
    id: 'exec-005',
    startTime: new Date(Date.now() - 3600000 * 12),
    endTime: new Date(Date.now() - 3600000 * 12 + 40000),
    status: 'completed',
    duration: 40000,
    nodeStats: {
      total: 8,
      completed: 8,
      failed: 0,
      skipped: 0
    },
    performance: {
      cpu: 34,
      memory: 41,
      io: 27
    },
    errors: []
  }
];

// Sample node performance data
const NODE_PERFORMANCE = [
  {
    id: 'node-1',
    name: 'Dataset Loader',
    avgDuration: 5200,
    executions: 5,
    failures: 0,
    avgCpu: 25,
    avgMemory: 30,
    trend: 'stable'
  },
  {
    id: 'node-2',
    name: 'Data Cleaning',
    avgDuration: 8500,
    executions: 5,
    failures: 0,
    avgCpu: 40,
    avgMemory: 45,
    trend: 'improving'
  },
  {
    id: 'node-3',
    name: 'Feature Engineering',
    avgDuration: 12000,
    executions: 5,
    failures: 0,
    avgCpu: 60,
    avgMemory: 55,
    trend: 'degrading'
  },
  {
    id: 'node-4',
    name: 'Model Training',
    avgDuration: 15000,
    executions: 5,
    failures: 0,
    avgCpu: 75,
    avgMemory: 70,
    trend: 'stable'
  },
  {
    id: 'node-5',
    name: 'API Integration',
    avgDuration: 3500,
    executions: 5,
    failures: 1,
    avgCpu: 20,
    avgMemory: 25,
    trend: 'stable'
  }
];

interface WorkflowAnalyticsProps {
  workflowId?: string;
}

export const WorkflowAnalytics: React.FC<WorkflowAnalyticsProps> = ({
  workflowId
}) => {
  const { nodes } = useWorkflow();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedExecution, setSelectedExecution] = useState<string | null>(EXECUTIONS[0].id);
  
  // Get execution status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'running': return 'blue';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };
  
  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <IconArrowDown size={14} color="green" />;
      case 'degrading': return <IconArrowUp size={14} color="red" />;
      case 'stable': return <IconArrowRight size={14} color="blue" />;
      default: return null;
    }
  };
  
  // Format duration
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };
  
  // Get selected execution
  const getSelectedExecution = () => {
    return EXECUTIONS.find(e => e.id === selectedExecution) || EXECUTIONS[0];
  };
  
  // Calculate success rate
  const calculateSuccessRate = () => {
    const successCount = EXECUTIONS.filter(e => e.status === 'completed').length;
    return (successCount / EXECUTIONS.length) * 100;
  };
  
  // Calculate average duration
  const calculateAverageDuration = () => {
    const totalDuration = EXECUTIONS.reduce((sum, e) => sum + e.duration, 0);
    return totalDuration / EXECUTIONS.length;
  };
  
  return (
    <Paper p="md" withBorder>
      <Group mb="md" position="apart">
        <Title order={4}>Workflow Analytics</Title>
        <Group>
          <Select
            placeholder="Time Range"
            value={timeRange}
            onChange={(value) => setTimeRange(value || '7d')}
            data={[
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' }
            ]}
            leftSection={<IconCalendar size={16} />}
            style={{ width: 200 }}
          />
          <Button 
            variant="light" 
            leftSection={<IconRefresh size={16} />}
          >
            Refresh
          </Button>
          <Button 
            variant="light" 
            leftSection={<IconDownload size={16} />}
          >
            Export
          </Button>
        </Group>
      </Group>
      
      <SimpleGrid cols={4} mb="md" breakpoints={[
        { maxWidth: 'md', cols: 2 },
        { maxWidth: 'sm', cols: 1 }
      ]}>
        <Card p="md" radius="md" withBorder>
          <Group position="apart" mb="xs">
            <Text size="xs" c="dimmed">Success Rate</Text>
            <Badge color={calculateSuccessRate() >= 90 ? 'green' : 'yellow'}>
              {Math.round(calculateSuccessRate())}%
            </Badge>
          </Group>
          <RingProgress
            size={80}
            thickness={8}
            sections={[{ value: calculateSuccessRate(), color: calculateSuccessRate() >= 90 ? 'green' : 'yellow' }]}
            label={
              <ThemeIcon color={calculateSuccessRate() >= 90 ? 'green' : 'yellow'} variant="light" radius="xl" size="xl">
                {calculateSuccessRate() >= 90 ? <IconCheck size={20} /> : <IconAlertCircle size={20} />}
              </ThemeIcon>
            }
          />
        </Card>
        
        <Card p="md" radius="md" withBorder>
          <Group position="apart" mb="xs">
            <Text size="xs" c="dimmed">Avg. Duration</Text>
            <Text size="sm" fw={500}>{formatDuration(calculateAverageDuration())}</Text>
          </Group>
          <Group position="apart" align="flex-end">
            <ThemeIcon size="xl" radius="xl" variant="light">
              <IconClock size={20} />
            </ThemeIcon>
            <Stack spacing={0} align="flex-end">
              <Text size="xs" c="dimmed">Fastest: {formatDuration(Math.min(...EXECUTIONS.map(e => e.duration)))}</Text>
              <Text size="xs" c="dimmed">Slowest: {formatDuration(Math.max(...EXECUTIONS.map(e => e.duration)))}</Text>
            </Stack>
          </Group>
        </Card>
        
        <Card p="md" radius="md" withBorder>
          <Group position="apart" mb="xs">
            <Text size="xs" c="dimmed">Total Executions</Text>
            <Text size="sm" fw={500}>{EXECUTIONS.length}</Text>
          </Group>
          <Group position="apart" align="flex-end">
            <ThemeIcon size="xl" radius="xl" variant="light">
              <IconChartBar size={20} />
            </ThemeIcon>
            <Stack spacing={0} align="flex-end">
              <Text size="xs" c="dimmed">Completed: {EXECUTIONS.filter(e => e.status === 'completed').length}</Text>
              <Text size="xs" c="dimmed">Failed: {EXECUTIONS.filter(e => e.status === 'failed').length}</Text>
            </Stack>
          </Group>
        </Card>
        
        <Card p="md" radius="md" withBorder>
          <Group position="apart" mb="xs">
            <Text size="xs" c="dimmed">Resource Usage</Text>
            <Text size="sm" fw={500}>Moderate</Text>
          </Group>
          <Stack spacing="xs">
            <Group position="apart">
              <Text size="xs">CPU</Text>
              <Text size="xs">{Math.round(EXECUTIONS.reduce((sum, e) => sum + e.performance.cpu, 0) / EXECUTIONS.length)}%</Text>
            </Group>
            <Progress 
              value={EXECUTIONS.reduce((sum, e) => sum + e.performance.cpu, 0) / EXECUTIONS.length} 
              size="sm" 
              color="blue"
            />
            <Group position="apart">
              <Text size="xs">Memory</Text>
              <Text size="xs">{Math.round(EXECUTIONS.reduce((sum, e) => sum + e.performance.memory, 0) / EXECUTIONS.length)}%</Text>
            </Group>
            <Progress 
              value={EXECUTIONS.reduce((sum, e) => sum + e.performance.memory, 0) / EXECUTIONS.length} 
              size="sm" 
              color="violet"
            />
          </Stack>
        </Card>
      </SimpleGrid>
      
      <Tabs defaultValue="executions">
        <Tabs.List mb="md">
          <Tabs.Tab 
            value="executions" 
            leftSection={<IconChartLine size={16} />}
          >
            Execution History
          </Tabs.Tab>
          <Tabs.Tab 
            value="nodes" 
            leftSection={<IconChartPie size={16} />}
          >
            Node Performance
          </Tabs.Tab>
          <Tabs.Tab 
            value="errors" 
            leftSection={<IconAlertCircle size={16} />}
          >
            Error Analysis
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="executions">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Execution ID</Table.Th>
                <Table.Th>Start Time</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Nodes</Table.Th>
                <Table.Th>Errors</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {EXECUTIONS.map((execution) => (
                <Table.Tr 
                  key={execution.id}
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: selectedExecution === execution.id ? 'var(--mantine-color-blue-0)' : undefined
                  }}
                  onClick={() => setSelectedExecution(execution.id)}
                >
                  <Table.Td>{execution.id}</Table.Td>
                  <Table.Td>{formatDate(execution.startTime)}</Table.Td>
                  <Table.Td>{formatDuration(execution.duration)}</Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(execution.status)}>
                      {execution.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group spacing="xs">
                      <Badge size="sm" color="green">{execution.nodeStats.completed}</Badge>
                      <Badge size="sm" color="red">{execution.nodeStats.failed}</Badge>
                      <Badge size="sm" color="gray">{execution.nodeStats.skipped}</Badge>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {execution.errors.length > 0 ? (
                      <Badge color="red">{execution.errors.length}</Badge>
                    ) : (
                      <Badge color="green">0</Badge>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          
          {selectedExecution && (
            <>
              <Divider my="md" />
              
              <Title order={5} mb="sm">Execution Details: {selectedExecution}</Title>
              
              <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                <Card p="md" radius="md" withBorder>
                  <Title order={6}>Performance Metrics</Title>
                  <Stack mt="md">
                    <Group position="apart">
                      <Text size="sm">CPU Usage</Text>
                      <Text size="sm">{getSelectedExecution().performance.cpu}%</Text>
                    </Group>
                    <Progress 
                      value={getSelectedExecution().performance.cpu} 
                      size="sm" 
                      color="blue"
                    />
                    
                    <Group position="apart">
                      <Text size="sm">Memory Usage</Text>
                      <Text size="sm">{getSelectedExecution().performance.memory}%</Text>
                    </Group>
                    <Progress 
                      value={getSelectedExecution().performance.memory} 
                      size="sm" 
                      color="violet"
                    />
                    
                    <Group position="apart">
                      <Text size="sm">I/O Operations</Text>
                      <Text size="sm">{getSelectedExecution().performance.io}%</Text>
                    </Group>
                    <Progress 
                      value={getSelectedExecution().performance.io} 
                      size="sm" 
                      color="teal"
                    />
                  </Stack>
                </Card>
                
                <Card p="md" radius="md" withBorder>
                  <Title order={6}>Execution Summary</Title>
                  <Stack mt="md" spacing="xs">
                    <Group position="apart">
                      <Text size="sm">Start Time:</Text>
                      <Text size="sm">{formatDate(getSelectedExecution().startTime)}</Text>
                    </Group>
                    <Group position="apart">
                      <Text size="sm">End Time:</Text>
                      <Text size="sm">{formatDate(getSelectedExecution().endTime)}</Text>
                    </Group>
                    <Group position="apart">
                      <Text size="sm">Duration:</Text>
                      <Text size="sm">{formatDuration(getSelectedExecution().duration)}</Text>
                    </Group>
                    <Group position="apart">
                      <Text size="sm">Status:</Text>
                      <Badge color={getStatusColor(getSelectedExecution().status)}>
                        {getSelectedExecution().status}
                      </Badge>
                    </Group>
                    <Group position="apart">
                      <Text size="sm">Total Nodes:</Text>
                      <Text size="sm">{getSelectedExecution().nodeStats.total}</Text>
                    </Group>
                    <Group position="apart">
                      <Text size="sm">Completed Nodes:</Text>
                      <Badge color="green">{getSelectedExecution().nodeStats.completed}</Badge>
                    </Group>
                    <Group position="apart">
                      <Text size="sm">Failed Nodes:</Text>
                      <Badge color="red">{getSelectedExecution().nodeStats.failed}</Badge>
                    </Group>
                    <Group position="apart">
                      <Text size="sm">Skipped Nodes:</Text>
                      <Badge color="gray">{getSelectedExecution().nodeStats.skipped}</Badge>
                    </Group>
                  </Stack>
                </Card>
              </SimpleGrid>
              
              {getSelectedExecution().errors.length > 0 && (
                <>
                  <Title order={6} mt="md" mb="sm">Errors</Title>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Node</Table.Th>
                        <Table.Th>Timestamp</Table.Th>
                        <Table.Th>Error Message</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {getSelectedExecution().errors.map((error, index) => (
                        <Table.Tr key={index}>
                          <Table.Td>{error.nodeId}</Table.Td>
                          <Table.Td>{formatDate(error.timestamp)}</Table.Td>
                          <Table.Td>
                            <Text color="red">{error.message}</Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </>
              )}
            </>
          )}
        </Tabs.Panel>
        
        <Tabs.Panel value="nodes">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Node</Table.Th>
                <Table.Th>Avg. Duration</Table.Th>
                <Table.Th>Executions</Table.Th>
                <Table.Th>Failures</Table.Th>
                <Table.Th>CPU Usage</Table.Th>
                <Table.Th>Memory Usage</Table.Th>
                <Table.Th>Trend</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {NODE_PERFORMANCE.map((node) => (
                <Table.Tr key={node.id}>
                  <Table.Td>{node.name}</Table.Td>
                  <Table.Td>{formatDuration(node.avgDuration)}</Table.Td>
                  <Table.Td>{node.executions}</Table.Td>
                  <Table.Td>
                    <Badge color={node.failures > 0 ? 'red' : 'green'}>
                      {node.failures}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group spacing="xs" noWrap>
                      <Progress 
                        value={node.avgCpu} 
                        size="sm" 
                        color="blue"
                        style={{ width: 60 }}
                      />
                      <Text size="xs">{node.avgCpu}%</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group spacing="xs" noWrap>
                      <Progress 
                        value={node.avgMemory} 
                        size="sm" 
                        color="violet"
                        style={{ width: 60 }}
                      />
                      <Text size="xs">{node.avgMemory}%</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group spacing="xs">
                      {getTrendIcon(node.trend)}
                      <Text size="xs">{node.trend}</Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          
          <Divider my="md" />
          
          <Title order={5} mb="sm">Node Performance Insights</Title>
          
          <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
            <Card p="md" radius="md" withBorder>
              <Title order={6}>Bottlenecks</Title>
              <Text size="sm" mt="xs">
                The following nodes are taking the most time in your workflow:
              </Text>
              <Stack mt="md">
                {NODE_PERFORMANCE
                  .sort((a, b) => b.avgDuration - a.avgDuration)
                  .slice(0, 3)
                  .map((node, index) => (
                    <Group key={index} position="apart">
                      <Text size="sm">{node.name}</Text>
                      <Text size="sm">{formatDuration(node.avgDuration)}</Text>
                    </Group>
                  ))
                }
              </Stack>
            </Card>
            
            <Card p="md" radius="md" withBorder>
              <Title order={6}>Optimization Opportunities</Title>
              <Text size="sm" mt="xs">
                Consider optimizing these nodes to improve overall performance:
              </Text>
              <Stack mt="md">
                {NODE_PERFORMANCE
                  .filter(node => node.trend === 'degrading' || node.failures > 0)
                  .map((node, index) => (
                    <Group key={index} position="apart">
                      <Group spacing="xs">
                        <Text size="sm">{node.name}</Text>
                        {node.failures > 0 && (
                          <Badge size="xs" color="red">{node.failures} failures</Badge>
                        )}
                        {node.trend === 'degrading' && (
                          <Badge size="xs" color="yellow">degrading</Badge>
                        )}
                      </Group>
                      <Text size="sm">{formatDuration(node.avgDuration)}</Text>
                    </Group>
                  ))
                }
              </Stack>
            </Card>
          </SimpleGrid>
        </Tabs.Panel>
        
        <Tabs.Panel value="errors">
          <Title order={5} mb="sm">Error Distribution</Title>
          
          <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
            <Card p="md" radius="md" withBorder>
              <Title order={6}>Error Types</Title>
              <Stack mt="md">
                <Group position="apart">
                  <Text size="sm">API Connection Errors</Text>
                  <Badge color="red">1</Badge>
                </Group>
                <Group position="apart">
                  <Text size="sm">Data Validation Errors</Text>
                  <Badge color="red">0</Badge>
                </Group>
                <Group position="apart">
                  <Text size="sm">Timeout Errors</Text>
                  <Badge color="red">0</Badge>
                </Group>
                <Group position="apart">
                  <Text size="sm">Resource Exhaustion</Text>
                  <Badge color="red">0</Badge>
                </Group>
                <Group position="apart">
                  <Text size="sm">Other Errors</Text>
                  <Badge color="red">0</Badge>
                </Group>
              </Stack>
            </Card>
            
            <Card p="md" radius="md" withBorder>
              <Title order={6}>Most Common Errors</Title>
              <Stack mt="md">
                <Group position="apart">
                  <Text size="sm">Failed to connect to external API: Timeout</Text>
                  <Badge color="red">1</Badge>
                </Group>
              </Stack>
            </Card>
          </SimpleGrid>
          
          <Divider my="md" />
          
          <Title order={5} mb="sm">Error Timeline</Title>
          
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Execution ID</Table.Th>
                <Table.Th>Node</Table.Th>
                <Table.Th>Timestamp</Table.Th>
                <Table.Th>Error Message</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {EXECUTIONS
                .flatMap(execution => 
                  execution.errors.map(error => ({
                    executionId: execution.id,
                    ...error
                  }))
                )
                .map((error, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{error.executionId}</Table.Td>
                    <Table.Td>{error.nodeId}</Table.Td>
                    <Table.Td>{formatDate(error.timestamp)}</Table.Td>
                    <Table.Td>
                      <Text color="red">{error.message}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))
              }
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
};

export default WorkflowAnalytics; 
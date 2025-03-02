import React, { useState, useEffect, useRef } from 'react';
import { 
  Paper, 
  Title, 
  Text, 
  Progress, 
  Group, 
  Badge, 
  Button, 
  Stack, 
  Accordion, 
  Timeline, 
  Divider,
  ActionIcon,
  Tooltip,
  ScrollArea,
  Code,
  ThemeIcon,
  Tabs,
  Box,
  RingProgress,
  SimpleGrid,
  Card,
  Switch,
  Select
} from '@mantine/core';
import { 
  IconPlayerPlay, 
  IconPlayerStop, 
  IconRefresh, 
  IconChevronDown, 
  IconChevronUp,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconClock,
  IconTerminal,
  IconDownload,
  IconMaximize,
  IconMinimize,
  IconInfoCircle,
  IconClockHour4,
  IconArrowsShuffle,
  IconFilter,
  IconChartLine,
  IconBug,
  IconSettings,
  IconEye,
  IconArrowRight
} from '@tabler/icons-react';
import { useWorkflow } from '../../WorkflowContext';

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  nodeId?: string;
}

interface NodeExecutionStatus {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  logs: LogEntry[];
  outputs?: any;
  error?: string;
}

interface WorkflowExecutionPanelProps {
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export const WorkflowExecutionPanel: React.FC<WorkflowExecutionPanelProps> = ({
  expanded = false,
  onToggleExpand
}) => {
  const { 
    nodes, 
    isExecuting, 
    executionProgress, 
    executeWorkflow 
  } = useWorkflow();
  
  const [activeTab, setActiveTab] = useState<string>('logs');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [nodeStatuses, setNodeStatuses] = useState<NodeExecutionStatus[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [executionStartTime, setExecutionStartTime] = useState<Date | null>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [showOnlyErrors, setShowOnlyErrors] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Sample execution data for demonstration
  const executionStats = {
    nodesTotal: nodes.length,
    nodesCompleted: Math.floor(executionProgress / 100 * nodes.length),
    nodesError: isExecuting ? 1 : 2,
    dataProcessed: '1.2 GB',
    memoryUsage: '256 MB',
    cpuUsage: '45%'
  };

  // Initialize node statuses when nodes change
  useEffect(() => {
    const initialStatuses = nodes.map(node => ({
      nodeId: node.id,
      status: 'pending' as const,
      progress: 0,
      logs: [],
      outputs: null
    }));
    setNodeStatuses(initialStatuses);
  }, [nodes]);

  // Simulate execution progress
  useEffect(() => {
    if (isExecuting) {
      if (!executionStartTime) {
        setExecutionStartTime(new Date());
        
        // Add initial log
        setLogs([{
          timestamp: new Date(),
          level: 'info',
          message: 'Workflow execution started'
        }]);
      }
      
      // Update execution time
      const timer = setInterval(() => {
        if (executionStartTime) {
          setExecutionTime(Math.floor((new Date().getTime() - executionStartTime.getTime()) / 1000));
        }
      }, 1000);
      
      // Simulate node execution progress
      const progressTimer = setInterval(() => {
        setNodeStatuses(prev => {
          const pendingNodes = prev.filter(n => n.status === 'pending');
          if (pendingNodes.length === 0) return prev;
          
          // Pick a random pending node to start or update
          const runningNodes = prev.filter(n => n.status === 'running');
          
          if (runningNodes.length < 2 && pendingNodes.length > 0) {
            // Start a new node
            const randomIndex = Math.floor(Math.random() * pendingNodes.length);
            const nodeToStart = pendingNodes[randomIndex];
            
            // Add log entry
            const newLog: LogEntry = {
              timestamp: new Date(),
              level: 'info',
              message: `Starting execution of node: ${nodes.find(n => n.id === nodeToStart.nodeId)?.data?.label || nodeToStart.nodeId}`,
              nodeId: nodeToStart.nodeId
            };
            setLogs(logs => [...logs, newLog]);
            
            return prev.map(n => 
              n.nodeId === nodeToStart.nodeId 
                ? { ...n, status: 'running', progress: 5, startTime: new Date() } 
                : n
            );
          } else {
            // Update progress of running nodes
            return prev.map(n => {
              if (n.status === 'running') {
                const newProgress = Math.min(n.progress + Math.random() * 15, 100);
                
                // Add progress log
                if (Math.random() > 0.7) {
                  const newLog: LogEntry = {
                    timestamp: new Date(),
                    level: 'info',
                    message: `Progress update for ${nodes.find(node => node.id === n.nodeId)?.data?.label || n.nodeId}: ${Math.floor(newProgress)}%`,
                    nodeId: n.nodeId
                  };
                  setLogs(logs => [...logs, newLog]);
                }
                
                // Randomly add warning
                if (Math.random() > 0.9) {
                  const newLog: LogEntry = {
                    timestamp: new Date(),
                    level: 'warning',
                    message: `Warning in ${nodes.find(node => node.id === n.nodeId)?.data?.label || n.nodeId}: Non-critical issue detected`,
                    nodeId: n.nodeId
                  };
                  setLogs(logs => [...logs, newLog]);
                }
                
                // Complete node if progress reaches 100%
                if (newProgress >= 100) {
                  // Randomly decide if node completes successfully or with error
                  const isError = Math.random() > 0.9;
                  const newStatus = isError ? 'error' : 'completed';
                  
                  // Add completion log
                  const newLog: LogEntry = {
                    timestamp: new Date(),
                    level: isError ? 'error' : 'info',
                    message: isError 
                      ? `Error in ${nodes.find(node => node.id === n.nodeId)?.data?.label || n.nodeId}: Execution failed` 
                      : `Completed execution of ${nodes.find(node => node.id === n.nodeId)?.data?.label || n.nodeId}`,
                    nodeId: n.nodeId
                  };
                  setLogs(logs => [...logs, newLog]);
                  
                  return { 
                    ...n, 
                    status: newStatus, 
                    progress: 100, 
                    endTime: new Date(),
                    error: isError ? 'Execution failed due to unexpected error' : undefined
                  };
                }
                
                return { ...n, progress: newProgress };
              }
              return n;
            });
          }
        });
      }, 1000);
      
      return () => {
        clearInterval(timer);
        clearInterval(progressTimer);
      };
    } else if (executionStartTime) {
      // Add completion log when execution stops
      setLogs(logs => [
        ...logs, 
        {
          timestamp: new Date(),
          level: 'info',
          message: 'Workflow execution completed'
        }
      ]);
      setExecutionStartTime(null);
    }
  }, [isExecuting, executionStartTime, nodes]);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Get node execution status
  const getNodeExecutionStatus = (nodeId: string) => {
    return nodeStatuses.find(status => status.nodeId === nodeId) || {
      nodeId,
      status: 'pending',
      progress: 0,
      logs: []
    };
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'running': return 'blue';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  // Get log level color
  const getLogLevelColor = (level: 'info' | 'warning' | 'error') => {
    switch (level) {
      case 'info': return 'blue';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  // Get log level icon
  const getLogLevelIcon = (level: 'info' | 'warning' | 'error') => {
    switch (level) {
      case 'info': return <IconInfoCircle size={16} />;
      case 'warning': return <IconAlertCircle size={16} />;
      case 'error': return <IconX size={16} />;
      default: return <IconInfoCircle size={16} />;
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    });
  };

  // Format execution time
  const formatExecutionTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Filter logs based on selected node and show only errors option
  const filteredLogs = logs.filter(log => {
    if (showOnlyErrors && log.level !== 'error') return false;
    if (selectedNodeId && log.nodeId !== selectedNodeId) return false;
    return true;
  });

  // Handle execute button click
  const handleExecute = () => {
    executeWorkflow();
  };

  // Handle stop button click
  const handleStop = () => {
    // In a real implementation, this would stop the execution
    console.log('Stopping execution');
  };

  // Render execution panel when collapsed
  if (!expanded) {
    return (
      <ActionIcon 
        size="xl" 
        radius="xl" 
        color="blue" 
        variant="filled" 
        onClick={onToggleExpand}
        style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)' }}
      >
        <IconTerminal size={24} />
      </ActionIcon>
    );
  }

  return (
    <Paper 
      p="md" 
      radius="md" 
      shadow="md" 
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Group>
          <Text fw={700} size="lg">Workflow Execution</Text>
          <Badge 
            size="lg" 
            color={isExecuting ? 'blue' : executionProgress === 100 ? 'green' : 'gray'}
          >
            {isExecuting ? 'Running' : executionProgress === 100 ? 'Completed' : 'Ready'}
          </Badge>
          {executionTime > 0 && (
            <Group gap={5}>
              <IconClockHour4 size={16} />
              <Text size="sm">{formatExecutionTime(executionTime)}</Text>
            </Group>
          )}
        </Group>
        
        <Group>
          {isExecuting ? (
            <Button 
              leftSection={<IconPlayerStop size={16} />} 
              color="red" 
              onClick={handleStop}
            >
              Stop
            </Button>
          ) : (
            <Button 
              leftSection={<IconPlayerPlay size={16} />} 
              color="green" 
              onClick={handleExecute}
            >
              Execute
            </Button>
          )}
          <ActionIcon onClick={onToggleExpand}>
            <IconChevronDown size={20} />
          </ActionIcon>
        </Group>
      </Group>
      
      {/* Progress bar */}
      <Progress 
        value={executionProgress} 
        size="md" 
        radius="xl" 
        mb="md" 
        color={executionProgress === 100 ? 'green' : 'blue'}
        striped={isExecuting}
        animated={isExecuting}
      />
      
      {/* Tabs */}
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'logs')}>
        <Tabs.List>
          <Tabs.Tab value="logs" leftSection={<IconTerminal size={14} />}>Logs</Tabs.Tab>
          <Tabs.Tab value="nodes" leftSection={<IconArrowsShuffle size={14} />}>Nodes</Tabs.Tab>
          <Tabs.Tab value="stats" leftSection={<IconChartLine size={14} />}>Stats</Tabs.Tab>
          <Tabs.Tab value="debug" leftSection={<IconBug size={14} />}>Debug</Tabs.Tab>
        </Tabs.List>
        
        {/* Logs Tab */}
        <Tabs.Panel value="logs" pt="xs">
          <Group justify="space-between" mb="xs">
            <Group>
              <Button 
                size="xs" 
                variant="light" 
                leftSection={<IconFilter size={14} />}
                color={showOnlyErrors ? 'red' : 'gray'}
                onClick={() => setShowOnlyErrors(!showOnlyErrors)}
              >
                {showOnlyErrors ? 'Showing Errors Only' : 'Show All Logs'}
              </Button>
              
              <Select 
                size="xs"
                placeholder="Filter by node"
                value={selectedNodeId}
                onChange={(value) => setSelectedNodeId(value)}
                data={[
                  { value: '', label: 'All Nodes' },
                  ...nodes.map(node => ({ 
                    value: node.id, 
                    label: node.data?.label || node.id 
                  }))
                ]}
                style={{ width: 200 }}
                clearable
              />
            </Group>
            
            <Group>
              <Switch 
                size="xs" 
                label="Auto-scroll" 
                checked={autoScroll} 
                onChange={(e) => setAutoScroll(e.currentTarget.checked)} 
              />
              <Button 
                size="xs" 
                variant="subtle" 
                leftSection={<IconRefresh size={14} />}
                onClick={() => setLogs([])}
              >
                Clear
              </Button>
            </Group>
          </Group>
          
          <ScrollArea h={120} offsetScrollbars>
            <Box p="xs">
              {filteredLogs.length === 0 ? (
                <Text c="dimmed" ta="center" py="md">No logs to display</Text>
              ) : (
                filteredLogs.map((log, index) => (
                  <Group key={index} mb={5} align="flex-start" style={{ flexWrap: 'nowrap' }}>
                    <Text size="xs" c="dimmed" style={{ minWidth: 70 }}>
                      {formatTimestamp(log.timestamp)}
                    </Text>
                    <ThemeIcon 
                      size="xs" 
                      color={getLogLevelColor(log.level)} 
                      variant="light"
                    >
                      {getLogLevelIcon(log.level)}
                    </ThemeIcon>
                    <Text size="xs" style={{ wordBreak: 'break-word' }}>
                      {log.nodeId && (
                        <Text span fw={500}>
                          [{nodes.find(n => n.id === log.nodeId)?.data?.label || log.nodeId}]
                        </Text>
                      )} {log.message}
                    </Text>
                  </Group>
                ))
              )}
              <div ref={logsEndRef} />
            </Box>
          </ScrollArea>
        </Tabs.Panel>
        
        {/* Nodes Tab */}
        <Tabs.Panel value="nodes" pt="xs">
          <ScrollArea h={120} offsetScrollbars>
            <SimpleGrid cols={3} spacing="xs">
              {nodes.map(node => {
                const status = getNodeExecutionStatus(node.id);
                return (
                  <Card key={node.id} p="xs" withBorder>
                    <Group justify="space-between" mb={5} style={{ flexWrap: 'nowrap' }}>
                      <Text size="xs" fw={500} truncate>
                        {node.data?.label || node.id}
                      </Text>
                      <Badge 
                        size="xs" 
                        color={getStatusColor(status.status)}
                      >
                        {status.status}
                      </Badge>
                    </Group>
                    
                    <Progress 
                      value={status.progress} 
                      size="xs" 
                      mb={5} 
                      color={getStatusColor(status.status)}
                      striped={status.status === 'running'}
                      animated={status.status === 'running'}
                    />
                    
                    <Group justify="space-between" style={{ flexWrap: 'nowrap' }}>
                      {status.startTime && (
                        <Text size="xs" c="dimmed">
                          Started: {formatTimestamp(status.startTime)}
                        </Text>
                      )}
                      {status.endTime && (
                        <Text size="xs" c="dimmed">
                          Ended: {formatTimestamp(status.endTime)}
                        </Text>
                      )}
                    </Group>
                  </Card>
                );
              })}
            </SimpleGrid>
          </ScrollArea>
        </Tabs.Panel>
        
        {/* Stats Tab */}
        <Tabs.Panel value="stats" pt="xs">
          <ScrollArea h={120} offsetScrollbars>
            <SimpleGrid cols={3} spacing="xs">
              <Card p="xs" withBorder>
                <Text size="xs" fw={500} ta="center" mb={5}>Nodes Status</Text>
                <Group justify="center">
                  <RingProgress
                    size={80}
                    thickness={8}
                    roundCaps
                    sections={[
                      { value: (executionStats.nodesCompleted / executionStats.nodesTotal) * 100, color: 'green' },
                      { value: (executionStats.nodesError / executionStats.nodesTotal) * 100, color: 'red' },
                      { value: ((executionStats.nodesTotal - executionStats.nodesCompleted - executionStats.nodesError) / executionStats.nodesTotal) * 100, color: 'gray' }
                    ]}
                    label={
                      <Text size="xs" ta="center" fw={700}>
                        {Math.round((executionStats.nodesCompleted / executionStats.nodesTotal) * 100)}%
                      </Text>
                    }
                  />
                </Group>
                <Group justify="center" mt={5}>
                  <Badge size="xs" color="green">{executionStats.nodesCompleted} completed</Badge>
                  <Badge size="xs" color="red">{executionStats.nodesError} failed</Badge>
                </Group>
              </Card>
              
              <Card p="xs" withBorder>
                <Text size="xs" fw={500} ta="center" mb={5}>Resource Usage</Text>
                <SimpleGrid cols={2} spacing={5}>
                  <Box>
                    <Text size="xs" c="dimmed">Memory</Text>
                    <Progress 
                      value={60} 
                      size="xs" 
                      mb={5} 
                      color="blue"
                    />
                    <Text size="xs" ta="right">{executionStats.memoryUsage}</Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed">CPU</Text>
                    <Progress 
                      value={45} 
                      size="xs" 
                      mb={5} 
                      color="violet"
                    />
                    <Text size="xs" ta="right">{executionStats.cpuUsage}</Text>
                  </Box>
                </SimpleGrid>
              </Card>
              
              <Card p="xs" withBorder>
                <Text size="xs" fw={500} ta="center" mb={5}>Data Processed</Text>
                <Text size="xl" fw={700} ta="center">{executionStats.dataProcessed}</Text>
                <Text size="xs" c="dimmed" ta="center">Across {executionStats.nodesTotal} nodes</Text>
              </Card>
            </SimpleGrid>
          </ScrollArea>
        </Tabs.Panel>
        
        {/* Debug Tab */}
        <Tabs.Panel value="debug" pt="xs">
          <ScrollArea h={120} offsetScrollbars>
            <Accordion>
              <Accordion.Item value="workflow">
                <Accordion.Control>
                  <Text size="xs" fw={500}>Workflow Configuration</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Code block style={{ fontSize: 10 }}>
                    {JSON.stringify({ nodes: nodes.length, isExecuting, executionProgress }, null, 2)}
                  </Code>
                </Accordion.Panel>
              </Accordion.Item>
              
              <Accordion.Item value="nodes">
                <Accordion.Control>
                  <Text size="xs" fw={500}>Node Statuses</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Code block style={{ fontSize: 10 }}>
                    {JSON.stringify(nodeStatuses, null, 2)}
                  </Code>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
};

export default WorkflowExecutionPanel; 
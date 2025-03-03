import React, { useState } from 'react';
import { 
  Modal, 
  Button, 
  Group, 
  Text, 
  Tabs, 
  Table, 
  ScrollArea, 
  Card, 
  Badge, 
  Loader, 
  Center,
  Stack,
  ActionIcon,
  Tooltip,
  Code,
  Divider
} from '@mantine/core';
import { 
  IconTable, 
  IconChartBar, 
  IconCode, 
  IconInfoCircle, 
  IconCheck, 
  IconX,
  IconRefresh,
  IconDownload,
  IconEye
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useWorkflow } from '../../WorkflowContext';

interface NodePreviewProps {
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  isOpen: boolean;
  onClose: () => void;
  onExecute?: () => void;
}

interface PreviewData {
  columns: string[];
  rows: any[];
  stats: {
    rows: number;
    columns: number;
    memory: string;
    executionTime: number;
  };
  schema: {
    fields: {
      name: string;
      type: string;
      nullable: boolean;
    }[];
  };
}

export function NodePreview({ nodeId, nodeType, nodeLabel, isOpen, onClose, onExecute }: NodePreviewProps) {
  const { executeNodePreview } = useWorkflow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('data');
  
  // Function to execute the node and get preview data
  const handleExecuteNodePreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the executeNodePreview function from the WorkflowContext
      const data = await executeNodePreview(nodeId);
      setPreviewData(data);
      
      if (onExecute) {
        onExecute();
      }
    } catch (err) {
      console.error('Error executing node preview:', err);
      setError('Failed to generate preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to download preview data as CSV
  const downloadPreviewData = () => {
    if (!previewData) return;
    
    // Create CSV content
    const headers = previewData.columns.join(',');
    const rows = previewData.rows.map(row => 
      previewData.columns.map(col => row[col]).join(',')
    ).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nodeLabel.replace(/\s+/g, '_')}_preview.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success notification
    notifications.show({
      title: 'Download Complete',
      message: `Preview data downloaded as CSV`,
      color: 'green',
    });
  };
  
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group>
          <IconEye size={20} />
          <Text fw={600}>Node Preview: {nodeLabel}</Text>
        </Group>
      }
      size="xl"
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" color="dimmed">
            This preview shows the output data that would be produced by this node when executed.
          </Text>
          <Badge color="blue">{nodeType}</Badge>
        </Group>
        
        <Divider />
        
        {!previewData && !loading && !error && (
          <Card withBorder p="md">
            <Stack align="center" gap="md" py="lg">
              <IconInfoCircle size={32} color="gray" />
              <Text ta="center">
                Click the button below to generate a preview of this node's output.
              </Text>
              <Button 
                onClick={handleExecuteNodePreview} 
                leftSection={<IconRefresh size={16} />}
              >
                Generate Preview
              </Button>
            </Stack>
          </Card>
        )}
        
        {loading && (
          <Card withBorder p="md">
            <Center py="xl">
              <Stack align="center" gap="md">
                <Loader size="md" />
                <Text>Generating preview...</Text>
              </Stack>
            </Center>
          </Card>
        )}
        
        {error && (
          <Card withBorder p="md" style={{ borderColor: 'red' }}>
            <Stack align="center" gap="md" py="lg">
              <IconX size={32} color="red" />
              <Text color="red" ta="center">{error}</Text>
              <Button 
                onClick={handleExecuteNodePreview} 
                leftSection={<IconRefresh size={16} />}
                color="red"
                variant="outline"
              >
                Try Again
              </Button>
            </Stack>
          </Card>
        )}
        
        {previewData && (
          <>
            <Group justify="space-between">
              <Group gap="xs">
                <Badge color="green" size="lg">
                  {previewData.stats.rows.toLocaleString()} rows
                </Badge>
                <Badge color="blue" size="lg">
                  {previewData.stats.columns} columns
                </Badge>
                <Badge color="violet" size="lg">
                  {previewData.stats.memory}
                </Badge>
                <Badge color="orange" size="lg">
                  {previewData.stats.executionTime.toFixed(2)}s
                </Badge>
              </Group>
              
              <Tooltip label="Download as CSV">
                <ActionIcon 
                  size="lg" 
                  color="blue" 
                  variant="light"
                  onClick={downloadPreviewData}
                >
                  <IconDownload size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
            
            <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)}>
              <Tabs.List>
                <Tabs.Tab value="data" leftSection={<IconTable size={14} />}>
                  Data Preview
                </Tabs.Tab>
                <Tabs.Tab value="schema" leftSection={<IconCode size={14} />}>
                  Schema
                </Tabs.Tab>
                <Tabs.Tab value="stats" leftSection={<IconChartBar size={14} />}>
                  Statistics
                </Tabs.Tab>
              </Tabs.List>
              
              <Tabs.Panel value="data" pt="md">
                <ScrollArea h={400}>
                  <Table striped>
                    <thead>
                      <tr>
                        {previewData.columns.map(col => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.map((row, i) => (
                        <tr key={i}>
                          {previewData.columns.map(col => (
                            <td key={`${i}-${col}`}>{row[col]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </ScrollArea>
              </Tabs.Panel>
              
              <Tabs.Panel value="schema" pt="md">
                <ScrollArea h={400}>
                  <Table striped>
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Type</th>
                        <th>Nullable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.schema.fields.map((field, i) => (
                        <tr key={i}>
                          <td>{field.name}</td>
                          <td>
                            <Code>{field.type}</Code>
                          </td>
                          <td>
                            {field.nullable ? (
                              <Badge color="yellow">Yes</Badge>
                            ) : (
                              <Badge color="green">No</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </ScrollArea>
              </Tabs.Panel>
              
              <Tabs.Panel value="stats" pt="md">
                <Card withBorder p="md">
                  <Text fw={600} mb="md">Execution Statistics</Text>
                  <Table>
                    <tbody>
                      <tr>
                        <td>Total Rows</td>
                        <td>{previewData.stats.rows.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Total Columns</td>
                        <td>{previewData.stats.columns}</td>
                      </tr>
                      <tr>
                        <td>Memory Usage</td>
                        <td>{previewData.stats.memory}</td>
                      </tr>
                      <tr>
                        <td>Execution Time</td>
                        <td>{previewData.stats.executionTime.toFixed(2)} seconds</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card>
              </Tabs.Panel>
            </Tabs>
          </>
        )}
        
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {previewData && (
            <Button 
              color="green" 
              leftSection={<IconCheck size={16} />}
              onClick={onClose}
            >
              Apply
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
} 
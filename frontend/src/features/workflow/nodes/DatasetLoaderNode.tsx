import React, { useState, useEffect } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Button,
  TextInput,
  Select,
  FileInput,
  Progress,
  Badge,
  ActionIcon,
  Tooltip,
  Menu,
  Modal,
  Tabs,
  Code,
  ScrollArea,
} from '@mantine/core';
import {
  IconUpload,
  IconDatabase,
  IconApi,
  IconFile,
  IconCheck,
  IconX,
  IconEye,
  IconSettings,
  IconRefresh,
  IconDownload,
  IconTable,
  IconChartBar,
  IconPlus,
  IconCode,
} from '@tabler/icons-react';
import { Handle, Position } from 'reactflow';
import { notifications } from '@mantine/notifications';
import { DatasetLoaderNodeData } from './types';
import { DataSourceSelector } from '../../../components/data/DataSourceSelector';
import { DataSource } from '../../../contexts/DataSourceContext';

interface DataPreview {
  columns: string[];
  rows: any[];
  stats: {
    rows: number;
    columns: number;
    memory: string;
  };
}

interface DatasetLoaderNodeProps {
  data: {
    label: string;
    dataSource?: DataSource;
    preview?: DataPreview;
  };
  selected: boolean;
  onDataLoad?: (preview: DataPreview) => void;
}

export function DatasetLoaderNode({ data, selected, onDataLoad }: DatasetLoaderNodeProps) {
  const [preview, setPreview] = useState<DataPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dataSourceSelectorOpen, setDataSourceSelectorOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(
    data.dataSource || null
  );

  useEffect(() => {
    if (data.preview) {
      setPreview(data.preview);
    }
  }, [data.preview]);

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockPreview: DataPreview = {
        columns: ['id', 'name', 'age', 'city', 'salary'],
        rows: [
          { id: 1, name: 'John Doe', age: 32, city: 'New York', salary: 85000 },
          { id: 2, name: 'Jane Smith', age: 28, city: 'Boston', salary: 92000 },
          { id: 3, name: 'Bob Johnson', age: 45, city: 'Chicago', salary: 115000 },
        ],
        stats: {
          rows: 1000,
          columns: 5,
          memory: '2.3 MB'
        }
      };

      setPreview(mockPreview);
      
      if (onDataLoad) {
        onDataLoad(mockPreview);
      }
    } catch (error) {
      console.error('Error loading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseConnect = () => {
    setShowSettings(true);
  };

  const handleAPIConnect = () => {
    setShowSettings(true);
  };
  
  const handleDataSourceSelect = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setDataSourceSelectorOpen(false);
    
    setLoading(true);
    
    setTimeout(() => {
      const mockPreview: DataPreview = {
        columns: dataSource.schema.fields.map(field => field.name),
        rows: [
          { id: 1, name: 'John Doe', age: 32, city: 'New York', salary: 85000 },
          { id: 2, name: 'Jane Smith', age: 28, city: 'Boston', salary: 92000 },
          { id: 3, name: 'Bob Johnson', age: 45, city: 'Chicago', salary: 115000 },
        ],
        stats: {
          rows: 1000,
          columns: dataSource.schema.fields.length,
          memory: '2.3 MB'
        }
      };
      
      setPreview(mockPreview);
      
      if (onDataLoad) {
        onDataLoad(mockPreview);
      }
      
      setLoading(false);
    }, 1500);
  };

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder style={{ width: 300 }}>
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Group>
              <IconDatabase size={18} />
              <Text fw={500}>{data.label || 'Dataset Loader'}</Text>
            </Group>
            {selectedDataSource && (
              <Badge color="blue" size="sm">
                {selectedDataSource.type}
              </Badge>
            )}
          </Group>
        </Card.Section>

        <Stack gap="xs" mt="md">
          {selectedDataSource ? (
            <Stack gap="xs">
              <Text size="sm" fw={500}>{selectedDataSource.name}</Text>
              <Text size="xs" color="dimmed">{selectedDataSource.description}</Text>
              
              <Group gap="xs">
                <Badge size="sm" variant="dot">
                  Quality: {selectedDataSource.quality.score}/100
                </Badge>
                {selectedDataSource.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} size="sm" variant="outline">
                    {tag}
                  </Badge>
                ))}
              </Group>
              
              <Button 
                variant="light" 
                size="xs" 
                leftSection={<IconPlus size={14} />}
                onClick={() => setDataSourceSelectorOpen(true)}
                mt="xs"
              >
                Change Data Source
              </Button>
            </Stack>
          ) : (
            <Button 
              onClick={() => setDataSourceSelectorOpen(true)}
              leftSection={<IconDatabase size={14} />}
            >
              Select Data Source
            </Button>
          )}

          {loading && (
            <>
              <Progress 
                value={65} 
                size="sm" 
                striped 
                animated
              />
              <Text size="xs" ta="center">Loading...</Text>
            </>
          )}

          {preview && (
            <Group gap="xs">
              <Badge size="sm" variant="dot">
                {preview.stats.rows.toLocaleString()} rows
              </Badge>
              <Badge size="sm" variant="dot">
                {preview.stats.columns} columns
              </Badge>
              <Badge size="sm" variant="dot">
                {preview.stats.memory}
              </Badge>
            </Group>
          )}
          
          {preview && selected && (
            <Tabs defaultValue="data">
              <Tabs.List>
                <Tabs.Tab value="data" leftSection={<IconTable size={14} />}>Data</Tabs.Tab>
                <Tabs.Tab value="schema" leftSection={<IconCode size={14} />}>Schema</Tabs.Tab>
                <Tabs.Tab value="stats" leftSection={<IconChartBar size={14} />}>Stats</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="data" pt="xs">
                <Text size="xs" fw={500} mt="xs">Preview:</Text>
                <div style={{ overflowX: 'auto', fontSize: '0.7rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {preview.columns.map((col, i) => (
                          <th key={i} style={{ padding: '4px', borderBottom: '1px solid #eee', textAlign: 'left' }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row, i) => (
                        <tr key={i}>
                          {preview.columns.map((col, j) => (
                            <td key={j} style={{ padding: '4px', borderBottom: '1px solid #eee' }}>
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Tabs.Panel>

              <Tabs.Panel value="schema" pt="xs">
                <Text size="xs" fw={500} mt="xs">Schema:</Text>
                {selectedDataSource && (
                  <div style={{ fontSize: '0.7rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '4px', borderBottom: '1px solid #eee', textAlign: 'left' }}>Field</th>
                          <th style={{ padding: '4px', borderBottom: '1px solid #eee', textAlign: 'left' }}>Type</th>
                          <th style={{ padding: '4px', borderBottom: '1px solid #eee', textAlign: 'left' }}>Nullable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDataSource.schema.fields.map((field, i) => (
                          <tr key={i}>
                            <td style={{ padding: '4px', borderBottom: '1px solid #eee' }}>{field.name}</td>
                            <td style={{ padding: '4px', borderBottom: '1px solid #eee' }}>{field.type}</td>
                            <td style={{ padding: '4px', borderBottom: '1px solid #eee' }}>{field.nullable ? 'Yes' : 'No'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Tabs.Panel>

              <Tabs.Panel value="stats" pt="xs">
                <Text size="xs" fw={500} mt="xs">Statistics:</Text>
                {selectedDataSource && (
                  <Stack gap={5} mt={5}>
                    <Group justify="space-between" gap={5}>
                      <Text size="xs">Quality Score:</Text>
                      <Text size="xs" fw={500}>{selectedDataSource.quality.score}/100</Text>
                    </Group>
                    <Group justify="space-between" gap={5}>
                      <Text size="xs">Missing Values:</Text>
                      <Text size="xs" fw={500}>{selectedDataSource.quality.missingValues}</Text>
                    </Group>
                    <Group justify="space-between" gap={5}>
                      <Text size="xs">Duplicates:</Text>
                      <Text size="xs" fw={500}>{selectedDataSource.quality.duplicates}</Text>
                    </Group>
                    <Group justify="space-between" gap={5}>
                      <Text size="xs">Outliers:</Text>
                      <Text size="xs" fw={500}>{selectedDataSource.quality.outliers}</Text>
                    </Group>
                  </Stack>
                )}
              </Tabs.Panel>
            </Tabs>
          )}
        </Stack>

        <Handle type="source" position={Position.Right} id="output" />
      </Card>

      <Modal
        opened={showPreview}
        onClose={() => setShowPreview(false)}
        title="Dataset Preview"
        size="xl"
      >
        {preview && (
          <Stack gap="md">
            <Tabs defaultValue="data">
              <Tabs.List>
                <Tabs.Tab value="data" leftSection={<IconTable size={14} />}>Data</Tabs.Tab>
                <Tabs.Tab value="schema" leftSection={<IconCode size={14} />}>Schema</Tabs.Tab>
                <Tabs.Tab value="stats" leftSection={<IconChartBar size={14} />}>Statistics</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="data" pt="xs">
                <ScrollArea h={400}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {preview.columns.map(col => (
                          <th key={col} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row, i) => (
                        <tr key={i}>
                          {preview.columns.map(col => (
                            <td key={col} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </Tabs.Panel>

              <Tabs.Panel value="schema" pt="xs">
                <ScrollArea h={400}>
                  <Stack gap="xs">
                    {preview.columns.map(col => (
                      <Group key={col} justify="space-between">
                        <Text>{col}</Text>
                        <Code>{preview.rows[0][col]}</Code>
                      </Group>
                    ))}
                  </Stack>
                </ScrollArea>
              </Tabs.Panel>

              <Tabs.Panel value="stats" pt="xs">
                <Stack gap="md">
                  <Card withBorder>
                    <Group justify="space-between">
                      <Text>Total Rows</Text>
                      <Text fw={500}>{preview.stats.rows.toLocaleString()}</Text>
                    </Group>
                  </Card>
                  <Card withBorder>
                    <Group justify="space-between">
                      <Text>Total Columns</Text>
                      <Text fw={500}>{preview.stats.columns}</Text>
                    </Group>
                  </Card>
                  <Card withBorder>
                    <Group justify="space-between">
                      <Text>Memory Usage</Text>
                      <Text fw={500}>{preview.stats.memory}</Text>
                    </Group>
                  </Card>
                </Stack>
              </Tabs.Panel>
            </Tabs>

            <Group justify="space-between" mt="md">
              <Button 
                leftSection={<IconDownload size={14} />}
                variant="light"
              >
                Export Profile
              </Button>
              <Button 
                leftSection={<IconCheck size={14} />}
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal
        opened={showSettings}
        onClose={() => setShowSettings(false)}
        title="Connection Settings"
        size="lg"
      >
        <Stack gap="md">
          <Select
            label="Connection Type"
            placeholder="Select connection type"
            data={[
              { value: 'mysql', label: 'MySQL' },
              { value: 'postgres', label: 'PostgreSQL' },
              { value: 'mongodb', label: 'MongoDB' },
              { value: 'rest', label: 'REST API' },
              { value: 'graphql', label: 'GraphQL' },
            ]}
          />
          
          <TextInput
            label="Host"
            placeholder="Enter host address"
          />
          
          <TextInput
            label="Port"
            placeholder="Enter port number"
          />
          
          <TextInput
            label="Username"
            placeholder="Enter username"
          />
          
          <TextInput
            type="password"
            label="Password"
            placeholder="Enter password"
          />
          
          <Group justify="right" mt="md">
            <Button variant="light" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button>Connect</Button>
          </Group>
        </Stack>
      </Modal>
      
      <DataSourceSelector
        opened={dataSourceSelectorOpen}
        onClose={() => setDataSourceSelectorOpen(false)}
        onSelect={handleDataSourceSelect}
        title="Select Data Source"
        description="Choose a data source to use in your workflow"
      />
    </>
  );
} 
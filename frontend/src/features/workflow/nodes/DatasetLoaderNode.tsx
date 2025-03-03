import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  Group,
  Stack,
  Button,
  FileInput,
  Progress,
  Badge,
  ActionIcon,
  Tooltip,
  Modal,
  ScrollArea,
  Box,
  Divider,
} from '@mantine/core';
import {
  IconUpload,
  IconDatabase,
  IconEye,
  IconRefresh,
  IconDownload,
  IconTable,
} from '@tabler/icons-react';
import { Handle, Position } from 'reactflow';
import { notifications } from '@mantine/notifications';
import { DatasetLoaderNodeData } from './types';
import { DataSourceSelector } from '../../../components/data/DataSourceSelector';
import { DataSource, DataSchema, useDataSources } from '../../../contexts/DataSourceContext';
import { dataManagementApi } from '../../../api';

// Import the NodeStyles components
import { NodeContainer, NodeHeader, NodeContent, NodeStats } from '../components/common/NodeStyles';

// Define interfaces for data preview
interface DataPreview {
  columns: string[];
  rows: any[];
  stats: {
    rows: number;
    columns: number;
    memory: string;
  };
  schema?: {
    fields: {
      name: string;
      type: string;
      nullable: boolean;
    }[];
  };
}

interface DatasetLoaderNodeProps {
  data: {
    label: string;
    dataSource?: DataSource;
    preview?: DataPreview;
    sourceType?: 'file' | 'database' | 'api' | 'kaggle' | 'url';
    config?: {
      filePath?: string;
    };
  };
  selected: boolean;
  onDataLoad?: (preview: DataPreview) => void;
  updateNodeData?: (data: Partial<DatasetLoaderNodeData>) => void;
}

export function DatasetLoaderNode({ data, selected, onDataLoad, updateNodeData }: DatasetLoaderNodeProps) {
  // State for data preview
  const [preview, setPreview] = useState<DataPreview | null>(data.preview || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for UI modals and panels
  const [showPreview, setShowPreview] = useState(false);
  const [dataSourceSelectorOpen, setDataSourceSelectorOpen] = useState(false);
  
  // State for data source selection
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(
    data.dataSource || null
  );
  
  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Get data source context
  const { 
    dataSources, 
    loading: dataSourcesLoading, 
    getDataSourceById, 
    getDataSourcePreview 
  } = useDataSources();

  useEffect(() => {
    if (data.preview) {
      setPreview(data.preview);
    }
  }, [data.preview]);

  // Function to update node data in the parent component
  const updateNodeConfig = useCallback((updates: Partial<DatasetLoaderNodeData>) => {
    if (updateNodeData) {
      updateNodeData(updates);
    }
  }, [updateNodeData]);

  // Handle file upload
  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Upload the file using the data management API
      const result = await dataManagementApi.uploadFile(file, '/', (progress) => {
        setUploadProgress(progress);
      });
      
      // Get preview data for the uploaded file
      const previewData = await dataManagementApi.getDatasetPreview(result.id, 10);
      
      // Format the preview data
      const formattedPreview: DataPreview = {
        columns: previewData.columns || [],
        rows: previewData.rows || [],
        stats: {
          rows: previewData.stats?.rows || 0,
          columns: previewData.stats?.columns || 0,
          memory: previewData.stats?.memory || '0 KB'
        },
        schema: {
          fields: previewData.schema?.fields || []
        }
      };
      
      // Update state
      setPreview(formattedPreview);
      setSelectedFile(file);
      
      // Update node data
      updateNodeConfig({
        sourceType: 'file',
        config: {
          filePath: result.path
        },
        preview: formattedPreview,
        label: file.name
      });
      
      // Notify parent component
      if (onDataLoad) {
        onDataLoad(formattedPreview);
      }
      
      // Show success notification
      notifications.show({
        title: 'File Uploaded',
        message: `Successfully uploaded ${file.name}`,
        color: 'green',
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      
      notifications.show({
        title: 'Upload Failed',
        message: err instanceof Error ? err.message : 'Failed to upload file',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle data source selection
  const handleDataSourceSelect = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setDataSourceSelectorOpen(false);
    
    setLoading(true);
    
    try {
      // Call getDataSourcePreview to track access (doesn't return data)
      getDataSourcePreview(dataSource.id);
      
      // Create sample data based on the schema
      const sampleRows = generateSampleRows(dataSource.schema, 3);
      
      // Format the preview data
      const formattedPreview: DataPreview = {
        columns: dataSource.schema.fields.map(field => field.name),
        rows: sampleRows,
        stats: {
          rows: 1000, // Mock row count
          columns: dataSource.schema.fields.length,
          memory: '2.5 MB' // Mock memory usage
        },
        schema: dataSource.schema
      };
      
      // Update state
      setPreview(formattedPreview);
      
      // Update node data
      updateNodeConfig({
        sourceType: 'database',
        config: {
          filePath: dataSource.id
        },
        preview: formattedPreview,
        label: dataSource.name
      });
      
      // Notify parent component
      if (onDataLoad) {
        onDataLoad(formattedPreview);
      }
      
      // Show success notification
      notifications.show({
        title: 'Data Source Selected',
        message: `Successfully selected ${dataSource.name}`,
        color: 'green',
      });
    } catch (err: any) {
      console.error('Error getting data source preview:', err);
      setError(err instanceof Error ? err.message : 'Failed to get data source preview');
      
      notifications.show({
        title: 'Preview Failed',
        message: err instanceof Error ? err.message : 'Failed to get data source preview',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate sample rows based on schema
  const generateSampleRows = (schema: DataSchema, count: number) => {
    const rows = [];
    
    for (let i = 0; i < count; i++) {
      const row: Record<string, any> = {};
      
      schema.fields.forEach(field => {
        // Generate sample data based on field type
        switch (field.type) {
          case 'string':
            row[field.name] = `Sample ${field.name} ${i + 1}`;
            break;
          case 'integer':
            row[field.name] = Math.floor(Math.random() * 100) + 1;
            break;
          case 'decimal':
          case 'float':
          case 'number':
            row[field.name] = (Math.random() * 100 + 1).toFixed(2);
            break;
          case 'boolean':
            row[field.name] = Math.random() > 0.5;
            break;
          case 'date':
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            row[field.name] = date.toISOString().split('T')[0];
            break;
          default:
            row[field.name] = `Sample ${i + 1}`;
        }
      });
      
      rows.push(row);
    }
    
    return rows;
  };

  // Render the node UI
  return (
    <>
      <NodeContainer 
        selected={selected} 
        width={300}
        hasInputHandle={false}
      >
        <NodeHeader
          label={data.label || 'Dataset Loader'}
          icon={<IconDatabase size={16} />}
          color="blue"
        />
        
        <NodeContent>
          {/* Data Source Selection */}
          {!selectedDataSource && !preview ? (
            <Stack gap="xs">
              <Text size="sm" fw={500}>Select Data Source</Text>
              
              <FileInput
                placeholder="Upload file"
                accept=".csv,.json,.xlsx,.parquet"
                onChange={handleFileUpload}
                leftSection={<IconUpload size={14} />}
                disabled={loading}
              />
              
              {loading && <Progress value={uploadProgress} size="sm" />}
              
              <Divider my="xs" />
              
              <Button 
                variant="light" 
                onClick={() => setDataSourceSelectorOpen(true)}
                leftSection={<IconDatabase size={14} />}
                fullWidth
              >
                Browse Data Sources
              </Button>
            </Stack>
          ) : (
            <Stack gap="xs">
              {/* Preview of selected data */}
              {preview && (
                <>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>Data Preview</Text>
                    <Group gap={4}>
                      <Tooltip label="View Full Preview">
                        <ActionIcon size="sm" onClick={() => setShowPreview(true)}>
                          <IconEye size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Change Data Source">
                        <ActionIcon size="sm" onClick={() => {
                          setPreview(null);
                          setSelectedDataSource(null);
                        }}>
                          <IconRefresh size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                  
                  <ScrollArea h={120} offsetScrollbars>
                    {preview.rows.length > 0 ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            {preview.columns.map((col, i) => (
                              <th key={i} style={{ 
                                padding: '4px', 
                                textAlign: 'left', 
                                borderBottom: '1px solid #eee',
                                fontSize: '12px'
                              }}>
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {preview.rows.map((row, i) => (
                            <tr key={i}>
                              {preview.columns.map((col, j) => (
                                <td key={j} style={{ 
                                  padding: '4px', 
                                  borderBottom: '1px solid #eee',
                                  fontSize: '12px'
                                }}>
                                  {String(row[col] !== undefined ? row[col] : '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <Text size="sm" c="dimmed" ta="center" py="md">No preview data available</Text>
                    )}
                  </ScrollArea>
                  
                  <Group grow>
                    <NodeStats stats={{
                      Rows: preview.stats.rows.toLocaleString(),
                      Columns: preview.stats.columns,
                      Size: preview.stats.memory
                    }} />
                  </Group>
                </>
              )}
            </Stack>
          )}
        </NodeContent>
        
        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="output"
          style={{ background: '#228be6' }}
        />
      </NodeContainer>
      
      {/* Data Source Selector Modal */}
      <DataSourceSelector
        opened={dataSourceSelectorOpen}
        onClose={() => setDataSourceSelectorOpen(false)}
        onSelect={handleDataSourceSelect}
      />
      
      {/* Preview Modal */}
      <Modal
        opened={showPreview}
        onClose={() => setShowPreview(false)}
        title="Data Preview"
        size="xl"
      >
        {preview && (
          <Stack>
            <Group justify="space-between">
              <Text fw={500}>{data.label || 'Dataset'}</Text>
              <Badge>{preview.stats.rows.toLocaleString()} rows, {preview.stats.columns} columns</Badge>
            </Group>
            
            <ScrollArea h={400} offsetScrollbars>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {preview.columns.map((col, i) => (
                      <th key={i} style={{ 
                        padding: '8px', 
                        textAlign: 'left', 
                        borderBottom: '1px solid #eee',
                        position: 'sticky',
                        top: 0,
                        background: 'white',
                        zIndex: 1
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <tr key={i}>
                      {preview.columns.map((col, j) => (
                        <td key={j} style={{ 
                          padding: '8px', 
                          borderBottom: '1px solid #eee'
                        }}>
                          {String(row[col] !== undefined ? row[col] : '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </Stack>
        )}
      </Modal>
    </>
  );
} 
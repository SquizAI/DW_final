import { useState } from 'react';
import {
  Paper,
  Title,
  Tabs,
  Stack,
  Select,
  MultiSelect,
  NumberInput,
  Button,
  Group,
  Text,
  JsonInput,
  Switch,
  Card,
  TextInput,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation } from '@tanstack/react-query';
import { IconDownload, IconInfoCircle } from '@tabler/icons-react';
import axios from 'axios';
import { z } from 'zod';

interface DataExportPanelProps {
  nodeId: string;
}

// Validation schemas
const ExportConfigSchema = z.object({
  format: z.enum(['csv', 'json', 'parquet', 'excel', 'sql']),
  options: z.object({
    columns: z.array(z.string()).optional(),
    compression: z.enum(['none', 'gzip', 'zip']).optional(),
    encoding: z.string().optional(),
    delimiter: z.string().optional(),
    includeHeader: z.boolean().optional(),
    dateFormat: z.string().optional(),
    sheetName: z.string().optional(),
    sqlTable: z.string().optional(),
    sqlSchema: z.string().optional(),
  }),
});

export function DataExportPanel({ nodeId }: DataExportPanelProps) {
  const [activeTab, setActiveTab] = useState<string | null>('basic');
  const [exportConfig, setExportConfig] = useState<any>({
    format: 'csv',
    options: {
      compression: 'none',
      encoding: 'utf-8',
      includeHeader: true,
    },
  });
  
  // Fetch available columns
  const { data: columnData } = useQuery({
    queryKey: ['columns', nodeId],
    queryFn: async () => {
      const response = await axios.get(`/api/workflow/preview/${nodeId}`);
      return response.data.schema.fields.map((f: any) => f.name);
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await axios.post(`/api/workflow/export/${nodeId}`, config, {
        responseType: 'blob',
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const extension = exportConfig.format;
      const compression = exportConfig.options.compression !== 'none'
        ? `.${exportConfig.options.compression}`
        : '';
      link.setAttribute('download', `export_${timestamp}.${extension}${compression}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      notifications.show({
        title: 'Success',
        message: 'Data exported successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to export data',
        color: 'red',
      });
    },
  });

  const handleExport = async () => {
    try {
      const validatedConfig = ExportConfigSchema.parse(exportConfig);
      exportMutation.mutate(validatedConfig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        notifications.show({
          title: 'Validation Error',
          message: error.errors[0].message,
          color: 'red',
        });
      }
    }
  };

  return (
    <Paper p="md" style={{ height: '100%', overflowY: 'auto' }}>
      <Title order={3} mb="md">Data Export</Title>
      
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="basic">Basic Options</Tabs.Tab>
          <Tabs.Tab value="advanced">Advanced Options</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="basic" pt="md">
          <Stack gap="md">
            <Card withBorder>
              <Title order={4} mb="md">Export Format</Title>
              <Select
                label="Format"
                data={[
                  { value: 'csv', label: 'CSV' },
                  { value: 'json', label: 'JSON' },
                  { value: 'parquet', label: 'Parquet' },
                  { value: 'excel', label: 'Excel' },
                  { value: 'sql', label: 'SQL' },
                ]}
                value={exportConfig.format}
                onChange={(value) => setExportConfig({
                  ...exportConfig,
                  format: value,
                  options: {
                    ...exportConfig.options,
                    // Reset format-specific options
                    delimiter: value === 'csv' ? ',' : undefined,
                    sheetName: value === 'excel' ? 'Sheet1' : undefined,
                    sqlTable: value === 'sql' ? '' : undefined,
                  },
                })}
              />
            </Card>
            
            <Card withBorder>
              <Title order={4} mb="md">Column Selection</Title>
              <MultiSelect
                label="Columns to Export"
                description="Leave empty to export all columns"
                data={columnData?.map((col: string) => ({
                  value: col,
                  label: col,
                })) || []}
                value={exportConfig.options.columns || []}
                onChange={(value) => setExportConfig({
                  ...exportConfig,
                  options: {
                    ...exportConfig.options,
                    columns: value,
                  },
                })}
                clearable
              />
            </Card>
            
            <Card withBorder>
              <Title order={4} mb="md">Compression</Title>
              <Select
                label="Compression Method"
                data={[
                  { value: 'none', label: 'No Compression' },
                  { value: 'gzip', label: 'GZIP' },
                  { value: 'zip', label: 'ZIP' },
                ]}
                value={exportConfig.options.compression}
                onChange={(value) => setExportConfig({
                  ...exportConfig,
                  options: {
                    ...exportConfig.options,
                    compression: value,
                  },
                })}
              />
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="advanced" pt="md">
          <Stack gap="md">
            {exportConfig.format === 'csv' && (
              <Card withBorder>
                <Title order={4} mb="md">CSV Options</Title>
                <Stack gap="md">
                  <TextInput
                    label="Delimiter"
                    value={exportConfig.options.delimiter || ','}
                    onChange={(e) => setExportConfig({
                      ...exportConfig,
                      options: {
                        ...exportConfig.options,
                        delimiter: e.target.value,
                      },
                    })}
                  />
                  <Switch
                    label="Include Header"
                    checked={exportConfig.options.includeHeader}
                    onChange={(e) => setExportConfig({
                      ...exportConfig,
                      options: {
                        ...exportConfig.options,
                        includeHeader: e.currentTarget.checked,
                      },
                    })}
                  />
                </Stack>
              </Card>
            )}
            
            {exportConfig.format === 'excel' && (
              <Card withBorder>
                <Title order={4} mb="md">Excel Options</Title>
                <TextInput
                  label="Sheet Name"
                  value={exportConfig.options.sheetName || 'Sheet1'}
                  onChange={(e) => setExportConfig({
                    ...exportConfig,
                    options: {
                      ...exportConfig.options,
                      sheetName: e.target.value,
                    },
                  })}
                />
              </Card>
            )}
            
            {exportConfig.format === 'sql' && (
              <Card withBorder>
                <Title order={4} mb="md">SQL Options</Title>
                <Stack gap="md">
                  <TextInput
                    label="Table Name"
                    value={exportConfig.options.sqlTable || ''}
                    onChange={(e) => setExportConfig({
                      ...exportConfig,
                      options: {
                        ...exportConfig.options,
                        sqlTable: e.target.value,
                      },
                    })}
                  />
                  <TextInput
                    label="Schema"
                    value={exportConfig.options.sqlSchema || 'public'}
                    onChange={(e) => setExportConfig({
                      ...exportConfig,
                      options: {
                        ...exportConfig.options,
                        sqlSchema: e.target.value,
                      },
                    })}
                  />
                </Stack>
              </Card>
            )}
            
            <Card withBorder>
              <Title order={4} mb="md">General Options</Title>
              <Stack gap="md">
                <Select
                  label="Encoding"
                  data={[
                    { value: 'utf-8', label: 'UTF-8' },
                    { value: 'utf-16', label: 'UTF-16' },
                    { value: 'ascii', label: 'ASCII' },
                    { value: 'iso-8859-1', label: 'ISO-8859-1' },
                  ]}
                  value={exportConfig.options.encoding}
                  onChange={(value) => setExportConfig({
                    ...exportConfig,
                    options: {
                      ...exportConfig.options,
                      encoding: value,
                    },
                  })}
                />
                
                <TextInput
                  label="Date Format"
                  description="Format string for date/time values (e.g., YYYY-MM-DD)"
                  value={exportConfig.options.dateFormat || 'YYYY-MM-DD'}
                  onChange={(e) => setExportConfig({
                    ...exportConfig,
                    options: {
                      ...exportConfig.options,
                      dateFormat: e.target.value,
                    },
                  })}
                />
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Group justify="flex-end" mt="xl">
        <Button
          leftSection={<IconDownload size={16} />}
          onClick={handleExport}
          loading={exportMutation.isPending}
        >
          Export Data
        </Button>
      </Group>
    </Paper>
  );
} 
import React, { useState } from 'react';
import { Container, Stack, Select, MultiSelect, Button, Group, Text, Card, Switch, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDownload } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageHeader } from '../components/ui/PageHeader';

interface ExportConfig {
  format: string;
  columns: string[];
  options: {
    includeIndex: boolean;
    compression?: string;
    sheetName?: string;
    dateFormat?: string;
  };
}

export function DataExportPage() {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'csv',
    columns: [],
    options: {
      includeIndex: false,
    },
  });

  // Fetch available columns
  const { data: columns = [] } = useQuery<string[]>({
    queryKey: ['columns'],
    queryFn: async () => {
      const response = await fetch('/api/datasets/active/columns');
      if (!response.ok) throw new Error('Failed to fetch columns');
      return response.json();
    },
  });

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: async (exportConfig: ExportConfig) => {
      const response = await fetch('/api/data/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportConfig),
      });
      if (!response.ok) throw new Error('Failed to export data');
      
      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${new Date().toISOString()}.${exportConfig.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return response.json();
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Data exported successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to export data',
        color: 'red',
      });
    },
  });

  const renderFormatOptions = () => {
    switch (config.format) {
      case 'excel':
        return (
          <TextInput
            label="Sheet Name"
            description="Name of the Excel worksheet"
            value={config.options.sheetName || 'Sheet1'}
            onChange={(e) => setConfig({
              ...config,
              options: { ...config.options, sheetName: e.target.value }
            })}
          />
        );

      case 'csv':
      case 'json':
        return (
          <Select
            label="Compression"
            description="Compress the output file"
            data={[
              { value: 'none', label: 'None' },
              { value: 'gzip', label: 'GZIP' },
              { value: 'zip', label: 'ZIP' },
            ]}
            value={config.options.compression || 'none'}
            onChange={(value) => setConfig({
              ...config,
              options: { ...config.options, compression: value || 'none' }
            })}
            clearable={false}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Container size="xl">
      <PageHeader
        title="Data Export"
        description="Export your processed data"
        icon={<IconDownload size={24} />}
      />

      <Stack gap="lg">
        <Card>
          <Stack gap="md">
            <Select
              label="Export Format"
              description="Choose the output file format"
              data={[
                { value: 'csv', label: 'CSV' },
                { value: 'excel', label: 'Excel' },
                { value: 'json', label: 'JSON' },
                { value: 'parquet', label: 'Parquet' },
              ]}
              value={config.format}
              onChange={(value) => setConfig({
                ...config,
                format: value || 'csv',
                options: { includeIndex: false } // Reset options when format changes
              })}
            />

            <MultiSelect
              label="Select Columns"
              description="Choose columns to export (leave empty to export all)"
              data={columns}
              value={config.columns}
              onChange={(value) => setConfig({ ...config, columns: value })}
              searchable
              clearable
            />

            <Switch
              label="Include Index"
              description="Include row index in the output"
              checked={config.options.includeIndex}
              onChange={(e) => setConfig({
                ...config,
                options: { ...config.options, includeIndex: e.currentTarget.checked }
              })}
            />

            <TextInput
              label="Date Format"
              description="Format for date/time values (e.g., YYYY-MM-DD)"
              value={config.options.dateFormat || 'YYYY-MM-DD'}
              onChange={(e) => setConfig({
                ...config,
                options: { ...config.options, dateFormat: e.target.value }
              })}
            />

            {renderFormatOptions()}

            <Group justify="flex-end">
              <Button
                onClick={() => exportMutation.mutate(config)}
                loading={exportMutation.isPending}
                leftSection={<IconDownload size={16} />}
              >
                Export Data
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 
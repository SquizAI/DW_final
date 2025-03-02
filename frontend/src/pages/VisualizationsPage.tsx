import React, { useState } from 'react';
import { Container, Stack, Select, MultiSelect, Button, Group, Text, Card, Tabs, ColorInput, NumberInput, Switch, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconChartLine, IconChartBar, IconChartPie, IconChartScatter, IconBoxMultiple } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageHeader } from '../components/ui/PageHeader';

interface Column {
  value?: string;
  label?: string;
  name?: string;
}

interface VisualizationConfig {
  type: string;
  columns: string[];
  params: Record<string, any>;
}

export function VisualizationsPage() {
  const [config, setConfig] = useState<VisualizationConfig>({
    type: 'scatter',
    columns: [],
    params: {
      title: '',
      color: '#228be6',
      showLegend: true,
    },
  });

  // Fetch available columns
  const { data: columnsData } = useQuery<Column[]>({
    queryKey: ['columns'],
    queryFn: async () => {
      const response = await fetch('/api/datasets/active/columns');
      if (!response.ok) throw new Error('Failed to fetch columns');
      const data = await response.json();
      return data.columns || [];
    },
  });

  // Format columns for Mantine Select
  const columns = React.useMemo(() => {
    if (!columnsData) return [];
    return columnsData.map((col: Column | string) => {
      if (typeof col === 'string') {
        return { value: col, label: col };
      }
      return {
        value: col.value || col.name || '',
        label: col.label || col.name || ''
      };
    });
  }, [columnsData]);

  // Create visualization mutation
  const visualizationMutation = useMutation({
    mutationFn: async (visualizationConfig: VisualizationConfig) => {
      const response = await fetch('/api/data/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visualizationConfig),
      });
      if (!response.ok) throw new Error('Failed to create visualization');
      return response.json();
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Visualization created successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create visualization',
        color: 'red',
      });
    },
  });

  const renderColumnInputs = () => {
    switch (config.type) {
      case 'scatter':
        return (
          <>
            <Select
              label="X-Axis"
              description="Select column for X-axis"
              data={columns}
              value={config.columns[0]}
              onChange={(value) => setConfig({
                ...config,
                columns: [value || '', config.columns[1] || '']
              })}
              searchable
              clearable
            />
            <Select
              label="Y-Axis"
              description="Select column for Y-axis"
              data={columns}
              value={config.columns[1]}
              onChange={(value) => setConfig({
                ...config,
                columns: [config.columns[0] || '', value || '']
              })}
              searchable
              clearable
            />
          </>
        );

      case 'bar':
      case 'line':
        return (
          <>
            <Select
              label="X-Axis"
              description="Select column for X-axis"
              data={columns}
              value={config.columns[0]}
              onChange={(value) => setConfig({
                ...config,
                columns: [value || '', ...config.columns.slice(1)]
              })}
              searchable
              clearable
            />
            <MultiSelect
              label="Y-Axis"
              description="Select columns for Y-axis"
              data={columns}
              value={config.columns.slice(1)}
              onChange={(value) => setConfig({
                ...config,
                columns: [config.columns[0], ...value]
              })}
              searchable
              clearable
            />
          </>
        );

      case 'pie':
        return (
          <>
            <Select
              label="Category"
              description="Select categorical column"
              data={columns}
              value={config.columns[0]}
              onChange={(value) => setConfig({
                ...config,
                columns: [value || '']
              })}
              searchable
              clearable
            />
            <Select
              label="Value"
              description="Select value column (optional)"
              data={columns}
              value={config.columns[1]}
              onChange={(value) => setConfig({
                ...config,
                columns: [config.columns[0], value || '']
              })}
              searchable
              clearable
            />
          </>
        );

      case 'box':
        return (
          <>
            <Select
              label="Value Column"
              description="Select column for box plot"
              data={columns}
              value={config.columns[0]}
              onChange={(value) => setConfig({
                ...config,
                columns: [value || '', config.columns[1] || '']
              })}
              searchable
              clearable
            />
            <Select
              label="Group By (optional)"
              description="Select column for grouping"
              data={columns}
              value={config.columns[1]}
              onChange={(value) => setConfig({
                ...config,
                columns: [config.columns[0], value || '']
              })}
              searchable
              clearable
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container size="xl">
      <PageHeader
        title="Visualizations"
        description="Create interactive data visualizations"
        icon={<IconChartLine size={24} />}
      />

      <Tabs defaultValue="scatter">
        <Tabs.List>
          <Tabs.Tab value="scatter" leftSection={<IconChartScatter size={16} />}>
            Scatter Plot
          </Tabs.Tab>
          <Tabs.Tab value="line" leftSection={<IconChartLine size={16} />}>
            Line Chart
          </Tabs.Tab>
          <Tabs.Tab value="bar" leftSection={<IconChartBar size={16} />}>
            Bar Chart
          </Tabs.Tab>
          <Tabs.Tab value="pie" leftSection={<IconChartPie size={16} />}>
            Pie Chart
          </Tabs.Tab>
          <Tabs.Tab value="box" leftSection={<IconBoxMultiple size={16} />}>
            Box Plot
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="scatter" pt="xl">
          <Stack gap="lg">
            <Card>
              <Stack gap="md">
                {renderColumnInputs()}
                <TextInput
                  label="Chart Title"
                  value={config.params.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({
                    ...config,
                    params: { ...config.params, title: e.target.value }
                  })}
                />
                <Group grow>
                  <ColorInput
                    label="Point Color"
                    value={config.params.color}
                    onChange={(value) => setConfig({
                      ...config,
                      params: { ...config.params, color: value }
                    })}
                  />
                  <NumberInput
                    label="Point Size"
                    value={config.params.size || 5}
                    onChange={(value) => setConfig({
                      ...config,
                      params: { ...config.params, size: value }
                    })}
                    min={1}
                    max={20}
                  />
                </Group>
                <Switch
                  label="Show Legend"
                  checked={config.params.showLegend}
                  onChange={(e) => setConfig({
                    ...config,
                    params: { ...config.params, showLegend: e.currentTarget.checked }
                  })}
                />
                <Group justify="flex-end">
                  <Button
                    onClick={() => visualizationMutation.mutate({
                      ...config,
                      type: 'scatter'
                    })}
                    loading={visualizationMutation.isPending}
                    leftSection={<IconChartScatter size={16} />}
                    disabled={config.columns.length < 2}
                  >
                    Create Scatter Plot
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Similar panels for other chart types */}
        {/* ... */}
      </Tabs>
    </Container>
  );
} 
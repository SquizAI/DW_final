import React, { useState } from 'react';
import { Container, Stack, Select, MultiSelect, Button, Group, Text, NumberInput, Switch } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBinaryTree } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';

interface BinningConfig {
  columns: string[];
  method: string;
  params: {
    bins?: number;
    strategy?: string;
    labels?: string[];
    range?: [number, number];
    includeLowest?: boolean;
    right?: boolean;
    precision?: number;
  };
}

interface NumericColumnsResponse {
  numericColumns: Array<{ value: string; label: string; }>;
}

export function DataBinningPage() {
  const [config, setConfig] = useState<BinningConfig>({
    columns: [],
    method: 'equal_width',
    params: {
      bins: 10,
      strategy: 'uniform',
      includeLowest: true,
      right: true,
      precision: 3,
    },
  });

  // Fetch available numeric columns
  const { data: columnsResponse, isLoading: isLoadingColumns } = useQuery<NumericColumnsResponse>({
    queryKey: ['numeric-columns'],
    queryFn: async () => {
      const response = await fetch('/api/datasets/active/numeric-columns');
      if (!response.ok) throw new Error('Failed to fetch numeric columns');
      const data = await response.json();
      // Ensure the data is in the correct format for MultiSelect
      return {
        numericColumns: Array.isArray(data) ? data.map(col => ({
          value: col.toString(),
          label: col.toString()
        })) : []
      };
    },
  });

  // Extract the columns array from the response and ensure it's an array
  const columns = columnsResponse?.numericColumns || [];

  // Apply binning mutation
  const binningMutation = useMutation({
    mutationFn: async (binningConfig: BinningConfig) => {
      const response = await fetch('/api/data/bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(binningConfig),
      });
      if (!response.ok) throw new Error('Failed to apply binning');
      return response.json();
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Binning applied successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to apply binning',
        color: 'red',
      });
    },
  });

  const handleApplyBinning = () => {
    binningMutation.mutate(config);
  };

  return (
    <Container size="xl">
      <PageHeader
        title="Data Binning"
        description="Discretize continuous variables into bins"
        icon={<IconBinaryTree size={24} />}
      />

      <Stack gap="lg">
        <Card>
          <Stack gap="md">
            <MultiSelect
              label="Select Columns"
              description="Choose numeric columns to bin"
              data={columns}
              value={config.columns}
              onChange={(value) => setConfig({ ...config, columns: value })}
              searchable
              clearable
              disabled={isLoadingColumns}
            />

            <Select
              label="Binning Method"
              description="Choose how to create the bins"
              data={[
                { value: 'equal_width', label: 'Equal Width' },
                { value: 'equal_frequency', label: 'Equal Frequency' },
                { value: 'kmeans', label: 'K-Means' },
                { value: 'jenks', label: "Jenks Natural Breaks" },
                { value: 'quantile', label: 'Quantile' },
                { value: 'custom', label: 'Custom Breaks' },
              ]}
              value={config.method}
              onChange={(value) => setConfig({
                ...config,
                method: value || 'equal_width',
                params: { ...config.params, strategy: value === 'equal_frequency' ? 'quantile' : 'uniform' }
              })}
            />

            <NumberInput
              label="Number of Bins"
              description="Specify the number of bins to create"
              value={config.params.bins}
              onChange={(value) => setConfig({
                ...config,
                params: { ...config.params, bins: typeof value === 'number' ? value : 10 }
              })}
              min={2}
              max={100}
            />

            {config.method === 'custom' && (
              <Group grow>
                <NumberInput
                  label="Min Value"
                  value={config.params.range?.[0]}
                  onChange={(value) => setConfig({
                    ...config,
                    params: {
                      ...config.params,
                      range: [typeof value === 'number' ? value : 0, config.params.range?.[1] || 0]
                    }
                  })}
                />
                <NumberInput
                  label="Max Value"
                  value={config.params.range?.[1]}
                  onChange={(value) => setConfig({
                    ...config,
                    params: {
                      ...config.params,
                      range: [config.params.range?.[0] || 0, typeof value === 'number' ? value : 0]
                    }
                  })}
                />
              </Group>
            )}

            <Group grow>
              <Switch
                label="Include Lowest"
                description="Include the lowest edge in the first bin"
                checked={config.params.includeLowest}
                onChange={(e) => setConfig({
                  ...config,
                  params: { ...config.params, includeLowest: e.currentTarget.checked }
                })}
              />

              <Switch
                label="Right-Inclusive"
                description="Intervals are closed on the right"
                checked={config.params.right}
                onChange={(e) => setConfig({
                  ...config,
                  params: { ...config.params, right: e.currentTarget.checked }
                })}
              />
            </Group>

            <NumberInput
              label="Precision"
              description="Decimal places for bin edges"
              value={config.params.precision}
              onChange={(value) => setConfig({
                ...config,
                params: { ...config.params, precision: typeof value === 'number' ? value : 3 }
              })}
              min={0}
              max={10}
            />

            <Group justify="flex-end">
              <Button
                onClick={handleApplyBinning}
                loading={binningMutation.isPending}
                leftSection={<IconBinaryTree size={16} />}
                disabled={config.columns.length === 0}
              >
                Apply Binning
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 
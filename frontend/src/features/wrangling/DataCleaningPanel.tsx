import React, { useState } from 'react';
import { Stack, Select, MultiSelect, Button, Group, Text, Switch, NumberInput, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconWand } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface CleaningConfig {
  missingValues: {
    strategy: string;
    fillValue?: string | number;
    columns: string[];
  };
  duplicates: {
    enabled: boolean;
    subset?: string[];
    keepFirst: boolean;
  };
  outliers: {
    enabled: boolean;
    method: string;
    threshold: number;
    columns: string[];
  };
}

export function DataCleaningPanel() {
  const [config, setConfig] = useState<CleaningConfig>({
    missingValues: {
      strategy: 'drop',
      columns: [],
    },
    duplicates: {
      enabled: false,
      keepFirst: true,
    },
    outliers: {
      enabled: false,
      method: 'zscore',
      threshold: 3,
      columns: [],
    },
  });

  // Fetch available columns
  const { data: columns = [] } = useQuery({
    queryKey: ['columns'],
    queryFn: async () => {
      const response = await fetch('/api/datasets/active/columns');
      if (!response.ok) throw new Error('Failed to fetch columns');
      return response.json();
    },
  });

  // Apply cleaning mutation
  const cleaningMutation = useMutation({
    mutationFn: async (cleaningConfig: CleaningConfig) => {
      const response = await fetch('/api/data/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleaningConfig),
      });
      if (!response.ok) throw new Error('Failed to apply cleaning');
      return response.json();
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Data cleaning applied successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to apply cleaning',
        color: 'red',
      });
    },
  });

  const handleApplyCleaning = () => {
    cleaningMutation.mutate(config);
  };

  return (
    <Stack gap="xl">
      {/* Missing Values Section */}
      <Stack gap="md">
        <Text fw={500}>Handle Missing Values</Text>
        <Select
          label="Strategy"
          description="How to handle missing values"
          data={[
            { value: 'drop', label: 'Drop rows' },
            { value: 'fill_mean', label: 'Fill with mean' },
            { value: 'fill_median', label: 'Fill with median' },
            { value: 'fill_mode', label: 'Fill with mode' },
            { value: 'fill_value', label: 'Fill with custom value' },
          ]}
          value={config.missingValues.strategy}
          onChange={(value) => setConfig({
            ...config,
            missingValues: { ...config.missingValues, strategy: value || 'drop' }
          })}
        />
        
        {config.missingValues.strategy === 'fill_value' && (
          <TextInput
            label="Fill Value"
            description="Value to use for filling missing data"
            value={config.missingValues.fillValue || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({
              ...config,
              missingValues: { ...config.missingValues, fillValue: e.target.value }
            })}
          />
        )}

        <MultiSelect
          label="Apply to Columns"
          description="Select columns to handle missing values (leave empty for all columns)"
          data={columns}
          value={config.missingValues.columns}
          onChange={(value) => setConfig({
            ...config,
            missingValues: { ...config.missingValues, columns: value }
          })}
          searchable
          clearable
        />
      </Stack>

      {/* Duplicates Section */}
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={500}>Handle Duplicates</Text>
          <Switch
            checked={config.duplicates.enabled}
            onChange={(e) => setConfig({
              ...config,
              duplicates: { ...config.duplicates, enabled: e.currentTarget.checked }
            })}
          />
        </Group>

        {config.duplicates.enabled && (
          <>
            <MultiSelect
              label="Consider Columns"
              description="Select columns to consider for duplicates (leave empty for all columns)"
              data={columns}
              value={config.duplicates.subset || []}
              onChange={(value) => setConfig({
                ...config,
                duplicates: { ...config.duplicates, subset: value }
              })}
              searchable
              clearable
            />
            <Switch
              label="Keep First Occurrence"
              checked={config.duplicates.keepFirst}
              onChange={(e) => setConfig({
                ...config,
                duplicates: { ...config.duplicates, keepFirst: e.currentTarget.checked }
              })}
            />
          </>
        )}
      </Stack>

      {/* Outliers Section */}
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={500}>Handle Outliers</Text>
          <Switch
            checked={config.outliers.enabled}
            onChange={(e) => setConfig({
              ...config,
              outliers: { ...config.outliers, enabled: e.currentTarget.checked }
            })}
          />
        </Group>

        {config.outliers.enabled && (
          <>
            <Select
              label="Detection Method"
              data={[
                { value: 'zscore', label: 'Z-Score' },
                { value: 'iqr', label: 'IQR' },
                { value: 'isolation_forest', label: 'Isolation Forest' },
              ]}
              value={config.outliers.method}
              onChange={(value) => setConfig({
                ...config,
                outliers: { ...config.outliers, method: value || 'zscore' }
              })}
            />
            <NumberInput
              label="Threshold"
              description="Threshold for outlier detection"
              value={config.outliers.threshold}
              onChange={(value) => setConfig({
                ...config,
                outliers: { ...config.outliers, threshold: typeof value === 'number' ? value : 3 }
              })}
              min={1}
              max={10}
              step={0.5}
            />
            <MultiSelect
              label="Apply to Columns"
              description="Select numeric columns for outlier detection"
              data={columns}
              value={config.outliers.columns}
              onChange={(value) => setConfig({
                ...config,
                outliers: { ...config.outliers, columns: value }
              })}
              searchable
              clearable
            />
          </>
        )}
      </Stack>

      <Group justify="flex-end">
        <Button
          onClick={handleApplyCleaning}
          loading={cleaningMutation.isPending}
          leftSection={<IconWand size={16} />}
        >
          Apply Cleaning
        </Button>
      </Group>
    </Stack>
  );
} 
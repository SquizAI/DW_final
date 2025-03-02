import React, { useState } from 'react';
import { Stack, Select, MultiSelect, Button, Group, Text, TextInput, JsonInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowsShuffle } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface TransformConfig {
  type: string;
  columns: string[];
  params: Record<string, any>;
}

export function DataTransformPanel() {
  const [config, setConfig] = useState<TransformConfig>({
    type: '',
    columns: [],
    params: {},
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

  // Apply transformation mutation
  const transformMutation = useMutation({
    mutationFn: async (transformConfig: TransformConfig) => {
      const response = await fetch('/api/data/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transformConfig),
      });
      if (!response.ok) throw new Error('Failed to apply transformation');
      return response.json();
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Transformation applied successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to apply transformation',
        color: 'red',
      });
    },
  });

  const handleApplyTransform = () => {
    transformMutation.mutate(config);
  };

  const renderParamsInput = () => {
    switch (config.type) {
      case 'normalize':
        return (
          <Group grow>
            <TextInput
              label="Min Value"
              type="number"
              value={config.params.min || '0'}
              onChange={(e) => setConfig({
                ...config,
                params: { ...config.params, min: parseFloat(e.target.value) }
              })}
            />
            <TextInput
              label="Max Value"
              type="number"
              value={config.params.max || '1'}
              onChange={(e) => setConfig({
                ...config,
                params: { ...config.params, max: parseFloat(e.target.value) }
              })}
            />
          </Group>
        );

      case 'bin':
        return (
          <TextInput
            label="Number of Bins"
            type="number"
            value={config.params.bins || '10'}
            onChange={(e) => setConfig({
              ...config,
              params: { ...config.params, bins: parseInt(e.target.value) }
            })}
          />
        );

      case 'encode':
        return (
          <Select
            label="Encoding Method"
            value={config.params.method || 'label'}
            onChange={(value) => setConfig({
              ...config,
              params: { ...config.params, method: value }
            })}
            data={[
              { value: 'label', label: 'Label Encoding' },
              { value: 'onehot', label: 'One-Hot Encoding' },
              { value: 'ordinal', label: 'Ordinal Encoding' },
            ]}
          />
        );

      case 'custom':
        return (
          <JsonInput
            label="Custom Transform Parameters"
            placeholder='{"param1": "value1", "param2": "value2"}'
            value={JSON.stringify(config.params, null, 2)}
            onChange={(value) => {
              try {
                setConfig({
                  ...config,
                  params: JSON.parse(value)
                });
              } catch (e) {
                // Invalid JSON, ignore
              }
            }}
            formatOnBlur
            minRows={4}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Stack gap="xl">
      <Select
        label="Transformation Type"
        description="Select the type of transformation to apply"
        data={[
          { value: 'normalize', label: 'Normalize (Scale to Range)' },
          { value: 'standardize', label: 'Standardize (Z-Score)' },
          { value: 'bin', label: 'Binning' },
          { value: 'encode', label: 'Categorical Encoding' },
          { value: 'log', label: 'Log Transform' },
          { value: 'sqrt', label: 'Square Root Transform' },
          { value: 'custom', label: 'Custom Transform' },
        ]}
        value={config.type}
        onChange={(value) => setConfig({
          ...config,
          type: value || '',
          params: {}  // Reset params when type changes
        })}
      />

      <MultiSelect
        label="Apply to Columns"
        description="Select columns to transform"
        data={columns}
        value={config.columns}
        onChange={(value) => setConfig({ ...config, columns: value })}
        searchable
        clearable
      />

      {config.type && (
        <>
          <Text fw={500}>Transform Parameters</Text>
          {renderParamsInput()}
        </>
      )}

      <Group justify="flex-end">
        <Button
          onClick={handleApplyTransform}
          loading={transformMutation.isPending}
          leftSection={<IconArrowsShuffle size={16} />}
          disabled={!config.type || config.columns.length === 0}
        >
          Apply Transform
        </Button>
      </Group>
    </Stack>
  );
} 
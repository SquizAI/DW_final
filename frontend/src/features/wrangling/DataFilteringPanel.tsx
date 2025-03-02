import React, { useState } from 'react';
import { Stack, Select, MultiSelect, Button, Group, Text, TextInput, NumberInput, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconFilter, IconPlus, IconTrash } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface FilterCondition {
  column: string;
  operator: string;
  value: string | number;
}

interface FilterConfig {
  conditions: FilterCondition[];
  combineOperator: 'AND' | 'OR';
}

export function DataFilteringPanel() {
  const [config, setConfig] = useState<FilterConfig>({
    conditions: [{ column: '', operator: '==', value: '' }],
    combineOperator: 'AND',
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

  // Apply filters mutation
  const filterMutation = useMutation({
    mutationFn: async (filterConfig: FilterConfig) => {
      const response = await fetch('/api/data/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterConfig),
      });
      if (!response.ok) throw new Error('Failed to apply filters');
      return response.json();
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Filters applied successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to apply filters',
        color: 'red',
      });
    },
  });

  const handleAddCondition = () => {
    setConfig({
      ...config,
      conditions: [...config.conditions, { column: '', operator: '==', value: '' }],
    });
  };

  const handleRemoveCondition = (index: number) => {
    setConfig({
      ...config,
      conditions: config.conditions.filter((_, i) => i !== index),
    });
  };

  const handleApplyFilters = () => {
    filterMutation.mutate(config);
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Text fw={500}>Filter Conditions</Text>
        <Select
          label="Combine With"
          value={config.combineOperator}
          onChange={(value) => setConfig({ ...config, combineOperator: (value || 'AND') as 'AND' | 'OR' })}
          data={[
            { value: 'AND', label: 'AND (Match All)' },
            { value: 'OR', label: 'OR (Match Any)' },
          ]}
          style={{ width: 200 }}
        />
      </Group>

      <Stack gap="md">
        {config.conditions.map((condition, index) => (
          <Group key={index} grow>
            <Select
              label="Column"
              data={columns}
              value={condition.column}
              onChange={(value) => {
                const newConditions = [...config.conditions];
                newConditions[index] = { ...condition, column: value || '' };
                setConfig({ ...config, conditions: newConditions });
              }}
              style={{ flex: 2 }}
            />
            <Select
              label="Operator"
              data={[
                { value: '==', label: 'Equals' },
                { value: '!=', label: 'Not Equals' },
                { value: '>', label: 'Greater Than' },
                { value: '<', label: 'Less Than' },
                { value: '>=', label: 'Greater Than or Equal' },
                { value: '<=', label: 'Less Than or Equal' },
                { value: 'contains', label: 'Contains' },
                { value: 'startswith', label: 'Starts With' },
                { value: 'endswith', label: 'Ends With' },
              ]}
              value={condition.operator}
              onChange={(value) => {
                const newConditions = [...config.conditions];
                newConditions[index] = { ...condition, operator: value || '==' };
                setConfig({ ...config, conditions: newConditions });
              }}
              style={{ flex: 2 }}
            />
            <TextInput
              label="Value"
              value={condition.value}
              onChange={(e) => {
                const newConditions = [...config.conditions];
                newConditions[index] = { ...condition, value: e.target.value };
                setConfig({ ...config, conditions: newConditions });
              }}
              style={{ flex: 2 }}
            />
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => handleRemoveCondition(index)}
              disabled={config.conditions.length === 1}
              style={{ alignSelf: 'flex-end', marginBottom: '3px' }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>

      <Group>
        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={handleAddCondition}
        >
          Add Condition
        </Button>
        <Button
          leftSection={<IconFilter size={16} />}
          onClick={handleApplyFilters}
          loading={filterMutation.isPending}
        >
          Apply Filters
        </Button>
      </Group>
    </Stack>
  );
} 
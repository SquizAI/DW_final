import React, { useState } from 'react';
import { Stack, Select, MultiSelect, Button, Group, Text, TextInput, ActionIcon, Switch } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconColumns, IconTrash, IconPlus } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface ColumnOperation {
  type: 'rename' | 'drop' | 'create' | 'merge';
  params: Record<string, any>;
}

export function ColumnManagementPanel() {
  const [operations, setOperations] = useState<ColumnOperation[]>([]);

  // Fetch available columns
  const { data: columns = [] } = useQuery({
    queryKey: ['columns'],
    queryFn: async () => {
      const response = await fetch('/api/datasets/active/columns');
      if (!response.ok) throw new Error('Failed to fetch columns');
      return response.json();
    },
  });

  // Apply column operations mutation
  const columnMutation = useMutation({
    mutationFn: async (ops: ColumnOperation[]) => {
      const response = await fetch('/api/data/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations: ops }),
      });
      if (!response.ok) throw new Error('Failed to apply column operations');
      return response.json();
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Column operations applied successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to apply column operations',
        color: 'red',
      });
    },
  });

  const addOperation = (type: ColumnOperation['type']) => {
    const newOperation: ColumnOperation = {
      type,
      params: type === 'rename' ? { oldName: '', newName: '' } :
              type === 'drop' ? { columns: [] } :
              type === 'create' ? { name: '', expression: '' } :
              { columns: [], name: '', separator: ' ' },
    };
    setOperations([...operations, newOperation]);
  };

  const removeOperation = (index: number) => {
    setOperations(operations.filter((_, i) => i !== index));
  };

  const updateOperation = (index: number, updates: Partial<ColumnOperation>) => {
    const newOperations = [...operations];
    newOperations[index] = { ...newOperations[index], ...updates };
    setOperations(newOperations);
  };

  const renderOperationFields = (operation: ColumnOperation, index: number) => {
    switch (operation.type) {
      case 'rename':
        return (
          <Group grow>
            <Select
              label="Column to Rename"
              data={columns}
              value={operation.params.oldName}
              onChange={(value) => updateOperation(index, {
                params: { ...operation.params, oldName: value }
              })}
            />
            <TextInput
              label="New Name"
              value={operation.params.newName}
              onChange={(e) => updateOperation(index, {
                params: { ...operation.params, newName: e.target.value }
              })}
            />
          </Group>
        );

      case 'drop':
        return (
          <MultiSelect
            label="Columns to Drop"
            data={columns}
            value={operation.params.columns}
            onChange={(value) => updateOperation(index, {
              params: { ...operation.params, columns: value }
            })}
          />
        );

      case 'create':
        return (
          <Stack gap="md">
            <TextInput
              label="New Column Name"
              value={operation.params.name}
              onChange={(e) => updateOperation(index, {
                params: { ...operation.params, name: e.target.value }
              })}
            />
            <TextInput
              label="Expression"
              description="Python expression using existing column names"
              value={operation.params.expression}
              onChange={(e) => updateOperation(index, {
                params: { ...operation.params, expression: e.target.value }
              })}
            />
          </Stack>
        );

      case 'merge':
        return (
          <Stack gap="md">
            <MultiSelect
              label="Columns to Merge"
              data={columns}
              value={operation.params.columns}
              onChange={(value) => updateOperation(index, {
                params: { ...operation.params, columns: value }
              })}
            />
            <TextInput
              label="New Column Name"
              value={operation.params.name}
              onChange={(e) => updateOperation(index, {
                params: { ...operation.params, name: e.target.value }
              })}
            />
            <TextInput
              label="Separator"
              value={operation.params.separator}
              onChange={(e) => updateOperation(index, {
                params: { ...operation.params, separator: e.target.value }
              })}
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  const handleApplyOperations = () => {
    columnMutation.mutate(operations);
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Text fw={500}>Column Operations</Text>
        <Group>
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => addOperation('rename')}
          >
            Rename Column
          </Button>
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => addOperation('drop')}
          >
            Drop Columns
          </Button>
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => addOperation('create')}
          >
            Create Column
          </Button>
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => addOperation('merge')}
          >
            Merge Columns
          </Button>
        </Group>
      </Group>

      <Stack gap="md">
        {operations.map((operation, index) => (
          <Stack key={index} gap="md" style={{ position: 'relative' }}>
            <Group justify="space-between">
              <Text fw={500}>
                {operation.type === 'rename' ? 'Rename Column' :
                 operation.type === 'drop' ? 'Drop Columns' :
                 operation.type === 'create' ? 'Create Column' :
                 'Merge Columns'}
              </Text>
              <ActionIcon
                color="red"
                variant="light"
                onClick={() => removeOperation(index)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
            {renderOperationFields(operation, index)}
          </Stack>
        ))}
      </Stack>

      {operations.length > 0 && (
        <Group justify="flex-end">
          <Button
            onClick={handleApplyOperations}
            loading={columnMutation.isPending}
            leftSection={<IconColumns size={16} />}
          >
            Apply Operations
          </Button>
        </Group>
      )}
    </Stack>
  );
} 
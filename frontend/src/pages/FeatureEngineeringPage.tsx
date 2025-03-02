import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Group, 
  Stack,
  Button,
  Select,
  MultiSelect,
  ThemeIcon,
  rem,
  TextInput,
  Table,
  ScrollArea,
  Badge,
  ActionIcon,
  Tooltip,
  Tabs,
  Code,
} from '@mantine/core';
import { 
  IconWand,
  IconCheck,
  IconX,
  IconRefresh,
  IconPlus,
  IconTrash,
  IconMathFunction,
  IconAbc,
  IconCalendar,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Column {
  value: string;
  label: string;
  type: 'numeric' | 'categorical' | 'datetime';
  derived?: boolean;
  formula?: string;
}

interface FeaturePreview {
  name: string;
  sample: any[];
  stats: {
    type: string;
    missing: number;
    unique: number;
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
  };
}

const NUMERIC_OPERATIONS = [
  { value: 'add', label: 'Addition (+)', template: '{col1} + {col2}' },
  { value: 'subtract', label: 'Subtraction (-)', template: '{col1} - {col2}' },
  { value: 'multiply', label: 'Multiplication (*)', template: '{col1} * {col2}' },
  { value: 'divide', label: 'Division (/)', template: '{col1} / {col2}' },
  { value: 'power', label: 'Power (^)', template: 'pow({col1}, {col2})' },
  { value: 'log', label: 'Logarithm', template: 'log({col1})' },
  { value: 'sqrt', label: 'Square Root', template: 'sqrt({col1})' },
  { value: 'abs', label: 'Absolute Value', template: 'abs({col1})' },
];

const STRING_OPERATIONS = [
  { value: 'concat', label: 'Concatenate', template: 'concat({col1}, {col2})' },
  { value: 'substring', label: 'Substring', template: 'substring({col1}, start, length)' },
  { value: 'upper', label: 'Uppercase', template: 'upper({col1})' },
  { value: 'lower', label: 'Lowercase', template: 'lower({col1})' },
  { value: 'trim', label: 'Trim', template: 'trim({col1})' },
  { value: 'replace', label: 'Replace', template: 'replace({col1}, search, replace)' },
];

const DATE_OPERATIONS = [
  { value: 'year', label: 'Extract Year', template: 'year({col1})' },
  { value: 'month', label: 'Extract Month', template: 'month({col1})' },
  { value: 'day', label: 'Extract Day', template: 'day({col1})' },
  { value: 'hour', label: 'Extract Hour', template: 'hour({col1})' },
  { value: 'minute', label: 'Extract Minute', template: 'minute({col1})' },
  { value: 'weekday', label: 'Extract Weekday', template: 'weekday({col1})' },
  { value: 'quarter', label: 'Extract Quarter', template: 'quarter({col1})' },
  { value: 'date_diff', label: 'Date Difference', template: 'date_diff({col1}, {col2})' },
];

export function FeatureEngineeringPage() {
  const [selectedTab, setSelectedTab] = useState<string | null>('numeric');
  const [newFeature, setNewFeature] = useState({
    name: '',
    operation: '',
    columns: [] as string[],
    params: {} as Record<string, string>,
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ columns: Column[] }>({
    queryKey: ['columns'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/datasets/active/columns');
      if (!response.ok) throw new Error('Failed to fetch columns');
      return response.json();
    },
  });

  const columns = data?.columns || [];
  const numericColumns = columns.filter(col => col.type === 'numeric');
  const categoricalColumns = columns.filter(col => col.type === 'categorical');
  const datetimeColumns = columns.filter(col => col.type === 'datetime');

  const { data: preview } = useQuery<FeaturePreview>({
    queryKey: ['feature-preview', newFeature],
    queryFn: async () => {
      if (!newFeature.name || !newFeature.operation) return null;
      const response = await fetch('/api/features/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeature),
      });
      if (!response.ok) throw new Error('Failed to generate feature preview');
      return response.json();
    },
    enabled: !!(newFeature.name && newFeature.operation),
  });

  const createFeatureMutation = useMutation({
    mutationFn: async (feature: typeof newFeature) => {
      const response = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feature),
      });
      if (!response.ok) throw new Error('Failed to create feature');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      setNewFeature({
        name: '',
        operation: '',
        columns: [],
        params: {},
      });
      notifications.show({
        title: 'Success',
        message: 'Feature created successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create feature',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: async (columnName: string) => {
      const response = await fetch(`/api/features/${columnName}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete feature');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      notifications.show({
        title: 'Success',
        message: 'Feature deleted successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
  });

  const handleCreate = () => {
    createFeatureMutation.mutate(newFeature);
  };

  const getOperations = () => {
    switch (selectedTab) {
      case 'numeric':
        return NUMERIC_OPERATIONS;
      case 'string':
        return STRING_OPERATIONS;
      case 'date':
        return DATE_OPERATIONS;
      default:
        return [];
    }
  };

  const getColumnsByType = () => {
    switch (selectedTab) {
      case 'numeric':
        return numericColumns;
      case 'string':
        return categoricalColumns;
      case 'date':
        return datetimeColumns;
      default:
        return [];
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Card withBorder shadow="sm" p="xl">
          <Stack gap="md">
            <Group>
              <ThemeIcon size={40} radius="md" variant="light" color="blue">
                <IconWand size={rem(20)} />
              </ThemeIcon>
              <div>
                <Title order={2}>Feature Engineering</Title>
                <Text c="dimmed">
                  Create and transform features
                </Text>
              </div>
            </Group>

            <Tabs value={selectedTab} onChange={(value: string | null) => setSelectedTab(value || 'numeric')}>
              <Tabs.List>
                <Tabs.Tab 
                  value="numeric" 
                  leftSection={<IconMathFunction size={16} />}
                >
                  Numeric Operations
                </Tabs.Tab>
                <Tabs.Tab 
                  value="string" 
                  leftSection={<IconAbc size={16} />}
                >
                  String Operations
                </Tabs.Tab>
                <Tabs.Tab 
                  value="date" 
                  leftSection={<IconCalendar size={16} />}
                >
                  Date Operations
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value={selectedTab || 'numeric'} pt="md">
                <Stack gap="md">
                  <TextInput
                    label="New Feature Name"
                    placeholder="Enter name for the new feature"
                    value={newFeature.name}
                    onChange={(e) => setNewFeature({ 
                      ...newFeature, 
                      name: e.target.value 
                    })}
                  />

                  <Select
                    label="Operation"
                    placeholder="Select operation"
                    data={getOperations()}
                    value={newFeature.operation}
                    onChange={(value) => setNewFeature({ 
                      ...newFeature, 
                      operation: value || '',
                      columns: [],
                      params: {},
                    })}
                  />

                  {newFeature.operation && (
                    <>
                      <MultiSelect
                        label="Input Columns"
                        placeholder="Select columns"
                        data={getColumnsByType().map(col => ({
                          value: col.value,
                          label: col.label,
                        }))}
                        value={newFeature.columns}
                        onChange={(value) => setNewFeature({ 
                          ...newFeature, 
                          columns: value 
                        })}
                      />

                      <Card withBorder>
                        <Stack gap="xs">
                          <Text fw={500}>Formula Preview:</Text>
                          <Code block>
                            {getOperations().find(op => 
                              op.value === newFeature.operation
                            )?.template.replace(
                              /{col(\d+)}/g, 
                              (_, i) => newFeature.columns[parseInt(i) - 1] || '_'
                            )}
                          </Code>
                        </Stack>
                      </Card>

                      {preview && (
                        <Card withBorder>
                          <Stack gap="md">
                            <Group>
                              <Text fw={500}>Preview:</Text>
                              <Badge>{preview.stats.type}</Badge>
                              <Text size="sm" c="dimmed">
                                {preview.stats.missing} missing • {preview.stats.unique} unique
                              </Text>
                            </Group>

                            <ScrollArea>
                              <Table>
                                <Table.Thead>
                                  <Table.Tr>
                                    <Table.Th>Sample Values</Table.Th>
                                  </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                  {preview.sample.map((value, index) => (
                                    <Table.Tr key={index}>
                                      <Table.Td>{value?.toString() || 'null'}</Table.Td>
                                    </Table.Tr>
                                  ))}
                                </Table.Tbody>
                              </Table>
                            </ScrollArea>

                            {preview.stats.type === 'number' && (
                              <Group>
                                <Text size="sm">
                                  Mean: {preview.stats.mean?.toFixed(2)}
                                </Text>
                                <Text size="sm">•</Text>
                                <Text size="sm">
                                  Std: {preview.stats.std?.toFixed(2)}
                                </Text>
                                <Text size="sm">•</Text>
                                <Text size="sm">
                                  Range: [{preview.stats.min?.toFixed(2)}, {preview.stats.max?.toFixed(2)}]
                                </Text>
                              </Group>
                            )}
                          </Stack>
                        </Card>
                      )}

                      <Group justify="flex-end" gap="sm">
                        <Button
                          variant="light"
                          color="gray"
                          onClick={() => setNewFeature({
                            name: '',
                            operation: '',
                            columns: [],
                            params: {},
                          })}
                        >
                          Reset
                        </Button>
                        <Button
                          leftSection={<IconPlus size={16} />}
                          onClick={handleCreate}
                          loading={createFeatureMutation.isPending}
                          disabled={!newFeature.name || !newFeature.operation || !newFeature.columns.length}
                        >
                          Create Feature
                        </Button>
                      </Group>
                    </>
                  )}
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Card>

        <Card withBorder shadow="sm" p="xl">
          <Stack gap="md">
            <Group justify="space-between">
              <Group>
                <ThemeIcon size={40} radius="md" variant="light" color="blue">
                  <IconWand size={rem(20)} />
                </ThemeIcon>
                <Title order={2}>Engineered Features</Title>
              </Group>
              <Button
                variant="light"
                leftSection={<IconRefresh size={16} />}
                onClick={() => queryClient.invalidateQueries({ queryKey: ['columns'] })}
              >
                Refresh
              </Button>
            </Group>

            <ScrollArea>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Formula</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {columns.filter(col => col.derived).map((column) => (
                    <Table.Tr key={column.value}>
                      <Table.Td>{column.label}</Table.Td>
                      <Table.Td>
                        <Badge>{column.type}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Code>{column.formula}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Tooltip label="Delete Feature">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => deleteFeatureMutation.mutate(column.value)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 
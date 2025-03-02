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
  Tabs,
  Table,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Badge,
  Switch,
  NumberInput,
  TextInput,
} from '@mantine/core';
import { 
  IconBrush,
  IconColumnRemove,
  IconReplace,
  IconMathFunction,
  IconFilterSearch,
  IconSortAscending,
  IconCheck,
  IconX,
  IconRefresh,
  IconEye,
  IconPlayerPlay,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Column {
  name: string;
  type: string;
  missing: number;
  unique: number;
  sample: any[];
}

interface DataPreview {
  columns: Column[];
  data: Record<string, any>[];
  totalRows: number;
}

export function DataWranglingPage() {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [operation, setOperation] = useState<string>('');
  const [params, setParams] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  const { data: preview, isLoading, error } = useQuery<DataPreview>({
    queryKey: ['data-preview'],
    queryFn: async () => {
      const response = await fetch('/api/datasets/active/preview');
      if (!response.ok) throw new Error('Failed to fetch data preview');
      return response.json();
    },
  });

  const wrangleMutation = useMutation({
    mutationFn: async (params: {
      operation: string;
      columns: string[];
      params: Record<string, any>;
    }) => {
      const response = await fetch('/api/data/wrangle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Data wrangling operation failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-preview'] });
      notifications.show({
        title: 'Success',
        message: 'Data transformation applied successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to apply transformation',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  const handleApply = () => {
    wrangleMutation.mutate({
      operation,
      columns: selectedColumns,
      params,
    });
  };

  const operations = [
    { value: 'remove_missing', label: 'Remove Missing Values', icon: IconColumnRemove },
    { value: 'fill_missing', label: 'Fill Missing Values', icon: IconReplace },
    { value: 'normalize', label: 'Normalize Values', icon: IconMathFunction },
    { value: 'filter', label: 'Filter Rows', icon: IconFilterSearch },
    { value: 'sort', label: 'Sort Data', icon: IconSortAscending },
  ];

  const renderOperationParams = () => {
    switch (operation) {
      case 'fill_missing':
        return (
          <Select
            label="Fill Method"
            placeholder="Select fill method"
            data={[
              { value: 'mean', label: 'Mean' },
              { value: 'median', label: 'Median' },
              { value: 'mode', label: 'Mode' },
              { value: 'constant', label: 'Constant Value' },
            ]}
            value={params.method}
            onChange={(value) => setParams({ ...params, method: value })}
          />
        );
      case 'normalize':
        return (
          <Select
            label="Normalization Method"
            placeholder="Select method"
            data={[
              { value: 'minmax', label: 'Min-Max Scaling' },
              { value: 'zscore', label: 'Z-Score Standardization' },
              { value: 'robust', label: 'Robust Scaling' },
            ]}
            value={params.method}
            onChange={(value) => setParams({ ...params, method: value })}
          />
        );
      case 'filter':
        return (
          <Stack gap="sm">
            <Select
              label="Condition"
              placeholder="Select condition"
              data={[
                { value: 'greater', label: 'Greater Than' },
                { value: 'less', label: 'Less Than' },
                { value: 'equal', label: 'Equal To' },
                { value: 'contains', label: 'Contains' },
              ]}
              value={params.condition}
              onChange={(value) => setParams({ ...params, condition: value })}
            />
            <TextInput
              label="Value"
              placeholder="Enter value"
              value={params.value || ''}
              onChange={(e) => setParams({ ...params, value: e.target.value })}
            />
          </Stack>
        );
      case 'sort':
        return (
          <Stack gap="sm">
            <Select
              label="Sort Order"
              placeholder="Select order"
              data={[
                { value: 'ascending', label: 'Ascending' },
                { value: 'descending', label: 'Descending' },
              ]}
              value={params.order}
              onChange={(value) => setParams({ ...params, order: value })}
            />
            <Switch
              label="Treat Missing Values as Smallest"
              checked={params.na_position === 'first'}
              onChange={(e) => setParams({ 
                ...params, 
                na_position: e.currentTarget.checked ? 'first' : 'last' 
              })}
            />
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Card withBorder shadow="sm" p="xl">
          <Stack gap="md">
            <Group>
              <ThemeIcon size={40} radius="md" variant="light" color="blue">
                <IconBrush style={{ width: '1.25rem', height: '1.25rem' }} />
              </ThemeIcon>
              <div>
                <Title order={2}>Data Wrangling</Title>
                <Text c="dimmed">
                  Clean and transform your data
                </Text>
              </div>
            </Group>

            <Tabs defaultValue="transform">
              <Tabs.List>
                <Tabs.Tab 
                  value="transform" 
                  leftSection={<IconBrush style={{ width: '1rem', height: '1rem' }} />}
                >
                  Transform
                </Tabs.Tab>
                <Tabs.Tab 
                  value="preview" 
                  leftSection={<IconEye style={{ width: '1rem', height: '1rem' }} />}
                >
                  Data Preview
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="transform" pt="md">
                <Stack gap="md">
                  <Select
                    label="Operation"
                    placeholder="Select operation"
                    data={operations.map(op => ({
                      value: op.value,
                      label: op.label,
                      leftSection: <op.icon style={{ width: '1rem', height: '1rem' }} />,
                    }))}
                    value={operation}
                    onChange={(value) => {
                      setOperation(value || '');
                      setParams({});
                    }}
                  />

                  {operation && preview?.columns && (
                    <>
                      <MultiSelect
                        label="Target Columns"
                        placeholder="Select columns"
                        data={preview.columns.map(col => ({
                          value: col.name,
                          label: col.name,
                        }))}
                        value={selectedColumns}
                        onChange={setSelectedColumns}
                      />

                      {renderOperationParams()}

                      <Group justify="flex-end" gap="sm">
                        <Button
                          variant="light"
                          color="gray"
                          onClick={() => {
                            setOperation('');
                            setSelectedColumns([]);
                            setParams({});
                          }}
                        >
                          Reset
                        </Button>
                        <Button
                          leftSection={<IconPlayerPlay style={{ width: '1rem', height: '1rem' }} />}
                          onClick={handleApply}
                          loading={wrangleMutation.isPending}
                          disabled={!operation || !selectedColumns.length}
                        >
                          Apply Transformation
                        </Button>
                      </Group>
                    </>
                  )}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="preview" pt="md">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={500}>Data Sample</Text>
                    <Button
                      variant="light"
                      leftSection={<IconRefresh style={{ width: '1rem', height: '1rem' }} />}
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['data-preview'] })}
                    >
                      Refresh
                    </Button>
                  </Group>

                  {isLoading ? (
                    <Text c="dimmed" ta="center" py="xl">Loading data preview...</Text>
                  ) : error ? (
                    <Text c="red" ta="center" py="xl">Error loading data preview</Text>
                  ) : !preview?.columns ? (
                    <Text c="dimmed" ta="center" py="xl">No data available</Text>
                  ) : (
                    <ScrollArea>
                      <Table>
                        <Table.Thead>
                          <Table.Tr>
                            {preview.columns.map((col) => (
                              <Table.Th key={col.name}>
                                <Stack gap={4}>
                                  <Group gap={4}>
                                    <Text size="sm" fw={500}>{col.name}</Text>
                                    <Badge size="xs">{col.type}</Badge>
                                  </Group>
                                  <Group gap={4}>
                                    <Text size="xs" c="dimmed">
                                      {col.missing} missing
                                    </Text>
                                    <Text size="xs" c="dimmed">•</Text>
                                    <Text size="xs" c="dimmed">
                                      {col.unique} unique
                                    </Text>
                                  </Group>
                                </Stack>
                              </Table.Th>
                            ))}
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {preview.data.map((row, i) => (
                            <Table.Tr key={i}>
                              {preview.columns.map((col) => (
                                <Table.Td key={col.name}>
                                  {row[col.name]?.toString() || 'null'}
                                </Table.Td>
                              ))}
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>
                  )}
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 
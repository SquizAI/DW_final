import { useState } from 'react';
import {
  Paper,
  Stack,
  Title,
  Group,
  Select,
  Button,
  Text,
  SimpleGrid,
  TextInput,
  MultiSelect,
  NumberInput,
  Switch,
  Code,
  Accordion,
  Box,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconWand,
  IconPlus,
  IconTrash,
  IconCode,
  IconTable,
  IconBulb,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { DataPreview, DataTransformConfig } from '../../types/data';

interface DataTransformPanelProps {
  nodeId: string;
  onTransformationApplied: (preview: any) => void;
  dataPreview: DataPreview;
}

const TRANSFORM_TYPES = [
  {
    value: 'column',
    label: 'Column Operations',
    operations: [
      { value: 'rename', label: 'Rename Columns' },
      { value: 'cast', label: 'Change Data Type' },
      { value: 'normalize', label: 'Normalize Values' },
      { value: 'standardize', label: 'Standardize Values' },
      { value: 'bin', label: 'Bin Values' },
      { value: 'encode', label: 'Encode Categories' },
    ],
  },
  {
    value: 'row',
    label: 'Row Operations',
    operations: [
      { value: 'filter', label: 'Filter Rows' },
      { value: 'sort', label: 'Sort' },
      { value: 'deduplicate', label: 'Remove Duplicates' },
      { value: 'fill_missing', label: 'Fill Missing Values' },
    ],
  },
  {
    value: 'aggregation',
    label: 'Aggregation',
    operations: [
      { value: 'group_by', label: 'Group By' },
      { value: 'pivot', label: 'Pivot Table' },
      { value: 'rolling', label: 'Rolling Window' },
    ],
  },
  {
    value: 'join',
    label: 'Join Operations',
    operations: [
      { value: 'merge', label: 'Merge Datasets' },
      { value: 'concat', label: 'Concatenate' },
      { value: 'union', label: 'Union' },
    ],
  },
];

export function DataTransformPanel({ nodeId, onTransformationApplied, dataPreview }: DataTransformPanelProps) {
  const [transformType, setTransformType] = useState<string>('column');
  const [operation, setOperation] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyTransform = async () => {
    if (!operation) return;

    setIsLoading(true);
    try {
      // This would be an API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));

      const transformConfig: DataTransformConfig = {
        type: transformType as any,
        config: {
          operation,
          ...config,
        },
      };

      // Simulate transformation preview
      const preview = {
        sample: dataPreview.sample.slice(0, 5),
        stats: {
          rowsAffected: Math.floor(dataPreview.stats.rowCount * 0.8),
          columnsAffected: config.columns?.length || 1,
        },
      };

      onTransformationApplied(preview);

      notifications.show({
        title: 'Success',
        message: 'Transformation applied successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to apply transformation',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getOperationConfig = () => {
    if (!operation) return null;

    switch (operation) {
      case 'rename':
        return (
          <Stack gap="md">
            {dataPreview.columns.map((column, index) => (
              <Group key={column} grow>
                <TextInput
                  label="Original"
                  value={column}
                  disabled
                />
                <TextInput
                  label="New Name"
                  placeholder="Enter new column name"
                  onChange={(e) => {
                    const newConfig = { ...config };
                    newConfig.columnMappings = {
                      ...newConfig.columnMappings,
                      [column]: e.target.value,
                    };
                    setConfig(newConfig);
                  }}
                />
              </Group>
            ))}
          </Stack>
        );

      case 'cast':
        return (
          <Stack gap="md">
            <MultiSelect
              label="Select Columns"
              data={dataPreview.columns}
              value={config.columns || []}
              onChange={(value) => setConfig({ ...config, columns: value })}
            />
            <Select
              label="New Data Type"
              data={[
                { value: 'integer', label: 'Integer' },
                { value: 'float', label: 'Float' },
                { value: 'string', label: 'String' },
                { value: 'datetime', label: 'Date/Time' },
                { value: 'boolean', label: 'Boolean' },
              ]}
              value={config.targetType}
              onChange={(value) => setConfig({ ...config, targetType: value })}
            />
          </Stack>
        );

      case 'normalize':
      case 'standardize':
        return (
          <Stack gap="md">
            <MultiSelect
              label="Select Numeric Columns"
              data={dataPreview.columns.filter(col => 
                ['integer', 'float', 'number'].includes(dataPreview.stats.dataTypes[col])
              )}
              value={config.columns || []}
              onChange={(value) => setConfig({ ...config, columns: value })}
            />
            {operation === 'normalize' && (
              <Group grow>
                <NumberInput
                  label="Min Value"
                  value={config.minValue || 0}
                  onChange={(value) => setConfig({ ...config, minValue: value })}
                />
                <NumberInput
                  label="Max Value"
                  value={config.maxValue || 1}
                  onChange={(value) => setConfig({ ...config, maxValue: value })}
                />
              </Group>
            )}
          </Stack>
        );

      case 'filter':
        return (
          <Stack gap="md">
            <Select
              label="Column"
              data={dataPreview.columns}
              value={config.column}
              onChange={(value) => setConfig({ ...config, column: value })}
            />
            <Select
              label="Operator"
              data={[
                { value: 'eq', label: 'Equals' },
                { value: 'neq', label: 'Not Equals' },
                { value: 'gt', label: 'Greater Than' },
                { value: 'lt', label: 'Less Than' },
                { value: 'contains', label: 'Contains' },
                { value: 'starts_with', label: 'Starts With' },
                { value: 'ends_with', label: 'Ends With' },
              ]}
              value={config.operator}
              onChange={(value) => setConfig({ ...config, operator: value })}
            />
            <TextInput
              label="Value"
              value={config.value || ''}
              onChange={(e) => setConfig({ ...config, value: e.target.value })}
            />
          </Stack>
        );

      case 'group_by':
        return (
          <Stack gap="md">
            <MultiSelect
              label="Group By Columns"
              data={dataPreview.columns}
              value={config.groupBy || []}
              onChange={(value) => setConfig({ ...config, groupBy: value })}
            />
            <Title order={4}>Aggregations</Title>
            {config.aggregations?.map((agg: any, index: number) => (
              <Group key={index} grow>
                <Select
                  label="Column"
                  data={dataPreview.columns.filter(col => 
                    ['integer', 'float', 'number'].includes(dataPreview.stats.dataTypes[col])
                  )}
                  value={agg.column}
                  onChange={(value) => {
                    const newAggregations = [...(config.aggregations || [])];
                    newAggregations[index] = { ...agg, column: value };
                    setConfig({ ...config, aggregations: newAggregations });
                  }}
                />
                <Select
                  label="Operation"
                  data={[
                    { value: 'sum', label: 'Sum' },
                    { value: 'avg', label: 'Average' },
                    { value: 'min', label: 'Minimum' },
                    { value: 'max', label: 'Maximum' },
                    { value: 'count', label: 'Count' },
                  ]}
                  value={agg.operation}
                  onChange={(value) => {
                    const newAggregations = [...(config.aggregations || [])];
                    newAggregations[index] = { ...agg, operation: value };
                    setConfig({ ...config, aggregations: newAggregations });
                  }}
                />
                <TextInput
                  label="Alias"
                  value={agg.alias || ''}
                  onChange={(e) => {
                    const newAggregations = [...(config.aggregations || [])];
                    newAggregations[index] = { ...agg, alias: e.target.value };
                    setConfig({ ...config, aggregations: newAggregations });
                  }}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => {
                    const newAggregations = config.aggregations.filter((_: any, i: number) => i !== index);
                    setConfig({ ...config, aggregations: newAggregations });
                  }}
                  style={{ alignSelf: 'flex-end' }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                const newAggregations = [...(config.aggregations || []), { column: null, operation: null, alias: '' }];
                setConfig({ ...config, aggregations: newAggregations });
              }}
            >
              Add Aggregation
            </Button>
          </Stack>
        );

      default:
        return (
          <Text c="dimmed">Select an operation to configure</Text>
        );
    }
  };

  return (
    <Stack gap="md" h="100%">
      <Paper withBorder p="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>Data Transformation</Title>
            <Tooltip label="Get AI Suggestions">
              <ActionIcon variant="light" color="grape" onClick={() => {/* TODO: Implement AI suggestions */}}>
                <IconBulb size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <SimpleGrid cols={2}>
            <Select
              label="Transform Type"
              data={TRANSFORM_TYPES.map(type => ({
                value: type.value,
                label: type.label,
              }))}
              value={transformType}
              onChange={(value) => {
                setTransformType(value || 'column');
                setOperation(null);
                setConfig({});
              }}
            />

            <Select
              label="Operation"
              data={TRANSFORM_TYPES.find(t => t.value === transformType)?.operations || []}
              value={operation}
              onChange={(value) => {
                setOperation(value);
                setConfig({});
              }}
            />
          </SimpleGrid>

          {getOperationConfig()}

          <Group justify="flex-end">
            <Button
              variant="light"
              color="blue"
              leftSection={<IconCode size={16} />}
              onClick={() => {/* TODO: Show code preview */}}
            >
              Preview Code
            </Button>
            <Button
              onClick={handleApplyTransform}
              loading={isLoading}
              leftSection={<IconWand size={16} />}
              disabled={!operation}
            >
              Apply Transform
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Preview section */}
      <Paper withBorder p="md" style={{ flex: 1 }}>
        <Stack gap="md">
          <Title order={4}>Transform Preview</Title>
          <Text size="sm" c="dimmed">
            Select and configure a transformation to see a preview of the results
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
} 
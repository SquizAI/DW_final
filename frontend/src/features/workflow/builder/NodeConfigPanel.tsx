import { useEffect, useMemo } from 'react';
import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Switch,
  Badge,
  Button,
  ColorInput,
  JsonInput,
  Accordion,
  ThemeIcon,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconTable,
  IconTransform,
  IconChartBar,
  IconBrain,
  IconChartPie,
  IconFileExport,
  IconDeviceFloppy,
  IconTrash,
  IconRefresh,
} from '@tabler/icons-react';
import { WorkflowNode, WorkflowNodeData } from './types';

interface NodeConfigPanelProps {
  selectedNode: WorkflowNode | null;
  onNodeUpdate: (node: WorkflowNode) => void;
  onNodeDelete: (nodeId: string) => void;
}

type SourceType = 'file' | 'database' | 'api';
type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count';
type CompressionType = 'none' | 'gzip' | 'zip' | 'snappy';

interface FormValues extends Record<string, any> {
  label: string;
  description: string;
  source?: {
    type: SourceType;
    location: string;
    format?: string;
  };
  operation?: string;
  params?: Record<string, any>;
  method?: string;
  metrics?: Record<string, number>;
  task?: string;
  model?: {
    name: string;
    version: string;
    params: Record<string, any>;
  };
  chartType?: string;
  config?: {
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    aggregation?: AggregationType;
  };
  format?: string;
  destination?: string;
  options?: {
    compression?: CompressionType;
    encoding?: string;
    includeHeaders?: boolean;
  };
}

const NODE_TYPE_ICONS = {
  dataNode: { icon: IconTable, color: 'blue' },
  transformNode: { icon: IconTransform, color: 'orange' },
  analysisNode: { icon: IconChartBar, color: 'green' },
  aiNode: { icon: IconBrain, color: 'grape' },
  visualNode: { icon: IconChartPie, color: 'violet' },
  exportNode: { icon: IconFileExport, color: 'cyan' },
} as const;

const NODE_TYPE_CONFIGS = {
  dataNode: {
    sourceTypes: ['file', 'database', 'api'],
    fileFormats: ['csv', 'json', 'excel', 'parquet'],
  },
  transformNode: {
    operations: [
      'filter',
      'sort',
      'group',
      'join',
      'aggregate',
      'pivot',
      'unpivot',
      'clean',
      'custom',
    ],
  },
  analysisNode: {
    methods: [
      'summary_statistics',
      'correlation',
      'regression',
      'clustering',
      'anomaly_detection',
      'custom',
    ],
  },
  aiNode: {
    tasks: [
      'classification',
      'regression',
      'clustering',
      'nlp',
      'forecasting',
      'custom',
    ],
    models: [
      'decision_tree',
      'random_forest',
      'gradient_boosting',
      'neural_network',
      'custom',
    ],
  },
  visualNode: {
    chartTypes: [
      'line',
      'bar',
      'scatter',
      'pie',
      'heatmap',
      'box',
      'violin',
      'custom',
    ],
    aggregations: ['sum', 'avg', 'min', 'max', 'count'],
  },
  exportNode: {
    formats: ['csv', 'json', 'excel', 'parquet', 'database', 'api'],
    compressionTypes: ['none', 'gzip', 'zip', 'snappy'],
    encodings: ['utf-8', 'utf-16', 'ascii', 'iso-8859-1'],
  },
} as const;

export function NodeConfigPanel({
  selectedNode,
  onNodeUpdate,
  onNodeDelete,
}: NodeConfigPanelProps) {
  const form = useForm<FormValues>({
    initialValues: {
      label: selectedNode?.data.label || '',
      description: selectedNode?.data.description || '',
      ...getNodeTypeSpecificDefaults(selectedNode?.type as WorkflowNodeData['type']),
    },
  });

  useEffect(() => {
    if (selectedNode) {
      const { type, ...values } = selectedNode.data;
      form.setValues(values as unknown as FormValues);
    }
  }, [selectedNode]);

  const nodeTypeInfo = useMemo(() => {
    if (!selectedNode?.type) return null;
    return NODE_TYPE_ICONS[selectedNode.type as keyof typeof NODE_TYPE_ICONS];
  }, [selectedNode?.type]);

  if (!selectedNode || !nodeTypeInfo) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed" ta="center">Select a node to configure</Text>
      </Paper>
    );
  }

  const Icon = nodeTypeInfo.icon;

  const handleSubmit = form.onSubmit((values: FormValues) => {
    if (!selectedNode) return;
    
    const updatedNode: WorkflowNode = {
      ...selectedNode,
      data: {
        type: selectedNode.data.type,
        ...values,
        updatedAt: new Date(),
      } as WorkflowNodeData,
    };
    onNodeUpdate(updatedNode);
  });

  return (
    <Paper p="md" withBorder>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Group gap="xs">
            <ThemeIcon size="lg" color={nodeTypeInfo.color} variant="light">
              <Icon size={20} />
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Title order={4} style={{ margin: 0 }}>
                Node Configuration
              </Title>
              <Text size="sm" c="dimmed">
                {selectedNode.type} - {selectedNode.id}
              </Text>
            </div>
            <Badge
              color={
                selectedNode.data.status === 'complete' ? 'green' :
                selectedNode.data.status === 'error' ? 'red' :
                selectedNode.data.status === 'running' ? 'blue' :
                'gray'
              }
            >
              {selectedNode.data.status}
            </Badge>
          </Group>

          <Divider />

          <Stack gap="xs">
            <TextInput
              label="Label"
              placeholder="Enter node label"
              {...form.getInputProps('label')}
            />
            <Textarea
              label="Description"
              placeholder="Enter node description"
              autosize
              minRows={2}
              maxRows={4}
              {...form.getInputProps('description')}
            />
          </Stack>

          <Accordion variant="separated">
            <Accordion.Item value="nodeSpecific">
              <Accordion.Control>Node-Specific Configuration</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  {renderNodeTypeSpecificFields(selectedNode.type as WorkflowNodeData['type'], form)}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="advanced">
              <Accordion.Control>Advanced Settings</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  <JsonInput
                    label="Custom Configuration"
                    placeholder="Enter custom JSON configuration"
                    formatOnBlur
                    autosize
                    minRows={4}
                    maxRows={8}
                    {...form.getInputProps('config')}
                  />
                  {selectedNode.data.preview && (
                    <>
                      <Text size="sm" fw={500}>Preview Data</Text>
                      <Text size="xs" c="dimmed">
                        Rows: {selectedNode.data.preview.rowCount}
                        {selectedNode.data.preview.columnCount && 
                          `, Columns: ${selectedNode.data.preview.columnCount}`
                        }
                      </Text>
                    </>
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Group justify="space-between" mt="md">
            <Button
              variant="light"
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => onNodeDelete(selectedNode.id)}
            >
              Delete
            </Button>
            <Group gap="xs">
              <Button
                variant="light"
                leftSection={<IconRefresh size={16} />}
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button
                type="submit"
                leftSection={<IconDeviceFloppy size={16} />}
              >
                Save
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

function getNodeTypeSpecificDefaults(type: WorkflowNodeData['type']): Partial<FormValues> {
  switch (type) {
    case 'dataNode':
      return {
        source: { type: 'file' as SourceType, location: '', format: 'csv' },
      };
    case 'transformNode':
      return {
        operation: '',
        params: {},
      };
    case 'analysisNode':
      return {
        method: '',
        metrics: {},
      };
    case 'aiNode':
      return {
        task: '',
        model: { name: '', version: '', params: {} },
        progress: 0,
      };
    case 'visualNode':
      return {
        chartType: '',
        dimensions: [],
        config: { xAxis: '', yAxis: '', groupBy: '', aggregation: 'sum' as AggregationType },
      };
    case 'exportNode':
      return {
        format: 'csv',
        destination: '',
        options: {
          compression: 'none' as CompressionType,
          encoding: 'utf-8',
          includeHeaders: true,
        },
      };
    default:
      return {};
  }
}

function getNodeTypeSpecificValues(node: WorkflowNode) {
  const { type, ...data } = node.data;
  return data;
}

function renderNodeTypeSpecificFields(type: WorkflowNodeData['type'], form: any) {
  switch (type) {
    case 'dataNode':
      return (
        <>
          <Select
            label="Source Type"
            data={NODE_TYPE_CONFIGS.dataNode.sourceTypes}
            {...form.getInputProps('source.type')}
          />
          <TextInput
            label="Source Location"
            placeholder="Enter file path, connection string, or API endpoint"
            {...form.getInputProps('source.location')}
          />
          <Select
            label="Format"
            data={NODE_TYPE_CONFIGS.dataNode.fileFormats}
            {...form.getInputProps('source.format')}
          />
        </>
      );

    case 'transformNode':
      return (
        <>
          <Select
            label="Operation"
            data={NODE_TYPE_CONFIGS.transformNode.operations}
            {...form.getInputProps('operation')}
          />
          <JsonInput
            label="Parameters"
            formatOnBlur
            autosize
            minRows={2}
            maxRows={4}
            {...form.getInputProps('params')}
          />
        </>
      );

    case 'analysisNode':
      return (
        <>
          <Select
            label="Analysis Method"
            data={NODE_TYPE_CONFIGS.analysisNode.methods}
            {...form.getInputProps('method')}
          />
          <JsonInput
            label="Metrics"
            formatOnBlur
            autosize
            minRows={2}
            maxRows={4}
            {...form.getInputProps('metrics')}
          />
        </>
      );

    case 'aiNode':
      return (
        <>
          <Select
            label="Task"
            data={NODE_TYPE_CONFIGS.aiNode.tasks}
            {...form.getInputProps('task')}
          />
          <Select
            label="Model"
            data={NODE_TYPE_CONFIGS.aiNode.models}
            {...form.getInputProps('model.name')}
          />
          <TextInput
            label="Model Version"
            {...form.getInputProps('model.version')}
          />
          <JsonInput
            label="Model Parameters"
            formatOnBlur
            autosize
            minRows={2}
            maxRows={4}
            {...form.getInputProps('model.params')}
          />
        </>
      );

    case 'visualNode':
      return (
        <>
          <Select
            label="Chart Type"
            data={NODE_TYPE_CONFIGS.visualNode.chartTypes}
            {...form.getInputProps('chartType')}
          />
          <TextInput
            label="X-Axis"
            {...form.getInputProps('config.xAxis')}
          />
          <TextInput
            label="Y-Axis"
            {...form.getInputProps('config.yAxis')}
          />
          <TextInput
            label="Group By"
            {...form.getInputProps('config.groupBy')}
          />
          <Select
            label="Aggregation"
            data={NODE_TYPE_CONFIGS.visualNode.aggregations}
            {...form.getInputProps('config.aggregation')}
          />
        </>
      );

    case 'exportNode':
      return (
        <>
          <Select
            label="Format"
            data={NODE_TYPE_CONFIGS.exportNode.formats}
            {...form.getInputProps('format')}
          />
          <TextInput
            label="Destination"
            placeholder="Enter file path, connection string, or API endpoint"
            {...form.getInputProps('destination')}
          />
          <Select
            label="Encoding"
            data={NODE_TYPE_CONFIGS.exportNode.encodings}
            {...form.getInputProps('options.encoding')}
          />
          <Switch
            label="Include Headers"
            {...form.getInputProps('options.includeHeaders', { type: 'checkbox' })}
          />
          <Select
            label="Compression"
            data={NODE_TYPE_CONFIGS.exportNode.compressionTypes}
            {...form.getInputProps('options.compression')}
          />
        </>
      );

    default:
      return null;
  }
} 
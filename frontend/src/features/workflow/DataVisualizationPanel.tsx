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
  Box,
} from '@mantine/core';
import {
  IconChartBar,
  IconChartPie,
  IconChartLine,
  IconChartDots,
  IconTable,
} from '@tabler/icons-react';

interface DataVisualizationPanelProps {
  data: {
    columns: string[];
    sample: any[];
    stats: {
      rowCount: number;
      columnCount: number;
      missingValues: { [key: string]: number };
      dataTypes: { [key: string]: string };
    };
  };
}

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: IconChartBar },
  { value: 'line', label: 'Line Chart', icon: IconChartLine },
  { value: 'scatter', label: 'Scatter Plot', icon: IconChartDots },
  { value: 'pie', label: 'Pie Chart', icon: IconChartPie },
];

export function DataVisualizationPanel({ data }: DataVisualizationPanelProps) {
  const [chartType, setChartType] = useState<string>('bar');
  const [xAxis, setXAxis] = useState<string | null>(null);
  const [yAxis, setYAxis] = useState<string | null>(null);

  const numericColumns = data.columns.filter(
    col => ['integer', 'float', 'number'].includes(data.stats.dataTypes[col])
  );

  const categoricalColumns = data.columns.filter(
    col => !['integer', 'float', 'number'].includes(data.stats.dataTypes[col])
  );

  return (
    <Stack gap="md" h="100%">
      <Paper withBorder p="md">
        <Stack gap="md">
          <Title order={3}>Data Visualization</Title>
          
          <SimpleGrid cols={3}>
            <Select
              label="Chart Type"
              value={chartType}
              onChange={(value) => setChartType(value || 'bar')}
              data={CHART_TYPES.map(type => ({
                value: type.value,
                label: type.label,
                leftSection: <type.icon size={16} />,
              }))}
            />
            
            <Select
              label="X Axis"
              value={xAxis}
              onChange={setXAxis}
              data={categoricalColumns}
              placeholder="Select column"
            />
            
            <Select
              label="Y Axis"
              value={yAxis}
              onChange={setYAxis}
              data={numericColumns}
              placeholder="Select column"
            />
          </SimpleGrid>

          <Group justify="flex-end">
            <Button>
              Generate Chart
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="md" style={{ flex: 1 }}>
        <Stack gap="md" justify="center" align="center" h="100%">
          <IconTable size={48} style={{ opacity: 0.5 }} />
          <Text c="dimmed">Select columns and chart type to visualize data</Text>
        </Stack>
      </Paper>
    </Stack>
  );
} 
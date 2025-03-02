import { useState } from 'react';
import {
  Paper,
  Title,
  Tabs,
  Table,
  Text,
  Group,
  Badge,
  Stack,
  Card,
  Loader,
  Box,
  Select,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Scatter,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ReferenceArea,
  ReferenceLine,
  ComposedChart,
  ScatterChart,
  Treemap,
} from 'recharts';

interface DataPreviewProps {
  nodeId: string;
}

interface ColumnStats {
  min?: number;
  max?: number;
  mean?: number;
  stdDev?: number;
  uniqueCount?: number;
  nullCount: number;
  dataType: string;
  topValues?: Array<{ value: any; count: number }>;
}

interface DataPreviewResponse {
  schema: {
    fields: Array<{
      name: string;
      type: string;
      nullable: boolean;
    }>;
  };
  sample: Array<Record<string, any>>;
  stats: {
    rowCount: number;
    nullCounts: Record<string, number>;
    uniqueCounts: Record<string, number>;
    numericalStats: Record<string, {
      min: number;
      max: number;
      mean: number;
      stdDev: number;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function generateVisualizationData(data: any[], column: string, type: string) {
  if (type === 'numerical') {
    // For numerical data, create histogram-like bins
    const values = data.map(d => d[column]).filter(v => v != null);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 10;
    const binSize = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`,
      count: 0,
      value: min + (i + 0.5) * binSize, // Center of the bin for scatter plots
    }));
    
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      bins[binIndex].count++;
    });
    
    return bins;
  } else {
    // For categorical data, count occurrences and calculate percentages
    const counts: Record<string, number> = {};
    let total = 0;
    
    data.forEach(d => {
      const value = String(d[column]);
      counts[value] = (counts[value] || 0) + 1;
      total++;
    });
    
    return Object.entries(counts)
      .map(([value, count]) => ({
        value,
        count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10 categories
  }
}

function ColumnVisualizations({ data, column, type }: { data: any[]; column: string; type: string }) {
  const [chartType, setChartType] = useState('bar');
  const visualizationData = generateVisualizationData(data, column, type);
  
  const chartWidth = 600;
  const chartHeight = 300;
  
  const chartTypes = type === 'numerical' ? [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'scatter', label: 'Scatter Plot' },
    { value: 'boxplot', label: 'Box Plot' },
  ] : [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'donut', label: 'Donut Chart' },
    { value: 'treemap', label: 'Treemap' },
  ];
  
  if (type === 'numerical') {
    return (
      <Stack>
        <Select
          value={chartType}
          onChange={(value) => setChartType(value || 'bar')}
          data={chartTypes}
          label="Chart Type"
        />
        
        {chartType === 'bar' && (
          <BarChart width={chartWidth} height={chartHeight} data={visualizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" angle={-45} textAnchor="end" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        )}
        
        {chartType === 'line' && (
          <LineChart width={chartWidth} height={chartHeight} data={visualizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" angle={-45} textAnchor="end" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        )}
        
        {chartType === 'area' && (
          <AreaChart width={chartWidth} height={chartHeight} data={visualizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" angle={-45} textAnchor="end" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="count" fill="#8884d8" stroke="#8884d8" />
          </AreaChart>
        )}
        
        {chartType === 'scatter' && (
          <ScatterChart width={chartWidth} height={chartHeight}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="value" name="Value" />
            <YAxis type="number" dataKey="count" name="Count" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Values" data={visualizationData} fill="#8884d8" />
          </ScatterChart>
        )}
        
        {chartType === 'boxplot' && (
          <BoxPlot
            width={chartWidth}
            height={chartHeight}
            data={data.map(d => d[column]).filter(v => v != null)}
          />
        )}
      </Stack>
    );
  } else {
    return (
      <Stack>
        <Select
          value={chartType}
          onChange={(value) => setChartType(value || 'bar')}
          data={chartTypes}
          label="Chart Type"
        />
        
        {chartType === 'bar' && (
          <BarChart width={chartWidth} height={chartHeight} data={visualizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="value" angle={-45} textAnchor="end" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        )}
        
        {chartType === 'pie' && (
          <PieChart width={chartWidth} height={chartHeight}>
            <Pie
              data={visualizationData}
              dataKey="count"
              nameKey="value"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {visualizationData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
        
        {chartType === 'donut' && (
          <PieChart width={chartWidth} height={chartHeight}>
            <Pie
              data={visualizationData}
              dataKey="count"
              nameKey="value"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              label
            >
              {visualizationData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
        
        {chartType === 'treemap' && (
          <Treemap
            width={chartWidth}
            height={chartHeight}
            data={[{
              name: column,
              children: visualizationData.map(d => ({
                name: d.value,
                size: d.count,
              }))
            }]}
            dataKey="size"
            stroke="#fff"
            fill="#8884d8"
          >
            <Tooltip />
          </Treemap>
        )}
      </Stack>
    );
  }
}

// Custom BoxPlot component
function BoxPlot({ width, height, data }: { width: number; height: number; data: number[] }) {
  const sortedData = [...data].sort((a, b) => a - b);
  const q1 = sortedData[Math.floor(sortedData.length * 0.25)];
  const median = sortedData[Math.floor(sortedData.length * 0.5)];
  const q3 = sortedData[Math.floor(sortedData.length * 0.75)];
  const iqr = q3 - q1;
  const min = Math.max(q1 - 1.5 * iqr, sortedData[0]);
  const max = Math.min(q3 + 1.5 * iqr, sortedData[sortedData.length - 1]);
  
  const boxPlotData = [{
    min,
    q1,
    median,
    q3,
    max,
    outliers: sortedData.filter(v => v < min || v > max)
  }];
  
  return (
    <ComposedChart width={width} height={height} data={boxPlotData}>
      <CartesianGrid strokeDasharray="3 3" />
      <YAxis domain={[Math.min(...data), Math.max(...data)]} />
      <Tooltip />
      
      {/* Box */}
      <ReferenceArea y1={q1} y2={q3} fill="#8884d8" fillOpacity={0.3} />
      
      {/* Median line */}
      <ReferenceLine y={median} stroke="#8884d8" strokeWidth={2} />
      
      {/* Whiskers */}
      <ReferenceLine y={min} stroke="#8884d8" />
      <ReferenceLine y={max} stroke="#8884d8" />
      
      {/* Outliers */}
      {boxPlotData[0].outliers.map((value, index) => (
        <Scatter
          key={index}
          data={[{ value }]}
          fill="#8884d8"
          shape="circle"
        />
      ))}
    </ComposedChart>
  );
}

export function DataPreview({ nodeId }: DataPreviewProps) {
  const [activeTab, setActiveTab] = useState<string | null>('data');
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  
  const { data: previewData, isLoading } = useQuery({
    queryKey: ['nodePreview', nodeId],
    queryFn: async () => {
      const response = await axios.get<DataPreviewResponse>(`/workflow/preview/${nodeId}`);
      return response.data;
    },
  });
  
  if (isLoading) {
    return (
      <Box ta="center" py="xl">
        <Loader />
        <Text size="sm" c="dimmed" mt="xs">Loading data preview...</Text>
      </Box>
    );
  }
  
  if (!previewData) {
    return (
      <Box ta="center" py="xl">
        <Text c="dimmed">No preview data available</Text>
      </Box>
    );
  }
  
  const columns = previewData.schema.fields;
  
  return (
    <Paper p="md" style={{ height: '100%', overflowY: 'auto' }}>
      <Title order={3} mb="md">Data Preview</Title>
      
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="data">Data Sample</Tabs.Tab>
          <Tabs.Tab value="schema">Schema</Tabs.Tab>
          <Tabs.Tab value="stats">Statistics</Tabs.Tab>
          <Tabs.Tab value="viz">Visualizations</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="data" pt="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                {columns.map(col => (
                  <Table.Th key={col.name}>{col.name}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {previewData.sample.map((row, i) => (
                <Table.Tr key={i}>
                  {columns.map(col => (
                    <Table.Td key={col.name}>{row[col.name]}</Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="schema" pt="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Column</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Nullable</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {columns.map(col => (
                <Table.Tr key={col.name}>
                  <Table.Td>{col.name}</Table.Td>
                  <Table.Td>{col.type}</Table.Td>
                  <Table.Td>{col.nullable ? 'Yes' : 'No'}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="stats" pt="md">
          <Stack gap="md">
            <Card withBorder>
              <Group justify="space-between">
                <Text fw={500}>Total Rows</Text>
                <Badge size="lg">{previewData.stats.rowCount}</Badge>
              </Group>
            </Card>
            
            {columns.map(col => (
              <Card key={col.name} withBorder>
                <Title order={4} mb="xs">{col.name}</Title>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text>Null Values</Text>
                    <Badge>{previewData.stats.nullCounts[col.name]}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text>Unique Values</Text>
                    <Badge>{previewData.stats.uniqueCounts[col.name]}</Badge>
                  </Group>
                  {previewData.stats.numericalStats[col.name] && (
                    <>
                      <Group justify="space-between">
                        <Text>Min</Text>
                        <Badge>{previewData.stats.numericalStats[col.name].min}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text>Max</Text>
                        <Badge>{previewData.stats.numericalStats[col.name].max}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text>Mean</Text>
                        <Badge>{previewData.stats.numericalStats[col.name].mean.toFixed(2)}</Badge>
                      </Group>
                      <Group justify="space-between">
                        <Text>Std Dev</Text>
                        <Badge>{previewData.stats.numericalStats[col.name].stdDev.toFixed(2)}</Badge>
                      </Group>
                    </>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="viz" pt="md">
          <Stack gap="md">
            <Select
              label="Select Column"
              placeholder="Choose a column to visualize"
              value={selectedColumn}
              onChange={setSelectedColumn}
              data={columns.map(col => ({
                value: col.name,
                label: col.name,
              }))}
            />
            
            {selectedColumn && (
              <ColumnVisualizations
                data={previewData.sample}
                column={selectedColumn}
                type={columns.find(col => col.name === selectedColumn)?.type === 'number' ? 'numerical' : 'categorical'}
              />
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
} 
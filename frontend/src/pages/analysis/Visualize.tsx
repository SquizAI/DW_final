import { Container, Title, Text, Stack, Card, SimpleGrid, Button, Group, Select, MultiSelect } from '@mantine/core';
import { IconChartBar, IconChartLine, IconChartPie, IconChartScatter } from '@tabler/icons-react';
import { useState } from 'react';

export function Visualizations() {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const visualizationOptions = [
    {
      title: 'Bar Charts',
      description: 'Create bar charts for categorical data analysis',
      icon: IconChartBar,
      minColumns: 1,
      maxColumns: 2,
      action: () => console.log('Bar chart clicked'),
    },
    {
      title: 'Line Plots',
      description: 'Visualize trends and patterns over time',
      icon: IconChartLine,
      minColumns: 2,
      maxColumns: 3,
      action: () => console.log('Line plot clicked'),
    },
    {
      title: 'Pie Charts',
      description: 'Show proportions and composition of data',
      icon: IconChartPie,
      minColumns: 1,
      maxColumns: 1,
      action: () => console.log('Pie chart clicked'),
    },
    {
      title: 'Scatter Plots',
      description: 'Explore relationships between variables',
      icon: IconChartScatter,
      minColumns: 2,
      maxColumns: 3,
      action: () => console.log('Scatter plot clicked'),
    },
  ];

  // Mock data - replace with actual data
  const datasets = [
    { value: 'dataset1', label: 'Customer Data' },
    { value: 'dataset2', label: 'Sales Data' },
    { value: 'dataset3', label: 'Product Data' },
  ];

  const columns = [
    { value: 'age', label: 'Age' },
    { value: 'income', label: 'Income' },
    { value: 'category', label: 'Category' },
    { value: 'sales', label: 'Sales' },
    { value: 'date', label: 'Date' },
  ];

  const isValidColumnCount = (option: typeof visualizationOptions[0]) => {
    return selectedColumns.length >= option.minColumns && 
           selectedColumns.length <= option.maxColumns;
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Data Visualization</Title>
            <Text>Create insightful visualizations to understand your data better.</Text>
          </div>
        </Group>

        <Stack gap="md">
          <Select
            label="Select Dataset"
            placeholder="Choose a dataset to visualize"
            data={datasets}
            value={selectedDataset}
            onChange={setSelectedDataset}
          />

          <MultiSelect
            label="Select Columns"
            placeholder="Choose columns to visualize"
            data={columns}
            value={selectedColumns}
            onChange={setSelectedColumns}
            disabled={!selectedDataset}
          />
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {visualizationOptions.map((option) => (
            <Card 
              key={option.title} 
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder
            >
              <Stack gap="md">
                <option.icon size={24} />
                <Title order={3}>{option.title}</Title>
                <Text size="sm">{option.description}</Text>
                <Text size="xs" c="dimmed">
                  Required columns: {option.minColumns} - {option.maxColumns}
                </Text>
                <Button 
                  variant="light" 
                  onClick={option.action}
                  disabled={!selectedDataset || !isValidColumnCount(option)}
                >
                  Visualize
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
} 
import { Container, Title, Text, Stack, Card, SimpleGrid, Button, Group, Select } from '@mantine/core';
import { IconChartHistogram, IconChartDots, IconBoxMultiple, IconReportAnalytics } from '@tabler/icons-react';
import { useState } from 'react';

export function DataAnalysis() {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  const analysisOptions = [
    {
      title: 'Distribution Analysis',
      description: 'Analyze variable distributions and identify patterns',
      icon: IconChartHistogram,
      action: () => console.log('Distribution analysis clicked'),
    },
    {
      title: 'Correlation Analysis',
      description: 'Explore relationships between variables',
      icon: IconChartDots,
      action: () => console.log('Correlation analysis clicked'),
    },
    {
      title: 'Summary Statistics',
      description: 'Calculate descriptive statistics for each variable',
      icon: IconBoxMultiple,
      action: () => console.log('Summary statistics clicked'),
    },
    {
      title: 'Automated EDA',
      description: 'Generate comprehensive exploratory data analysis report',
      icon: IconReportAnalytics,
      action: () => console.log('Automated EDA clicked'),
    },
  ];

  // Mock datasets - replace with actual data
  const datasets = [
    { value: 'dataset1', label: 'Customer Data' },
    { value: 'dataset2', label: 'Sales Data' },
    { value: 'dataset3', label: 'Product Data' },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Data Exploration</Title>
            <Text>Explore and understand your data through statistical analysis.</Text>
          </div>
        </Group>

        <Select
          label="Select Dataset"
          placeholder="Choose a dataset to analyze"
          data={datasets}
          value={selectedDataset}
          onChange={setSelectedDataset}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {analysisOptions.map((option) => (
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
                <Button 
                  variant="light" 
                  onClick={option.action}
                  disabled={!selectedDataset}
                >
                  Analyze
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
} 
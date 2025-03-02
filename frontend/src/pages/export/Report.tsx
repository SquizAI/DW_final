import { Container, Title, Text, Stack, Card, SimpleGrid, Button, Group, Select } from '@mantine/core';
import { IconFileAnalytics, IconPdf, IconPresentation, IconNotebook } from '@tabler/icons-react';
import { useState } from 'react';

export function FinalReport() {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  const reportOptions = [
    {
      title: 'PDF Report',
      description: 'Generate a comprehensive PDF report',
      icon: IconPdf,
      action: () => console.log('PDF report clicked'),
    },
    {
      title: 'Presentation',
      description: 'Create a presentation with key findings',
      icon: IconPresentation,
      action: () => console.log('Presentation clicked'),
    },
    {
      title: 'Jupyter Notebook',
      description: 'Export analysis as Jupyter notebook',
      icon: IconNotebook,
      action: () => console.log('Notebook export clicked'),
    },
    {
      title: 'Executive Summary',
      description: 'Generate a concise summary report',
      icon: IconFileAnalytics,
      action: () => console.log('Executive summary clicked'),
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
            <Title order={1}>Final Report</Title>
            <Text>Generate comprehensive reports from your analysis.</Text>
          </div>
        </Group>

        <Select
          label="Select Dataset"
          placeholder="Choose a dataset for reporting"
          data={datasets}
          value={selectedDataset}
          onChange={setSelectedDataset}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {reportOptions.map((option) => (
            <Card 
              key={option.title} 
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder
            >
              <Stack gap="md">
                <option.icon size={24} stroke={2.5} />
                <Title order={3}>{option.title}</Title>
                <Text size="sm">{option.description}</Text>
                <Button 
                  variant="light" 
                  onClick={option.action}
                  disabled={!selectedDataset}
                >
                  Generate
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
} 
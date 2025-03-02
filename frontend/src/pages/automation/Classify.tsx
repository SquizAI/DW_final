import { Container, Title, Text, Stack, Card, SimpleGrid, Button, Group, Select } from '@mantine/core';
import { IconAdjustments, IconChartBar, IconScale, IconArrowsShuffle } from '@tabler/icons-react';
import { useState } from 'react';

export function Classification() {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  const classificationOptions = [
    {
      title: 'Binary Classification',
      description: 'Split data into two distinct categories',
      icon: IconScale,
      action: () => console.log('Binary classification clicked'),
    },
    {
      title: 'Class Balancing',
      description: 'Balance uneven class distributions',
      icon: IconAdjustments,
      action: () => console.log('Class balancing clicked'),
    },
    {
      title: 'Performance Metrics',
      description: 'View classification performance metrics',
      icon: IconChartBar,
      action: () => console.log('Performance metrics clicked'),
    },
    {
      title: 'Data Resampling',
      description: 'Apply resampling techniques for better results',
      icon: IconArrowsShuffle,
      action: () => console.log('Data resampling clicked'),
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
            <Title order={1}>Classification</Title>
            <Text>Perform binary classification and resampling on your data.</Text>
          </div>
        </Group>

        <Select
          label="Select Dataset"
          placeholder="Choose a dataset to classify"
          data={datasets}
          value={selectedDataset}
          onChange={setSelectedDataset}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {classificationOptions.map((option) => (
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
                  Start
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
} 
import { Container, Title, Text, Stack, Card, SimpleGrid, Button, Group, Select } from '@mantine/core';
import { IconBrain, IconRobot, IconBulb, IconChartDots } from '@tabler/icons-react';
import { useState } from 'react';

export function AIInsights() {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  const aiOptions = [
    {
      title: 'Pattern Recognition',
      description: 'Discover hidden patterns and relationships in your data',
      icon: IconBrain,
      action: () => console.log('Pattern recognition clicked'),
    },
    {
      title: 'Anomaly Detection',
      description: 'Identify unusual patterns and outliers automatically',
      icon: IconRobot,
      action: () => console.log('Anomaly detection clicked'),
    },
    {
      title: 'Smart Recommendations',
      description: 'Get AI-powered suggestions for data analysis',
      icon: IconBulb,
      action: () => console.log('Smart recommendations clicked'),
    },
    {
      title: 'Trend Analysis',
      description: 'Analyze temporal patterns and predict trends',
      icon: IconChartDots,
      action: () => console.log('Trend analysis clicked'),
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
            <Title order={1}>AI Insights</Title>
            <Text>Leverage advanced AI to uncover deeper insights in your data.</Text>
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
          {aiOptions.map((option) => (
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
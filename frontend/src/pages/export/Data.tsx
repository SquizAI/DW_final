import { Container, Title, Text, Stack, Card, SimpleGrid, Button, Group, Select } from '@mantine/core';
import { IconDownload, IconFileSpreadsheet, IconJson, IconDatabase } from '@tabler/icons-react';
import { useState } from 'react';

export function DataExport() {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  const exportOptions = [
    {
      title: 'CSV Export',
      description: 'Export data as CSV file',
      icon: IconFileSpreadsheet,
      action: () => console.log('CSV export clicked'),
    },
    {
      title: 'JSON Export',
      description: 'Export data in JSON format',
      icon: IconJson,
      action: () => console.log('JSON export clicked'),
    },
    {
      title: 'Database Export',
      description: 'Export directly to a database',
      icon: IconDatabase,
      action: () => console.log('Database export clicked'),
    },
    {
      title: 'Bulk Export',
      description: 'Export multiple datasets at once',
      icon: IconDownload,
      action: () => console.log('Bulk export clicked'),
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
            <Title order={1}>Data Export</Title>
            <Text>Export your processed data in various formats.</Text>
          </div>
        </Group>

        <Select
          label="Select Dataset"
          placeholder="Choose a dataset to export"
          data={datasets}
          value={selectedDataset}
          onChange={setSelectedDataset}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {exportOptions.map((option) => (
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
                  disabled={!selectedDataset && option.title !== 'Bulk Export'}
                >
                  Export
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
} 
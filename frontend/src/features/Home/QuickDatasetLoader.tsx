import React from 'react';
import { Title, Text, SimpleGrid, Card, Group, Stack, ThemeIcon, Button } from '@mantine/core';
import { IconTable, IconUpload } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const SAMPLE_DATASETS = [
  {
    id: 'iris',
    name: 'Iris Flower Dataset',
    description: 'Classic dataset for classification tasks',
    rows: 150,
    columns: 5,
  },
  {
    id: 'titanic',
    name: 'Titanic Passengers',
    description: 'Survival data from the Titanic disaster',
    rows: 891,
    columns: 12,
  },
  {
    id: 'housing',
    name: 'Boston Housing',
    description: 'House prices in Boston area',
    rows: 506,
    columns: 14,
  },
  {
    id: 'wine',
    name: 'Wine Quality',
    description: 'Red wine quality ratings',
    rows: 1599,
    columns: 12,
  },
];

export function QuickDatasetLoader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loadSampleDataset = useMutation({
    mutationFn: async (datasetId: string) => {
      const response = await fetch(`/api/datasets/sample/${datasetId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to load sample dataset');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });

  return (
    <Stack gap="md">
      <Group>
        <ThemeIcon size="md" radius="md" variant="light" color="blue">
          <IconTable size={16} />
        </ThemeIcon>
        <Stack gap={0}>
          <Title order={3}>Quick Start with Sample Data</Title>
          <Text c="dimmed">Choose a sample dataset to explore the platform's features</Text>
        </Stack>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {SAMPLE_DATASETS.map((dataset) => (
          <Card 
            key={dataset.id}
            withBorder
            shadow="sm"
            padding="lg"
            radius="md"
          >
            <Stack gap="sm">
              <Text fw={500} size="lg">{dataset.name}</Text>
              <Text size="sm" c="dimmed">{dataset.description}</Text>
              <Group>
                <Text size="sm" c="dimmed">{dataset.rows} rows</Text>
                <Text size="sm" c="dimmed">•</Text>
                <Text size="sm" c="dimmed">{dataset.columns} columns</Text>
              </Group>
              <Button
                variant="light"
                color="blue"
                fullWidth
                onClick={() => loadSampleDataset.mutate(dataset.id)}
                loading={loadSampleDataset.isPending}
              >
                Load Dataset
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <Card withBorder shadow="sm" padding="lg" radius="md">
        <Group>
          <ThemeIcon size="md" radius="md" variant="light" color="teal">
            <IconUpload size={16} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fw={500} size="lg">Upload Your Own Data</Text>
            <Text size="sm" c="dimmed">
              Have your own dataset? Upload CSV, Excel, or JSON files
            </Text>
          </Stack>
          <Button
            variant="light"
            color="teal"
            ml="auto"
            onClick={() => navigate('/data-upload')}
          >
            Upload Files
          </Button>
        </Group>
      </Card>
    </Stack>
  );
} 
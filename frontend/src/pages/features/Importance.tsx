import { Container, Title, Text, Stack, Card, SimpleGrid, Button, Group, Select } from '@mantine/core';
import { IconChartDots, IconFilter, IconChartBar, IconBrain } from '@tabler/icons-react';
import { useState } from 'react';

export function FeatureImportance() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const importanceOptions = [
    {
      title: 'Correlation Analysis',
      description: 'Analyze feature correlations and identify redundant features',
      icon: IconChartDots,
      action: () => console.log('Correlation analysis clicked'),
    },
    {
      title: 'Feature Selection',
      description: 'Select most important features using statistical methods',
      icon: IconFilter,
      action: () => console.log('Feature selection clicked'),
    },
    {
      title: 'SHAP Values',
      description: 'Calculate SHAP values to explain feature importance',
      icon: IconChartBar,
      action: () => console.log('SHAP values clicked'),
    },
    {
      title: 'Model-based Importance',
      description: 'Use trained models to determine feature importance',
      icon: IconBrain,
      action: () => console.log('Model-based importance clicked'),
    },
  ];

  const models = [
    { value: 'random_forest', label: 'Random Forest' },
    { value: 'xgboost', label: 'XGBoost' },
    { value: 'lightgbm', label: 'LightGBM' },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Feature Importance</Title>
            <Text>Analyze and understand the importance of your features.</Text>
          </div>
        </Group>

        <Select
          label="Select Model for Importance Analysis"
          placeholder="Choose a model"
          data={models}
          value={selectedModel}
          onChange={setSelectedModel}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {importanceOptions.map((option) => (
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
                  disabled={option.title === 'Model-based Importance' && !selectedModel}
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
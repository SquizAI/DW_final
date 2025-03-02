import { Container, Title, Text, Stack, Card, SimpleGrid, Button, Group, Code } from '@mantine/core';
import { IconPlus, IconWand, IconMathFunction, IconTimeline } from '@tabler/icons-react';

export function FeatureEngineering() {
  const featureOptions = [
    {
      title: 'Create Features',
      description: 'Create new features by combining or transforming existing columns',
      icon: IconPlus,
      code: 'new_feature = df["A"] + df["B"]',
      action: () => console.log('Create features clicked'),
    },
    {
      title: 'Auto Feature Generation',
      description: 'Automatically discover and create relevant features using AI',
      icon: IconWand,
      code: 'features = auto_generate_features(df)',
      action: () => console.log('Auto feature generation clicked'),
    },
    {
      title: 'Mathematical Functions',
      description: 'Apply mathematical transformations to create new features',
      icon: IconMathFunction,
      code: 'log_feature = np.log(df["column"])',
      action: () => console.log('Math functions clicked'),
    },
    {
      title: 'Time Series Features',
      description: 'Extract temporal features from datetime columns',
      icon: IconTimeline,
      code: 'df["day_of_week"] = df["date"].dt.dayofweek',
      action: () => console.log('Time series features clicked'),
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Feature Engineering</Title>
            <Text>Create and transform features to improve model performance.</Text>
          </div>
          <Button variant="light">View Feature List</Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {featureOptions.map((option) => (
            <Card key={option.title} shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <option.icon size={24} />
                <Title order={3}>{option.title}</Title>
                <Text size="sm">{option.description}</Text>
                <Code block>{option.code}</Code>
                <Button variant="light" onClick={option.action}>
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
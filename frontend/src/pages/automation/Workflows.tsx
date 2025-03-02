import { Container, Title, Text, Stack, Card, SimpleGrid, Button, Group } from '@mantine/core';
import { IconArrowsTransferUp, IconRepeat, IconRobot, IconCode } from '@tabler/icons-react';

export function WorkflowBuilder() {
  const workflowOptions = [
    {
      title: 'Data Pipeline',
      description: 'Create automated data processing pipelines',
      icon: IconArrowsTransferUp,
      action: () => console.log('Data pipeline clicked'),
    },
    {
      title: 'Scheduled Tasks',
      description: 'Set up recurring data processing tasks',
      icon: IconRepeat,
      action: () => console.log('Scheduled tasks clicked'),
    },
    {
      title: 'AI Automation',
      description: 'Automate decisions using AI models',
      icon: IconRobot,
      action: () => console.log('AI automation clicked'),
    },
    {
      title: 'Custom Scripts',
      description: 'Write custom automation scripts',
      icon: IconCode,
      action: () => console.log('Custom scripts clicked'),
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Workflow Builder</Title>
            <Text>Create automated workflows to streamline your data processing.</Text>
          </div>
          <Button variant="light">View Workflows</Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {workflowOptions.map((option) => (
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
                >
                  Create
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
} 
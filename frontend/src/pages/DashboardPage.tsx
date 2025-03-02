import { Container, Title, Text, SimpleGrid, Paper, Group, ThemeIcon } from '@mantine/core';
import {
  IconDatabase,
  IconChartBar,
  IconBrain,
  IconShare,
} from '@tabler/icons-react';

export function DashboardPage() {
  const stats = [
    {
      title: 'Active Projects',
      value: '12',
      icon: IconDatabase,
      color: 'blue',
    },
    {
      title: 'Data Sources',
      value: '24',
      icon: IconShare,
      color: 'green',
    },
    {
      title: 'AI Models',
      value: '8',
      icon: IconBrain,
      color: 'grape',
    },
    {
      title: 'Visualizations',
      value: '36',
      icon: IconChartBar,
      color: 'orange',
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="xl">Dashboard</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
        {stats.map((stat) => (
          <Paper key={stat.title} p="md" radius="md" withBorder>
            <Group>
              <ThemeIcon size="lg" color={stat.color} variant="light">
                <stat.icon size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">{stat.title}</Text>
                <Text fw={700} size="xl">{stat.value}</Text>
              </div>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </Container>
  );
} 
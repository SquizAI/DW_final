import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Text,
  Group,
  Stack,
  Button,
  Badge,
  Avatar,
  Progress,
  ActionIcon,
  Menu,
  Tabs,
  Paper,
  ThemeIcon,
  Tooltip,
  Container,
  SimpleGrid,
  rem,
  useMantineTheme,
  AvatarGroup,
} from '@mantine/core';
import {
  IconDots,
  IconPlus,
  IconUsers,
  IconFolder,
  IconChartBar,
  IconBrain,
  IconSettings,
  IconTrash,
  IconEdit,
  IconShare,
  IconFlask,
  IconRocket,
  IconBrandGithub,
  IconBrandSlack,
} from '@tabler/icons-react';
import WorkflowBuilder from './WorkflowBuilder';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  members: { name: string; avatar: string }[];
  workflowCount: number;
  lastActivity: string;
}

const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Customer Analytics Pipeline',
    description: 'End-to-end data pipeline for customer behavior analysis',
    status: 'active',
    progress: 75,
    members: [
      { name: 'Alex Chen', avatar: 'https://i.pravatar.cc/150?u=alex' },
      { name: 'Sarah Kim', avatar: 'https://i.pravatar.cc/150?u=sarah' },
      { name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?u=mike' },
    ],
    workflowCount: 8,
    lastActivity: '2024-03-15T10:30:00',
  },
  {
    id: 'p2',
    name: 'Sales Prediction Model',
    description: 'ML model for sales forecasting and optimization',
    status: 'active',
    progress: 45,
    members: [
      { name: 'Emma Wilson', avatar: 'https://i.pravatar.cc/150?u=emma' },
      { name: 'David Lee', avatar: 'https://i.pravatar.cc/150?u=david' },
    ],
    workflowCount: 5,
    lastActivity: '2024-03-14T15:45:00',
  },
];

export function OrganizationView() {
  const theme = useMantineTheme();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('workflows');

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'blue';
      case 'completed':
        return 'green';
      case 'archived':
        return 'gray';
    }
  };

  return (
    <Container fluid p="md">
      <Stack gap="xl">
        {/* Organization Overview */}
        <Paper radius="md" p="xl" withBorder>
          <Group justify="space-between" mb="xl">
            <Stack gap="xs">
              <Group gap="xs">
                <ThemeIcon size={42} radius="md" variant="light" color="blue">
                  <IconRocket size={24} />
                </ThemeIcon>
                <div>
                  <Text size="xl" fw={700}>Acme Corporation</Text>
                  <Text size="sm" c="dimmed">Enterprise Data & AI Solutions</Text>
                </div>
              </Group>
            </Stack>
            <Group>
              <Button variant="light" leftSection={<IconBrandGithub size={16} />}>
                Connect GitHub
              </Button>
              <Button variant="light" leftSection={<IconBrandSlack size={16} />}>
                Connect Slack
              </Button>
              <ActionIcon variant="light" size="lg">
                <IconSettings size={18} />
              </ActionIcon>
            </Group>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            <Card withBorder radius="md" padding="md">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700}>Active Projects</Text>
                <ThemeIcon variant="light" size="sm" color="blue">
                  <IconFolder size={14} />
                </ThemeIcon>
              </Group>
              <Text size="lg" fw={700} mt="sm">12</Text>
            </Card>
            <Card withBorder radius="md" padding="md">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700}>Total Workflows</Text>
                <ThemeIcon variant="light" size="sm" color="green">
                  <IconFlask size={14} />
                </ThemeIcon>
              </Group>
              <Text size="lg" fw={700} mt="sm">48</Text>
            </Card>
            <Card withBorder radius="md" padding="md">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700}>Team Members</Text>
                <ThemeIcon variant="light" size="sm" color="violet">
                  <IconUsers size={14} />
                </ThemeIcon>
              </Group>
              <Text size="lg" fw={700} mt="sm">24</Text>
            </Card>
            <Card withBorder radius="md" padding="md">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700}>AI Models</Text>
                <ThemeIcon variant="light" size="sm" color="orange">
                  <IconBrain size={14} />
                </ThemeIcon>
              </Group>
              <Text size="lg" fw={700} mt="sm">15</Text>
            </Card>
          </SimpleGrid>
        </Paper>

        {/* Projects Grid */}
        <Grid gutter="md">
          {SAMPLE_PROJECTS.map((project) => (
            <Grid.Col key={project.id} span={{ base: 12, md: 6 }}>
              <Card withBorder radius="md" padding="lg">
                <Card.Section withBorder inheritPadding py="xs">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Badge
                        color={getStatusColor(project.status)}
                        variant="dot"
                        size="lg"
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                      <Text fw={500}>{project.name}</Text>
                    </Group>
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEdit size={14} />}>
                          Edit Project
                        </Menu.Item>
                        <Menu.Item leftSection={<IconShare size={14} />}>
                          Share
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Card.Section>

                <Text size="sm" c="dimmed" mt="md">
                  {project.description}
                </Text>

                <Stack gap="sm" mt="md">
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="sm" fw={500}>Progress</Text>
                    <Text size="sm" c="dimmed">{project.progress}%</Text>
                  </Group>
                  <Progress
                    value={project.progress}
                    size="sm"
                    radius="xl"
                    color={getStatusColor(project.status)}
                  />
                </Stack>

                <Group mt="md" justify="space-between">
                  <AvatarGroup>
                    {project.members.map((member) => (
                      <Tooltip key={member.name} label={member.name}>
                        <Avatar
                          src={member.avatar}
                          radius="xl"
                          size="md"
                        />
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                  <Button
                    variant="light"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    View Workflows
                  </Button>
                </Group>
              </Card>
            </Grid.Col>
          ))}

          {/* Add Project Card */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card
              withBorder
              radius="md"
              padding="lg"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.gray[0],
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <ThemeIcon
                size={56}
                radius="xl"
                variant="light"
                color="blue"
                mb="md"
              >
                <IconPlus size={32} />
              </ThemeIcon>
              <Text size="lg" fw={500} ta="center">
                Create New Project
              </Text>
              <Text size="sm" c="dimmed" ta="center" mt={4}>
                Start building your next data workflow
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Selected Project View */}
        {selectedProject && (
          <Paper radius="md" withBorder>
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab value="workflows" leftSection={<IconFlask size={16} />}>
                  Workflows
                </Tabs.Tab>
                <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
                  Analytics
                </Tabs.Tab>
                <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
                  Settings
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="workflows">
                <Box p="md">
                  <WorkflowBuilder />
                </Box>
              </Tabs.Panel>

              <Tabs.Panel value="analytics">
                <Box p="md">
                  <Text>Analytics content coming soon...</Text>
                </Box>
              </Tabs.Panel>

              <Tabs.Panel value="settings">
                <Box p="md">
                  <Text>Settings content coming soon...</Text>
                </Box>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        )}
      </Stack>
    </Container>
  );
} 
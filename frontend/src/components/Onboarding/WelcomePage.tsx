import React from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  ThemeIcon,
  Paper,
  SimpleGrid,
  Box,
  Card,
  Image,
  rem,
  useMantineTheme,
} from '@mantine/core';
import {
  IconRocket,
  IconBrain,
  IconChartBar,
  IconDatabase,
  IconWand,
  IconArrowRight,
  IconArrowsTransferUp,
  IconCode,
  IconChartPie,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function WelcomePage() {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { user } = useAuth();

  const quickStartActions = [
    {
      title: 'Upload Your First Dataset',
      description: 'Start by uploading a CSV, Excel, or JSON file',
      icon: <IconDatabase size={24} />,
      color: 'blue',
      action: () => navigate('/data/management'),
    },
    {
      title: 'Import from Kaggle',
      description: 'Browse and import datasets from Kaggle',
      icon: <Box 
        component="img" 
        src="/kaggle-icon.svg" 
        style={{ width: '24px', height: '24px', display: 'block' }} 
      />,
      color: 'cyan',
      action: () => navigate('/kaggle/manager'),
    },
    {
      title: 'Create a Workflow',
      description: 'Build your first data processing workflow',
      icon: <IconArrowsTransferUp size={24} />,
      color: 'grape',
      action: () => navigate('/workflow'),
    },
    {
      title: 'Explore Visualizations',
      description: 'Create interactive charts and dashboards',
      icon: <IconChartPie size={24} />,
      color: 'orange',
      action: () => navigate('/analysis/visualize'),
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Welcome Header */}
        <Box
          style={{
            textAlign: 'center',
            padding: rem(48),
            borderRadius: theme.radius.md,
            backgroundImage: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.cyan[6]} 100%)`,
            color: 'white',
          }}
        >
          <Title order={1} mb="md">Welcome to Data Whisperer, {user?.name || 'Data Scientist'}!</Title>
          <Text size="lg" mb="xl">
            Your AI-powered companion for data analysis and insights
          </Text>
          <Group justify="center" gap="md">
            <Button 
              size="lg" 
              variant="white" 
              color="dark"
              rightSection={<IconRocket size={18} />}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              color="white"
              rightSection={<IconBrain size={18} />}
              onClick={() => {
                // This would trigger the AI assistant
                // For now, just navigate to dashboard
                navigate('/dashboard');
              }}
            >
              Ask AI Assistant
            </Button>
          </Group>
        </Box>

        {/* Quick Start Section */}
        <Title order={2} mb="md">Quick Start</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          {quickStartActions.map((action, index) => (
            <Card 
              key={index} 
              withBorder 
              padding="lg" 
              radius="md" 
              style={{ cursor: 'pointer' }}
              onClick={action.action}
            >
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="md" color={action.color}>
                  {action.icon}
                </ThemeIcon>
                <Text fw={500} ta="center">{action.title}</Text>
                <Text size="sm" c="dimmed" ta="center">
                  {action.description}
                </Text>
                <Button 
                  variant="light" 
                  color={action.color} 
                  rightSection={<IconArrowRight size={16} />}
                  onClick={action.action}
                  fullWidth
                >
                  Get Started
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        {/* Features Overview */}
        <Title order={2} mt="xl" mb="md">Explore Key Features</Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          <Paper withBorder p="lg" radius="md">
            <ThemeIcon size="xl" radius="md" color="blue" mb="md">
              <IconWand size={24} />
            </ThemeIcon>
            <Title order={3} mb="xs">AI-Powered Analysis</Title>
            <Text size="sm" c="dimmed" mb="lg">
              Our AI automatically analyzes your data to uncover hidden patterns, anomalies, and insights without complex coding.
            </Text>
            <Button 
              variant="light" 
              color="blue" 
              rightSection={<IconArrowRight size={16} />}
              onClick={() => navigate('/analysis/ai')}
            >
              Try AI Analysis
            </Button>
          </Paper>

          <Paper withBorder p="lg" radius="md">
            <ThemeIcon size="xl" radius="md" color="grape" mb="md">
              <IconArrowsTransferUp size={24} />
            </ThemeIcon>
            <Title order={3} mb="xs">Visual Workflow Builder</Title>
            <Text size="sm" c="dimmed" mb="lg">
              Create complex data processing workflows with our intuitive drag-and-drop interface. No coding required.
            </Text>
            <Button 
              variant="light" 
              color="grape" 
              rightSection={<IconArrowRight size={16} />}
              onClick={() => navigate('/workflow')}
            >
              Build a Workflow
            </Button>
          </Paper>

          <Paper withBorder p="lg" radius="md">
            <ThemeIcon size="xl" radius="md" color="orange" mb="md">
              <IconChartBar size={24} />
            </ThemeIcon>
            <Title order={3} mb="xs">Interactive Visualizations</Title>
            <Text size="sm" c="dimmed" mb="lg">
              Create beautiful, interactive visualizations to communicate your findings effectively and gain deeper insights.
            </Text>
            <Button 
              variant="light" 
              color="orange" 
              rightSection={<IconArrowRight size={16} />}
              onClick={() => navigate('/analysis/visualize')}
            >
              Create Visualizations
            </Button>
          </Paper>
        </SimpleGrid>

        {/* Learning Resources */}
        <Title order={2} mt="xl" mb="md">Learning Resources</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Card withBorder radius="md">
            <Group gap="md">
              <ThemeIcon size="lg" radius="md" color="blue">
                <IconCode size={20} />
              </ThemeIcon>
              <div>
                <Text fw={500}>Interactive Tutorials</Text>
                <Text size="sm" c="dimmed">
                  Step-by-step guides to help you master Data Whisperer
                </Text>
              </div>
            </Group>
            <Button 
              variant="light" 
              mt="md" 
              rightSection={<IconArrowRight size={16} />}
              onClick={() => navigate('/help/tutorials')}
            >
              View Tutorials
            </Button>
          </Card>

          <Card withBorder radius="md">
            <Group gap="md">
              <ThemeIcon size="lg" radius="md" color="green">
                <IconBrain size={20} />
              </ThemeIcon>
              <div>
                <Text fw={500}>AI Assistant</Text>
                <Text size="sm" c="dimmed">
                  Get help anytime by asking our AI assistant
                </Text>
              </div>
            </Group>
            <Button 
              variant="light" 
              color="green" 
              mt="md" 
              rightSection={<IconArrowRight size={16} />}
              onClick={() => {
                // This would trigger the AI assistant
                // For now, just navigate to dashboard
                navigate('/dashboard');
              }}
            >
              Ask AI Assistant
            </Button>
          </Card>
        </SimpleGrid>

        {/* Get Started CTA */}
        <Paper 
          withBorder 
          p="xl" 
          radius="md" 
          mt="xl"
          style={{
            backgroundImage: `linear-gradient(135deg, ${theme.colors.gray[0]} 0%, ${theme.colors.blue[0]} 100%)`,
          }}
        >
          <Stack align="center" gap="md">
            <ThemeIcon size={80} radius="xl" color="blue">
              <IconRocket size={40} />
            </ThemeIcon>
            <Title order={2} ta="center">Ready to Start Your Data Journey?</Title>
            <Text size="lg" ta="center" maw={600} mx="auto">
              Begin by uploading your first dataset or exploring our sample datasets to see what Data Whisperer can do.
            </Text>
            <Group mt="md">
              <Button 
                size="lg" 
                onClick={() => navigate('/data/management')}
                rightSection={<IconDatabase size={18} />}
              >
                Upload Dataset
              </Button>
              <Button 
                size="lg" 
                variant="light"
                onClick={() => navigate('/dashboard')}
                rightSection={<IconArrowRight size={18} />}
              >
                Go to Dashboard
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
} 
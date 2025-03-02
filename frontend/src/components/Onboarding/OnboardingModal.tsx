import React, { useState } from 'react';
import {
  Modal,
  Stepper,
  Button,
  Group,
  Text,
  Title,
  Stack,
  ThemeIcon,
  Paper,
  SimpleGrid,
  Box,
  useMantineTheme,
} from '@mantine/core';
import {
  IconUpload,
  IconDatabase,
  IconWand,
  IconChartBar,
  IconRocket,
  IconBrain,
  IconArrowRight,
  IconCheck,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingModalProps {
  opened: boolean;
  onClose: () => void;
}

export function OnboardingModal({ opened, onClose }: OnboardingModalProps) {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleComplete = () => {
    // Save onboarding completion to user preferences
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  const handleGoToDataManagement = () => {
    onClose();
    navigate('/data/management');
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      padding="xl"
      title={<Title order={3}>Welcome to Data Whisperer</Title>}
      centered
    >
      <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
        <Stepper.Step
          label="Welcome"
          description="Get started"
          icon={<IconRocket size="1.1rem" />}
        >
          <Stack gap="xl" my="xl">
            <Title order={3} ta="center">Welcome to Your Data Science Journey</Title>
            <Text ta="center" size="lg">
              Data Whisperer is your AI-powered companion for data analysis and insights.
              Let's take a quick tour to help you get the most out of the platform.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt="md">
              <Paper withBorder p="md" radius="md">
                <ThemeIcon size="lg" radius="md" color="blue" mb="sm">
                  <IconBrain size={20} />
                </ThemeIcon>
                <Text fw={500} mb="xs">AI-Powered Analysis</Text>
                <Text size="sm" c="dimmed">
                  Our AI analyzes your data to uncover hidden patterns and insights automatically.
                </Text>
              </Paper>

              <Paper withBorder p="md" radius="md">
                <ThemeIcon size="lg" radius="md" color="teal" mb="sm">
                  <IconWand size={20} />
                </ThemeIcon>
                <Text fw={500} mb="xs">No-Code Workflows</Text>
                <Text size="sm" c="dimmed">
                  Build complex data pipelines without writing a single line of code.
                </Text>
              </Paper>

              <Paper withBorder p="md" radius="md">
                <ThemeIcon size="lg" radius="md" color="grape" mb="sm">
                  <IconChartBar size={20} />
                </ThemeIcon>
                <Text fw={500} mb="xs">Interactive Visualizations</Text>
                <Text size="sm" c="dimmed">
                  Create beautiful visualizations to communicate your findings effectively.
                </Text>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Stepper.Step>

        <Stepper.Step
          label="Data"
          description="Upload & manage"
          icon={<IconUpload size="1.1rem" />}
        >
          <Stack gap="xl" my="xl">
            <Title order={3} ta="center">Start by Adding Your Data</Title>
            <Text ta="center" size="lg">
              The first step is to upload your datasets or connect to external data sources.
            </Text>

            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: theme.spacing.xl,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.blue[0],
              }}
            >
              <ThemeIcon size={60} radius="md" color="blue" mb="md">
                <IconDatabase size={30} />
              </ThemeIcon>
              <Text fw={500} size="lg" mb="xs">
                Multiple Ways to Add Data
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
                <Paper withBorder p="md" radius="md">
                  <Text fw={500} mb="xs">Upload Files</Text>
                  <Text size="sm" c="dimmed">
                    Upload CSV, Excel, or JSON files directly from your computer.
                  </Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                  <Text fw={500} mb="xs">Import from Kaggle</Text>
                  <Text size="sm" c="dimmed">
                    Browse and import datasets from Kaggle's extensive collection.
                  </Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                  <Text fw={500} mb="xs">Connect to Databases</Text>
                  <Text size="sm" c="dimmed">
                    Connect to SQL, MongoDB, or other database systems.
                  </Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                  <Text fw={500} mb="xs">Cloud Storage</Text>
                  <Text size="sm" c="dimmed">
                    Import from AWS S3, Google Cloud Storage, or Azure Blob Storage.
                  </Text>
                </Paper>
              </SimpleGrid>
              <Button
                mt="xl"
                size="md"
                rightSection={<IconArrowRight size={16} />}
                onClick={handleGoToDataManagement}
              >
                Go to Data Management
              </Button>
            </Box>
          </Stack>
        </Stepper.Step>

        <Stepper.Step
          label="Analysis"
          description="Explore & visualize"
          icon={<IconChartBar size="1.1rem" />}
        >
          <Stack gap="xl" my="xl">
            <Title order={3} ta="center">Analyze Your Data with Ease</Title>
            <Text ta="center" size="lg">
              Once your data is uploaded, you can start exploring and visualizing it.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <Paper withBorder p="lg" radius="md">
                <ThemeIcon size="lg" radius="md" color="orange" mb="sm">
                  <IconWand size={20} />
                </ThemeIcon>
                <Text fw={500} mb="xs">Automated Data Profiling</Text>
                <Text size="sm" c="dimmed" mb="md">
                  Our AI automatically analyzes your dataset to provide:
                </Text>
                <Stack gap="xs">
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="green" radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text size="sm">Data quality assessment</Text>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="green" radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text size="sm">Column statistics and distributions</Text>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="green" radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text size="sm">Correlation analysis</Text>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="green" radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text size="sm">Anomaly detection</Text>
                  </Group>
                </Stack>
              </Paper>

              <Paper withBorder p="lg" radius="md">
                <ThemeIcon size="lg" radius="md" color="pink" mb="sm">
                  <IconChartBar size={20} />
                </ThemeIcon>
                <Text fw={500} mb="xs">Interactive Visualizations</Text>
                <Text size="sm" c="dimmed" mb="md">
                  Create beautiful charts and dashboards:
                </Text>
                <Stack gap="xs">
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="green" radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text size="sm">Auto-generated visualizations</Text>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="green" radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text size="sm">Customizable charts and graphs</Text>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="green" radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text size="sm">Interactive dashboards</Text>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="green" radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text size="sm">Export capabilities</Text>
                  </Group>
                </Stack>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Stepper.Step>

        <Stepper.Step
          label="Workflows"
          description="Automate & transform"
          icon={<IconRocket size="1.1rem" />}
        >
          <Stack gap="xl" my="xl">
            <Title order={3} ta="center">Build Powerful Workflows</Title>
            <Text ta="center" size="lg">
              Create automated workflows to transform, analyze, and visualize your data.
            </Text>

            <Box
              style={{
                padding: theme.spacing.xl,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.grape[0],
              }}
            >
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                <Stack>
                  <ThemeIcon size="lg" radius="md" color="grape" mb="sm">
                    <IconRocket size={20} />
                  </ThemeIcon>
                  <Text fw={500} mb="xs">Drag-and-Drop Workflow Builder</Text>
                  <Text size="sm" c="dimmed" mb="md">
                    Our intuitive workflow builder lets you:
                  </Text>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="green" radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                      <Text size="sm">Connect nodes with simple drag-and-drop</Text>
                    </Group>
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="green" radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                      <Text size="sm">Choose from pre-built components</Text>
                    </Group>
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="green" radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                      <Text size="sm">Create custom transformations</Text>
                    </Group>
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="green" radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                      <Text size="sm">Save and reuse workflows</Text>
                    </Group>
                  </Stack>
                </Stack>

                <Stack>
                  <ThemeIcon size="lg" radius="md" color="indigo" mb="sm">
                    <IconBrain size={20} />
                  </ThemeIcon>
                  <Text fw={500} mb="xs">AI-Powered Recommendations</Text>
                  <Text size="sm" c="dimmed" mb="md">
                    Our AI suggests the best workflows for your data:
                  </Text>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="green" radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                      <Text size="sm">Automated workflow suggestions</Text>
                    </Group>
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="green" radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                      <Text size="sm">Intelligent node recommendations</Text>
                    </Group>
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="green" radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                      <Text size="sm">Optimization suggestions</Text>
                    </Group>
                    <Group gap="xs">
                      <ThemeIcon size="sm" color="green" radius="xl">
                        <IconCheck size={12} />
                      </ThemeIcon>
                      <Text size="sm">Error detection and prevention</Text>
                    </Group>
                  </Stack>
                </Stack>
              </SimpleGrid>
            </Box>
          </Stack>
        </Stepper.Step>

        <Stepper.Step
          label="Ready"
          description="Start your journey"
          icon={<IconCheck size="1.1rem" />}
        >
          <Stack gap="xl" my="xl" align="center">
            <ThemeIcon size={80} radius="xl" color="green">
              <IconCheck size={40} />
            </ThemeIcon>
            <Title order={2} ta="center">You're All Set!</Title>
            <Text ta="center" size="lg" maw={500} mx="auto">
              You're now ready to start your data science journey with Data Whisperer.
              Remember, our AI assistant is always available to help you along the way.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt="xl">
              <Paper withBorder p="md" radius="md" ta="center">
                <ThemeIcon size="xl" radius="xl" color="blue" mb="sm" mx="auto">
                  <IconUpload size={24} />
                </ThemeIcon>
                <Text fw={500} mb="xs">1. Upload Data</Text>
                <Text size="sm" c="dimmed">
                  Start by uploading your datasets
                </Text>
              </Paper>

              <Paper withBorder p="md" radius="md" ta="center">
                <ThemeIcon size="xl" radius="xl" color="grape" mb="sm" mx="auto">
                  <IconWand size={24} />
                </ThemeIcon>
                <Text fw={500} mb="xs">2. Create Workflow</Text>
                <Text size="sm" c="dimmed">
                  Build your analysis workflow
                </Text>
              </Paper>

              <Paper withBorder p="md" radius="md" ta="center">
                <ThemeIcon size="xl" radius="xl" color="green" mb="sm" mx="auto">
                  <IconChartBar size={24} />
                </ThemeIcon>
                <Text fw={500} mb="xs">3. Gain Insights</Text>
                <Text size="sm" c="dimmed">
                  Discover insights in your data
                </Text>
              </Paper>
            </SimpleGrid>

            <Button
              mt="xl"
              size="lg"
              color="green"
              onClick={handleComplete}
            >
              Get Started
            </Button>
          </Stack>
        </Stepper.Step>
      </Stepper>

      <Group justify="space-between" mt="xl">
        {active !== 0 ? (
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        ) : (
          <Button variant="default" onClick={handleSkip}>
            Skip Tour
          </Button>
        )}

        {active !== 4 ? (
          <Button onClick={nextStep}>
            Next Step
          </Button>
        ) : (
          <Button color="green" onClick={handleComplete}>
            Complete
          </Button>
        )}
      </Group>
    </Modal>
  );
} 
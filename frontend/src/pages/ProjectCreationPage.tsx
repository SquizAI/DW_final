import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  SimpleGrid,
  Button,
  Group,
  TextInput,
  Select,
  Textarea,
  Stepper,
  Paper,
  ThemeIcon,
  rem,
  FileInput,
  Tooltip,
  ActionIcon,
  Badge,
  Modal,
  Input,
  ScrollArea,
  Loader,
} from '@mantine/core';
import {
  IconFolder,
  IconUpload,
  IconDatabase,
  IconBrain,
  IconArrowRight,
  IconChartPie,
  IconArrowsTransferUp,
  IconUsers,
  IconInfoCircle,
  IconPlus,
  IconSearch,
  IconBrandGithub,
  IconDownload,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { searchKaggleDatasets, downloadKaggleDataset, validateKaggleApiKey } from '../services/kaggle';

const PROJECT_TYPES = [
  { value: 'data_analysis', label: 'Data Analysis', icon: IconChartPie },
  { value: 'machine_learning', label: 'Machine Learning', icon: IconBrain },
  { value: 'data_pipeline', label: 'Data Pipeline', icon: IconArrowsTransferUp },
  { value: 'visualization', label: 'Data Visualization', icon: IconChartPie },
];

const DATA_SOURCES = [
  { value: 'upload', label: 'File Upload', icon: IconUpload },
  { value: 'kaggle', label: 'Kaggle Dataset', icon: IconBrandGithub },
  { value: 'database', label: 'Database Connection', icon: IconDatabase },
  { value: 'api', label: 'API Integration', icon: IconDatabase },
];

interface KaggleDataset {
  id: string;
  title: string;
  size: number;
  lastUpdated: string;
  downloadCount: number;
  voteCount: number;
  usabilityRating: number;
}

export function ProjectCreationPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [kaggleModalOpen, setKaggleModalOpen] = useState(false);
  const [kaggleApiKey, setKaggleApiKey] = useState('');
  const [kaggleSearchQuery, setKaggleSearchQuery] = useState('');
  const [kaggleSearchResults, setKaggleSearchResults] = useState<KaggleDataset[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<KaggleDataset | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      type: '',
      dataSource: '',
      team: [],
      file: null,
      kaggleDataset: null,
    },
    validate: {
      name: (value) => (!value ? 'Project name is required' : null),
      type: (value) => (!value ? 'Project type is required' : null),
      dataSource: (value) => (!value ? 'Data source is required' : null),
    },
  });

  const handleKaggleSearch = async () => {
    if (!kaggleApiKey || !kaggleSearchQuery) return;
    
    setSearchLoading(true);
    try {
      const results = await searchKaggleDatasets(kaggleSearchQuery, kaggleApiKey);
      setKaggleSearchResults(results);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to search Kaggle datasets',
        color: 'red',
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKaggleDatasetSelect = async (dataset: KaggleDataset) => {
    try {
      const blob = await downloadKaggleDataset(dataset.id, kaggleApiKey);
      form.setFieldValue('kaggleDataset', dataset);
      setSelectedDataset(dataset);
      setKaggleModalOpen(false);
      
      notifications.show({
        title: 'Success',
        message: 'Dataset selected successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to download dataset',
        color: 'red',
      });
    }
  };

  const handleSubmit = async () => {
    if (form.validate().hasErrors) return;
    
    setLoading(true);
    try {
      // Here you would make an API call to create the project
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      notifications.show({
        title: 'Success',
        message: 'Project created successfully',
        color: 'green',
      });
      
      navigate('/dashboard');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create project',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (active < 3) setActive(active + 1);
  };

  const prevStep = () => {
    if (active > 0) setActive(active - 1);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>Create New Project</Title>
            <Text c="dimmed">Set up your data project workspace</Text>
          </div>
          <Button variant="light" leftSection={<IconFolder size={16} />} onClick={() => navigate('/dashboard')}>
            View All Projects
          </Button>
        </Group>

        <Paper shadow="sm" radius="md" p="xl" withBorder>
          <Stepper active={active} onStepClick={setActive}>
            <Stepper.Step
              label="Project Details"
              description="Basic information"
              icon={<IconFolder size={18} />}
            >
              <Stack gap="md" mt="xl">
                <TextInput
                  label="Project Name"
                  placeholder="Enter project name"
                  required
                  {...form.getInputProps('name')}
                />
                <Textarea
                  label="Description"
                  placeholder="Describe your project"
                  minRows={3}
                  {...form.getInputProps('description')}
                />
                <Select
                  label="Project Type"
                  placeholder="Select project type"
                  data={PROJECT_TYPES.map(type => ({
                    value: type.value,
                    label: type.label,
                    leftSection: <type.icon size={16} />,
                  }))}
                  required
                  {...form.getInputProps('type')}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step
              label="Data Source"
              description="Connect your data"
              icon={<IconDatabase size={18} />}
            >
              <Stack gap="md" mt="xl">
                <Select
                  label="Data Source Type"
                  placeholder="Select data source"
                  data={DATA_SOURCES.map(source => ({
                    value: source.value,
                    label: source.label,
                    leftSection: <source.icon size={16} />,
                  }))}
                  required
                  {...form.getInputProps('dataSource')}
                />

                {form.values.dataSource === 'upload' && (
                  <FileInput
                    label="Upload File"
                    placeholder="Click to upload"
                    accept=".csv,.xlsx,.json"
                    {...form.getInputProps('file')}
                  />
                )}

                {form.values.dataSource === 'kaggle' && (
                  <Card withBorder>
                    <Stack gap="md">
                      <Group>
                        <ThemeIcon size={40} radius="md" variant="light" color="blue">
                          <IconBrandGithub size={24} />
                        </ThemeIcon>
                        <div>
                          <Text fw={500}>Kaggle Dataset</Text>
                          <Text size="sm" c="dimmed">Import datasets directly from Kaggle</Text>
                        </div>
                      </Group>
                      
                      {selectedDataset ? (
                        <Card withBorder>
                          <Group justify="space-between">
                            <div>
                              <Text fw={500}>{selectedDataset.title}</Text>
                              <Text size="sm" c="dimmed">
                                Size: {(selectedDataset.size / 1024 / 1024).toFixed(2)} MB
                              </Text>
                            </div>
                            <Button 
                              variant="light"
                              leftSection={<IconSearch size={16} />}
                              onClick={() => setKaggleModalOpen(true)}
                            >
                              Change Dataset
                            </Button>
                          </Group>
                        </Card>
                      ) : (
                        <Button
                          variant="light"
                          leftSection={<IconSearch size={16} />}
                          onClick={() => setKaggleModalOpen(true)}
                          fullWidth
                        >
                          Browse Kaggle Datasets
                        </Button>
                      )}
                    </Stack>
                  </Card>
                )}

                {form.values.dataSource === 'database' && (
                  <Card withBorder>
                    <Text size="sm">
                      Configure your database connection in the next step
                    </Text>
                  </Card>
                )}
              </Stack>
            </Stepper.Step>

            <Stepper.Step
              label="Team"
              description="Add team members"
              icon={<IconUsers size={18} />}
            >
              <Stack gap="md" mt="xl">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Team Members</Text>
                  <Button variant="light" size="xs" leftSection={<IconPlus size={14} />}>
                    Add Member
                  </Button>
                </Group>

                <Card withBorder>
                  <Text size="sm" c="dimmed" ta="center">
                    You can add team members after creating the project
                  </Text>
                </Card>
              </Stack>
            </Stepper.Step>

            <Stepper.Completed>
              <Stack gap="md" mt="xl" align="center">
                <ThemeIcon size={60} radius="xl" color="green">
                  <IconBrain size={30} />
                </ThemeIcon>
                <Title order={3} ta="center">Ready to Create Your Project</Title>
                <Text c="dimmed" ta="center" maw={500}>
                  Your project workspace will be set up with all necessary tools and integrations.
                  Click create to begin your data journey.
                </Text>
              </Stack>
            </Stepper.Completed>
          </Stepper>

          <Group justify="space-between" mt="xl">
            {active > 0 && (
              <Button variant="default" onClick={prevStep}>
                Back
              </Button>
            )}
            {active === 3 ? (
              <Button onClick={handleSubmit} loading={loading}>
                Create Project
              </Button>
            ) : (
              <Button onClick={nextStep} rightSection={<IconArrowRight size={14} />}>
                Continue
              </Button>
            )}
          </Group>
        </Paper>

        {/* Quick Start Templates */}
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" fw={500}>QUICK START TEMPLATES</Text>
            <Tooltip label="Pre-configured project templates">
              <ActionIcon variant="subtle" color="gray">
                <IconInfoCircle size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <ThemeIcon size={40} radius="md" variant="light" color="blue">
                  <IconChartPie size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={500}>Data Analysis</Text>
                  <Text size="sm" c="dimmed">
                    Start with data exploration and visualization
                  </Text>
                </div>
                <Badge color="blue" variant="light">Popular</Badge>
                <Button variant="light" color="blue" fullWidth>
                  Use Template
                </Button>
              </Stack>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <ThemeIcon size={40} radius="md" variant="light" color="grape">
                  <IconBrain size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={500}>ML Pipeline</Text>
                  <Text size="sm" c="dimmed">
                    Machine learning workflow template
                  </Text>
                </div>
                <Badge color="grape" variant="light">AI-Ready</Badge>
                <Button variant="light" color="grape" fullWidth>
                  Use Template
                </Button>
              </Stack>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <ThemeIcon size={40} radius="md" variant="light" color="orange">
                  <IconArrowsTransferUp size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={500}>ETL Pipeline</Text>
                  <Text size="sm" c="dimmed">
                    Data transformation workflow
                  </Text>
                </div>
                <Badge color="orange" variant="light">Automated</Badge>
                <Button variant="light" color="orange" fullWidth>
                  Use Template
                </Button>
              </Stack>
            </Card>
          </SimpleGrid>
        </Stack>
      </Stack>

      {/* Kaggle Dataset Search Modal */}
      <Modal
        opened={kaggleModalOpen}
        onClose={() => setKaggleModalOpen(false)}
        title={
          <Group>
            <ThemeIcon size={32} radius="md" variant="light" color="blue">
              <IconBrandGithub size={20} />
            </ThemeIcon>
            <Title order={3}>Browse Kaggle Datasets</Title>
          </Group>
        }
        size="xl"
      >
        <Stack gap="md">
          <TextInput
            label="Kaggle API Key"
            placeholder="Enter your Kaggle API key"
            value={kaggleApiKey}
            onChange={(e) => setKaggleApiKey(e.currentTarget.value)}
            type="password"
          />

          <Group>
            <TextInput
              placeholder="Search datasets..."
              value={kaggleSearchQuery}
              onChange={(e) => setKaggleSearchQuery(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Button
              onClick={handleKaggleSearch}
              loading={searchLoading}
              leftSection={<IconSearch size={16} />}
            >
              Search
            </Button>
          </Group>

          <ScrollArea h={400}>
            {searchLoading ? (
              <Stack align="center" justify="center" h={400}>
                <Loader size="lg" />
                <Text c="dimmed">Searching Kaggle datasets...</Text>
              </Stack>
            ) : kaggleSearchResults.length > 0 ? (
              <Stack gap="md">
                {kaggleSearchResults.map((dataset) => (
                  <Card key={dataset.id} withBorder>
                    <Group justify="space-between">
                      <Stack gap="xs">
                        <Text fw={500}>{dataset.title}</Text>
                        <Group gap="xs">
                          <Badge size="sm" variant="light">
                            {(dataset.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                          <Badge size="sm" variant="light">
                            {dataset.downloadCount} downloads
                          </Badge>
                          <Badge size="sm" variant="light">
                            {dataset.voteCount} votes
                          </Badge>
                        </Group>
                        <Text size="sm" c="dimmed">
                          Last updated: {new Date(dataset.lastUpdated).toLocaleDateString()}
                        </Text>
                      </Stack>
                      <Button
                        variant="light"
                        leftSection={<IconDownload size={16} />}
                        onClick={() => handleKaggleDatasetSelect(dataset)}
                      >
                        Select
                      </Button>
                    </Group>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Stack align="center" justify="center" h={400}>
                <Text c="dimmed">
                  {kaggleSearchQuery ? 'No datasets found' : 'Enter a search query to find datasets'}
                </Text>
              </Stack>
            )}
          </ScrollArea>
        </Stack>
      </Modal>
    </Container>
  );
} 
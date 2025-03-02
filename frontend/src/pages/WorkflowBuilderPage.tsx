import React, { useState } from 'react';
import {
  Container,
  Title,
  Card,
  Button,
  Group,
  Text,
  Stack,
  Select,
  TextInput,
  Progress,
  Badge,
  Timeline,
  ActionIcon,
  Tooltip,
  Paper,
  Tabs,
} from '@mantine/core';
import {
  IconDatabase,
  IconChartBar,
  IconBrush,
  IconGitMerge,
  IconBucket,
  IconFunction,
  IconTools,
  IconChartPie,
  IconStar,
  IconRobot,
  IconCheck,
  IconX,
  IconLoader,
  IconWand,
  IconTemplate,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { api } from '@/api';

const PREDEFINED_WORKFLOWS = [
  {
    id: 'data-quality',
    name: 'Data Quality Analysis',
    description: 'Analyze and improve data quality with automated checks and cleanups',
    steps: [
      { value: 'load_data', label: 'Load Data', icon: IconDatabase },
      { value: 'structural_analysis', label: 'Structural Analysis', icon: IconChartBar },
      { value: 'quality_analysis', label: 'Quality Analysis', icon: IconBrush },
    ]
  },
  {
    id: 'feature-engineering',
    name: 'Feature Engineering Pipeline',
    description: 'Transform and engineer features for machine learning',
    steps: [
      { value: 'load_data', label: 'Load Data', icon: IconDatabase },
      { value: 'data_merge', label: 'Data Merge', icon: IconGitMerge },
      { value: 'data_binning', label: 'Data Binning', icon: IconBucket },
      { value: 'feature_engineering', label: 'Feature Engineering', icon: IconTools },
    ]
  },
  {
    id: 'ml-classification',
    name: 'ML Classification Pipeline',
    description: 'End-to-end classification workflow with feature importance analysis',
    steps: [
      { value: 'load_data', label: 'Load Data', icon: IconDatabase },
      { value: 'feature_engineering', label: 'Feature Engineering', icon: IconTools },
      { value: 'feature_importance', label: 'Feature Importance', icon: IconStar },
      { value: 'classification', label: 'Classification', icon: IconRobot },
    ]
  }
];

interface StepResults {
  [key: string]: any;
}

interface StepStatus {
  [key: string]: string;
}

export function WorkflowBuilderPage() {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [datasetSource, setDatasetSource] = useState<string>('');
  const [datasetPath, setDatasetPath] = useState('');
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [stepResults, setStepResults] = useState<StepResults>({});
  const [stepStatus, setStepStatus] = useState<StepStatus>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('templates');

  const createWorkflow = async () => {
    try {
      const template = PREDEFINED_WORKFLOWS.find(w => w.id === selectedTemplate);
      const response = await api.post('/workflows/', {
        name: workflowName,
        dataset_source: datasetSource,
        dataset_path: datasetPath,
        template: selectedTemplate,
      });
      
      setActiveWorkflow(response.data.workflow_id);
      notifications.show({
        title: 'Success',
        message: 'Workflow created successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create workflow',
        color: 'red',
      });
    }
  };

  const executeStep = async (step: string) => {
    try {
      await api.post(`/workflows/${activeWorkflow}/steps/${step}`);
      setStepStatus((prev: Record<string, string>) => ({ ...prev, [step]: 'in_progress' }));
      
      // Start polling for results
      pollStepResults(step);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: `Failed to execute step: ${step}`,
        color: 'red',
      });
    }
  };

  const pollStepResults = async (step: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await api.get(`/workflows/${activeWorkflow}/status`);
        const stepStatus = status.data.steps_status[step];
        
        setStepStatus(prev => ({ ...prev, [step]: stepStatus }));
        
        if (stepStatus === 'completed') {
          const results = await api.get(`/workflows/${activeWorkflow}/results/${step}`);
          setStepResults(prev => ({ ...prev, [step]: results.data }));
          clearInterval(pollInterval);
        } else if (stepStatus === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        clearInterval(pollInterval);
      }
    }, 2000);
  };

  const renderStepIcon = (step: string) => {
    const status = stepStatus[step];
    if (status === 'completed') return <IconCheck size={16} />;
    if (status === 'failed') return <IconX size={16} />;
    if (status === 'in_progress') return <IconLoader size={16} />;
    return null;
  };

  const getCurrentWorkflowSteps = () => {
    return selectedTemplate 
      ? PREDEFINED_WORKFLOWS.find(w => w.id === selectedTemplate)?.steps || []
      : [];
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Card withBorder>
          <Group justify="space-between" mb="xl">
            <div>
              <Title order={2}>AI Workflow Builder</Title>
              <Text c="dimmed">Create and execute data science workflows with AI assistance</Text>
            </div>
            <ActionIcon variant="light" color="blue" size="lg">
              <IconWand size={20} />
            </ActionIcon>
          </Group>

          {!activeWorkflow ? (
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab 
                  value="templates" 
                  leftSection={<IconTemplate size={16} />}
                >
                  Templates
                </Tabs.Tab>
                <Tabs.Tab 
                  value="custom" 
                  leftSection={<IconTools size={16} />}
                >
                  Custom
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="templates" pt="xl">
                <Stack gap="md">
                  {PREDEFINED_WORKFLOWS.map((template) => (
                    <Paper 
                      key={template.id}
                      withBorder
                      p="md"
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedTemplate === template.id ? 'var(--mantine-color-blue-0)' : undefined,
                      }}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>{template.name}</Text>
                        <Badge>{template.steps.length} steps</Badge>
                      </Group>
                      <Text size="sm" c="dimmed" mb="md">
                        {template.description}
                      </Text>
                      <Group gap="xs">
                        {template.steps.map((step, index) => (
                          <Tooltip key={step.value} label={step.label}>
                            <ActionIcon variant="light" color="blue" size="sm">
                              <step.icon size={14} />
                            </ActionIcon>
                          </Tooltip>
                        ))}
                      </Group>
                    </Paper>
                  ))}

                  {selectedTemplate && (
                    <Stack gap="md" mt="xl">
                      <TextInput
                        label="Workflow Name"
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        placeholder="Enter workflow name"
                      />
                      
                      <Select
                        label="Dataset Source"
                        value={datasetSource}
                        onChange={(value) => setDatasetSource(value || '')}
                        data={[
                          { value: 'kaggle', label: 'Kaggle Dataset' },
                          { value: 'upload', label: 'Upload File' },
                          { value: 'url', label: 'URL' },
                        ]}
                      />
                      
                      <TextInput
                        label="Dataset Path/URL"
                        value={datasetPath}
                        onChange={(e) => setDatasetPath(e.target.value)}
                        placeholder="Enter dataset path or URL"
                      />
                      
                      <Button onClick={createWorkflow}>
                        Create Workflow
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="custom" pt="xl">
                <Text>Custom workflow builder coming soon...</Text>
              </Tabs.Panel>
            </Tabs>
          ) : (
            <Paper withBorder p="xl">
              <Timeline active={getCurrentWorkflowSteps().findIndex(s => s.value === currentStep)} bulletSize={24}>
                {getCurrentWorkflowSteps().map((step) => (
                  <Timeline.Item
                    key={step.value}
                    bullet={<step.icon size={12} />}
                    title={step.label}
                  >
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          {stepStatus[step.value] || 'pending'}
                        </Text>
                        <Group gap={8}>
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => executeStep(step.value)}
                            disabled={stepStatus[step.value] === 'in_progress'}
                          >
                            Execute
                          </Button>
                          {stepResults[step.value] && (
                            <Tooltip label="View Results">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                onClick={() => setCurrentStep(step.value)}
                              >
                                <IconChartPie size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Group>
                      </Group>
                    </Stack>
                  </Timeline.Item>
                ))}
              </Timeline>

              {currentStep && stepResults[currentStep] && (
                <Card withBorder mt="xl">
                  <Title order={4} mb="md">
                    {getCurrentWorkflowSteps().find(s => s.value === currentStep)?.label} Results
                  </Title>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(stepResults[currentStep], null, 2)}
                  </pre>
                </Card>
              )}
            </Paper>
          )}
        </Card>
      </Stack>
    </Container>
  );
} 
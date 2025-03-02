import React, { useState, useEffect } from 'react';
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
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { api } from '@/api';

const WORKFLOW_STEPS = [
  { value: 'load_data', label: 'Load Data', icon: IconDatabase },
  { value: 'structural_analysis', label: 'Structural Analysis', icon: IconChartBar },
  { value: 'quality_analysis', label: 'Quality Analysis', icon: IconBrush },
  { value: 'data_merge', label: 'Data Merge', icon: IconGitMerge },
  { value: 'data_binning', label: 'Data Binning', icon: IconBucket },
  { value: 'lambda_transform', label: 'Lambda Transform', icon: IconFunction },
  { value: 'feature_engineering', label: 'Feature Engineering', icon: IconTools },
  { value: 'exploratory_analysis', label: 'Exploratory Analysis', icon: IconChartPie },
  { value: 'feature_importance', label: 'Feature Importance', icon: IconStar },
  { value: 'classification', label: 'Classification', icon: IconRobot },
];

interface StepResults {
  [key: string]: any;
}

interface StepStatus {
  [key: string]: string;
}

export default function WorkflowBuilder() {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [datasetSource, setDatasetSource] = useState<string>('');
  const [datasetPath, setDatasetPath] = useState('');
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [stepResults, setStepResults] = useState<StepResults>({});
  const [stepStatus, setStepStatus] = useState<StepStatus>({});

  const createWorkflow = async () => {
    try {
      const response = await api.post('/workflows/', {
        name: workflowName,
        dataset_source: datasetSource,
        dataset_path: datasetPath,
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

  return (
    <Container size="xl">
      <Stack gap="md">
        {!activeWorkflow ? (
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Create New Workflow</Title>
              
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
          </Card>
        ) : (
          <Paper withBorder p="xl">
            <Timeline active={WORKFLOW_STEPS.findIndex(s => s.value === currentStep)} bulletSize={24}>
              {WORKFLOW_STEPS.map((step) => (
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
                  {WORKFLOW_STEPS.find(s => s.value === currentStep)?.label} Results
                </Title>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(stepResults[currentStep], null, 2)}
                </pre>
              </Card>
            )}
          </Paper>
        )}
      </Stack>
    </Container>
  );
} 
import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Button,
  ThemeIcon,
  Stepper,
  Card,
  Badge,
  Progress,
  Tabs,
  Loader,
  SimpleGrid,
  useMantineTheme,
} from '@mantine/core';
import {
  IconRobot,
  IconBrain,
  IconDatabase,
  IconWand,
  IconChartBar,
  IconFileReport,
  IconArrowRight,
  IconCheck,
  IconX,
  IconPlayerPlay,
  IconPlayerPause,
  IconRefresh,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { api } from '@/api';

// Import our custom components
import { WorkflowVisualization } from './WorkflowVisualization';
import { ExecutionStatus } from './ExecutionStatus';
import { ResultsVisualization } from './ResultsVisualization';
import { InsightsPanel } from './InsightsPanel';

/**
 * AgenticTopologyDemo Component
 * 
 * This component demonstrates the agentic topology system with real data.
 * It shows how intelligent agents collaborate to execute a data science workflow.
 */
export function AgenticTopologyDemo() {
  const theme = useMantineTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [workflow, setWorkflow] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Step 1: Initialize the demo
  const initializeDemo = async () => {
    setIsLoading(true);
    try {
      // Create default agents if they don't exist
      await api.post('/api/agentic/agents/default');
      
      // Fetch the agents
      const agentsResponse = await api.get('/api/agentic/agents');
      setAgents(agentsResponse.data);
      
      // Create a demo workflow
      const workflowData = createDemoWorkflow();
      setWorkflow(workflowData);
      
      setActiveStep(1);
      notifications.show({
        title: 'Demo Initialized',
        message: 'Agents and workflow created successfully',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Error initializing demo:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to initialize demo',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a demo workflow
  const createDemoWorkflow = () => {
    // This is a placeholder for the actual workflow creation
    // In a real implementation, this would create a workflow with nodes and edges
    return {
      id: 'demo-workflow',
      name: 'Customer Churn Analysis',
      nodes: [
        {
          id: 'data-source',
          type: 'data_source',
          data: {
            label: 'Telco Customer Churn Dataset',
            source_type: 'file',
            file_type: 'csv',
          }
        },
        {
          id: 'data-cleaning',
          type: 'data_transformation',
          data: {
            label: 'Data Cleaning',
            transformation_type: 'cleaning',
          }
        },
        {
          id: 'feature-engineering',
          type: 'data_transformation',
          data: {
            label: 'Feature Engineering',
            transformation_type: 'feature_engineering',
          }
        },
        {
          id: 'model-training',
          type: 'analysis',
          data: {
            label: 'Model Training',
            analysis_type: 'classification',
            target_column: 'Churn',
            algorithm: 'random_forest',
          }
        },
        {
          id: 'visualization',
          type: 'visualization',
          data: {
            label: 'Results Visualization',
            visualization_type: 'dashboard',
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'data-source', target: 'data-cleaning' },
        { id: 'e2-3', source: 'data-cleaning', target: 'feature-engineering' },
        { id: 'e3-4', source: 'feature-engineering', target: 'model-training' },
        { id: 'e4-5', source: 'model-training', target: 'visualization' },
      ]
    };
  };

  // Step 2: Execute the workflow
  const executeWorkflow = async () => {
    setIsLoading(true);
    try {
      // Execute the workflow using the agentic topology system
      const response = await api.post(`/api/agentic/workflow/execute/${workflow.id}`, {
        nodes: workflow.nodes,
        edges: workflow.edges,
        execution_mode: 'sequential'
      });
      
      setExecutionId(response.data.execution_id);
      setActiveStep(2);
      
      // Start polling for execution status
      startStatusPolling(response.data.execution_id);
      
      notifications.show({
        title: 'Workflow Execution Started',
        message: 'The agents are now collaborating to execute the workflow',
        color: 'blue',
      });
    } catch (error: any) {
      console.error('Error executing workflow:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to execute workflow',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for execution status
  const startStatusPolling = (execId: string) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await api.get(`/api/agentic/workflow/execution-status/${execId}`);
        setExecutionStatus(statusResponse.data);
        
        // If execution is complete, stop polling
        if (['completed', 'failed', 'paused'].includes(statusResponse.data.status)) {
          clearInterval(interval);
          if (statusResponse.data.status === 'completed') {
            setActiveStep(3);
            notifications.show({
              title: 'Workflow Execution Completed',
              message: 'The workflow has been successfully executed',
              color: 'green',
            });
          }
        }
      } catch (error) {
        console.error('Error polling execution status:', error);
        clearInterval(interval);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  };

  // Reset the demo
  const resetDemo = () => {
    setActiveStep(0);
    setExecutionId(null);
    setExecutionStatus(null);
    setWorkflow(null);
    setAgents([]);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Paper p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Group>
              <ThemeIcon size="xl" radius="md" color="blue">
                <IconRobot size={24} />
              </ThemeIcon>
              <div>
                <Title order={2}>Agentic Topology Demo</Title>
                <Text c="dimmed">Experience intelligent workflow orchestration with collaborative AI agents</Text>
              </div>
            </Group>
            <Text>
              This demo showcases how the Data Whisperer's agentic topology system orchestrates workflows using intelligent agents.
              You'll see how agents with different roles and capabilities collaborate to execute a data science workflow.
            </Text>
          </Stack>
        </Paper>

        {/* Stepper */}
        <Stepper active={activeStep} orientation="vertical">
          <Stepper.Step
            label="Initialize Demo"
            description="Create agents and workflow"
            loading={isLoading && activeStep === 0}
            icon={<IconBrain size={18} />}
          >
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Text>
                  First, we'll create a set of intelligent agents with different roles and capabilities.
                  These agents will collaborate to execute a customer churn analysis workflow.
                </Text>
                <Button
                  onClick={initializeDemo}
                  loading={isLoading}
                  disabled={activeStep > 0}
                  leftSection={<IconRobot size={16} />}
                >
                  Initialize Demo
                </Button>
              </Stack>
            </Paper>
          </Stepper.Step>

          <Stepper.Step
            label="Execute Workflow"
            description="Run the workflow with agents"
            loading={isLoading && activeStep === 1}
            icon={<IconPlayerPlay size={18} />}
          >
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Text>
                  Now, we'll execute the customer churn analysis workflow using our intelligent agents.
                  Each agent will handle specific tasks based on their roles and capabilities.
                </Text>
                <Button
                  onClick={executeWorkflow}
                  loading={isLoading}
                  disabled={activeStep !== 1}
                  leftSection={<IconPlayerPlay size={16} />}
                >
                  Execute Workflow
                </Button>
              </Stack>
            </Paper>
          </Stepper.Step>

          <Stepper.Step
            label="View Results"
            description="Analyze workflow execution results"
            loading={isLoading && activeStep === 2}
            icon={<IconChartBar size={18} />}
          >
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Text>
                  The workflow has been executed. Now you can view the results and insights generated by the agents.
                </Text>
                <Button
                  onClick={() => setActiveStep(3)}
                  disabled={activeStep !== 2 || !executionStatus || executionStatus.status !== 'completed'}
                  leftSection={<IconChartBar size={16} />}
                >
                  View Results
                </Button>
              </Stack>
            </Paper>
          </Stepper.Step>

          <Stepper.Step
            label="Insights"
            description="AI-generated insights from results"
            icon={<IconFileReport size={18} />}
          >
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Text>
                  The explainer agent has analyzed the results and generated insights.
                  These insights help you understand the key factors influencing customer churn.
                </Text>
                <Button
                  onClick={resetDemo}
                  leftSection={<IconRefresh size={16} />}
                >
                  Reset Demo
                </Button>
              </Stack>
            </Paper>
          </Stepper.Step>
        </Stepper>

        {/* Content based on active step */}
        {activeStep >= 1 && agents.length > 0 && (
          <Paper p="xl" radius="md" withBorder>
            <Tabs value={activeTab} onChange={(value) => setActiveTab(value as string)}>
              <Tabs.List mb="md">
                <Tabs.Tab value="overview">Overview</Tabs.Tab>
                <Tabs.Tab value="agents">Agents</Tabs.Tab>
                <Tabs.Tab value="workflow">Workflow</Tabs.Tab>
                {activeStep >= 2 && <Tabs.Tab value="execution">Execution</Tabs.Tab>}
                {activeStep >= 3 && <Tabs.Tab value="results">Results</Tabs.Tab>}
                {activeStep >= 3 && <Tabs.Tab value="insights">Insights</Tabs.Tab>}
              </Tabs.List>

              <Tabs.Panel value="overview">
                <Text>
                  This demo showcases the agentic topology system in action. The system uses intelligent agents
                  to orchestrate workflows, with each agent having specific roles and capabilities.
                </Text>
              </Tabs.Panel>

              <Tabs.Panel value="agents">
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                  {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </SimpleGrid>
              </Tabs.Panel>

              <Tabs.Panel value="workflow">
                <WorkflowVisualization workflow={workflow} />
              </Tabs.Panel>

              {activeStep >= 2 && (
                <Tabs.Panel value="execution">
                  <ExecutionStatus status={executionStatus} />
                </Tabs.Panel>
              )}

              {activeStep >= 3 && (
                <Tabs.Panel value="results">
                  <ResultsVisualization results={executionStatus?.results} />
                </Tabs.Panel>
              )}

              {activeStep >= 3 && (
                <Tabs.Panel value="insights">
                  <InsightsPanel insights={executionStatus?.insights} />
                </Tabs.Panel>
              )}
            </Tabs>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}

// Agent Card component
function AgentCard({ agent }: { agent: any }) {
  return (
    <Card withBorder>
      <Stack gap="md">
        <Group>
          <ThemeIcon size="lg" radius="md" color="blue">
            <IconRobot size={20} />
          </ThemeIcon>
          <div>
            <Text fw={700}>{agent.name}</Text>
            <Badge>{agent.role}</Badge>
          </div>
        </Group>
        <Text size="sm">
          Capabilities: {agent.capabilities.join(', ')}
        </Text>
      </Stack>
    </Card>
  );
} 
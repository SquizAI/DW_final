import React, { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Text,
  Textarea,
  Button,
  Group,
  Card,
  Badge,
  ActionIcon,
  Tooltip,
  Tabs,
  Collapse,
  Progress,
  Accordion,
  ThemeIcon,
  Loader,
  Box,
  Modal,
  Select,
  SimpleGrid,
  RingProgress,
  Menu,
  TextInput,
  NumberInput,
  Switch,
  Code,
  JsonInput,
  ColorInput,
  MultiSelect,
  useMantineTheme,
} from '@mantine/core';
import {
  IconWand,
  IconPlus,
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
  IconBulb,
  IconSparkles,
  IconBrain,
  IconWandOff,
  IconClearAll,
  IconTools,
  IconChartBar,
  IconCheck,
  IconX,
  IconSettings,
  IconCode,
  IconDatabase,
  IconEye,
  IconRefresh,
  IconPlayerPlay,
  IconDeviceFloppy,
  IconRobot,
} from '@tabler/icons-react';
import { Node, Edge } from 'reactflow';
import { notifications } from '@mantine/notifications';
import { api } from '@/api';
import { Logo } from '@/components/ui/Logo';
import { 
  AGENT_TYPES, 
  AgentType, 
  AgentState, 
  InteractionType, 
  InteractionProtocol,
  INTERACTION_PATTERNS 
} from '@/config/agents';
import { useDisclosure } from '@mantine/hooks';
import { NodeData } from '@/types/workflow';

interface WorkflowNode extends Node {
  data: {
    label: string;
    type: string;
    datasetId?: string;
    targetColumn?: string;
    capabilities: Array<{
      id: string;
      label: string;
    }>;
    state?: {
      status: 'idle' | 'learning' | 'working' | 'completed' | 'error';
      progress: number;
      performance?: {
        accuracy?: number;
        latency?: number;
        resourceUsage?: number;
      };
    };
  };
}

interface AIAssistantProps {
  selectedNode: Node | null;
  onSuggestionApply?: () => void;
  onUpdateNode?: (nodeId: string, data: any) => void;
  onAddNode?: (type: string, position: { x: number; y: number }) => void;
  onOptimizeWorkflow?: () => void;
  onGenerateWorkflow?: () => void;
}

export function AIAssistantPanel({
  selectedNode,
  onSuggestionApply,
  onUpdateNode,
  onAddNode,
  onOptimizeWorkflow,
  onGenerateWorkflow,
}: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [assistance, setAssistance] = useState<any>(null);
  const [autoCleanProgress, setAutoCleanProgress] = useState(0);
  const [featureEngProgress, setFeatureEngProgress] = useState(0);

  // Get real-time assistance when nodes, edges, or selection changes
  useEffect(() => {
    const getAssistance = async () => {
      try {
        const response = await api.post('/workflow/get-assistance', {
          nodes: [],
          edges: [],
          selected_node: selectedNode,
        });
        return response.data;
      } catch (error) {
        console.error('Failed to get AI assistance:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to connect to AI assistant. Please check if the server is running.',
          color: 'red',
        });
        return null;
      }
    };

    const fetchAssistance = async () => {
      const data = await getAssistance();
      if (data) {
        setAssistance(data);
      }
    };

    fetchAssistance();
  }, [selectedNode]);

  const handleAutoClean = async () => {
    setIsLoading(true);
    setAutoCleanProgress(0);
    try {
      // Start auto-cleaning
      const response = await api.post('/workflow/auto-clean', {
        dataset_id: selectedNode?.data?.datasetId,
      });

      // Update progress
      const interval = setInterval(() => {
        setAutoCleanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // Update node with cleaned data
      onUpdateNode?.(selectedNode?.id || '', {
        ...selectedNode?.data,
        datasetId: response.data.cleaned_dataset_id,
        cleaningLogs: response.data.cleaning_logs,
        qualityImprovement: response.data.quality_improvement,
      });

      notifications.show({
        title: 'Success',
        message: 'Dataset cleaned successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to clean dataset',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
      setAutoCleanProgress(100);
    }
  };

  const handleFeatureEngineering = async () => {
    setIsLoading(true);
    setFeatureEngProgress(0);
    try {
      // Start feature engineering
      const response = await api.post('/workflow/auto-engineer-features', {
        dataset_id: selectedNode?.data?.datasetId,
        target_column: selectedNode?.data?.targetColumn,
      });

      // Update progress
      const interval = setInterval(() => {
        setFeatureEngProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // Update node with engineered features
      onUpdateNode?.(selectedNode?.id || '', {
        ...selectedNode?.data,
        datasetId: response.data.engineered_dataset_id,
        featureLogs: response.data.feature_logs,
        importanceScores: response.data.importance_scores,
      });

      notifications.show({
        title: 'Success',
        message: 'Features engineered successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to engineer features',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
      setFeatureEngProgress(100);
    }
  };

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="md">
            <ThemeIcon size={40} radius="md" variant="light" color="blue">
              <IconBrain size={24} />
            </ThemeIcon>
            <div>
              <Text fw={500}>AI Assistant</Text>
              <Text size="sm" c="dimmed">Real-time workflow optimization</Text>
            </div>
          </Group>
        </Group>

        <Tabs defaultValue="assistance">
          <Tabs.List>
            <Tabs.Tab
              value="assistance"
              leftSection={<IconBulb size={14} />}
            >
              Smart Assistance
            </Tabs.Tab>
            <Tabs.Tab
              value="automation"
              leftSection={<IconWandOff size={14} />}
            >
              Auto Actions
            </Tabs.Tab>
            <Tabs.Tab
              value="insights"
              leftSection={<IconChartBar size={14} />}
            >
              Insights
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="assistance" pt="md">
            <Stack gap="md">
              {assistance ? (
                <>
                  {/* Next Step Suggestions */}
                  <Accordion>
                    <Accordion.Item value="next-steps">
                      <Accordion.Control>
                        <Group gap="xs">
                          <IconArrowRight size={16} />
                          <Text>Next Steps</Text>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Stack gap="xs">
                          {assistance.nextSteps?.map((step: any, i: number) => (
                            <Group key={i} justify="space-between">
                              <Text size="sm">{step.suggestion}</Text>
                              <Badge color="blue">{step.confidence}%</Badge>
                            </Group>
                          ))}
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>

                    {/* Configuration Recommendations */}
                    <Accordion.Item value="config">
                      <Accordion.Control>
                        <Group gap="xs">
                          <IconTools size={16} />
                          <Text>Configuration Tips</Text>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Stack gap="xs">
                          {assistance.configuration?.map((tip: any, i: number) => (
                            <Text key={i} size="sm" c="dimmed">• {tip}</Text>
                          ))}
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>

                    {/* Optimization Suggestions */}
                    <Accordion.Item value="optimization">
                      <Accordion.Control>
                        <Group gap="xs">
                          <IconSparkles size={16} />
                          <Text>Optimizations</Text>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Stack gap="xs">
                          {assistance.optimizations?.map((opt: any, i: number) => (
                            <Card key={i} withBorder>
                              <Text size="sm" fw={500}>{opt.title}</Text>
                              <Text size="sm" c="dimmed">{opt.description}</Text>
                              <Group mt="xs">
                                <Badge color="green">Impact: {opt.impact}</Badge>
                                <Badge color="blue">Effort: {opt.effort}</Badge>
                              </Group>
                            </Card>
                          ))}
                        </Stack>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </>
              ) : (
                <Box ta="center" py="xl">
                  <Loader size="sm" />
                  <Text size="sm" c="dimmed" mt="md">
                    Analyzing workflow...
                  </Text>
                </Box>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="automation" pt="md">
            <Stack gap="md">
              {/* Auto Clean */}
              <Card withBorder>
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <IconClearAll size={20} />
                    <Text fw={500}>Auto Clean</Text>
                  </Group>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={handleAutoClean}
                    loading={isLoading && autoCleanProgress < 100}
                    disabled={!selectedNode?.data?.datasetId}
                  >
                    Clean Data
                  </Button>
                </Group>
                {autoCleanProgress > 0 && (
                  <Progress
                    value={autoCleanProgress}
                    size="sm"
                    striped
                    animated={autoCleanProgress < 100}
                  />
                )}
              </Card>

              {/* Auto Feature Engineering */}
              <Card withBorder>
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <IconTools size={20} />
                    <Text fw={500}>Feature Engineering</Text>
                  </Group>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={handleFeatureEngineering}
                    loading={isLoading && featureEngProgress < 100}
                    disabled={!selectedNode?.data?.datasetId}
                  >
                    Engineer Features
                  </Button>
                </Group>
                {featureEngProgress > 0 && (
                  <Progress
                    value={featureEngProgress}
                    size="sm"
                    striped
                    animated={featureEngProgress < 100}
                  />
                )}
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="insights" pt="md">
            <Stack gap="md">
              {assistance?.insights ? (
                <>
                  {/* Pattern Detection */}
                  <Card withBorder>
                    <Text fw={500} mb="xs">Detected Patterns</Text>
                    <Stack gap="xs">
                      {assistance.insights.patterns?.map((pattern: any, i: number) => (
                        <Group key={i} justify="space-between">
                          <Text size="sm">{pattern.description}</Text>
                          <Badge color="blue">{pattern.confidence}%</Badge>
                        </Group>
                      ))}
                    </Stack>
                  </Card>

                  {/* Performance Metrics */}
                  <Card withBorder>
                    <Text fw={500} mb="xs">Performance Analysis</Text>
                    <Stack gap="xs">
                      {assistance.insights.metrics?.map((metric: any, i: number) => (
                        <Group key={i} justify="space-between">
                          <Text size="sm">{metric.name}</Text>
                          <Badge
                            color={metric.status === 'good' ? 'green' : 'yellow'}
                          >
                            {metric.value}
                          </Badge>
                        </Group>
                      ))}
                    </Stack>
                  </Card>
                </>
              ) : (
                <Box ta="center" py="xl">
                  <Text c="dimmed">No insights available yet</Text>
                </Box>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Paper>
  );
}

interface AgentInteractionModalProps {
  opened: boolean;
  onClose: () => void;
  sourceAgent: WorkflowNode;
  availableAgents: WorkflowNode[];
  onInitiateInteraction: (targetId: string, type: InteractionType, protocol: InteractionProtocol) => void;
}

function AgentInteractionModal({
  opened,
  onClose,
  sourceAgent,
  availableAgents,
  onInitiateInteraction,
}: AgentInteractionModalProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [interactionType, setInteractionType] = useState<InteractionType>('collaboration');
  const [protocol, setProtocol] = useState<InteractionProtocol>('request_response');

  return (
    <Modal opened={opened} onClose={onClose} title="Initiate Agent Interaction">
      <Stack gap="md">
        <Select
          label="Target Agent"
          data={availableAgents.map(agent => ({
            value: agent.id,
            label: `${agent.data.label} (${AGENT_TYPES[agent.data.type].label})`
          }))}
          value={selectedAgent}
          onChange={(value) => value && setSelectedAgent(value)}
        />

        <Select
          label="Interaction Type"
          data={Object.keys(INTERACTION_PATTERNS).map(type => ({
            value: type,
            label: type.charAt(0).toUpperCase() + type.slice(1),
            description: INTERACTION_PATTERNS[type as keyof typeof INTERACTION_PATTERNS].description
          }))}
          value={interactionType}
          onChange={(value) => value && setInteractionType(value as InteractionType)}
        />

        <Select
          label="Protocol"
          data={INTERACTION_PATTERNS[interactionType as keyof typeof INTERACTION_PATTERNS]?.protocols.map(p => ({
            value: p,
            label: p.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          })) || []}
          value={protocol}
          onChange={(value) => value && setProtocol(value as InteractionProtocol)}
        />

        <Group justify="flex-end" mt="xl">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => {
              onInitiateInteraction(selectedAgent, interactionType, protocol);
              onClose();
            }}
            disabled={!selectedAgent}
          >
            Start Interaction
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

interface AgentCapabilityCardProps {
  capability: {
    id: string;
    label: string;
    description: string;
    complexity: string;
    requirements?: string[];
  };
  onExecute: () => void;
  isExecuting: boolean;
}

function AgentCapabilityCard({ capability, onExecute, isExecuting }: AgentCapabilityCardProps) {
  return (
    <Card withBorder>
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <Text fw={500}>{capability.label}</Text>
            <Badge color={
              capability.complexity === 'advanced' ? 'red' :
              capability.complexity === 'intermediate' ? 'yellow' :
              'green'
            }>
              {capability.complexity}
            </Badge>
          </Group>
          <Button
            size="xs"
            variant="light"
            loading={isExecuting}
            onClick={onExecute}
          >
            Execute
          </Button>
        </Group>
        <Text size="sm" c="dimmed">{capability.description}</Text>
        {capability.requirements && (
          <Group gap="xs">
            {capability.requirements.map((req, i) => (
              <Badge key={i} variant="dot">{req}</Badge>
            ))}
          </Group>
        )}
      </Stack>
    </Card>
  );
}

interface AgentMetricsProps {
  agent: WorkflowNode;
}

function AgentMetrics({ agent }: AgentMetricsProps) {
  return (
    <Card withBorder>
      <Stack gap="md">
        <Text fw={500}>Agent Metrics</Text>
        
        <SimpleGrid cols={2}>
          <Stack gap="xs">
            <Text size="sm" c="dimmed">Learning Capacity</Text>
            <RingProgress
              sections={[{ value: AGENT_TYPES[agent.data.type].learningCapacity * 100, color: 'blue' }]}
              label={<Text ta="center">{(AGENT_TYPES[agent.data.type].learningCapacity * 100).toFixed(0)}%</Text>}
            />
          </Stack>
          
          <Stack gap="xs">
            <Text size="sm" c="dimmed">Autonomy Level</Text>
            <RingProgress
              sections={[{ value: AGENT_TYPES[agent.data.type].autonomyLevel * 100, color: 'green' }]}
              label={<Text ta="center">{(AGENT_TYPES[agent.data.type].autonomyLevel * 100).toFixed(0)}%</Text>}
            />
          </Stack>
        </SimpleGrid>

        {agent.data.state?.performance && (
          <Stack gap="xs">
            <Text size="sm" fw={500}>Performance</Text>
            <Group grow>
              {agent.data.state.performance.accuracy !== undefined && (
                <Badge color="green">Accuracy: {(agent.data.state.performance.accuracy * 100).toFixed(1)}%</Badge>
              )}
              {agent.data.state.performance.latency !== undefined && (
                <Badge color="blue">Latency: {agent.data.state.performance.latency}ms</Badge>
              )}
              {agent.data.state.performance.resourceUsage !== undefined && (
                <Badge color="yellow">Resource Usage: {(agent.data.state.performance.resourceUsage * 100).toFixed(1)}%</Badge>
              )}
            </Group>
          </Stack>
        )}

        <Stack gap="xs">
          <Text size="sm" fw={500}>Specializations</Text>
          <Group gap="xs">
            {AGENT_TYPES[agent.data.type].specializations.map((spec, i) => (
              <Badge key={i} variant="light">
                {spec.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Badge>
            ))}
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}

const CustomNode = ({ data }: { data: NodeData }) => {
  const theme = useMantineTheme();
  
  return (
    <div style={{
      padding: '10px',
      borderRadius: '8px',
      backgroundColor: theme.white,
      border: `2px solid ${theme.colors.blue[4]}`,
      boxShadow: theme.shadows.sm,
      minWidth: '150px',
    }}>
      {/* ... rest of the node content ... */}
    </div>
  );
}; 
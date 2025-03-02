import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Panel,
  useReactFlow,
  NodeProps,
  BackgroundVariant,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Text,
  Paper,
  Drawer,
  Modal,
  Group,
  Stack,
  Title,
  Button,
  Card,
  Badge,
  Menu,
  UnstyledButton,
  Tooltip,
  Divider,
  ActionIcon,
  TextInput,
  Stepper,
  Notification,
  List,
  SimpleGrid,
  useMantineTheme,
} from '@mantine/core';
import {
  IconDatabase,
  IconWand,
  IconChartBar,
  IconBrain,
  IconRobot,
  IconStars,
  IconAdjustments,
  IconPlus,
  IconX,
  IconArrowRight,
  IconArrowLeft,
  IconRefresh,
  IconZoomIn,
  IconZoomOut,
  IconMaximize,
  IconDots,
} from '@tabler/icons-react';
import AIWorkflowAssistant, { Suggestion } from './AIWorkflowAssistant';
import { NODE_TYPES, NodeTypes as NodeTypeDefinitions } from '../types/workflow';
import { IconWrapper } from './IconWrapper';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

interface CustomNodeData {
  label: string;
  type: string;
  settings?: Record<string, string>;
}

type CustomNodeProps = NodeProps<CustomNodeData>;

// Enhanced custom node component
const CustomNode = ({ data, selected }: CustomNodeProps) => {
  const theme = useMantineTheme();
  
  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        background: selected ? theme.colors.blue[0] : theme.white,
        borderColor: selected ? theme.colors.blue[6] : undefined,
      }}
    >
      <Stack gap="sm">
        <Group>
          <IconWrapper size={24}>
            <IconBrain size={24} />
          </IconWrapper>
          <Text fw={500}>{data.label}</Text>
        </Group>

        <Badge size="sm" variant="light" color="blue">
          {data.type}
        </Badge>

        {data.settings && (
          <Box>
            <Divider my="xs" />
            {Object.entries(data.settings).map(([key, value]) => (
              <Group key={key} justify="space-between" gap="xs">
                <Text size="sm" c="dimmed">{key}:</Text>
                <Text size="sm">{value}</Text>
              </Group>
            ))}
          </Box>
        )}
      </Stack>
    </Card>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface WorkflowBuilderProps {
  onSave?: (workflow: any) => void;
  onExecute?: (workflow: any) => void;
}

interface WorkflowScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  steps: Array<{
    title: string;
    description: string;
    suggestedNodes: string[];
    aiPrompts: string[];
    validationChecks: string[];
  }>;
}

const WORKFLOW_SCENARIOS: WorkflowScenario[] = [
  {
    id: 'data-loading',
    title: 'Find and Load Large Dataset',
    description: 'Discover, evaluate, and load a substantial dataset for analysis',
    icon: <IconDatabase size={24} />,
    steps: [
      {
        title: 'Dataset Selection',
        description: 'Choose a dataset from Kaggle or upload your own',
        suggestedNodes: ['csvUpload', 'kaggleDataset'],
        aiPrompts: [
          'What type of data are you looking to analyze?',
          'Do you have any specific size requirements for the dataset?',
          'Are there particular domains you are interested in?'
        ],
        validationChecks: ['fileSize', 'columnCount', 'rowCount']
      }
    ]
  },
  {
    id: 'structural-investigation',
    title: 'Structural Investigation',
    description: 'Analyze dataset structure and characteristics',
    icon: <IconChartBar size={24} />,
    steps: [
      {
        title: 'Data Profiling',
        description: 'Generate comprehensive data profile',
        suggestedNodes: ['statistics', 'dataProfile'],
        aiPrompts: [
          'Would you like to see a summary of data types?',
          'Should we check for any specific structural patterns?'
        ],
        validationChecks: ['completenessCheck', 'typeConsistency']
      },
      {
        title: 'Column Analysis',
        description: 'Analyze individual column characteristics',
        suggestedNodes: ['columnStats', 'correlationMatrix'],
        aiPrompts: [
          'Which columns are most important for your analysis?',
          'Are there any specific relationships you want to investigate?'
        ],
        validationChecks: ['columnTypes', 'missingValues']
      }
    ]
  },
  {
    id: 'quality-investigation',
    title: 'Quality Investigation',
    description: 'Clean and prepare dataset for analysis',
    icon: <IconWand size={24} />,
    steps: [
      {
        title: 'Missing Data Analysis',
        description: 'Identify and handle missing values',
        suggestedNodes: ['missingValueDetector', 'imputationTool'],
        aiPrompts: [
          'How would you like to handle missing values?',
          'Are there specific columns that require special treatment?'
        ],
        validationChecks: ['missingPercentage', 'imputationQuality']
      },
      {
        title: 'Outlier Detection',
        description: 'Identify and handle outliers',
        suggestedNodes: ['outlierDetector', 'outlierTreatment'],
        aiPrompts: [
          'What methods would you prefer for outlier detection?',
          'How should we handle detected outliers?'
        ],
        validationChecks: ['outlierCount', 'distributionCheck']
      }
    ]
  },
  {
    id: 'data-merge',
    title: 'Merge DataFrames',
    description: 'Combine multiple datasets effectively',
    icon: <IconAdjustments size={24} />,
    steps: [
      {
        title: 'Data Source Selection',
        description: 'Choose datasets to merge',
        suggestedNodes: ['datasetSelector', 'mergePreview'],
        aiPrompts: [
          'What is the relationship between your datasets?',
          'Which columns should be used for merging?'
        ],
        validationChecks: ['keyValidation', 'duplicateCheck']
      },
      {
        title: 'Merge Configuration',
        description: 'Configure merge parameters',
        suggestedNodes: ['mergeConfig', 'resultValidator'],
        aiPrompts: [
          'What type of join would you like to perform?',
          'How should we handle conflicting columns?'
        ],
        validationChecks: ['mergeSuccess', 'dataIntegrity']
      }
    ]
  },
  {
    id: 'data-binning',
    title: 'Data Binning',
    description: 'Create meaningful categories from continuous data',
    icon: <IconAdjustments size={24} />,
    steps: [
      {
        title: 'Variable Selection',
        description: 'Choose variables for binning',
        suggestedNodes: ['variableSelector', 'distributionAnalyzer'],
        aiPrompts: [
          'Which continuous variables would you like to bin?',
          'What is the purpose of binning these variables?'
        ],
        validationChecks: ['variableType', 'distributionShape']
      },
      {
        title: 'Binning Strategy',
        description: 'Define binning approach',
        suggestedNodes: ['binningMethod', 'binEvaluator'],
        aiPrompts: [
          'How would you like to determine bin edges?',
          'How many bins would be appropriate?'
        ],
        validationChecks: ['binSize', 'binBalance']
      }
    ]
  },
  {
    id: 'lambda-functions',
    title: 'Lambda Function Application',
    description: 'Apply custom transformations to your data',
    icon: <IconWand size={24} />,
    steps: [
      {
        title: 'Function Definition',
        description: 'Define lambda functions',
        suggestedNodes: ['functionBuilder', 'testCase'],
        aiPrompts: [
          'What transformation would you like to apply?',
          'Are there any specific conditions to consider?'
        ],
        validationChecks: ['syntaxCheck', 'logicValidation']
      },
      {
        title: 'Application Scope',
        description: 'Select columns and conditions',
        suggestedNodes: ['columnSelector', 'conditionBuilder'],
        aiPrompts: [
          'Which columns should the function be applied to?',
          'Are there any filtering conditions?'
        ],
        validationChecks: ['applicationSuccess', 'resultValidation']
      }
    ]
  },
  {
    id: 'feature-engineering',
    title: 'Feature Engineering',
    description: 'Create new features from existing data',
    icon: <IconAdjustments size={24} />,
    steps: [
      {
        title: 'Feature Ideation',
        description: 'Identify potential new features',
        suggestedNodes: ['featureDiscovery', 'domainKnowledge'],
        aiPrompts: [
          'What insights are you trying to capture?',
          'Are there any domain-specific features to consider?'
        ],
        validationChecks: ['featureRelevance', 'redundancyCheck']
      },
      {
        title: 'Feature Creation',
        description: 'Implement new features',
        suggestedNodes: ['featureConstructor', 'featureValidator'],
        aiPrompts: [
          'How should we combine existing features?',
          'What transformations would be meaningful?'
        ],
        validationChecks: ['featureQuality', 'correlationCheck']
      }
    ]
  },
  {
    id: 'exploratory-analysis',
    title: 'Deep Exploratory Analysis',
    description: 'Uncover patterns and insights in your data',
    icon: <IconAdjustments size={24} />,
    steps: [
      {
        title: 'Univariate Analysis',
        description: 'Analyze individual variables',
        suggestedNodes: ['distributionPlot', 'summaryStats'],
        aiPrompts: [
          'Which variables are most important to analyze?',
          'What aspects of the distributions interest you?'
        ],
        validationChecks: ['visualQuality', 'insightValue']
      },
      {
        title: 'Multivariate Analysis',
        description: 'Explore relationships between variables',
        suggestedNodes: ['correlationPlot', 'scatterMatrix'],
        aiPrompts: [
          'Which relationships would you like to investigate?',
          'Are there any specific patterns you expect to find?'
        ],
        validationChecks: ['relationshipStrength', 'patternIdentification']
      }
    ]
  },
  {
    id: 'feature-importance',
    title: 'Feature Importance Analysis',
    description: 'Determine most influential features',
    icon: <IconStars size={24} />,
    steps: [
      {
        title: 'Model Selection',
        description: 'Choose analysis method',
        suggestedNodes: ['modelSelector', 'importanceMethod'],
        aiPrompts: [
          'What type of importance analysis would you prefer?',
          'Are there any specific metrics you want to focus on?'
        ],
        validationChecks: ['methodSuitability', 'modelFit']
      },
      {
        title: 'Importance Evaluation',
        description: 'Calculate and visualize importance',
        suggestedNodes: ['importanceCalculator', 'importancePlot'],
        aiPrompts: [
          'How would you like to visualize the results?',
          'What threshold should we use for importance?'
        ],
        validationChecks: ['resultSignificance', 'visualClarity']
      }
    ]
  },
  {
    id: 'classification-resampling',
    title: 'Binary Classification & Resampling',
    description: 'Handle imbalanced classification tasks',
    icon: <IconAdjustments size={24} />,
    steps: [
      {
        title: 'Class Analysis',
        description: 'Analyze class distribution',
        suggestedNodes: ['classDistribution', 'imbalanceMetrics'],
        aiPrompts: [
          'What is the current class distribution?',
          'How severe is the class imbalance?'
        ],
        validationChecks: ['distributionMetrics', 'imbalanceLevel']
      },
      {
        title: 'Resampling Strategy',
        description: 'Choose and apply resampling method',
        suggestedNodes: ['resamplingMethod', 'balanceValidator'],
        aiPrompts: [
          'Which resampling approach would you prefer?',
          'What should be the target class distribution?'
        ],
        validationChecks: ['samplingQuality', 'dataPreservation']
      }
    ]
  }
];

interface ScenarioSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (scenario: WorkflowScenario) => void;
}

const ScenarioSelectionDialog: React.FC<ScenarioSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const theme = useMantineTheme();
  
  return (
    <Modal 
      opened={open}
      onClose={onClose}
      title={
        <Group>
          <IconWrapper size={32}>
            <IconBrain />
          </IconWrapper>
          <Title order={3}>Choose Your Journey</Title>
        </Group>
      }
      size="xl"
    >
      <Stack>
        <Text size="lg">
          Select a pre-configured workflow scenario to get started quickly.
        </Text>

        <SimpleGrid cols={2} spacing="md">
          {WORKFLOW_SCENARIOS.map((scenario) => (
            <Card
              key={scenario.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              onClick={() => onSelect(scenario)}
              style={{
                cursor: 'pointer',
                transition: 'all 200ms ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.shadows.md,
                },
              }}
            >
              <Stack gap="md">
                <Group>
                  <IconWrapper size={32}>
                    {scenario.icon}
                  </IconWrapper>
                  <Text fw={500} size="lg">{scenario.title}</Text>
                </Group>

                <Text size="sm" c="dimmed">
                  {scenario.description}
                </Text>

                <Group gap="xs">
                  {scenario.steps.map((_, index) => (
                    <Badge key={index} size="sm" variant="light">
                      Step {index + 1}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Modal>
  );
};

const DragHandle = () => (
  <Box style={{ marginRight: 8, opacity: 0.5 }}>
    <IconWrapper size={20}>
      <IconDatabase size={20} />
    </IconWrapper>
  </Box>
);

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onSave, onExecute }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Undo/Redo functionality
  const [history, setHistory] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setHistory(prev => [...prev.slice(0, historyIndex + 1), { nodes, edges }]);
      setHistoryIndex(prev => prev + 1);
    }
  }, [nodes, edges]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: Node = {
        id: `node_${nodes.length + 1}`,
        type: 'custom',
        position,
        data: { label: type, type },
      };

      setNodes((nds) => nds.concat(newNode));
      setSnackbar({
        open: true,
        message: `Added new ${type} node`,
        severity: 'success'
      });
    },
    [nodes, setNodes]
  );

  const handleAIGenerate = async () => {
    try {
      const response = await fetch('/api/workflows/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiPrompt })
      });

      if (!response.ok) throw new Error('Failed to generate workflow');

      const workflow = await response.json();
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
      setIsAIDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'AI-generated workflow created successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating workflow:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate workflow',
        severity: 'error'
      });
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({ nodes, edges });
      setSnackbar({
        open: true,
        message: 'Workflow saved successfully',
        severity: 'success'
      });
    }
  };

  const handleExecute = () => {
    if (onExecute) {
      onExecute({ nodes, edges });
      setSnackbar({
        open: true,
        message: 'Workflow execution started',
        severity: 'info'
      });
    }
  };

  const [scenarioDialogOpen, setScenarioDialogOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<WorkflowScenario | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleScenarioSelect = (scenario: WorkflowScenario) => {
    setActiveScenario(scenario);
    setScenarioDialogOpen(false);
    // Initialize the workflow with the first step
    const firstStep = scenario.steps[0];
    // Add initial nodes based on suggested nodes
    // Show AI prompts
    // Start validation checks
  };

  const theme = useMantineTheme();

  const [suggestions] = useState<Suggestion[]>([
    {
      id: '1',
      title: 'Optimize Data Loading',
      description: 'Add data validation and error handling to your data loading step',
      config: { /* ... */ }
    },
    // ... more suggestions
  ]);

  return (
    <Box
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: theme.colors.gray[0],
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        ref={reactFlowWrapper}
        style={{
          flex: '1',
          minHeight: 0,
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap />
          
          <Panel position="top-right">
            <Paper
              style={{
                padding: theme.spacing.xs,
                borderRadius: theme.radius.md,
                display: 'flex',
                gap: theme.spacing.xs,
                backgroundColor: theme.white,
              }}
            >
              <Tooltip label="Undo">
                <ActionIcon
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  size="sm"
                  variant="subtle"
                >
                  <IconArrowLeft size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Redo">
                <ActionIcon
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  size="sm"
                  variant="subtle"
                >
                  <IconArrowRight size={16} />
                </ActionIcon>
              </Tooltip>
              <Divider orientation="vertical" />
              <Tooltip label="Zoom In">
                <ActionIcon onClick={() => zoomIn()} size="sm" variant="subtle">
                  <IconZoomIn size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Zoom Out">
                <ActionIcon onClick={() => zoomOut()} size="sm" variant="subtle">
                  <IconZoomOut size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Fit View">
                <ActionIcon onClick={() => fitView()} size="sm" variant="subtle">
                  <IconMaximize size={16} />
                </ActionIcon>
              </Tooltip>
            </Paper>
          </Panel>
        </ReactFlow>
      </Box>

      <Button
        leftSection={<IconPlus size={20} />}
        onClick={() => setScenarioDialogOpen(true)}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          borderRadius: theme.radius.xl,
          padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
        }}
      >
        Start New Journey
      </Button>

      <ScenarioSelectionDialog
        open={scenarioDialogOpen}
        onClose={() => setScenarioDialogOpen(false)}
        onSelect={handleScenarioSelect}
      />

      {activeScenario && (
        <Box
          style={{
            position: 'absolute',
            left: 24,
            top: 100,
            width: 320,
            backgroundColor: 'var(--mantine-color-white)',
            borderRadius: 'var(--mantine-radius-lg)',
            boxShadow: 'var(--mantine-shadow-lg)',
            padding: 'var(--mantine-spacing-md)',
          }}
        >
          <Title order={4} mb="md">
            {activeScenario.title}
          </Title>
          <Stepper active={activeStep} orientation="vertical">
            {activeScenario.steps.map((step, index) => (
              <Stepper.Step
                key={index}
                label={step.title}
                description={step.description}
              >
                <Group mt="md">
                  <Button
                    onClick={() => setActiveStep(index + 1)}
                    disabled={index === activeScenario.steps.length - 1}
                  >
                    Continue
                  </Button>
                  <Button
                    variant="light"
                    onClick={() => setActiveStep(index - 1)}
                    disabled={index === 0}
                  >
                    Back
                  </Button>
                </Group>
              </Stepper.Step>
            ))}
          </Stepper>
        </Box>
      )}

      <Menu position="bottom-end" shadow="md">
        <Menu.Target>
          <ActionIcon
            variant="filled"
            size="lg"
            radius="xl"
            style={{
              position: 'absolute',
              bottom: 24,
              right: 24,
            }}
          >
            <IconDots size={20} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item leftSection={<IconBrain size={16} />} onClick={() => setIsAIDialogOpen(true)}>
            AI Assistant
          </Menu.Item>
          <Menu.Item leftSection={<IconWand size={16} />} onClick={handleSave}>
            Save Workflow
          </Menu.Item>
          <Menu.Item leftSection={<IconRobot size={16} />} onClick={handleExecute}>
            Execute Workflow
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Drawer
        opened={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          <Group>
            <IconWrapper size={24}>
              <IconPlus />
            </IconWrapper>
            <Text>Add Nodes</Text>
          </Group>
        }
        position="right"
        size="md"
      >
        <Stack>
          {Object.entries(NODE_TYPES).map(([category, info]) => (
            <Paper key={category} withBorder p="md" radius="md">
              <Title order={6} mb="md">{category}</Title>
              <List>
                {info.operations.map((op) => (
                  <List.Item key={op}>
                    <UnstyledButton
                      style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--mantine-color-gray-3)',
                        width: '100%',
                        '&:hover': {
                          backgroundColor: 'var(--mantine-color-gray-0)',
                        },
                      }}
                    >
                      {op}
                    </UnstyledButton>
                  </List.Item>
                ))}
              </List>
            </Paper>
          ))}
        </Stack>
      </Drawer>

      <Modal
        opened={isAIDialogOpen}
        onClose={() => setIsAIDialogOpen(false)}
        title={
          <Group>
            <IconBrain size={24} />
            <Text>AI Assistant</Text>
          </Group>
        }
      >
        <Stack>
          <TextInput
            label="What would you like to do?"
            placeholder="Describe your goal..."
            value={aiPrompt}
            onChange={(e) => setAIPrompt(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setIsAIDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAIGenerate}>
              Generate
            </Button>
          </Group>
        </Stack>
      </Modal>

      {snackbar.open && (
        <Notification
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
          }}
          color={snackbar.severity === 'error' ? 'red' : 'blue'}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          title={snackbar.severity === 'error' ? 'Error' : 'Success'}
        >
          {snackbar.message}
        </Notification>
      )}
    </Box>
  );
};

export default WorkflowBuilder; 
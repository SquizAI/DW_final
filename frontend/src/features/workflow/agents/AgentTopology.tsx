import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
  EdgeTypes,
  Panel,
  ConnectionLineType,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Text,
  Group,
  Badge,
  ThemeIcon,
  Paper,
  Stack,
  Button,
  Tooltip,
  RingProgress,
  Loader,
  Select,
  Switch,
  useMantineTheme,
  Modal,
  TextInput,
  MultiSelect,
  Slider,
  ActionIcon,
  Card,
  Center,
} from '@mantine/core';
import {
  IconBrain,
  IconRobot,
  IconDatabase,
  IconChartBar,
  IconWand,
  IconMessage,
  IconRefresh,
  IconPlus,
  IconSettings,
  IconEye,
  IconArrowsExchange,
  IconArrowsJoin,
  IconArrowsSplit,
  IconArrowRight,
} from '@tabler/icons-react';
import { api } from '@/api';
import { notifications } from '@mantine/notifications';

// Define agent role icons
const ROLE_ICONS = {
  coordinator: <IconBrain size={24} />,
  data_processor: <IconDatabase size={24} />,
  analyzer: <IconChartBar size={24} />,
  visualizer: <IconChartBar size={24} />,
  explainer: <IconWand size={24} />,
  optimizer: <IconSettings size={24} />,
  validator: <IconEye size={24} />,
  researcher: <IconRobot size={24} />,
};

// Define agent role colors
const ROLE_COLORS = {
  coordinator: 'blue',
  data_processor: 'teal',
  analyzer: 'violet',
  visualizer: 'orange',
  explainer: 'green',
  optimizer: 'pink',
  validator: 'yellow',
  researcher: 'indigo',
};

// Define interaction type icons
const INTERACTION_ICONS = {
  collaboration: <IconArrowsExchange size={16} />,
  delegation: <IconArrowRight size={16} />,
  negotiation: <IconArrowsSplit size={16} />,
  competition: <IconArrowsSplit size={16} />,
  supervision: <IconArrowsJoin size={16} />,
};

// Define interaction type colors
const INTERACTION_COLORS = {
  collaboration: 'blue',
  delegation: 'green',
  negotiation: 'orange',
  competition: 'red',
  supervision: 'violet',
};

// Define agent node component
const AgentNode = ({ data }: NodeProps) => {
  const theme = useMantineTheme();
  const roleColor = ROLE_COLORS[data.role as keyof typeof ROLE_COLORS] || 'gray';
  
  return (
    <Card withBorder shadow="sm" padding="sm" radius="md" style={{ width: 200 }}>
      <Group gap="xs" mb="xs">
        <ThemeIcon color={ROLE_COLORS[data.role as keyof typeof ROLE_COLORS] || 'blue'} size="md" radius="md">
          <IconRobot size={16} />
        </ThemeIcon>
        <div>
          <Text fw={500} size="sm">{data.label}</Text>
          <Text size="xs" c="dimmed" style={{ textTransform: 'capitalize' }}>{data.role}</Text>
        </div>
      </Group>
      
      <Group gap="xs" mb="xs">
        {data.capabilities?.map((capability: string) => (
          <Badge key={capability} size="xs" variant="outline">
            {capability}
          </Badge>
        ))}
      </Group>
      
      <Group justify="center" align="center">
        <RingProgress
          size={80}
          thickness={8}
          sections={[
            { value: data.learning_capacity * 100, color: 'blue' },
            { value: data.autonomy_level * 100, color: 'green' },
          ]}
          label={
            <Center>
              <IconBrain size={20} />
            </Center>
          }
        />
      </Group>
    </Card>
  );
};

// Define custom edge component
const InteractionEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: any) => {
  const interactionType = data?.interaction_type || 'collaboration';
  const color = INTERACTION_COLORS[interactionType as keyof typeof INTERACTION_COLORS] || 'gray';
  
  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={`M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`}
        stroke={`var(--mantine-color-${color}-5)`}
        strokeWidth={2}
        fill="none"
      />
      <foreignObject
        width={20}
        height={20}
        x={(sourceX + targetX) / 2 - 10}
        y={(sourceY + targetY) / 2 - 10}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div
          style={{
            background: `var(--mantine-color-${color}-5)`,
            color: 'white',
            borderRadius: '50%',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {INTERACTION_ICONS[interactionType as keyof typeof INTERACTION_ICONS] || <IconMessage size={12} />}
        </div>
      </foreignObject>
    </>
  );
};

// Define node types
const nodeTypes: NodeTypes = {
  agent: AgentNode,
};

// Define edge types
const edgeTypes: EdgeTypes = {
  interaction: InteractionEdge,
};

interface AgentTopologyProps {
  nodeId?: string;
  task?: string;
  onAlgorithmSelect?: (algorithm: string) => void;
  onClose?: () => void;
}

export function AgentTopology({ nodeId, task, onAlgorithmSelect, onClose }: AgentTopologyProps) {
  const theme = useMantineTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Agent creation form state
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [agentCapabilities, setAgentCapabilities] = useState<string[]>([]);
  const [agentLearningCapacity, setAgentLearningCapacity] = useState(0.5);
  const [agentAutonomyLevel, setAgentAutonomyLevel] = useState(0.5);
  const [agentSpecializations, setAgentSpecializations] = useState<string[]>([]);
  
  // Interaction creation form state
  const [interactionType, setInteractionType] = useState('');
  const [interactionProtocol, setInteractionProtocol] = useState('');
  const [interactionParticipants, setInteractionParticipants] = useState<string[]>([]);
  
  // Fetch agent topology data
  const fetchTopology = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/agentic/topology');
      
      if (response.data) {
        // Transform nodes for ReactFlow
        const flowNodes: Node[] = response.data.nodes.map((node: any) => ({
          id: node.id,
          type: 'agent',
          position: { x: 0, y: 0 }, // Will be positioned by layout
          data: {
            ...node.data,
            label: node.label,
            role: node.type,
          },
        }));
        
        // Transform edges for ReactFlow
        const flowEdges: Edge[] = response.data.edges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'interaction',
          data: edge.data,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: `var(--mantine-color-${INTERACTION_COLORS[edge.data.interaction_type as keyof typeof INTERACTION_COLORS] || 'gray'}-5)`,
          },
        }));
        
        // Apply force-directed layout
        const positionedNodes = applyForceLayout(flowNodes, flowEdges);
        
        setNodes(positionedNodes);
        setEdges(flowEdges);
      }
    } catch (error) {
      console.error('Error fetching agent topology:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch agent topology',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  }, [setNodes, setEdges]);
  
  // Apply force-directed layout to nodes
  const applyForceLayout = (nodes: Node[], edges: Edge[]): Node<any, string>[] => {
    // Simple circular layout for demo
    const centerX = 500;
    const centerY = 300;
    const radius = 250;
    
    return nodes.map((node, i) => {
      const angle = (i * 2 * Math.PI) / nodes.length;
      return {
        ...node,
        position: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        },
      };
    });
  };
  
  // Handle auto-refresh toggle
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchTopology();
      }, 5000); // Refresh every 5 seconds
      
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, fetchTopology]);
  
  // Initial data fetch
  useEffect(() => {
    fetchTopology();
  }, [fetchTopology]);
  
  // Handle node click
  const onNodeClick = (event: React.MouseEvent, node: Node<any, string | undefined>) => {
    setSelectedAgent(node.id);
  };
  
  // Handle create agent
  const handleCreateAgent = async () => {
    try {
      const response = await api.post('/agentic/agents', {
        name: agentName,
        role: agentRole,
        capabilities: agentCapabilities,
        learning_capacity: agentLearningCapacity,
        autonomy_level: agentAutonomyLevel,
        specializations: agentSpecializations,
      });
      
      if (response.data) {
        notifications.show({
          title: 'Success',
          message: `Agent "${agentName}" created successfully`,
          color: 'green',
        });
        
        // Reset form
        setAgentName('');
        setAgentRole('');
        setAgentCapabilities([]);
        setAgentLearningCapacity(0.5);
        setAgentAutonomyLevel(0.5);
        setAgentSpecializations([]);
        
        // Close modal
        setShowCreateModal(false);
        
        // Refresh topology
        fetchTopology();
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create agent',
        color: 'red',
      });
    }
  };
  
  // Handle create interaction
  const handleCreateInteraction = async () => {
    try {
      const response = await api.post('/agentic/interactions', {
        interaction_type: interactionType,
        protocol: interactionProtocol,
        participants: interactionParticipants,
      });
      
      if (response.data) {
        notifications.show({
          title: 'Success',
          message: 'Interaction created successfully',
          color: 'green',
        });
        
        // Reset form
        setInteractionType('');
        setInteractionProtocol('');
        setInteractionParticipants([]);
        
        // Close modal
        setShowInteractionModal(false);
        
        // Refresh topology
        fetchTopology();
      }
    } catch (error) {
      console.error('Error creating interaction:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create interaction',
        color: 'red',
      });
    }
  };
  
  // Handle create default agents
  const handleCreateDefaultAgents = async () => {
    try {
      const response = await api.post('/agentic/agents/default');
      
      if (response.data) {
        notifications.show({
          title: 'Success',
          message: 'Default agents created successfully',
          color: 'green',
        });
        
        // Refresh topology
        fetchTopology();
      }
    } catch (error) {
      console.error('Error creating default agents:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create default agents',
        color: 'red',
      });
    }
  };
  
  return (
    <Box style={{ height: '100%', width: '100%' }}>
      {isLoading ? (
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Stack align="center" spacing="md">
            <Loader size="lg" />
            <Text>Loading agent topology...</Text>
          </Stack>
        </Box>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-right"
          connectionLineType={ConnectionLineType.SmoothStep}
        >
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              const role = node.data?.role || 'default';
              return `var(--mantine-color-${ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 'gray'}-5)`;
            }}
          />
          <Background color="#f8f9fa" gap={16} />
          
          <Panel position="top-right">
            <Group gap="xs">
              <Tooltip label="Refresh Topology">
                <ActionIcon
                  variant="light"
                  color="blue"
                  onClick={fetchTopology}
                  loading={isLoading}
                >
                  <IconRefresh size={20} />
                </ActionIcon>
              </Tooltip>
              
              <Tooltip label="Create Agent">
                <ActionIcon
                  variant="light"
                  color="green"
                  onClick={() => setShowCreateModal(true)}
                >
                  <IconPlus size={20} />
                </ActionIcon>
              </Tooltip>
              
              <Tooltip label="Create Interaction">
                <ActionIcon
                  variant="light"
                  color="violet"
                  onClick={() => setShowInteractionModal(true)}
                  disabled={nodes.length < 2}
                >
                  <IconArrowsExchange size={20} />
                </ActionIcon>
              </Tooltip>
              
              <Tooltip label="Create Default Agents">
                <Button
                  variant="light"
                  size="xs"
                  onClick={handleCreateDefaultAgents}
                >
                  Create Default Agents
                </Button>
              </Tooltip>
              
              <Switch
                label="Auto-refresh"
                checked={autoRefresh}
                onChange={(event) => setAutoRefresh(event.currentTarget.checked)}
              />
            </Group>
          </Panel>
          
          {selectedAgent && (
            <Panel position="bottom-left">
              <Paper p="md" withBorder shadow="sm" style={{ width: 300 }}>
                <Stack spacing="xs">
                  <Text fw={700}>Selected Agent</Text>
                  <Text>{nodes.find((n) => n.id === selectedAgent)?.data?.label}</Text>
                  
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => setSelectedAgent(null)}
                  >
                    Close
                  </Button>
                </Stack>
              </Paper>
            </Panel>
          )}
        </ReactFlow>
      )}
      
      {/* Create Agent Modal */}
      <Modal
        opened={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Agent"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Agent Name"
            placeholder="Enter agent name"
            value={agentName}
            onChange={(e) => setAgentName(e.currentTarget.value)}
            required
          />
          
          <Select
            label="Role"
            placeholder="Select agent role"
            data={[
              { value: 'coordinator', label: 'Coordinator' },
              { value: 'executor', label: 'Executor' },
              { value: 'analyst', label: 'Analyst' },
              { value: 'advisor', label: 'Advisor' },
              { value: 'monitor', label: 'Monitor' },
            ]}
            value={agentRole}
            onChange={(value) => value && setAgentRole(value)}
            required
          />
          
          <MultiSelect
            label="Capabilities"
            placeholder="Add agent capabilities"
            data={[
              { value: 'data_processing', label: 'Data Processing' },
              { value: 'machine_learning', label: 'Machine Learning' },
              { value: 'natural_language', label: 'Natural Language' },
              { value: 'visualization', label: 'Visualization' },
              { value: 'optimization', label: 'Optimization' },
            ]}
            value={agentCapabilities}
            onChange={setAgentCapabilities}
            searchable
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => {
              const item = { value: query.toLowerCase(), label: query };
              return item;
            }}
          />
          
          <Text size="sm">Learning Capacity</Text>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={agentLearningCapacity}
            onChange={setAgentLearningCapacity}
            marks={[
              { value: 0, label: '0' },
              { value: 0.5, label: '0.5' },
              { value: 1, label: '1' },
            ]}
          />
          
          <Text size="sm">Autonomy Level</Text>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={agentAutonomyLevel}
            onChange={setAgentAutonomyLevel}
            marks={[
              { value: 0, label: '0' },
              { value: 0.5, label: '0.5' },
              { value: 1, label: '1' },
            ]}
          />
          
          <MultiSelect
            label="Specializations"
            placeholder="Enter agent specializations"
            data={[
              { value: 'missing_value_imputation', label: 'Missing Value Imputation' },
              { value: 'outlier_detection', label: 'Outlier Detection' },
              { value: 'feature_selection', label: 'Feature Selection' },
              { value: 'model_interpretation', label: 'Model Interpretation' },
              { value: 'feature_importance', label: 'Feature Importance' },
              { value: 'interactive_visualization', label: 'Interactive Visualization' },
              { value: 'dashboard_creation', label: 'Dashboard Creation' },
              { value: 'workflow_optimization', label: 'Workflow Optimization' },
              { value: 'task_delegation', label: 'Task Delegation' },
              { value: 'predictive_modeling', label: 'Predictive Modeling' },
              { value: 'pattern_recognition', label: 'Pattern Recognition' },
            ]}
            value={agentSpecializations}
            onChange={setAgentSpecializations}
            searchable
            creatable
            getCreateLabel={(query) => `+ Create "${query}"`}
            onCreate={(query) => {
              setAgentSpecializations([...agentSpecializations, query]);
              return query;
            }}
          />
          
          <Group position="right" mt="md">
            <Button variant="light" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAgent}>Create Agent</Button>
          </Group>
        </Stack>
      </Modal>
      
      {/* Create Interaction Modal */}
      <Modal
        opened={showInteractionModal}
        onClose={() => setShowInteractionModal(false)}
        title="Create Interaction"
        size="md"
      >
        <Stack spacing="md">
          <Select
            label="Interaction Type"
            placeholder="Select interaction type"
            data={[
              { value: 'collaboration', label: 'Collaboration' },
              { value: 'delegation', label: 'Delegation' },
              { value: 'negotiation', label: 'Negotiation' },
              { value: 'competition', label: 'Competition' },
              { value: 'supervision', label: 'Supervision' },
            ]}
            value={interactionType}
            onChange={(value) => value && setInteractionType(value)}
            required
          />
          
          <Select
            label="Protocol"
            placeholder="Select interaction protocol"
            data={[
              { value: 'request_response', label: 'Request-Response' },
              { value: 'publish_subscribe', label: 'Publish-Subscribe' },
              { value: 'contract_net', label: 'Contract Net' },
              { value: 'voting', label: 'Voting' },
              { value: 'auction', label: 'Auction' },
            ]}
            value={interactionProtocol}
            onChange={(value) => value && setInteractionProtocol(value)}
            required
          />
          
          <MultiSelect
            label="Participants"
            placeholder="Select participating agents"
            data={nodes.map((node) => ({
              value: node.id,
              label: node.data?.label || node.id,
            }))}
            value={interactionParticipants}
            onChange={setInteractionParticipants}
            required
          />
          
          <Group position="right" mt="md">
            <Button variant="light" onClick={() => setShowInteractionModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInteraction}>Create Interaction</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
} 
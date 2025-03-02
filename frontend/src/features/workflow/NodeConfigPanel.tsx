import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Text,
  Tabs,
  Select,
  TextInput,
  NumberInput,
  Switch,
  Button,
  Group,
  Code,
  JsonInput,
  ColorInput,
  MultiSelect,
  Accordion,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconSettings,
  IconCode,
  IconDatabase,
  IconChartBar,
  IconEye,
  IconRefresh,
  IconPlayerPlay,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { CodeEditor } from '@/components/CodeEditor';
import { notifications } from '@mantine/notifications';
import { Node } from 'reactflow';
import { AGENT_TYPES, AgentType, AgentState } from '@/config/agents';

interface WorkflowNode extends Node {
  data: {
    label: string;
    type: string;
    capability?: {
      id: string;
      label: string;
    };
    agentType?: AgentType;
    config?: Record<string, any>;
    status?: string;
    customCode?: string;
    availableColumns?: string[];
  };
}

interface AgentNode {
  id: string;
  data: {
    label: string;
    type: string;
    capability?: {
      id: string;
      label: string;
    };
  };
  agentType: string;
  state: {
    status: 'idle' | 'learning' | 'working' | 'completed' | 'error';
    progress: number;
    insights?: string[];
  };
}

interface NodeConfigPanelProps {
  node: Node | null;
  onUpdate: (nodeId: string, data: any) => void;
  onExecute: (nodeId: string) => void;
  onDeployAgent?: (nodeId: string, agentType: string) => void;
  agents?: Record<string, AgentNode>;
}

type TabValue = 'config' | 'code' | 'preview';

export function NodeConfigPanel({
  node,
  onUpdate,
  onExecute,
  onDeployAgent,
  agents,
}: NodeConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('config');
  const [isExecuting, setIsExecuting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // If no node is selected, show a placeholder
  if (!node) {
    return (
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Stack gap="md" align="center" justify="center" h={200}>
          <Text c="dimmed" ta="center">
            Select a node to configure its settings
          </Text>
        </Stack>
      </Paper>
    );
  }

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await onExecute(node.id);
      notifications.show({
        title: 'Success',
        message: 'Node executed successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to execute node',
        color: 'red',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const renderConfigFields = () => {
    const capability = node?.data?.capability;
    if (!capability) return null;

    switch (capability.id) {
      case 'csv':
        return (
          <Stack gap="md">
            <TextInput
              label="File Path"
              value={node.data?.config?.path || ''}
              onChange={(e) => updateConfig('path', e.target.value)}
            />
            <Switch
              label="Has Header"
              checked={node.data?.config?.hasHeader || false}
              onChange={(e) => updateConfig('hasHeader', e.target.checked)}
            />
            <TextInput
              label="Delimiter"
              value={node.data?.config?.delimiter || ','}
              onChange={(e) => updateConfig('delimiter', e.target.value)}
            />
          </Stack>
        );

      case 'database':
        return (
          <Stack gap="md">
            <Select
              label="Database Type"
              data={[
                { value: 'postgresql', label: 'PostgreSQL' },
                { value: 'mysql', label: 'MySQL' },
                { value: 'mongodb', label: 'MongoDB' },
              ]}
              value={node.data?.config?.dbType || ''}
              onChange={(value) => updateConfig('dbType', value)}
            />
            <TextInput
              label="Connection String"
              value={node.data?.config?.connectionString || ''}
              onChange={(e) => updateConfig('connectionString', e.target.value)}
            />
            <TextInput
              label="Query"
              value={node.data?.config?.query || ''}
              onChange={(e) => updateConfig('query', e.target.value)}
            />
          </Stack>
        );

      case 'clean':
        return (
          <Stack gap="md">
            <MultiSelect
              label="Cleaning Operations"
              data={[
                { value: 'missing', label: 'Handle Missing Values' },
                { value: 'duplicates', label: 'Remove Duplicates' },
                { value: 'outliers', label: 'Handle Outliers' },
                { value: 'types', label: 'Fix Data Types' },
              ]}
              value={node.data?.config?.operations || []}
              onChange={(value) => updateConfig('operations', value)}
            />
            <JsonInput
              label="Custom Rules"
              value={JSON.stringify(node.data?.config?.rules || {}, null, 2)}
              onChange={(value) => updateConfig('rules', JSON.parse(value))}
              formatOnBlur
              autosize
              minRows={4}
            />
          </Stack>
        );

      case 'classification':
        return (
          <Stack gap="md">
            <Select
              label="Algorithm"
              data={[
                { value: 'logistic', label: 'Logistic Regression' },
                { value: 'rf', label: 'Random Forest' },
                { value: 'xgboost', label: 'XGBoost' },
                { value: 'nn', label: 'Neural Network' },
              ]}
              value={node.data?.config?.algorithm || ''}
              onChange={(value) => updateConfig('algorithm', value)}
            />
            <TextInput
              label="Target Column"
              value={node.data?.config?.target || ''}
              onChange={(e) => updateConfig('target', e.target.value)}
            />
            <MultiSelect
              label="Feature Columns"
              data={node.data?.availableColumns || []}
              value={node.data?.config?.features || []}
              onChange={(value) => updateConfig('features', value)}
            />
            <NumberInput
              label="Train/Test Split"
              value={node.data?.config?.splitRatio || 0.8}
              min={0.1}
              max={0.9}
              step={0.1}
              onChange={(value) => updateConfig('splitRatio', value)}
            />
          </Stack>
        );

      case 'charts':
        return (
          <Stack gap="md">
            <Select
              label="Chart Type"
              data={[
                { value: 'line', label: 'Line Chart' },
                { value: 'bar', label: 'Bar Chart' },
                { value: 'scatter', label: 'Scatter Plot' },
                { value: 'pie', label: 'Pie Chart' },
                { value: 'heatmap', label: 'Heatmap' },
              ]}
              value={node.data?.config?.chartType || ''}
              onChange={(value) => updateConfig('chartType', value)}
            />
            <TextInput
              label="X Axis"
              value={node.data?.config?.xAxis || ''}
              onChange={(e) => updateConfig('xAxis', e.target.value)}
            />
            <TextInput
              label="Y Axis"
              value={node.data?.config?.yAxis || ''}
              onChange={(e) => updateConfig('yAxis', e.target.value)}
            />
            <ColorInput
              label="Color Scheme"
              value={node.data?.config?.color || '#1c7ed6'}
              onChange={(value) => updateConfig('color', value)}
            />
          </Stack>
        );

      case 'agentNode':
        const agentType = node.data?.agentType as AgentType | undefined;
        const selectedAgent = agentType ? AGENT_TYPES[agentType] : undefined;
        
        return (
          <Stack gap="md">
            <Select
              label="Agent Type"
              data={Object.entries(AGENT_TYPES).map(([id, agent]) => ({
                value: id,
                label: agent.label,
                description: agent.description,
              }))}
              value={agentType}
              onChange={(value) => {
                if (value && onDeployAgent) {
                  onDeployAgent(node.id, value as AgentType);
                }
              }}
            />
            {selectedAgent && (
              <Stack gap="xs">
                <Text size="sm" fw={500}>Capabilities:</Text>
                {selectedAgent.capabilities.map((cap) => (
                  <Badge key={cap.id}>{cap.label}</Badge>
                ))}
              </Stack>
            )}
          </Stack>
        );

      default:
        return null;
    }
  };

  const updateConfig = (key: string, value: any) => {
    onUpdate(node.id, {
      ...node.data,
      config: {
        ...node.data?.config,
        [key]: value,
      },
    });
  };

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={500}>{node.data?.label || 'Node Configuration'}</Text>
          <Badge color={node.data?.status === 'executed' ? 'green' : 'blue'}>
            {node.data?.status || 'Not Executed'}
          </Badge>
        </Group>

        <Tabs 
          value={activeTab} 
          onChange={(value: string | null) => {
            if (value && (value === 'config' || value === 'code' || value === 'preview')) {
              setActiveTab(value);
            }
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="config" leftSection={<IconSettings size={14} />}>
              Configuration
            </Tabs.Tab>
            <Tabs.Tab value="code" leftSection={<IconCode size={14} />}>
              Custom Code
            </Tabs.Tab>
            <Tabs.Tab value="preview" leftSection={<IconEye size={14} />}>
              Preview
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="config" pt="md">
            <Stack gap="md">
              <Select
                label="Capability"
                data={node.type?.capabilities || []}
                value={node.data?.capability?.id}
                onChange={(value) => {
                  const capability = node.type?.capabilities.find((c: any) => c.id === value);
                  onUpdate(node.id, {
                    ...node.data,
                    capability,
                    config: {},
                  });
                }}
              />
              {renderConfigFields()}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="code" pt="md">
            <CodeEditor
              defaultLanguage="python"
              defaultValue={node.data?.customCode || '# Custom transformation code here'}
              onExecute={(code) => updateConfig('customCode', code)}
            />
          </Tabs.Panel>

          <Tabs.Panel value="preview" pt="md">
            {previewData ? (
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Data Preview</Text>
                  <Tooltip label="Refresh Preview">
                    <ActionIcon variant="light" onClick={() => handleExecute()}>
                      <IconRefresh size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Code block>{JSON.stringify(previewData, null, 2)}</Code>
              </Stack>
            ) : (
              <Text c="dimmed">Execute the node to see data preview</Text>
            )}
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end">
          <Button
            variant="light"
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={() => {
              notifications.show({
                title: 'Success',
                message: 'Configuration saved',
                color: 'green',
              });
            }}
          >
            Save
          </Button>
          <Button
            leftSection={<IconPlayerPlay size={16} />}
            loading={isExecuting}
            onClick={handleExecute}
          >
            Execute
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
} 
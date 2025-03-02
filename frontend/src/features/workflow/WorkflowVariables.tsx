import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Text,
  Group,
  Button,
  TextInput,
  Select,
  Card,
  Badge,
  ActionIcon,
  Tooltip,
  Modal,
  JsonInput,
  Switch,
  Tabs,
  Code,
  Accordion,
} from '@mantine/core';
import {
  IconVariable,
  IconPlus,
  IconTrash,
  IconPencil,
  IconEye,
  IconEyeOff,
  IconLock,
  IconKey,
  IconRefresh,
  IconCopy,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';

interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'secret';
  value: any;
  description?: string;
  isSecret: boolean;
  scope: 'global' | 'workflow' | 'node';
  nodeId?: string;
}

interface EnvironmentConfig {
  name: string;
  variables: {
    [key: string]: string;
  };
  isActive: boolean;
}

interface WorkflowVariablesProps {
  variables: WorkflowVariable[];
  environments: EnvironmentConfig[];
  onAddVariable: (variable: WorkflowVariable) => void;
  onUpdateVariable: (id: string, variable: Partial<WorkflowVariable>) => void;
  onDeleteVariable: (id: string) => void;
  onAddEnvironment: (env: EnvironmentConfig) => void;
  onUpdateEnvironment: (name: string, env: Partial<EnvironmentConfig>) => void;
  onDeleteEnvironment: (name: string) => void;
  onActivateEnvironment: (name: string) => void;
}

const SAMPLE_VARIABLES: WorkflowVariable[] = [
  {
    id: '1',
    name: 'API_KEY',
    type: 'secret',
    value: '********',
    description: 'API Key for external service',
    isSecret: true,
    scope: 'global',
  },
  {
    id: '2',
    name: 'MAX_RETRIES',
    type: 'number',
    value: 3,
    description: 'Maximum number of retry attempts',
    isSecret: false,
    scope: 'workflow',
  },
];

const SAMPLE_ENVIRONMENTS: EnvironmentConfig[] = [
  {
    name: 'Development',
    variables: {
      API_URL: 'http://localhost:3000',
      DEBUG: 'true',
    },
    isActive: true,
  },
  {
    name: 'Production',
    variables: {
      API_URL: 'https://api.example.com',
      DEBUG: 'false',
    },
    isActive: false,
  },
];

export function WorkflowVariables({
  variables = SAMPLE_VARIABLES,
  environments = SAMPLE_ENVIRONMENTS,
  onAddVariable,
  onUpdateVariable,
  onDeleteVariable,
  onAddEnvironment,
  onUpdateEnvironment,
  onDeleteEnvironment,
  onActivateEnvironment,
}: WorkflowVariablesProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedVariable, setSelectedVariable] = useState<WorkflowVariable | null>(null);
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());
  const [envModalOpened, { open: openEnvModal, close: closeEnvModal }] = useDisclosure(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentConfig | null>(null);

  const toggleSecret = (id: string) => {
    const newShowSecrets = new Set(showSecrets);
    if (newShowSecrets.has(id)) {
      newShowSecrets.delete(id);
    } else {
      newShowSecrets.add(id);
    }
    setShowSecrets(newShowSecrets);
  };

  const renderVariableValue = (variable: WorkflowVariable) => {
    if (variable.isSecret) {
      return showSecrets.has(variable.id) ? variable.value : '********';
    }

    if (variable.type === 'json') {
      return (
        <Code block>
          {JSON.stringify(variable.value, null, 2)}
        </Code>
      );
    }

    return String(variable.value);
  };

  return (
    <>
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Stack gap="md">
          <Tabs defaultValue="variables">
            <Tabs.List>
              <Tabs.Tab
                value="variables"
                leftSection={<IconVariable size={14} />}
              >
                Variables
              </Tabs.Tab>
              <Tabs.Tab
                value="environments"
                leftSection={<IconKey size={14} />}
              >
                Environments
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="variables" pt="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Workflow Variables</Text>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => {
                      setSelectedVariable({
                        id: '',
                        name: '',
                        type: 'string',
                        value: '',
                        isSecret: false,
                        scope: 'workflow',
                      });
                      open();
                    }}
                  >
                    Add Variable
                  </Button>
                </Group>

                <Stack gap="sm">
                  {variables.map((variable) => (
                    <Card key={variable.id} withBorder>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Group gap="xs">
                            <Text fw={500}>{variable.name}</Text>
                            <Badge>{variable.type}</Badge>
                            <Badge color={variable.scope === 'global' ? 'blue' : 'green'}>
                              {variable.scope}
                            </Badge>
                            {variable.isSecret && (
                              <Badge color="red" leftSection={<IconLock size={12} />}>
                                Secret
                              </Badge>
                            )}
                          </Group>
                          <Group gap="xs">
                            {variable.isSecret && (
                              <Tooltip label={showSecrets.has(variable.id) ? 'Hide Value' : 'Show Value'}>
                                <ActionIcon
                                  variant="light"
                                  onClick={() => toggleSecret(variable.id)}
                                >
                                  {showSecrets.has(variable.id) ? (
                                    <IconEyeOff size={16} />
                                  ) : (
                                    <IconEye size={16} />
                                  )}
                                </ActionIcon>
                              </Tooltip>
                            )}
                            <Tooltip label="Edit">
                              <ActionIcon
                                variant="light"
                                onClick={() => {
                                  setSelectedVariable(variable);
                                  open();
                                }}
                              >
                                <IconPencil size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Delete">
                              <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this variable?')) {
                                    onDeleteVariable(variable.id);
                                  }
                                }}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>

                        {variable.description && (
                          <Text size="sm" c="dimmed">
                            {variable.description}
                          </Text>
                        )}

                        <Text size="sm">
                          Value: {renderVariableValue(variable)}
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="environments" pt="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Environments</Text>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => {
                      setSelectedEnvironment({
                        name: '',
                        variables: {},
                        isActive: false,
                      });
                      openEnvModal();
                    }}
                  >
                    Add Environment
                  </Button>
                </Group>

                <Stack gap="sm">
                  {environments.map((env) => (
                    <Card key={env.name} withBorder>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Group gap="xs">
                            <Text fw={500}>{env.name}</Text>
                            {env.isActive && (
                              <Badge color="green">Active</Badge>
                            )}
                          </Group>
                          <Group gap="xs">
                            <Button
                              variant="light"
                              size="xs"
                              onClick={() => onActivateEnvironment(env.name)}
                              disabled={env.isActive}
                            >
                              Activate
                            </Button>
                            <Tooltip label="Edit">
                              <ActionIcon
                                variant="light"
                                onClick={() => {
                                  setSelectedEnvironment(env);
                                  openEnvModal();
                                }}
                              >
                                <IconPencil size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Delete">
                              <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to delete this environment?')) {
                                    onDeleteEnvironment(env.name);
                                  }
                                }}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>

                        <Accordion>
                          <Accordion.Item value="variables">
                            <Accordion.Control>
                              Environment Variables
                            </Accordion.Control>
                            <Accordion.Panel>
                              <Stack gap="xs">
                                {Object.entries(env.variables).map(([key, value]) => (
                                  <Group key={key} justify="space-between">
                                    <Text size="sm" fw={500}>{key}</Text>
                                    <Text size="sm">{value}</Text>
                                  </Group>
                                ))}
                              </Stack>
                            </Accordion.Panel>
                          </Accordion.Item>
                        </Accordion>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Paper>

      <Modal
        opened={opened}
        onClose={close}
        title={selectedVariable?.id ? 'Edit Variable' : 'Add Variable'}
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            required
            value={selectedVariable?.name}
            onChange={(e) => setSelectedVariable(prev => prev && {
              ...prev,
              name: e.currentTarget.value,
            })}
          />

          <Select
            label="Type"
            required
            data={[
              { value: 'string', label: 'String' },
              { value: 'number', label: 'Number' },
              { value: 'boolean', label: 'Boolean' },
              { value: 'json', label: 'JSON' },
              { value: 'secret', label: 'Secret' },
            ]}
            value={selectedVariable?.type}
            onChange={(value) => {
              if (value === 'string' || value === 'number' || value === 'boolean' || value === 'json' || value === 'secret') {
                setSelectedVariable(prev => prev && {
                  ...prev,
                  type: value,
                  value: '',
                  isSecret: value === 'secret',
                });
              }
            }}
          />

          {selectedVariable?.type === 'json' ? (
            <JsonInput
              label="Value"
              required
              formatOnBlur
              autosize
              minRows={4}
              value={typeof selectedVariable.value === 'string' ? selectedVariable.value : JSON.stringify(selectedVariable.value, null, 2)}
              onChange={(value) => {
                try {
                  setSelectedVariable(prev => prev && {
                    ...prev,
                    value: JSON.parse(value),
                  });
                } catch (e) {
                  // Invalid JSON, store as string
                  setSelectedVariable(prev => prev && {
                    ...prev,
                    value,
                  });
                }
              }}
            />
          ) : (
            <TextInput
              label="Value"
              required
              type={selectedVariable?.type === 'number' ? 'number' : 'text'}
              value={selectedVariable?.value}
              onChange={(e) => setSelectedVariable(prev => prev && {
                ...prev,
                value: prev.type === 'number' ? Number(e.currentTarget.value) : e.currentTarget.value,
              })}
            />
          )}

          <TextInput
            label="Description"
            value={selectedVariable?.description}
            onChange={(e) => setSelectedVariable(prev => prev && {
              ...prev,
              description: e.currentTarget.value,
            })}
          />

          <Select
            label="Scope"
            required
            data={[
              { value: 'global', label: 'Global' },
              { value: 'workflow', label: 'Workflow' },
              { value: 'node', label: 'Node' },
            ]}
            value={selectedVariable?.scope}
            onChange={(value) => {
              if (value === 'global' || value === 'workflow' || value === 'node') {
                setSelectedVariable(prev => prev && {
                  ...prev,
                  scope: value,
                });
              }
            }}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={close}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedVariable) {
                  if (selectedVariable.id) {
                    onUpdateVariable(selectedVariable.id, selectedVariable);
                  } else {
                    onAddVariable({
                      ...selectedVariable,
                      id: Math.random().toString(36).substr(2, 9),
                    });
                  }
                  close();
                }
              }}
            >
              {selectedVariable?.id ? 'Update' : 'Add'} Variable
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={envModalOpened}
        onClose={closeEnvModal}
        title={selectedEnvironment?.name ? 'Edit Environment' : 'Add Environment'}
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            required
            value={selectedEnvironment?.name}
            onChange={(e) => setSelectedEnvironment(prev => prev && {
              ...prev,
              name: e.currentTarget.value,
            })}
          />

          <JsonInput
            label="Variables"
            required
            formatOnBlur
            autosize
            minRows={6}
            value={JSON.stringify(selectedEnvironment?.variables || {}, null, 2)}
            onChange={(value) => {
              try {
                setSelectedEnvironment(prev => prev && {
                  ...prev,
                  variables: JSON.parse(value),
                });
              } catch (e) {
                // Invalid JSON, ignore
              }
            }}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeEnvModal}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedEnvironment) {
                  if (selectedEnvironment.name) {
                    onUpdateEnvironment(selectedEnvironment.name, selectedEnvironment);
                  } else {
                    onAddEnvironment(selectedEnvironment);
                  }
                  closeEnvModal();
                }
              }}
            >
              {selectedEnvironment?.name ? 'Update' : 'Add'} Environment
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
} 
import React, { useState } from 'react';
import { 
  Paper, 
  Title, 
  Text, 
  TextInput, 
  Button, 
  Group, 
  Stack, 
  Table, 
  ActionIcon, 
  Menu, 
  Select, 
  Modal,
  Divider,
  Badge,
  Tooltip,
  ScrollArea
} from '@mantine/core';
import { 
  IconPlus, 
  IconTrash, 
  IconEdit, 
  IconDots, 
  IconCopy, 
  IconLock, 
  IconLockOpen,
  IconEye,
  IconEyeOff,
  IconUpload,
  IconDownload,
  IconVariable
} from '@tabler/icons-react';
import { useWorkflow } from '../../WorkflowContext';

// Variable types
const VARIABLE_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'array', label: 'Array' },
  { value: 'object', label: 'Object' },
  { value: 'secret', label: 'Secret' }
];

// Sample variables
const SAMPLE_VARIABLES = [
  { 
    id: '1', 
    name: 'API_KEY', 
    value: 'sk-1234567890abcdef', 
    type: 'secret', 
    description: 'API key for external service',
    isSecret: true,
    isLocked: true
  },
  { 
    id: '2', 
    name: 'MAX_ITEMS', 
    value: '100', 
    type: 'number', 
    description: 'Maximum number of items to process',
    isSecret: false,
    isLocked: false
  },
  { 
    id: '3', 
    name: 'BASE_URL', 
    value: 'https://api.example.com', 
    type: 'string', 
    description: 'Base URL for API calls',
    isSecret: false,
    isLocked: false
  },
  { 
    id: '4', 
    name: 'ENABLE_LOGGING', 
    value: 'true', 
    type: 'boolean', 
    description: 'Whether to enable detailed logging',
    isSecret: false,
    isLocked: true
  },
  { 
    id: '5', 
    name: 'ALLOWED_DOMAINS', 
    value: '["example.com", "test.com"]', 
    type: 'array', 
    description: 'List of allowed domains',
    isSecret: false,
    isLocked: false
  }
];

interface Variable {
  id: string;
  name: string;
  value: string;
  type: string;
  description: string;
  isSecret: boolean;
  isLocked: boolean;
}

interface WorkflowVariablesProps {
  onVariableChange?: (variables: Variable[]) => void;
}

export const WorkflowVariables: React.FC<WorkflowVariablesProps> = ({
  onVariableChange
}) => {
  const [variables, setVariables] = useState<Variable[]>(SAMPLE_VARIABLES);
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  
  // Add a new variable
  const handleAddVariable = () => {
    const newVariable: Variable = {
      id: Date.now().toString(),
      name: '',
      value: '',
      type: 'string',
      description: '',
      isSecret: false,
      isLocked: false
    };
    
    setEditingVariable(newVariable);
    setIsModalOpen(true);
  };
  
  // Edit an existing variable
  const handleEditVariable = (variable: Variable) => {
    setEditingVariable({ ...variable });
    setIsModalOpen(true);
  };
  
  // Delete a variable
  const handleDeleteVariable = (id: string) => {
    setVariables(variables.filter(v => v.id !== id));
    
    if (onVariableChange) {
      onVariableChange(variables.filter(v => v.id !== id));
    }
  };
  
  // Toggle variable lock
  const handleToggleLock = (id: string) => {
    setVariables(variables.map(v => 
      v.id === id ? { ...v, isLocked: !v.isLocked } : v
    ));
    
    if (onVariableChange) {
      onVariableChange(variables.map(v => 
        v.id === id ? { ...v, isLocked: !v.isLocked } : v
      ));
    }
  };
  
  // Toggle variable secret status
  const handleToggleSecret = (id: string) => {
    setVariables(variables.map(v => 
      v.id === id ? { ...v, isSecret: !v.isSecret } : v
    ));
    
    if (onVariableChange) {
      onVariableChange(variables.map(v => 
        v.id === id ? { ...v, isSecret: !v.isSecret } : v
      ));
    }
  };
  
  // Save variable from modal
  const handleSaveVariable = () => {
    if (!editingVariable) return;
    
    if (editingVariable.id && variables.some(v => v.id === editingVariable.id)) {
      // Update existing variable
      setVariables(variables.map(v => 
        v.id === editingVariable.id ? editingVariable : v
      ));
    } else {
      // Add new variable
      setVariables([...variables, editingVariable]);
    }
    
    if (onVariableChange) {
      onVariableChange(
        editingVariable.id && variables.some(v => v.id === editingVariable.id)
          ? variables.map(v => v.id === editingVariable.id ? editingVariable : v)
          : [...variables, editingVariable]
      );
    }
    
    setIsModalOpen(false);
    setEditingVariable(null);
  };
  
  // Export variables as JSON
  const handleExportVariables = () => {
    const dataStr = JSON.stringify(variables, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = 'workflow-variables.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Import variables from JSON
  const handleImportVariables = () => {
    try {
      const importedVariables = JSON.parse(importText);
      
      if (Array.isArray(importedVariables)) {
        setVariables(importedVariables);
        
        if (onVariableChange) {
          onVariableChange(importedVariables);
        }
        
        setImportModalOpen(false);
        setImportText('');
      } else {
        alert('Invalid JSON format. Expected an array of variables.');
      }
    } catch (error) {
      alert(`Error parsing JSON: ${error}`);
    }
  };
  
  // Format variable value for display
  const formatVariableValue = (variable: Variable) => {
    if (variable.isSecret && !showSecrets) {
      return '••••••••••••••••';
    }
    
    switch (variable.type) {
      case 'boolean':
        return variable.value === 'true' ? 'true' : 'false';
      case 'array':
      case 'object':
        try {
          return JSON.stringify(JSON.parse(variable.value)).substring(0, 30) + 
            (JSON.stringify(JSON.parse(variable.value)).length > 30 ? '...' : '');
        } catch {
          return variable.value;
        }
      default:
        return variable.value;
    }
  };
  
  return (
    <>
      <Paper p="md" withBorder>
        <Group mb="md" position="apart">
          <Title order={4}>Workflow Variables</Title>
          <Group>
            <Button 
              variant="light" 
              leftSection={<IconUpload size={16} />}
              onClick={() => setImportModalOpen(true)}
            >
              Import
            </Button>
            <Button 
              variant="light" 
              leftSection={<IconDownload size={16} />}
              onClick={handleExportVariables}
            >
              Export
            </Button>
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={handleAddVariable}
            >
              Add Variable
            </Button>
          </Group>
        </Group>
        
        <Text size="sm" c="dimmed" mb="md">
          Variables can be used in your workflow nodes using the syntax <code>${'{VARIABLE_NAME}'}</code>
        </Text>
        
        <ScrollArea h={400}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Value</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th style={{ width: 120 }}>
                  <Group position="apart">
                    <Text>Actions</Text>
                    <Tooltip label={showSecrets ? "Hide secrets" : "Show secrets"}>
                      <ActionIcon 
                        size="sm" 
                        onClick={() => setShowSecrets(!showSecrets)}
                      >
                        {showSecrets ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {variables.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                    <Text c="dimmed">No variables defined</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                variables.map((variable) => (
                  <Table.Tr key={variable.id}>
                    <Table.Td>
                      <Group spacing="xs">
                        {variable.isLocked && (
                          <IconLock size={14} style={{ opacity: 0.5 }} />
                        )}
                        <Text fw={500}>{variable.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text 
                        style={{ 
                          fontFamily: 'monospace',
                          opacity: variable.isSecret && !showSecrets ? 0.5 : 1
                        }}
                      >
                        {formatVariableValue(variable)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        color={
                          variable.type === 'secret' ? 'red' :
                          variable.type === 'number' ? 'blue' :
                          variable.type === 'boolean' ? 'green' :
                          variable.type === 'array' || variable.type === 'object' ? 'violet' :
                          'gray'
                        }
                      >
                        {variable.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={1}>
                        {variable.description || '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group spacing="xs" position="right">
                        <Tooltip label={variable.isSecret ? "Mark as non-secret" : "Mark as secret"}>
                          <ActionIcon 
                            size="sm" 
                            color={variable.isSecret ? "red" : "gray"}
                            onClick={() => handleToggleSecret(variable.id)}
                          >
                            {variable.isSecret ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit">
                          <ActionIcon 
                            size="sm" 
                            color="blue"
                            onClick={() => handleEditVariable(variable)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon 
                            size="sm" 
                            color="red"
                            onClick={() => handleDeleteVariable(variable.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
      
      {/* Edit/Add Variable Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVariable(null);
        }}
        title={
          <Group>
            <IconVariable size={20} />
            <Text>{editingVariable?.id ? 'Edit Variable' : 'Add Variable'}</Text>
          </Group>
        }
        size="md"
      >
        {editingVariable && (
          <Stack>
            <TextInput
              label="Name"
              placeholder="VARIABLE_NAME"
              description="Use uppercase letters and underscores for best practices"
              value={editingVariable.name}
              onChange={(e) => setEditingVariable({
                ...editingVariable,
                name: e.currentTarget.value.toUpperCase().replace(/\s+/g, '_')
              })}
              required
            />
            
            <TextInput
              label="Value"
              placeholder="Variable value"
              value={editingVariable.value}
              onChange={(e) => setEditingVariable({
                ...editingVariable,
                value: e.currentTarget.value
              })}
              type={editingVariable.isSecret && !showSecrets ? 'password' : 'text'}
              required
            />
            
            <Select
              label="Type"
              placeholder="Select variable type"
              data={VARIABLE_TYPES}
              value={editingVariable.type}
              onChange={(value) => setEditingVariable({
                ...editingVariable,
                type: value || 'string',
                isSecret: value === 'secret' ? true : editingVariable.isSecret
              })}
              required
            />
            
            <TextInput
              label="Description"
              placeholder="Optional description"
              value={editingVariable.description}
              onChange={(e) => setEditingVariable({
                ...editingVariable,
                description: e.currentTarget.value
              })}
            />
            
            <Group>
              <Tooltip label={editingVariable.isSecret ? "Variables marked as secret will be masked in logs and UI" : "Mark as secret to hide sensitive data"}>
                <Button 
                  variant={editingVariable.isSecret ? "filled" : "light"}
                  color={editingVariable.isSecret ? "red" : "gray"}
                  leftSection={editingVariable.isSecret ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                  onClick={() => setEditingVariable({
                    ...editingVariable,
                    isSecret: !editingVariable.isSecret
                  })}
                >
                  {editingVariable.isSecret ? "Secret" : "Mark as Secret"}
                </Button>
              </Tooltip>
              
              <Tooltip label={editingVariable.isLocked ? "Locked variables cannot be modified during workflow execution" : "Lock to prevent modification during execution"}>
                <Button 
                  variant={editingVariable.isLocked ? "filled" : "light"}
                  color={editingVariable.isLocked ? "blue" : "gray"}
                  leftSection={editingVariable.isLocked ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                  onClick={() => setEditingVariable({
                    ...editingVariable,
                    isLocked: !editingVariable.isLocked
                  })}
                >
                  {editingVariable.isLocked ? "Locked" : "Lock Variable"}
                </Button>
              </Tooltip>
            </Group>
            
            <Divider my="sm" />
            
            <Group position="right">
              <Button 
                variant="light" 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingVariable(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveVariable}>
                Save Variable
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
      
      {/* Import Variables Modal */}
      <Modal
        opened={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Variables"
        size="lg"
      >
        <Stack>
          <Text size="sm">
            Paste JSON array of variables to import. This will replace all existing variables.
          </Text>
          
          <TextInput
            placeholder="Paste JSON here"
            value={importText}
            onChange={(e) => setImportText(e.currentTarget.value)}
            multiline
            minRows={10}
          />
          
          <Group position="right">
            <Button 
              variant="light" 
              onClick={() => setImportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImportVariables}
              disabled={!importText.trim()}
            >
              Import Variables
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default WorkflowVariables; 
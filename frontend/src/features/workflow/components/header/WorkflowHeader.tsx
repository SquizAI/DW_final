import React, { useState, useRef, useEffect } from 'react';
import { Group, Title, Text, Button, Tooltip, ActionIcon, Menu, rem, ThemeIcon, Kbd, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconDeviceFloppy, 
  IconPlayerPlay, 
  IconPlayerStop, 
  IconDots, 
  IconUpload, 
  IconDownload, 
  IconShare, 
  IconRobot, 
  IconTrash, 
  IconLayoutDashboard,
  IconHistory,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconKeyboard,
  IconEdit,
  IconCheck,
  IconCode
} from '@tabler/icons-react';
import { useWorkflow } from '../../WorkflowContext';
import { useNavigate } from 'react-router-dom';

interface WorkflowHeaderProps {
  onOpenSaveModal: () => void;
  onOpenAgentTopology: () => void;
  onTriggerFileUpload: () => void;
  isSaving: boolean;
}

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  onOpenSaveModal,
  onOpenAgentTopology,
  onTriggerFileUpload,
  isSaving
}) => {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempWorkflowName, setTempWorkflowName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const { 
    workflowName, 
    workflowId, 
    isExecuting, 
    executeWorkflow, 
    createNewWorkflow,
    setWorkflowName
  } = useWorkflow();

  // Set initial temp name when workflowName changes
  useEffect(() => {
    setTempWorkflowName(workflowName);
  }, [workflowName]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingName]);

  // Handle execute workflow button click
  const handleExecute = async () => {
    // If workflow is not saved yet, open save modal first
    if (!workflowId) {
      onOpenSaveModal();
      return;
    }
    
    try {
      // Use the executeWorkflow function from the context
      await executeWorkflow();
    } catch (error: any) {
      console.error('Error executing workflow:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to execute workflow',
        color: 'red',
      });
    }
  };
  
  // Handle stop execution button click
  const handleStop = async () => {
    // This would be implemented to stop execution
    // For now, we'll just show a notification
    notifications.show({
      title: 'Info',
      message: 'Workflow execution stopped',
      color: 'blue',
    });
  };

  // Handle workflow name edit
  const startEditingName = () => {
    setEditingName(true);
  };

  const saveWorkflowName = () => {
    if (tempWorkflowName.trim()) {
      setWorkflowName(tempWorkflowName.trim());
      setEditingName(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveWorkflowName();
    } else if (e.key === 'Escape') {
      setTempWorkflowName(workflowName);
      setEditingName(false);
    }
  };

  // Navigate to dashboard
  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  // Keyboard shortcuts
  const keyboardShortcuts = [
    { key: 'Ctrl+S', description: 'Save workflow' },
    { key: 'Ctrl+E', description: 'Execute workflow' },
    { key: 'Ctrl+Z', description: 'Undo' },
    { key: 'Ctrl+Y', description: 'Redo' },
    { key: 'Delete', description: 'Delete selected node' },
    { key: 'Ctrl+A', description: 'Select all nodes' },
    { key: 'Ctrl+D', description: 'Duplicate selected node' },
    { key: 'Ctrl+F', description: 'Search nodes' },
    { key: 'Ctrl+Space', description: 'Open node library' },
    { key: 'Esc', description: 'Deselect all' },
  ];

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Tooltip label="Back to Dashboard">
          <ActionIcon 
            variant="light" 
            onClick={navigateToDashboard}
            aria-label="Back to Dashboard"
          >
            <IconLayoutDashboard style={{ width: rem(20), height: rem(20) }} />
          </ActionIcon>
        </Tooltip>
        
        <Title order={3}>Workflow Editor</Title>
        
        {editingName ? (
          <Group gap="xs">
            <TextInput
              ref={nameInputRef}
              value={tempWorkflowName}
              onChange={(e) => setTempWorkflowName(e.currentTarget.value)}
              onKeyDown={handleNameKeyDown}
              placeholder="Enter workflow name"
              size="sm"
              style={{ width: '200px' }}
            />
            <ActionIcon 
              variant="light" 
              color="green" 
              onClick={saveWorkflowName}
            >
              <IconCheck size={16} />
            </ActionIcon>
          </Group>
        ) : (
          <Group gap="xs">
            <Text c="dimmed">{workflowName || 'Untitled Workflow'}</Text>
            <ActionIcon 
              variant="subtle" 
              onClick={startEditingName}
              size="sm"
            >
              <IconEdit size={14} />
            </ActionIcon>
          </Group>
        )}
      </Group>
      
      <Group>
        <Tooltip label="Keyboard Shortcuts (Ctrl+K)">
          <ActionIcon 
            variant="light" 
            onClick={() => setShowKeyboardShortcuts(true)}
            aria-label="Keyboard shortcuts"
          >
            <IconKeyboard style={{ width: rem(20), height: rem(20) }} />
          </ActionIcon>
        </Tooltip>
        
        <Tooltip label="Undo (Ctrl+Z)">
          <ActionIcon variant="light" aria-label="Undo">
            <IconArrowBackUp style={{ width: rem(20), height: rem(20) }} />
          </ActionIcon>
        </Tooltip>
        
        <Tooltip label="Redo (Ctrl+Y)">
          <ActionIcon variant="light" aria-label="Redo">
            <IconArrowForwardUp style={{ width: rem(20), height: rem(20) }} />
          </ActionIcon>
        </Tooltip>
        
        <Tooltip label="Save Workflow (Ctrl+S)">
          <Button
            variant="light"
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={onOpenSaveModal}
            loading={isSaving}
          >
            Save
          </Button>
        </Tooltip>
        
        <Tooltip label={isExecuting ? "Stop Execution (Esc)" : "Execute Workflow (Ctrl+E)"}>
          <Button
            color={isExecuting ? "red" : "green"}
            leftSection={
              isExecuting ? <IconPlayerStop size={16} /> : <IconPlayerPlay size={16} />
            }
            onClick={isExecuting ? handleStop : handleExecute}
          >
            {isExecuting ? "Stop" : "Execute"}
          </Button>
        </Tooltip>
        
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="light">
              <IconDots style={{ width: rem(20), height: rem(20) }} />
            </ActionIcon>
          </Menu.Target>
          
          <Menu.Dropdown>
            <Menu.Label>Workflow</Menu.Label>
            <Menu.Item 
              leftSection={<IconUpload size={14} />}
              onClick={onTriggerFileUpload}
            >
              Import Dataset
            </Menu.Item>
            <Menu.Item leftSection={<IconDownload size={14} />}>
              Export Workflow
            </Menu.Item>
            <Menu.Item leftSection={<IconShare size={14} />}>
              Share Workflow
            </Menu.Item>
            
            <Menu.Divider />
            
            <Menu.Label>Integrations</Menu.Label>
            <Menu.Item 
              leftSection={<IconCode size={14} />}
              component="a"
              href="https://colab.research.google.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Colab
            </Menu.Item>
            <Menu.Item 
              leftSection={<IconCode size={14} />}
              onClick={() => window.open('https://colab.research.google.com/import', '_blank')}
            >
              Import from Colab
            </Menu.Item>
            
            <Menu.Divider />
            
            <Menu.Label>Tools</Menu.Label>
            <Menu.Item 
              leftSection={<IconRobot size={14} />}
              onClick={onOpenAgentTopology}
            >
              Agent Topology
            </Menu.Item>
            
            <Menu.Divider />
            
            <Menu.Item 
              leftSection={<IconTrash size={14} />} 
              color="red"
              onClick={createNewWorkflow}
            >
              New Workflow
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
};

export default WorkflowHeader; 
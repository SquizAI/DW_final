import React from 'react';
import { 
  Modal, 
  Stack, 
  TextInput, 
  Textarea, 
  Group, 
  Button, 
  ThemeIcon, 
  Text,
  Box,
  Table,
  Kbd,
  Divider
} from '@mantine/core';
import { 
  IconDeviceFloppy, 
  IconRobot, 
  IconKeyboard 
} from '@tabler/icons-react';
import { useWorkflow } from '../../WorkflowContext';
import { AgentTopology } from '../../agents/AgentTopology';

interface SaveWorkflowModalProps {
  opened: boolean;
  onClose: () => void;
  isSaving: boolean;
}

export const SaveWorkflowModal: React.FC<SaveWorkflowModalProps> = ({
  opened,
  onClose,
  isSaving
}) => {
  const { 
    workflowName, 
    workflowDescription, 
    setWorkflowName, 
    setWorkflowDescription, 
    saveWorkflow 
  } = useWorkflow();
  
  const handleSave = async () => {
    try {
      await saveWorkflow();
      onClose();
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };
  
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <ThemeIcon size="lg" radius="md" variant="light" color="blue">
            <IconDeviceFloppy size={20} />
          </ThemeIcon>
          <Text fw={700}>Save Workflow</Text>
        </Group>
      }
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Workflow Name"
          placeholder="Enter workflow name"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.currentTarget.value)}
          required
        />
        
        <Textarea
          label="Description"
          placeholder="Enter workflow description"
          value={workflowDescription}
          onChange={(e) => setWorkflowDescription(e.currentTarget.value)}
          minRows={3}
        />
        
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave}
            loading={isSaving}
          >
            Save Workflow
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

interface AgentTopologyModalProps {
  opened: boolean;
  onClose: () => void;
}

export const AgentTopologyModal: React.FC<AgentTopologyModalProps> = ({
  opened,
  onClose
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <ThemeIcon size="lg" radius="md" variant="light" color="blue">
            <IconRobot size={20} />
          </ThemeIcon>
          <Text fw={700}>Agent Topology Visualization</Text>
        </Group>
      }
      size="90%"
      styles={{ body: { height: 'calc(90vh - 130px)' } }}
    >
      <Box h="100%">
        <AgentTopology
          onClose={onClose}
        />
      </Box>
    </Modal>
  );
};

interface KeyboardShortcutsModalProps {
  opened: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  opened,
  onClose
}) => {
  const shortcuts = [
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
    { key: 'Ctrl+K', description: 'Show keyboard shortcuts' },
    { key: 'Ctrl+U', description: 'Upload dataset' },
    { key: 'Ctrl+N', description: 'New workflow' },
    { key: '+', description: 'Zoom in' },
    { key: '-', description: 'Zoom out' },
    { key: '0', description: 'Reset zoom' },
  ];
  
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <ThemeIcon size="lg" radius="md" variant="light" color="blue">
            <IconKeyboard size={20} />
          </ThemeIcon>
          <Text fw={700}>Keyboard Shortcuts</Text>
        </Group>
      }
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Use these keyboard shortcuts to speed up your workflow creation process.
        </Text>
        
        <Divider />
        
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Shortcut</Table.Th>
              <Table.Th>Description</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {shortcuts.map((shortcut) => (
              <Table.Tr key={shortcut.key}>
                <Table.Td>
                  <Kbd>{shortcut.key}</Kbd>
                </Table.Td>
                <Table.Td>{shortcut.description}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        
        <Group justify="center" mt="md">
          <Button onClick={onClose}>Close</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

interface WorkflowModalsProps {
  saveModalOpened: boolean;
  onSaveModalClose: () => void;
  agentTopologyOpened: boolean;
  onAgentTopologyClose: () => void;
  keyboardShortcutsOpened: boolean;
  onKeyboardShortcutsClose: () => void;
  isSaving: boolean;
}

export const WorkflowModals: React.FC<WorkflowModalsProps> = ({
  saveModalOpened,
  onSaveModalClose,
  agentTopologyOpened,
  onAgentTopologyClose,
  keyboardShortcutsOpened,
  onKeyboardShortcutsClose,
  isSaving
}) => {
  return (
    <>
      <SaveWorkflowModal 
        opened={saveModalOpened} 
        onClose={onSaveModalClose} 
        isSaving={isSaving} 
      />
      
      <AgentTopologyModal 
        opened={agentTopologyOpened} 
        onClose={onAgentTopologyClose} 
      />
      
      <KeyboardShortcutsModal 
        opened={keyboardShortcutsOpened} 
        onClose={onKeyboardShortcutsClose} 
      />
    </>
  );
};

export default WorkflowModals; 
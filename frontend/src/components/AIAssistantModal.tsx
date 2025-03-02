import React from 'react';
import { Modal, Stack, Text, Group, ThemeIcon } from '@mantine/core';
import { IconBrain } from '@tabler/icons-react';

interface AIAssistantModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AIAssistantModal({ opened, onClose }: AIAssistantModalProps) {
  return (
    <Modal 
      opened={opened} 
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon size="lg" radius="md" variant="light" color="blue">
            <IconBrain size={20} />
          </ThemeIcon>
          <Text fw={500}>AI Assistant</Text>
        </Group>
      }
      size="lg"
    >
      <Stack gap="md">
        <Text>
          I'm your AI assistant, ready to help you with any task in the application.
          You can ask me to:
        </Text>
        <Stack gap="xs">
          <Text size="sm">• Create and manage workflows</Text>
          <Text size="sm">• Analyze data and generate insights</Text>
          <Text size="sm">• Configure project settings</Text>
          <Text size="sm">• Generate reports and visualizations</Text>
          <Text size="sm">• Automate repetitive tasks</Text>
        </Stack>
        <Text size="sm" c="dimmed">
          Just type your request below and I'll help you get it done.
        </Text>
        {/* Add AI chat interface here */}
      </Stack>
    </Modal>
  );
} 
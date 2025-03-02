import { useState } from 'react';
import { Paper, TextInput, Button, Text, Stack, ScrollArea, Box, Group, Loader } from '@mantine/core';
import { IconSend, IconRobot, IconUser } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { Node, Edge } from 'reactflow';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface WorkflowAIChatProps {
  nodes: Node[];
  edges: Edge[];
  onSuggestedWorkflow?: (nodes: Node[], edges: Edge[]) => void;
}

export function WorkflowAIChat({ nodes, edges, onSuggestedWorkflow }: WorkflowAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/ai/analyze-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          workflow: {
            nodes: nodes.map(n => ({
              id: n.id,
              type: n.type,
              data: n.data,
            })),
            edges: edges,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze workflow');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Add AI's response to messages
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }]);

      // If the AI suggests a workflow modification, notify parent
      if (data.suggestedWorkflow && onSuggestedWorkflow) {
        onSuggestedWorkflow(data.suggestedWorkflow.nodes, data.suggestedWorkflow.edges);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    mutate(input);
    setInput('');
  };

  return (
    <Paper shadow="md" p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Text fw={700} size="sm" mb="md">AI Workflow Assistant</Text>
      
      <ScrollArea style={{ flex: 1 }} mb="md">
        <Stack gap="md">
          {messages.map((message, index) => (
            <Group
              key={index}
              justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
            >
              <Paper
                shadow="sm"
                p="sm"
                style={{
                  maxWidth: '80%',
                  backgroundColor: message.role === 'user' ? 'var(--mantine-color-blue-0)' : 'var(--mantine-color-gray-0)',
                }}
              >
                <Group gap="xs" align="flex-start">
                  {message.role === 'user' ? (
                    <IconUser size={20} />
                  ) : (
                    <IconRobot size={20} />
                  )}
                  <Box>
                    <Text size="sm">{message.content}</Text>
                    <Text size="xs" c="dimmed">
                      {message.timestamp.toLocaleTimeString()}
                    </Text>
                  </Box>
                </Group>
              </Paper>
            </Group>
          ))}
          {isPending && (
            <Group justify="flex-start">
              <Paper shadow="sm" p="sm" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <Group gap="xs">
                  <IconRobot size={20} />
                  <Loader size="sm" />
                </Group>
              </Paper>
            </Group>
          )}
        </Stack>
      </ScrollArea>

      <form onSubmit={handleSubmit}>
        <TextInput
          placeholder="Ask about your workflow or request suggestions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rightSection={
            isPending ? (
              <Loader size="xs" />
            ) : (
              <IconSend
                size={16}
                style={{ cursor: 'pointer' }}
                onClick={handleSubmit}
              />
            )
          }
        />
      </form>
    </Paper>
  );
} 
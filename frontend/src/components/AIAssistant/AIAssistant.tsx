import React, { useState } from 'react';
import {
  Stack,
  Text,
  TextInput,
  Button,
  Paper,
  Avatar,
  Group,
  ThemeIcon,
  Box,
  ScrollArea,
  Loader,
  ActionIcon,
  Divider,
  Tooltip,
} from '@mantine/core';
import {
  IconBrain,
  IconSend,
  IconMicrophone,
  IconRefresh,
  IconX,
  IconInfoCircle,
  IconArrowRight,
  IconChartBar,
  IconDatabase,
  IconWand,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }[];
}

interface AIAssistantProps {
  onClose?: () => void;
}

export function AIAssistant({ onClose }: AIAssistantProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your Data Whisperer AI assistant. How can I help you with your data today?",
      sender: 'assistant',
      timestamp: new Date(),
      actions: [
        {
          label: 'Upload a dataset',
          icon: <IconDatabase size={16} />,
          onClick: () => navigate('/data/management'),
        },
        {
          label: 'Create a visualization',
          icon: <IconChartBar size={16} />,
          onClick: () => navigate('/analysis/visualize'),
        },
        {
          label: 'Build a workflow',
          icon: <IconWand size={16} />,
          onClick: () => navigate('/workflow'),
        },
      ],
    },
  ]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const assistantResponse = generateResponse(input);
      setMessages((prev) => [...prev, assistantResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const generateResponse = (userInput: string): Message => {
    const lowerInput = userInput.toLowerCase();
    
    // Simple pattern matching for demo purposes
    if (lowerInput.includes('upload') || lowerInput.includes('dataset') || lowerInput.includes('data')) {
      return {
        id: Date.now().toString(),
        content: "You can upload datasets in the Data Management section. Would you like me to take you there?",
        sender: 'assistant',
        timestamp: new Date(),
        actions: [
          {
            label: 'Go to Data Management',
            icon: <IconArrowRight size={16} />,
            onClick: () => navigate('/data/management'),
          },
        ],
      };
    } else if (lowerInput.includes('visualize') || lowerInput.includes('chart') || lowerInput.includes('graph')) {
      return {
        id: Date.now().toString(),
        content: "You can create visualizations in our Visualization tool. I can help you get started.",
        sender: 'assistant',
        timestamp: new Date(),
        actions: [
          {
            label: 'Create Visualization',
            icon: <IconChartBar size={16} />,
            onClick: () => navigate('/analysis/visualize'),
          },
        ],
      };
    } else if (lowerInput.includes('workflow') || lowerInput.includes('automate') || lowerInput.includes('process')) {
      return {
        id: Date.now().toString(),
        content: "You can build automated workflows using our Workflow Builder. Would you like to try it?",
        sender: 'assistant',
        timestamp: new Date(),
        actions: [
          {
            label: 'Open Workflow Builder',
            icon: <IconWand size={16} />,
            onClick: () => navigate('/workflow'),
          },
        ],
      };
    } else if (lowerInput.includes('help') || lowerInput.includes('guide') || lowerInput.includes('tutorial')) {
      return {
        id: Date.now().toString(),
        content: "I'd be happy to help you get started with Data Whisperer. Here are some resources:",
        sender: 'assistant',
        timestamp: new Date(),
        actions: [
          {
            label: 'View Tutorials',
            icon: <IconInfoCircle size={16} />,
            onClick: () => window.open('/help/tutorials', '_blank'),
          },
          {
            label: 'Start Onboarding Tour',
            icon: <IconRefresh size={16} />,
            onClick: () => {
              // This would trigger the onboarding flow
              localStorage.removeItem('onboardingCompleted');
              window.location.reload();
            },
          },
        ],
      };
    } else {
      return {
        id: Date.now().toString(),
        content: "I'm here to help with your data science tasks. You can ask me about uploading datasets, creating visualizations, building workflows, or getting help with any feature.",
        sender: 'assistant',
        timestamp: new Date(),
      };
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm your Data Whisperer AI assistant. How can I help you with your data today?",
        sender: 'assistant',
        timestamp: new Date(),
        actions: [
          {
            label: 'Upload a dataset',
            icon: <IconDatabase size={16} />,
            onClick: () => navigate('/data/management'),
          },
          {
            label: 'Create a visualization',
            icon: <IconChartBar size={16} />,
            onClick: () => navigate('/analysis/visualize'),
          },
          {
            label: 'Build a workflow',
            icon: <IconWand size={16} />,
            onClick: () => navigate('/workflow'),
          },
        ],
      },
    ]);
  };

  return (
    <Stack h="100%" gap={0}>
      <Group justify="space-between" p="md" pb="xs">
        <Group>
          <ThemeIcon size="lg" radius="xl" color="blue">
            <IconBrain size={20} />
          </ThemeIcon>
          <Text fw={600}>Data Whisperer Assistant</Text>
        </Group>
        <Group>
          <Tooltip label="Clear conversation">
            <ActionIcon variant="subtle" onClick={clearConversation}>
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          {onClose && (
            <Tooltip label="Close">
              <ActionIcon variant="subtle" onClick={onClose}>
                <IconX size={18} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      <Divider />

      <ScrollArea h="calc(100% - 140px)" p="md" offsetScrollbars>
        <Stack gap="md">
          {messages.map((message) => (
            <Paper
              key={message.id}
              p="md"
              withBorder={message.sender === 'assistant'}
              bg={message.sender === 'user' ? 'blue.0' : 'white'}
              radius="md"
            >
              <Group align="flex-start" gap="sm">
                {message.sender === 'assistant' ? (
                  <ThemeIcon size="lg" radius="xl" color="blue">
                    <IconBrain size={20} />
                  </ThemeIcon>
                ) : (
                  <Avatar radius="xl" size="md" color="blue">
                    U
                  </Avatar>
                )}
                <Box style={{ flex: 1 }}>
                  <Text size="sm" mb={4}>
                    {message.content}
                  </Text>
                  {message.actions && message.actions.length > 0 && (
                    <Group mt="xs">
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="xs"
                          variant="light"
                          leftSection={action.icon}
                          onClick={action.onClick}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </Group>
                  )}
                </Box>
              </Group>
            </Paper>
          ))}
          {isLoading && (
            <Group justify="center" p="md">
              <Loader size="sm" />
              <Text size="sm" color="dimmed">
                Thinking...
              </Text>
            </Group>
          )}
        </Stack>
      </ScrollArea>

      <Box p="md" pt="xs" style={{ marginTop: 'auto' }}>
        <Group justify="space-between" mb="xs">
          <Text size="xs" color="dimmed">
            Ask me anything about data analysis, visualization, or workflows
          </Text>
        </Group>
        <Group gap="xs">
          <TextInput
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            style={{ flex: 1 }}
            rightSection={
              <ActionIcon color="blue" onClick={handleSendMessage} disabled={!input.trim()}>
                <IconSend size={16} />
              </ActionIcon>
            }
          />
          <ActionIcon variant="light" color="blue" disabled>
            <IconMicrophone size={18} />
          </ActionIcon>
        </Group>
      </Box>
    </Stack>
  );
} 
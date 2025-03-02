import React, { useState, useRef, useEffect } from 'react';
import { 
  Paper, 
  Title, 
  Text, 
  TextInput, 
  Button, 
  Group, 
  Stack, 
  Avatar, 
  Box, 
  ScrollArea, 
  Divider,
  ActionIcon,
  Tooltip,
  Badge,
  Loader,
  ThemeIcon,
  Code,
  Accordion,
  Tabs
} from '@mantine/core';
import { 
  IconSend, 
  IconRobot, 
  IconUser, 
  IconMicrophone, 
  IconX,
  IconBrain,
  IconWand,
  IconCode,
  IconInfoCircle,
  IconBulb,
  IconArrowsShuffle,
  IconChartBar,
  IconDatabase,
  IconSettings,
  IconMessage,
  IconArrowRight,
  IconCopy,
  IconCheck,
  IconThumbUp,
  IconThumbDown,
  IconRefresh
} from '@tabler/icons-react';
import { useWorkflow } from '../../WorkflowContext';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  code?: string;
  chart?: string;
  status?: 'sending' | 'sent' | 'error';
  feedback?: 'positive' | 'negative' | null;
}

interface Suggestion {
  id: string;
  text: string;
  category: 'optimization' | 'insight' | 'action';
}

interface WorkflowAIChatProps {
  onSuggestionApply?: (suggestion: string) => void;
  workflowId?: string;
}

export const WorkflowAIChat: React.FC<WorkflowAIChatProps> = ({
  onSuggestionApply,
  workflowId
}) => {
  const { nodes, edges, workflowName } = useWorkflow();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'I am your AI workflow assistant. I can help you build, optimize, and troubleshoot your workflow. What would you like to do today?',
      timestamp: new Date(),
      suggestions: [
        'Analyze my workflow',
        'Suggest improvements',
        'Help me with an error',
        'Generate code for a custom node'
      ],
      status: 'sent'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('chat');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(input),
        timestamp: new Date(),
        suggestions: generateSuggestions(input),
        code: input.toLowerCase().includes('code') || input.toLowerCase().includes('example') 
          ? `# Example code for a custom transformation node
import pandas as pd

def process_data(df):
    # Handle missing values
    df = df.fillna(df.mean())
    
    # Create new features
    df['age_group'] = pd.cut(df['age'], bins=[0, 18, 35, 50, 65, 100], 
                            labels=['0-18', '19-35', '36-50', '51-65', '65+'])
    
    return df`
          : undefined,
        chart: input.toLowerCase().includes('chart') || input.toLowerCase().includes('visualization')
          ? 'chart-placeholder'
          : undefined,
        status: 'sent'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSendMessage();
    
    if (onSuggestionApply) {
      onSuggestionApply(suggestion);
    }
  };
  
  // Generate AI response based on input
  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('analyze') || lowerInput.includes('review')) {
      return `I've analyzed your workflow and here's what I found:

Your workflow has ${nodes.length} nodes and ${edges.length} connections. The main processing steps are:

1. Data loading from CSV files
2. Data cleaning and preprocessing
3. Feature engineering
4. Model training and evaluation

The workflow structure looks good overall, but I noticed a few potential improvements:
- The data cleaning node could be configured to handle outliers
- You might want to add a validation step after the feature engineering
- Consider adding error handling for the API connection node

Would you like me to help you implement any of these suggestions?`;
    }
    
    if (lowerInput.includes('suggest') || lowerInput.includes('improve')) {
      return `Based on your current workflow, here are some improvement suggestions:

1. **Add Data Validation**: Add a validation node after data loading to catch issues early
2. **Optimize Performance**: The feature engineering node could be optimized by using batch processing
3. **Add Visualization**: Add a visualization node to better understand your data distribution
4. **Implement Caching**: Add caching to expensive operations to improve reusability

I can help you implement any of these suggestions. Which one would you like to focus on?`;
    }
    
    if (lowerInput.includes('error') || lowerInput.includes('fix')) {
      return `I'll help you troubleshoot the error. Based on the information available, the most common issues in workflows like yours are:

1. **Missing Data Handling**: The error might be caused by unexpected null values
2. **Type Conversion Issues**: Check if there are type mismatches between connected nodes
3. **API Connection Timeout**: The external API node might be timing out
4. **Memory Constraints**: Complex operations might be hitting memory limits

Could you provide more details about the specific error you're seeing?`;
    }
    
    if (lowerInput.includes('code') || lowerInput.includes('custom')) {
      return `Here's a code example for a custom transformation node that you can use in your workflow:

I've included a function that handles missing values and creates age groups from a numeric age column. You can modify this to suit your specific needs.

The code is shown below. You can copy this and use it in your custom node configuration.`;
    }
    
    return `I'm here to help with your workflow! Your current workflow has ${nodes.length} nodes and ${edges.length} connections.

What specific aspect would you like assistance with? I can:
- Analyze your workflow structure
- Suggest optimizations and improvements
- Help troubleshoot errors
- Generate code for custom nodes
- Explain how specific nodes work

Just let me know what you need!`;
  };
  
  // Generate suggestions based on input
  const generateSuggestions = (input: string): string[] => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('analyze') || lowerInput.includes('review')) {
      return [
        'Show me optimization opportunities',
        'Identify bottlenecks',
        'Validate my workflow structure',
        'Generate documentation'
      ];
    }
    
    if (lowerInput.includes('suggest') || lowerInput.includes('improve')) {
      return [
        'Add data validation',
        'Optimize performance',
        'Add visualization nodes',
        'Implement caching'
      ];
    }
    
    if (lowerInput.includes('error') || lowerInput.includes('fix')) {
      return [
        'Check for missing data',
        'Validate type conversions',
        'Debug API connection',
        'Analyze memory usage'
      ];
    }
    
    if (lowerInput.includes('code') || lowerInput.includes('custom')) {
      return [
        'Show me more examples',
        'How do I deploy this code?',
        'Add error handling to this code',
        'Optimize this code'
      ];
    }
    
    return [
      'Analyze my workflow',
      'Suggest improvements',
      'Help me with an error',
      'Generate code for a custom node'
    ];
  };
  
  // Copy message to clipboard
  const handleCopyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };
  
  // Provide feedback on AI message
  const handleMessageFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedback } 
          : msg
      )
    );
  };
  
  // Render message
  const renderMessage = (message: Message) => {
    const isAI = message.role === 'assistant' || message.role === 'system';
    
    return (
      <Box
        key={message.id}
        mb="md"
        style={{
          alignSelf: isAI ? 'flex-start' : 'flex-end',
          maxWidth: '85%'
        }}
      >
        <Group gap="xs" align="flex-start">
          {isAI && (
            <Avatar color="blue" radius="xl">
              <IconRobot size={20} />
            </Avatar>
          )}
          
          <Box style={{ flex: 1 }}>
            <Paper
              p="sm"
              withBorder
              style={{
                backgroundColor: isAI ? 'var(--mantine-color-blue-0)' : 'var(--mantine-color-gray-0)',
                borderRadius: isAI ? '0 8px 8px 8px' : '8px 0 8px 8px'
              }}
            >
              <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                {message.content}
              </Text>
              
              {message.code && (
                <Box mt="xs">
                  <Code block style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {message.code}
                  </Code>
                </Box>
              )}
              
              {message.chart && (
                <Box mt="xs" p="xs" style={{ background: '#f9f9f9', borderRadius: '4px' }}>
                  <Text ta="center" size="xs" color="dimmed">
                    [Visualization placeholder]
                  </Text>
                </Box>
              )}
              
              {message.suggestions && message.suggestions.length > 0 && (
                <Box mt="md">
                  <Text size="xs" fw={500} mb="xs">
                    Suggestions:
                  </Text>
                  <Group gap="xs" mt="xs" style={{ flexWrap: 'wrap' }}>
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        size="xs"
                        variant="light"
                        leftSection={<IconBulb size={14} />}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </Group>
                </Box>
              )}
            </Paper>
            
            <Group gap="xs" mt={5}>
              <Text size="xs" color="dimmed">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              
              {isAI && (
                <>
                  <Tooltip label={copiedMessageId === message.id ? 'Copied!' : 'Copy'}>
                    <ActionIcon 
                      size="xs" 
                      variant="subtle"
                      onClick={() => handleCopyMessage(message.id, message.content)}
                    >
                      {copiedMessageId === message.id ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    </ActionIcon>
                  </Tooltip>
                  
                  <Group gap="xs">
                    <Tooltip label="Helpful">
                      <ActionIcon 
                        size="xs" 
                        variant={message.feedback === 'positive' ? 'filled' : 'subtle'}
                        color={message.feedback === 'positive' ? 'green' : 'gray'}
                        onClick={() => handleMessageFeedback(message.id, 'positive')}
                      >
                        <IconThumbUp size={14} />
                      </ActionIcon>
                    </Tooltip>
                    
                    <Tooltip label="Not helpful">
                      <ActionIcon 
                        size="xs" 
                        variant={message.feedback === 'negative' ? 'filled' : 'subtle'}
                        color={message.feedback === 'negative' ? 'red' : 'gray'}
                        onClick={() => handleMessageFeedback(message.id, 'negative')}
                      >
                        <IconThumbDown size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </>
              )}
            </Group>
          </Box>
          
          {!isAI && (
            <Avatar color="gray" radius="xl">
              <IconUser size={20} />
            </Avatar>
          )}
        </Group>
      </Box>
    );
  };
  
  return (
    <Paper p="md" withBorder h="100%">
      <Stack h="100%" gap="md">
        <Title order={4}>AI Assistant</Title>
        
        <Tabs value={activeTab} onChange={setActiveTab} flex={1}>
          <Tabs.List>
            <Tabs.Tab value="chat" leftSection={<IconMessage size={16} />}>
              Chat
            </Tabs.Tab>
            <Tabs.Tab value="insights" leftSection={<IconChartBar size={16} />}>
              Insights
            </Tabs.Tab>
            <Tabs.Tab value="suggestions" leftSection={<IconBulb size={16} />}>
              Suggestions
            </Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="chat" pt="xs" style={{ height: 'calc(100% - 36px)' }}>
            <Stack h="100%" gap="xs">
              <ScrollArea h="calc(100% - 60px)" offsetScrollbars>
                <Stack gap="xs" align="stretch">
                  {messages.map(renderMessage)}
                  {isTyping && (
                    <Box mb="md" style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                      <Group gap="xs" align="flex-start">
                        <Avatar color="blue" radius="xl">
                          <IconRobot size={20} />
                        </Avatar>
                        <Paper
                          p="sm"
                          withBorder
                          style={{
                            backgroundColor: 'var(--mantine-color-blue-0)',
                            borderRadius: '0 8px 8px 8px'
                          }}
                        >
                          <Loader size="xs" />
                        </Paper>
                      </Group>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Stack>
              </ScrollArea>
              
              <Group gap="xs">
                <TextInput
                  placeholder="Ask me anything about your workflow..."
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  style={{ flex: 1 }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  size="sm"
                  leftSection={<IconSend size={16} />}
                >
                  Send
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>
          
          <Tabs.Panel value="insights" pt="xs">
            <Stack gap="md">
              <Text size="sm" color="dimmed">
                AI-generated insights based on your workflow structure and data
              </Text>
              
              <Paper withBorder p="sm" radius="md">
                <Group gap="xs">
                  <ThemeIcon color="blue" size="lg" radius="md">
                    <IconChartBar size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={500}>Data Quality</Text>
                    <Text size="sm">Your dataset has 15% missing values in the "income" column</Text>
                  </Box>
                </Group>
                <Button 
                  mt="sm" 
                  variant="light" 
                  size="xs"
                  rightSection={<IconArrowRight size={14} />}
                  onClick={() => {
                    setActiveTab('chat');
                    setInput('Tell me more about missing values in income column');
                    handleSendMessage();
                  }}
                >
                  Get recommendations
                </Button>
              </Paper>
              
              <Paper withBorder p="sm" radius="md">
                <Group gap="xs">
                  <ThemeIcon color="green" size="lg" radius="md">
                    <IconChartBar size={18} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={500}>Performance</Text>
                    <Text size="sm">Your workflow could be optimized to run 30% faster</Text>
                  </Box>
                </Group>
                <Button 
                  mt="sm" 
                  variant="light" 
                  size="xs"
                  rightSection={<IconArrowRight size={14} />}
                  onClick={() => {
                    setActiveTab('chat');
                    setInput('How can I optimize my workflow performance?');
                    handleSendMessage();
                  }}
                >
                  View optimization tips
                </Button>
              </Paper>
            </Stack>
          </Tabs.Panel>
          
          <Tabs.Panel value="suggestions" pt="xs">
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" color="dimmed">
                  AI-suggested improvements for your workflow
                </Text>
                <Button 
                  variant="subtle" 
                  size="xs"
                  leftSection={<IconRefresh size={14} />}
                >
                  Refresh
                </Button>
              </Group>
              
              <Paper withBorder p="sm" radius="md">
                <Group gap="xs">
                  <ThemeIcon color="blue" size="lg" radius="md">
                    <IconBrain size={18} />
                  </ThemeIcon>
                  <Box>
                    <Group gap="xs">
                      <Text fw={500}>Optimization</Text>
                      <Badge size="xs" color="blue">workflow</Badge>
                    </Group>
                    <Text size="sm">Add a data validation step before your ML model to improve reliability</Text>
                  </Box>
                </Group>
                <Button 
                  mt="sm" 
                  variant="light" 
                  size="xs"
                  rightSection={<IconArrowRight size={14} />}
                  onClick={() => {
                    setActiveTab('chat');
                    setInput('How do I add a data validation step?');
                    handleSendMessage();
                  }}
                >
                  Learn more
                </Button>
              </Paper>
              
              <Paper withBorder p="sm" radius="md">
                <Group gap="xs">
                  <ThemeIcon color="green" size="lg" radius="md">
                    <IconBulb size={18} />
                  </ThemeIcon>
                  <Box>
                    <Group gap="xs">
                      <Text fw={500}>Insight</Text>
                      <Badge size="xs" color="green">data</Badge>
                    </Group>
                    <Text size="sm">Your dataset has 15% missing values in the "income" column</Text>
                  </Box>
                </Group>
                <Button 
                  mt="sm" 
                  variant="light" 
                  size="xs"
                  rightSection={<IconArrowRight size={14} />}
                  onClick={() => {
                    setActiveTab('chat');
                    setInput('How should I handle missing values in income column?');
                    handleSendMessage();
                  }}
                >
                  Get recommendations
                </Button>
              </Paper>
              
              <Paper withBorder p="sm" radius="md">
                <Group gap="xs">
                  <ThemeIcon color="orange" size="lg" radius="md">
                    <IconArrowRight size={18} />
                  </ThemeIcon>
                  <Box>
                    <Group gap="xs">
                      <Text fw={500}>Action</Text>
                      <Badge size="xs" color="orange">visualization</Badge>
                    </Group>
                    <Text size="sm">Create a visualization to explore the correlation between age and purchase behavior</Text>
                  </Box>
                </Group>
                <Button 
                  mt="sm" 
                  variant="light" 
                  size="xs"
                  rightSection={<IconArrowRight size={14} />}
                  onClick={() => {
                    setActiveTab('chat');
                    setInput('Help me create a visualization for age vs purchase correlation');
                    handleSendMessage();
                  }}
                >
                  Show me how
                </Button>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Paper>
  );
};

export default WorkflowAIChat; 
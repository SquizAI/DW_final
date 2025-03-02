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
  Accordion,
  ThemeIcon,
  Loader
} from '@mantine/core';
import { 
  IconSend, 
  IconRobot, 
  IconUser, 
  IconMicrophone, 
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconBrain,
  IconWand,
  IconCode,
  IconInfoCircle,
  IconBulb,
  IconArrowsShuffle
} from '@tabler/icons-react';
import { useWorkflow } from '../../WorkflowContext';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  code?: string;
}

interface AIAssistantPanelProps {
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  expanded = false,
  onToggleExpand
}) => {
  const { nodes, edges, workflowName } = useWorkflow();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Welcome to the AI Workflow Assistant! I can help you build, optimize, and troubleshoot your workflow. What would you like to do today?',
      timestamp: new Date(),
      suggestions: [
        'Optimize my workflow',
        'Suggest nodes to add',
        'Help me with this error',
        'Explain how this node works'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
      timestamp: new Date()
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
          ? `# Example code for workflow processing
import pandas as pd

def process_data(df):
    # Handle missing values
    df = df.fillna(df.mean())
    
    # Create new features
    df['age_group'] = pd.cut(df['age'], bins=[0, 18, 35, 50, 65, 100], 
                            labels=['0-18', '19-35', '36-50', '51-65', '65+'])
    
    return df`
          : undefined
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSendMessage();
  };
  
  // Generate AI response based on input
  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('optimize')) {
      return `I've analyzed your workflow and found a few optimization opportunities:

1. The Data Binning node could be moved before the Feature Importance node for better performance.
2. Consider adding a Data Quality Check node after loading your dataset.
3. Your workflow has some redundant transformations that could be combined.

Would you like me to make these changes for you?`;
    }
    
    if (lowerInput.includes('suggest') || lowerInput.includes('add')) {
      return `Based on your current workflow structure, I recommend adding these nodes:

1. A Data Cleaning node to handle missing values
2. A Feature Selection node after your Feature Importance analysis
3. A Visualization node to create charts of your results

I can help you configure any of these nodes if you'd like.`;
    }
    
    if (lowerInput.includes('error')) {
      return `I found the issue in your workflow. The Data Merger node is trying to join on a column that doesn't exist in both datasets. Make sure the join key exists in both input datasets.

To fix this:
1. Check the column names in both input datasets
2. Update the join key in the Data Merger configuration
3. Re-run the workflow

Let me know if you need more help with this!`;
    }
    
    if (lowerInput.includes('explain') || lowerInput.includes('how')) {
      return `The Feature Importance node analyzes your dataset to determine which features have the strongest relationship with your target variable.

It works by training a model (usually a Random Forest) and measuring how much each feature contributes to the prediction accuracy. Features with higher importance scores have a stronger influence on the target variable.

You can configure this node to use different methods for calculating importance, such as permutation importance or SHAP values.`;
    }
    
    return `I'll help you with that! Your workflow currently has ${nodes.length} nodes and ${edges.length} connections. 

The main processing steps are:
1. Data loading
2. Data transformation
3. Analysis

What specific aspect would you like me to help with?`;
  };
  
  // Generate suggestions based on input
  const generateSuggestions = (input: string): string[] => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('optimize')) {
      return [
        'Apply these optimizations',
        'Show me more details',
        'Explain the benefits',
        'Ignore these suggestions'
      ];
    }
    
    if (lowerInput.includes('suggest') || lowerInput.includes('add')) {
      return [
        'Add Data Cleaning node',
        'Add Feature Selection node',
        'Add Visualization node',
        'Tell me more about these nodes'
      ];
    }
    
    if (lowerInput.includes('error')) {
      return [
        'Fix it for me',
        'Show me the column names',
        'Explain more about join keys',
        "I'll fix it myself"
      ];
    }
    
    return [
      'Analyze my workflow',
      'Generate code for this workflow',
      'Suggest improvements',
      'Help me with node configuration'
    ];
  };
  
  return (
    <Paper p="md" withBorder h="100%">
      <Group position="apart" mb="md">
        <Group>
          <ThemeIcon size="lg" radius="xl" color="blue">
            <IconBrain size={20} />
          </ThemeIcon>
          <Title order={4}>AI Workflow Assistant</Title>
        </Group>
        {onToggleExpand && (
          <ActionIcon onClick={onToggleExpand} variant="subtle">
            {expanded ? <IconChevronDown size={18} /> : <IconChevronUp size={18} />}
          </ActionIcon>
        )}
      </Group>
      
      {expanded ? (
        <>
          <ScrollArea h="calc(100% - 140px)" mb="md" offsetScrollbars>
            <Stack spacing="md">
              {messages.map((message) => (
                <Box 
                  key={message.id}
                  style={{ 
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  <Group spacing="xs" mb="xs">
                    {message.role === 'assistant' ? (
                      <Avatar color="blue" radius="xl">
                        <IconRobot size={20} />
                      </Avatar>
                    ) : message.role === 'user' ? (
                      <Avatar color="gray" radius="xl">
                        <IconUser size={20} />
                      </Avatar>
                    ) : (
                      <Avatar color="teal" radius="xl">
                        <IconInfoCircle size={20} />
                      </Avatar>
                    )}
                    <Text size="xs" c="dimmed">
                      {message.timestamp.toLocaleTimeString()}
                    </Text>
                    {message.role === 'assistant' && (
                      <Badge size="xs" color="blue">AI</Badge>
                    )}
                  </Group>
                  
                  <Paper 
                    p="sm" 
                    withBorder 
                    style={{ 
                      backgroundColor: message.role === 'user' 
                        ? 'var(--mantine-color-gray-0)' 
                        : message.role === 'system'
                          ? 'var(--mantine-color-teal-0)'
                          : 'var(--mantine-color-blue-0)'
                    }}
                  >
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Text>
                    
                    {message.code && (
                      <Accordion mt="xs">
                        <Accordion.Item value="code">
                          <Accordion.Control icon={<IconCode size={16} />}>
                            <Text size="sm">Code Example</Text>
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Box
                              p="xs"
                              style={{
                                backgroundColor: 'var(--mantine-color-dark-8)',
                                borderRadius: 'var(--mantine-radius-sm)',
                                color: 'var(--mantine-color-gray-0)',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                                overflowX: 'auto'
                              }}
                            >
                              <pre style={{ margin: 0 }}>{message.code}</pre>
                            </Box>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    )}
                    
                    {message.suggestions && message.suggestions.length > 0 && (
                      <Group mt="xs" spacing="xs">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            size="xs"
                            variant="light"
                            compact
                            leftSection={
                              index === 0 ? <IconWand size={14} /> :
                              index === 1 ? <IconBulb size={14} /> :
                              index === 2 ? <IconCode size={14} /> :
                              <IconArrowsShuffle size={14} />
                            }
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </Group>
                    )}
                  </Paper>
                </Box>
              ))}
              
              {isTyping && (
                <Group spacing="xs">
                  <Avatar color="blue" radius="xl">
                    <IconRobot size={20} />
                  </Avatar>
                  <Loader size="sm" variant="dots" />
                </Group>
              )}
              
              <div ref={messagesEndRef} />
            </Stack>
          </ScrollArea>
          
          <Divider mb="md" />
          
          <Group position="apart">
            <TextInput
              placeholder="Ask the AI assistant..."
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{ flex: 1 }}
              rightSection={
                <ActionIcon 
                  color="blue" 
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                >
                  <IconSend size={16} />
                </ActionIcon>
              }
            />
            
            <Tooltip label="Voice input (coming soon)">
              <ActionIcon size="lg" color="blue" variant="light" disabled>
                <IconMicrophone size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </>
      ) : (
        <Stack align="center" spacing="md">
          <ThemeIcon size="xl" radius="xl" color="blue">
            <IconBrain size={24} />
          </ThemeIcon>
          <Text align="center">
            Expand this panel to chat with the AI assistant
          </Text>
          <Button
            leftSection={<IconRobot size={16} />}
            onClick={onToggleExpand}
          >
            Open AI Assistant
          </Button>
        </Stack>
      )}
    </Paper>
  );
};

export default AIAssistantPanel; 
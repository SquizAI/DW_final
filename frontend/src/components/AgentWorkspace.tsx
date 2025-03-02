import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as AgentIcon,
  Build as ToolIcon,
  AutoFixHigh as AIIcon,
  PlayArrow as RunIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  Code as CodeIcon,
  DataObject as DataIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    toolName?: string;
    status?: 'success' | 'error' | 'running';
    result?: any;
  };
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  capabilities: string[];
  status: 'idle' | 'thinking' | 'working';
}

const SAMPLE_AGENT: Agent = {
  id: 'a1',
  name: 'Data Workflow Assistant',
  avatar: 'https://i.pravatar.cc/150?u=ai-agent',
  description: 'AI agent specialized in building and optimizing data workflows',
  capabilities: ['Workflow Design', 'Tool Selection', 'Optimization', 'Error Handling'],
  status: 'idle',
};

const AgentWorkspace: React.FC = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [agent, setAgent] = useState<Agent>(SAMPLE_AGENT);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInput('');
    simulateAgentResponse(input);
  };

  const simulateAgentResponse = (userInput: string) => {
    // Set agent to thinking state
    setAgent({ ...agent, status: 'thinking' });

    // Simulate agent processing
    setTimeout(() => {
      const agentMessage: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content: 'I understand you want to create a workflow. Let me help you with that.',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMessage]);

      // Simulate tool selection
      setTimeout(() => {
        const toolMessage: Message = {
          id: Date.now().toString(),
          type: 'system',
          content: 'Selected Data Loader tool for importing the dataset',
          timestamp: new Date().toISOString(),
          metadata: {
            toolName: 'Data Loader',
            status: 'running',
          },
        };

        setMessages((prev) => [...prev, toolMessage]);
        setAgent({ ...agent, status: 'working' });

        // Simulate tool execution
        setTimeout(() => {
          const resultMessage: Message = {
            id: Date.now().toString(),
            type: 'system',
            content: 'Successfully loaded the dataset',
            timestamp: new Date().toISOString(),
            metadata: {
              toolName: 'Data Loader',
              status: 'success',
              result: {
                rowCount: 1000,
                columns: ['id', 'name', 'value'],
              },
            },
          };

          setMessages((prev) => [...prev, resultMessage]);
          setAgent({ ...agent, status: 'idle' });
        }, 2000);
      }, 1000);
    }, 1000);
  };

  const getMessageStyle = (type: Message['type']) => {
    switch (type) {
      case 'user':
        return {
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.text.primary,
          borderRadius: '20px 20px 4px 20px',
          ml: 'auto',
          maxWidth: '70%',
        };
      case 'agent':
        return {
          bgcolor: alpha(theme.palette.secondary.main, 0.1),
          color: theme.palette.text.primary,
          borderRadius: '20px 20px 20px 4px',
          mr: 'auto',
          maxWidth: '70%',
        };
      default:
        return {
          bgcolor: alpha(theme.palette.grey[500], 0.1),
          color: theme.palette.text.secondary,
          borderRadius: 2,
          mx: 'auto',
          width: '100%',
        };
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={agent.avatar}
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <AgentIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {agent.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {agent.description}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            icon={
              agent.status === 'thinking' ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <AgentIcon fontSize="small" />
              )
            }
            label={agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            color={agent.status === 'idle' ? 'default' : 'primary'}
            sx={{ borderRadius: 2 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {agent.capabilities.map((capability) => (
            <Chip
              key={capability}
              label={capability}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Chat Area */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mb: 2 }}>
                {message.type === 'system' ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      ...getMessageStyle(message.type),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ToolIcon
                        fontSize="small"
                        sx={{ mr: 1, color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" fontWeight="medium">
                        {message.metadata?.toolName}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      {message.metadata?.status === 'running' && (
                        <CircularProgress size={16} />
                      )}
                    </Box>
                    <Typography variant="body2">{message.content}</Typography>
                    {message.metadata?.result && (
                      <Paper
                        variant="outlined"
                        sx={{
                          mt: 1,
                          p: 1,
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                        }}
                      >
                        <Typography variant="caption" component="pre">
                          {JSON.stringify(message.metadata.result, null, 2)}
                        </Typography>
                      </Paper>
                    )}
                  </Paper>
                ) : (
                  <Box sx={{ ...getMessageStyle(message.type), p: 2 }}>
                    <Typography variant="body1">{message.content}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 1 }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Grid container spacing={2}>
          <Grid item xs>
            <TextField
              fullWidth
              placeholder="Ask the agent to help you build a workflow..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              multiline
              maxRows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                },
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!input.trim()}
              sx={{
                height: '100%',
                borderRadius: 3,
                px: 3,
              }}
            >
              <SendIcon />
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RunIcon />}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Run Workflow
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Save Progress
          </Button>
          <Button
            variant="outlined"
            startIcon={<StopIcon />}
            size="small"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Stop Agent
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentWorkspace; 
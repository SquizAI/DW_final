import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  useTheme,
  alpha,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fade,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  LinearProgress,
} from '@mui/material';
import {
  AutoFixHigh as AIIcon,
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as OptimizeIcon,
  Code as CodeIcon,
  DataObject as DataIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Group,
  Text,
  ActionIcon,
  TextInput,
  Tooltip,
  Badge,
  Collapse,
  ScrollArea,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconBrain,
  IconWand,
  IconX,
  IconSend,
  IconArrowRight,
  IconCheck,
  IconBulb,
  IconAlertCircle,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  config: any;
}

export interface AIWorkflowAssistantProps {
  suggestions: Suggestion[];
  onSuggestionApply: (suggestion: Suggestion) => void;
}

export function AIWorkflowAssistant({ suggestions, onSuggestionApply }: AIWorkflowAssistantProps) {
  return (
    <Box style={{ width: 300, border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)', padding: 'var(--mantine-spacing-md)' }}>
      <Stack gap="md">
        <Title order={3}>AI Assistant</Title>
        <Text size="sm" c="dimmed">
          Here are some suggestions based on your current workflow:
        </Text>
        <ScrollArea h={400}>
          <Stack gap="sm">
            {suggestions.map((suggestion) => (
              <Box 
                key={suggestion.id} 
                style={{ 
                  border: '1px solid var(--mantine-color-gray-3)', 
                  borderRadius: 'var(--mantine-radius-sm)',
                  padding: 'var(--mantine-spacing-sm)'
                }}
              >
                <Stack gap="xs">
                  <Text fw={500}>{suggestion.title}</Text>
                  <Text size="sm" c="dimmed">
                    {suggestion.description}
                  </Text>
                  <Button
                    size="small"
                    onClick={() => onSuggestionApply(suggestion)}
                  >
                    Apply Suggestion
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </ScrollArea>
      </Stack>
    </Box>
  );
}

export default AIWorkflowAssistant; 
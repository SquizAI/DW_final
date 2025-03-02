import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Box, 
  Text, 
  Group, 
  Badge, 
  ThemeIcon, 
  ActionIcon,
  Collapse,
  Stack,
  Divider,
  Code
} from '@mantine/core';
import { 
  IconChevronDown, 
  IconChevronUp,
  IconCode,
  IconBrandPython,
  IconBrandJavascript,
  IconDatabase
} from '@tabler/icons-react';
import { WorkflowNodeData } from './types';

interface LambdaFunctionNodeProps extends NodeProps {
  data: WorkflowNodeData & {
    language?: 'python' | 'javascript' | 'sql';
    code?: string;
    executionTime?: number;
    status?: 'idle' | 'running' | 'completed' | 'error';
    error?: string;
  };
}

export const LambdaFunctionNode: React.FC<LambdaFunctionNodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Default values
  const language = data.language || 'python';
  const code = data.code || '# Default function\ndef process_data(df):\n    return df';
  const executionTime = data.executionTime || 0;
  const status = data.status || 'idle';
  const error = data.error || '';
  
  // Get language icon
  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case 'python': return <IconBrandPython size={16} />;
      case 'javascript': return <IconBrandJavascript size={16} />;
      case 'sql': return <IconDatabase size={16} />;
      default: return <IconCode size={16} />;
    }
  };
  
  // Get language color
  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'python': return 'blue';
      case 'javascript': return 'yellow';
      case 'sql': return 'green';
      default: return 'gray';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'gray';
      case 'running': return 'blue';
      case 'completed': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };
  
  // Format execution time
  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  };
  
  return (
    <Box
      style={{
        borderRadius: 8,
        border: `2px solid ${selected ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-3)'}`,
        backgroundColor: 'white',
        width: 280,
        padding: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      
      <Group justify="space-between" mb="xs">
        <Group>
          <ThemeIcon color="violet" size="md" radius="md">
            <IconCode size={16} />
          </ThemeIcon>
          <Text fw={600} size="sm">{data.label || 'Lambda Function'}</Text>
        </Group>
        <Group gap={5}>
          <Badge 
            color={getLanguageColor(language)}
            variant="filled"
            size="sm"
            leftSection={getLanguageIcon(language)}
          >
            {language.toUpperCase()}
          </Badge>
          <ActionIcon 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            variant="subtle"
          >
            {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </ActionIcon>
        </Group>
      </Group>
      
      <Group mb="xs">
        <Badge size="xs" color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Badge>
        {executionTime > 0 && (
          <Text size="xs" c="dimmed">
            Execution time: {formatExecutionTime(executionTime)}
          </Text>
        )}
      </Group>
      
      <Collapse in={expanded}>
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">Function Code:</Text>
        <Box
          style={{
            maxHeight: '150px',
            overflow: 'auto',
            backgroundColor: 'var(--mantine-color-gray-0)',
            borderRadius: '4px',
            padding: '4px'
          }}
        >
          <Code block>{code}</Code>
        </Box>
        
        {error && (
          <>
            <Divider my="xs" />
            <Text size="xs" fw={600} c="red" mb="xs">Error:</Text>
            <Text size="xs" c="red">{error}</Text>
          </>
        )}
      </Collapse>
      
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </Box>
  );
};

export default LambdaFunctionNode; 
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
  Progress,
  Button
} from '@mantine/core';
import { 
  IconChevronDown, 
  IconChevronUp,
  IconFileReport,
  IconDownload,
  IconEye,
  IconChartBar,
  IconTable,
  IconCode,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { WorkflowNodeData } from './types';

interface ReportSection {
  name: string;
  type: 'visualization' | 'data' | 'code' | 'text';
  status: 'pending' | 'completed' | 'error';
}

interface ReportGeneratorNodeProps extends NodeProps {
  data: WorkflowNodeData & {
    reportFormat?: 'html' | 'pdf' | 'markdown' | 'json';
    includeVisualizations?: boolean;
    includeDataSamples?: boolean;
    includeCodeSnippets?: boolean;
    sections?: ReportSection[];
    generationStatus?: 'idle' | 'generating' | 'completed' | 'error';
    downloadUrl?: string;
  };
}

export const ReportGeneratorNode: React.FC<ReportGeneratorNodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Default values
  const reportFormat = data.reportFormat || 'html';
  const includeVisualizations = data.includeVisualizations !== undefined ? data.includeVisualizations : true;
  const includeDataSamples = data.includeDataSamples !== undefined ? data.includeDataSamples : true;
  const includeCodeSnippets = data.includeCodeSnippets !== undefined ? data.includeCodeSnippets : false;
  const generationStatus = data.generationStatus || 'idle';
  const downloadUrl = data.downloadUrl || '#';
  
  // Sample sections
  const sections = data.sections || [
    { name: 'Executive Summary', type: 'text', status: 'completed' },
    { name: 'Data Overview', type: 'text', status: 'completed' },
    { name: 'Data Quality Assessment', type: 'visualization', status: 'completed' },
    { name: 'Feature Distributions', type: 'visualization', status: 'completed' },
    { name: 'Correlation Analysis', type: 'visualization', status: 'completed' },
    { name: 'Data Sample', type: 'data', status: 'completed' },
    { name: 'Model Performance', type: 'visualization', status: 'completed' },
    { name: 'Feature Importance', type: 'visualization', status: 'completed' },
    { name: 'Processing Code', type: 'code', status: 'completed' },
    { name: 'Recommendations', type: 'text', status: 'completed' }
  ];
  
  // Get format name
  const getFormatName = (format: string) => {
    switch (format) {
      case 'html': return 'HTML';
      case 'pdf': return 'PDF';
      case 'markdown': return 'Markdown';
      case 'json': return 'JSON';
      default: return format.toUpperCase();
    }
  };
  
  // Get format color
  const getFormatColor = (format: string) => {
    switch (format) {
      case 'html': return 'blue';
      case 'pdf': return 'red';
      case 'markdown': return 'green';
      case 'json': return 'violet';
      default: return 'gray';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'gray';
      case 'generating': return 'blue';
      case 'completed': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };
  
  // Get section type icon
  const getSectionTypeIcon = (type: string) => {
    switch (type) {
      case 'visualization': return <IconChartBar size={14} />;
      case 'data': return <IconTable size={14} />;
      case 'code': return <IconCode size={14} />;
      case 'text': return <IconFileReport size={14} />;
      default: return <IconFileReport size={14} />;
    }
  };
  
  // Get section type color
  const getSectionTypeColor = (type: string) => {
    switch (type) {
      case 'visualization': return 'blue';
      case 'data': return 'green';
      case 'code': return 'violet';
      case 'text': return 'gray';
      default: return 'gray';
    }
  };
  
  // Get section status icon
  const getSectionStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <IconCheck size={14} />;
      case 'error': return <IconX size={14} />;
      case 'pending': return null;
      default: return null;
    }
  };
  
  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    const completedSections = sections.filter(section => section.status === 'completed').length;
    return (completedSections / sections.length) * 100;
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
          <ThemeIcon color={getFormatColor(reportFormat)} size="md" radius="md">
            <IconFileReport size={16} />
          </ThemeIcon>
          <Text fw={600} size="sm">{data.label || 'Report Generator'}</Text>
        </Group>
        <Group gap={5}>
          <Badge 
            color={getStatusColor(generationStatus)}
            variant="filled"
            size="sm"
          >
            {generationStatus.toUpperCase()}
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
        <Badge color={getFormatColor(reportFormat)} size="xs">
          {getFormatName(reportFormat)}
        </Badge>
        {includeVisualizations && (
          <Badge color="blue" size="xs">
            Visualizations
          </Badge>
        )}
        {includeDataSamples && (
          <Badge color="green" size="xs">
            Data Samples
          </Badge>
        )}
        {includeCodeSnippets && (
          <Badge color="violet" size="xs">
            Code Snippets
          </Badge>
        )}
      </Group>
      
      <Group mb="xs" justify="space-between">
        <Text size="xs">Completion:</Text>
        <Text size="xs" fw={500}>{Math.round(calculateCompletionPercentage())}%</Text>
      </Group>
      
      <Progress 
        value={calculateCompletionPercentage()} 
        color={getStatusColor(generationStatus)} 
        size="sm" 
        mb="xs"
        striped={generationStatus === 'generating'}
        animated={generationStatus === 'generating'}
      />
      
      <Collapse in={expanded}>
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">Report Sections:</Text>
        <Stack gap="xs" style={{ maxHeight: '150px', overflow: 'auto' }}>
          {sections.map((section, index) => (
            <Group key={index} gap={5} justify="space-between">
              <Group gap={5}>
                <ThemeIcon 
                  size="xs" 
                  radius="xl" 
                  color={getSectionTypeColor(section.type)}
                >
                  {getSectionTypeIcon(section.type)}
                </ThemeIcon>
                <Text size="xs">{section.name}</Text>
              </Group>
              <ThemeIcon 
                size="xs" 
                radius="xl" 
                color={getStatusColor(section.status)}
                variant={section.status === 'pending' ? 'outline' : 'filled'}
              >
                {getSectionStatusIcon(section.status)}
              </ThemeIcon>
            </Group>
          ))}
        </Stack>
        
        <Divider my="xs" />
        
        <Group gap={5}>
          <Button 
            size="xs" 
            leftSection={<IconEye size={14} />}
            variant="light"
            fullWidth
            disabled={generationStatus !== 'completed'}
          >
            Preview Report
          </Button>
          <Button 
            size="xs" 
            leftSection={<IconDownload size={14} />}
            variant="light"
            fullWidth
            disabled={generationStatus !== 'completed'}
            component="a"
            href={downloadUrl}
            download
          >
            Download Report
          </Button>
        </Group>
      </Collapse>
      
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </Box>
  );
};

export default ReportGeneratorNode; 
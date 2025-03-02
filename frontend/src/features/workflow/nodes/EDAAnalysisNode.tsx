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
  SimpleGrid
} from '@mantine/core';
import { 
  IconChevronDown, 
  IconChevronUp,
  IconChartBar,
  IconChartPie,
  IconChartDots,
  IconChartLine,
  IconEye
} from '@tabler/icons-react';
import { WorkflowNodeData } from './types';

interface AnalysisResult {
  type: 'univariate' | 'bivariate' | 'correlation' | 'distribution';
  name: string;
  description: string;
  value?: number;
  status?: 'pending' | 'completed' | 'error';
}

interface EDAAnalysisNodeProps extends NodeProps {
  data: WorkflowNodeData & {
    univariateAnalysis?: boolean;
    bivariateAnalysis?: boolean;
    correlationAnalysis?: boolean;
    sampleSize?: number;
    results?: AnalysisResult[];
  };
}

export const EDAAnalysisNode: React.FC<EDAAnalysisNodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Default values
  const univariateAnalysis = data.univariateAnalysis !== undefined ? data.univariateAnalysis : true;
  const bivariateAnalysis = data.bivariateAnalysis !== undefined ? data.bivariateAnalysis : true;
  const correlationAnalysis = data.correlationAnalysis !== undefined ? data.correlationAnalysis : true;
  const sampleSize = data.sampleSize || 1000;
  
  // Sample results
  const results = data.results || [
    { 
      type: 'univariate', 
      name: 'Age Distribution', 
      description: 'Normal distribution with mean=42.5, std=12.3', 
      status: 'completed' 
    },
    { 
      type: 'univariate', 
      name: 'Income Distribution', 
      description: 'Right-skewed distribution with median=62000', 
      status: 'completed' 
    },
    { 
      type: 'bivariate', 
      name: 'Age vs. Income', 
      description: 'Positive correlation (r=0.45)', 
      value: 0.45,
      status: 'completed' 
    },
    { 
      type: 'correlation', 
      name: 'Correlation Matrix', 
      description: 'Generated for all numeric columns', 
      status: 'completed' 
    },
    { 
      type: 'distribution', 
      name: 'Gender Distribution', 
      description: 'Male: 48%, Female: 50%, Other: 2%', 
      status: 'completed' 
    }
  ];
  
  // Get analysis type icon
  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'univariate': return <IconChartBar size={14} />;
      case 'bivariate': return <IconChartDots size={14} />;
      case 'correlation': return <IconChartLine size={14} />;
      case 'distribution': return <IconChartPie size={14} />;
      default: return <IconEye size={14} />;
    }
  };
  
  // Get analysis type color
  const getAnalysisColor = (type: string) => {
    switch (type) {
      case 'univariate': return 'blue';
      case 'bivariate': return 'green';
      case 'correlation': return 'violet';
      case 'distribution': return 'orange';
      default: return 'gray';
    }
  };
  
  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'error': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };
  
  // Get correlation strength description
  const getCorrelationStrength = (value?: number) => {
    if (value === undefined) return '';
    
    const absValue = Math.abs(value);
    if (absValue >= 0.7) return 'Strong';
    if (absValue >= 0.4) return 'Moderate';
    if (absValue >= 0.2) return 'Weak';
    return 'Very Weak';
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
          <ThemeIcon color="blue" size="md" radius="md">
            <IconChartBar size={16} />
          </ThemeIcon>
          <Text fw={600} size="sm">{data.label || 'EDA Analysis'}</Text>
        </Group>
        <Group gap={5}>
          <Badge 
            color="blue"
            variant="filled"
            size="sm"
          >
            {results.length} Insights
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
        <Text size="xs">Sample Size: <Text span fw={500}>{sampleSize}</Text></Text>
      </Group>
      
      <Group mb="xs">
        <Badge size="xs" color={univariateAnalysis ? 'blue' : 'gray'} variant="outline">
          Univariate
        </Badge>
        <Badge size="xs" color={bivariateAnalysis ? 'green' : 'gray'} variant="outline">
          Bivariate
        </Badge>
        <Badge size="xs" color={correlationAnalysis ? 'violet' : 'gray'} variant="outline">
          Correlation
        </Badge>
      </Group>
      
      <Collapse in={expanded}>
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">Analysis Results:</Text>
        <Stack gap="xs">
          {results.map((result, index) => (
            <Box key={index} p="xs" style={{ 
              backgroundColor: 'var(--mantine-color-gray-0)',
              borderRadius: '4px'
            }}>
              <Group gap={5} mb={2}>
                <ThemeIcon 
                  size="xs" 
                  radius="xl" 
                  color={getAnalysisColor(result.type)}
                >
                  {getAnalysisIcon(result.type)}
                </ThemeIcon>
                <Text size="xs" fw={500}>{result.name}</Text>
                <Badge 
                  size="xs" 
                  color={getStatusColor(result.status)}
                >
                  {result.status || 'pending'}
                </Badge>
              </Group>
              
              <Text size="xs" c="dimmed" mb={result.value !== undefined ? 5 : 0}>
                {result.description}
              </Text>
              
              {result.value !== undefined && result.type === 'bivariate' && (
                <SimpleGrid cols={2}>
                  <Progress 
                    value={Math.abs(result.value) * 100} 
                    color={result.value >= 0 ? 'green' : 'red'} 
                    size="xs" 
                  />
                  <Text size="xs" ta="right">
                    {getCorrelationStrength(result.value)} 
                    {result.value >= 0 ? ' Positive' : ' Negative'}
                  </Text>
                </SimpleGrid>
              )}
            </Box>
          ))}
        </Stack>
      </Collapse>
      
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </Box>
  );
};

export default EDAAnalysisNode; 
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
  Progress
} from '@mantine/core';
import { 
  IconChevronDown, 
  IconChevronUp,
  IconChartHistogram,
  IconColumns
} from '@tabler/icons-react';
import { WorkflowNodeData } from './types';

interface DataBinningNodeProps extends NodeProps {
  data: WorkflowNodeData & {
    binningMethod?: 'equal_width' | 'equal_frequency' | 'kmeans' | 'custom';
    numBins?: number;
    targetColumn?: string;
    binRanges?: Array<{
      min: number;
      max: number;
      count: number;
    }>;
  };
}

export const DataBinningNode: React.FC<DataBinningNodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Default values
  const binningMethod = data.binningMethod || 'equal_width';
  const numBins = data.numBins || 10;
  const targetColumn = data.targetColumn || 'age';
  
  // Sample bin ranges
  const binRanges = data.binRanges || [
    { min: 0, max: 10, count: 15 },
    { min: 10, max: 20, count: 25 },
    { min: 20, max: 30, count: 35 },
    { min: 30, max: 40, count: 45 },
    { min: 40, max: 50, count: 30 },
    { min: 50, max: 60, count: 20 },
    { min: 60, max: 70, count: 10 },
    { min: 70, max: 80, count: 5 },
    { min: 80, max: 90, count: 2 },
    { min: 90, max: 100, count: 1 }
  ];
  
  // Get method name
  const getMethodName = (method: string) => {
    switch (method) {
      case 'equal_width': return 'Equal Width';
      case 'equal_frequency': return 'Equal Frequency';
      case 'kmeans': return 'K-Means';
      case 'custom': return 'Custom Boundaries';
      default: return method;
    }
  };
  
  // Get method color
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'equal_width': return 'blue';
      case 'equal_frequency': return 'green';
      case 'kmeans': return 'violet';
      case 'custom': return 'orange';
      default: return 'gray';
    }
  };
  
  // Get max count for normalization
  const getMaxCount = () => {
    return Math.max(...binRanges.map(bin => bin.count));
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
          <ThemeIcon color="teal" size="md" radius="md">
            <IconChartHistogram size={16} />
          </ThemeIcon>
          <Text fw={600} size="sm">{data.label || 'Data Binning'}</Text>
        </Group>
        <Group gap={5}>
          <Badge 
            color={getMethodColor(binningMethod)}
            variant="filled"
            size="sm"
          >
            {getMethodName(binningMethod)}
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
      
      <Group mb="xs" align="center">
        <ThemeIcon size="xs" color="blue" radius="xl">
          <IconColumns size={10} />
        </ThemeIcon>
        <Text size="xs">Target Column: <Text span fw={500}>{targetColumn}</Text></Text>
      </Group>
      
      <Text size="xs" mb="xs">Number of Bins: <Text span fw={500}>{numBins}</Text></Text>
      
      <Collapse in={expanded}>
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">Bin Distribution:</Text>
        <Stack gap="xs">
          {binRanges.slice(0, numBins).map((bin, index) => (
            <Box key={index}>
              <Group gap="xs" mb={2}>
                <Text size="xs" w={80}>{`${bin.min} - ${bin.max}`}</Text>
                <Text size="xs" c="dimmed">{bin.count}</Text>
              </Group>
              <Progress 
                value={(bin.count / getMaxCount()) * 100} 
                color={getMethodColor(binningMethod)} 
                size="xs" 
              />
            </Box>
          ))}
        </Stack>
        
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">Method Description:</Text>
        <Text size="xs" c="dimmed">
          {binningMethod === 'equal_width' && 'Divides the range into equal-sized bins'}
          {binningMethod === 'equal_frequency' && 'Creates bins with equal number of samples'}
          {binningMethod === 'kmeans' && 'Uses K-means clustering to determine bin boundaries'}
          {binningMethod === 'custom' && 'Uses custom-defined bin boundaries'}
        </Text>
      </Collapse>
      
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </Box>
  );
};

export default DataBinningNode; 
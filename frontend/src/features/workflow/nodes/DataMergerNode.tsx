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
  Select
} from '@mantine/core';
import { 
  IconChevronDown, 
  IconChevronUp,
  IconTableImport,
  IconLink
} from '@tabler/icons-react';
import { WorkflowNodeData } from './types';

interface DataMergerNodeProps extends NodeProps {
  data: WorkflowNodeData & {
    mergeType?: 'inner' | 'left' | 'right' | 'outer';
    joinKey?: string;
    leftDataset?: string;
    rightDataset?: string;
    matchedRows?: number;
    totalRows?: number;
  };
}

export const DataMergerNode: React.FC<DataMergerNodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Default values
  const mergeType = data.mergeType || 'inner';
  const joinKey = data.joinKey || 'id';
  const leftDataset = data.leftDataset || 'Left Dataset';
  const rightDataset = data.rightDataset || 'Right Dataset';
  const matchedRows = data.matchedRows || 0;
  const totalRows = data.totalRows || 0;
  
  // Get merge type color
  const getMergeTypeColor = (type: string) => {
    switch (type) {
      case 'inner': return 'blue';
      case 'left': return 'green';
      case 'right': return 'violet';
      case 'outer': return 'orange';
      default: return 'gray';
    }
  };
  
  // Get merge type description
  const getMergeTypeDescription = (type: string) => {
    switch (type) {
      case 'inner': return 'Only rows that match in both datasets';
      case 'left': return 'All rows from left dataset, matching rows from right';
      case 'right': return 'All rows from right dataset, matching rows from left';
      case 'outer': return 'All rows from both datasets';
      default: return '';
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
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} id="left" />
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} id="right" />
      
      <Group justify="space-between" mb="xs">
        <Group>
          <ThemeIcon color="cyan" size="md" radius="md">
            <IconTableImport size={16} />
          </ThemeIcon>
          <Text fw={600} size="sm">{data.label || 'Data Merger'}</Text>
        </Group>
        <Group gap={5}>
          <Badge 
            color={getMergeTypeColor(mergeType)}
            variant="filled"
            size="sm"
          >
            {mergeType.toUpperCase()} JOIN
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
          <IconLink size={10} />
        </ThemeIcon>
        <Text size="xs">Join Key: <Text span fw={500}>{joinKey}</Text></Text>
      </Group>
      
      <Collapse in={expanded}>
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">Join Configuration:</Text>
        <Stack gap="xs">
          <Group gap="xs">
            <Text size="xs" w={80}>Join Type:</Text>
            <Select
              size="xs"
              data={[
                { value: 'inner', label: 'Inner Join' },
                { value: 'left', label: 'Left Join' },
                { value: 'right', label: 'Right Join' },
                { value: 'outer', label: 'Outer Join' }
              ]}
              value={mergeType}
              readOnly
              style={{ flex: 1 }}
            />
          </Group>
          
          <Text size="xs" c="dimmed">{getMergeTypeDescription(mergeType)}</Text>
          
          <Group gap="xs">
            <Text size="xs" w={80}>Left Dataset:</Text>
            <Text size="xs" fw={500}>{leftDataset}</Text>
          </Group>
          
          <Group gap="xs">
            <Text size="xs" w={80}>Right Dataset:</Text>
            <Text size="xs" fw={500}>{rightDataset}</Text>
          </Group>
          
          <Divider my="xs" />
          
          <Group gap="xs">
            <Text size="xs" w={120}>Matched Rows:</Text>
            <Text size="xs" fw={500}>{matchedRows}</Text>
          </Group>
          
          <Group gap="xs">
            <Text size="xs" w={120}>Total Output Rows:</Text>
            <Text size="xs" fw={500}>{totalRows}</Text>
          </Group>
        </Stack>
      </Collapse>
      
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </Box>
  );
};

export default DataMergerNode; 
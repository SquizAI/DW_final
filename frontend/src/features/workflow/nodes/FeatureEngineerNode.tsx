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
  Table
} from '@mantine/core';
import { 
  IconChevronDown, 
  IconChevronUp,
  IconWand,
  IconPlus,
  IconMinus,
  IconHash,
  IconDivide
} from '@tabler/icons-react';
import { WorkflowNodeData } from './types';

interface FeatureOperation {
  type: 'create' | 'transform' | 'normalize' | 'encode';
  name: string;
  description: string;
  status?: 'pending' | 'completed' | 'error';
}

interface FeatureEngineerNodeProps extends NodeProps {
  data: WorkflowNodeData & {
    operations?: FeatureOperation[];
    inputColumns?: string[];
    outputColumns?: string[];
  };
}

export const FeatureEngineerNode: React.FC<FeatureEngineerNodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Default values
  const operations = data.operations || [
    { 
      type: 'create', 
      name: 'age_squared', 
      description: 'age * age', 
      status: 'completed' 
    },
    { 
      type: 'normalize', 
      name: 'income_normalized', 
      description: 'Min-max scaling of income', 
      status: 'completed' 
    },
    { 
      type: 'encode', 
      name: 'gender_encoded', 
      description: 'One-hot encoding of gender', 
      status: 'completed' 
    },
    { 
      type: 'transform', 
      name: 'log_income', 
      description: 'Log transformation of income', 
      status: 'completed' 
    }
  ];
  
  const inputColumns = data.inputColumns || ['age', 'income', 'gender', 'education'];
  const outputColumns = data.outputColumns || [
    'age', 'income', 'gender', 'education', 
    'age_squared', 'income_normalized', 
    'gender_male', 'gender_female', 'gender_other',
    'log_income'
  ];
  
  // Get operation icon
  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'create': return <IconPlus size={14} />;
      case 'transform': return <IconWand size={14} />;
      case 'normalize': return <IconDivide size={14} />;
      case 'encode': return <IconHash size={14} />;
      default: return <IconWand size={14} />;
    }
  };
  
  // Get operation color
  const getOperationColor = (type: string) => {
    switch (type) {
      case 'create': return 'green';
      case 'transform': return 'blue';
      case 'normalize': return 'violet';
      case 'encode': return 'orange';
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
          <ThemeIcon color="indigo" size="md" radius="md">
            <IconWand size={16} />
          </ThemeIcon>
          <Text fw={600} size="sm">{data.label || 'Feature Engineer'}</Text>
        </Group>
        <Group gap={5}>
          <Badge 
            color="indigo"
            variant="filled"
            size="sm"
          >
            {operations.length} Operations
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
        <Text size="xs">Input Columns: <Text span fw={500}>{inputColumns.length}</Text></Text>
        <Text size="xs">Output Columns: <Text span fw={500}>{outputColumns.length}</Text></Text>
      </Group>
      
      <Collapse in={expanded}>
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">Feature Operations:</Text>
        <Box style={{ maxHeight: '150px', overflow: 'auto' }}>
          <Table striped withColumnBorders withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Type</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {operations.map((op, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Group gap={5}>
                      <ThemeIcon 
                        size="xs" 
                        radius="xl" 
                        color={getOperationColor(op.type)}
                      >
                        {getOperationIcon(op.type)}
                      </ThemeIcon>
                      <Text size="xs">{op.type}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{op.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      size="xs" 
                      color={getStatusColor(op.status)}
                    >
                      {op.status || 'pending'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
        
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">New Columns Created:</Text>
        <Group gap={5} style={{ flexWrap: 'wrap' }}>
          {outputColumns
            .filter(col => !inputColumns.includes(col))
            .map((col, index) => (
              <Badge key={index} size="xs" variant="outline" color="indigo">
                {col}
              </Badge>
            ))
          }
        </Group>
      </Collapse>
      
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </Box>
  );
};

export default FeatureEngineerNode; 
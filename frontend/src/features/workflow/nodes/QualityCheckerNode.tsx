import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Box, 
  Text, 
  Group, 
  Badge, 
  Progress, 
  ThemeIcon, 
  Tooltip, 
  ActionIcon,
  Collapse,
  Stack,
  Divider
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconCheck, 
  IconX, 
  IconChevronDown, 
  IconChevronUp,
  IconShieldCheck,
  IconAdjustments
} from '@tabler/icons-react';
import { WorkflowNodeData } from './types';

interface QualityCheckerNodeProps extends NodeProps {
  data: WorkflowNodeData & {
    qualityThreshold?: number;
    checkMissingValues?: boolean;
    checkOutliers?: boolean;
    checkDuplicates?: boolean;
    qualityScore?: number;
    issues?: Array<{
      type: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  };
}

export const QualityCheckerNode: React.FC<QualityCheckerNodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Default values
  const qualityThreshold = data.qualityThreshold || 80;
  const qualityScore = data.qualityScore || 0;
  const checkMissingValues = data.checkMissingValues !== undefined ? data.checkMissingValues : true;
  const checkOutliers = data.checkOutliers !== undefined ? data.checkOutliers : true;
  const checkDuplicates = data.checkDuplicates !== undefined ? data.checkDuplicates : true;
  
  // Sample issues
  const issues = data.issues || [
    { 
      type: 'missing_values', 
      message: 'Column "age" has 5% missing values', 
      severity: 'medium' as const 
    },
    { 
      type: 'outliers', 
      message: 'Column "income" has potential outliers', 
      severity: 'low' as const 
    },
    { 
      type: 'duplicates', 
      message: '2 duplicate rows detected', 
      severity: 'high' as const 
    }
  ];
  
  // Get quality status
  const getQualityStatus = () => {
    if (qualityScore >= qualityThreshold) {
      return 'passed';
    } else if (qualityScore >= qualityThreshold * 0.7) {
      return 'warning';
    } else {
      return 'failed';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'green';
      case 'warning': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <IconCheck size={16} />;
      case 'warning': return <IconAlertCircle size={16} />;
      case 'failed': return <IconX size={16} />;
      default: return null;
    }
  };
  
  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'blue';
      case 'medium': return 'yellow';
      case 'high': return 'red';
      default: return 'gray';
    }
  };
  
  const status = getQualityStatus();
  const statusColor = getStatusColor(status);
  
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
            <IconShieldCheck size={16} />
          </ThemeIcon>
          <Text fw={600} size="sm">{data.label || 'Quality Checker'}</Text>
        </Group>
        <Group gap={5}>
          <Badge 
            color={statusColor}
            variant="filled"
            size="sm"
          >
            {status.toUpperCase()}
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
      
      <Group justify="space-between" mb="xs">
        <Text size="xs">Quality Score:</Text>
        <Text size="xs" fw={600}>{qualityScore}/{qualityThreshold}</Text>
      </Group>
      
      <Progress 
        value={(qualityScore / 100) * 100} 
        color={statusColor} 
        size="sm" 
        mb="xs"
      />
      
      <Collapse in={expanded}>
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">Quality Checks:</Text>
        <Group mb="xs">
          <Badge size="xs" color={checkMissingValues ? 'blue' : 'gray'} variant="outline">
            Missing Values
          </Badge>
          <Badge size="xs" color={checkOutliers ? 'blue' : 'gray'} variant="outline">
            Outliers
          </Badge>
          <Badge size="xs" color={checkDuplicates ? 'blue' : 'gray'} variant="outline">
            Duplicates
          </Badge>
        </Group>
        
        <Text size="xs" fw={600} mb="xs">Issues Detected:</Text>
        <Stack gap="xs">
          {issues.map((issue, index) => (
            <Group key={index} gap="xs">
              <ThemeIcon 
                color={getSeverityColor(issue.severity)} 
                size="xs" 
                radius="xl"
              >
                <IconAlertCircle size={10} />
              </ThemeIcon>
              <Text size="xs">{issue.message}</Text>
            </Group>
          ))}
        </Stack>
      </Collapse>
      
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </Box>
  );
};

export default QualityCheckerNode; 
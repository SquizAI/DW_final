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
  IconChartBar,
  IconSortAscending,
  IconTarget
} from '@tabler/icons-react';
import { WorkflowNodeData } from './types';

interface FeatureScore {
  name: string;
  score: number;
  description?: string;
}

interface FeatureImportanceNodeProps extends NodeProps {
  data: WorkflowNodeData & {
    method?: 'random_forest' | 'permutation' | 'shap';
    targetColumn?: string;
    topFeatures?: number;
    features?: FeatureScore[];
  };
}

export const FeatureImportanceNode: React.FC<FeatureImportanceNodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Default values
  const method = data.method || 'random_forest';
  const targetColumn = data.targetColumn || 'target';
  const topFeatures = data.topFeatures || 10;
  
  // Sample feature scores
  const features = data.features || [
    { name: 'income', score: 0.85, description: 'Strong predictor' },
    { name: 'age', score: 0.72, description: 'Strong predictor' },
    { name: 'education', score: 0.65, description: 'Moderate predictor' },
    { name: 'occupation', score: 0.58, description: 'Moderate predictor' },
    { name: 'marital_status', score: 0.45, description: 'Moderate predictor' },
    { name: 'gender', score: 0.32, description: 'Weak predictor' },
    { name: 'location', score: 0.28, description: 'Weak predictor' },
    { name: 'children', score: 0.25, description: 'Weak predictor' },
    { name: 'home_ownership', score: 0.18, description: 'Very weak predictor' },
    { name: 'years_employed', score: 0.15, description: 'Very weak predictor' }
  ];
  
  // Get method name
  const getMethodName = (method: string) => {
    switch (method) {
      case 'random_forest': return 'Random Forest';
      case 'permutation': return 'Permutation Importance';
      case 'shap': return 'SHAP Values';
      default: return method;
    }
  };
  
  // Get method color
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'random_forest': return 'green';
      case 'permutation': return 'blue';
      case 'shap': return 'violet';
      default: return 'gray';
    }
  };
  
  // Get importance color
  const getImportanceColor = (score: number) => {
    if (score >= 0.7) return 'green';
    if (score >= 0.4) return 'blue';
    if (score >= 0.2) return 'yellow';
    return 'gray';
  };
  
  // Get importance description
  const getImportanceDescription = (score: number) => {
    if (score >= 0.7) return 'Strong';
    if (score >= 0.4) return 'Moderate';
    if (score >= 0.2) return 'Weak';
    return 'Very weak';
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
          <ThemeIcon color="green" size="md" radius="md">
            <IconSortAscending size={16} />
          </ThemeIcon>
          <Text fw={600} size="sm">{data.label || 'Feature Importance'}</Text>
        </Group>
        <Group gap={5}>
          <Badge 
            color={getMethodColor(method)}
            variant="filled"
            size="sm"
          >
            {getMethodName(method)}
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
          <IconTarget size={10} />
        </ThemeIcon>
        <Text size="xs">Target: <Text span fw={500}>{targetColumn}</Text></Text>
      </Group>
      
      <Text size="xs" mb="xs">Top Features: <Text span fw={500}>{topFeatures}</Text></Text>
      
      <Collapse in={expanded}>
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">Feature Ranking:</Text>
        <Stack gap="xs">
          {features.slice(0, topFeatures).map((feature, index) => (
            <Box key={index}>
              <Group gap={5} mb={2} justify="space-between">
                <Group gap={5}>
                  <Badge size="xs" variant="filled" color={index < 3 ? 'green' : 'gray'}>
                    {index + 1}
                  </Badge>
                  <Text size="xs" fw={500}>{feature.name}</Text>
                </Group>
                <Badge 
                  size="xs" 
                  color={getImportanceColor(feature.score)}
                >
                  {getImportanceDescription(feature.score)}
                </Badge>
              </Group>
              <Progress 
                value={feature.score * 100} 
                color={getImportanceColor(feature.score)} 
                size="xs" 
                mb={5}
              />
              {feature.description && (
                <Text size="xs" c="dimmed">{feature.description}</Text>
              )}
            </Box>
          ))}
        </Stack>
        
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">Method Description:</Text>
        <Text size="xs" c="dimmed">
          {method === 'random_forest' && 'Uses Random Forest model to calculate feature importance based on Gini impurity or entropy reduction.'}
          {method === 'permutation' && 'Measures importance by randomly shuffling feature values and observing the decrease in model performance.'}
          {method === 'shap' && 'Uses SHAP (SHapley Additive exPlanations) values to explain the output of the model.'}
        </Text>
      </Collapse>
      
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </Box>
  );
};

export default FeatureImportanceNode; 
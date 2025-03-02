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
  IconBinaryTree,
  IconTarget,
  IconChartPie,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { WorkflowNodeData } from './types';

interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  auc?: number;
  confusion_matrix?: [number, number, number, number]; // [TP, FP, FN, TN]
}

interface BinaryClassifierNodeProps extends NodeProps {
  data: WorkflowNodeData & {
    modelType?: 'logistic_regression' | 'random_forest' | 'svm' | 'xgboost';
    targetColumn?: string;
    testSize?: number;
    crossValidation?: boolean;
    metrics?: ModelMetrics;
    status?: 'idle' | 'training' | 'completed' | 'error';
  };
}

export const BinaryClassifierNode: React.FC<BinaryClassifierNodeProps> = ({ data, selected }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Default values
  const modelType = data.modelType || 'logistic_regression';
  const targetColumn = data.targetColumn || 'target';
  const testSize = data.testSize || 0.2;
  const crossValidation = data.crossValidation !== undefined ? data.crossValidation : false;
  const status = data.status || 'idle';
  
  // Sample metrics
  const metrics = data.metrics || {
    accuracy: 0.85,
    precision: 0.82,
    recall: 0.79,
    f1: 0.80,
    auc: 0.88,
    confusion_matrix: [150, 33, 40, 177] // [TP, FP, FN, TN]
  };
  
  // Get model name
  const getModelName = (model: string) => {
    switch (model) {
      case 'logistic_regression': return 'Logistic Regression';
      case 'random_forest': return 'Random Forest';
      case 'svm': return 'Support Vector Machine';
      case 'xgboost': return 'XGBoost';
      default: return model;
    }
  };
  
  // Get model color
  const getModelColor = (model: string) => {
    switch (model) {
      case 'logistic_regression': return 'blue';
      case 'random_forest': return 'green';
      case 'svm': return 'violet';
      case 'xgboost': return 'orange';
      default: return 'gray';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'gray';
      case 'training': return 'blue';
      case 'completed': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };
  
  // Get metric color
  const getMetricColor = (value: number) => {
    if (value >= 0.8) return 'green';
    if (value >= 0.6) return 'blue';
    if (value >= 0.4) return 'yellow';
    return 'red';
  };
  
  // Calculate confusion matrix metrics
  const calculateConfusionMetrics = () => {
    if (!metrics.confusion_matrix) return null;
    
    const [tp, fp, fn, tn] = metrics.confusion_matrix;
    const total = tp + fp + fn + tn;
    
    return {
      tp,
      fp,
      fn,
      tn,
      tpRate: tp / (tp + fn), // Sensitivity/Recall
      tnRate: tn / (tn + fp), // Specificity
      tpPercent: (tp / total) * 100,
      fpPercent: (fp / total) * 100,
      fnPercent: (fn / total) * 100,
      tnPercent: (tn / total) * 100
    };
  };
  
  const confusionMetrics = calculateConfusionMetrics();
  
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
          <ThemeIcon color={getModelColor(modelType)} size="md" radius="md">
            <IconBinaryTree size={16} />
          </ThemeIcon>
          <Text fw={600} size="sm">{data.label || 'Binary Classifier'}</Text>
        </Group>
        <Group gap={5}>
          <Badge 
            color={getStatusColor(status)}
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
      
      <Group mb="xs" align="center">
        <ThemeIcon size="xs" color="blue" radius="xl">
          <IconTarget size={10} />
        </ThemeIcon>
        <Text size="xs">Target: <Text span fw={500}>{targetColumn}</Text></Text>
      </Group>
      
      <Group mb="xs">
        <Badge color={getModelColor(modelType)} size="xs">
          {getModelName(modelType)}
        </Badge>
        <Badge color="gray" size="xs">
          Test: {testSize * 100}%
        </Badge>
        {crossValidation && (
          <Badge color="blue" size="xs">
            Cross-Validation
          </Badge>
        )}
      </Group>
      
      <Collapse in={expanded}>
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">Model Performance:</Text>
        <SimpleGrid cols={2} spacing="xs" mb="md">
          <Box>
            <Text size="xs" mb={2}>Accuracy</Text>
            <Group gap={5} align="center">
              <Progress 
                value={metrics.accuracy ? metrics.accuracy * 100 : 0} 
                color={getMetricColor(metrics.accuracy || 0)} 
                size="xs" 
                style={{ flex: 1 }}
              />
              <Text size="xs" fw={500}>{metrics.accuracy ? (metrics.accuracy * 100).toFixed(1) : 0}%</Text>
            </Group>
          </Box>
          
          <Box>
            <Text size="xs" mb={2}>Precision</Text>
            <Group gap={5} align="center">
              <Progress 
                value={metrics.precision ? metrics.precision * 100 : 0} 
                color={getMetricColor(metrics.precision || 0)} 
                size="xs" 
                style={{ flex: 1 }}
              />
              <Text size="xs" fw={500}>{metrics.precision ? (metrics.precision * 100).toFixed(1) : 0}%</Text>
            </Group>
          </Box>
          
          <Box>
            <Text size="xs" mb={2}>Recall</Text>
            <Group gap={5} align="center">
              <Progress 
                value={metrics.recall ? metrics.recall * 100 : 0} 
                color={getMetricColor(metrics.recall || 0)} 
                size="xs" 
                style={{ flex: 1 }}
              />
              <Text size="xs" fw={500}>{metrics.recall ? (metrics.recall * 100).toFixed(1) : 0}%</Text>
            </Group>
          </Box>
          
          <Box>
            <Text size="xs" mb={2}>F1 Score</Text>
            <Group gap={5} align="center">
              <Progress 
                value={metrics.f1 ? metrics.f1 * 100 : 0} 
                color={getMetricColor(metrics.f1 || 0)} 
                size="xs" 
                style={{ flex: 1 }}
              />
              <Text size="xs" fw={500}>{metrics.f1 ? (metrics.f1 * 100).toFixed(1) : 0}%</Text>
            </Group>
          </Box>
        </SimpleGrid>
        
        {confusionMetrics && (
          <>
            <Text size="xs" fw={600} mb="xs">Confusion Matrix:</Text>
            <SimpleGrid cols={2} spacing={1} mb="md">
              <Box style={{ 
                backgroundColor: 'var(--mantine-color-green-1)', 
                padding: '8px',
                borderRadius: '4px 0 0 0'
              }}>
                <Group gap={5} justify="center">
                  <IconCheck size={12} color="var(--mantine-color-green-6)" />
                  <Text size="xs" fw={500} c="green">TP: {confusionMetrics.tp}</Text>
                </Group>
                <Text size="xs" ta="center" c="dimmed">
                  {confusionMetrics.tpPercent.toFixed(1)}%
                </Text>
              </Box>
              
              <Box style={{ 
                backgroundColor: 'var(--mantine-color-red-1)', 
                padding: '8px',
                borderRadius: '0 4px 0 0'
              }}>
                <Group gap={5} justify="center">
                  <IconX size={12} color="var(--mantine-color-red-6)" />
                  <Text size="xs" fw={500} c="red">FP: {confusionMetrics.fp}</Text>
                </Group>
                <Text size="xs" ta="center" c="dimmed">
                  {confusionMetrics.fpPercent.toFixed(1)}%
                </Text>
              </Box>
              
              <Box style={{ 
                backgroundColor: 'var(--mantine-color-red-1)', 
                padding: '8px',
                borderRadius: '0 0 0 4px'
              }}>
                <Group gap={5} justify="center">
                  <IconX size={12} color="var(--mantine-color-red-6)" />
                  <Text size="xs" fw={500} c="red">FN: {confusionMetrics.fn}</Text>
                </Group>
                <Text size="xs" ta="center" c="dimmed">
                  {confusionMetrics.fnPercent.toFixed(1)}%
                </Text>
              </Box>
              
              <Box style={{ 
                backgroundColor: 'var(--mantine-color-green-1)', 
                padding: '8px',
                borderRadius: '0 0 4px 0'
              }}>
                <Group gap={5} justify="center">
                  <IconCheck size={12} color="var(--mantine-color-green-6)" />
                  <Text size="xs" fw={500} c="green">TN: {confusionMetrics.tn}</Text>
                </Group>
                <Text size="xs" ta="center" c="dimmed">
                  {confusionMetrics.tnPercent.toFixed(1)}%
                </Text>
              </Box>
            </SimpleGrid>
          </>
        )}
        
        <Divider my="xs" />
        
        <Text size="xs" fw={600} mb="xs">Model Description:</Text>
        <Text size="xs" c="dimmed">
          {modelType === 'logistic_regression' && 'A linear model that uses a logistic function to model a binary dependent variable.'}
          {modelType === 'random_forest' && 'An ensemble learning method that constructs multiple decision trees during training.'}
          {modelType === 'svm' && 'A supervised learning model that analyzes data for classification and regression analysis.'}
          {modelType === 'xgboost' && 'An optimized distributed gradient boosting library designed to be highly efficient and flexible.'}
        </Text>
      </Collapse>
      
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </Box>
  );
};

export default BinaryClassifierNode; 
import React from 'react';
import {
  Paper,
  Text,
  Group,
  Stack,
  ThemeIcon,
  Badge,
  Card,
  SimpleGrid,
  RingProgress,
  useMantineTheme,
  Table,
} from '@mantine/core';
import {
  IconChartBar,
  IconChartPie,
  IconChartLine,
  IconBrain,
  IconCheck,
  IconX,
  IconPercentage,
  IconInfoCircle,
} from '@tabler/icons-react';

interface ResultsVisualizationProps {
  results: any;
}

export function ResultsVisualization({ results }: ResultsVisualizationProps) {
  const theme = useMantineTheme();
  
  if (!results) {
    return (
      <Paper p="md" withBorder>
        <Text>No results available.</Text>
      </Paper>
    );
  }

  // Mock classification results for demo purposes
  // In a real implementation, this would come from the actual results
  const classificationResults = {
    accuracy: 0.87,
    precision: 0.83,
    recall: 0.79,
    f1_score: 0.81,
    confusion_matrix: [
      [120, 18],
      [25, 95]
    ],
    feature_importance: {
      'MonthlyCharges': 0.28,
      'TotalCharges': 0.22,
      'tenure': 0.18,
      'Contract': 0.12,
      'InternetService': 0.08,
      'PaymentMethod': 0.07,
      'OnlineSecurity': 0.05
    }
  };

  return (
    <Stack gap="xl">
      {/* Overall Results */}
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group>
              <ThemeIcon size="lg" radius="md" color="green">
                <IconCheck size={20} />
              </ThemeIcon>
              <div>
                <Text fw={700}>Workflow Results</Text>
                <Text size="sm" c="dimmed">
                  Execution completed successfully
                </Text>
              </div>
            </Group>
            <Badge size="lg" color="green">Success</Badge>
          </Group>
        </Stack>
      </Paper>

      {/* Performance Metrics */}
      <Paper p="md" withBorder>
        <Text fw={700} mb="md">Model Performance</Text>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Card withBorder>
            <Stack gap="md" align="center">
              <Text fw={600}>Accuracy</Text>
              <RingProgress
                size={120}
                thickness={12}
                sections={[{ value: classificationResults.accuracy * 100, color: 'blue' }]}
                label={
                  <Text fw={700} ta="center" size="xl">
                    {(classificationResults.accuracy * 100).toFixed(1)}%
                  </Text>
                }
              />
            </Stack>
          </Card>
          
          <Card withBorder>
            <Stack gap="md" align="center">
              <Text fw={600}>Precision</Text>
              <RingProgress
                size={120}
                thickness={12}
                sections={[{ value: classificationResults.precision * 100, color: 'green' }]}
                label={
                  <Text fw={700} ta="center" size="xl">
                    {(classificationResults.precision * 100).toFixed(1)}%
                  </Text>
                }
              />
            </Stack>
          </Card>
          
          <Card withBorder>
            <Stack gap="md" align="center">
              <Text fw={600}>Recall</Text>
              <RingProgress
                size={120}
                thickness={12}
                sections={[{ value: classificationResults.recall * 100, color: 'orange' }]}
                label={
                  <Text fw={700} ta="center" size="xl">
                    {(classificationResults.recall * 100).toFixed(1)}%
                  </Text>
                }
              />
            </Stack>
          </Card>
          
          <Card withBorder>
            <Stack gap="md" align="center">
              <Text fw={600}>F1 Score</Text>
              <RingProgress
                size={120}
                thickness={12}
                sections={[{ value: classificationResults.f1_score * 100, color: 'violet' }]}
                label={
                  <Text fw={700} ta="center" size="xl">
                    {(classificationResults.f1_score * 100).toFixed(1)}%
                  </Text>
                }
              />
            </Stack>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* Confusion Matrix */}
      <Paper p="md" withBorder>
        <Text fw={700} mb="md">Confusion Matrix</Text>
        <Group justify="center">
          <div style={{ width: '300px', height: '300px', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '150px', 
              height: '150px', 
              backgroundColor: theme.colors.green[1],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${theme.colors.gray[3]}`,
            }}>
              <Text fw={700} size="xl">{classificationResults.confusion_matrix[0][0]}</Text>
              <Text size="xs" c="dimmed" style={{ position: 'absolute', top: 5, left: 5 }}>True Negative</Text>
            </div>
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              width: '150px', 
              height: '150px', 
              backgroundColor: theme.colors.red[1],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${theme.colors.gray[3]}`,
            }}>
              <Text fw={700} size="xl">{classificationResults.confusion_matrix[0][1]}</Text>
              <Text size="xs" c="dimmed" style={{ position: 'absolute', top: 5, right: 5 }}>False Positive</Text>
            </div>
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              width: '150px', 
              height: '150px', 
              backgroundColor: theme.colors.red[1],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${theme.colors.gray[3]}`,
            }}>
              <Text fw={700} size="xl">{classificationResults.confusion_matrix[1][0]}</Text>
              <Text size="xs" c="dimmed" style={{ position: 'absolute', bottom: 5, left: 5 }}>False Negative</Text>
            </div>
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              right: 0, 
              width: '150px', 
              height: '150px', 
              backgroundColor: theme.colors.green[1],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${theme.colors.gray[3]}`,
            }}>
              <Text fw={700} size="xl">{classificationResults.confusion_matrix[1][1]}</Text>
              <Text size="xs" c="dimmed" style={{ position: 'absolute', bottom: 5, right: 5 }}>True Positive</Text>
            </div>
            <Text style={{ position: 'absolute', top: '50%', left: '-30px', transform: 'translateY(-50%) rotate(-90deg)' }}>
              Actual
            </Text>
            <Text style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)' }}>
              Predicted
            </Text>
          </div>
        </Group>
      </Paper>

      {/* Feature Importance */}
      <Paper p="md" withBorder>
        <Text fw={700} mb="md">Feature Importance</Text>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Feature</Table.Th>
              <Table.Th>Importance</Table.Th>
              <Table.Th>Visualization</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Object.entries(classificationResults.feature_importance)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([feature, importance]) => (
                <Table.Tr key={feature}>
                  <Table.Td>{feature}</Table.Td>
                  <Table.Td>{(importance as number * 100).toFixed(1)}%</Table.Td>
                  <Table.Td>
                    <div style={{ width: '100%', height: '20px', backgroundColor: theme.colors.gray[2], borderRadius: '4px' }}>
                      <div 
                        style={{ 
                          width: `${(importance as number) * 100}%`, 
                          height: '100%', 
                          backgroundColor: theme.colors.blue[6],
                          borderRadius: '4px'
                        }} 
                      />
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Node Results */}
      <Paper p="md" withBorder>
        <Text fw={700} mb="md">Node Results</Text>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {Object.entries(results.node_results || {}).map(([nodeId, nodeResult]: [string, any]) => (
            <Card key={nodeId} withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={700}>{nodeResult.label || nodeId}</Text>
                  <Badge color="green">Completed</Badge>
                </Group>
                
                {nodeResult.execution_time && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Execution Time:</Text>
                    <Text size="sm">{nodeResult.execution_time.toFixed(2)}s</Text>
                  </Group>
                )}
                
                {nodeResult.memory_usage && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Memory Usage:</Text>
                    <Text size="sm">{(nodeResult.memory_usage / (1024 * 1024)).toFixed(2)} MB</Text>
                  </Group>
                )}
                
                {nodeResult.output_summary && (
                  <Stack gap="xs">
                    <Text size="sm" fw={600}>Output Summary:</Text>
                    {Object.entries(nodeResult.output_summary).map(([key, value]: [string, any]) => (
                      <Group key={key} justify="space-between">
                        <Text size="xs" c="dimmed">{key}:</Text>
                        <Text size="xs">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Text>
                      </Group>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Paper>
    </Stack>
  );
} 
import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Group, 
  Stack,
  Button,
  Select,
  MultiSelect,
  ThemeIcon,
  Table,
  ScrollArea,
  Badge,
  Progress,
  Grid,
  Box,
} from '@mantine/core';
import { 
  IconFileAnalytics,
  IconRefresh,
  IconChartBar,
  IconBinaryTree,
  IconBulb,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Column {
  value: string;
  label: string;
  type: string;
}

interface FeatureImportance {
  feature: string;
  importance: number;
  type: string;
  description: string;
  metrics: {
    correlation?: number;
    mutual_info?: number;
    permutation?: number;
    shap?: number;
  };
}

interface AnalysisResult {
  target: string;
  method: string;
  features: FeatureImportance[];
  performance: {
    metric: string;
    value: number;
    baseline: number;
  }[];
}

export function FeatureImportancePage() {
  const [target, setTarget] = useState<string>('');
  const [method, setMethod] = useState<string>('random_forest');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: columnsData, isLoading: isLoadingColumns, error: columnsError } = useQuery<{ columns: Column[] }>({
    queryKey: ['columns'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/datasets/active/columns');
      if (!response.ok) throw new Error('Failed to fetch columns');
      return response.json();
    },
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery<AnalysisResult>({
    queryKey: ['feature-importance', target, method, selectedFeatures],
    queryFn: async () => {
      if (!target) return null;
      const response = await fetch('/api/features/importance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          method,
          features: selectedFeatures.length ? selectedFeatures : undefined,
        }),
      });
      if (!response.ok) throw new Error('Failed to analyze feature importance');
      return response.json();
    },
    enabled: !!target,
  });

  const renderImportanceBar = (value: number) => (
    <Progress
      value={value * 100}
      size="xl"
      radius="xl"
      color="blue"
    />
  );

  const columns = columnsData?.columns || [];
  const columnOptions = columns.map(col => ({
    value: col.value,
    label: col.label,
  }));

  if (isLoadingColumns) {
    return (
      <Container size="xl" py="xl">
        <Card withBorder shadow="sm" p="xl">
          <Text>Loading columns...</Text>
        </Card>
      </Container>
    );
  }

  if (columnsError) {
    return (
      <Container size="xl" py="xl">
        <Card withBorder shadow="sm" p="xl" color="red">
          <Text>Error loading columns: {columnsError instanceof Error ? columnsError.message : 'Unknown error'}</Text>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Card withBorder shadow="sm" p="xl">
          <Stack gap="md">
            <Group>
              <ThemeIcon size={40} radius="md" variant="light" color="blue">
                <IconFileAnalytics size={20} />
              </ThemeIcon>
              <div>
                <Title order={2}>Feature Importance</Title>
                <Text c="dimmed">
                  Analyze the importance of features for prediction
                </Text>
              </div>
            </Group>

            <Grid>
              <Grid.Col span={4}>
                <Select
                  label="Target Variable"
                  placeholder="Select target"
                  data={Array.isArray(columnOptions) ? columnOptions.filter(item => item) : []}
                  value={target}
                  onChange={(value) => setTarget(value || '')}
                  clearable
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label="Analysis Method"
                  placeholder="Select method"
                  data={[
                    { value: 'random_forest', label: 'Random Forest' },
                    { value: 'xgboost', label: 'XGBoost' },
                    { value: 'correlation', label: 'Correlation Analysis' },
                    { value: 'mutual_info', label: 'Mutual Information' },
                    { value: 'permutation', label: 'Permutation Importance' },
                    { value: 'shap', label: 'SHAP Values' },
                  ]}
                  value={method}
                  onChange={(value) => setMethod(value || 'random_forest')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <MultiSelect
                  label="Feature Selection"
                  placeholder="Select features (optional)"
                  data={Array.isArray(columnOptions) ? columnOptions.filter(col => col.value !== target && col) : []}
                  value={selectedFeatures}
                  onChange={setSelectedFeatures}
                  clearable
                  searchable
                />
              </Grid.Col>
            </Grid>

            {analysis && (
              <Stack gap="md">
                <Card withBorder>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Text fw={500}>Model Performance</Text>
                      <Group>
                        {analysis.performance.map((metric, index) => (
                          <Group key={index} gap={4}>
                            <Text size="sm">{metric.metric}:</Text>
                            <Text size="sm" fw={500} c="blue">
                              {metric.value.toFixed(3)}
                            </Text>
                            <Text size="sm" c="dimmed">
                              (baseline: {metric.baseline.toFixed(3)})
                            </Text>
                          </Group>
                        ))}
                      </Group>
                    </Group>
                  </Stack>
                </Card>

                <Card withBorder>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Text fw={500}>Feature Importance Ranking</Text>
                      <Button
                        variant="light"
                        leftSection={<IconRefresh size={16} />}
                        onClick={() => queryClient.invalidateQueries({ 
                          queryKey: ['feature-importance'] 
                        })}
                      >
                        Refresh
                      </Button>
                    </Group>

                    <ScrollArea>
                      <Table>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Feature</Table.Th>
                            <Table.Th>Type</Table.Th>
                            <Table.Th>Importance</Table.Th>
                            <Table.Th>Details</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {(analysis?.features || [])
                            .sort((a, b) => b.importance - a.importance)
                            .map((feature, index) => (
                              <Table.Tr key={feature.feature}>
                                <Table.Td>
                                  <Group gap={4}>
                                    <Text>{feature.feature}</Text>
                                    {index < 3 && (
                                      <ThemeIcon 
                                        size="sm" 
                                        variant="light" 
                                        color={
                                          index === 0 ? 'yellow' :
                                          index === 1 ? 'gray' :
                                          'orange'
                                        }
                                      >
                                        <IconBulb size={12} />
                                      </ThemeIcon>
                                    )}
                                  </Group>
                                </Table.Td>
                                <Table.Td>
                                  <Badge>{feature.type}</Badge>
                                </Table.Td>
                                <Table.Td style={{ width: '30%' }}>
                                  {renderImportanceBar(feature.importance)}
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm" c="dimmed">
                                    {feature.description}
                                  </Text>
                                </Table.Td>
                              </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>

                    {method === 'shap' && (
                      <Text size="sm" c="dimmed" ta="center">
                        Note: SHAP values show both magnitude and direction of feature impact.
                        Positive values indicate the feature increases the prediction, while
                        negative values indicate it decreases the prediction.
                      </Text>
                    )}
                  </Stack>
                </Card>
              </Stack>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 
import React, { useState } from 'react';
import { Container, Stack, Select, MultiSelect, Button, Group, Text, Card, NumberInput, Switch, Tabs, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconChartHistogram } from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageHeader } from '../components/ui/PageHeader';
import { datasetsApi } from '@/api';

interface ClassificationConfig {
  target: string;
  features: string[];
  method: string;
  params: Record<string, any>;
  resampling?: {
    enabled: boolean;
    method: string;
    ratio: number;
  };
}

export function ClassificationPage() {
  const [config, setConfig] = useState<ClassificationConfig>({
    target: '',
    features: [],
    method: 'logistic_regression',
    params: {},
    resampling: {
      enabled: false,
      method: 'smote',
      ratio: 1.0
    }
  });

  const { data: columnsData, isLoading, error } = useQuery({
    queryKey: ['active-columns'],
    queryFn: async () => {
      const response = await datasetsApi.getActiveColumns();
      return {
        columns: response.data.map(col => ({ value: col, label: col }))
      };
    }
  });

  const featureOptions = columnsData?.columns || [];

  const trainMutation = useMutation({
    mutationFn: async (classificationConfig: ClassificationConfig) => {
      const response = await datasetsApi.classify(classificationConfig);
      return response.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Model trained successfully',
        color: 'green'
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to train model',
        color: 'red'
      });
    }
  });

  const renderMethodParams = () => {
    switch (config.method) {
      case 'logistic_regression':
        return (
          <>
            <NumberInput
              label="Regularization (C)"
              description="Inverse of regularization strength"
              value={config.params.C || 1.0}
              onChange={(value) => setConfig({
                ...config,
                params: { ...config.params, C: value }
              })}
              min={0.0001}
              step={0.1}
            />
            <Switch
              label="Class Weights"
              description="Automatically adjust weights for imbalanced classes"
              checked={config.params.class_weight === 'balanced'}
              onChange={(e) => setConfig({
                ...config,
                params: { ...config.params, class_weight: e.currentTarget.checked ? 'balanced' : null }
              })}
            />
          </>
        );
      case 'random_forest':
        return (
          <>
            <NumberInput
              label="Number of Trees"
              description="Number of trees in the forest"
              value={config.params.n_estimators || 100}
              onChange={(value) => setConfig({
                ...config,
                params: { ...config.params, n_estimators: value }
              })}
              min={10}
            />
            <NumberInput
              label="Max Depth"
              description="Maximum depth of the trees"
              value={config.params.max_depth || 10}
              onChange={(value) => setConfig({
                ...config,
                params: { ...config.params, max_depth: value }
              })}
              min={1}
            />
          </>
        );
      case 'svm':
        return (
          <>
            <Select
              label="Kernel"
              description="Type of kernel function"
              data={[
                { value: 'linear', label: 'Linear' },
                { value: 'rbf', label: 'RBF' },
                { value: 'poly', label: 'Polynomial' }
              ]}
              value={config.params.kernel || 'rbf'}
              onChange={(value) => setConfig({
                ...config,
                params: { ...config.params, kernel: value }
              })}
            />
            <NumberInput
              label="C Parameter"
              description="Regularization parameter"
              value={config.params.C || 1.0}
              onChange={(value) => setConfig({
                ...config,
                params: { ...config.params, C: value }
              })}
              min={0.0001}
              step={0.1}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container size="xl" py="xl" style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <Card withBorder shadow="sm" p="xl">
        <Tabs defaultValue="model">
          <Tabs.List>
            <Tabs.Tab value="model">Model Configuration</Tabs.Tab>
            <Tabs.Tab value="resampling">Resampling</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="model" pt="xl">
            <Stack gap="lg">
              <Group>
                <Select
                  label="Target Variable"
                  description="Select the classification target variable"
                  data={columnsData?.columns || []}
                  value={config.target}
                  onChange={(value) => setConfig({ ...config, target: value || '' })}
                  searchable
                  clearable
                />
              </Group>
              <Group>
                <MultiSelect
                  label="Feature Variables"
                  description="Select features for classification"
                  data={featureOptions.filter(opt => opt.value !== config.target)}
                  value={config.features}
                  onChange={(value) => setConfig({ ...config, features: value })}
                  searchable
                  clearable
                />
              </Group>
              <Select
                label="Classification Method"
                description="Choose the classification algorithm"
                data={[
                  { value: 'logistic_regression', label: 'Logistic Regression' },
                  { value: 'random_forest', label: 'Random Forest' },
                  { value: 'svm', label: 'Support Vector Machine' }
                ]}
                value={config.method}
                onChange={(value) => setConfig({
                  ...config,
                  method: value || 'logistic_regression',
                  params: {} // Reset params when method changes
                })}
              />
              {renderMethodParams()}
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="resampling" pt="xl">
            <Stack gap="lg">
              <Switch
                label="Enable Resampling"
                description="Apply resampling techniques for imbalanced classes"
                checked={config.resampling?.enabled}
                onChange={(e) => setConfig({
                  ...config,
                  resampling: { ...config.resampling!, enabled: e.currentTarget.checked }
                })}
              />
              {config.resampling?.enabled && (
                <>
                  <Select
                    label="Resampling Method"
                    description="Choose the resampling technique"
                    data={[
                      { value: 'smote', label: 'SMOTE' },
                      { value: 'random_over', label: 'Random Oversampling' },
                      { value: 'random_under', label: 'Random Undersampling' },
                      { value: 'adasyn', label: 'ADASYN' }
                    ]}
                    value={config.resampling.method}
                    onChange={(value) => setConfig({
                      ...config,
                      resampling: { ...config.resampling!, method: value || 'smote' }
                    })}
                  />
                  <NumberInput
                    label="Sampling Ratio"
                    description="Ratio of minority to majority class after resampling"
                    value={config.resampling.ratio}
                    onChange={(value) => setConfig({
                      ...config,
                      resampling: { ...config.resampling!, ratio: typeof value === 'number' ? value : 1.0 }
                    })}
                    min={0.1}
                    step={0.1}
                  />
                </>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
        <Group justify="flex-end" mt="xl">
          <Button
            onClick={() => trainMutation.mutate(config)}
            loading={trainMutation.isPending}
            leftSection={<IconChartHistogram size={16} />}
            disabled={!config.target || config.features.length === 0}
          >
            Train Model
          </Button>
        </Group>
      </Card>
    </Container>
  );
}

export default ClassificationPage; 
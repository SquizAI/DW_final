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
  rem,
  Table,
  ScrollArea,
  Badge,
  Tabs,
  Grid,
  Box,
  Progress,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { 
  IconChartBar,
  IconRefresh,
  IconChartHistogram,
  IconChartDots,
  IconChartPie,
  IconTable,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';

interface Column {
  name: string;
  type: string;
  stats: {
    count: number;
    missing: number;
    unique: number;
    mean?: number;
    std?: number;
    min?: number;
    max?: number;
    median?: number;
    mode?: any;
    quartiles?: number[];
    skewness?: number;
    kurtosis?: number;
    distribution?: {
      bins: number[];
      counts: number[];
    };
    correlations?: Record<string, number>;
    categories?: {
      value: any;
      count: number;
      percentage: number;
    }[];
  };
}

interface DataSummary {
  rowCount: number;
  columnCount: number;
  memoryUsage: number;
  duplicateRows: number;
  columns: Column[];
}

const renderDistributionBar = (value: number, max: number) => (
  <Progress
    value={(value / max) * 100}
    size="xl"
    radius="xl"
    color="blue"
  />
);

export function DataAnalysisPage() {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const { data: summary, isLoading, error } = useQuery<DataSummary>({
    queryKey: ['data-summary'],
    queryFn: async () => {
      const response = await fetch('/api/data/analyze');
      if (!response.ok) throw new Error('Failed to fetch data summary');
      return response.json();
    },
  });

  const renderColumnAnalysis = (column: Column) => {
    const stats = column.stats;

    if (column.type === 'number' || column.type === 'float' || column.type === 'integer') {
      return (
        <Group grow>
          <Stack gap="xs">
            <Group>
              <Text fw={500}>Distribution</Text>
              <Badge>{column.type}</Badge>
            </Group>
            {stats.distribution && (
              <Stack gap="xs">
                {stats.distribution.bins.map((bin, i) => (
                  <Stack key={i} gap={4}>
                    <Group justify="space-between">
                      <Text size="sm">{bin.toFixed(2)}</Text>
                      <Text size="sm" c="dimmed">
                        {stats.distribution!.counts[i]}
                      </Text>
                    </Group>
                    {renderDistributionBar(
                      stats.distribution!.counts[i],
                      Math.max(...stats.distribution!.counts)
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
          <Stack gap="xs">
            <Text fw={500}>Summary Statistics</Text>
            <Card withBorder>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm">Count</Text>
                  <Text size="sm">{stats.count}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Missing</Text>
                  <Text size="sm">{stats.missing} ({((stats.missing / stats.count) * 100).toFixed(1)}%)</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Mean</Text>
                  <Text size="sm">{stats.mean?.toFixed(2)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Std Dev</Text>
                  <Text size="sm">{stats.std?.toFixed(2)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Min</Text>
                  <Text size="sm">{stats.min?.toFixed(2)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Max</Text>
                  <Text size="sm">{stats.max?.toFixed(2)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Median</Text>
                  <Text size="sm">{stats.median?.toFixed(2)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Skewness</Text>
                  <Text size="sm">{stats.skewness?.toFixed(2)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Kurtosis</Text>
                  <Text size="sm">{stats.kurtosis?.toFixed(2)}</Text>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Group>
      );
    }

    if (column.type === 'string' || column.type === 'category') {
      return (
        <Stack gap="xs">
          <Group>
            <Text fw={500}>Value Distribution</Text>
            <Badge>{column.type}</Badge>
          </Group>
          {stats.categories && (
            <Stack gap="xs">
              {stats.categories.map((cat, i) => (
                <Stack key={i} gap={4}>
                  <Group justify="space-between">
                    <Text size="sm">{cat.value.toString()}</Text>
                    <Group gap={8}>
                      <Text size="sm" c="dimmed">
                        {cat.count} ({cat.percentage.toFixed(1)}%)
                      </Text>
                    </Group>
                  </Group>
                  {renderDistributionBar(
                    cat.count,
                    Math.max(...stats.categories!.map(c => c.count))
                  )}
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      );
    }

    return (
      <Text c="dimmed">Analysis not available for this column type.</Text>
    );
  };

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
          variant="filled"
        >
          Failed to load data analysis. Please make sure you have an active dataset and the backend server is running.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Card withBorder shadow="sm" p="xl" pos="relative">
          <LoadingOverlay visible={isLoading} />
          <Stack gap="md">
            <Group>
              <ThemeIcon size={40} radius="md" variant="light" color="blue">
                <IconChartBar size={20} stroke={1.5} />
              </ThemeIcon>
              <div>
                <Title order={2}>Data Analysis</Title>
                <Text c="dimmed">
                  Analyze and understand your data
                </Text>
              </div>
            </Group>

            {summary && (
              <Card withBorder>
                <Stack gap="md">
                  <Text fw={500}>Dataset Overview</Text>
                  <Group grow>
                    <Card withBorder>
                      <Stack gap={0} align="center">
                        <Text fw={500} mt="xs">{summary.rowCount?.toLocaleString() || '0'}</Text>
                        <Text size="sm" c="dimmed">Rows</Text>
                      </Stack>
                    </Card>
                    <Card withBorder>
                      <Stack gap={0} align="center">
                        <Text fw={500} mt="xs">{summary.columnCount || '0'}</Text>
                        <Text size="sm" c="dimmed">Columns</Text>
                      </Stack>
                    </Card>
                    <Card withBorder>
                      <Stack gap={0} align="center">
                        <Text fw={500} mt="xs">{((summary.memoryUsage || 0) / 1024 / 1024).toFixed(1)} MB</Text>
                        <Text size="sm" c="dimmed">Memory Usage</Text>
                      </Stack>
                    </Card>
                    <Card withBorder>
                      <Stack gap={0} align="center">
                        <Text fw={500} mt="xs">{summary.duplicateRows || '0'}</Text>
                        <Text size="sm" c="dimmed">Duplicate Rows</Text>
                      </Stack>
                    </Card>
                  </Group>
                </Stack>
              </Card>
            )}

            {summary?.columns && (
              <MultiSelect
                label="Select Columns for Analysis"
                placeholder="Choose columns to analyze"
                data={summary.columns.map(col => ({
                  value: col.name,
                  label: `${col.name} (${col.type})`,
                }))}
                value={selectedColumns}
                onChange={setSelectedColumns}
              />
            )}

            {selectedColumns.map(colName => {
              const column = summary?.columns?.find(col => col.name === colName);
              if (!column) return null;
              return (
                <Card key={colName} withBorder>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Group>
                        <Text fw={500}>{column.name}</Text>
                        <Badge>{column.type}</Badge>
                      </Group>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">
                          {column.stats.missing} missing
                        </Text>
                        <Text size="sm" c="dimmed">•</Text>
                        <Text size="sm" c="dimmed">
                          {column.stats.unique} unique
                        </Text>
                      </Group>
                    </Group>
                    {renderColumnAnalysis(column)}
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 
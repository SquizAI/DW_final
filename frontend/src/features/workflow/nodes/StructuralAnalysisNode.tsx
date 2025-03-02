import React, { useState } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Button,
  Progress,
  Badge,
  ActionIcon,
  Tooltip,
  Menu,
  Modal,
  Tabs,
  Code,
  ScrollArea,
  Table,
  ThemeIcon,
  Accordion,
} from '@mantine/core';
import {
  IconDatabase,
  IconEye,
  IconSettings,
  IconDownload,
  IconTable,
  IconChartBar,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconRefresh,
  IconList,
  IconBraces,
  IconCalendar,
  IconNumbers,
  IconLetterCase,
  IconPercentage,
} from '@tabler/icons-react';
import { Handle, Position } from 'reactflow';
import { notifications } from '@mantine/notifications';
import { StructuralAnalysisNodeData } from './types';

interface ColumnAnalysis {
  name: string;
  type: string;
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  uniquePercentage: number;
  min?: string | number;
  max?: string | number;
  mean?: number;
  mode?: string;
  pattern?: string;
  examples: string[];
  issues: string[];
}

interface DatasetStructure {
  rowCount: number;
  columnCount: number;
  memoryUsage: string;
  columns: ColumnAnalysis[];
  correlations: Array<{
    column1: string;
    column2: string;
    correlation: number;
  }>;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    column?: string;
  }>;
}

interface StructuralAnalysisNodeProps {
  data: StructuralAnalysisNodeData;
  selected: boolean;
}

export function StructuralAnalysisNode({ data, selected }: StructuralAnalysisNodeProps) {
  const [analysis, setAnalysis] = useState<DatasetStructure | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'number':
      case 'integer':
      case 'float':
        return <IconNumbers size={16} />;
      case 'string':
      case 'text':
        return <IconLetterCase size={16} />;
      case 'date':
      case 'datetime':
        return <IconCalendar size={16} />;
      case 'boolean':
        return <IconBraces size={16} />;
      default:
        return <IconList size={16} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Mock analysis - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnalysis({
        rowCount: 10000,
        columnCount: 8,
        memoryUsage: '2.5MB',
        columns: [
          {
            name: 'id',
            type: 'integer',
            nullCount: 0,
            nullPercentage: 0,
            uniqueCount: 10000,
            uniquePercentage: 100,
            min: '1',
            max: '10000',
            examples: ['1', '2', '3', '4', '5'],
            issues: [],
          },
          {
            name: 'name',
            type: 'string',
            nullCount: 50,
            nullPercentage: 0.5,
            uniqueCount: 9500,
            uniquePercentage: 95,
            pattern: '[A-Z][a-z]+',
            examples: ['John', 'Jane', 'Alice', 'Bob', 'Charlie'],
            issues: ['Contains 50 null values'],
          },
          {
            name: 'age',
            type: 'integer',
            nullCount: 100,
            nullPercentage: 1,
            uniqueCount: 80,
            uniquePercentage: 0.8,
            min: '18',
            max: '99',
            mean: 45.5,
            examples: ['25', '30', '35', '40', '45'],
            issues: ['Contains outliers', 'Contains null values'],
          },
        ],
        correlations: [
          {
            column1: 'age',
            column2: 'income',
            correlation: 0.75,
          },
        ],
        issues: [
          {
            type: 'missing_values',
            severity: 'medium',
            message: 'Several columns contain missing values',
            column: 'name',
          },
          {
            type: 'outliers',
            severity: 'high',
            message: 'Age column contains potential outliers',
            column: 'age',
          },
        ],
      });

      notifications.show({
        title: 'Success',
        message: 'Structural analysis completed',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to analyze dataset structure',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Group>
              <IconDatabase size={18} />
              <Text fw={500} size="sm">{data.label}</Text>
            </Group>
            <Group gap={8}>
              <Tooltip label="View Analysis">
                <ActionIcon 
                  variant="subtle" 
                  onClick={() => setShowAnalysis(true)}
                  disabled={!analysis}
                >
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
              <Menu position="bottom-end" shadow="md">
                <Menu.Target>
                  <ActionIcon variant="subtle">
                    <IconSettings size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Analysis Options</Menu.Label>
                  <Menu.Item leftSection={<IconTable size={14} />}>
                    Column Analysis
                  </Menu.Item>
                  <Menu.Item leftSection={<IconChartBar size={14} />}>
                    Data Profiling
                  </Menu.Item>
                  <Menu.Item leftSection={<IconAlertTriangle size={14} />}>
                    Issue Detection
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Card.Section>

        <Stack gap="xs" mt="md">
          <Button
            variant="light"
            leftSection={<IconRefresh size={14} />}
            onClick={handleAnalyze}
            loading={loading}
          >
            Analyze Structure
          </Button>

          {loading && (
            <Progress 
              value={65} 
              size="sm" 
              animated
              striped
            />
          )}

          {analysis && (
            <Stack gap="xs">
              <Group gap="xs">
                <Badge size="sm" variant="dot">
                  {analysis.rowCount.toLocaleString()} rows
                </Badge>
                <Badge size="sm" variant="dot">
                  {analysis.columnCount} columns
                </Badge>
                <Badge size="sm" variant="dot">
                  {analysis.memoryUsage}
                </Badge>
              </Group>
              {analysis.issues.length > 0 && (
                <Badge 
                  size="sm" 
                  color="yellow"
                  leftSection={<IconAlertTriangle size={12} />}
                >
                  {analysis.issues.length} issues found
                </Badge>
              )}
            </Stack>
          )}
        </Stack>

        <Handle type="target" position={Position.Left} id="input" />
        <Handle type="source" position={Position.Right} id="output" />
      </Card>

      <Modal
        opened={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        title="Structural Analysis"
        size="90%"
      >
        {analysis && (
          <Stack gap="md">
            <Tabs defaultValue="columns">
              <Tabs.List>
                <Tabs.Tab 
                  value="columns" 
                  leftSection={<IconTable size={14} />}
                >
                  Columns
                </Tabs.Tab>
                <Tabs.Tab 
                  value="issues" 
                  leftSection={<IconAlertTriangle size={14} />}
                >
                  Issues
                </Tabs.Tab>
                <Tabs.Tab 
                  value="correlations" 
                  leftSection={<IconChartBar size={14} />}
                >
                  Correlations
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="columns" pt="xs">
                <ScrollArea h={500}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Column</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Null %</Table.Th>
                        <Table.Th>Unique %</Table.Th>
                        <Table.Th>Range</Table.Th>
                        <Table.Th>Examples</Table.Th>
                        <Table.Th>Issues</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {analysis.columns.map(col => (
                        <Table.Tr key={col.name}>
                          <Table.Td>
                            <Group gap="xs">
                              {getTypeIcon(col.type)}
                              <Text>{col.name}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Code>{col.type}</Code>
                          </Table.Td>
                          <Table.Td>
                            <Text c={col.nullPercentage > 0 ? 'red' : 'green'}>
                              {col.nullPercentage.toFixed(1)}%
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            {col.uniquePercentage.toFixed(1)}%
                          </Table.Td>
                          <Table.Td>
                            {col.min && col.max ? (
                              <Text size="sm">{col.min} - {col.max}</Text>
                            ) : '-'}
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" truncate>
                              {col.examples.join(', ')}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            {col.issues.length > 0 ? (
                              <Badge color="yellow">
                                {col.issues.length} issues
                              </Badge>
                            ) : (
                              <Badge color="green">Clean</Badge>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Tabs.Panel>

              <Tabs.Panel value="issues" pt="xs">
                <ScrollArea h={500}>
                  <Accordion>
                    {analysis.issues.map((issue, index) => (
                      <Accordion.Item key={index} value={`issue-${index}`}>
                        <Accordion.Control>
                          <Group gap="xs">
                            <ThemeIcon 
                              color={getSeverityColor(issue.severity)} 
                              variant="light"
                            >
                              <IconAlertTriangle size={16} />
                            </ThemeIcon>
                            <div>
                              <Text size="sm" fw={500}>
                                {issue.type.replace('_', ' ').toUpperCase()}
                              </Text>
                              {issue.column && (
                                <Text size="xs" c="dimmed">
                                  Column: {issue.column}
                                </Text>
                              )}
                            </div>
                            <Badge color={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                          </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Text size="sm">{issue.message}</Text>
                        </Accordion.Panel>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </ScrollArea>
              </Tabs.Panel>

              <Tabs.Panel value="correlations" pt="xs">
                <ScrollArea h={500}>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Column 1</Table.Th>
                        <Table.Th>Column 2</Table.Th>
                        <Table.Th>Correlation</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {analysis.correlations.map((corr, index) => (
                        <Table.Tr key={index}>
                          <Table.Td>{corr.column1}</Table.Td>
                          <Table.Td>{corr.column2}</Table.Td>
                          <Table.Td>
                            <Text 
                              c={Math.abs(corr.correlation) > 0.7 ? 'blue' : 'dimmed'}
                              fw={Math.abs(corr.correlation) > 0.7 ? 500 : 400}
                            >
                              {corr.correlation.toFixed(2)}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Tabs.Panel>
            </Tabs>

            <Group justify="space-between">
              <Button 
                leftSection={<IconDownload size={14} />}
                variant="light"
              >
                Export Analysis
              </Button>
              <Button 
                leftSection={<IconCheck size={14} />}
                onClick={() => setShowAnalysis(false)}
              >
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
} 
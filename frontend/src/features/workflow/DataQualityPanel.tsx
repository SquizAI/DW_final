import { useState } from 'react';
import {
  Paper,
  Title,
  Stack,
  Select,
  TextInput,
  NumberInput,
  Button,
  Group,
  Text,
  Card,
  ActionIcon,
  Badge,
  Progress,
  Switch,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation } from '@tanstack/react-query';
import { IconPlus, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import axios from 'axios';

interface DataQualityPanelProps {
  nodeId: string;
  onQualityCheckComplete: (results: any) => void;
}

interface QualityRule {
  field: string;
  type: string;
  params: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
  action: 'warn' | 'reject' | 'fix';
}

export function DataQualityPanel({ nodeId, onQualityCheckComplete }: DataQualityPanelProps) {
  const [rules, setRules] = useState<QualityRule[]>([]);
  const [threshold, setThreshold] = useState(0.8);

  // Fetch available columns
  const { data: columnData } = useQuery({
    queryKey: ['columns', nodeId],
    queryFn: async () => {
      const response = await axios.get(`/api/workflow/preview/${nodeId}`);
      return response.data.schema.fields.map((f: any) => f.name);
    },
  });

  // Quality check mutation
  const qualityMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/workflow/validate`, {
        rules,
        threshold,
        nodeId,
      });
      return response.data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Quality check completed',
        color: 'green',
      });
      onQualityCheckComplete(data);
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to perform quality check',
        color: 'red',
      });
    },
  });

  const addRule = () => {
    setRules([
      ...rules,
      {
        field: '',
        type: 'missing',
        params: {},
        severity: 'medium',
        action: 'warn',
      },
    ]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, updates: Partial<QualityRule>) => {
    setRules(rules.map((rule, i) => 
      i === index ? { ...rule, ...updates } : rule
    ));
  };

  const renderRuleParams = (rule: QualityRule, index: number) => {
    switch (rule.type) {
      case 'range':
        return (
          <Group grow>
            <NumberInput
              label="Min"
              value={rule.params.min}
              onChange={(value) => updateRule(index, {
                params: { ...rule.params, min: value },
              })}
            />
            <NumberInput
              label="Max"
              value={rule.params.max}
              onChange={(value) => updateRule(index, {
                params: { ...rule.params, max: value },
              })}
            />
          </Group>
        );
      case 'regex':
        return (
          <TextInput
            label="Pattern"
            value={rule.params.pattern}
            onChange={(e) => updateRule(index, {
              params: { ...rule.params, pattern: e.target.value },
            })}
          />
        );
      case 'unique':
        return (
          <Switch
            label="Allow nulls"
            checked={rule.params.allowNull}
            onChange={(e) => updateRule(index, {
              params: { ...rule.params, allowNull: e.currentTarget.checked },
            })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper p="md" style={{ height: '100%', overflowY: 'auto', width: '100%' }}>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Data Quality Rules</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={addRule}
            variant="light"
          >
            Add Rule
          </Button>
        </Group>

        <Card withBorder>
          <Title order={4} mb="md">Quality Threshold</Title>
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              Minimum quality score required (0-1)
            </Text>
            <Group>
              <NumberInput
                value={threshold}
                onChange={(value) => setThreshold(Number(value))}
                min={0}
                max={1}
                step={0.1}
                w={200}
              />
              <Progress
                value={threshold * 100}
                size="xl"
                w={200}
                color={threshold < 0.6 ? 'red' : threshold < 0.8 ? 'yellow' : 'green'}
              />
            </Group>
          </Stack>
        </Card>

        {rules.map((rule, index) => (
          <Card key={index} withBorder>
            <Group justify="space-between" mb="md">
              <Title order={4}>Rule {index + 1}</Title>
              <ActionIcon
                color="red"
                variant="light"
                onClick={() => removeRule(index)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>

            <Stack gap="md">
              <Select
                label="Field"
                data={columnData?.map((col: string) => ({
                  value: col,
                  label: col,
                })) || []}
                value={rule.field}
                onChange={(value) => updateRule(index, { field: value || '' })}
              />

              <Select
                label="Rule Type"
                data={[
                  { value: 'missing', label: 'Missing Values' },
                  { value: 'range', label: 'Value Range' },
                  { value: 'regex', label: 'Regex Pattern' },
                  { value: 'unique', label: 'Uniqueness' },
                  { value: 'format', label: 'Format Check' },
                ]}
                value={rule.type}
                onChange={(value) => updateRule(index, { 
                  type: value || 'missing',
                  params: {}, // Reset params when type changes
                })}
              />

              {renderRuleParams(rule, index)}

              <Group grow>
                <Select
                  label="Severity"
                  data={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                  value={rule.severity}
                  onChange={(value) => updateRule(index, { 
                    severity: (value as 'low' | 'medium' | 'high') || 'medium'
                  })}
                />

                <Select
                  label="Action"
                  data={[
                    { value: 'warn', label: 'Warning' },
                    { value: 'reject', label: 'Reject' },
                    { value: 'fix', label: 'Auto-fix' },
                  ]}
                  value={rule.action}
                  onChange={(value) => updateRule(index, { 
                    action: (value as 'warn' | 'reject' | 'fix') || 'warn'
                  })}
                />
              </Group>

              <Badge
                color={rule.severity === 'high' ? 'red' : rule.severity === 'medium' ? 'yellow' : 'blue'}
              >
                {rule.severity.toUpperCase()} Severity
              </Badge>
            </Stack>
          </Card>
        ))}

        <Button
          onClick={() => qualityMutation.mutate()}
          loading={qualityMutation.isPending}
          disabled={rules.length === 0}
          leftSection={<IconCheck size={16} />}
        >
          Run Quality Check
        </Button>
      </Stack>
    </Paper>
  );
} 
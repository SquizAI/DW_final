import { useState } from 'react';
import { Card, Text, Group, Stack, Button, TextInput, ActionIcon, Paper, Loader } from '@mantine/core';
import { IconBrain, IconBulb, IconRocket, IconX, IconArrowRight } from '@tabler/icons-react';
import { useAI } from '../../services/ai/AIContextProvider';
import { motion, AnimatePresence } from 'framer-motion';
import type { DataInsight, WorkflowSuggestion } from '../../services/ai/types';

interface InsightCardProps {
  insight: DataInsight;
  onDismiss: () => void;
}

function InsightCard({ insight, onDismiss }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <Paper shadow="md" p="md" radius="md" style={{ position: 'relative' }}>
        <ActionIcon
          variant="subtle"
          onClick={onDismiss}
          style={{ position: 'absolute', top: 8, right: 8 }}
        >
          <IconX size={16} stroke={1.5} />
        </ActionIcon>
        <Group gap="sm" mb="xs">
          <IconBulb
            size={20}
            stroke={1.5}
            color={insight.type === 'warning' ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-blue-6)'}
          />
          <Text fw={500} size="sm">
            {insight.message}
          </Text>
        </Group>
        {insight.action && (
          <Button
            variant="light"
            size="xs"
            rightSection={<IconArrowRight size={14} stroke={1.5} />}
            onClick={insight.action.handler}
          >
            {insight.action.label}
          </Button>
        )}
      </Paper>
    </motion.div>
  );
}

interface SuggestedWorkflowCardProps {
  workflow: WorkflowSuggestion;
  onExecute: () => void;
}

function SuggestedWorkflowCard({ workflow, onExecute }: SuggestedWorkflowCardProps) {
  return (
    <Card shadow="md" radius="md" p="md">
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={500}>{workflow.name}</Text>
          <Text size="xs" c="dimmed">{Math.round(workflow.confidence * 100)}% match</Text>
        </Group>
        <Text size="sm" c="dimmed">{workflow.description}</Text>
        <Button
          variant="light"
          size="sm"
          rightSection={<IconRocket size={16} stroke={1.5} />}
          onClick={onExecute}
        >
          Execute Workflow
        </Button>
      </Stack>
    </Card>
  );
}

export function AIDashboard() {
  const {
    dataInsights,
    suggestedWorkflows,
    analyzeUserIntent,
    executeWorkflow,
    isAnalyzing,
  } = useAI();

  const [userInput, setUserInput] = useState('');
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  const handleDismissInsight = (message: string) => {
    setDismissedInsights(prev => new Set([...prev, message]));
  };

  const activeInsights = dataInsights?.filter(
    insight => !dismissedInsights.has(insight.message)
  ) || [];

  return (
    <Stack gap="xl">
      {/* AI Command Center */}
      <Card shadow="md" radius="lg">
        <Group gap="sm" mb="lg">
          <IconBrain size={24} stroke={1.5} color="var(--mantine-color-blue-6)" />
          <Text className="mantine-Text-strong" size="lg">AI Command Center</Text>
        </Group>
        <TextInput
          placeholder="Describe what you want to do with your data..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && userInput.trim()) {
              analyzeUserIntent(userInput);
              setUserInput('');
            }
          }}
          rightSection={
            isAnalyzing ? (
              <Loader size="xs" />
            ) : (
              <ActionIcon
                variant="filled"
                color="blue"
                onClick={() => {
                  if (userInput.trim()) {
                    analyzeUserIntent(userInput);
                    setUserInput('');
                  }
                }}
              >
                <IconArrowRight size={16} stroke={1.5} />
              </ActionIcon>
            )
          }
        />
      </Card>

      {/* Active Insights */}
      <AnimatePresence>
        {activeInsights.length > 0 && (
          <Stack gap="sm">
            <Text fw={500} size="sm" c="dimmed">ACTIVE INSIGHTS</Text>
            {activeInsights.map((insight, index) => (
              <InsightCard
                key={`${insight.message}-${index}`}
                insight={insight}
                onDismiss={() => handleDismissInsight(insight.message)}
              />
            ))}
          </Stack>
        )}
      </AnimatePresence>

      {/* Suggested Workflows */}
      {suggestedWorkflows?.length > 0 && (
        <Stack gap="sm">
          <Text fw={500} size="sm" c="dimmed">SUGGESTED WORKFLOWS</Text>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {suggestedWorkflows.map((workflow) => (
              <SuggestedWorkflowCard
                key={workflow.id}
                workflow={workflow}
                onExecute={() => executeWorkflow(workflow.id)}
              />
            ))}
          </div>
        </Stack>
      )}
    </Stack>
  );
} 
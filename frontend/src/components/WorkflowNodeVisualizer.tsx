import React from 'react';
import { Card, Group, Text, ThemeIcon } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';

export interface WorkflowStep {
  id: string;
  label: string;
}

export interface WorkflowNodeVisualizerProps {
  steps?: WorkflowStep[];
}

export const WorkflowNodeVisualizer: React.FC<WorkflowNodeVisualizerProps> = ({ steps }) => {
  const defaultSteps: WorkflowStep[] = [
    { id: '1', label: 'Start' },
    { id: '2', label: 'Upload Data' },
    { id: '3', label: 'Clean Data' },
    { id: '4', label: 'Analyze Data' },
    { id: '5', label: 'Report' },
  ];
  const displayedSteps = steps && steps.length > 0 ? steps : defaultSteps;

  return (
    <Group gap="md" style={{ justifyContent: 'center' }}>
      {displayedSteps.map((step, index) => (
        <React.Fragment key={step.id}>
          <Card shadow="sm" p="md" radius="md" withBorder style={{ minWidth: 120, textAlign: 'center' }}>
            <Text fw={500}>{step.label}</Text>
          </Card>
          {index < displayedSteps.length - 1 && (
            <ThemeIcon size={32} variant="light" color="blue">
              <IconArrowRight size={18} />
            </ThemeIcon>
          )}
        </React.Fragment>
      ))}
    </Group>
  );
}; 
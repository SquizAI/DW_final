import React from 'react';
import { Container, Stack } from '@mantine/core';
import { IconRobot } from '@tabler/icons-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { AIWorkflowChat } from '../features/AIWorkflow/AIWorkflowChat';

export function AIInsightsPage() {
  return (
    <Container size="xl">
      <PageHeader
        title="AI Insights"
        description="AI-powered data analysis and recommendations"
        icon={<IconRobot size={24} />}
      />

      <Stack gap="lg">
        <Card>
          <AIWorkflowChat />
        </Card>
      </Stack>
    </Container>
  );
} 
import React from 'react';
import { Container, Card, Title, Text, Group, Button } from '@mantine/core';
import WorkflowBuilder from '@/components/WorkflowBuilder';

export default function Dashboard() {
  return (
    <Container size="xl" py="xl" style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <Title order={1} mb="md">Dashboard</Title>
      <Text mb="xl" color="dimmed">Create and manage your data workflows</Text>
      
      <Card style={{ height: '600px', width: '100%' }}>
        <WorkflowBuilder />
      </Card>
      
      <Group mt="xl" justify="flex-end">
        <Button variant="light">Save Workflow</Button>
        <Button>Execute Workflow</Button>
      </Group>
    </Container>
  );
} 
import React from 'react';
import { Card, Stack, Text, Group, Button, SimpleGrid } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export function ProjectViewPage() {
  const navigate = useNavigate();

  // Fetch project data
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project'],
    queryFn: async () => {
      const response = await fetch('/api/project');
      if (!response.ok) throw new Error('Failed to fetch project data');
      return response.json();
    },
  });

  return (
    <Stack gap="lg">
      {/* Header */}
      <Card shadow="sm" p="xl" radius="md" withBorder>
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Text size="xl" fw={700}>Project Overview</Text>
            <Text c="dimmed">
              Comprehensive view of your data project, including datasets, workflows, and analytics.
            </Text>
          </Stack>
          <Button 
            variant="light" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </Group>
      </Card>

      {/* Project Details */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Card shadow="sm" p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Text size="lg" fw={500}>Project Details</Text>
            {isLoading ? (
              <Text>Loading project details...</Text>
            ) : error ? (
              <Text c="red">Error loading project details</Text>
            ) : (
              <Stack gap="xs">
                <Text>Project Name: {project?.name || 'Untitled Project'}</Text>
                <Text>Created: {project?.createdAt || 'N/A'}</Text>
                <Text>Last Modified: {project?.updatedAt || 'N/A'}</Text>
              </Stack>
            )}
          </Stack>
        </Card>

        <Card shadow="sm" p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Text size="lg" fw={500}>Dataset Overview</Text>
            {isLoading ? (
              <Text>Loading dataset information...</Text>
            ) : error ? (
              <Text c="red">Error loading dataset information</Text>
            ) : (
              <Stack gap="xs">
                <Text>Active Datasets: {project?.datasets?.length || 0}</Text>
                <Text>Total Records: {project?.totalRecords || 0}</Text>
                <Text>Last Update: {project?.lastDataUpdate || 'N/A'}</Text>
              </Stack>
            )}
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Workflow Status */}
      <Card shadow="sm" p="xl" radius="md" withBorder>
        <Stack gap="md">
          <Text size="lg" fw={500}>Workflow Status</Text>
          {isLoading ? (
            <Text>Loading workflow status...</Text>
          ) : error ? (
            <Text c="red">Error loading workflow status</Text>
          ) : (
            <Stack gap="xs">
              <Text>Active Workflows: {project?.workflows?.length || 0}</Text>
              <Text>Completed Steps: {project?.completedSteps || 0}</Text>
              <Text>Next Action: {project?.nextAction || 'No pending actions'}</Text>
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  );
} 
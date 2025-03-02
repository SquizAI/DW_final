import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Group, 
  Stack,
  Button,
  TextInput,
  Textarea,
  ThemeIcon,
  rem,
  Checkbox,
  Select,
  Progress,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { 
  IconFileReport,
  IconDownload,
  IconRefresh,
  IconEye,
  IconTrash,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ReportSection {
  id: string;
  title: string;
  type: string;
  description: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  content?: string;
}

interface ReportConfig {
  title: string;
  description: string;
  sections: string[];
  format: string;
  options: {
    include_code: boolean;
    include_charts: boolean;
    include_statistics: boolean;
  };
}

export function FinalReportPage() {
  const [config, setConfig] = useState<ReportConfig>({
    title: '',
    description: '',
    sections: [],
    format: 'pdf',
    options: {
      include_code: true,
      include_charts: true,
      include_statistics: true,
    },
  });
  const queryClient = useQueryClient();

  const { data: sections = [] } = useQuery<ReportSection[]>({
    queryKey: ['report-sections'],
    queryFn: async () => {
      const response = await fetch('/api/report/sections');
      if (!response.ok) throw new Error('Failed to fetch report sections');
      return response.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (config: ReportConfig) => {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to generate report');
      return response.json();
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Report generated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      // Trigger download
      window.location.href = data.downloadUrl;
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to generate report',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  const previewMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      const response = await fetch(`/api/report/preview/${sectionId}`);
      if (!response.ok) throw new Error('Failed to preview section');
      return response.json();
    },
    onSuccess: (data) => {
      // Handle preview display (could use a modal or drawer)
      console.log('Preview data:', data);
    },
  });

  const handleGenerate = () => {
    if (!config.title) {
      notifications.show({
        title: 'Error',
        message: 'Please provide a report title',
        color: 'red',
      });
      return;
    }
    if (config.sections.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Please select at least one section',
        color: 'red',
      });
      return;
    }
    generateMutation.mutate(config);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Card withBorder shadow="sm" p="xl">
          <Stack gap="md">
            <Group>
              <ThemeIcon size={40} radius="md" variant="light" color="blue">
                <IconFileReport size={rem(20)} />
              </ThemeIcon>
              <div>
                <Title order={2}>Final Report</Title>
                <Text c="dimmed">
                  Generate a comprehensive report of your analysis
                </Text>
              </div>
            </Group>

            <TextInput
              label="Report Title"
              placeholder="Enter a title for your report"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
            />

            <Textarea
              label="Description"
              placeholder="Describe the purpose and scope of this report"
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              minRows={3}
            />

            <Card withBorder>
              <Stack gap="md">
                <Text fw={500}>Report Sections</Text>
                {sections.map((section) => (
                  <Card key={section.id} withBorder>
                    <Group justify="space-between">
                      <Stack gap={4}>
                        <Group gap={8}>
                          <Checkbox
                            checked={config.sections.includes(section.id)}
                            onChange={(e) => {
                              const newSections = e.currentTarget.checked
                                ? [...config.sections, section.id]
                                : config.sections.filter(id => id !== section.id);
                              setConfig({ ...config, sections: newSections });
                            }}
                          />
                          <Text fw={500}>{section.title}</Text>
                          <Badge>{section.type}</Badge>
                        </Group>
                        <Text size="sm" c="dimmed" ml={32}>
                          {section.description}
                        </Text>
                      </Stack>
                      <Group gap={8}>
                        <Tooltip label="Preview Section">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => previewMutation.mutate(section.id)}
                            loading={previewMutation.isPending}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </Card>

            <Select
              label="Output Format"
              data={[
                { value: 'pdf', label: 'PDF Document' },
                { value: 'html', label: 'HTML Report' },
                { value: 'docx', label: 'Word Document' },
                { value: 'md', label: 'Markdown' },
              ]}
              value={config.format}
              onChange={(value) => setConfig({ ...config, format: value || 'pdf' })}
            />

            <Card withBorder>
              <Stack gap="md">
                <Text fw={500}>Report Options</Text>
                <Group>
                  <Checkbox
                    label="Include Code Snippets"
                    checked={config.options.include_code}
                    onChange={(e) => setConfig({
                      ...config,
                      options: {
                        ...config.options,
                        include_code: e.currentTarget.checked,
                      },
                    })}
                  />
                  <Checkbox
                    label="Include Charts"
                    checked={config.options.include_charts}
                    onChange={(e) => setConfig({
                      ...config,
                      options: {
                        ...config.options,
                        include_charts: e.currentTarget.checked,
                      },
                    })}
                  />
                  <Checkbox
                    label="Include Statistics"
                    checked={config.options.include_statistics}
                    onChange={(e) => setConfig({
                      ...config,
                      options: {
                        ...config.options,
                        include_statistics: e.currentTarget.checked,
                      },
                    })}
                  />
                </Group>
              </Stack>
            </Card>

            <Group justify="flex-end" gap="sm">
              <Button
                variant="light"
                color="gray"
                onClick={() => setConfig({
                  title: '',
                  description: '',
                  sections: [],
                  format: 'pdf',
                  options: {
                    include_code: true,
                    include_charts: true,
                    include_statistics: true,
                  },
                })}
              >
                Reset
              </Button>
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={handleGenerate}
                loading={generateMutation.isPending}
                disabled={!config.title || config.sections.length === 0}
              >
                Generate Report
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
} 
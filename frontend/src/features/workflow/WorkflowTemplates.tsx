import React from 'react';
import {
  Paper,
  Stack,
  Text,
  SimpleGrid,
  Card,
  Group,
  Badge,
  Button,
  ActionIcon,
  Tooltip,
  Modal,
  TextInput,
  Textarea,
  Select,
} from '@mantine/core';
import {
  IconTemplate,
  IconPlus,
  IconCopy,
  IconPencil,
  IconTrash,
  IconDownload,
  IconUpload,
  IconSearch,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  nodes: any[];
  edges: any[];
  tags: string[];
  author: string;
  lastModified: Date;
}

interface WorkflowTemplatesProps {
  onApplyTemplate: (template: WorkflowTemplate) => void;
  onSaveAsTemplate: (currentWorkflow: any) => void;
}

const SAMPLE_TEMPLATES: WorkflowTemplate[] = [
  {
    id: '1',
    name: 'Data Quality Analysis',
    description: 'A comprehensive workflow for analyzing data quality, including validation, profiling, and reporting.',
    category: 'Data Quality',
    difficulty: 'beginner',
    nodes: [],
    edges: [],
    tags: ['data-quality', 'validation', 'profiling'],
    author: 'AI Assistant',
    lastModified: new Date(),
  },
  {
    id: '2',
    name: 'ML Classification Pipeline',
    description: 'End-to-end machine learning pipeline for classification tasks with preprocessing and evaluation.',
    category: 'Machine Learning',
    difficulty: 'intermediate',
    nodes: [],
    edges: [],
    tags: ['ml', 'classification', 'preprocessing'],
    author: 'AI Assistant',
    lastModified: new Date(),
  },
  {
    id: '3',
    name: 'Feature Engineering Suite',
    description: 'Advanced feature engineering workflow with automated feature selection and importance analysis.',
    category: 'Feature Engineering',
    difficulty: 'advanced',
    nodes: [],
    edges: [],
    tags: ['feature-engineering', 'automation'],
    author: 'AI Assistant',
    lastModified: new Date(),
  },
];

export function WorkflowTemplates({
  onApplyTemplate,
  onSaveAsTemplate,
}: WorkflowTemplatesProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string | null>(null);

  const categories = Array.from(new Set(SAMPLE_TEMPLATES.map(t => t.category)));
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const filteredTemplates = SAMPLE_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || template.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'green';
      case 'intermediate':
        return 'yellow';
      case 'advanced':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <>
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={500}>Workflow Templates</Text>
            <Group>
              <Tooltip label="Import Template">
                <ActionIcon variant="light" onClick={() => {
                  notifications.show({
                    title: 'Coming Soon',
                    message: 'Template import feature is coming soon!',
                    color: 'blue',
                  });
                }}>
                  <IconUpload size={16} />
                </ActionIcon>
              </Tooltip>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={open}
              >
                Create Template
              </Button>
            </Group>
          </Group>

          <Group>
            <TextInput
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              data={[
                { value: '', label: 'All Categories' },
                ...categories.map(c => ({ value: c, label: c })),
              ]}
              clearable
            />
            <Select
              placeholder="Difficulty"
              value={selectedDifficulty}
              onChange={setSelectedDifficulty}
              data={[
                { value: '', label: 'All Difficulties' },
                ...difficulties.map(d => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) })),
              ]}
              clearable
            />
          </Group>

          <SimpleGrid cols={2}>
            {filteredTemplates.map((template) => (
              <Card key={template.id} withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={500}>{template.name}</Text>
                    <Badge color={getDifficultyColor(template.difficulty)}>
                      {template.difficulty.toUpperCase()}
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {template.description}
                  </Text>

                  <Group gap="xs">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="light">
                        {tag}
                      </Badge>
                    ))}
                  </Group>

                  <Text size="xs" c="dimmed">
                    By {template.author} • Last modified {template.lastModified.toLocaleDateString()}
                  </Text>

                  <Group gap="xs" mt="sm">
                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => onApplyTemplate(template)}
                    >
                      Use Template
                    </Button>
                    <Tooltip label="Duplicate">
                      <ActionIcon variant="subtle" size="sm">
                        <IconCopy size={14} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Download">
                      <ActionIcon variant="subtle" size="sm">
                        <IconDownload size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Paper>

      <Modal
        opened={opened}
        onClose={close}
        title="Create New Template"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Template Name"
            placeholder="Enter template name..."
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Describe your template..."
            minRows={3}
            required
          />

          <Select
            label="Category"
            placeholder="Select category"
            data={categories}
            required
          />

          <Select
            label="Difficulty"
            placeholder="Select difficulty level"
            data={difficulties.map(d => ({
              value: d,
              label: d.charAt(0).toUpperCase() + d.slice(1),
            }))}
            required
          />

          <TextInput
            label="Tags"
            placeholder="Enter tags separated by commas..."
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={close}>Cancel</Button>
            <Button onClick={() => {
              notifications.show({
                title: 'Success',
                message: 'Template created successfully!',
                color: 'green',
              });
              close();
            }}>
              Create Template
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
} 
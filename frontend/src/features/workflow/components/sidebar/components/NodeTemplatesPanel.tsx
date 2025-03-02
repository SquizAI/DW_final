import React, { useState } from 'react';
import { 
  Paper, 
  Text, 
  Group, 
  Badge, 
  ThemeIcon, 
  ActionIcon,
  Box,
  Divider,
  Button,
  Stack,
  Title,
  Tooltip,
  ScrollArea,
  SimpleGrid,
  Card,
  Image,
  TextInput,
  Select,
  Modal,
  Textarea
} from '@mantine/core';
import { 
  IconX, 
  IconTemplate, 
  IconPlus, 
  IconSearch, 
  IconFilter,
  IconDownload,
  IconUpload,
  IconDeviceFloppy,
  IconShare,
  IconStar,
  IconCopy,
  IconCategory
} from '@tabler/icons-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: string;
  popularity: number;
  nodeCount: number;
  edgeCount: number;
  thumbnail: string;
  tags: string[];
}

interface NodeTemplatesPanelProps {
  onClose: () => void;
  templates: Template[];
  onSelectTemplate: (templateId: string) => void;
  onCreateTemplate: (template: Omit<Template, 'id'>) => void;
}

const NodeTemplatesPanel: React.FC<NodeTemplatesPanelProps> = ({
  onClose,
  templates,
  onSelectTemplate,
  onCreateTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Omit<Template, 'id'>>({
    name: '',
    description: '',
    category: 'custom',
    complexity: 'beginner',
    popularity: 0,
    nodeCount: 0,
    edgeCount: 0,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    tags: []
  });
  
  // Filter templates based on search query and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get complexity color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };
  
  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'data-processing': return 'blue';
      case 'machine-learning': return 'violet';
      case 'visualization': return 'cyan';
      case 'etl': return 'orange';
      case 'custom': return 'gray';
      default: return 'gray';
    }
  };
  
  // Handle create template
  const handleCreateTemplate = () => {
    onCreateTemplate(newTemplate);
    setCreateModalOpen(false);
    setNewTemplate({
      name: '',
      description: '',
      category: 'custom',
      complexity: 'beginner',
      popularity: 0,
      nodeCount: 0,
      edgeCount: 0,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      tags: []
    });
  };
  
  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'data-processing', label: 'Data Processing' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'visualization', label: 'Visualization' },
    { value: 'etl', label: 'ETL Pipelines' },
    { value: 'custom', label: 'My Templates' }
  ];
  
  return (
    <Paper p="md" withBorder h="100%">
      <Group justify="space-between" mb="md">
        <Group>
          <ThemeIcon size="md" radius="md" color="indigo">
            <IconTemplate size={16} />
          </ThemeIcon>
          <Title order={4}>Workflow Templates</Title>
        </Group>
        
        <ActionIcon variant="subtle" onClick={onClose}>
          <IconX size={18} />
        </ActionIcon>
      </Group>
      
      <Group mb="md" justify="space-between">
        <TextInput
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1 }}
          leftSection={<IconSearch size={16} />}
        />
        
        <Select
          placeholder="Filter by category"
          data={categories}
          value={selectedCategory}
          onChange={(value) => setSelectedCategory(value || 'all')}
          style={{ width: 200 }}
          leftSection={<IconFilter size={16} />}
        />
      </Group>
      
      <Divider mb="md" />
      
      <ScrollArea h="calc(100vh - 250px)" offsetScrollbars>
        {filteredTemplates.length === 0 ? (
          <Stack align="center" justify="center" h={200}>
            <ThemeIcon size="xl" radius="xl" color="gray" variant="light">
              <IconTemplate size={24} />
            </ThemeIcon>
            <Text c="dimmed" ta="center">
              No templates found.
              <br />
              Try adjusting your search or create a new template.
            </Text>
          </Stack>
        ) : (
          <SimpleGrid cols={2} spacing="md">
            {filteredTemplates.map((template) => (
              <Card key={template.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                  <Image
                    src={template.thumbnail}
                    height={160}
                    alt={template.name}
                  />
                </Card.Section>
                
                <Group justify="space-between" mt="md" mb="xs">
                  <Text fw={500}>{template.name}</Text>
                  <Badge color={getComplexityColor(template.complexity)}>
                    {template.complexity}
                  </Badge>
                </Group>
                
                <Text size="sm" color="dimmed" lineClamp={2} mb="md">
                  {template.description}
                </Text>
                
                <Group mb="md" gap={5}>
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" size="sm">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </Group>
                
                <Group mt="md" justify="space-between">
                  <Group>
                    <ThemeIcon size="sm" variant="light" color={getCategoryColor(template.category)}>
                      <IconCategory size={12} />
                    </ThemeIcon>
                    <Text size="xs" color="dimmed">
                      {template.nodeCount} nodes
                    </Text>
                  </Group>
                  
                  <Group>
                    <Badge 
                      size="sm" 
                      variant="dot" 
                      leftSection={<IconStar size={10} />}
                    >
                      {template.popularity}%
                    </Badge>
                  </Group>
                </Group>
                
                <Divider my="sm" />
                
                <Group justify="space-between">
                  <Button 
                    variant="light" 
                    leftSection={<IconShare size={16} />}
                    size="xs"
                  >
                    Share
                  </Button>
                  
                  <Button 
                    variant="filled" 
                    leftSection={<IconCopy size={16} />}
                    onClick={() => onSelectTemplate(template.id)}
                    size="xs"
                  >
                    Use Template
                  </Button>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </ScrollArea>
      
      <Divider my="md" />
      
      <Group justify="space-between">
        <Button 
          variant="light" 
          leftSection={<IconUpload size={16} />}
        >
          Import Template
        </Button>
        
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Template
        </Button>
      </Group>
      
      {/* Create Template Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Template"
        size="lg"
      >
        <TextInput
          label="Template Name"
          placeholder="Enter template name"
          value={newTemplate.name}
          onChange={(e) => setNewTemplate({...newTemplate, name: e.currentTarget.value})}
          required
          mb="md"
        />
        
        <Textarea
          label="Description"
          placeholder="Enter template description"
          value={newTemplate.description}
          onChange={(e) => setNewTemplate({...newTemplate, description: e.currentTarget.value})}
          minRows={3}
          mb="md"
        />
        
        <Select
          label="Category"
          placeholder="Select category"
          data={categories.filter(c => c.value !== 'all')}
          value={newTemplate.category}
          onChange={(value) => setNewTemplate({...newTemplate, category: value || 'custom'})}
          mb="md"
        />
        
        <Select
          label="Complexity"
          placeholder="Select complexity"
          data={[
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'advanced', label: 'Advanced' }
          ]}
          value={newTemplate.complexity}
          onChange={(value) => setNewTemplate({...newTemplate, complexity: value || 'beginner'})}
          mb="md"
        />
        
        <TextInput
          label="Tags"
          placeholder="Enter tags separated by commas"
          value={newTemplate.tags.join(', ')}
          onChange={(e) => setNewTemplate({
            ...newTemplate, 
            tags: e.currentTarget.value.split(',').map(tag => tag.trim()).filter(Boolean)
          })}
          mb="md"
        />
        
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTemplate}>
            Create Template
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
};

export default NodeTemplatesPanel; 
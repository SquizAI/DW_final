import React, { useState } from 'react';
import { 
  Paper, 
  Title, 
  Text, 
  SimpleGrid, 
  Card, 
  Badge, 
  Button, 
  Group, 
  Image, 
  Modal, 
  TextInput, 
  Textarea, 
  Select,
  Divider,
  ActionIcon,
  Tooltip,
  ThemeIcon
} from '@mantine/core';
import { 
  IconTemplate, 
  IconPlus, 
  IconSearch, 
  IconFilter, 
  IconStar, 
  IconCopy,
  IconDownload,
  IconShare,
  IconChartBar,
  IconBrain,
  IconDatabase,
  IconArrowsShuffle
} from '@tabler/icons-react';
import { useWorkflow } from '../../WorkflowContext';

// Template categories
const CATEGORIES = [
  { value: 'all', label: 'All Templates' },
  { value: 'data-processing', label: 'Data Processing' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'visualization', label: 'Visualization' },
  { value: 'etl', label: 'ETL Pipelines' },
  { value: 'custom', label: 'My Templates' }
];

// Sample template data
const TEMPLATES = [
  {
    id: '1',
    name: 'Data Cleaning Pipeline',
    description: 'A complete data cleaning workflow with missing value handling, outlier detection, and data validation.',
    category: 'data-processing',
    complexity: 'medium',
    popularity: 95,
    nodeCount: 6,
    edgeCount: 5,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    tags: ['cleaning', 'preprocessing', 'validation']
  },
  {
    id: '2',
    name: 'Customer Segmentation',
    description: 'Segment customers based on purchasing behavior, demographics, and engagement metrics.',
    category: 'machine-learning',
    complexity: 'advanced',
    popularity: 88,
    nodeCount: 8,
    edgeCount: 7,
    thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    tags: ['clustering', 'segmentation', 'marketing']
  },
  {
    id: '3',
    name: 'Sales Dashboard',
    description: 'Create interactive visualizations for sales data with regional breakdowns and trend analysis.',
    category: 'visualization',
    complexity: 'beginner',
    popularity: 92,
    nodeCount: 5,
    edgeCount: 4,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    tags: ['dashboard', 'sales', 'charts']
  },
  {
    id: '4',
    name: 'Database to S3 ETL',
    description: 'Extract data from a relational database, transform it, and load it into Amazon S3.',
    category: 'etl',
    complexity: 'medium',
    popularity: 85,
    nodeCount: 4,
    edgeCount: 3,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    tags: ['etl', 'database', 's3']
  },
  {
    id: '5',
    name: 'Churn Prediction Model',
    description: 'Predict customer churn using machine learning with feature engineering and model evaluation.',
    category: 'machine-learning',
    complexity: 'advanced',
    popularity: 90,
    nodeCount: 10,
    edgeCount: 9,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    tags: ['prediction', 'churn', 'classification']
  },
  {
    id: '6',
    name: 'Data Quality Assessment',
    description: 'Assess data quality with comprehensive metrics and generate quality reports.',
    category: 'data-processing',
    complexity: 'beginner',
    popularity: 87,
    nodeCount: 3,
    edgeCount: 2,
    thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    tags: ['quality', 'assessment', 'reporting']
  }
];

interface WorkflowTemplatesProps {
  onSelectTemplate?: (templateId: string) => void;
}

export const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({
  onSelectTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saveAsTemplateModalOpen, setSaveAsTemplateModalOpen] = useState(false);
  
  // Filter templates based on search query and category
  const filteredTemplates = TEMPLATES.filter(template => {
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
      case 'medium': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data-processing': return <IconDatabase size={16} />;
      case 'machine-learning': return <IconBrain size={16} />;
      case 'visualization': return <IconChartBar size={16} />;
      case 'etl': return <IconArrowsShuffle size={16} />;
      default: return <IconTemplate size={16} />;
    }
  };
  
  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(templateId);
    }
  };
  
  return (
    <>
      <Paper p="md" withBorder>
        <Group mb="md" position="apart">
          <Title order={4}>Workflow Templates</Title>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Template
          </Button>
        </Group>
        
        <Group mb="md" position="apart">
          <TextInput
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1 }}
            leftSection={<IconSearch size={16} />}
          />
          
          <Select
            placeholder="Filter by category"
            data={CATEGORIES}
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value || 'all')}
            style={{ width: 200 }}
            leftSection={<IconFilter size={16} />}
          />
        </Group>
        
        <SimpleGrid cols={3} spacing="md" breakpoints={[
          { maxWidth: 'md', cols: 2 },
          { maxWidth: 'sm', cols: 1 }
        ]}>
          {filteredTemplates.map((template) => (
            <Card key={template.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Image
                  src={template.thumbnail}
                  height={160}
                  alt={template.name}
                />
              </Card.Section>
              
              <Group mt="md" mb="xs">
                <Text fw={500}>{template.name}</Text>
                <Badge color={getComplexityColor(template.complexity)}>
                  {template.complexity}
                </Badge>
              </Group>
              
              <Text size="sm" color="dimmed" lineClamp={2}>
                {template.description}
              </Text>
              
              <Group mt="md" mb="md">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline" size="sm">
                    {tag}
                  </Badge>
                ))}
              </Group>
              
              <Group mt="md" position="apart">
                <Group>
                  <ThemeIcon size="sm" variant="light" color="blue">
                    {getCategoryIcon(template.category)}
                  </ThemeIcon>
                  <Text size="xs" color="dimmed">
                    {template.nodeCount} nodes
                  </Text>
                </Group>
                
                <Group>
                  <Tooltip label="Popularity">
                    <Badge 
                      size="sm" 
                      variant="dot" 
                      leftSection={<IconStar size={10} />}
                    >
                      {template.popularity}%
                    </Badge>
                  </Tooltip>
                </Group>
              </Group>
              
              <Divider my="sm" />
              
              <Group position="apart">
                <Button 
                  variant="light" 
                  fullWidth
                  leftSection={<IconCopy size={16} />}
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  Use Template
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Paper>
      
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
          required
          mb="md"
        />
        
        <Textarea
          label="Description"
          placeholder="Enter template description"
          minRows={3}
          mb="md"
        />
        
        <Select
          label="Category"
          placeholder="Select category"
          data={CATEGORIES.filter(c => c.value !== 'all')}
          mb="md"
        />
        
        <TextInput
          label="Tags"
          placeholder="Enter tags separated by commas"
          mb="md"
        />
        
        <Group position="right" mt="md">
          <Button variant="light" onClick={() => setCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setCreateModalOpen(false)}>
            Create Template
          </Button>
        </Group>
      </Modal>
      
      {/* Save as Template Modal */}
      <Modal
        opened={saveAsTemplateModalOpen}
        onClose={() => setSaveAsTemplateModalOpen(false)}
        title="Save Current Workflow as Template"
        size="lg"
      >
        <TextInput
          label="Template Name"
          placeholder="Enter template name"
          required
          mb="md"
        />
        
        <Textarea
          label="Description"
          placeholder="Enter template description"
          minRows={3}
          mb="md"
        />
        
        <Select
          label="Category"
          placeholder="Select category"
          data={CATEGORIES.filter(c => c.value !== 'all')}
          mb="md"
        />
        
        <TextInput
          label="Tags"
          placeholder="Enter tags separated by commas"
          mb="md"
        />
        
        <Group position="right" mt="md">
          <Button variant="light" onClick={() => setSaveAsTemplateModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setSaveAsTemplateModalOpen(false)}>
            Save as Template
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default WorkflowTemplates; 
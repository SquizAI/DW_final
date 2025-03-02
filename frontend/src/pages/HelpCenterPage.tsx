import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Tabs,
  Accordion,
  Button,
  TextInput,
  SimpleGrid,
  Card,
  ThemeIcon,
  List,
  Anchor,
  Box,
  Image,
  Divider,
  Badge,
} from '@mantine/core';
import {
  IconSearch,
  IconBook,
  IconHelp,
  IconMessage,
  IconVideo,
  IconBrandYoutube,
  IconFileText,
  IconArrowRight,
  IconBulb,
  IconRocket,
  IconDatabase,
  IconChartBar,
  IconArrowsTransferUp,
  IconBrain,
  IconCode,
  IconBrandGithub,
  IconBrandSlack,
  IconBrandDiscord,
  IconMail,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

// FAQ data
const faqs = [
  {
    question: 'How do I upload a dataset?',
    answer: 'You can upload a dataset by navigating to the Data Management page and clicking on the "Upload" tab. From there, you can drag and drop your file or click to select a file from your computer. Supported formats include CSV, Excel, JSON, and Parquet.',
    category: 'data',
  },
  {
    question: 'How do I create a workflow?',
    answer: 'To create a workflow, go to the Workflow Builder page and click on the "Create New Workflow" button. You can then drag and drop nodes from the sidebar onto the canvas and connect them to build your data processing pipeline.',
    category: 'workflows',
  },
  {
    question: 'What types of visualizations can I create?',
    answer: 'Data Whisperer supports a wide range of visualizations, including bar charts, line charts, scatter plots, pie charts, heatmaps, and more. You can create these visualizations by going to the Visualizations page and selecting your dataset and visualization type.',
    category: 'visualizations',
  },
  {
    question: 'How does the AI analysis work?',
    answer: 'Our AI analysis uses advanced machine learning algorithms to automatically analyze your data and identify patterns, anomalies, and insights. The AI examines relationships between variables, detects outliers, and generates recommendations based on your specific dataset.',
    category: 'ai',
  },
  {
    question: 'Can I export my results?',
    answer: 'Yes, you can export your results in various formats including CSV, Excel, JSON, and PDF. For visualizations, you can export them as PNG or SVG files. Look for the export button in the top right corner of most pages.',
    category: 'general',
  },
  {
    question: 'How do I share my projects with team members?',
    answer: 'You can share your projects with team members by going to the project settings and clicking on the "Share" button. From there, you can enter the email addresses of your team members and set their permission levels.',
    category: 'general',
  },
  {
    question: 'What programming languages are supported in the notebook?',
    answer: 'The notebook currently supports Python and R. You can switch between languages using the language selector in the top right corner of the notebook.',
    category: 'code',
  },
  {
    question: 'How do I connect to external databases?',
    answer: 'To connect to external databases, go to the Data Integration page and click on "Connect Database". We support connections to MySQL, PostgreSQL, MongoDB, and more. You\'ll need to provide the connection details such as host, port, username, and password.',
    category: 'data',
  },
];

// Documentation categories
const documentationCategories = [
  {
    title: 'Getting Started',
    icon: <IconRocket size={24} />,
    color: 'blue',
    description: 'Learn the basics of Data Whisperer',
    articles: [
      { title: 'Introduction to Data Whisperer', path: '/help/docs/intro' },
      { title: 'Creating Your First Project', path: '/help/docs/first-project' },
      { title: 'Navigating the Dashboard', path: '/help/docs/dashboard' },
      { title: 'User Settings and Preferences', path: '/help/docs/settings' },
    ],
  },
  {
    title: 'Data Management',
    icon: <IconDatabase size={24} />,
    color: 'teal',
    description: 'Upload, organize, and manage your data',
    articles: [
      { title: 'Uploading Datasets', path: '/help/docs/uploading' },
      { title: 'Supported File Formats', path: '/help/docs/file-formats' },
      { title: 'Organizing Your Data', path: '/help/docs/organizing' },
      { title: 'Importing from External Sources', path: '/help/docs/importing' },
    ],
  },
  {
    title: 'Workflows',
    icon: <IconArrowsTransferUp size={24} />,
    color: 'grape',
    description: 'Build and automate data processing pipelines',
    articles: [
      { title: 'Workflow Builder Basics', path: '/help/docs/workflow-basics' },
      { title: 'Creating Custom Nodes', path: '/help/docs/custom-nodes' },
      { title: 'Workflow Templates', path: '/help/docs/templates' },
      { title: 'Scheduling and Automation', path: '/help/docs/automation' },
    ],
  },
  {
    title: 'Visualizations',
    icon: <IconChartBar size={24} />,
    color: 'orange',
    description: 'Create interactive charts and dashboards',
    articles: [
      { title: 'Chart Types and Use Cases', path: '/help/docs/chart-types' },
      { title: 'Customizing Visualizations', path: '/help/docs/customizing' },
      { title: 'Creating Dashboards', path: '/help/docs/dashboards' },
      { title: 'Exporting and Sharing', path: '/help/docs/exporting' },
    ],
  },
  {
    title: 'AI Features',
    icon: <IconBrain size={24} />,
    color: 'green',
    description: 'Leverage AI for data analysis and insights',
    articles: [
      { title: 'AI-Powered Analysis', path: '/help/docs/ai-analysis' },
      { title: 'Using the AI Assistant', path: '/help/docs/ai-assistant' },
      { title: 'Automated Insights', path: '/help/docs/auto-insights' },
      { title: 'AI Workflow Recommendations', path: '/help/docs/ai-recommendations' },
    ],
  },
  {
    title: 'Code Notebook',
    icon: <IconCode size={24} />,
    color: 'indigo',
    description: 'Write and execute code in notebooks',
    articles: [
      { title: 'Notebook Basics', path: '/help/docs/notebook-basics' },
      { title: 'Python and R Integration', path: '/help/docs/languages' },
      { title: 'Installing Packages', path: '/help/docs/packages' },
      { title: 'Sharing Notebooks', path: '/help/docs/sharing-notebooks' },
    ],
  },
];

// Video tutorials
const videoTutorials = [
  {
    title: 'Getting Started with Data Whisperer',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    duration: '5:32',
    url: 'https://www.youtube.com/watch?v=example1',
  },
  {
    title: 'Building Your First Workflow',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    duration: '8:45',
    url: 'https://www.youtube.com/watch?v=example2',
  },
  {
    title: 'Advanced Data Visualization Techniques',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    duration: '12:18',
    url: 'https://www.youtube.com/watch?v=example3',
  },
  {
    title: 'Using AI for Data Analysis',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    duration: '10:05',
    url: 'https://www.youtube.com/watch?v=example4',
  },
];

export function HelpCenterPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('documentation');
  const [filteredFaqs, setFilteredFaqs] = useState(faqs);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter FAQs based on search query and category
  const handleSearchFaqs = (query: string) => {
    setSearchQuery(query);
    
    if (!query && !selectedCategory) {
      setFilteredFaqs(faqs);
      return;
    }
    
    const filtered = faqs.filter(faq => {
      const matchesQuery = !query || 
        faq.question.toLowerCase().includes(query.toLowerCase()) || 
        faq.answer.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !selectedCategory || faq.category === selectedCategory;
      
      return matchesQuery && matchesCategory;
    });
    
    setFilteredFaqs(filtered);
  };

  // Filter FAQs by category
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    
    if (!category && !searchQuery) {
      setFilteredFaqs(faqs);
      return;
    }
    
    const filtered = faqs.filter(faq => {
      const matchesQuery = !searchQuery || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !category || faq.category === category;
      
      return matchesQuery && matchesCategory;
    });
    
    setFilteredFaqs(filtered);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Paper 
          p="xl" 
          radius="md" 
          withBorder 
          style={{
            backgroundImage: 'linear-gradient(135deg, #f0f6ff 0%, #e0f2ff 100%)',
          }}
        >
          <Stack gap="md" align="center">
            <Title order={1} ta="center">Help Center</Title>
            <Text size="lg" ta="center" maw={700} mx="auto">
              Find answers to your questions, learn how to use Data Whisperer, and get support from our team.
            </Text>
            <TextInput
              placeholder="Search for help..."
              leftSection={<IconSearch size={16} />}
              size="md"
              w="100%"
              maw={500}
              value={searchQuery}
              onChange={(e) => handleSearchFaqs(e.currentTarget.value)}
            />
          </Stack>
        </Paper>

        {/* Main Content */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="documentation" leftSection={<IconBook size={16} />}>
              Documentation
            </Tabs.Tab>
            <Tabs.Tab value="faqs" leftSection={<IconHelp size={16} />}>
              FAQs
            </Tabs.Tab>
            <Tabs.Tab value="tutorials" leftSection={<IconVideo size={16} />}>
              Video Tutorials
            </Tabs.Tab>
            <Tabs.Tab value="support" leftSection={<IconMessage size={16} />}>
              Support
            </Tabs.Tab>
          </Tabs.List>

          {/* Documentation Tab */}
          <Tabs.Panel value="documentation" pt="xl">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {documentationCategories.map((category, index) => (
                <Card key={index} withBorder p="lg" radius="md">
                  <Group mb="md">
                    <ThemeIcon size="lg" radius="md" color={category.color}>
                      {category.icon}
                    </ThemeIcon>
                    <Text fw={500}>{category.title}</Text>
                  </Group>
                  <Text size="sm" c="dimmed" mb="md">
                    {category.description}
                  </Text>
                  <List spacing="xs" size="sm" mb="md">
                    {category.articles.map((article, idx) => (
                      <List.Item key={idx}>
                        <Anchor component="button" onClick={() => navigate(article.path)}>
                          {article.title}
                        </Anchor>
                      </List.Item>
                    ))}
                  </List>
                  <Button 
                    variant="light" 
                    color={category.color} 
                    fullWidth 
                    rightSection={<IconArrowRight size={16} />}
                    onClick={() => navigate(`/help/docs/${category.title.toLowerCase().replace(' ', '-')}`)}
                  >
                    View All
                  </Button>
                </Card>
              ))}
            </SimpleGrid>
          </Tabs.Panel>

          {/* FAQs Tab */}
          <Tabs.Panel value="faqs" pt="xl">
            <Group mb="xl">
              <Text fw={500}>Filter by category:</Text>
              <Group>
                <Badge 
                  size="lg" 
                  variant={selectedCategory === null ? 'filled' : 'outline'} 
                  color="blue"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCategoryChange(null)}
                >
                  All
                </Badge>
                <Badge 
                  size="lg" 
                  variant={selectedCategory === 'general' ? 'filled' : 'outline'} 
                  color="gray"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCategoryChange('general')}
                >
                  General
                </Badge>
                <Badge 
                  size="lg" 
                  variant={selectedCategory === 'data' ? 'filled' : 'outline'} 
                  color="teal"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCategoryChange('data')}
                >
                  Data
                </Badge>
                <Badge 
                  size="lg" 
                  variant={selectedCategory === 'workflows' ? 'filled' : 'outline'} 
                  color="grape"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCategoryChange('workflows')}
                >
                  Workflows
                </Badge>
                <Badge 
                  size="lg" 
                  variant={selectedCategory === 'visualizations' ? 'filled' : 'outline'} 
                  color="orange"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCategoryChange('visualizations')}
                >
                  Visualizations
                </Badge>
                <Badge 
                  size="lg" 
                  variant={selectedCategory === 'ai' ? 'filled' : 'outline'} 
                  color="green"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCategoryChange('ai')}
                >
                  AI
                </Badge>
                <Badge 
                  size="lg" 
                  variant={selectedCategory === 'code' ? 'filled' : 'outline'} 
                  color="indigo"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCategoryChange('code')}
                >
                  Code
                </Badge>
              </Group>
            </Group>

            {filteredFaqs.length === 0 ? (
              <Paper p="xl" withBorder ta="center">
                <IconBulb size={48} opacity={0.3} style={{ marginBottom: '1rem' }} />
                <Text fw={500}>No FAQs found</Text>
                <Text size="sm" c="dimmed" mb="md">
                  Try adjusting your search query or category filter
                </Text>
                <Button 
                  variant="subtle" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                    setFilteredFaqs(faqs);
                  }}
                >
                  Clear Filters
                </Button>
              </Paper>
            ) : (
              <Accordion>
                {filteredFaqs.map((faq, index) => (
                  <Accordion.Item key={index} value={`faq-${index}`}>
                    <Accordion.Control>
                      <Group justify="space-between">
                        <Text fw={500}>{faq.question}</Text>
                        <Badge color={
                          faq.category === 'general' ? 'gray' :
                          faq.category === 'data' ? 'teal' :
                          faq.category === 'workflows' ? 'grape' :
                          faq.category === 'visualizations' ? 'orange' :
                          faq.category === 'ai' ? 'green' :
                          faq.category === 'code' ? 'indigo' : 'blue'
                        }>
                          {faq.category}
                        </Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text>{faq.answer}</Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </Tabs.Panel>

          {/* Video Tutorials Tab */}
          <Tabs.Panel value="tutorials" pt="xl">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {videoTutorials.map((video, index) => (
                <Card key={index} withBorder p="md" radius="md">
                  <Card.Section>
                    <Box style={{ position: 'relative' }}>
                      <Image
                        src={video.thumbnail}
                        height={200}
                        alt={video.title}
                      />
                      <Box
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: '50%',
                          width: 60,
                          height: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        onClick={() => window.open(video.url, '_blank')}
                      >
                        <IconBrandYoutube size={30} color="white" />
                      </Box>
                      <Box
                        style={{
                          position: 'absolute',
                          bottom: 10,
                          right: 10,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                        }}
                      >
                        {video.duration}
                      </Box>
                    </Box>
                  </Card.Section>
                  <Text fw={500} mt="md" mb="xs">
                    {video.title}
                  </Text>
                  <Button 
                    variant="light" 
                    color="red" 
                    leftSection={<IconBrandYoutube size={16} />}
                    fullWidth
                    onClick={() => window.open(video.url, '_blank')}
                    mt="md"
                  >
                    Watch Tutorial
                  </Button>
                </Card>
              ))}
            </SimpleGrid>

            <Paper withBorder p="xl" radius="md" mt="xl">
              <Group align="center" mb="md">
                <ThemeIcon size="xl" radius="md" color="red">
                  <IconBrandYoutube size={24} />
                </ThemeIcon>
                <div>
                  <Text fw={500}>Data Whisperer YouTube Channel</Text>
                  <Text size="sm" c="dimmed">
                    Subscribe to our channel for more tutorials and updates
                  </Text>
                </div>
              </Group>
              <Button 
                color="red" 
                leftSection={<IconBrandYoutube size={16} />}
                onClick={() => window.open('https://www.youtube.com/datawhisperer', '_blank')}
              >
                Visit Our Channel
              </Button>
            </Paper>
          </Tabs.Panel>

          {/* Support Tab */}
          <Tabs.Panel value="support" pt="xl">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Card withBorder p="xl" radius="md">
                <Group mb="md">
                  <ThemeIcon size="xl" radius="md" color="blue">
                    <IconMessage size={24} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>Contact Support</Text>
                    <Text size="sm" c="dimmed">
                      Get help from our support team
                    </Text>
                  </div>
                </Group>
                <Text size="sm" mb="lg">
                  Our support team is available Monday through Friday, 9am-5pm EST.
                  We typically respond within 24 hours.
                </Text>
                <Button 
                  leftSection={<IconMail size={16} />}
                  onClick={() => window.open('mailto:support@datawhisperer.com')}
                >
                  Email Support
                </Button>
              </Card>

              <Card withBorder p="xl" radius="md">
                <Group mb="md">
                  <ThemeIcon size="xl" radius="md" color="indigo">
                    <IconFileText size={24} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>Documentation</Text>
                    <Text size="sm" c="dimmed">
                      Browse our comprehensive documentation
                    </Text>
                  </div>
                </Group>
                <Text size="sm" mb="lg">
                  Our documentation covers everything from getting started to advanced features.
                  It's regularly updated with new content.
                </Text>
                <Button 
                  color="indigo" 
                  leftSection={<IconBook size={16} />}
                  onClick={() => setActiveTab('documentation')}
                >
                  View Documentation
                </Button>
              </Card>

              <Card withBorder p="xl" radius="md">
                <Group mb="md">
                  <ThemeIcon size="xl" radius="md" color="grape">
                    <IconBrandSlack size={24} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>Community Slack</Text>
                    <Text size="sm" c="dimmed">
                      Join our community on Slack
                    </Text>
                  </div>
                </Group>
                <Text size="sm" mb="lg">
                  Connect with other Data Whisperer users, share tips, and get help from the community.
                  Our team members are also active on Slack.
                </Text>
                <Button 
                  color="grape" 
                  leftSection={<IconBrandSlack size={16} />}
                  onClick={() => window.open('https://slack.datawhisperer.com', '_blank')}
                >
                  Join Slack
                </Button>
              </Card>

              <Card withBorder p="xl" radius="md">
                <Group mb="md">
                  <ThemeIcon size="xl" radius="md" color="dark">
                    <IconBrandGithub size={24} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>GitHub Issues</Text>
                    <Text size="sm" c="dimmed">
                      Report bugs or request features
                    </Text>
                  </div>
                </Group>
                <Text size="sm" mb="lg">
                  Found a bug or have a feature request? Submit an issue on our GitHub repository.
                  We actively monitor and respond to issues.
                </Text>
                <Button 
                  color="dark" 
                  leftSection={<IconBrandGithub size={16} />}
                  onClick={() => window.open('https://github.com/datawhisperer/issues', '_blank')}
                >
                  Open GitHub
                </Button>
              </Card>
            </SimpleGrid>

            <Divider my="xl" label="Additional Resources" labelPosition="center" />

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              <Card withBorder p="md" radius="md">
                <Group mb="sm">
                  <ThemeIcon size="md" radius="md" color="blue">
                    <IconBrandDiscord size={16} />
                  </ThemeIcon>
                  <Text fw={500}>Discord Community</Text>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  Join our Discord server for real-time discussions and support.
                </Text>
                <Button 
                  variant="light" 
                  size="sm" 
                  fullWidth
                  leftSection={<IconBrandDiscord size={14} />}
                  onClick={() => window.open('https://discord.gg/datawhisperer', '_blank')}
                >
                  Join Discord
                </Button>
              </Card>

              <Card withBorder p="md" radius="md">
                <Group mb="sm">
                  <ThemeIcon size="md" radius="md" color="orange">
                    <IconRocket size={16} />
                  </ThemeIcon>
                  <Text fw={500}>Webinars & Events</Text>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  Attend our webinars and events to learn from experts.
                </Text>
                <Button 
                  variant="light" 
                  size="sm" 
                  fullWidth
                  color="orange"
                  leftSection={<IconRocket size={14} />}
                  onClick={() => window.open('/events', '_blank')}
                >
                  View Events
                </Button>
              </Card>

              <Card withBorder p="md" radius="md">
                <Group mb="sm">
                  <ThemeIcon size="md" radius="md" color="green">
                    <IconBulb size={16} />
                  </ThemeIcon>
                  <Text fw={500}>Blog & Tutorials</Text>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  Read our blog for tips, tutorials, and best practices.
                </Text>
                <Button 
                  variant="light" 
                  size="sm" 
                  fullWidth
                  color="green"
                  leftSection={<IconBulb size={14} />}
                  onClick={() => window.open('/blog', '_blank')}
                >
                  Read Blog
                </Button>
              </Card>
            </SimpleGrid>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
} 
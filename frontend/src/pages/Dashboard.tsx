import { Container, Title, Text, Stack, Card, SimpleGrid, Button, Group, ThemeIcon, SegmentedControl, Menu, ActionIcon, Avatar, Paper, Progress, Badge, Tabs, RingProgress, Timeline, Modal, TextInput, ScrollArea, Loader, Box, Select, Textarea, Divider, Alert, Table } from '@mantine/core';
import {
  IconArrowRight,
  IconArrowsTransferUp,
  IconBrain,
  IconRobot,
  IconWand,
  IconBuildingSkyscraper,
  IconFolder,
  IconUsers,
  IconChartBar,
  IconDatabase,
  IconSettings,
  IconPlus,
  IconDots,
  IconBrandOpenai,
  IconReportAnalytics,
  IconTimeline,
  IconBolt,
  IconChartPie,
  IconChartDots,
  IconTableOptions,
  IconAlertCircle,
  IconCheck,
  IconSearch,
  IconBrandGithub,
  IconDownload,
  IconUpload,
  IconInfoCircle,
  IconFileUpload,
  IconExternalLink,
  IconX,
  IconFile,
  IconCode,
  IconEye,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import WorkflowBuilder from '../components/WorkflowBuilder';
import { LineChart, BarChart, PieChart } from '@mantine/charts';
import { searchKaggleDatasets, downloadKaggleDataset, validateKaggleApiKey } from '../services/kaggle';
import { notifications } from '@mantine/notifications';
import { ReactFlowProvider } from 'reactflow';
import { type KaggleDataset } from '../services/kaggle';
import { api, datasetsApi, workflowsApi, Workflow, Node, Edge } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { kaggleApi } from '../api';
import { KaggleDatasetBrowser } from '../components/KaggleDatasetBrowser';
import { useDisclosure } from '@mantine/hooks';
import { Prism } from '@mantine/prism';
import { useForm } from '@mantine/form';

interface Project {
  id: string;
  name: string;
  progress: number;
  members: number;
  status: string;
  dataset: {
    ref: string;
    description: string;
    size: string;
    lastUpdated: string;
    workflow: {
      nodes: Node[];
      edges: Edge[];
    };
  };
}

interface DatasetType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  file_path: string;
  metadata: Record<string, any>;
}

interface CreateProjectRequest {
  name: string;
  description: string;
  dataset_id: string;
  template: string;
}

interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  dataset_id: string;
  created_at: string;
  updated_at: string;
}

const generateDemoProjects = (datasets: DatasetType[], workflows: Workflow[]): Project[] => {
  // If we have no real data, return an empty array
  if (datasets.length === 0) {
    return [];
  }

  // Use real datasets to create demo projects
  return datasets.slice(0, 3).map((dataset, index) => {
    // Find a workflow that uses this dataset if available
    const relatedWorkflow = workflows.find(w => w.dataset_id === dataset.id);
    
    return {
      id: `demo-${index + 1}`,
      name: `Demo Project ${index + 1}: ${dataset.name}`,
      progress: Math.floor(Math.random() * 100),
      members: Math.floor(Math.random() * 5) + 1,
      status: ['Active', 'In Progress', 'Completed'][Math.floor(Math.random() * 3)],
      dataset: {
        ref: dataset.id,
        description: dataset.description || 'No description available',
        size: `${Math.round((dataset.metadata?.size_bytes || 0) / 1024 / 1024)} MB`,
        lastUpdated: dataset.updated_at,
        workflow: relatedWorkflow ? {
          nodes: relatedWorkflow.nodes,
          edges: relatedWorkflow.edges
        } : {
          nodes: [
            {
              id: 'node-1',
              type: 'dataSource',
              position: { x: 100, y: 100 },
              data: { label: 'Dataset Source' }
            },
            {
              id: 'node-2',
              type: 'transformation',
              position: { x: 300, y: 100 },
              data: { label: 'Data Transformation' }
            }
          ],
          edges: [
            { id: 'edge-1-2', source: 'node-1', target: 'node-2' }
          ]
        }
      }
    };
  });
};

const AI_INSIGHTS = [
  { title: 'Anomaly Detection', description: 'Unusual patterns detected in recent data', type: 'alert' },
  { title: 'Trend Analysis', description: 'Positive growth trend in key metrics', type: 'insight' },
  { title: 'Optimization', description: 'Resource allocation recommendations', type: 'recommendation' },
];

const TEAM_ACTIVITIES = [
  { user: 'Alice', action: 'updated Customer Segmentation workflow', time: '2h ago' },
  { user: 'Bob', action: 'created new Sales Analysis project', time: '4h ago' },
  { user: 'Carol', action: 'shared insights from Product Analytics', time: '5h ago' },
];

// Mock data for charts
const performanceData = [
  { date: '2024-01', value: 84 },
  { date: '2024-02', value: 89 },
  { date: '2024-03', value: 92 },
];

const distributionData = [
  { name: 'Processed', value: 65, color: 'blue' },
  { name: 'Pending', value: 25, color: 'yellow' },
  { name: 'Failed', value: 10, color: 'red' },
];

const accuracyData = [
  { model: 'Model A', accuracy: 89 },
  { model: 'Model B', accuracy: 94 },
  { model: 'Model C', accuracy: 78 },
];

// AI Insights Component
const AIInsightsCard = ({ datasets, onUploadClick }: { datasets: DatasetType[], onUploadClick: () => void }) => {
  const [activeInsight, setActiveInsight] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<{
    title: string;
    description: string;
    recommendation: string;
    code?: string;
    type: 'pattern' | 'anomaly' | 'correlation' | 'prediction';
  }[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState('');
  const [opened, { open, close }] = useDisclosure(false);

  // Generate insights when dataset changes or on request
  const generateInsights = async () => {
    if (!selectedDataset && datasets.length === 0) return;
    
    setIsGenerating(true);
    try {
      // In a real app, this would call your AI service
      // For demo, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const datasetToAnalyze = selectedDataset 
        ? datasets.find(d => d.id === selectedDataset) 
        : datasets[0];
      
      if (!datasetToAnalyze) {
        setInsights([]);
        return;
      }
      
      const newInsights = [
        {
          title: 'Pattern Detection',
          description: `We've detected a cyclical pattern in ${datasetToAnalyze.name} that occurs every 7 days, suggesting weekly seasonality.`,
          recommendation: 'Consider using time-series decomposition to separate this seasonal component for more accurate modeling.',
          code: `import pandas as pd\nimport statsmodels.api as sm\n\n# Load your dataset\ndf = pd.read_csv('${datasetToAnalyze.file_path}')\n\n# Convert to datetime and set as index\ndf['date'] = pd.to_datetime(df['date'])\ndf.set_index('date', inplace=True)\n\n# Decompose the time series\ndecomposition = sm.tsa.seasonal_decompose(df['value'], model='additive', period=7)\n\n# Plot the decomposition\ndecomposition.plot()`,
          type: 'pattern' as const
        },
        {
          title: 'Data Quality Alert',
          description: `${datasetToAnalyze.name} contains 3.2% missing values, primarily in the 'customer_segment' column.`,
          recommendation: 'Use KNN imputation instead of mean/median filling to preserve the relationship between features.',
          code: `from sklearn.impute import KNNImputer\nimport pandas as pd\n\n# Load your dataset\ndf = pd.read_csv('${datasetToAnalyze.file_path}')\n\n# Initialize KNN imputer\nimputer = KNNImputer(n_neighbors=5)\n\n# Apply imputation\ndf_imputed = pd.DataFrame(\n    imputer.fit_transform(df),\n    columns=df.columns\n)`,
          type: 'anomaly' as const
        },
        {
          title: 'Feature Correlation',
          description: `Strong correlation (0.87) detected between 'total_spend' and 'visit_frequency' in ${datasetToAnalyze.name}.`,
          recommendation: 'Consider creating a composite loyalty score feature combining these metrics for more predictive power.',
          code: `import pandas as pd\n\n# Load your dataset\ndf = pd.read_csv('${datasetToAnalyze.file_path}')\n\n# Create normalized versions of both features\ndf['norm_spend'] = (df['total_spend'] - df['total_spend'].min()) / (df['total_spend'].max() - df['total_spend'].min())\ndf['norm_visits'] = (df['visit_frequency'] - df['visit_frequency'].min()) / (df['visit_frequency'].max() - df['visit_frequency'].min())\n\n# Create composite loyalty score (weighted average)\ndf['loyalty_score'] = 0.6 * df['norm_spend'] + 0.4 * df['norm_visits']\n\n# Check correlation with target variable\nprint(df['loyalty_score'].corr(df['churn']))`,
          type: 'correlation' as const
        }
      ];
      
      if (customQuery) {
        newInsights.unshift({
          title: 'Custom Analysis',
          description: `Analysis of "${customQuery}" for ${datasetToAnalyze.name}`,
          recommendation: 'Based on your query, we recommend exploring the relationship between customer segments and purchase patterns using clustering techniques.',
          code: `import pandas as pd\nfrom sklearn.cluster import KMeans\nimport matplotlib.pyplot as plt\n\n# Load your dataset\ndf = pd.read_csv('${datasetToAnalyze.file_path}')\n\n# Select relevant features\nfeatures = df[['recency', 'frequency', 'monetary']]\n\n# Normalize the features\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nfeatures_scaled = scaler.fit_transform(features)\n\n# Apply KMeans clustering\nkmeans = KMeans(n_clusters=4, random_state=42)\ndf['cluster'] = kmeans.fit_predict(features_scaled)\n\n# Analyze the clusters\ndf.groupby('cluster').agg({\n    'recency': 'mean',\n    'frequency': 'mean',\n    'monetary': 'mean',\n    'customer_id': 'count'\n}).rename(columns={'customer_id': 'count'})`,
          type: 'prediction' as const
        });
      }
      
      setInsights(newInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to generate AI insights',
        color: 'red',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (datasets.length > 0) {
      generateInsights();
    }
  }, [selectedDataset]);

  const handleCustomQuery = () => {
    if (customQuery.trim()) {
      generateInsights();
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'pattern': return <IconChartDots size={24} />;
      case 'anomaly': return <IconAlertCircle size={24} />;
      case 'correlation': return <IconArrowsTransferUp size={24} />;
      case 'prediction': return <IconBrain size={24} />;
      default: return <IconRobot size={24} />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'pattern': return 'blue';
      case 'anomaly': return 'red';
      case 'correlation': return 'green';
      case 'prediction': return 'violet';
      default: return 'gray';
    }
  };

  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>AI Data Insights</Title>
          <Text c="dimmed">Intelligent analysis of your datasets</Text>
        </div>
        <Group>
          <Select
            placeholder="Select dataset"
            data={datasets.map(d => ({ value: d.id, label: d.name }))}
            value={selectedDataset}
            onChange={setSelectedDataset}
            clearable
            w={200}
          />
          <Button 
            variant="light" 
            leftSection={<IconBrain size={16} />}
            onClick={open}
          >
            Custom Analysis
          </Button>
        </Group>
      </Group>

      {isGenerating ? (
        <Paper p="xl" withBorder ta="center">
          <Loader size="md" mb="md" />
          <Text>Generating AI insights...</Text>
          <Text size="sm" c="dimmed">Our AI is analyzing patterns and anomalies in your data</Text>
        </Paper>
      ) : insights.length > 0 ? (
        <>
          <Tabs value={activeInsight.toString()} onChange={(value) => setActiveInsight(Number(value))}>
            <Tabs.List mb="md">
              {insights.map((insight, index) => (
                <Tabs.Tab 
                  key={index} 
                  value={index.toString()}
                  leftSection={getIconForType(insight.type)}
                  color={getColorForType(insight.type)}
                >
                  {insight.title}
                </Tabs.Tab>
              ))}
            </Tabs.List>

            {insights.map((insight, index) => (
              <Tabs.Panel key={index} value={index.toString()}>
                <Card withBorder radius="md" p="md">
                  <Group mb="md">
                    <ThemeIcon size="xl" radius="md" color={getColorForType(insight.type)}>
                      {getIconForType(insight.type)}
                    </ThemeIcon>
                    <div>
                      <Text fw={500}>{insight.title}</Text>
                      <Text size="sm" c="dimmed">{insight.description}</Text>
                    </div>
                  </Group>
                  
                  <Alert 
                    icon={<IconBrain size={16} />} 
                    title="AI Recommendation" 
                    color="blue" 
                    mb="md"
                  >
                    {insight.recommendation}
                  </Alert>
                  
                  {insight.code && (
                    <>
                      <Text size="sm" fw={500} mb="xs">Suggested Implementation:</Text>
                      <Prism language="python" mb="md">
                        {insight.code}
                      </Prism>
                      <Group justify="flex-end">
                        <Button 
                          variant="light" 
                          size="xs"
                          leftSection={<IconCode size={14} />}
                          component="a"
                          href="/notebook"
                        >
                          Open in Notebook
                        </Button>
                      </Group>
                    </>
                  )}
                </Card>
              </Tabs.Panel>
            ))}
          </Tabs>
        </>
      ) : (
        <Paper p="xl" withBorder ta="center">
          <IconBrain size={48} opacity={0.3} style={{ marginBottom: '1rem' }} />
          <Text fw={500}>No AI insights available</Text>
          <Text size="sm" c="dimmed" mb="md">
            Upload a dataset or select one from your library to get AI-powered insights
          </Text>
          <Button 
            variant="light" 
            leftSection={<IconUpload size={16} />}
            onClick={onUploadClick}
          >
            Upload Dataset
          </Button>
        </Paper>
      )}

      {/* Custom Analysis Modal */}
      <Modal opened={opened} onClose={close} title="Custom AI Analysis" size="lg">
        <Text size="sm" mb="md">
          Ask our AI to analyze your data and provide specific insights
        </Text>
        <Select
          label="Dataset to analyze"
          placeholder="Select a dataset"
          data={datasets.map(d => ({ value: d.id, label: d.name }))}
          value={selectedDataset}
          onChange={setSelectedDataset}
          mb="md"
          required
        />
        <Textarea
          label="What would you like to analyze?"
          placeholder="E.g., Find correlations between customer age and purchase frequency"
          description="Be specific about what patterns or relationships you're interested in"
          minRows={3}
          maxRows={5}
          mb="md"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button 
            onClick={() => {
              handleCustomQuery();
              close();
            }}
            leftSection={<IconBrain size={16} />}
            disabled={!selectedDataset || !customQuery.trim()}
          >
            Generate Insights
          </Button>
        </Group>
      </Modal>
    </Card>
  );
};

// Workflow Recommendation Component
const WorkflowRecommendationCard = ({ datasets, onCreateWorkflow }: { 
  datasets: DatasetType[], 
  onCreateWorkflow: (datasetId: string, template: string) => void 
}) => {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('quick_start');
  
  const templates = [
    { 
      value: 'quick_start', 
      label: 'Quick Start', 
      description: 'Basic data cleaning and visualization',
      icon: <IconBolt size={16} />,
      color: 'blue',
      steps: ['Data Loading', 'Missing Value Handling', 'Basic Visualization']
    },
    { 
      value: 'classification', 
      label: 'Classification', 
      description: 'Predict categorical outcomes',
      icon: <IconTableOptions size={16} />,
      color: 'green',
      steps: ['Data Preprocessing', 'Feature Engineering', 'Model Training', 'Evaluation']
    },
    { 
      value: 'clustering', 
      label: 'Clustering', 
      description: 'Discover groups in your data',
      icon: <IconChartDots size={16} />,
      color: 'violet',
      steps: ['Data Normalization', 'Dimensionality Reduction', 'Cluster Analysis']
    },
    { 
      value: 'time_series', 
      label: 'Time Series', 
      description: 'Analyze temporal patterns',
      icon: <IconTimeline size={16} />,
      color: 'orange',
      steps: ['Temporal Feature Extraction', 'Trend Analysis', 'Forecasting']
    }
  ];
  
  const getSelectedTemplate = () => {
    return templates.find(t => t.value === selectedTemplate) || templates[0];
  };
  
  return (
    <Card withBorder padding="lg" radius="md">
      <Title order={2} mb="xs">Workflow Recommendations</Title>
      <Text c="dimmed" mb="lg">Get started quickly with AI-recommended workflows</Text>
      
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card withBorder p="md" radius="md">
          <Title order={4} mb="md">1. Select Your Dataset</Title>
          
          {datasets.length > 0 ? (
            <Select
              label="Choose a dataset to analyze"
              placeholder="Select a dataset"
              data={datasets.map(d => ({ value: d.id, label: d.name }))}
              value={selectedDataset}
              onChange={setSelectedDataset}
              mb="md"
              searchable
              clearable
            />
          ) : (
            <Paper p="md" withBorder ta="center" mb="md">
              <IconDatabase size={32} opacity={0.3} style={{ marginBottom: '0.5rem' }} />
              <Text size="sm">No datasets available</Text>
              <Text size="xs" c="dimmed">Upload a dataset to get started</Text>
            </Paper>
          )}
          
          <Text size="sm" fw={500} mb="xs">What are you trying to accomplish?</Text>
          <Textarea
            placeholder="E.g., I want to predict customer churn based on transaction history"
            minRows={3}
            mb="md"
          />
          
          <Button 
            fullWidth 
            leftSection={<IconWand size={16} />}
            disabled={!selectedDataset}
          >
            Analyze Dataset
          </Button>
        </Card>
        
        <Card withBorder p="md" radius="md">
          <Title order={4} mb="md">2. Choose a Workflow Template</Title>
          
          <div style={{ marginBottom: '1rem' }}>
            {templates.map(template => (
              <Paper
                key={template.value}
                withBorder
                p="md"
                radius="md"
                mb="xs"
                style={{ 
                  cursor: 'pointer',
                  borderColor: selectedTemplate === template.value 
                    ? `var(--mantine-color-${template.color}-6)` 
                    : undefined,
                  backgroundColor: selectedTemplate === template.value 
                    ? `var(--mantine-color-${template.color}-0)` 
                    : undefined
                }}
                onClick={() => setSelectedTemplate(template.value)}
              >
                <Group>
                  <ThemeIcon color={template.color} variant="light" size="md">
                    {template.icon}
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>{template.label}</Text>
                    <Text size="xs" c="dimmed">{template.description}</Text>
                  </div>
                </Group>
              </Paper>
            ))}
          </div>
          
          <Button 
            fullWidth
            variant="gradient"
            gradient={{ from: getSelectedTemplate().color, to: `${getSelectedTemplate().color}.5` }}
            leftSection={<IconArrowsTransferUp size={16} />}
            onClick={() => selectedDataset && onCreateWorkflow(selectedDataset, selectedTemplate)}
            disabled={!selectedDataset}
          >
            Create Workflow
          </Button>
        </Card>
      </SimpleGrid>
      
      {selectedDataset && (
        <Card withBorder p="md" radius="md" mt="md">
          <Group mb="md">
            <ThemeIcon size="lg" radius="md" color={getSelectedTemplate().color}>
              {getSelectedTemplate().icon}
            </ThemeIcon>
            <div>
              <Text fw={500}>Workflow Preview: {getSelectedTemplate().label}</Text>
              <Text size="sm" c="dimmed">
                This workflow will help you {getSelectedTemplate().description.toLowerCase()} with your selected dataset
              </Text>
            </div>
          </Group>
          
          <Timeline active={1} bulletSize={24} lineWidth={2}>
            {getSelectedTemplate().steps.map((step, index) => (
              <Timeline.Item 
                key={index}
                bullet={<Text size="xs">{index + 1}</Text>}
                title={step}
              >
                <Text size="sm" c="dimmed">
                  {index === 0 
                    ? 'Ready to start' 
                    : index === 1 
                      ? 'Next step' 
                      : 'Upcoming step'}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}
    </Card>
  );
};

// Data Visualization Component
const DataVisualizationCard = ({ datasets }: { datasets: DatasetType[] }) => {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [visualizationType, setVisualizationType] = useState<string>('bar');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for visualizations
  const barChartData = [
    { category: 'Category A', value: 35 },
    { category: 'Category B', value: 22 },
    { category: 'Category C', value: 18 },
    { category: 'Category D', value: 25 },
  ];
  
  const lineChartData = [
    { date: '2023-01', value: 28 },
    { date: '2023-02', value: 32 },
    { date: '2023-03', value: 36 },
    { date: '2023-04', value: 30 },
    { date: '2023-05', value: 40 },
    { date: '2023-06', value: 35 },
  ];
  
  const pieChartData = [
    { segment: 'Segment 1', value: 40 },
    { segment: 'Segment 2', value: 25 },
    { segment: 'Segment 3', value: 20 },
    { segment: 'Segment 4', value: 15 },
  ];
  
  const generateVisualization = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  useEffect(() => {
    if (selectedDataset) {
      generateVisualization();
    }
  }, [selectedDataset, visualizationType]);
  
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Interactive Data Visualization</Title>
          <Text c="dimmed">Explore your data with interactive charts</Text>
        </div>
        <Group>
          <Select
            placeholder="Select dataset"
            data={datasets.map(d => ({ value: d.id, label: d.name }))}
            value={selectedDataset}
            onChange={setSelectedDataset}
            clearable
            w={200}
          />
          <SegmentedControl
            value={visualizationType}
            onChange={setVisualizationType}
            data={[
              { label: 'Bar', value: 'bar' },
              { label: 'Line', value: 'line' },
              { label: 'Pie', value: 'pie' },
            ]}
          />
        </Group>
      </Group>
      
      {isLoading ? (
        <Paper p="xl" withBorder ta="center">
          <Loader size="md" mb="md" />
          <Text>Generating visualization...</Text>
        </Paper>
      ) : selectedDataset ? (
        <Card withBorder p="md" radius="md">
          {visualizationType === 'bar' && (
            <>
              <Text fw={500} mb="md">Distribution by Category</Text>
              <BarChart
                h={300}
                data={barChartData}
                dataKey="category"
                series={[{ name: 'value', color: 'blue' }]}
                tickLine="y"
              />
            </>
          )}
          
          {visualizationType === 'line' && (
            <>
              <Text fw={500} mb="md">Trend Analysis</Text>
              <LineChart
                h={300}
                data={lineChartData}
                dataKey="date"
                series={[{ name: 'value', color: 'green' }]}
                curveType="natural"
              />
            </>
          )}
          
          {visualizationType === 'pie' && (
            <>
              <Text fw={500} mb="md">Segment Distribution</Text>
              <PieChart
                h={300}
                data={pieChartData.map(item => ({
                  name: item.segment,
                  value: item.value,
                  color: ['blue', 'green', 'orange', 'grape'][pieChartData.indexOf(item) % 4]
                }))}
                withLabels
                labelsType="percent"
              />
            </>
          )}
          
          <Group justify="flex-end" mt="md">
            <Button 
              variant="light" 
              size="xs"
              leftSection={<IconDownload size={14} />}
            >
              Export Chart
            </Button>
            <Button 
              variant="light" 
              size="xs"
              leftSection={<IconExternalLink size={14} />}
              component="a"
              href="/analysis/visualize"
            >
              Advanced Visualization
            </Button>
          </Group>
        </Card>
      ) : (
        <Paper p="xl" withBorder ta="center">
          <IconChartPie size={48} opacity={0.3} style={{ marginBottom: '1rem' }} />
          <Text fw={500}>Select a dataset to visualize</Text>
          <Text size="sm" c="dimmed" mb="md">
            Choose a dataset and visualization type to get started
          </Text>
        </Paper>
      )}
    </Card>
  );
};

// Quick Actions Component
const QuickActionsCard = ({ onUploadClick, onKaggleClick }: { 
  onUploadClick: () => void,
  onKaggleClick: () => void
}) => {
  const navigate = useNavigate();
  
  const actions = [
    {
      title: 'Upload Dataset',
      description: 'Upload a new dataset from your computer',
      icon: <IconUpload size={24} />,
      color: 'blue',
      onClick: onUploadClick
    },
    {
      title: 'Import from Kaggle',
      description: 'Search and import datasets from Kaggle',
      icon: <Box 
        component="img" 
        src="/kaggle-icon.svg" 
        style={{ width: '24px', height: '24px', display: 'block' }} 
      />,
      color: 'cyan',
      onClick: onKaggleClick
    },
    {
      title: 'Create Workflow',
      description: 'Build a new data processing workflow',
      icon: <IconArrowsTransferUp size={24} />,
      color: 'grape',
      onClick: () => navigate('/workflow')
    },
    {
      title: 'Open Notebook',
      description: 'Write and execute code in a notebook',
      icon: <IconCode size={24} />,
      color: 'indigo',
      onClick: () => navigate('/notebook')
    },
    {
      title: 'AI Analysis',
      description: 'Get AI-powered insights from your data',
      icon: <IconBrain size={24} />,
      color: 'green',
      onClick: () => navigate('/analysis/ai')
    },
    {
      title: 'Visualize Data',
      description: 'Create interactive visualizations',
      icon: <IconChartPie size={24} />,
      color: 'orange',
      onClick: () => navigate('/analysis/visualize')
    }
  ];
  
  return (
    <Card withBorder padding="lg" radius="md">
      <Title order={2} mb="xs">Quick Actions</Title>
      <Text c="dimmed" mb="lg">Common tasks and shortcuts</Text>
      
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 6 }} spacing="md">
        {actions.map((action, index) => (
          <Card 
            key={index} 
            withBorder 
            padding="lg" 
            radius="md" 
            style={{ cursor: 'pointer' }}
            onClick={action.onClick}
          >
            <Stack align="center" gap="xs">
              <ThemeIcon size={48} radius="md" color={action.color}>
                {action.icon}
              </ThemeIcon>
              <Text fw={500} ta="center">{action.title}</Text>
              <Text size="xs" c="dimmed" ta="center" lineClamp={2}>
                {action.description}
              </Text>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Card>
  );
};

// Recent Datasets Component
const RecentDatasetsCard = ({ datasets, onPreview }: { 
  datasets: DatasetType[], 
  onPreview: (dataset: DatasetType) => void 
}) => {
  const navigate = useNavigate();
  
  // Sort datasets by updated_at date
  const sortedDatasets = [...datasets].sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 5); // Get only the 5 most recent
  
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Recent Datasets</Title>
          <Text c="dimmed">Your recently updated datasets</Text>
        </div>
        <Button 
          variant="light" 
          onClick={() => navigate('/data/management')}
          rightSection={<IconArrowRight size={16} />}
        >
          View All
        </Button>
      </Group>
      
      {sortedDatasets.length > 0 ? (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Last Updated</Table.Th>
              <Table.Th>Size</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedDatasets.map((dataset) => (
              <Table.Tr key={dataset.id}>
                <Table.Td>
                  <Group gap="sm">
                    <ThemeIcon size="md" variant="light" color="blue">
                      <IconFile size={16} />
                    </ThemeIcon>
                    <Text fw={500}>{dataset.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  {new Date(dataset.updated_at).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  {dataset.metadata?.size_bytes 
                    ? `${Math.round(dataset.metadata.size_bytes / 1024 / 1024)} MB` 
                    : 'Unknown'}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon 
                      variant="subtle" 
                      color="blue"
                      onClick={() => onPreview(dataset)}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon 
                      variant="subtle" 
                      color="green"
                      onClick={() => navigate(`/workflow?dataset=${dataset.id}`)}
                    >
                      <IconArrowsTransferUp size={16} />
                    </ActionIcon>
                    <ActionIcon 
                      variant="subtle" 
                      color="grape"
                      onClick={() => navigate(`/analysis/ai?dataset=${dataset.id}`)}
                    >
                      <IconBrain size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Paper p="xl" withBorder ta="center">
          <IconDatabase size={48} opacity={0.3} style={{ marginBottom: '1rem' }} />
          <Text fw={500}>No datasets available</Text>
          <Text size="sm" c="dimmed" mb="md">
            Upload a dataset to get started
          </Text>
        </Paper>
      )}
    </Card>
  );
};

export function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState('company');
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const [kaggleModalOpen, setKaggleModalOpen] = useState(false);
  const [kaggleSearchQuery, setKaggleSearchQuery] = useState('');
  const [kaggleSearchResults, setKaggleSearchResults] = useState<KaggleDataset[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const [createProjectData, setCreateProjectData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    dataset_id: '',
    template: 'quick_start'
  });
  const [kaggleApiKey, setKaggleApiKey] = useState('');
  const [kaggleUsername, setKaggleUsername] = useState('');
  const [showKaggleApiForm, setShowKaggleApiForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloadingDataset, setDownloadingDataset] = useState<string | null>(null);

  // Fetch available datasets
  const { data: datasetsResponse, isLoading: datasetsLoading, refetch: refetchDatasets } = useQuery<DatasetType[]>({
    queryKey: ['datasets'],
    queryFn: async () => {
      try {
        const response = await datasetsApi.getAll();
        return response.data || [];
      } catch (error) {
        console.error('Failed to fetch datasets:', error);
        return [];
      }
    },
    initialData: [],
  });

  // Fetch available workflows
  const { data: workflowsResponse, isLoading: workflowsLoading } = useQuery<Workflow[]>({
    queryKey: ['workflows'],
    queryFn: async () => {
      try {
        const response = await workflowsApi.getAll();
        return response.data || [];
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
        return [];
      }
    },
    initialData: [],
  });

  // Ensure datasets is always an array
  const datasets = Array.isArray(datasetsResponse) ? datasetsResponse : [];
  const workflows = Array.isArray(workflowsResponse) ? workflowsResponse : [];

  // Upload dataset mutation
  const uploadDatasetMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await datasetsApi.create(formData);
      return response.data;
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Dataset uploaded successfully',
        color: 'green',
      });
      setUploadModalOpen(false);
      setFiles([]);
      setDatasetName('');
      setDatasetDescription('');
      setUploadProgress(0);
      refetchDatasets();
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to upload dataset',
        color: 'red',
      });
    },
  });

  // Create workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async (data: Partial<Workflow>) => {
      const response = await workflowsApi.create(data);
      return response.data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: 'Workflow created successfully',
        color: 'green',
      });
      setCreateProjectModalOpen(false);
      navigate(`/workflow?workflow=${data.id || 'new'}`);
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to create workflow',
        color: 'red',
      });
    },
  });

  const handleFileUpload = async () => {
    if (files.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Please select a file to upload',
        color: 'red',
      });
      return;
    }

    if (!datasetName) {
      notifications.show({
        title: 'Error',
        message: 'Please provide a name for the dataset',
        color: 'red',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('name', datasetName);
    formData.append('description', datasetDescription);

    try {
      // Simulate progress for better UX
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      await uploadDatasetMutation.mutateAsync(formData);
      
      clearInterval(interval);
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateWorkflow = () => {
    if (!selectedDataset) {
      notifications.show({
        title: 'Error',
        message: 'Please select a dataset first',
        color: 'red',
      });
      return;
    }

    const datasetInfo = datasets.find(d => d.id === selectedDataset);
    if (!datasetInfo) {
      notifications.show({
        title: 'Error',
        message: 'Selected dataset not found',
        color: 'red',
      });
      return;
    }

    // Update the createProjectData with the correct fields for workflow creation
    setCreateProjectData({
      name: `New Workflow - ${datasetInfo.name}`,
      description: 'Created with Quick Start Template',
      dataset_id: selectedDataset,
      template: 'quick_start'
    });
    setCreateProjectModalOpen(true);
  };

  const handleSubmitWorkflow = () => {
    if (!createProjectData.name) {
      notifications.show({
        title: 'Error',
        message: 'Please provide a name for the workflow',
        color: 'red',
      });
      return;
    }

    // Create a basic workflow with initial nodes and edges
    const workflowData = {
      name: createProjectData.name,
      description: createProjectData.description,
      dataset_id: selectedDataset,
      template: createProjectData.template,
      nodes: [
        {
          id: 'node-1',
          type: 'dataSource',
          position: { x: 100, y: 100 },
          data: { label: 'Dataset Source' }
        },
        {
          id: 'node-2',
          type: 'transformation',
          position: { x: 300, y: 100 },
          data: { label: 'Data Transformation' }
        },
        {
          id: 'node-3',
          type: 'analysis',
          position: { x: 500, y: 100 },
          data: { label: 'Analysis' }
        }
      ],
      edges: [
        { id: 'edge-1-2', source: 'node-1', target: 'node-2' },
        { id: 'edge-2-3', source: 'node-2', target: 'node-3' }
      ]
    };
    
    createWorkflowMutation.mutate(workflowData);
  };

  const handleKaggleSearch = async () => {
    if (!kaggleSearchQuery) return;
    
    setSearchLoading(true);
    try {
      // Use the kaggleApi helper which handles the correct endpoint
      const response = await kaggleApi.search(kaggleSearchQuery);
      console.log('Kaggle search response:', response.data);
      setKaggleSearchResults(response.data || []);
    } catch (error) {
      console.error('Kaggle search error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to search Kaggle datasets. Please try again later.',
        color: 'red',
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKaggleDatasetDownload = async (dataset: any) => {
    try {
      const response = await kaggleApi.download(dataset.ref);
      notifications.show({
        title: 'Success',
        message: `Dataset ${dataset.title} downloaded successfully`,
        color: 'green',
      });
      refetchDatasets();
      setKaggleModalOpen(false);
    } catch (error) {
      console.error('Error downloading Kaggle dataset:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to download dataset from Kaggle',
        color: 'red',
      });
    }
  };

  const handleSaveKaggleCredentials = async () => {
    if (!kaggleUsername || !kaggleApiKey) {
      notifications.show({
        title: 'Error',
        message: 'Please provide both Kaggle username and API key',
        color: 'red',
      });
      return;
    }

    try {
      // Save Kaggle credentials to the backend
      await api.post('/kaggle/credentials', {
        username: kaggleUsername,
        api_key: kaggleApiKey
      });
      
      notifications.show({
        title: 'Success',
        message: 'Kaggle credentials saved successfully',
        color: 'green',
      });
      
      setShowKaggleApiForm(false);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save Kaggle credentials',
        color: 'red',
      });
    }
  };

  const CompanyView = () => (
    <Stack gap="xl">
      {/* Quick Actions Card */}
      <QuickActionsCard 
        onUploadClick={() => setUploadModalOpen(true)}
        onKaggleClick={() => setKaggleModalOpen(true)}
      />
      
      {/* Recent Datasets Card */}
      <RecentDatasetsCard 
        datasets={datasets} 
        onPreview={(dataset) => {
          setSelectedDataset(dataset.id);
          // Assuming you have a preview modal or function
          // setPreviewModalOpen(true);
        }} 
      />
      
      {/* Projects Overview Section */}
      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Projects Overview</Title>
            <Text c="dimmed">Manage and monitor your data projects</Text>
          </div>
          <Group>
            <Button 
              variant="light"
              leftSection={
                <Box 
                  component="img" 
                  src="/kaggle-icon.svg" 
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    display: 'block' 
                  }} 
                />
              }
              onClick={() => setKaggleModalOpen(true)}
            >
              Import from Kaggle
            </Button>
            <Button 
              size="md"
              leftSection={<IconPlus size={20} />}
              variant="gradient"
              gradient={{ from: 'blue', to: 'grape' }}
              onClick={handleCreateWorkflow}
              disabled={!selectedDataset}
            >
              Create Workflow
            </Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {generateDemoProjects(datasets, workflows).length > 0 ? (
            generateDemoProjects(datasets, workflows).map((project) => (
              <Card key={project.id} withBorder radius="md" padding="md">
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>{project.name}</Text>
                  <Badge color={project.status === 'Active' ? 'blue' : project.status === 'Completed' ? 'green' : 'yellow'}>
                    {project.status}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                  {project.dataset.description}
                </Text>
                <Group justify="space-between" mb="xs">
                  <Text size="xs" c="dimmed">Progress</Text>
                  <Text size="xs" c="dimmed">{project.progress}%</Text>
                </Group>
                <Progress value={project.progress} size="sm" mb="md" />
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconDatabase size={16} />
                    <Text size="xs">{project.dataset.size}</Text>
                  </Group>
                  <Button 
                    size="xs" 
                    variant="light"
                    onClick={() => navigate(`/workflow?dataset=${project.dataset.ref}`)}
                  >
                    View Workflow
                  </Button>
                </Group>
              </Card>
            ))
          ) : (
            <Card withBorder radius="md" padding="lg">
              <Stack align="center" gap="md">
                <IconDatabase size={48} opacity={0.3} />
                <Text ta="center" fw={500}>No projects yet</Text>
                <Text ta="center" size="sm" c="dimmed">
                  Upload a dataset or import from Kaggle to get started
                </Text>
                <Group>
                  <Button 
                    variant="light" 
                    leftSection={<IconUpload size={16} />}
                    onClick={() => setUploadModalOpen(true)}
                  >
                    Upload Dataset
                  </Button>
                  <Button 
                    variant="light"
                    leftSection={
                      <Box 
                        component="img" 
                        src="/kaggle-icon.svg" 
                        style={{ 
                          width: '16px', 
                          height: '16px', 
                          display: 'block' 
                        }} 
                      />
                    }
                    onClick={() => setKaggleModalOpen(true)}
                  >
                    Import from Kaggle
                  </Button>
                </Group>
              </Stack>
            </Card>
          )}
        </SimpleGrid>
      </Card>

      {/* Workflow Recommendation Card */}
      <WorkflowRecommendationCard 
        datasets={datasets} 
        onCreateWorkflow={(datasetId, template) => {
          setCreateProjectData({
            ...createProjectData,
            dataset_id: datasetId,
            template: template
          });
          setCreateProjectModalOpen(true);
        }} 
      />

      {/* Data Visualization Card */}
      <DataVisualizationCard datasets={datasets} />

      {/* AI Insights Card */}
      <AIInsightsCard datasets={datasets} onUploadClick={() => setUploadModalOpen(true)} />
    </Stack>
  );

  const ProjectView = () => {
    const currentProject = generateDemoProjects(datasets, workflows)[0]; // For demo, using first project

    const handleWorkflowChange = (workflow: any) => {
      // In a real app, this would update the project's workflow in the backend
      console.log('Workflow updated:', workflow);
    };

    return (
      <Stack gap="xl">
        {/* Project Header */}
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={40} radius="md" variant="light" color="blue">
              <IconFolder size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Current Project</Text>
              <Text size="xl" fw={500}>{currentProject?.name}</Text>
            </div>
          </Group>
          <Group>
            <Button variant="light" leftSection={<IconPlus size={16} />}>
              New Analysis
            </Button>
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="light" size="lg">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconSettings size={16} />}>Project Settings</Menu.Item>
                <Menu.Item leftSection={<IconUsers size={16} />}>Manage Team</Menu.Item>
                <Menu.Item leftSection={<IconReportAnalytics size={16} />}>Analytics</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Project Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="workflows" leftSection={<IconArrowsTransferUp size={16} />}>
              Workflows
            </Tabs.Tab>
            <Tabs.Tab value="ai" leftSection={<IconBrain size={16} />}>
              AI Models
            </Tabs.Tab>
            <Tabs.Tab value="timeline" leftSection={<IconTimeline size={16} />}>
              Timeline
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <Card withBorder padding="lg" radius="md">
                <Stack gap="md">
                  <ThemeIcon size={40} radius="md" variant="light" color="grape">
                    <IconBrain size={24} />
                  </ThemeIcon>
                  <Text fw={500}>AI Insights</Text>
                  <Text size="sm" c="dimmed">
                    Get intelligent suggestions and automated insights from your data
                  </Text>
                  <Button 
                    variant="light" 
                    color="grape" 
                    onClick={() => setActiveTab('ai')}
                    mt="auto"
                  >
                    Explore Insights
                  </Button>
                </Stack>
              </Card>

              <Card withBorder padding="lg" radius="md">
                <Stack gap="md">
                  <ThemeIcon size={40} radius="md" variant="light" color="cyan">
                    <IconWand size={24} />
                  </ThemeIcon>
                  <Text fw={500}>Data Preparation</Text>
                  <Text size="sm" c="dimmed">
                    Clean, transform, and prepare your data for analysis
                  </Text>
                  <Button 
                    variant="light" 
                    color="cyan" 
                    onClick={() => setActiveTab('workflows')}
                    mt="auto"
                  >
                    Start Preparation
                  </Button>
                </Stack>
              </Card>

              <Card withBorder padding="lg" radius="md">
                <Stack gap="md">
                  <ThemeIcon size={40} radius="md" variant="light" color="orange">
                    <IconRobot size={24} />
                  </ThemeIcon>
                  <Text fw={500}>Automated Analysis</Text>
                  <Text size="sm" c="dimmed">
                    Let AI analyze your data and generate comprehensive reports
                  </Text>
                  <Button 
                    variant="light" 
                    color="orange" 
                    onClick={() => setActiveTab('ai')}
                    mt="auto"
                  >
                    Start Analysis
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="workflows" pt="md">
            <Card withBorder radius="md" style={{ height: '600px', width: '100%' }}>
              <ReactFlowProvider>
                <div style={{ height: '100%', width: '100%' }}>
                  <WorkflowBuilder 
                    onSave={handleWorkflowChange}
                    onExecute={() => console.log('Execute workflow')}
                  />
                </div>
              </ReactFlowProvider>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="ai" pt="md">
            <Stack gap="md">
              <Card withBorder padding="lg" radius="md">
                <Title order={3} mb="md">Active AI Models</Title>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <Card withBorder padding="md" radius="md">
                    <Group gap="sm">
                      <ThemeIcon size={32} radius="md" variant="light" color="blue">
                        <IconBrain size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={500}>Customer Segmentation Model</Text>
                        <Text size="sm" c="dimmed">Active - Last updated 2h ago</Text>
                      </div>
                    </Group>
                  </Card>
                  <Card withBorder padding="md" radius="md">
                    <Group gap="sm">
                      <ThemeIcon size={32} radius="md" variant="light" color="grape">
                        <IconChartBar size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={500}>Predictive Analytics</Text>
                        <Text size="sm" c="dimmed">Training - 75% complete</Text>
                      </div>
                    </Group>
                  </Card>
                </SimpleGrid>
              </Card>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="timeline" pt="md">
            <Stack gap="md">
              <Card withBorder padding="lg" radius="md">
                <Title order={3} mb="md">Project Timeline</Title>
                <Stack gap="lg">
                  {TEAM_ACTIVITIES.map((activity, index) => (
                    <Group key={index} gap="sm">
                      <Avatar radius="xl" size="sm">{activity.user[0]}</Avatar>
                      <div style={{ flex: 1 }}>
                        <Group justify="space-between">
                          <Text size="sm" fw={500}>{activity.user}</Text>
                          <Text size="xs" c="dimmed">{activity.time}</Text>
                        </Group>
                        <Text size="sm">{activity.action}</Text>
                      </div>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    );
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Dashboard Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Title>Data Wrangler Dashboard</Title>
            <Text c="dimmed">Manage your datasets, workflows, and analytics</Text>
          </Stack>
          <SegmentedControl
            value={view}
            onChange={setView}
            data={[
              { label: 'Overview', value: 'company' },
              { label: 'Project View', value: 'project' },
            ]}
          />
        </Group>

        {/* Quick Actions Card */}
        <Card withBorder shadow="sm" radius="md" padding="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Quick Actions</Title>
              <Badge size="lg" variant="light" color="blue">
                {datasets.length} Datasets Available
              </Badge>
            </Group>
            
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <Button 
                fullWidth 
                leftSection={<IconFileUpload size={20} />}
                onClick={() => setUploadModalOpen(true)}
              >
                Upload Dataset
              </Button>
              
              <Button 
                fullWidth 
                leftSection={<IconDatabase size={20} />}
                onClick={() => setKaggleModalOpen(true)}
              >
                Import from Kaggle
              </Button>
              
              <Button 
                fullWidth 
                leftSection={<IconPlus size={20} />}
                onClick={handleCreateWorkflow}
                disabled={datasets.length === 0}
              >
                Create Workflow
              </Button>
            </SimpleGrid>
            
            {datasets.length === 0 && (
              <Alert icon={<IconInfoCircle size={16} />} title="No datasets available" color="blue">
                Please upload a dataset or import from Kaggle to get started.
              </Alert>
            )}
            
            {/* Dataset Selection */}
            {datasets.length > 0 && (
              <Select
                label="Select a dataset to work with"
                placeholder="Choose a dataset"
                data={datasets.map(d => ({ value: d.id, label: d.name }))}
                value={selectedDataset}
                onChange={setSelectedDataset}
                searchable
                clearable
              />
            )}
            
            {datasetsLoading && (
              <Text size="sm" c="dimmed" ta="center" mt="xs">Loading datasets...</Text>
            )}
          </Stack>
        </Card>

        {/* Rest of the dashboard content */}
        {view === 'company' ? <CompanyView /> : <ProjectView />}

        {/* Dataset Upload Modal */}
        <Modal
          opened={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title="Upload Dataset"
          size="lg"
        >
          <Stack gap="md">
            <TextInput
              label="Dataset Name"
              placeholder="Enter a name for your dataset"
              required
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
            />
            
            <Textarea
              label="Description"
              placeholder="Enter a description for your dataset"
              value={datasetDescription}
              onChange={(e) => setDatasetDescription(e.target.value)}
            />
            
            <Dropzone
              onDrop={(files) => setFiles(files)}
              maxFiles={1}
              accept={['.csv', '.xlsx', '.json', '.parquet']}
              loading={isUploading}
            >
              <Group justify="center" gap="xl" style={{ minHeight: 140, pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload size={50} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={50} stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconUpload size={50} stroke={1.5} />
                </Dropzone.Idle>

                <Stack gap="xs" style={{ maxWidth: 400 }}>
                  <Text size="xl" inline>
                    Drag files here or click to select
                  </Text>
                  <Text size="sm" c="dimmed" inline>
                    Attach a single file (CSV, Excel, JSON, or Parquet) for your dataset
                  </Text>
                </Stack>
              </Group>
            </Dropzone>
            
            {files.length > 0 && (
              <Stack gap="xs">
                <Text fw={500}>Selected file:</Text>
                {files.map((file, index) => (
                  <Group key={index} gap="xs">
                    <IconFile size={16} />
                    <Text size="sm">{file.name}</Text>
                    <Text size="xs" c="dimmed">({(file.size / 1024 / 1024).toFixed(2)} MB)</Text>
                  </Group>
                ))}
              </Stack>
            )}
            
            {isUploading && (
              <Stack gap="xs">
                <Text size="sm">Uploading...</Text>
                <Progress value={uploadProgress} animated />
              </Stack>
            )}
            
            <Group justify="flex-end" mt="xl">
              <Button variant="light" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleFileUpload} 
                loading={isUploading}
                disabled={files.length === 0 || !datasetName}
              >
                Upload Dataset
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Kaggle Import Modal */}
        <Modal
          opened={kaggleModalOpen}
          onClose={() => setKaggleModalOpen(false)}
          title="Import from Kaggle"
          size="lg"
        >
          <Stack gap="md">
            <Alert icon={<IconInfoCircle size={16} />} title="Kaggle Dataset Import" color="blue">
              Search for datasets on Kaggle and import them directly into your workspace.
            </Alert>
            
            <KaggleDatasetBrowser 
              onDatasetDownloaded={(data) => {
                notifications.show({
                  title: 'Success',
                  message: `Dataset downloaded successfully`,
                  color: 'green',
                });
                refetchDatasets();
                setKaggleModalOpen(false);
              }} 
            />
          </Stack>
        </Modal>

        {/* Workflow Creation Modal */}
        <Modal
          opened={createProjectModalOpen}
          onClose={() => setCreateProjectModalOpen(false)}
          title="Create New Workflow"
          size="lg"
        >
          <Stack gap="md">
            <TextInput
              label="Workflow Name"
              placeholder="Enter workflow name"
              value={createProjectData.name}
              onChange={(e) => setCreateProjectData({ ...createProjectData, name: e.target.value })}
              required
            />
            
            <Textarea
              label="Description"
              placeholder="Enter workflow description"
              value={createProjectData.description}
              onChange={(e) => setCreateProjectData({ ...createProjectData, description: e.target.value })}
            />
            
            <Select
              label="Dataset"
              placeholder="Select a dataset"
              data={datasets.map(dataset => ({
                value: dataset.id,
                label: dataset.name
              }))}
              value={createProjectData.dataset_id}
              onChange={(value) => setCreateProjectData({ ...createProjectData, dataset_id: value || '' })}
              required
            />
            
            <Select
              label="Template"
              placeholder="Select a template"
              data={[
                { value: 'quick_start', label: 'Quick Start' },
                { value: 'data_cleaning', label: 'Data Cleaning' },
                { value: 'exploratory_analysis', label: 'Exploratory Analysis' },
                { value: 'machine_learning', label: 'Machine Learning' }
              ]}
              value={createProjectData.template}
              onChange={(value) => setCreateProjectData({ ...createProjectData, template: value || 'quick_start' })}
            />
            
            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              This will create a new workflow with the selected dataset. You can customize the workflow in the next step.
            </Alert>
            
            <Group justify="flex-end" mt="xl">
              <Button variant="light" onClick={() => setCreateProjectModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitWorkflow} 
                loading={createWorkflowMutation.isPending}
                disabled={!createProjectData.name || !createProjectData.dataset_id}
              >
                Create Workflow
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
} 
import { useCallback, useState } from 'react';
import {
  Box,
  Stack,
  Group,
  Text,
  TextInput,
  Tabs,
  ActionIcon,
  Tooltip,
  Divider,
  ScrollArea,
  Collapse,
  Badge,
  useMantineTheme,
  Paper,
  Accordion,
  ThemeIcon,
  Input,
  UnstyledButton,
  Button
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useHover } from '@mantine/hooks';
import {
  IconSearch,
  IconChevronRight,
  IconChevronDown,
  IconDatabase,
  IconTable,
  IconWand,
  IconChartDots,
  IconFileReport,
  IconCode,
  IconArrowsExchange,
  IconCheck,
  IconChartBar,
  IconBinaryTree,
  IconLayoutSidebar,
  IconLayoutSidebarRight,
  IconX,
  IconFilter,
  IconStar,
  IconAdjustmentsHorizontal,
  IconPinned,
  IconArrowLeft,
  IconExternalLink,
  IconPlus,
  IconHistory
} from '@tabler/icons-react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { NodeCategoryComponent } from './components/NodeCategoryComponent';

// Import the component files
import NodeItemComponent from './components/NodeItemComponent';
import NodeDetailsPanel from './components/NodeDetailsPanel';
import NodeFilterPanel from './components/NodeFilterPanel';
import NodeHistoryPanel from './components/NodeHistoryPanel';
import NodeFavoritesPanel from './components/NodeFavoritesPanel';
import NodeTemplatesPanel from './components/NodeTemplatesPanel';
import NodeSettingsPanel from './components/NodeSettingsPanel';

// Import the useWorkflow hook
import { useWorkflow } from '../../WorkflowContext';

// Node category definitions with enhanced metadata
const NODE_CATEGORIES = [
  {
    id: 'data',
    label: 'Data',
    icon: <IconDatabase size={14} />,
    description: 'Data ingestion and source management',
    color: 'blue',
    nodes: [
      {
        id: 'datasetLoader',
        type: 'datasetLoader',
        label: 'Dataset Loader',
        description: 'Load datasets from various sources',
        icon: <IconDatabase size={14} />,
        popularity: 95,
        complexity: 'beginner',
        tags: ['import', 'csv', 'database'],
        color: 'blue',
        category: 'data',
        inputs: 0,
        outputs: 1,
        configOptions: [
          { name: 'source', type: 'select', label: 'Data Source', options: ['file', 'database', 'api'] },
          { name: 'fileType', type: 'select', label: 'File Type', options: ['csv', 'json', 'parquet', 'excel'] },
          { name: 'hasHeader', type: 'boolean', label: 'Has Header' }
        ],
        examples: [
          { title: 'Load CSV File', config: { mergeType: 'file', joinKey: 'csv' } }
        ],
        documentation: 'https://docs.example.com/nodes/dataset-loader'
      },
      {
        id: 'structuralAnalysis',
        type: 'structuralAnalysis',
        label: 'Structural Analysis',
        description: 'Analyze data structure and types',
        icon: <IconTable size={14} />,
        popularity: 90,
        complexity: 'intermediate',
        tags: ['analysis', 'structure', 'types'],
        color: 'cyan',
        category: 'data',
        inputs: 1,
        outputs: 1,
        configOptions: [
          { name: 'analyzeDataTypes', type: 'boolean', label: 'Analyze Data Types' },
          { name: 'detectMissingValues', type: 'boolean', label: 'Detect Missing Values' },
          { name: 'analyzeUniqueValues', type: 'boolean', label: 'Analyze Unique Values' }
        ],
        examples: [
          { title: 'Basic Structure Analysis', config: { mergeType: 'analyze', joinKey: 'types' } }
        ],
        documentation: 'https://docs.example.com/nodes/structural-analysis'
      },
      {
        id: 'qualityChecker',
        type: 'qualityChecker',
        label: 'Quality Checker',
        description: 'Check data quality and identify issues',
        icon: <IconCheck size={14} />,
        popularity: 88,
        complexity: 'beginner',
        tags: ['quality', 'validation', 'cleaning'],
        color: 'green',
        category: 'data',
        inputs: 1,
        outputs: 1,
        configOptions: [
          { name: 'checkMissingValues', type: 'boolean', label: 'Check Missing Values' },
          { name: 'checkOutliers', type: 'boolean', label: 'Check Outliers' },
          { name: 'checkDuplicates', type: 'boolean', label: 'Check Duplicates' }
        ],
        examples: [
          { title: 'Basic Quality Check', config: { mergeType: 'check', joinKey: 'quality' } }
        ],
        documentation: 'https://docs.example.com/nodes/quality-checker'
      },
      {
        id: 'dataMerger',
        type: 'dataMerger',
        label: 'Data Merger',
        description: 'Merge multiple datasets',
        icon: <IconArrowsExchange size={14} />,
        popularity: 85,
        complexity: 'intermediate',
        tags: ['merge', 'join', 'combine'],
        color: 'blue',
        category: 'data',
        inputs: 2,
        outputs: 1,
        configOptions: [
          { name: 'mergeType', type: 'select', label: 'Merge Type', options: ['inner', 'left', 'right', 'outer'] },
          { name: 'joinKey', type: 'string', label: 'Join Key' }
        ],
        examples: [
          { title: 'Inner Join', config: { mergeType: 'inner', joinKey: 'id' } }
        ],
        documentation: 'https://docs.example.com/nodes/data-merger'
      }
    ]
  },
  {
    id: 'transformation',
    label: 'Transformation',
    icon: <IconWand size={14} />,
    description: 'Data transformation and feature engineering',
    color: 'violet',
    nodes: [
      {
        id: 'dataBinning',
        type: 'dataBinning',
        label: 'Data Binning',
        description: 'Bin continuous data into categories',
        icon: <IconCode size={14} />,
        popularity: 82,
        complexity: 'intermediate',
        tags: ['binning', 'discretization', 'categories'],
        color: 'violet',
        category: 'transformation',
        inputs: 1,
        outputs: 1,
        configOptions: [
          { name: 'binningMethod', type: 'select', label: 'Binning Method', options: ['equal_width', 'equal_frequency', 'kmeans', 'custom'] },
          { name: 'numBins', type: 'number', label: 'Number of Bins' },
          { name: 'targetColumn', type: 'string', label: 'Target Column' }
        ],
        examples: [
          { title: 'Equal Width Binning', config: { mergeType: 'equal_width', joinKey: 'age' } }
        ],
        documentation: 'https://docs.example.com/nodes/data-binning'
      },
      {
        id: 'lambdaFunction',
        type: 'lambdaFunction',
        label: 'Lambda Function',
        description: 'Apply custom code to transform data',
        icon: <IconCode size={14} />,
        popularity: 80,
        complexity: 'advanced',
        tags: ['code', 'custom', 'function'],
        color: 'indigo',
        category: 'transformation',
        inputs: 1,
        outputs: 1,
        configOptions: [
          { name: 'language', type: 'select', label: 'Language', options: ['python', 'javascript', 'sql'] },
          { name: 'code', type: 'code', label: 'Code' }
        ],
        examples: [
          { title: 'Python Lambda', config: { mergeType: 'python', joinKey: 'process' } }
        ],
        documentation: 'https://docs.example.com/nodes/lambda-function'
      },
      {
        id: 'featureEngineer',
        type: 'featureEngineer',
        label: 'Feature Engineer',
        description: 'Create new features from existing data',
        icon: <IconWand size={14} />,
        popularity: 88,
        complexity: 'advanced',
        tags: ['features', 'engineering', 'creation'],
        color: 'grape',
        category: 'transformation',
        inputs: 1,
        outputs: 1,
        configOptions: [
          { name: 'operations', type: 'array', label: 'Operations' }
        ],
        examples: [
          { title: 'Basic Feature Engineering', config: { mergeType: 'create', joinKey: 'age_squared' } }
        ],
        documentation: 'https://docs.example.com/nodes/feature-engineer'
      }
    ]
  },
  {
    id: 'analysis',
    label: 'Analysis',
    icon: <IconChartDots size={14} />,
    description: 'Data analysis and visualization',
    color: 'blue',
    nodes: [
      {
        id: 'edaAnalysis',
        type: 'edaAnalysis',
        label: 'EDA Analysis',
        description: 'Exploratory data analysis',
        icon: <IconChartDots size={14} />,
        popularity: 92,
        complexity: 'beginner',
        tags: ['exploration', 'statistics', 'visualization'],
        color: 'blue',
        category: 'analysis',
        inputs: 1,
        outputs: 1,
        configOptions: [
          { name: 'univariateAnalysis', type: 'boolean', label: 'Univariate Analysis' },
          { name: 'bivariateAnalysis', type: 'boolean', label: 'Bivariate Analysis' },
          { name: 'correlationAnalysis', type: 'boolean', label: 'Correlation Analysis' },
          { name: 'sampleSize', type: 'number', label: 'Sample Size', min: 0 }
        ],
        examples: [
          { title: 'Complete EDA', config: { mergeType: 'full', joinKey: 'analysis' } }
        ],
        documentation: 'https://docs.example.com/nodes/eda-analysis'
      },
      {
        id: 'featureImportance',
        type: 'featureImportance',
        label: 'Feature Importance',
        description: 'Analyze feature importance',
        icon: <IconChartBar size={14} />,
        popularity: 85,
        complexity: 'intermediate',
        tags: ['importance', 'ranking', 'features'],
        color: 'yellow',
        category: 'analysis',
        inputs: 1,
        outputs: 1,
        configOptions: [
          { name: 'method', type: 'select', label: 'Method', options: ['random_forest', 'permutation', 'shap'] },
          { name: 'targetColumn', type: 'string', label: 'Target Column' }
        ],
        examples: [
          { title: 'Random Forest Importance', config: { mergeType: 'random_forest', joinKey: 'target' } }
        ],
        documentation: 'https://docs.example.com/nodes/feature-importance'
      },
      {
        id: 'binaryClassifier',
        type: 'binaryClassifier',
        label: 'Binary Classifier',
        description: 'Train a binary classification model',
        icon: <IconBinaryTree size={14} />,
        popularity: 88,
        complexity: 'advanced',
        tags: ['classification', 'model', 'prediction'],
        color: 'red',
        category: 'analysis',
        inputs: 1,
        outputs: 1,
        configOptions: [
          { name: 'modelType', type: 'select', label: 'Model Type', options: ['logistic_regression', 'random_forest', 'svm', 'xgboost'] },
          { name: 'targetColumn', type: 'string', label: 'Target Column' },
          { name: 'testSize', type: 'number', label: 'Test Size', min: 0.1, max: 0.5 }
        ],
        examples: [
          { title: 'Logistic Regression', config: { mergeType: 'logistic_regression', joinKey: 'target' } }
        ],
        documentation: 'https://docs.example.com/nodes/binary-classifier'
      }
    ]
  },
  {
    id: 'export',
    label: 'Export',
    icon: <IconFileReport size={14} />,
    description: 'Data export and reporting',
    color: 'violet',
    nodes: [
      {
        id: 'reportGenerator',
        type: 'reportGenerator',
        label: 'Report Generator',
        description: 'Generate comprehensive reports',
        icon: <IconFileReport size={14} />,
        popularity: 85,
        complexity: 'beginner',
        tags: ['report', 'export', 'documentation'],
        color: 'violet',
        category: 'export',
        inputs: 1,
        outputs: 0,
        configOptions: [
          { name: 'reportFormat', type: 'select', label: 'Report Format', options: ['html', 'pdf', 'markdown', 'json'] },
          { name: 'includeVisualizations', type: 'boolean', label: 'Include Visualizations' },
          { name: 'includeDataSamples', type: 'boolean', label: 'Include Data Samples' },
          { name: 'includeCodeSnippets', type: 'boolean', label: 'Include Code Snippets' }
        ],
        examples: [
          { title: 'HTML Report', config: { mergeType: 'html', joinKey: 'report' } }
        ],
        documentation: 'https://docs.example.com/nodes/report-generator'
      }
    ]
  }
];

// Define interfaces for node components
interface WorkflowSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Main component implementation
export const WorkflowSidebar = ({ collapsed = false, onToggleCollapse }: WorkflowSidebarProps) => {
  const theme = useMantineTheme();
  const { addNode } = useWorkflow();
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['data']);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<any>(null);
  const [showNodeDetails, setShowNodeDetails] = useState(false);
  
  // Handle category toggle
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  }, []);
  
  // Handle drag end
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // Handle node dragging logic here
    console.log('Dragged from', source.droppableId, 'to', destination.droppableId);
    console.log('Node ID:', result.draggableId);
    
    // You would typically update your state or call a function to handle the node placement
  }, []);

  // Toggle favorite status
  const toggleFavorite = (nodeId: string) => {
    setFavorites(prev => 
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };
  
  // Handle node selection for detailed view
  const handleNodeSelect = (node: any) => {
    setSelectedNodeDetails(node);
    setShowNodeDetails(true);
  };
  
  // Close node details panel
  const handleCloseNodeDetails = () => {
    setShowNodeDetails(false);
    setSelectedNodeDetails(null);
  };
  
  // Filter nodes based on search query and active category
  const filteredCategories = NODE_CATEGORIES.map(category => {
    const filteredNodes = category.nodes.filter(node => {
      const matchesSearch = 
        searchQuery === '' || 
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = activeCategory === 'all' || category.id === activeCategory;
      
      const matchesFavorites = !favoritesOnly || favorites.includes(node.id);
      
      return matchesSearch && matchesCategory && matchesFavorites;
    });
    
    return {
      ...category,
      nodes: filteredNodes
    };
  }).filter(category => category.nodes.length > 0);

  // Get all nodes (flattened)
  const allNodes = NODE_CATEGORIES.flatMap(category => category.nodes);
  
  // Filter favorite nodes
  const favoriteNodes = allNodes.filter(node => favorites.includes(node.id));
  
  // Add this function to handle adding a node to the workflow
  const handleAddNodeToWorkflow = (nodeType: string) => {
    // Add the node to the workflow
    addNode(nodeType as any, { x: 250, y: 250 });
    
    // Close the node details panel
    setShowNodeDetails(false);
    setSelectedNodeDetails(null);
    
    // Show a notification or feedback
    notifications.show({
      title: 'Node Added',
      message: `${selectedNodeDetails.label} node has been added to the workflow`,
      color: 'green',
    });
  };
  
  // If sidebar is collapsed, show only icons
  if (collapsed) {
    return (
      <Stack 
        style={{ 
          width: 60,
          height: '100%',
          borderRight: `1px solid ${theme.colors.gray[3]}`,
          overflow: 'hidden',
          background: 'white'
        }}
        gap={0}
      >
        <Box p="xs" style={{ borderBottom: `1px solid ${theme.colors.gray[3]}` }}>
          <ActionIcon onClick={onToggleCollapse} size="md" variant="subtle">
            <IconLayoutSidebar size={20} />
          </ActionIcon>
        </Box>
        
        <Stack align="center" py="md" gap="md">
          {NODE_CATEGORIES.map(category => (
            <Tooltip 
              key={category.id} 
              label={category.label} 
              position="right"
              withArrow
            >
              <ActionIcon 
                size="lg" 
                variant={activeCategory === category.id ? "light" : "subtle"}
                color={activeCategory === category.id ? category.color : "gray"}
              >
                {category.icon}
              </ActionIcon>
            </Tooltip>
          ))}
        </Stack>
      </Stack>
    );
  }
  
  // Render the full sidebar
  return (
    <Stack 
      style={{ 
        width: 320,
        height: '100%',
        borderRight: `1px solid ${theme.colors.gray[3]}`,
        overflow: 'hidden',
        background: 'white'
      }}
      gap={0}
    >
      <Box p="xs" style={{ borderBottom: `1px solid ${theme.colors.gray[3]}` }}>
        <Group justify="space-between" wrap="nowrap">
          <Text fw={600} size="sm">Nodes</Text>
          <ActionIcon onClick={onToggleCollapse} size="sm" variant="subtle">
            <IconLayoutSidebarRight size={16} />
          </ActionIcon>
        </Group>
      </Box>
      
      <Box p="xs" style={{ borderBottom: `1px solid ${theme.colors.gray[3]}` }}>
        <TextInput
          placeholder="Search nodes..."
          size="sm"
          leftSection={<IconSearch size={14} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          rightSection={
            searchQuery ? (
              <ActionIcon size="xs" variant="subtle" onClick={() => setSearchQuery('')}>
                <IconX size={14} />
              </ActionIcon>
            ) : null
          }
        />
      </Box>
      
      <Tabs defaultValue="all">
        <Tabs.List style={{ borderBottom: `1px solid ${theme.colors.gray[3]}` }}>
          <Tabs.Tab value="all" leftSection={<IconTable size={14} />}>All</Tabs.Tab>
          <Tabs.Tab value="favorites" leftSection={<IconStar size={14} />}>Favorites</Tabs.Tab>
          <Tabs.Tab value="recent" leftSection={<IconHistory size={14} />}>Recent</Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="all">
          <ScrollArea style={{ height: 'calc(100vh - 170px)' }} offsetScrollbars scrollbarSize={6} type="auto">
            <Box p="xs">
              {filteredCategories.length > 0 ? (
                <Accordion 
                  multiple 
                  defaultValue={expandedCategories}
                  onChange={setExpandedCategories as any}
                >
                  {filteredCategories.map(category => (
                    <Accordion.Item key={category.id} value={category.id}>
                      <Accordion.Control 
                        icon={category.icon} 
                        style={{ 
                          color: theme.colors[category.color][6],
                          fontWeight: 600
                        }}
                      >
                        {category.label}
                      </Accordion.Control>
                      <Accordion.Panel>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: viewMode === 'grid' ? '1fr 1fr' : '1fr',
                          gap: '8px'
                        }}>
                          {category.nodes.map(node => (
                            <Paper
                              key={node.id}
                              shadow="xs"
                              p="xs"
                              withBorder
                              style={{ 
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: theme.shadows.sm
                                }
                              }}
                              onClick={() => handleNodeSelect(node)}
                            >
                              <Group justify="apart" mb={4} wrap="nowrap">
                                <Group wrap="nowrap" gap={8}>
                                  <ThemeIcon size="md" radius="md" color={node.color}>
                                    {node.icon}
                                  </ThemeIcon>
                                  <Text size="sm" fw={500} lineClamp={1}>
                                    {node.label}
                                  </Text>
                                </Group>
                                <ActionIcon 
                                  size="xs" 
                                  variant="subtle"
                                  color={favorites.includes(node.id) ? "yellow" : "gray"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(node.id);
                                  }}
                                >
                                  <IconStar size={14} />
                                </ActionIcon>
                              </Group>
                              
                              <Text size="xs" color="dimmed" lineClamp={2} mb={4}>
                                {node.description}
                              </Text>
                              
                              <Group justify="apart" mt={8} wrap="nowrap">
                                <Badge size="xs" color={node.color} variant="light">
                                  {node.complexity}
                                </Badge>
                                <Text size="xs" color="dimmed">
                                  {node.inputs}-{node.outputs}
                                </Text>
                              </Group>
                            </Paper>
                          ))}
                        </div>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              ) : (
                <Text ta="center" color="dimmed" py="xl">
                  No nodes match your search
                </Text>
              )}
            </Box>
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default WorkflowSidebar; 
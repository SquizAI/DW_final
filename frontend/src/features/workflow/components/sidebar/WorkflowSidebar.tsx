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
  IconPlus
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
  
  // If node details panel is open, show it
  if (showNodeDetails && selectedNodeDetails && !collapsed) {
    return (
      <Stack 
        style={{ 
          width: 320,
          height: '100%',
          borderRight: `1px solid ${theme.colors.gray[3]}`,
          overflow: 'hidden',
          position: 'relative',
          background: 'white',
        }}
        gap={0}
      >
        <Box p="xs" style={{ borderBottom: `1px solid ${theme.colors.gray[3]}`, background: 'white' }}>
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs">
              <ActionIcon onClick={handleCloseNodeDetails} size="sm" variant="subtle">
                <IconArrowLeft size={16} />
              </ActionIcon>
              <Text fw={600} size="sm">{selectedNodeDetails.label}</Text>
            </Group>
            <ActionIcon onClick={onToggleCollapse} size="sm" variant="subtle">
              <IconLayoutSidebarRight size={16} />
            </ActionIcon>
          </Group>
        </Box>
        
        <ScrollArea style={{ flex: 1, width: '100%' }} offsetScrollbars scrollbarSize={6} type="auto" scrollHideDelay={500}>
          <Box p="md">
            <Group mb="md" align="flex-start">
              <ThemeIcon size="xl" radius="md" color={selectedNodeDetails.color}>
                {selectedNodeDetails.icon}
              </ThemeIcon>
              <Box>
                <Text fw={700} size="lg">{selectedNodeDetails.label}</Text>
                <Text size="sm" c="dimmed">{selectedNodeDetails.description}</Text>
                <Group mt="xs" gap="xs">
                  {selectedNodeDetails.tags.map((tag: string) => (
                    <Badge key={tag} size="sm" variant="light" color={selectedNodeDetails.color}>
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </Box>
            </Group>
            
            <Divider my="md" />
            
            <Text fw={600} size="sm" mb="xs">Configuration Options</Text>
            {selectedNodeDetails.configOptions.map((option: any, index: number) => (
              <Box key={index} mb="md">
                <Text fw={500} size="sm">{option.label}</Text>
                {option.type === 'select' && (
                  <Box mt="xs">
                    <Text size="xs" c="dimmed" mb="xs">Options:</Text>
                    <Group gap="xs">
                      {option.options.map((opt: string) => (
                        <Badge key={opt} size="sm">{opt}</Badge>
                      ))}
                    </Group>
                  </Box>
                )}
                {option.type === 'boolean' && (
                  <Text size="xs" c="dimmed" mt="xs">Type: Boolean</Text>
                )}
                {option.type === 'string' && (
                  <Text size="xs" c="dimmed" mt="xs">Type: Text</Text>
                )}
                {option.type === 'number' && (
                  <Text size="xs" c="dimmed" mt="xs">Type: Number</Text>
                )}
                {option.type === 'code' && (
                  <Text size="xs" c="dimmed" mt="xs">Type: Code Editor</Text>
                )}
                {option.type === 'array' && (
                  <Text size="xs" c="dimmed" mt="xs">Type: Array</Text>
                )}
              </Box>
            ))}
            
            <Divider my="md" />
            
            <Text fw={600} size="sm" mb="xs">Input/Output</Text>
            <Group mb="md">
              <Box>
                <Text size="sm">Inputs:</Text>
                <Text size="lg" fw={700}>{selectedNodeDetails.inputs}</Text>
              </Box>
              <Box>
                <Text size="sm">Outputs:</Text>
                <Text size="lg" fw={700}>{selectedNodeDetails.outputs}</Text>
              </Box>
            </Group>
            
            <Divider my="md" />
            
            <Text fw={600} size="sm" mb="xs">Examples</Text>
            {selectedNodeDetails.examples.map((example: any, index: number) => (
              <Paper key={index} p="sm" withBorder mb="sm">
                <Text fw={500} size="sm">{example.title}</Text>
                <Text size="xs" c="dimmed" mt="xs">Configuration:</Text>
                <Box 
                  mt="xs" 
                  p="xs" 
                  style={{ 
                    background: theme.colors.gray[0], 
                    borderRadius: theme.radius.sm,
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                >
                  {JSON.stringify(example.config, null, 2)}
                </Box>
              </Paper>
            ))}
            
            <Divider my="md" />
            
            <Group justify="space-between" mb="md">
              <Text fw={600} size="sm">Documentation</Text>
              <ActionIcon component="a" href={selectedNodeDetails.documentation} target="_blank" size="sm" variant="subtle">
                <IconExternalLink size={16} />
              </ActionIcon>
            </Group>
          </Box>
        </ScrollArea>
        
        <Box p="md" style={{ borderTop: `1px solid ${theme.colors.gray[3]}` }}>
          <Button 
            fullWidth 
            leftSection={<IconPlus size={16} />}
            color={selectedNodeDetails.color}
            onClick={() => handleAddNodeToWorkflow(selectedNodeDetails.id)}
          >
            Add to Workflow
          </Button>
        </Box>
      </Stack>
    );
  }
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Stack 
        style={{ 
          width: collapsed ? 60 : 320,
          transition: 'width 0.3s ease',
          height: '100%',
          borderRight: `1px solid ${theme.colors.gray[3]}`,
          overflow: 'hidden',
          position: 'relative',
          background: '#f8f9fa',
        }}
        gap={0}
      >
        {/* Header */}
        <Box p="xs" style={{ borderBottom: `1px solid ${theme.colors.gray[3]}`, background: 'white' }}>
          {!collapsed ? (
            <Group justify="space-between" wrap="nowrap">
              <Text fw={600} size="sm">Nodes</Text>
              <ActionIcon onClick={onToggleCollapse} size="sm" variant="subtle">
                <IconLayoutSidebarRight size={16} />
              </ActionIcon>
            </Group>
          ) : (
            <ActionIcon onClick={onToggleCollapse} mx="auto">
              <IconLayoutSidebar size={16} />
            </ActionIcon>
          )}
        </Box>
        
        {/* Search and filters (only when expanded) */}
        {!collapsed && (
          <Box p="xs" style={{ background: 'white' }}>
            <Input
              placeholder="Search nodes..."
              leftSection={<IconSearch size={14} color={theme.colors.gray[6]} />}
              rightSection={
                searchQuery ? (
                  <ActionIcon size="xs" onClick={() => setSearchQuery('')} variant="subtle">
                    <IconX size={12} />
                  </ActionIcon>
                ) : null
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              size="sm"
              mb="xs"
              styles={{
                input: {
                  border: `1px solid ${theme.colors.gray[3]}`,
                  boxShadow: 'none',
                  '&:focus': {
                    borderColor: theme.colors.blue[5]
                  }
                }
              }}
            />
            
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs">
                <UnstyledButton 
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: favoritesOnly ? 'rgba(255, 198, 0, 0.1)' : 'transparent',
                    border: favoritesOnly ? '1px solid rgba(255, 198, 0, 0.3)' : '1px solid transparent',
                  }}
                >
                  <IconStar size={14} color={favoritesOnly ? '#ffc600' : theme.colors.gray[6]} />
                  <Text size="xs" c={favoritesOnly ? 'dark' : 'dimmed'}>Favorites</Text>
                </UnstyledButton>
                
                <Tooltip label="Configure view">
                  <ActionIcon variant="subtle" size="sm">
                    <IconAdjustmentsHorizontal size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Box>
        )}
        
        {/* Component categories */}
        <ScrollArea style={{ flex: 1, width: '100%' }} offsetScrollbars scrollbarSize={6} type="auto" scrollHideDelay={500}>
          {collapsed ? (
            // Collapsed view - just icons
            <Stack gap={0} align="center" py="xs">
              {NODE_CATEGORIES.map(category => (
                <Tooltip 
                  key={category.id} 
                  label={category.label} 
                  position="right"
                  withArrow
                >
                  <ActionIcon 
                    my={4}
                    color={category.color}
                    variant={activeCategory === category.id ? 'filled' : 'subtle'}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.icon}
                  </ActionIcon>
                </Tooltip>
              ))}
            </Stack>
          ) : (
            // Expanded view - n8n style node display
            <Box>
              {/* Category tabs */}
              <Tabs 
                value={activeCategory} 
                onChange={(value: string | null) => setActiveCategory(value || 'all')}
                styles={{
                  root: {
                    backgroundColor: 'white',
                  },
                  list: {
                    borderBottom: 'none',
                    gap: 4,
                    padding: '8px 8px 0',
                    flexWrap: 'nowrap',
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': {
                      height: 0,
                      width: 0,
                      display: 'none'
                    },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  },
                  tab: {
                    borderBottom: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontWeight: 500,
                    fontSize: '12px',
                    backgroundColor: '#f1f3f5',
                    color: theme.colors.gray[7],
                    '&[data-active]': {
                      borderBottom: 'none',
                      backgroundColor: theme.colors.blue[6],
                      color: 'white'
                    }
                  }
                }}
              >
                <Tabs.List>
                  <Tabs.Tab value="all">All</Tabs.Tab>
                  {NODE_CATEGORIES.map(category => (
                    <Tabs.Tab 
                      key={category.id} 
                      value={category.id}
                      leftSection={category.icon}
                    >
                      {category.label}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs>

              {/* Favorites section */}
              {favoritesOnly && favoriteNodes.length > 0 && (
                <Box py="xs" px="xs" style={{ backgroundColor: 'rgba(255, 198, 0, 0.05)' }}>
                  <Text size="xs" fw={600} mb="xs" c="dimmed">FAVORITES</Text>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '8px',
                    width: '100%',
                    maxWidth: '100%',
                    overflowX: 'hidden'
                  }}>
                    {favoriteNodes.map((node, idx) => (
                      <Paper
                        key={node.id}
                        p="xs"
                        radius="md"
                        withBorder
                        shadow="xs"
                        style={{
                          cursor: 'pointer',
                          borderColor: selectedNodes.includes(node.id) ? theme.colors[node.color][5] : theme.colors.gray[3],
                          borderLeft: `3px solid ${theme.colors[node.color][5]}`,
                          position: 'relative'
                        }}
                        onClick={() => handleNodeSelect(node)}
                      >
                        <ActionIcon 
                          size="xs" 
                          style={{ position: 'absolute', top: '5px', right: '5px' }}
                          color="yellow"
                          variant="transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(node.id);
                          }}
                        >
                          <IconStar size={14} fill={theme.colors.yellow[4]} />
                        </ActionIcon>
                        
                        <Group gap="xs" mb={4} wrap="nowrap">
                          <ThemeIcon color={node.color} size="md" radius="sm">
                            {node.icon}
                          </ThemeIcon>
                        </Group>
                        
                        <Text size="xs" fw={500} lineClamp={1}>
                          {node.label}
                        </Text>
                        
                        <Text size="xs" c="dimmed" lineClamp={2} mt={2}>
                          {node.description}
                        </Text>
                      </Paper>
                    ))}
                  </div>
                </Box>
              )}

              {/* Categories and nodes */}
              <Box pb="md" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
                {filteredCategories.map(category => (
                  <Accordion
                    key={category.id} 
                    defaultValue={expandedCategories.includes(category.id) ? category.id : null}
                    styles={{
                      item: {
                        borderBottom: 'none',
                        backgroundColor: 'transparent',
                      },
                      control: {
                        padding: '8px 12px',
                        '&:hover': {
                          backgroundColor: theme.colors.gray[0]
                        }
                      },
                      panel: {
                        padding: '4px 12px 12px'
                      }
                    }}
                  >
                    <Accordion.Item value={category.id}>
                      <Accordion.Control
                        icon={
                          <ThemeIcon color={category.color} size="sm" radius="xl">
                            {category.icon}
                          </ThemeIcon>
                        }
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Text size="sm" fw={500}>{category.label}</Text>
                          <Badge size="xs" variant="light" color={category.color}>
                            {category.nodes.length}
                          </Badge>
                        </Group>
                      </Accordion.Control>
                      
                      <Accordion.Panel>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                          gap: '8px',
                          width: '100%',
                          maxWidth: '100%',
                          overflowX: 'hidden'
                        }}>
                          {category.nodes.map((node, idx) => (
                            <Paper
                              key={node.id}
                              p="xs"
                              radius="md"
                              withBorder
                              shadow="xs"
                              style={{
                                cursor: 'pointer',
                                borderColor: selectedNodes.includes(node.id) ? theme.colors[node.color][5] : theme.colors.gray[3],
                                borderLeft: `3px solid ${theme.colors[node.color][5]}`,
                                position: 'relative'
                              }}
                              onClick={() => handleNodeSelect(node)}
                            >
                              <ActionIcon 
                                size="xs" 
                                style={{ position: 'absolute', top: '5px', right: '5px' }}
                                color="gray"
                                variant="transparent"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(node.id);
                                }}
                              >
                                <IconStar size={14} fill={favorites.includes(node.id) ? theme.colors.yellow[4] : 'transparent'} />
                              </ActionIcon>
                              
                              <Group gap="xs" mb={4} wrap="nowrap">
                                <ThemeIcon color={node.color} size="md" radius="sm">
                                  {node.icon}
                                </ThemeIcon>
                              </Group>
                              
                              <Text size="xs" fw={500} lineClamp={1}>
                                {node.label}
                              </Text>
                              
                              <Text size="xs" c="dimmed" lineClamp={2} mt={2}>
                                {node.description}
                              </Text>
                              
                              <Group justify="space-between" mt={8}>
                                <Badge size="xs" variant="dot" color={node.color}>
                                  {node.complexity}
                                </Badge>
                                <Text size="xs" c="dimmed">{node.inputs}{'->'}{node.outputs}</Text>
                              </Group>
                            </Paper>
                          ))}
                        </div>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                ))}
              </Box>
            </Box>
          )}
        </ScrollArea>
      </Stack>
    </DragDropContext>
  );
};

export default WorkflowSidebar; 
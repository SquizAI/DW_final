import React, { useState } from 'react';
import { 
  Paper, 
  Title, 
  Tabs, 
  Box, 
  Stack, 
  TextInput, 
  Textarea, 
  NumberInput, 
  Select, 
  Switch, 
  Button, 
  Group, 
  Divider,
  Text,
  Badge,
  Accordion,
  ActionIcon,
  Tooltip,
  Code
} from '@mantine/core';
import { 
  IconSettings, 
  IconCode, 
  IconInfoCircle, 
  IconChartBar, 
  IconHistory,
  IconX,
  IconDeviceFloppy
} from '@tabler/icons-react';
import { useWorkflow } from '../../WorkflowContext';
import { WorkflowNode } from '../../nodes/reactflow';
import { WorkflowNodeData } from '../../nodes/types';

interface NodeConfigPanelProps {
  onClose?: () => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ onClose }) => {
  const { selectedNode, updateNodeData } = useWorkflow();
  const [activeTab, setActiveTab] = useState<string | null>('settings');
  
  if (!selectedNode) {
    return (
      <Paper p="md" withBorder h="100%">
        <Stack align="center" justify="center" h="100%" gap="md">
          <IconInfoCircle size={48} opacity={0.3} />
          <Text c="dimmed" ta="center">
            Select a node to configure its properties
          </Text>
        </Stack>
      </Paper>
    );
  }
  
  const handleUpdateNodeData = (data: Partial<WorkflowNodeData>) => {
    updateNodeData(selectedNode.id, data);
  };
  
  const renderConfigFields = () => {
    const nodeType = selectedNode.data.type;
    
    switch (nodeType) {
      case 'datasetLoader':
        return (
          <Stack gap="md">
            <TextInput
              label="Dataset Source"
              placeholder="Select a dataset source"
              value={selectedNode.data.source || ''}
              onChange={(e) => handleUpdateNodeData({ source: e.currentTarget.value })}
            />
            <Select
              label="File Type"
              placeholder="Select file type"
              data={[
                { value: 'csv', label: 'CSV' },
                { value: 'json', label: 'JSON' },
                { value: 'parquet', label: 'Parquet' },
                { value: 'excel', label: 'Excel' }
              ]}
              value={selectedNode.data.fileType || ''}
              onChange={(value) => handleUpdateNodeData({ fileType: value })}
            />
            <Switch
              label="Has Header"
              checked={selectedNode.data.hasHeader || false}
              onChange={(e) => handleUpdateNodeData({ hasHeader: e.currentTarget.checked })}
            />
          </Stack>
        );
        
      case 'structuralAnalysis':
        return (
          <Stack gap="md">
            <Switch
              label="Analyze Data Types"
              checked={selectedNode.data.analyzeDataTypes || true}
              onChange={(e) => handleUpdateNodeData({ analyzeDataTypes: e.currentTarget.checked })}
            />
            <Switch
              label="Detect Missing Values"
              checked={selectedNode.data.detectMissingValues || true}
              onChange={(e) => handleUpdateNodeData({ detectMissingValues: e.currentTarget.checked })}
            />
            <Switch
              label="Analyze Unique Values"
              checked={selectedNode.data.analyzeUniqueValues || true}
              onChange={(e) => handleUpdateNodeData({ analyzeUniqueValues: e.currentTarget.checked })}
            />
          </Stack>
        );
        
      case 'qualityChecker':
        return (
          <Stack gap="md">
            <NumberInput
              label="Quality Threshold"
              placeholder="Enter threshold (0-100)"
              min={0}
              max={100}
              value={selectedNode.data.qualityThreshold || 80}
              onChange={(value) => handleUpdateNodeData({ qualityThreshold: value })}
            />
            <Switch
              label="Check for Missing Values"
              checked={selectedNode.data.checkMissingValues || true}
              onChange={(e) => handleUpdateNodeData({ checkMissingValues: e.currentTarget.checked })}
            />
            <Switch
              label="Check for Outliers"
              checked={selectedNode.data.checkOutliers || true}
              onChange={(e) => handleUpdateNodeData({ checkOutliers: e.currentTarget.checked })}
            />
          </Stack>
        );
        
      case 'dataMerger':
        return (
          <Stack gap="md">
            <Select
              label="Merge Type"
              placeholder="Select merge type"
              data={[
                { value: 'inner', label: 'Inner Join' },
                { value: 'left', label: 'Left Join' },
                { value: 'right', label: 'Right Join' },
                { value: 'outer', label: 'Outer Join' }
              ]}
              value={selectedNode.data.mergeType || 'inner'}
              onChange={(value) => handleUpdateNodeData({ mergeType: value })}
            />
            <TextInput
              label="Join Key"
              placeholder="Enter column name to join on"
              value={selectedNode.data.joinKey || ''}
              onChange={(e) => handleUpdateNodeData({ joinKey: e.currentTarget.value })}
            />
          </Stack>
        );
        
      case 'dataBinning':
        return (
          <Stack gap="md">
            <Select
              label="Binning Method"
              placeholder="Select binning method"
              data={[
                { value: 'equal_width', label: 'Equal Width' },
                { value: 'equal_frequency', label: 'Equal Frequency' },
                { value: 'kmeans', label: 'K-Means' },
                { value: 'custom', label: 'Custom Boundaries' }
              ]}
              value={selectedNode.data.binningMethod || 'equal_width'}
              onChange={(value) => handleUpdateNodeData({ binningMethod: value })}
            />
            <NumberInput
              label="Number of Bins"
              placeholder="Enter number of bins"
              min={2}
              max={100}
              value={selectedNode.data.numBins || 10}
              onChange={(value) => handleUpdateNodeData({ numBins: value })}
            />
            <TextInput
              label="Target Column"
              placeholder="Enter column to bin"
              value={selectedNode.data.targetColumn || ''}
              onChange={(e) => handleUpdateNodeData({ targetColumn: e.currentTarget.value })}
            />
          </Stack>
        );
        
      case 'lambdaFunction':
        return (
          <Stack gap="md">
            <Select
              label="Function Language"
              placeholder="Select language"
              data={[
                { value: 'python', label: 'Python' },
                { value: 'javascript', label: 'JavaScript' },
                { value: 'sql', label: 'SQL' }
              ]}
              value={selectedNode.data.language || 'python'}
              onChange={(value) => handleUpdateNodeData({ language: value })}
            />
            <Textarea
              label="Function Code"
              placeholder="Enter your code here..."
              minRows={10}
              value={selectedNode.data.code || ''}
              onChange={(e) => handleUpdateNodeData({ code: e.currentTarget.value })}
            />
          </Stack>
        );
        
      case 'edaAnalysis':
        return (
          <Stack gap="md">
            <Switch
              label="Univariate Analysis"
              checked={selectedNode.data.univariateAnalysis || true}
              onChange={(e) => handleUpdateNodeData({ univariateAnalysis: e.currentTarget.checked })}
            />
            <Switch
              label="Bivariate Analysis"
              checked={selectedNode.data.bivariateAnalysis || true}
              onChange={(e) => handleUpdateNodeData({ bivariateAnalysis: e.currentTarget.checked })}
            />
            <Switch
              label="Correlation Analysis"
              checked={selectedNode.data.correlationAnalysis || true}
              onChange={(e) => handleUpdateNodeData({ correlationAnalysis: e.currentTarget.checked })}
            />
            <NumberInput
              label="Sample Size"
              placeholder="Enter sample size (0 for all)"
              min={0}
              value={selectedNode.data.sampleSize || 1000}
              onChange={(value) => handleUpdateNodeData({ sampleSize: value })}
            />
          </Stack>
        );
        
      case 'featureImportance':
        return (
          <Stack gap="md">
            <Select
              label="Method"
              placeholder="Select method"
              data={[
                { value: 'random_forest', label: 'Random Forest' },
                { value: 'permutation', label: 'Permutation Importance' },
                { value: 'shap', label: 'SHAP Values' }
              ]}
              value={selectedNode.data.method || 'random_forest'}
              onChange={(value) => handleUpdateNodeData({ method: value })}
            />
            <TextInput
              label="Target Column"
              placeholder="Enter target column name"
              value={selectedNode.data.targetColumn || ''}
              onChange={(e) => handleUpdateNodeData({ targetColumn: e.currentTarget.value })}
            />
            <NumberInput
              label="Top Features"
              placeholder="Number of top features to show"
              min={1}
              value={selectedNode.data.topFeatures || 10}
              onChange={(value) => handleUpdateNodeData({ topFeatures: value })}
            />
          </Stack>
        );
        
      case 'binaryClassifier':
        return (
          <Stack gap="md">
            <Select
              label="Model Type"
              placeholder="Select model type"
              data={[
                { value: 'logistic_regression', label: 'Logistic Regression' },
                { value: 'random_forest', label: 'Random Forest' },
                { value: 'svm', label: 'Support Vector Machine' },
                { value: 'xgboost', label: 'XGBoost' }
              ]}
              value={selectedNode.data.modelType || 'logistic_regression'}
              onChange={(value) => handleUpdateNodeData({ modelType: value })}
            />
            <TextInput
              label="Target Column"
              placeholder="Enter target column name"
              value={selectedNode.data.targetColumn || ''}
              onChange={(e) => handleUpdateNodeData({ targetColumn: e.currentTarget.value })}
            />
            <NumberInput
              label="Test Size"
              placeholder="Enter test size (0.0-1.0)"
              min={0.1}
              max={0.5}
              step={0.05}
              precision={2}
              value={selectedNode.data.testSize || 0.2}
              onChange={(value) => handleUpdateNodeData({ testSize: value })}
            />
            <Switch
              label="Cross Validation"
              checked={selectedNode.data.crossValidation || false}
              onChange={(e) => handleUpdateNodeData({ crossValidation: e.currentTarget.checked })}
            />
          </Stack>
        );
        
      case 'reportGenerator':
        return (
          <Stack gap="md">
            <Select
              label="Report Format"
              placeholder="Select format"
              data={[
                { value: 'html', label: 'HTML' },
                { value: 'pdf', label: 'PDF' },
                { value: 'markdown', label: 'Markdown' },
                { value: 'json', label: 'JSON' }
              ]}
              value={selectedNode.data.reportFormat || 'html'}
              onChange={(value) => handleUpdateNodeData({ reportFormat: value })}
            />
            <Switch
              label="Include Visualizations"
              checked={selectedNode.data.includeVisualizations || true}
              onChange={(e) => handleUpdateNodeData({ includeVisualizations: e.currentTarget.checked })}
            />
            <Switch
              label="Include Data Samples"
              checked={selectedNode.data.includeDataSamples || true}
              onChange={(e) => handleUpdateNodeData({ includeDataSamples: e.currentTarget.checked })}
            />
            <Switch
              label="Include Code Snippets"
              checked={selectedNode.data.includeCodeSnippets || false}
              onChange={(e) => handleUpdateNodeData({ includeCodeSnippets: e.currentTarget.checked })}
            />
          </Stack>
        );
        
      default:
        return (
          <Text c="dimmed">No configuration options available for this node type.</Text>
        );
    }
  };
  
  return (
    <Paper p="md" withBorder h="100%">
      <Group position="apart" mb="md">
        <Title order={4}>Node Configuration</Title>
        {onClose && (
          <ActionIcon onClick={onClose} variant="subtle">
            <IconX size={18} />
          </ActionIcon>
        )}
      </Group>
      
      <Group mb="md">
        <Badge size="lg" color="blue">{selectedNode.data.type}</Badge>
        <Text fw={500}>{selectedNode.data.label}</Text>
      </Group>
      
      <Divider mb="md" />
      
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="settings" leftSection={<IconSettings size={14} />}>
            Settings
          </Tabs.Tab>
          <Tabs.Tab value="code" leftSection={<IconCode size={14} />}>
            Code
          </Tabs.Tab>
          <Tabs.Tab value="data" leftSection={<IconChartBar size={14} />}>
            Data
          </Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<IconHistory size={14} />}>
            History
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="settings">
          {renderConfigFields()}
        </Tabs.Panel>
        
        <Tabs.Panel value="code">
          <Stack gap="md">
            <Text size="sm">Generated code for this node:</Text>
            <Code block>
              {`# ${selectedNode.data.label} (${selectedNode.data.type})
# Configuration:
${JSON.stringify(selectedNode.data, null, 2)}

# This code will be executed when the node is run
def process_data(input_data):
    # Processing logic here
    return input_data
`}
            </Code>
          </Stack>
        </Tabs.Panel>
        
        <Tabs.Panel value="data">
          <Stack gap="md">
            <Text size="sm">Data preview is not available until the workflow is executed.</Text>
            <Button variant="light" fullWidth>
              Preview Input Data
            </Button>
            <Button variant="light" fullWidth>
              Preview Output Data
            </Button>
          </Stack>
        </Tabs.Panel>
        
        <Tabs.Panel value="history">
          <Stack gap="md">
            <Text size="sm">Node execution history:</Text>
            <Text c="dimmed" size="sm">No execution history available.</Text>
          </Stack>
        </Tabs.Panel>
      </Tabs>
      
      <Divider my="md" />
      
      <Group justify="flex-end">
        <Button 
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={() => console.log('Node configuration saved')}
        >
          Apply Changes
        </Button>
      </Group>
    </Paper>
  );
};

export default NodeConfigPanel; 
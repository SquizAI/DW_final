import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  Badge,
  Accordion,
  TextInput,
  Loader,
  Alert,
  Divider,
  Code,
  Box,
  Paper,
  Stack,
  Grid,
  Tabs,
  ScrollArea,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconSearch, 
  IconDownload, 
  IconRefresh, 
  IconCheck, 
  IconX, 
  IconAlertCircle,
  IconDatabase,
  IconTrendingUp,
  IconTag,
  IconFolder,
  IconCloudDownload,
  IconList,
  IconUser,
  IconUsers,
  IconTrophy
} from '@tabler/icons-react';
import axios from 'axios';
import { kaggleApi } from '../api';

interface TestResult {
  status: 'PASS' | 'FAIL' | 'PENDING';
  response?: any;
  error?: string;
}

interface TestResults {
  [key: string]: TestResult;
}

const KaggleTestPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('titanic');
  const [datasetRef, setDatasetRef] = useState('heptapod/titanic');
  const [results, setResults] = useState<TestResults>({});
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [runningAllTests, setRunningAllTests] = useState(false);

  // Helper function to update test results
  const updateTestResult = (testName: string, result: TestResult) => {
    setResults(prev => ({
      ...prev,
      [testName]: result
    }));
  };

  // Test health endpoint
  const testHealth = async () => {
    const testName = 'health';
    setActiveTest(testName);
    updateTestResult(testName, { status: 'PENDING' });
    
    try {
      const response = await axios.get('/api/health');
      updateTestResult(testName, { 
        status: 'PASS', 
        response: response.data 
      });
      notifications.show({
        title: 'Health Check',
        message: 'Health check passed successfully',
        color: 'green'
      });
    } catch (error) {
      console.error('Health check failed:', error);
      updateTestResult(testName, { 
        status: 'FAIL', 
        error: error instanceof Error ? error.message : String(error) 
      });
      notifications.show({
        title: 'Health Check',
        message: 'Health check failed',
        color: 'red'
      });
    } finally {
      setActiveTest(null);
    }
  };

  // Test Kaggle auth status
  const testKaggleAuthStatus = async () => {
    const testName = 'kaggle_auth_status';
    setActiveTest(testName);
    updateTestResult(testName, { status: 'PENDING' });
    
    try {
      const response = await axios.get('/api/kaggle/auth/status');
      updateTestResult(testName, { 
        status: 'PASS', 
        response: response.data 
      });
      notifications.show({
        title: 'Kaggle Auth Status',
        message: 'Auth status check passed successfully',
        color: 'green'
      });
    } catch (error) {
      console.error('Kaggle auth status failed:', error);
      updateTestResult(testName, { 
        status: 'FAIL', 
        error: error instanceof Error ? error.message : String(error) 
      });
      notifications.show({
        title: 'Kaggle Auth Status',
        message: 'Auth status check failed',
        color: 'red'
      });
    } finally {
      setActiveTest(null);
    }
  };

  // Test Kaggle search
  const testKaggleSearch = async () => {
    const testName = 'kaggle_search';
    setActiveTest(testName);
    updateTestResult(testName, { status: 'PENDING' });
    
    try {
      const response = await kaggleApi.search(searchQuery);
      updateTestResult(testName, { 
        status: 'PASS', 
        response: response.data 
      });
      notifications.show({
        title: 'Kaggle Search',
        message: `Found ${Array.isArray(response.data) ? response.data.length : 0} datasets`,
        color: 'green'
      });
    } catch (error) {
      console.error('Kaggle search failed:', error);
      updateTestResult(testName, { 
        status: 'FAIL', 
        error: error instanceof Error ? error.message : String(error) 
      });
      notifications.show({
        title: 'Kaggle Search',
        message: 'Search failed',
        color: 'red'
      });
    } finally {
      setActiveTest(null);
    }
  };

  // Test Kaggle trending
  const testKaggleTrending = async () => {
    const testName = 'kaggle_trending';
    setActiveTest(testName);
    updateTestResult(testName, { status: 'PENDING' });
    
    try {
      const response = await axios.get('/api/kaggle/datasets/trending');
      updateTestResult(testName, { 
        status: 'PASS', 
        response: response.data 
      });
      notifications.show({
        title: 'Kaggle Trending',
        message: `Found ${Array.isArray(response.data) ? response.data.length : 0} trending datasets`,
        color: 'green'
      });
    } catch (error) {
      console.error('Kaggle trending failed:', error);
      updateTestResult(testName, { 
        status: 'FAIL', 
        error: error instanceof Error ? error.message : String(error) 
      });
      notifications.show({
        title: 'Kaggle Trending',
        message: 'Trending datasets request failed',
        color: 'red'
      });
    } finally {
      setActiveTest(null);
    }
  };

  // Test Kaggle download
  const testKaggleDownload = async () => {
    setActiveTest('kaggleDownload');
    updateTestResult('kaggleDownload', { status: 'PENDING' });
    
    try {
      // Check if datasetRef is empty
      if (!datasetRef) {
        throw new Error('Please enter a dataset reference to download');
      }
      
      // Make the API call
      const response = await axios.post('/api/kaggle/download', { dataset_ref: datasetRef });
      
      updateTestResult('kaggleDownload', {
        status: 'PASS',
        response: response.data
      });
      
      notifications.show({
        title: 'Success',
        message: 'Kaggle dataset downloaded successfully',
        color: 'green'
      });
    } catch (error) {
      console.error('Kaggle download failed:', error);
      updateTestResult('kaggleDownload', {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to download dataset',
        color: 'red'
      });
    } finally {
      setActiveTest(null);
    }
  };

  // Test Kaggle download status
  const testKaggleDownloadStatus = async () => {
    setActiveTest('kaggleDownloadStatus');
    updateTestResult('kaggleDownloadStatus', { status: 'PENDING' });
    
    try {
      // Check if datasetRef is empty
      if (!datasetRef) {
        throw new Error('Please enter a dataset reference to test download status');
      }
      
      // Make sure the datasetRef is properly formatted
      const formattedRef = datasetRef.includes('/') ? datasetRef : `unknown/${datasetRef}`;
      
      // Make the API call
      const response = await axios.get(`/api/kaggle/datasets/download/status/${formattedRef}`);
      
      updateTestResult('kaggleDownloadStatus', {
        status: 'PASS',
        response: response.data
      });
      
      notifications.show({
        title: 'Success',
        message: 'Kaggle download status retrieved successfully',
        color: 'green'
      });
    } catch (error) {
      console.error('Kaggle download status failed:', error);
      updateTestResult('kaggleDownloadStatus', {
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to get download status',
        color: 'red'
      });
    } finally {
      setActiveTest(null);
    }
  };

  // Test Kaggle all download statuses
  const testKaggleAllDownloadStatuses = async () => {
    const testName = 'kaggle_all_download_statuses';
    setActiveTest(testName);
    updateTestResult(testName, { status: 'PENDING' });
    
    try {
      const response = await axios.get('/api/kaggle/datasets/download/status');
      updateTestResult(testName, { 
        status: 'PASS', 
        response: response.data 
      });
      notifications.show({
        title: 'Kaggle All Download Statuses',
        message: 'All download statuses retrieved successfully',
        color: 'green'
      });
    } catch (error) {
      console.error('Kaggle all download statuses failed:', error);
      updateTestResult(testName, { 
        status: 'FAIL', 
        error: error instanceof Error ? error.message : String(error) 
      });
      notifications.show({
        title: 'Kaggle All Download Statuses',
        message: 'All download statuses check failed',
        color: 'red'
      });
    } finally {
      setActiveTest(null);
    }
  };

  // Test Kaggle dataset tags
  const testKaggleDatasetTags = async () => {
    const testName = 'kaggle_dataset_tags';
    setActiveTest(testName);
    updateTestResult(testName, { status: 'PENDING' });
    
    try {
      const response = await axios.get('/api/kaggle/datasets/tags');
      updateTestResult(testName, { 
        status: 'PASS', 
        response: response.data 
      });
      notifications.show({
        title: 'Kaggle Dataset Tags',
        message: `Found ${Array.isArray(response.data) ? response.data.length : 0} tags`,
        color: 'green'
      });
    } catch (error) {
      console.error('Kaggle dataset tags failed:', error);
      updateTestResult(testName, { 
        status: 'FAIL', 
        error: error instanceof Error ? error.message : String(error) 
      });
      notifications.show({
        title: 'Kaggle Dataset Tags',
        message: 'Dataset tags request failed',
        color: 'red'
      });
    } finally {
      setActiveTest(null);
    }
  };

  // Test Kaggle local datasets
  const testKaggleLocalDatasets = async () => {
    const testName = 'kaggle_local_datasets';
    setActiveTest(testName);
    updateTestResult(testName, { status: 'PENDING' });
    
    try {
      const response = await axios.get('/api/kaggle/local/datasets');
      updateTestResult(testName, { 
        status: 'PASS', 
        response: response.data 
      });
      notifications.show({
        title: 'Kaggle Local Datasets',
        message: `Found ${Array.isArray(response.data) ? response.data.length : 0} local datasets`,
        color: 'green'
      });
    } catch (error) {
      console.error('Kaggle local datasets failed:', error);
      updateTestResult(testName, { 
        status: 'FAIL', 
        error: error instanceof Error ? error.message : String(error) 
      });
      notifications.show({
        title: 'Kaggle Local Datasets',
        message: 'Local datasets request failed',
        color: 'red'
      });
    } finally {
      setActiveTest(null);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setRunningAllTests(true);
    
    try {
      await testHealth();
      await testKaggleAuthStatus();
      await testKaggleSearch();
      await testKaggleTrending();
      
      // Only run download tests if a dataset reference is provided
      if (datasetRef) {
        await testKaggleDownload();
        await testKaggleDownloadStatus();
      } else {
        notifications.show({
          title: 'Dataset Reference Required',
          message: 'Please enter a dataset reference to run download tests',
          color: 'yellow'
        });
      }
      
      await testKaggleDatasetTags();
      await testKaggleLocalDatasets();
      
      notifications.show({
        title: 'All Tests Complete',
        message: 'All tests have been executed',
        color: 'blue'
      });
    } catch (error) {
      console.error('Error running all tests:', error);
      notifications.show({
        title: 'Test Error',
        message: error instanceof Error ? error.message : 'An error occurred while running tests',
        color: 'red'
      });
    } finally {
      setRunningAllTests(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'green';
      case 'FAIL':
        return 'red';
      case 'PENDING':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <IconCheck size={16} />;
      case 'FAIL':
        return <IconX size={16} />;
      case 'PENDING':
        return <Loader size="xs" />;
      default:
        return null;
    }
  };

  // Format JSON for display
  const formatJSON = (data: any) => {
    try {
      // Special handling for file paths to make them more readable
      if (typeof data === 'object' && data !== null) {
        const formattedData = { ...data };
        
        // Format file paths in a more readable way
        if (Array.isArray(formattedData.files)) {
          formattedData.files = formattedData.files.map((file: any) => ({
            ...file,
            path: file.path ? formatPath(file.path) : file.path,
            size: file.size ? formatFileSize(file.size) : file.size
          }));
        }
        
        // Format download path
        if (formattedData.download_path) {
          formattedData.download_path = formatPath(formattedData.download_path);
        }
        
        // Format absolute path
        if (formattedData.absolute_path) {
          formattedData.absolute_path = formatPath(formattedData.absolute_path);
        }
        
        // Format file path
        if (formattedData.file_path) {
          formattedData.file_path = formatPath(formattedData.file_path);
        }
        
        // Format total size
        if (formattedData.total_size) {
          formattedData.total_size = formatFileSize(formattedData.total_size);
        }
        
        return JSON.stringify(formattedData, null, 2);
      }
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return String(data);
    }
  };
  
  // Format file path for better readability
  const formatPath = (path: string) => {
    // Replace backslashes with forward slashes for consistency
    path = path.replace(/\\/g, '/');
    
    // Highlight the important parts of the path
    const parts = path.split('/');
    if (parts.length > 3) {
      const lastParts = parts.slice(-3);
      return `.../${lastParts.join('/')}`;
    }
    
    return path;
  };
  
  // Format file size for better readability
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Kaggle API Integration Test</Title>
      <Text mb="xl">This page tests the Kaggle API integration to ensure all endpoints are working correctly.</Text>
      
      <Paper withBorder p="md" mb="xl">
        <Group justify="space-between" mb="md">
          <Title order={3}>Test Controls</Title>
          <Button 
            leftSection={<IconRefresh size={16} />} 
            onClick={runAllTests} 
            loading={isLoading}
            color="blue"
          >
            Run All Tests
          </Button>
        </Group>
        
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Search Query"
              placeholder="Enter search query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              rightSection={
                <ActionIcon 
                  color="blue" 
                  onClick={testKaggleSearch}
                  loading={activeTest === 'kaggle_search'}
                >
                  <IconSearch size={16} />
                </ActionIcon>
              }
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Dataset Reference"
              placeholder="owner/dataset"
              value={datasetRef}
              onChange={(e) => setDatasetRef(e.target.value)}
              rightSection={
                <ActionIcon 
                  color="blue" 
                  onClick={testKaggleDownload}
                  loading={activeTest === 'kaggle_download'}
                >
                  <IconDownload size={16} />
                </ActionIcon>
              }
            />
          </Grid.Col>
        </Grid>
      </Paper>
      
      <Tabs defaultValue="tests">
        <Tabs.List>
          <Tabs.Tab value="tests" leftSection={<IconList size={14} />}>Test Results</Tabs.Tab>
          <Tabs.Tab value="endpoints" leftSection={<IconDatabase size={14} />}>Endpoints</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="tests" pt="xs">
          <Paper withBorder p="md" mt="md">
            <Title order={3} mb="md">Test Results</Title>
            
            <ScrollArea h={500}>
              <Accordion>
                {Object.entries(results).map(([testName, result]) => (
                  <Accordion.Item key={testName} value={testName}>
                    <Accordion.Control>
                      <Group>
                        <Badge 
                          color={getStatusColor(result.status)} 
                          leftSection={getStatusIcon(result.status)}
                        >
                          {result.status}
                        </Badge>
                        <Text>{testName}</Text>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      {result.error ? (
                        <Alert color="red" title="Error" icon={<IconAlertCircle size={16} />}>
                          {result.error}
                        </Alert>
                      ) : result.response ? (
                        <Code block>{formatJSON(result.response)}</Code>
                      ) : null}
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </ScrollArea>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="endpoints" pt="xs">
          <Paper withBorder p="md" mt="md">
            <Title order={3} mb="md">Available Endpoints</Title>
            
            <ScrollArea h={500}>
              <Stack>
                <Card withBorder>
                  <Group justify="space-between">
                    <Group>
                      <IconAlertCircle size={20} />
                      <Text fw={500}>Health Check</Text>
                    </Group>
                    <Button 
                      size="xs" 
                      onClick={testHealth}
                      loading={activeTest === 'health'}
                    >
                      Test
                    </Button>
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">GET /api/health</Text>
                </Card>
                
                <Card withBorder>
                  <Group justify="space-between">
                    <Group>
                      <IconUser size={20} />
                      <Text fw={500}>Kaggle Auth Status</Text>
                    </Group>
                    <Button 
                      size="xs" 
                      onClick={testKaggleAuthStatus}
                      loading={activeTest === 'kaggle_auth_status'}
                    >
                      Test
                    </Button>
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">GET /api/kaggle/auth/status</Text>
                </Card>
                
                <Card withBorder>
                  <Group justify="space-between">
                    <Group>
                      <IconSearch size={20} />
                      <Text fw={500}>Kaggle Search</Text>
                    </Group>
                    <Button 
                      size="xs" 
                      onClick={testKaggleSearch}
                      loading={activeTest === 'kaggle_search'}
                    >
                      Test
                    </Button>
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">GET /api/kaggle/datasets/search?query={searchQuery}</Text>
                </Card>
                
                <Card withBorder>
                  <Group justify="space-between">
                    <Group>
                      <IconTrendingUp size={20} />
                      <Text fw={500}>Kaggle Trending</Text>
                    </Group>
                    <Button 
                      size="xs" 
                      onClick={testKaggleTrending}
                      loading={activeTest === 'kaggle_trending'}
                    >
                      Test
                    </Button>
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">GET /api/kaggle/datasets/trending</Text>
                </Card>
                
                <Card withBorder>
                  <Group justify="space-between">
                    <Group>
                      <IconDownload size={20} />
                      <Text fw={500}>Kaggle Download</Text>
                    </Group>
                    <Button 
                      size="xs" 
                      onClick={testKaggleDownload}
                      loading={activeTest === 'kaggle_download'}
                    >
                      Test
                    </Button>
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">POST /api/kaggle/datasets/download</Text>
                </Card>
                
                <Card withBorder>
                  <Group justify="space-between">
                    <Group>
                      <IconCloudDownload size={20} />
                      <Text fw={500}>Kaggle Download Status</Text>
                    </Group>
                    <Button 
                      size="xs" 
                      onClick={testKaggleDownloadStatus}
                      loading={activeTest === 'kaggle_download_status'}
                    >
                      Test
                    </Button>
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">GET /api/kaggle/datasets/download/status/{datasetRef}</Text>
                </Card>
                
                <Card withBorder>
                  <Group justify="space-between">
                    <Group>
                      <IconList size={20} />
                      <Text fw={500}>Kaggle All Download Statuses</Text>
                    </Group>
                    <Button 
                      size="xs" 
                      onClick={testKaggleAllDownloadStatuses}
                      loading={activeTest === 'kaggle_all_download_statuses'}
                    >
                      Test
                    </Button>
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">GET /api/kaggle/datasets/download/status</Text>
                </Card>
                
                <Card withBorder>
                  <Group justify="space-between">
                    <Group>
                      <IconTag size={20} />
                      <Text fw={500}>Kaggle Dataset Tags</Text>
                    </Group>
                    <Button 
                      size="xs" 
                      onClick={testKaggleDatasetTags}
                      loading={activeTest === 'kaggle_dataset_tags'}
                    >
                      Test
                    </Button>
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">GET /api/kaggle/datasets/tags</Text>
                </Card>
                
                <Card withBorder>
                  <Group justify="space-between">
                    <Group>
                      <IconFolder size={20} />
                      <Text fw={500}>Kaggle Local Datasets</Text>
                    </Group>
                    <Button 
                      size="xs" 
                      onClick={testKaggleLocalDatasets}
                      loading={activeTest === 'kaggle_local_datasets'}
                    >
                      Test
                    </Button>
                  </Group>
                  <Text size="sm" color="dimmed" mt="xs">GET /api/kaggle/local/datasets</Text>
                </Card>
              </Stack>
            </ScrollArea>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default KaggleTestPage; 
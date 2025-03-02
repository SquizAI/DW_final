import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  Badge,
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
  Tooltip,
  Table,
  Progress,
  Modal,
  Accordion
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
  IconTrash,
  IconExternalLink,
  IconEye
} from '@tabler/icons-react';
import { kaggleApi } from '../api';

interface KaggleDataset {
  ref: string;
  title: string;
  size: string;
  lastUpdated: string;
  downloadCount: number;
  description: string;
  url: string;
}

interface LocalDataset {
  ref: string;
  title: string;
  local_path: string;
  download_date: string;
  size_bytes: number;
  file_count: number;
  files: Array<{
    name: string;
    path: string;
    size: number;
  }>;
}

interface DownloadStatus {
  status: string;
  progress: number;
  dataset_ref: string;
  files: Array<{
    name: string;
    path: string;
    size: number;
  }>;
  file_count: number;
  total_size: number;
  download_path: string;
  absolute_path: string;
  download_time: string;
}

const TempKaggleManagerPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [datasets, setDatasets] = useState<KaggleDataset[]>([]);
  const [localDatasets, setLocalDatasets] = useState<LocalDataset[]>([]);
  const [downloadStatuses, setDownloadStatuses] = useState<DownloadStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<LocalDataset | null>(null);
  const [datasetModalOpen, setDatasetModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load local datasets on mount
  useEffect(() => {
    loadLocalDatasets();
    loadDownloadStatuses();
  }, []);

  // Load local datasets
  const loadLocalDatasets = async () => {
    setLoading(true);
    try {
      const response = await kaggleApi.getLocalDatasets();
      setLocalDatasets(response.data);
    } catch (error) {
      console.error('Error loading local datasets:', error);
      setError('Failed to load local datasets');
    } finally {
      setLoading(false);
    }
  };

  // Load download statuses
  const loadDownloadStatuses = async () => {
    try {
      const response = await kaggleApi.getDownloadStatuses();
      setDownloadStatuses(response.data);
    } catch (error) {
      console.error('Error loading download statuses:', error);
    }
  };

  // Search Kaggle datasets
  const searchDatasets = async () => {
    if (!searchQuery.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a search query',
        color: 'red'
      });
      return;
    }

    setSearchLoading(true);
    setDatasets([]);
    setError(null);
    
    try {
      const response = await kaggleApi.search(searchQuery);
      setDatasets(response.data || []);
      if (response.data?.length === 0) {
        setError('No datasets found matching your query');
      }
    } catch (err) {
      console.error('Error searching Kaggle datasets:', err);
      setError('Failed to search Kaggle datasets. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Download dataset
  const downloadDataset = async (datasetRef: string) => {
    setDownloading(datasetRef);
    try {
      const response = await kaggleApi.download(datasetRef);
      
      notifications.show({
        title: 'Success',
        message: `Dataset ${datasetRef} downloaded successfully!`,
        color: 'green'
      });
      
      // Refresh local datasets and download statuses
      await loadLocalDatasets();
      await loadDownloadStatuses();
    } catch (err) {
      console.error('Error downloading dataset:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to download dataset. Please try again.',
        color: 'red'
      });
    } finally {
      setDownloading(null);
    }
  };

  // View dataset details
  const viewDatasetDetails = (dataset: LocalDataset) => {
    setSelectedDataset(dataset);
    setDatasetModalOpen(true);
  };

  // Delete dataset
  const deleteDataset = async (datasetRef: string) => {
    try {
      await kaggleApi.deleteDataset(datasetRef, true);
      
      notifications.show({
        title: 'Success',
        message: `Dataset ${datasetRef} deleted successfully!`,
        color: 'green'
      });
      
      // Refresh local datasets
      await loadLocalDatasets();
    } catch (err) {
      console.error('Error deleting dataset:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete dataset. Please try again.',
        color: 'red'
      });
    }
  };

  // Format bytes to human-readable size
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title>Kaggle Dataset Manager</Title>
          <Button 
            leftSection={<IconRefresh size={16} />} 
            variant="outline" 
            onClick={() => {
              loadLocalDatasets();
              loadDownloadStatuses();
            }}
          >
            Refresh
          </Button>
        </Group>

        <Tabs defaultValue="search">
          <Tabs.List>
            <Tabs.Tab value="search" leftSection={<IconSearch size={16} />}>Search Kaggle</Tabs.Tab>
            <Tabs.Tab value="local" leftSection={<IconDatabase size={16} />}>Local Datasets</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="search" pt="md">
            <Stack gap="md">
              <Group>
                <TextInput
                  placeholder="Search Kaggle datasets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  style={{ flex: 1 }}
                  onKeyDown={(e) => e.key === 'Enter' && searchDatasets()}
                />
                <Button 
                  leftSection={<IconSearch size={16} />} 
                  onClick={searchDatasets}
                  loading={searchLoading}
                >
                  Search
                </Button>
              </Group>

              {error && (
                <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
                  {error}
                </Alert>
              )}

              {searchLoading ? (
                <Box py="xl" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Loader />
                </Box>
              ) : (
                <Grid>
                  {datasets.map((dataset) => (
                    <Grid.Col key={dataset.ref} span={4}>
                      <Card withBorder shadow="sm" p="md">
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text fw={500}>{dataset.title}</Text>
                            <Badge>{dataset.size}</Badge>
                          </Group>
                          
                          <Text size="sm" c="dimmed" lineClamp={3}>
                            {dataset.description || 'No description available'}
                          </Text>
                          
                          <Group justify="space-between" mt="md">
                            <Group gap="xs">
                              <IconTrendingUp size={16} />
                              <Text size="xs">{dataset.downloadCount} downloads</Text>
                            </Group>
                            <Text size="xs" c="dimmed">
                              Updated: {new Date(dataset.lastUpdated).toLocaleDateString()}
                            </Text>
                          </Group>
                          
                          <Group justify="space-between" mt="xs">
                            <Button 
                              variant="light" 
                              size="xs"
                              leftSection={<IconExternalLink size={14} />}
                              component="a"
                              href={dataset.url}
                              target="_blank"
                            >
                              View on Kaggle
                            </Button>
                            <Button 
                              color="blue" 
                              size="xs"
                              leftSection={<IconDownload size={14} />}
                              onClick={() => downloadDataset(dataset.ref)}
                              loading={downloading === dataset.ref}
                              disabled={downloading !== null}
                            >
                              Download
                            </Button>
                          </Group>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="local" pt="md">
            <Stack gap="md">
              {loading ? (
                <Box py="xl" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Loader />
                </Box>
              ) : localDatasets.length === 0 ? (
                <Alert icon={<IconDatabase size={16} />} title="No local datasets" color="blue">
                  You haven't downloaded any Kaggle datasets yet. Use the search tab to find and download datasets.
                </Alert>
              ) : (
                <Grid>
                  {localDatasets.map((dataset) => (
                    <Grid.Col key={dataset.ref} span={4}>
                      <Card withBorder shadow="sm" p="md">
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Text fw={500}>{dataset.title}</Text>
                            <Badge>{formatBytes(dataset.size_bytes)}</Badge>
                          </Group>
                          
                          <Group gap="xs">
                            <IconFolder size={16} />
                            <Text size="xs" style={{ wordBreak: 'break-all' }}>
                              {dataset.local_path}
                            </Text>
                          </Group>
                          
                          <Group justify="space-between" mt="xs">
                            <Group gap="xs">
                              <IconList size={16} />
                              <Text size="xs">{dataset.file_count} files</Text>
                            </Group>
                            <Text size="xs" c="dimmed">
                              Downloaded: {new Date(dataset.download_date).toLocaleDateString()}
                            </Text>
                          </Group>
                          
                          <Group justify="space-between" mt="xs">
                            <Button 
                              variant="light" 
                              size="xs"
                              leftSection={<IconEye size={14} />}
                              onClick={() => viewDatasetDetails(dataset)}
                            >
                              View Details
                            </Button>
                            <Button 
                              color="red" 
                              size="xs"
                              variant="outline"
                              leftSection={<IconTrash size={14} />}
                              onClick={() => deleteDataset(dataset.ref)}
                            >
                              Delete
                            </Button>
                          </Group>
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Dataset Details Modal */}
        <Modal
          opened={datasetModalOpen}
          onClose={() => setDatasetModalOpen(false)}
          title={selectedDataset?.title || 'Dataset Details'}
          size="lg"
        >
          {selectedDataset && (
            <Stack gap="md">
              <Group>
                <Text fw={500}>Reference:</Text>
                <Text>{selectedDataset.ref}</Text>
              </Group>
              
              <Group>
                <Text fw={500}>Location:</Text>
                <Code block>{selectedDataset.local_path}</Code>
              </Group>
              
              <Group>
                <Text fw={500}>Size:</Text>
                <Text>{formatBytes(selectedDataset.size_bytes)}</Text>
              </Group>
              
              <Group>
                <Text fw={500}>Downloaded:</Text>
                <Text>{new Date(selectedDataset.download_date).toLocaleString()}</Text>
              </Group>
              
              <Divider my="sm" />
              
              <Text fw={500}>Files ({selectedDataset.file_count}):</Text>
              
              <ScrollArea style={{ height: 300 }}>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Filename</Table.Th>
                      <Table.Th>Size</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {selectedDataset.files.map((file, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>{file.name}</Table.Td>
                        <Table.Td>{formatBytes(file.size)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
              
              <Group justify="right">
                <Button 
                  color="red" 
                  variant="outline"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => {
                    deleteDataset(selectedDataset.ref);
                    setDatasetModalOpen(false);
                  }}
                >
                  Delete Dataset
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </Stack>
    </Container>
  );
};

export default TempKaggleManagerPage; 
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

const KaggleManagerPage: React.FC = () => {
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

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Kaggle Dataset Manager</Title>
      <Text mb="xl">Search, download, and manage Kaggle datasets.</Text>
      
      <Tabs defaultValue="local">
        <Tabs.List>
          <Tabs.Tab value="local" leftSection={<IconFolder size={14} />}>Local Datasets</Tabs.Tab>
          <Tabs.Tab value="search" leftSection={<IconSearch size={14} />}>Search Kaggle</Tabs.Tab>
          <Tabs.Tab value="downloads" leftSection={<IconCloudDownload size={14} />}>Downloads</Tabs.Tab>
        </Tabs.List>

        {/* Local Datasets Tab */}
        <Tabs.Panel value="local" pt="md">
          <Paper withBorder p="md">
            <Group justify="space-between" mb="md">
              <Title order={3}>Local Datasets</Title>
              <Button 
                leftSection={<IconRefresh size={16} />} 
                onClick={loadLocalDatasets} 
                loading={loading}
                variant="outline"
              >
                Refresh
              </Button>
            </Group>
            
            {error && (
              <Alert color="red" title="Error" icon={<IconAlertCircle size={16} />} mb="md">
                {error}
              </Alert>
            )}
            
            {loading ? (
              <Box py="xl" ta="center">
                <Loader size="md" />
                <Text mt="md">Loading datasets...</Text>
              </Box>
            ) : localDatasets.length === 0 ? (
              <Alert color="blue" title="No Datasets" icon={<IconDatabase size={16} />}>
                No local datasets found. Search and download datasets from the "Search Kaggle" tab.
              </Alert>
            ) : (
              <ScrollArea h={500}>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Dataset</Table.Th>
                      <Table.Th>Size</Table.Th>
                      <Table.Th>Files</Table.Th>
                      <Table.Th>Downloaded</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {localDatasets.map((dataset) => (
                      <Table.Tr key={dataset.ref}>
                        <Table.Td>
                          <Text fw={500}>{dataset.title || dataset.ref}</Text>
                          <Text size="sm" c="dimmed">{dataset.ref}</Text>
                        </Table.Td>
                        <Table.Td>{formatFileSize(dataset.size_bytes)}</Table.Td>
                        <Table.Td>{dataset.file_count}</Table.Td>
                        <Table.Td>{formatDate(dataset.download_date)}</Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Tooltip label="View Details">
                              <ActionIcon 
                                color="blue" 
                                onClick={() => viewDatasetDetails(dataset)}
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Delete Dataset">
                              <ActionIcon 
                                color="red" 
                                onClick={() => deleteDataset(dataset.ref)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Paper>
        </Tabs.Panel>

        {/* Search Kaggle Tab */}
        <Tabs.Panel value="search" pt="md">
          <Paper withBorder p="md">
            <Title order={3} mb="md">Search Kaggle Datasets</Title>
            
            <Group mb="md">
              <TextInput
                placeholder="Search Kaggle datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchDatasets()}
                style={{ flex: 1 }}
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
              <Alert color="red" title="Error" icon={<IconAlertCircle size={16} />} mb="md">
                {error}
              </Alert>
            )}
            
            {searchLoading ? (
              <Box py="xl" ta="center">
                <Loader size="md" />
                <Text mt="md">Searching datasets...</Text>
              </Box>
            ) : (
              <ScrollArea h={500}>
                <Stack gap="md">
                  {datasets.map((dataset) => (
                    <Card key={dataset.ref} withBorder>
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>{dataset.title}</Text>
                        <Badge>{dataset.size}</Badge>
                      </Group>

                      <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                        {dataset.description}
                      </Text>

                      <Group justify="space-between" mt="md">
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            Downloads: {dataset.downloadCount}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Updated: {new Date(dataset.lastUpdated).toLocaleDateString()}
                          </Text>
                        </Group>

                        <Group gap="xs">
                          <Tooltip label="View on Kaggle">
                            <ActionIcon 
                              component="a" 
                              href={dataset.url} 
                              target="_blank"
                              variant="light"
                            >
                              <IconExternalLink size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Button
                            variant="light"
                            size="xs"
                            leftSection={<IconDownload size={16} />}
                            loading={downloading === dataset.ref}
                            onClick={() => downloadDataset(dataset.ref)}
                          >
                            Download
                          </Button>
                        </Group>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </ScrollArea>
            )}
          </Paper>
        </Tabs.Panel>

        {/* Downloads Tab */}
        <Tabs.Panel value="downloads" pt="md">
          <Paper withBorder p="md">
            <Group justify="space-between" mb="md">
              <Title order={3}>Download Status</Title>
              <Button 
                leftSection={<IconRefresh size={16} />} 
                onClick={loadDownloadStatuses} 
                variant="outline"
              >
                Refresh
              </Button>
            </Group>
            
            {downloadStatuses.length === 0 ? (
              <Alert color="blue" title="No Downloads" icon={<IconCloudDownload size={16} />}>
                No download history found. Download datasets from the "Search Kaggle" tab.
              </Alert>
            ) : (
              <ScrollArea h={500}>
                <Stack gap="md">
                  {downloadStatuses.map((status) => (
                    <Card key={status.dataset_ref} withBorder>
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>{status.dataset_ref}</Text>
                        <Badge 
                          color={status.status === 'completed' ? 'green' : 'yellow'}
                          leftSection={status.status === 'completed' ? <IconCheck size={14} /> : null}
                        >
                          {status.status}
                        </Badge>
                      </Group>
                      
                      <Progress 
                        value={status.progress} 
                        color={status.status === 'completed' ? 'green' : 'blue'} 
                        mb="md"
                        size="sm"
                      />
                      
                      <Group gap="md">
                        <Text size="sm">Files: {status.file_count}</Text>
                        <Text size="sm">Size: {formatFileSize(status.total_size)}</Text>
                        <Text size="sm">Downloaded: {formatDate(status.download_time)}</Text>
                      </Group>
                      
                      <Accordion mt="md">
                        <Accordion.Item value="files">
                          <Accordion.Control>
                            <Text size="sm">Files ({status.files.length})</Text>
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Table>
                              <Table.Thead>
                                <Table.Tr>
                                  <Table.Th>Name</Table.Th>
                                  <Table.Th>Size</Table.Th>
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {status.files.map((file, index) => (
                                  <Table.Tr key={index}>
                                    <Table.Td>{file.name}</Table.Td>
                                    <Table.Td>{formatFileSize(file.size)}</Table.Td>
                                  </Table.Tr>
                                ))}
                              </Table.Tbody>
                            </Table>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    </Card>
                  ))}
                </Stack>
              </ScrollArea>
            )}
          </Paper>
        </Tabs.Panel>
      </Tabs>
      
      {/* Dataset Details Modal */}
      <Modal
        opened={datasetModalOpen}
        onClose={() => setDatasetModalOpen(false)}
        title={<Title order={3}>{selectedDataset?.title || selectedDataset?.ref}</Title>}
        size="lg"
      >
        {selectedDataset && (
          <>
            <Text mb="md">Reference: {selectedDataset.ref}</Text>
            <Text mb="md">Size: {formatFileSize(selectedDataset.size_bytes)}</Text>
            <Text mb="md">Downloaded: {formatDate(selectedDataset.download_date)}</Text>
            <Text mb="md">Path: {selectedDataset.local_path}</Text>
            
            <Divider my="md" />
            
            <Title order={4} mb="md">Files ({selectedDataset.file_count})</Title>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Size</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {selectedDataset.files.map((file, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{file.name}</Table.Td>
                    <Table.Td>{formatFileSize(file.size)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default KaggleManagerPage; 
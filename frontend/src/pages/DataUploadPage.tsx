import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  Button,
  TextInput,
  Tabs,
  rem,
  ThemeIcon,
  Badge,
  ActionIcon,
  Tooltip,
  Progress,
  Divider,
  Select,
  Box,
  Paper,
  LoadingOverlay,
  FileButton,
  List,
  Image,
  SegmentedControl,
} from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  IconUpload,
  IconFile,
  IconX,
  IconCheck,
  IconSearch,
  IconDownload,
  IconExternalLink,
  IconDatabase,
  IconCloud,
  IconTable,
  IconBrandGithub,
  IconLink,
} from '@tabler/icons-react';
import { api, kaggleApi } from '@/api';

interface KaggleDataset {
  ref: string;
  title: string;
  size: number;
  lastUpdated: string;
  downloadCount: number;
  description: string;
  url: string;
}

interface FilePreview {
  file: FileWithPath;
  progress: number;
  preview?: {
    columns: string[];
    rowCount: number;
    sampleData: Record<string, any>[];
  };
}

interface KaggleApiResponse {
  ref?: string;
  title?: string;
  size?: number;
  lastUpdated?: string;
  downloadCount?: number;
  description?: string;
  url?: string;
}

interface UrlUploadData {
  url: string;
  type: 'github' | 'url';
  branch?: string;
  path?: string;
}

export function DataUploadPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string | null>('upload');
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [kaggleQuery, setKaggleQuery] = useState('');
  const [kaggleDatasets, setKaggleDatasets] = useState<KaggleDataset[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [urlData, setUrlData] = useState<UrlUploadData>({
    url: '',
    type: 'url',
    branch: 'main',
    path: '',
  });
  const [isUrlLoading, setIsUrlLoading] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'kaggle') {
      setActiveTab('kaggle');
    }
  }, [searchParams]);

  // File Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/datasets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      notifications.show({
        title: 'Success',
        message: 'Dataset uploaded successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to upload dataset',
        color: 'red',
        icon: <IconX size={16} />,
      });
    },
  });

  // Kaggle Search Function
  const handleKaggleSearch = async () => {
    if (!kaggleQuery.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a search query',
        color: 'red',
      });
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching Kaggle for:', kaggleQuery);
      const response = await kaggleApi.search(kaggleQuery);
      console.log('Kaggle search response:', response.data);
      
      // Ensure we're working with an array and transform the data if needed
      let datasets: any[] = [];
      if (Array.isArray(response.data)) {
        datasets = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // If the data is wrapped in an object, try to find the array
        datasets = response.data.datasets || response.data.results || [];
      }

      // Validate and transform each dataset
      const validDatasets = datasets.map((dataset: any) => ({
        ref: dataset.ref || '',
        title: dataset.title || 'Untitled Dataset',
        size: dataset.size || '0MB',
        lastUpdated: dataset.lastUpdated || new Date().toISOString(),
        downloadCount: typeof dataset.downloadCount === 'number' ? dataset.downloadCount : 0,
        description: dataset.description || '',
        url: dataset.url || ''
      }));

      setKaggleDatasets(validDatasets);
      
      if (validDatasets.length === 0) {
        notifications.show({
          title: 'Info',
          message: 'No datasets found for your search query',
          color: 'blue',
        });
      }
    } catch (error: unknown) {
      console.error('Kaggle search error:', error);
      let errorMessage = 'Failed to search Kaggle datasets. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const axiosError = error as { 
          response?: { 
            data?: { detail?: string }, 
            status?: number 
          },
          request?: unknown
        };
        
        console.error('Error response data:', axiosError.response?.data);
        console.error('Error response status:', axiosError.response?.status);
        
        if (axiosError.response?.data && 'detail' in axiosError.response.data) {
          errorMessage = `Error: ${axiosError.response.data.detail}`;
        }
      } else if (error && typeof error === 'object' && 'request' in error) {
        // The request was made but no response was received
        errorMessage = 'No response received from server. Please check your connection.';
      }
      
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      setKaggleDatasets([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Kaggle Download Function
  const downloadKaggleDataset = async (datasetRef: string) => {
    setDownloading(datasetRef);
    try {
      const response = await kaggleApi.download(datasetRef);
      
      notifications.show({
        title: 'Success',
        message: 'Dataset downloaded successfully',
        color: 'green',
      });

      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    } catch (error: any) {
      console.error('Kaggle download error:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.detail || 'Failed to download dataset. Please try again.',
        color: 'red',
      });
    } finally {
      setDownloading(null);
    }
  };

  // File Drop Handler
  const handleDrop = (droppedFiles: FileWithPath[]) => {
    const newFiles = droppedFiles.map(file => ({
      file,
      progress: 0,
    }));
    setFiles(prev => [...prev, ...newFiles]);

    // Start uploading each file
    droppedFiles.forEach(file => {
      uploadMutation.mutate(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // URL/GitHub Upload Function
  const uploadFromUrl = async () => {
    if (!urlData.url) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a valid URL',
        color: 'red',
      });
      return;
    }

    setIsUrlLoading(true);
    try {
      let endpoint = '/datasets/url';
      if (urlData.type === 'github') {
        endpoint = '/datasets/github';
      }

      const response = await api.post(endpoint, urlData);
      
      notifications.show({
        title: 'Success',
        message: 'Dataset imported successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to import dataset',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setIsUrlLoading(false);
    }
  };

  return (
    <Container size="xl" py="xl" style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <Stack gap="xl">
        <Card withBorder shadow="sm" p="xl">
          <Group>
            <ThemeIcon size={40} radius="md" variant="light" color="blue">
              <IconUpload style={{ width: '20px', height: '20px' }} />
            </ThemeIcon>
            <div>
              <Title order={2}>Data Upload</Title>
              <Text c="dimmed">Add datasets to your library or import from external sources</Text>
            </div>
          </Group>
        </Card>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab 
              value="upload" 
              leftSection={<IconUpload style={{ width: '16px', height: '16px' }} />}
            >
              Add Dataset to Library
            </Tabs.Tab>
            <Tabs.Tab 
              value="kaggle" 
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
            >
              Kaggle Datasets
            </Tabs.Tab>
            <Tabs.Tab
              value="url"
              leftSection={<IconLink style={{ width: '16px', height: '16px' }} />}
            >
              URL/GitHub
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="upload" pt="xl">
            <Stack gap="md">
              <Dropzone
                onDrop={handleDrop}
                accept={['text/csv', 'application/vnd.ms-excel', 'application/json']}
                maxSize={50 * 1024 * 1024} // 50MB
              >
                <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                  <Dropzone.Accept>
                    <IconUpload
                      size="3.2rem"
                      stroke={1.5}
                      color="var(--mantine-color-blue-6)"
                    />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX
                      size="3.2rem"
                      stroke={1.5}
                      color="var(--mantine-color-red-6)"
                    />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconFile size="3.2rem" stroke={1.5} />
                  </Dropzone.Idle>

                  <div>
                    <Text size="xl" inline>
                      Drag files here or click to select
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      Attach your data files. We support CSV, Excel, and JSON formats, up to 50MB each
                    </Text>
                  </div>
                </Group>
              </Dropzone>

              {files.length > 0 && (
                <Stack gap="md">
                  {files.map((file, index) => (
                    <Paper key={index} withBorder p="md">
                      <Group justify="space-between" mb="xs">
                        <Group>
                          <ThemeIcon 
                            size={40} 
                            radius="md" 
                            variant="light"
                            color={file.progress === 100 ? 'green' : 'blue'}
                          >
                            {file.progress === 100 ? (
                              <IconCheck size={20} />
                            ) : (
                              <IconFile size={20} />
                            )}
                          </ThemeIcon>
                          <div>
                            <Text fw={500}>{file.file.name}</Text>
                            <Text size="sm" c="dimmed">
                              {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                          </div>
                        </Group>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => removeFile(index)}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Group>

                      {file.progress < 100 && (
                        <Progress 
                          value={file.progress} 
                          size="sm" 
                          radius="xl" 
                          mt="md"
                        />
                      )}

                      {file.preview && (
                        <Box mt="md">
                          <Group gap="xs">
                            <Badge color="blue">
                              {file.preview.columns.length} columns
                            </Badge>
                            <Badge color="teal">
                              {file.preview.rowCount.toLocaleString()} rows
                            </Badge>
                          </Group>
                          <Text size="sm" fw={500} mt="sm">Columns:</Text>
                          <Group gap="xs" mt="xs">
                            {file.preview.columns.map((col, i) => (
                              <Badge key={i} variant="outline">
                                {col}
                              </Badge>
                            ))}
                          </Group>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="kaggle" pt="xl">
            <Stack gap="md">
              <Card withBorder>
                <Stack gap="md">
                  <Group>
                    <TextInput
                      placeholder="Search Kaggle datasets..."
                      value={kaggleQuery}
                      onChange={(e) => setKaggleQuery(e.target.value)}
                      style={{ flex: 1 }}
                      leftSection={<IconSearch size={16} />}
                      onKeyDown={(e) => e.key === 'Enter' && handleKaggleSearch()}
                    />
                    <Button
                      variant="light"
                      onClick={handleKaggleSearch}
                      loading={isSearching}
                      leftSection={<IconSearch size={16} />}
                    >
                      Search
                    </Button>
                  </Group>
                </Stack>
              </Card>

              <Box pos="relative">
                <LoadingOverlay visible={isSearching} />
                <Stack gap="md">
                  {kaggleDatasets.map((dataset) => (
                    <Card key={dataset.ref} withBorder>
                      <Group justify="space-between" mb="xs">
                        <Text fw={500}>{dataset.title}</Text>
                        <Badge>{Math.round(dataset.size)} MB</Badge>
                      </Group>

                      <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                        {dataset.description}
                      </Text>

                      <Group justify="space-between" mt="md">
                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            Downloads: {dataset.downloadCount.toLocaleString()}
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
                            onClick={() => downloadKaggleDataset(dataset.ref)}
                          >
                            Download
                          </Button>
                        </Group>
                      </Group>
                    </Card>
                  ))}

                  {!isSearching && kaggleQuery && kaggleDatasets.length === 0 && (
                    <Text c="dimmed" ta="center" py="xl">
                      No datasets found for "{kaggleQuery}"
                    </Text>
                  )}

                  {!isSearching && !kaggleQuery && (
                    <Text c="dimmed" ta="center" py="xl">
                      Enter a search term to find Kaggle datasets
                    </Text>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="url" pt="xl">
            <Stack gap="md">
              <Card withBorder>
                <Stack gap="md">
                  <SegmentedControl
                    value={urlData.type}
                    onChange={(value) => setUrlData({ ...urlData, type: value as 'url' | 'github' })}
                    data={[
                      {
                        label: (
                          <Group gap="xs">
                            <IconLink size={16} />
                            <span>Direct URL</span>
                          </Group>
                        ),
                        value: 'url',
                      },
                      {
                        label: (
                          <Group gap="xs">
                            <IconBrandGithub size={16} />
                            <span>GitHub</span>
                          </Group>
                        ),
                        value: 'github',
                      },
                    ]}
                  />

                  <TextInput
                    label={urlData.type === 'github' ? "GitHub Repository URL" : "Dataset URL"}
                    placeholder={
                      urlData.type === 'github' 
                        ? "https://github.com/username/repo" 
                        : "https://example.com/dataset.csv"
                    }
                    value={urlData.url}
                    onChange={(e) => setUrlData({ ...urlData, url: e.target.value })}
                    leftSection={urlData.type === 'github' ? <IconBrandGithub size={16} /> : <IconLink size={16} />}
                  />

                  {urlData.type === 'github' && (
                    <>
                      <TextInput
                        label="Branch"
                        placeholder="main"
                        value={urlData.branch}
                        onChange={(e) => setUrlData({ ...urlData, branch: e.target.value })}
                      />
                      <TextInput
                        label="Path to File/Directory"
                        placeholder="data/dataset.csv"
                        value={urlData.path}
                        onChange={(e) => setUrlData({ ...urlData, path: e.target.value })}
                        description="Leave empty to import from root directory"
                      />
                    </>
                  )}

                  <Button
                    onClick={uploadFromUrl}
                    loading={isUrlLoading}
                    leftSection={urlData.type === 'github' ? <IconBrandGithub size={16} /> : <IconDownload size={16} />}
                  >
                    Import Dataset
                  </Button>
                </Stack>
              </Card>

              <Paper withBorder p="md">
                <Text fw={500} mb="xs">Supported Formats:</Text>
                <List size="sm" spacing="xs">
                  <List.Item>CSV files (.csv)</List.Item>
                  <List.Item>JSON files (.json)</List.Item>
                  <List.Item>Excel files (.xlsx, .xls)</List.Item>
                  <List.Item>Parquet files (.parquet)</List.Item>
                  <List.Item>Compressed archives (.zip, .gz) containing supported formats</List.Item>
                </List>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
} 
import React, { useState } from 'react';
import { 
  TextInput, 
  Button, 
  Card, 
  Group, 
  Text, 
  Stack,
  Badge,
  ActionIcon,
  LoadingOverlay,
  Tooltip,
  Box,
  ScrollArea,
  Loader
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconDownload, IconExternalLink } from '@tabler/icons-react';
import { kaggleApi } from '../api';

interface KaggleDataset {
  ref: string;
  title: string;
  size: number;
  lastUpdated: string;
  downloadCount: number;
  description: string;
  url: string;
}

interface KaggleDatasetBrowserProps {
  onDatasetDownloaded?: (data: any) => void;
}

export function KaggleDatasetBrowser({ onDatasetDownloaded }: KaggleDatasetBrowserProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [datasets, setDatasets] = useState<KaggleDataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const searchDatasets = async () => {
    if (!searchQuery.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a search query',
        color: 'red'
      });
      return;
    }

    setLoading(true);
    setDatasets([]);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await kaggleApi.search(searchQuery);
      console.log('Kaggle search response:', response.data);
      setDatasets(response.data || []);
      if (response.data?.length === 0) {
        setError('No datasets found matching your query');
      }
    } catch (err) {
      console.error('Error searching Kaggle datasets:', err);
      setError('Failed to search Kaggle datasets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadDataset = async (datasetRef: string) => {
    setDownloading(datasetRef);
    try {
      const response = await kaggleApi.download(datasetRef);
      
      if (onDatasetDownloaded) {
        onDatasetDownloaded(response.data);
      }
      
      setSuccess(`Dataset ${datasetRef} downloaded successfully!`);
    } catch (err) {
      console.error('Error downloading dataset:', err);
      setError('Failed to download dataset. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchDatasets();
    }
  };

  return (
    <Stack gap="md">
      <Card withBorder>
        <Box w="100%">
          <TextInput
            placeholder="Search Kaggle datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            w="100%"
            rightSection={
              <ActionIcon 
                onClick={searchDatasets}
                loading={loading}
                variant="filled"
                color="blue"
                size="sm"
              >
                <IconSearch size={16} />
              </ActionIcon>
            }
          />
        </Box>
      </Card>

      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        <Stack gap="md">
          {datasets.map((dataset) => (
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
      </div>
    </Stack>
  );
} 
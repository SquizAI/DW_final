import { useState } from 'react';
import {
  Paper,
  Title,
  Tabs,
  TextInput,
  Button,
  Stack,
  Group,
  Text,
  Card,
  Badge,
  PasswordInput,
  NumberInput,
  Select,
  Code,
  Loader,
  Box,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconSearch,
  IconDatabase,
  IconTable,
  IconCloud,
  IconBrandMongodb,
  IconMessageCircle2,
} from '@tabler/icons-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface DataSourcesPanelProps {
  onDatasetImported: (preview: any) => void;
}

export function DataSourcesPanel({ onDatasetImported }: DataSourcesPanelProps) {
  const [activeTab, setActiveTab] = useState<string | null>('kaggle');
  
  // Kaggle State
  const [kaggleQuery, setKaggleQuery] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  
  // S3 State
  const [s3Config, setS3Config] = useState({
    bucket: '',
    key: '',
    region: '',
    access_key_id: '',
    secret_access_key: '',
  });
  
  // MongoDB State
  const [mongoConfig, setMongoConfig] = useState({
    connection_string: '',
    database: '',
    collection: '',
  });
  
  // SQL State
  const [sqlConfig, setSQL3Config] = useState({
    connection_string: '',
    query: '',
  });
  
  // Kafka State
  const [kafkaConfig, setKafkaConfig] = useState({
    bootstrap_servers: [''],
    topic: '',
    group_id: '',
    auto_offset_reset: 'earliest',
  });

  // Kaggle Search Query
  const { data: kaggleData, isLoading: isSearching } = useQuery({
    queryKey: ['kaggleSearch', kaggleQuery],
    queryFn: async () => {
      if (!kaggleQuery) return null;
      const response = await axios.post('/kaggle/search', {
        query: kaggleQuery,
        max_results: maxResults,
      });
      return response.data;
    },
    enabled: !!kaggleQuery,
  });

  // Kaggle Download Mutation
  const downloadMutation = useMutation({
    mutationFn: async (datasetRef: string) => {
      const response = await axios.post(`/kaggle/download/${datasetRef}`);
      return response.data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: data.message,
        color: 'green',
      });
      onDatasetImported(data.preview);
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to download dataset',
        color: 'red',
      });
    },
  });

  // S3 Import Mutation
  const s3Mutation = useMutation({
    mutationFn: async (config: typeof s3Config) => {
      const response = await axios.post('/s3/import', config);
      return response.data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: data.message,
        color: 'green',
      });
      onDatasetImported(data.preview);
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to import from S3',
        color: 'red',
      });
    },
  });

  // MongoDB Import Mutation
  const mongoMutation = useMutation({
    mutationFn: async (config: typeof mongoConfig) => {
      const response = await axios.post('/mongodb/import', config);
      return response.data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: data.message,
        color: 'green',
      });
      onDatasetImported(data.preview);
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to import from MongoDB',
        color: 'red',
      });
    },
  });

  // SQL Import Mutation
  const sqlMutation = useMutation({
    mutationFn: async (config: typeof sqlConfig) => {
      const response = await axios.post('/sql/import', config);
      return response.data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: data.message,
        color: 'green',
      });
      onDatasetImported(data.preview);
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to import from SQL',
        color: 'red',
      });
    },
  });

  // Kafka Import Mutation
  const kafkaMutation = useMutation({
    mutationFn: async (config: typeof kafkaConfig) => {
      const response = await axios.post('/kafka/import', config);
      return response.data;
    },
    onSuccess: (data) => {
      notifications.show({
        title: 'Success',
        message: data.message,
        color: 'green',
      });
      onDatasetImported(data.preview);
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to import from Kafka',
        color: 'red',
      });
    },
  });

  return (
    <Paper p="md" style={{ height: '100%', overflowY: 'auto' }}>
      <Title order={3} mb="md">Data Sources</Title>
      
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="kaggle" leftSection={
            <Box component="img" src="/kaggle-icon.svg" w={16} h={16} style={{ display: 'block' }} />
          }>
            Kaggle
          </Tabs.Tab>
          <Tabs.Tab value="s3" leftSection={<IconCloud size={16} />}>
            S3
          </Tabs.Tab>
          <Tabs.Tab value="mongodb" leftSection={<IconBrandMongodb size={16} />}>
            MongoDB
          </Tabs.Tab>
          <Tabs.Tab value="sql" leftSection={<IconDatabase size={16} />}>
            SQL
          </Tabs.Tab>
          <Tabs.Tab value="kafka" leftSection={<IconMessageCircle2 size={16} />}>
            Kafka
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="kaggle" pt="md">
          <Stack gap="md">
            <Group>
              <TextInput
                placeholder="Search Kaggle datasets..."
                value={kaggleQuery}
                onChange={(e) => setKaggleQuery(e.target.value)}
                style={{ flex: 1 }}
                leftSection={<IconSearch size={16} />}
              />
              <NumberInput
                label="Max Results"
                value={maxResults}
                onChange={(value) => setMaxResults(typeof value === 'number' ? value : 10)}
                min={1}
                max={20}
                w={100}
              />
            </Group>

            {isSearching && (
              <Box ta="center" py="xl">
                <Loader />
                <Text size="sm" c="dimmed" mt="xs">Searching Kaggle datasets...</Text>
              </Box>
            )}

            {kaggleData?.datasets?.map((dataset: any) => (
              <Card key={dataset.ref} withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>{dataset.title}</Text>
                  <Badge>{dataset.size}</Badge>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  Last updated: {dataset.last_updated}
                  <br />
                  Downloads: {dataset.download_count.toLocaleString()}
                </Text>
                <Button
                  variant="light"
                  onClick={() => downloadMutation.mutate(dataset.ref)}
                  loading={downloadMutation.isPending}
                  fullWidth
                >
                  Download Dataset
                </Button>
              </Card>
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="s3" pt="md">
          <Stack gap="md">
            <TextInput
              label="Bucket"
              placeholder="my-bucket"
              value={s3Config.bucket}
              onChange={(e) => setS3Config({ ...s3Config, bucket: e.target.value })}
            />
            <TextInput
              label="Key"
              placeholder="path/to/file.csv"
              value={s3Config.key}
              onChange={(e) => setS3Config({ ...s3Config, key: e.target.value })}
            />
            <TextInput
              label="Region"
              placeholder="us-east-1"
              value={s3Config.region}
              onChange={(e) => setS3Config({ ...s3Config, region: e.target.value })}
            />
            <TextInput
              label="Access Key ID"
              value={s3Config.access_key_id}
              onChange={(e) => setS3Config({ ...s3Config, access_key_id: e.target.value })}
            />
            <PasswordInput
              label="Secret Access Key"
              value={s3Config.secret_access_key}
              onChange={(e) => setS3Config({ ...s3Config, secret_access_key: e.target.value })}
            />
            <Button
              onClick={() => s3Mutation.mutate(s3Config)}
              loading={s3Mutation.isPending}
            >
              Import from S3
            </Button>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="mongodb" pt="md">
          <Stack gap="md">
            <TextInput
              label="Connection String"
              placeholder="mongodb://..."
              value={mongoConfig.connection_string}
              onChange={(e) => setMongoConfig({ ...mongoConfig, connection_string: e.target.value })}
            />
            <TextInput
              label="Database"
              value={mongoConfig.database}
              onChange={(e) => setMongoConfig({ ...mongoConfig, database: e.target.value })}
            />
            <TextInput
              label="Collection"
              value={mongoConfig.collection}
              onChange={(e) => setMongoConfig({ ...mongoConfig, collection: e.target.value })}
            />
            <Button
              onClick={() => mongoMutation.mutate(mongoConfig)}
              loading={mongoMutation.isPending}
            >
              Import from MongoDB
            </Button>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="sql" pt="md">
          <Stack gap="md">
            <TextInput
              label="Connection String"
              placeholder="postgresql://..."
              value={sqlConfig.connection_string}
              onChange={(e) => setSQL3Config({ ...sqlConfig, connection_string: e.target.value })}
            />
            <TextInput
              label="SQL Query"
              placeholder="SELECT * FROM table"
              value={sqlConfig.query}
              onChange={(e) => setSQL3Config({ ...sqlConfig, query: e.target.value })}
            />
            <Button
              onClick={() => sqlMutation.mutate(sqlConfig)}
              loading={sqlMutation.isPending}
            >
              Import from SQL
            </Button>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="kafka" pt="md">
          <Stack gap="md">
            <TextInput
              label="Bootstrap Servers"
              placeholder="localhost:9092"
              value={kafkaConfig.bootstrap_servers[0]}
              onChange={(e) => setKafkaConfig({
                ...kafkaConfig,
                bootstrap_servers: [e.target.value]
              })}
            />
            <TextInput
              label="Topic"
              value={kafkaConfig.topic}
              onChange={(e) => setKafkaConfig({ ...kafkaConfig, topic: e.target.value })}
            />
            <TextInput
              label="Group ID"
              value={kafkaConfig.group_id}
              onChange={(e) => setKafkaConfig({ ...kafkaConfig, group_id: e.target.value })}
            />
            <Select
              label="Auto Offset Reset"
              value={kafkaConfig.auto_offset_reset}
              onChange={(value) => setKafkaConfig({
                ...kafkaConfig,
                auto_offset_reset: value || 'earliest'
              })}
              data={[
                { value: 'earliest', label: 'Earliest' },
                { value: 'latest', label: 'Latest' },
              ]}
            />
            <Button
              onClick={() => kafkaMutation.mutate(kafkaConfig)}
              loading={kafkaMutation.isPending}
            >
              Import from Kafka
            </Button>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
} 
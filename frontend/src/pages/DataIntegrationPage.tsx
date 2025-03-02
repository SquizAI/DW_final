import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  SimpleGrid,
  Button,
  Group,
  TextInput,
  PasswordInput,
  Select,
  Tabs,
  rem,
  Code,
  Alert,
  Progress,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconDatabase,
  IconCloud,
  IconApi,
  IconBrandAws,
  IconBrandGoogleBigQuery,
  IconBrandSnowflake,
  IconBrandMongodb,
  IconBrandMysql,
  IconServer,
  IconPlus,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

interface ConnectionConfig {
  name: string;
  type: string;
  host?: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  region?: string;
  bucket?: string;
  projectId?: string;
}

const DATABASE_TYPES = [
  { value: 'postgresql', label: 'PostgreSQL', icon: IconServer },
  { value: 'mysql', label: 'MySQL', icon: IconBrandMysql },
  { value: 'mongodb', label: 'MongoDB', icon: IconBrandMongodb },
  { value: 'snowflake', label: 'Snowflake', icon: IconBrandSnowflake },
  { value: 'bigquery', label: 'BigQuery', icon: IconBrandGoogleBigQuery },
  { value: 's3', label: 'Amazon S3', icon: IconServer },
];

const CLOUD_PROVIDERS = [
  { value: 'aws_s3', label: 'AWS S3', icon: IconBrandAws },
  { value: 'gcs', label: 'Google Cloud Storage', icon: IconBrandGoogleBigQuery },
];

export function DataIntegrationPage() {
  const [activeTab, setActiveTab] = useState<string | null>('database');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connections, setConnections] = useState<ConnectionConfig[]>([]);

  const form = useForm<ConnectionConfig>({
    initialValues: {
      name: '',
      type: 'postgresql',
      host: '',
      port: '',
      database: '',
      username: '',
      password: '',
      apiKey: '',
      region: '',
      bucket: '',
      projectId: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
      type: (value) => (!value ? 'Please select a connection type' : null),
      host: (value, values) => (
        values.type !== 's3' && !value ? 'Host is required' : null
      ),
      port: (value, values) => (
        values.type !== 's3' && !value ? 'Port is required' : null
      ),
    },
  });

  const handleTestConnection = async () => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    setTestStatus('testing');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestStatus('success');
      notifications.show({
        title: 'Connection Test Successful',
        message: 'Successfully connected to the database',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      setTestStatus('error');
      notifications.show({
        title: 'Connection Test Failed',
        message: error instanceof Error ? error.message : 'Failed to connect to the database',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const handleSaveConnection = (values: ConnectionConfig) => {
    try {
      console.log('Saving connection:', values);
      notifications.show({
        title: 'Connection Saved',
        message: 'Successfully saved the connection configuration',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save connection configuration',
        color: 'red',
      });
    }
  };

  const renderConnectionForm = () => {
    switch (activeTab) {
      case 'database':
        return (
          <Stack gap="md">
            <TextInput
              label="Connection Name"
              placeholder="My Database Connection"
              required
              {...form.getInputProps('name')}
            />
            <Select
              label="Database Type"
              placeholder="Select database type"
              data={DATABASE_TYPES.map(type => ({
                value: type.value,
                label: type.label,
                leftSection: <type.icon size={16} />,
              }))}
              required
              {...form.getInputProps('type')}
            />
            <TextInput
              label="Host"
              placeholder="localhost or hostname"
              required
              {...form.getInputProps('host')}
            />
            <TextInput
              label="Port"
              placeholder="5432"
              {...form.getInputProps('port')}
            />
            <TextInput
              label="Database Name"
              placeholder="my_database"
              required
              {...form.getInputProps('database')}
            />
            <TextInput
              label="Username"
              placeholder="database_user"
              required
              {...form.getInputProps('username')}
            />
            <PasswordInput
              label="Password"
              placeholder="••••••••"
              required
              {...form.getInputProps('password')}
            />
          </Stack>
        );
      
      case 'cloud':
        return (
          <Stack gap="md">
            <TextInput
              label="Connection Name"
              placeholder="My Cloud Storage"
              required
              {...form.getInputProps('name')}
            />
            <Select
              label="Cloud Provider"
              placeholder="Select cloud provider"
              data={CLOUD_PROVIDERS.map(provider => ({
                value: provider.value,
                label: provider.label,
                leftSection: <provider.icon size={16} />,
              }))}
              required
              {...form.getInputProps('type')}
            />
            <TextInput
              label="Region"
              placeholder="us-east-1"
              {...form.getInputProps('region')}
            />
            <TextInput
              label="Bucket Name"
              placeholder="my-bucket"
              required
              {...form.getInputProps('bucket')}
            />
            <PasswordInput
              label="Access Key"
              placeholder="Enter your access key"
              required
              {...form.getInputProps('apiKey')}
            />
          </Stack>
        );
      
      case 'api':
        return (
          <Stack gap="md">
            <TextInput
              label="Connection Name"
              placeholder="My API Connection"
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label="API Endpoint"
              placeholder="https://api.example.com/v1"
              required
              {...form.getInputProps('host')}
            />
            <PasswordInput
              label="API Key"
              placeholder="Enter your API key"
              required
              {...form.getInputProps('apiKey')}
            />
          </Stack>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container size="xl" py="xl" style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <Stack gap="xl">
        <Group justify="space-between">
          <div>
            <Title order={1}>Data Integration</Title>
            <Text c="dimmed">Connect and manage your data sources</Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            onClick={() => form.reset()}
          >
            New Connection
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {/* Connection Form */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                  <Tabs.Tab
                    value="database"
                    leftSection={<IconDatabase size={16} />}
                  >
                    Databases
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="cloud"
                    leftSection={<IconCloud size={16} />}
                  >
                    Cloud Storage
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="api"
                    leftSection={<IconApi size={16} />}
                  >
                    API
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value={activeTab || 'database'} pt="md">
                  <form onSubmit={(e) => e.preventDefault()}>
                    {renderConnectionForm()}
                    
                    <Group mt="xl" justify="flex-end">
                      <Button
                        variant="light"
                        onClick={handleTestConnection}
                        loading={testStatus === 'testing'}
                      >
                        Test Connection
                      </Button>
                      <Button onClick={() => form.onSubmit(handleSaveConnection)()}>
                        Save Connection
                      </Button>
                    </Group>
                  </form>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Card>

          {/* Existing Connections */}
          <Stack gap="md">
            <Text size="sm" fw={500} c="dimmed">
              EXISTING CONNECTIONS
            </Text>
            
            {connections.length === 0 ? (
              <Alert icon={<IconAlertCircle size={16} />} color="gray">
                No connections configured yet. Create your first connection to get started.
              </Alert>
            ) : (
              connections.map((conn, index) => (
                <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Text fw={500}>{conn.name}</Text>
                      <Badge size="sm" variant="light">
                        {conn.type}
                      </Badge>
                    </Group>
                    <Group gap="xs">
                      <Tooltip label="Refresh connection">
                        <ActionIcon variant="light" size="sm" color="blue">
                          <IconRefresh size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Remove connection">
                        <ActionIcon 
                          variant="light" 
                          size="sm" 
                          color="red"
                          onClick={() => setConnections(prev => 
                            prev.filter((_, i) => i !== index)
                          )}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                  
                  <Text size="sm" c="dimmed">
                    {conn.host || conn.bucket || 'No connection details'}
                  </Text>
                  
                  <Group mt="sm">
                    <Group gap="xs" align="center">
                      <Progress 
                        value={100} 
                        color={testStatus === 'success' ? "green" : "red"} 
                        size="xs" 
                        w={100}
                      />
                      <Text size="xs" c="dimmed">
                        {testStatus === 'success' ? 'Connected' : 'Failed'}
                      </Text>
                    </Group>
                  </Group>
                </Card>
              ))
            )}
          </Stack>
        </SimpleGrid>

        {/* Connection Help */}
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Connection Security"
          color="blue"
        >
          <Text size="sm" mb="sm">
            All connection credentials are encrypted before being stored. We recommend using environment variables
            or secrets management for production deployments.
          </Text>
          <Code block>
            {`# Example environment variables
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_database
DB_USER=user
DB_PASS=password`}
          </Code>
        </Alert>
      </Stack>
    </Container>
  );
} 
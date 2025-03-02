import React from 'react';
import { 
  IconUpload, 
  IconDatabase, 
  IconApi,
  IconBrandMysql,
  IconBrandMongodb
} from '@tabler/icons-react';
import { 
  Text, 
  Group, 
  Stack, 
  Badge, 
  Button, 
  Card,
  Modal
} from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { BaseNode } from './BaseNode';
import { NodeData, NodeCapability } from './types';

interface CustomCapability extends Omit<NodeCapability, 'function'> {
  isPrimary: boolean;
  icon: JSX.Element;
  render: ({ onClose }: { onClose: () => void }) => JSX.Element;
}

const DATA_INGESTION_CAPABILITIES: CustomCapability[] = [
  {
    id: 'upload-data',
    label: 'Upload Data',
    description: 'Import data from CSV, JSON, or Excel files',
    isPrimary: true,
    icon: <IconUpload size={20} />,
    render: ({ onClose }: { onClose: () => void }) => (
      <Card withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="xs">
              <IconUpload size={20} />
              <Text fw={500}>Upload Data</Text>
            </Group>
            <Badge color="blue">PRIMARY CAPABILITY</Badge>
          </Group>
          <Dropzone
            onDrop={(files: FileWithPath[]) => {
              console.log('Files dropped:', files);
              // Handle file upload
              onClose();
            }}
            accept={['text/csv', 'application/json', 'application/vnd.ms-excel']}
            maxSize={5 * 1024 ** 2} // 5MB
          >
            <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
              <Stack align="center" gap="xs">
                <IconUpload size={32} stroke={1.5} />
                <Text size="sm" inline>
                  Drag files here or click to select
                </Text>
                <Text size="xs" c="dimmed" inline>
                  Supported formats: CSV, JSON, Excel (up to 5MB)
                </Text>
              </Stack>
            </Group>
          </Dropzone>
        </Stack>
      </Card>
    )
  },
  {
    id: 'connect-database',
    label: 'Connect to Database',
    description: 'Connect to various database systems',
    isPrimary: true,
    icon: <IconDatabase size={20} />,
    render: ({ onClose }: { onClose: () => void }) => (
      <Card withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="xs">
              <IconDatabase size={20} />
              <Text fw={500}>Connect to Database</Text>
            </Group>
            <Badge color="blue">PRIMARY CAPABILITY</Badge>
          </Group>
          <Group grow>
            <Button variant="light" leftSection={<IconBrandMysql size={20} />}>MySQL</Button>
            <Button variant="light" leftSection={<IconDatabase size={20} />}>PostgreSQL</Button>
          </Group>
          <Group grow>
            <Button variant="light" leftSection={<IconBrandMongodb size={20} />}>MongoDB</Button>
            <Button variant="light" leftSection={<IconApi size={20} />}>REST API</Button>
          </Group>
        </Stack>
      </Card>
    )
  }
];

interface DataIngestionNodeProps {
  data: NodeData;
  onShowCapabilities?: () => void;
  onShowDetails?: () => void;
}

export const DataIngestionNode: React.FC<DataIngestionNodeProps> = (props) => {
  const [showCapabilities, setShowCapabilities] = React.useState(false);

  const enhancedData: NodeData = {
    ...props.data,
    type: 'data-ingestion',
    capabilities: DATA_INGESTION_CAPABILITIES.map(cap => ({
      id: cap.id,
      label: cap.label,
      description: cap.description,
      function: async () => ({ success: true })
    })),
    icon: props.data.icon || <IconUpload size={20} />,
    tags: [...(props.data.tags || []), 'data-source'],
    complexity: props.data.complexity || 'intermediate'
  };

  return (
    <>
      <BaseNode
        data={enhancedData}
        onShowCapabilities={() => setShowCapabilities(true)}
        onShowDetails={props.onShowDetails}
      />

      <Modal
        opened={showCapabilities}
        onClose={() => setShowCapabilities(false)}
        title={
          <Group>
            <IconUpload size={20} />
            <Text fw={500}>CSV Import Capabilities</Text>
          </Group>
        }
        size="lg"
      >
        <Stack gap="md">
          {DATA_INGESTION_CAPABILITIES.map((capability) => (
            <React.Fragment key={capability.id}>
              {capability.render({ onClose: () => setShowCapabilities(false) })}
            </React.Fragment>
          ))}
        </Stack>
      </Modal>
    </>
  );
}; 
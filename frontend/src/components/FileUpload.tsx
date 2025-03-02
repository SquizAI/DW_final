import React, { useRef, useState } from 'react';
import { Group, Text, Button, Card, Stack, Progress } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload, IconX, IconFile } from '@tabler/icons-react';
import { Dropzone, FileRejection, FileWithPath } from '@mantine/dropzone';

export function FileUpload() {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const openRef = useRef<() => void>(null);

  const handleDrop = (acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
  };

  const handleReject = (fileRejections: FileRejection[]) => {
    notifications.show({
      title: 'Error',
      message: 'Invalid file type. Please upload CSV, Excel, or JSON files.',
      color: 'red',
      icon: <IconX />
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: `Failed to upload ${file.name}`,
          color: 'red'
        });
      }
    }

    setUploading(false);
    setFiles([]);
    setUploadProgress(0);

    notifications.show({
      title: 'Success',
      message: 'All files uploaded successfully',
      color: 'green'
    });
  };

  return (
    <Stack gap="md">
      <Dropzone
        onDrop={handleDrop}
        onReject={handleReject}
        maxSize={30 * 1024 ** 2}
        accept={{
          'text/csv': ['.csv'],
          'application/vnd.ms-excel': ['.xls'],
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          'application/json': ['.json']
        }}
        loading={uploading}
      >
        <Group justify="center" gap="xl" style={{ minHeight: 120, pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload
              size={50}
              stroke={1.5}
              color="var(--mantine-color-blue-6)"
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              size={50}
              stroke={1.5}
              color="var(--mantine-color-red-6)"
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFile size={50} stroke={1.5} />
          </Dropzone.Idle>

          <Stack gap="xs" style={{ textAlign: 'center' }}>
            <Text size="xl" inline>
              Drag files here or click to select
            </Text>
            <Text size="sm" c="dimmed" inline>
              Upload your data files (max 30MB each)
            </Text>
          </Stack>
        </Group>
      </Dropzone>

      {files.length > 0 && (
        <Card withBorder>
          <Stack gap="md">
            <Text fw={500}>Selected Files:</Text>
            {files.map((file, index) => (
              <Text key={index} size="sm">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </Text>
            ))}
            <Group justify="space-between">
              <Button 
                onClick={uploadFiles}
                loading={uploading}
                leftSection={<IconUpload size={16} />}
              >
                Upload Files
              </Button>
              {uploading && (
                <Progress 
                  value={uploadProgress} 
                  size="xl" 
                  radius="xl" 
                  style={{ flex: 1 }}
                />
              )}
            </Group>
          </Stack>
        </Card>
      )}
    </Stack>
  );
} 
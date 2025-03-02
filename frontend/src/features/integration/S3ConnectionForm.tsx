import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Stack, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCloud } from '@tabler/icons-react';

export function S3ConnectionForm() {
  const [formData, setFormData] = useState({
    bucket: '',
    key: '',
    region: '',
    access_key_id: '',
    secret_access_key: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/s3/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to connect to S3');

      const data = await response.json();
      notifications.show({
        title: 'Success',
        message: data.message,
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to connect to S3',
        color: 'red'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Bucket Name"
          placeholder="my-bucket"
          value={formData.bucket}
          onChange={(e) => setFormData({ ...formData, bucket: e.target.value })}
          required
        />

        <TextInput
          label="Object Key"
          placeholder="path/to/data.csv"
          value={formData.key}
          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          required
        />

        <TextInput
          label="Region"
          placeholder="us-east-1"
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          required
        />

        <TextInput
          label="Access Key ID"
          placeholder="Enter AWS access key ID"
          value={formData.access_key_id}
          onChange={(e) => setFormData({ ...formData, access_key_id: e.target.value })}
          required
        />

        <PasswordInput
          label="Secret Access Key"
          placeholder="Enter AWS secret access key"
          value={formData.secret_access_key}
          onChange={(e) => setFormData({ ...formData, secret_access_key: e.target.value })}
          required
        />

        <Group justify="flex-end">
          <Button type="submit" leftSection={<IconCloud size={16} />}>
            Connect to S3
          </Button>
        </Group>
      </Stack>
    </form>
  );
} 
import React, { useState } from 'react';
import { TextInput, Select, Button, Stack, Group, JsonInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconApi } from '@tabler/icons-react';

export function APIConnectionForm() {
  const [formData, setFormData] = useState({
    url: '',
    method: 'GET',
    headers: '{}',
    body: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse headers
      const headers = JSON.parse(formData.headers);

      // Make API request
      const response = await fetch(formData.url, {
        method: formData.method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: formData.method !== 'GET' ? formData.body : undefined,
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      notifications.show({
        title: 'Success',
        message: 'API request successful',
        color: 'green'
      });

      // TODO: Handle the API response data
      console.log('API Response:', data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'API request failed',
        color: 'red'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="API URL"
          placeholder="https://api.example.com/data"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
        />

        <Select
          label="Method"
          data={[
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'DELETE', label: 'DELETE' },
          ]}
          value={formData.method}
          onChange={(value) => setFormData({ ...formData, method: value || 'GET' })}
          required
        />

        <JsonInput
          label="Headers"
          placeholder='{"Authorization": "Bearer token"}'
          value={formData.headers}
          onChange={(value) => setFormData({ ...formData, headers: value })}
          formatOnBlur
          minRows={3}
        />

        {formData.method !== 'GET' && (
          <JsonInput
            label="Request Body"
            placeholder='{"key": "value"}'
            value={formData.body}
            onChange={(value) => setFormData({ ...formData, body: value })}
            formatOnBlur
            minRows={5}
          />
        )}

        <Group justify="flex-end">
          <Button type="submit" leftSection={<IconApi size={16} />}>
            Send Request
          </Button>
        </Group>
      </Stack>
    </form>
  );
} 
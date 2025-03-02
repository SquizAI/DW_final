import React, { useState } from 'react';
import { TextInput, Button, Stack, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBrandMongodb } from '@tabler/icons-react';

export function MongoDBConnectionForm() {
  const [formData, setFormData] = useState({
    connection_string: '',
    database: '',
    collection: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/mongodb/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to connect to MongoDB');

      const data = await response.json();
      notifications.show({
        title: 'Success',
        message: data.message,
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to connect to MongoDB',
        color: 'red'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Connection String"
          placeholder="mongodb://username:password@host:port"
          value={formData.connection_string}
          onChange={(e) => setFormData({ ...formData, connection_string: e.target.value })}
          required
        />

        <TextInput
          label="Database"
          placeholder="mydatabase"
          value={formData.database}
          onChange={(e) => setFormData({ ...formData, database: e.target.value })}
          required
        />

        <TextInput
          label="Collection"
          placeholder="mycollection"
          value={formData.collection}
          onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
          required
        />

        <Group justify="flex-end">
          <Button type="submit" leftSection={<IconBrandMongodb size={16} />}>
            Connect to MongoDB
          </Button>
        </Group>
      </Stack>
    </form>
  );
} 
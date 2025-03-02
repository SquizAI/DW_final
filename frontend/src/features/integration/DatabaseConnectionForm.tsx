import React, { useState } from 'react';
import { TextInput, PasswordInput, Select, Button, Stack, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDatabase } from '@tabler/icons-react';

export function DatabaseConnectionForm() {
  const [formData, setFormData] = useState({
    type: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/sql/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_string: `${formData.type}://${formData.username}:${formData.password}@${formData.host}:${formData.port}/${formData.database}`,
          query: 'SELECT * FROM your_table LIMIT 1000'  // This should be configurable
        }),
      });

      if (!response.ok) throw new Error('Failed to connect to database');

      const data = await response.json();
      notifications.show({
        title: 'Success',
        message: data.message,
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to connect to database',
        color: 'red'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Select
          label="Database Type"
          placeholder="Select database type"
          data={[
            { value: 'postgresql', label: 'PostgreSQL' },
            { value: 'mysql', label: 'MySQL' },
            { value: 'mssql', label: 'SQL Server' },
            { value: 'oracle', label: 'Oracle' },
          ]}
          value={formData.type}
          onChange={(value) => setFormData({ ...formData, type: value || '' })}
          required
        />

        <TextInput
          label="Host"
          placeholder="localhost"
          value={formData.host}
          onChange={(e) => setFormData({ ...formData, host: e.target.value })}
          required
        />

        <TextInput
          label="Port"
          placeholder="5432"
          value={formData.port}
          onChange={(e) => setFormData({ ...formData, port: e.target.value })}
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
          label="Username"
          placeholder="Enter username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />

        <PasswordInput
          label="Password"
          placeholder="Enter password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <Group justify="flex-end">
          <Button type="submit" leftSection={<IconDatabase size={16} />}>
            Connect to Database
          </Button>
        </Group>
      </Stack>
    </form>
  );
} 
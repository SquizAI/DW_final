import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Button,
  Select,
  ActionIcon,
  Menu,
  Modal,
  TextInput,
} from '@mantine/core';
import {
  IconPlus,
  IconDownload,
  IconUpload,
  IconTrash,
  IconDots,
  IconCode,
  IconBrandPython,
  IconBrandJavascript,
  IconSettings,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { CodeEditor } from '@/components/CodeEditor';
import { api } from '@/api';

interface CodeCell {
  id: string;
  language: string;
  code: string;
  output?: string;
}

export function CodeNotebook() {
  const [cells, setCells] = useState<CodeCell[]>([
    {
      id: '1',
      language: 'python',
      code: '# Welcome to Data Whisperer Code Notebook\n# Start coding here...',
    },
  ]);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const addCell = (language: string = 'python') => {
    const newCell: CodeCell = {
      id: Date.now().toString(),
      language,
      code: '',
    };
    setCells([...cells, newCell]);
  };

  const deleteCell = (id: string) => {
    setCells(cells.filter(cell => cell.id !== id));
  };

  const executeCell = async (id: string, code: string) => {
    try {
      const response = await api.post('/execute', {
        language: cells.find(cell => cell.id === id)?.language,
        code,
      });

      setCells(cells.map(cell => 
        cell.id === id 
          ? { ...cell, output: response.data.output }
          : cell
      ));

      notifications.show({
        title: 'Success',
        message: 'Code executed successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to execute code',
        color: 'red',
      });
    }
  };

  const saveNotebook = async () => {
    try {
      await api.post('/notebooks/save', { cells });
      notifications.show({
        title: 'Success',
        message: 'Notebook saved successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save notebook',
        color: 'red',
      });
    }
  };

  return (
    <Container size="xl" py="xl" style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
      <Stack gap="xl">
        <Card withBorder shadow="sm" p="xl">
          <Group justify="space-between">
            <div>
              <Title order={2}>Code Notebook</Title>
              <Text c="dimmed">Write and execute code, analyze data, and create visualizations</Text>
            </div>
            <Group>
              <Menu>
                <Menu.Target>
                  <Button variant="light" leftSection={<IconPlus size={16} />}>
                    Add Cell
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconBrandPython size={16} />}
                    onClick={() => addCell('python')}
                  >
                    Python Cell
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconBrandJavascript size={16} />}
                    onClick={() => addCell('javascript')}
                  >
                    JavaScript Cell
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconCode size={16} />}
                    onClick={() => addCell('sql')}
                  >
                    SQL Cell
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              <Button
                variant="light"
                leftSection={<IconDownload size={16} />}
                onClick={saveNotebook}
              >
                Save Notebook
              </Button>
              <ActionIcon variant="light" onClick={() => setIsSettingsOpen(true)}>
                <IconSettings size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>

        <Stack gap="md">
          {cells.map((cell) => (
            <Card key={cell.id} withBorder>
              <Group justify="space-between" mb="md">
                <Select
                  value={cell.language}
                  onChange={(value) => {
                    setCells(cells.map(c => 
                      c.id === cell.id 
                        ? { ...c, language: value || 'python' }
                        : c
                    ));
                  }}
                  data={[
                    { value: 'python', label: 'Python' },
                    { value: 'javascript', label: 'JavaScript' },
                    { value: 'sql', label: 'SQL' },
                  ]}
                  style={{ width: 150 }}
                />
                <Group>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => deleteCell(cell.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
              
              <CodeEditor
                defaultLanguage={cell.language}
                defaultValue={cell.code}
                onExecute={(code) => executeCell(cell.id, code)}
              />
            </Card>
          ))}
        </Stack>
      </Stack>

      <Modal
        opened={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Notebook Settings"
      >
        <Stack>
          <TextInput
            label="Notebook Name"
            placeholder="Enter notebook name"
          />
          <Select
            label="Default Language"
            data={[
              { value: 'python', label: 'Python' },
              { value: 'javascript', label: 'JavaScript' },
              { value: 'sql', label: 'SQL' },
            ]}
            defaultValue="python"
          />
          <Button onClick={() => setIsSettingsOpen(false)}>
            Save Settings
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
} 
import React from 'react';
import {
  Paper,
  Stack,
  Text,
  Group,
  Switch,
  NumberInput,
  Select,
  TextInput,
  Button,
  Divider,
  Accordion,
  ColorInput,
  JsonInput,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import {
  IconSettings,
  IconRefresh,
  IconDownload,
  IconUpload,
  IconTrash,
  IconInfoCircle,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface WorkflowSettings {
  name: string;
  description: string;
  executionMode: 'sequential' | 'parallel';
  maxConcurrency: number;
  autoSave: boolean;
  autoLayout: boolean;
  theme: {
    nodeBorderColor: string;
    nodeBackgroundColor: string;
    edgeColor: string;
    selectedColor: string;
  };
  validation: {
    validateBeforeExecution: boolean;
    stopOnError: boolean;
    dataQualityThreshold: number;
  };
  notifications: {
    onStart: boolean;
    onComplete: boolean;
    onError: boolean;
    emailNotifications: boolean;
    emailRecipients: string[];
  };
  scheduling: {
    enabled: boolean;
    interval: string;
    retryAttempts: number;
    timeout: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    retention: number;
    exportFormat: 'json' | 'csv';
  };
}

interface WorkflowSettingsProps {
  settings: WorkflowSettings;
  onUpdateSettings: (settings: Partial<WorkflowSettings>) => void;
  onExportWorkflow: () => void;
  onImportWorkflow: (file: File) => void;
  onResetWorkflow: () => void;
}

const DEFAULT_SETTINGS: WorkflowSettings = {
  name: 'New Workflow',
  description: '',
  executionMode: 'sequential',
  maxConcurrency: 4,
  autoSave: true,
  autoLayout: true,
  theme: {
    nodeBorderColor: '#228be6',
    nodeBackgroundColor: '#ffffff',
    edgeColor: '#868e96',
    selectedColor: '#fa5252',
  },
  validation: {
    validateBeforeExecution: true,
    stopOnError: true,
    dataQualityThreshold: 0.95,
  },
  notifications: {
    onStart: true,
    onComplete: true,
    onError: true,
    emailNotifications: false,
    emailRecipients: [],
  },
  scheduling: {
    enabled: false,
    interval: '0 0 * * *',
    retryAttempts: 3,
    timeout: 3600,
  },
  logging: {
    level: 'info',
    retention: 30,
    exportFormat: 'json',
  },
};

export function WorkflowSettings({
  settings = DEFAULT_SETTINGS,
  onUpdateSettings,
  onExportWorkflow,
  onImportWorkflow,
  onResetWorkflow,
}: WorkflowSettingsProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportWorkflow(file);
    }
  };

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={500}>Workflow Settings</Text>
          <IconSettings size={20} />
        </Group>

        <Accordion defaultValue="general">
          <Accordion.Item value="general">
            <Accordion.Control>General Settings</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <TextInput
                  label="Workflow Name"
                  value={settings.name}
                  onChange={(e) => onUpdateSettings({ name: e.currentTarget.value })}
                />
                <TextInput
                  label="Description"
                  value={settings.description}
                  onChange={(e) => onUpdateSettings({ description: e.currentTarget.value })}
                />
                <Select
                  label="Execution Mode"
                  value={settings.executionMode}
                  onChange={(value) => {
                    if (value === 'sequential' || value === 'parallel') {
                      onUpdateSettings({ executionMode: value });
                    }
                  }}
                  data={[
                    { value: 'sequential', label: 'Sequential' },
                    { value: 'parallel', label: 'Parallel' },
                  ]}
                />
                <NumberInput
                  label="Max Concurrency"
                  value={settings.maxConcurrency}
                  onChange={(value) => onUpdateSettings({ maxConcurrency: typeof value === 'number' ? value : 1 })}
                  min={1}
                  max={10}
                  disabled={settings.executionMode === 'sequential'}
                />
                <Switch
                  label="Auto-save Workflow"
                  checked={settings.autoSave}
                  onChange={(e) => onUpdateSettings({ autoSave: e.currentTarget.checked })}
                />
                <Switch
                  label="Auto-layout Nodes"
                  checked={settings.autoLayout}
                  onChange={(e) => onUpdateSettings({ autoLayout: e.currentTarget.checked })}
                />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="theme">
            <Accordion.Control>Theme & Appearance</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <ColorInput
                  label="Node Border Color"
                  value={settings.theme.nodeBorderColor}
                  onChange={(value) => onUpdateSettings({ theme: { ...settings.theme, nodeBorderColor: value } })}
                />
                <ColorInput
                  label="Node Background Color"
                  value={settings.theme.nodeBackgroundColor}
                  onChange={(value) => onUpdateSettings({ theme: { ...settings.theme, nodeBackgroundColor: value } })}
                />
                <ColorInput
                  label="Edge Color"
                  value={settings.theme.edgeColor}
                  onChange={(value) => onUpdateSettings({ theme: { ...settings.theme, edgeColor: value } })}
                />
                <ColorInput
                  label="Selection Color"
                  value={settings.theme.selectedColor}
                  onChange={(value) => onUpdateSettings({ theme: { ...settings.theme, selectedColor: value } })}
                />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="validation">
            <Accordion.Control>Validation & Quality</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Switch
                  label="Validate Before Execution"
                  checked={settings.validation.validateBeforeExecution}
                  onChange={(e) => onUpdateSettings({
                    validation: { ...settings.validation, validateBeforeExecution: e.currentTarget.checked }
                  })}
                />
                <Switch
                  label="Stop on Error"
                  checked={settings.validation.stopOnError}
                  onChange={(e) => onUpdateSettings({
                    validation: { ...settings.validation, stopOnError: e.currentTarget.checked }
                  })}
                />
                <NumberInput
                  label="Data Quality Threshold"
                  value={settings.validation.dataQualityThreshold}
                  onChange={(value) => onUpdateSettings({
                    validation: {
                      ...settings.validation,
                      dataQualityThreshold: typeof value === 'number' ? value : 0.95
                    }
                  })}
                  min={0}
                  max={1}
                  step={0.05}
                  decimalScale={2}
                />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="notifications">
            <Accordion.Control>Notifications</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Switch
                  label="Notify on Start"
                  checked={settings.notifications.onStart}
                  onChange={(e) => onUpdateSettings({
                    notifications: { ...settings.notifications, onStart: e.currentTarget.checked }
                  })}
                />
                <Switch
                  label="Notify on Complete"
                  checked={settings.notifications.onComplete}
                  onChange={(e) => onUpdateSettings({
                    notifications: { ...settings.notifications, onComplete: e.currentTarget.checked }
                  })}
                />
                <Switch
                  label="Notify on Error"
                  checked={settings.notifications.onError}
                  onChange={(e) => onUpdateSettings({
                    notifications: { ...settings.notifications, onError: e.currentTarget.checked }
                  })}
                />
                <Switch
                  label="Email Notifications"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => onUpdateSettings({
                    notifications: { ...settings.notifications, emailNotifications: e.currentTarget.checked }
                  })}
                />
                <TextInput
                  label="Email Recipients"
                  placeholder="Enter email addresses separated by commas"
                  value={settings.notifications.emailRecipients.join(', ')}
                  onChange={(e) => onUpdateSettings({
                    notifications: {
                      ...settings.notifications,
                      emailRecipients: e.currentTarget.value.split(',').map(email => email.trim())
                    }
                  })}
                  disabled={!settings.notifications.emailNotifications}
                />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="scheduling">
            <Accordion.Control>Scheduling</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Switch
                  label="Enable Scheduling"
                  checked={settings.scheduling.enabled}
                  onChange={(e) => onUpdateSettings({
                    scheduling: { ...settings.scheduling, enabled: e.currentTarget.checked }
                  })}
                />
                <Group align="flex-start">
                  <TextInput
                    label="Cron Interval"
                    value={settings.scheduling.interval}
                    onChange={(e) => onUpdateSettings({
                      scheduling: { ...settings.scheduling, interval: e.currentTarget.value }
                    })}
                    disabled={!settings.scheduling.enabled}
                    style={{ flex: 1 }}
                  />
                  <Tooltip label="Cron expression format: minute hour day month weekday">
                    <ActionIcon variant="subtle" size="sm" style={{ marginTop: 28 }}>
                      <IconInfoCircle size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <NumberInput
                  label="Retry Attempts"
                  value={settings.scheduling.retryAttempts}
                  onChange={(value) => onUpdateSettings({
                    scheduling: {
                      ...settings.scheduling,
                      retryAttempts: typeof value === 'number' ? value : 0
                    }
                  })}
                  min={0}
                  max={10}
                  disabled={!settings.scheduling.enabled}
                />
                <NumberInput
                  label="Timeout (seconds)"
                  value={settings.scheduling.timeout}
                  onChange={(value) => onUpdateSettings({
                    scheduling: {
                      ...settings.scheduling,
                      timeout: typeof value === 'number' ? value : 3600
                    }
                  })}
                  min={0}
                  disabled={!settings.scheduling.enabled}
                />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="logging">
            <Accordion.Control>Logging</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                <Select
                  label="Log Level"
                  value={settings.logging.level}
                  onChange={(value) => {
                    if (value === 'debug' || value === 'info' || value === 'warn' || value === 'error') {
                      onUpdateSettings({
                        logging: { ...settings.logging, level: value }
                      });
                    }
                  }}
                  data={[
                    { value: 'debug', label: 'Debug' },
                    { value: 'info', label: 'Info' },
                    { value: 'warn', label: 'Warning' },
                    { value: 'error', label: 'Error' },
                  ]}
                />
                <NumberInput
                  label="Log Retention (days)"
                  value={settings.logging.retention}
                  onChange={(value) => onUpdateSettings({
                    logging: {
                      ...settings.logging,
                      retention: typeof value === 'number' ? value : 30
                    }
                  })}
                  min={1}
                  max={365}
                />
                <Select
                  label="Export Format"
                  value={settings.logging.exportFormat}
                  onChange={(value) => {
                    if (value === 'json' || value === 'csv') {
                      onUpdateSettings({
                        logging: { ...settings.logging, exportFormat: value }
                      });
                    }
                  }}
                  data={[
                    { value: 'json', label: 'JSON' },
                    { value: 'csv', label: 'CSV' },
                  ]}
                />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Divider />

        <Group>
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
            onClick={onExportWorkflow}
          >
            Export Workflow
          </Button>
          <Button
            variant="light"
            leftSection={<IconUpload size={16} />}
            component="label"
          >
            Import Workflow
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              accept=".json"
            />
          </Button>
          <Button
            variant="light"
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => {
              if (window.confirm('Are you sure you want to reset the workflow? This cannot be undone.')) {
                onResetWorkflow();
              }
            }}
          >
            Reset Workflow
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
} 
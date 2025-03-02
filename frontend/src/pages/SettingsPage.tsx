import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Switch,
  Tabs,
  Select,
  Button,
  Divider,
  Card,
  SimpleGrid,
  ThemeIcon,
  PasswordInput,
  Checkbox,
  Alert,
  Box,
  useMantineTheme,
  ColorSwatch,
  Tooltip,
  SegmentedControl,
  useMantineColorScheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconSettings,
  IconPalette,
  IconLock,
  IconBell,
  IconDevices,
  IconKey,
  IconShield,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconEye,
  IconEyeOff,
  IconBrain,
  IconDashboard,
  IconLayoutGrid,
  IconLayoutList,
  IconLayoutCards,
  IconSun,
  IconMoonStars,
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>('appearance');
  const theme = useMantineTheme();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [dashboardLayout, setDashboardLayout] = useState<string>(
    user?.preferences?.dashboardLayout || 'default'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    user?.preferences?.notifications || true
  );

  // Password change form
  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      newPassword: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState({
    dataUpdates: true,
    securityAlerts: true,
    productNews: false,
    tips: true,
  });

  // API key management (mock)
  const [apiKeys, setApiKeys] = useState([
    { id: 'key1', name: 'Development API Key', created: '2023-10-15', lastUsed: '2023-11-01' },
    { id: 'key2', name: 'Production API Key', created: '2023-09-20', lastUsed: '2023-11-05' },
  ]);

  // Theme colors
  const colors = ['blue', 'cyan', 'grape', 'green', 'indigo', 'orange', 'pink', 'red', 'teal', 'violet'];

  const handleSaveAppearance = async () => {
    try {
      await updateUser({
        preferences: {
          theme: colorScheme === 'dark' ? 'dark' : 'light',
          dashboardLayout: dashboardLayout,
          notifications: user?.preferences?.notifications || true,
        },
      });

      notifications.show({
        title: 'Settings saved',
        message: 'Your appearance settings have been updated',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save appearance settings',
        color: 'red',
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateUser({
        preferences: {
          theme: colorScheme === 'dark' ? 'dark' : 'light',
          dashboardLayout: user?.preferences?.dashboardLayout || 'default',
          notifications: notificationsEnabled,
        },
      });

      notifications.show({
        title: 'Settings saved',
        message: 'Your notification settings have been updated',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save notification settings',
        color: 'red',
      });
    }
  };

  const handleChangePassword = async (values: typeof passwordForm.values) => {
    try {
      // In a real app, this would call an API endpoint
      // For now, we'll just show a success notification
      notifications.show({
        title: 'Password updated',
        message: 'Your password has been changed successfully',
        color: 'green',
      });
      passwordForm.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to change password',
        color: 'red',
      });
    }
  };

  const handleCreateApiKey = () => {
    const newKey = {
      id: `key${apiKeys.length + 1}`,
      name: `API Key ${apiKeys.length + 1}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    };
    setApiKeys([...apiKeys, newKey]);
    
    notifications.show({
      title: 'API Key created',
      message: 'Your new API key has been generated',
      color: 'green',
    });
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
    
    notifications.show({
      title: 'API Key deleted',
      message: 'The API key has been deleted',
      color: 'blue',
    });
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="md">Settings</Title>
      <Text c="dimmed" mb="xl">
        Customize your experience and manage your account settings
      </Text>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="xl">
          <Tabs.Tab value="appearance" leftSection={<IconPalette size={16} />}>
            Appearance
          </Tabs.Tab>
          <Tabs.Tab value="notifications" leftSection={<IconBell size={16} />}>
            Notifications
          </Tabs.Tab>
          <Tabs.Tab value="security" leftSection={<IconLock size={16} />}>
            Security
          </Tabs.Tab>
          <Tabs.Tab value="api" leftSection={<IconKey size={16} />}>
            API Keys
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="appearance">
          <Paper withBorder p="xl" radius="md">
            <Title order={3} mb="lg">Appearance Settings</Title>
            
            <Stack>
              <div>
                <Text fw={500} mb="xs">Theme</Text>
                <SegmentedControl
                  value={colorScheme}
                  onChange={(value) => setColorScheme(value as 'light' | 'dark')}
                  data={[
                    { 
                      label: (
                        <Group gap="xs">
                          <IconSun size={16} />
                          <span>Light</span>
                        </Group>
                      ), 
                      value: 'light' 
                    },
                    { 
                      label: (
                        <Group gap="xs">
                          <IconMoonStars size={16} />
                          <span>Dark</span>
                        </Group>
                      ), 
                      value: 'dark' 
                    },
                  ]}
                  mb="md"
                />
              </div>
              
              <div>
                <Text fw={500} mb="xs">Primary Color</Text>
                <Group mb="md">
                  {colors.map((color) => (
                    <Tooltip key={color} label={color} withArrow>
                      <ColorSwatch 
                        color={theme.colors[color][6]} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          // In a real app, this would update the theme
                          notifications.show({
                            title: 'Color selected',
                            message: `Primary color set to ${color}`,
                            color,
                          });
                        }}
                      />
                    </Tooltip>
                  ))}
                </Group>
              </div>
              
              <div>
                <Text fw={500} mb="xs">Dashboard Layout</Text>
                <SegmentedControl
                  value={dashboardLayout}
                  onChange={setDashboardLayout}
                  data={[
                    { 
                      label: (
                        <Group gap="xs">
                          <IconLayoutGrid size={16} />
                          <span>Default</span>
                        </Group>
                      ), 
                      value: 'default' 
                    },
                    { 
                      label: (
                        <Group gap="xs">
                          <IconLayoutList size={16} />
                          <span>Compact</span>
                        </Group>
                      ), 
                      value: 'compact' 
                    },
                    { 
                      label: (
                        <Group gap="xs">
                          <IconLayoutCards size={16} />
                          <span>Expanded</span>
                        </Group>
                      ), 
                      value: 'expanded' 
                    },
                  ]}
                  mb="md"
                />
              </div>
              
              <div>
                <Text fw={500} mb="xs">AI Features</Text>
                <Switch 
                  label="Enable AI-powered insights" 
                  defaultChecked 
                  mb="xs"
                />
                <Switch 
                  label="Show AI recommendations" 
                  defaultChecked 
                  mb="xs"
                />
                <Switch 
                  label="AI assistant in sidebar" 
                  defaultChecked 
                />
              </div>
              
              <Divider my="md" />
              
              <Group justify="flex-end">
                <Button variant="outline">Reset to Defaults</Button>
                <Button onClick={handleSaveAppearance}>Save Changes</Button>
              </Group>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="notifications">
          <Paper withBorder p="xl" radius="md">
            <Title order={3} mb="lg">Notification Settings</Title>
            
            <Stack>
              <Group justify="space-between">
                <div>
                  <Text fw={500}>Enable Notifications</Text>
                  <Text size="sm" c="dimmed">
                    Receive notifications about updates, alerts, and activity
                  </Text>
                </div>
                <Switch 
                  checked={notificationsEnabled} 
                  onChange={(event) => setNotificationsEnabled(event.currentTarget.checked)}
                  size="lg"
                />
              </Group>
              
              <Divider my="md" label="Email Notifications" labelPosition="center" />
              
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <Card withBorder p="md">
                  <Group mb="sm">
                    <ThemeIcon color="blue" variant="light">
                      <IconDashboard size={16} />
                    </ThemeIcon>
                    <Text fw={500}>Data Updates</Text>
                  </Group>
                  <Text size="sm" c="dimmed" mb="md">
                    Receive emails when your datasets are updated or processed
                  </Text>
                  <Switch 
                    checked={emailNotifications.dataUpdates} 
                    onChange={(event) => setEmailNotifications({
                      ...emailNotifications,
                      dataUpdates: event.currentTarget.checked
                    })}
                    label="Enabled"
                  />
                </Card>
                
                <Card withBorder p="md">
                  <Group mb="sm">
                    <ThemeIcon color="red" variant="light">
                      <IconShield size={16} />
                    </ThemeIcon>
                    <Text fw={500}>Security Alerts</Text>
                  </Group>
                  <Text size="sm" c="dimmed" mb="md">
                    Receive emails about security-related events and login attempts
                  </Text>
                  <Switch 
                    checked={emailNotifications.securityAlerts} 
                    onChange={(event) => setEmailNotifications({
                      ...emailNotifications,
                      securityAlerts: event.currentTarget.checked
                    })}
                    label="Enabled"
                  />
                </Card>
                
                <Card withBorder p="md">
                  <Group mb="sm">
                    <ThemeIcon color="green" variant="light">
                      <IconBrain size={16} />
                    </ThemeIcon>
                    <Text fw={500}>Tips & Tutorials</Text>
                  </Group>
                  <Text size="sm" c="dimmed" mb="md">
                    Receive emails with tips, tutorials, and best practices
                  </Text>
                  <Switch 
                    checked={emailNotifications.tips} 
                    onChange={(event) => setEmailNotifications({
                      ...emailNotifications,
                      tips: event.currentTarget.checked
                    })}
                    label="Enabled"
                  />
                </Card>
                
                <Card withBorder p="md">
                  <Group mb="sm">
                    <ThemeIcon color="grape" variant="light">
                      <IconSettings size={16} />
                    </ThemeIcon>
                    <Text fw={500}>Product News</Text>
                  </Group>
                  <Text size="sm" c="dimmed" mb="md">
                    Receive emails about new features, updates, and announcements
                  </Text>
                  <Switch 
                    checked={emailNotifications.productNews} 
                    onChange={(event) => setEmailNotifications({
                      ...emailNotifications,
                      productNews: event.currentTarget.checked
                    })}
                    label="Enabled"
                  />
                </Card>
              </SimpleGrid>
              
              <Divider my="md" />
              
              <Group justify="flex-end">
                <Button variant="outline">Reset to Defaults</Button>
                <Button onClick={handleSaveNotifications}>Save Changes</Button>
              </Group>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="security">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Paper withBorder p="xl" radius="md">
              <Title order={3} mb="lg">Change Password</Title>
              
              <form onSubmit={passwordForm.onSubmit(handleChangePassword)}>
                <Stack>
                  <PasswordInput
                    label="Current Password"
                    placeholder="Enter your current password"
                    {...passwordForm.getInputProps('currentPassword')}
                  />
                  
                  <PasswordInput
                    label="New Password"
                    placeholder="Enter your new password"
                    {...passwordForm.getInputProps('newPassword')}
                  />
                  
                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="Confirm your new password"
                    {...passwordForm.getInputProps('confirmPassword')}
                  />
                  
                  <Group justify="flex-end" mt="md">
                    <Button type="submit">Change Password</Button>
                  </Group>
                </Stack>
              </form>
            </Paper>
            
            <Paper withBorder p="xl" radius="md">
              <Title order={3} mb="lg">Two-Factor Authentication</Title>
              
              <Stack>
                <Alert icon={<IconAlertCircle size={16} />} color="blue">
                  Two-factor authentication adds an extra layer of security to your account
                </Alert>
                
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Two-Factor Authentication</Text>
                    <Text size="sm" c="dimmed">
                      Require a verification code when logging in
                    </Text>
                  </div>
                  <Switch size="lg" />
                </Group>
                
                <Button variant="outline" disabled>
                  Set Up Two-Factor Authentication
                </Button>
              </Stack>
            </Paper>
            
            <Paper withBorder p="xl" radius="md" style={{ gridColumn: '1 / -1' }}>
              <Title order={3} mb="lg">Session Management</Title>
              
              <Stack>
                <Text>You are currently logged in on 1 device</Text>
                
                <Card withBorder p="md">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Current Session</Text>
                      <Text size="sm" c="dimmed">
                        Started: {new Date().toLocaleString()}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Device: {navigator.userAgent}
                      </Text>
                    </div>
                    <Button variant="subtle" color="red" disabled>
                      This Device
                    </Button>
                  </Group>
                </Card>
                
                <Button color="red" variant="outline">
                  Log Out of All Other Devices
                </Button>
              </Stack>
            </Paper>
          </SimpleGrid>
        </Tabs.Panel>

        <Tabs.Panel value="api">
          <Paper withBorder p="xl" radius="md">
            <Title order={3} mb="md">API Keys</Title>
            <Text c="dimmed" mb="lg">
              Manage API keys for accessing Data Whisperer programmatically
            </Text>
            
            <Alert icon={<IconAlertCircle size={16} />} color="yellow" mb="lg">
              API keys provide full access to your account. Keep them secure and never share them.
            </Alert>
            
            <Stack>
              {apiKeys.map((key) => (
                <Card key={key.id} withBorder p="md">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>{key.name}</Text>
                      <Text size="sm" c="dimmed">
                        Created: {key.created} • Last used: {key.lastUsed}
                      </Text>
                    </div>
                    <Group>
                      <Button variant="subtle" size="xs">
                        View Key
                      </Button>
                      <Button 
                        variant="subtle" 
                        color="red" 
                        size="xs"
                        onClick={() => handleDeleteApiKey(key.id)}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Group>
                </Card>
              ))}
              
              <Button 
                leftSection={<IconKey size={16} />}
                onClick={handleCreateApiKey}
              >
                Create New API Key
              </Button>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
} 
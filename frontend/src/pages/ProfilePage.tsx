import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Avatar,
  Button,
  TextInput,
  Stack,
  Divider,
  Select,
  Tabs,
  Badge,
  Card,
  SimpleGrid,
  ThemeIcon,
  ActionIcon,
  Tooltip,
  Box,
  FileButton,
  Image,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconUser,
  IconMail,
  IconBuildingSkyscraper,
  IconSettings,
  IconBell,
  IconLock,
  IconDeviceAnalytics,
  IconUpload,
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconChartBar,
  IconDatabase,
  IconArrowsTransferUp,
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  // Recent activity data (mock)
  const recentActivity = [
    { 
      type: 'dataset', 
      action: 'uploaded', 
      name: 'Customer Transactions', 
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
      icon: <IconDatabase size={16} />
    },
    { 
      type: 'workflow', 
      action: 'created', 
      name: 'Data Cleaning Pipeline', 
      date: new Date(Date.now() - 8 * 60 * 60 * 1000).toLocaleString(),
      icon: <IconArrowsTransferUp size={16} />
    },
    { 
      type: 'visualization', 
      action: 'generated', 
      name: 'Sales Performance Dashboard', 
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString(),
      icon: <IconChartBar size={16} />
    },
  ];

  // Form for profile editing
  const form = useForm({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      organization: user?.organization?.name || '',
      bio: user?.bio || '',
      jobTitle: user?.jobTitle || '',
      github: user?.socialLinks?.github || '',
      linkedin: user?.socialLinks?.linkedin || '',
      twitter: user?.socialLinks?.twitter || '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      setAvatarFile(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewAvatar(imageUrl);
    }
  };

  const handleSaveProfile = async (values: typeof form.values) => {
    try {
      // In a real app, you would upload the avatar file to a server
      // and get back a URL to the uploaded image
      let avatarUrl = user?.avatar;
      if (avatarFile && previewAvatar) {
        // Mock avatar upload - in a real app, this would be an API call
        avatarUrl = previewAvatar;
      }

      // Update user profile
      await updateUser({
        name: values.name,
        email: values.email,
        avatar: avatarUrl,
        bio: values.bio,
        jobTitle: values.jobTitle,
        socialLinks: {
          github: values.github,
          linkedin: values.linkedin,
          twitter: values.twitter,
        },
      });

      notifications.show({
        title: 'Profile updated',
        message: 'Your profile has been successfully updated',
        color: 'green',
      });

      setIsEditing(false);
      
      // Clean up object URL to avoid memory leaks
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar);
        setPreviewAvatar(null);
      }
    } catch (error) {
      notifications.show({
        title: 'Update failed',
        message: 'Failed to update profile. Please try again.',
        color: 'red',
      });
    }
  };

  const handleCancelEdit = () => {
    form.reset();
    setIsEditing(false);
    if (previewAvatar) {
      URL.revokeObjectURL(previewAvatar);
      setPreviewAvatar(null);
    }
    setAvatarFile(null);
  };

  return (
    <Container size="xl" py="xl">
      <Paper radius="md" p="xl" withBorder mb="xl">
        <Group justify="space-between" mb="xl">
          <Group>
            <Avatar 
              src={previewAvatar || user?.avatar} 
              size={120} 
              radius={120}
              color="blue"
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <div>
              <Title order={2}>{user?.name}</Title>
              <Text c="dimmed">{user?.email}</Text>
              <Group mt="xs">
                <Badge color="blue">{user?.role}</Badge>
                {user?.organization && (
                  <Badge color="teal">{user?.organization.name}</Badge>
                )}
              </Group>
            </div>
          </Group>
          {!isEditing ? (
            <Button 
              leftSection={<IconEdit size={16} />} 
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Group>
              <Button 
                variant="outline" 
                color="red" 
                leftSection={<IconX size={16} />}
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button 
                leftSection={<IconCheck size={16} />}
                onClick={() => form.onSubmit(handleSaveProfile)()}
              >
                Save Changes
              </Button>
            </Group>
          )}
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="md">
            <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
              Profile
            </Tabs.Tab>
            <Tabs.Tab value="activity" leftSection={<IconDeviceAnalytics size={16} />}>
              Activity
            </Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
              Settings
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile">
            {isEditing ? (
              <form onSubmit={form.onSubmit(handleSaveProfile)}>
                <Stack>
                  <Group align="flex-start">
                    <Box style={{ width: 120, textAlign: 'center' }}>
                      <Avatar 
                        src={previewAvatar || user?.avatar} 
                        size={120} 
                        radius={120}
                        mb="xs"
                        color="blue"
                      >
                        {user?.name?.charAt(0) || 'U'}
                      </Avatar>
                      <FileButton onChange={handleAvatarChange} accept="image/png,image/jpeg">
                        {(props) => (
                          <Button 
                            variant="subtle" 
                            size="xs" 
                            leftSection={<IconUpload size={14} />}
                            {...props}
                          >
                            Change
                          </Button>
                        )}
                      </FileButton>
                    </Box>
                    <Stack style={{ flex: 1 }}>
                      <TextInput
                        label="Name"
                        placeholder="Your name"
                        leftSection={<IconUser size={16} />}
                        {...form.getInputProps('name')}
                      />
                      <TextInput
                        label="Email"
                        placeholder="your@email.com"
                        leftSection={<IconMail size={16} />}
                        {...form.getInputProps('email')}
                      />
                      <TextInput
                        label="Job Title"
                        placeholder="Your job title"
                        leftSection={<IconBuildingSkyscraper size={16} />}
                        {...form.getInputProps('jobTitle')}
                      />
                      <TextInput
                        label="Organization"
                        placeholder="Your organization"
                        leftSection={<IconBuildingSkyscraper size={16} />}
                        {...form.getInputProps('organization')}
                        disabled
                      />
                    </Stack>
                  </Group>

                  <Divider my="md" label="About" labelPosition="center" />

                  <TextInput
                    label="Bio"
                    placeholder="Tell us about yourself"
                    {...form.getInputProps('bio')}
                  />

                  <Divider my="md" label="Social Links" labelPosition="center" />

                  <TextInput
                    label="GitHub"
                    placeholder="Your GitHub profile URL"
                    leftSection={<IconBrandGithub size={16} />}
                    {...form.getInputProps('github')}
                  />
                  <TextInput
                    label="LinkedIn"
                    placeholder="Your LinkedIn profile URL"
                    leftSection={<IconBrandLinkedin size={16} />}
                    {...form.getInputProps('linkedin')}
                  />
                  <TextInput
                    label="Twitter"
                    placeholder="Your Twitter profile URL"
                    leftSection={<IconBrandTwitter size={16} />}
                    {...form.getInputProps('twitter')}
                  />
                </Stack>
              </form>
            ) : (
              <Stack>
                <Group align="flex-start">
                  <Stack style={{ flex: 1 }}>
                    <Group>
                      <IconUser size={16} />
                      <Text fw={500}>Name:</Text>
                      <Text>{user?.name}</Text>
                    </Group>
                    <Group>
                      <IconMail size={16} />
                      <Text fw={500}>Email:</Text>
                      <Text>{user?.email}</Text>
                    </Group>
                    <Group>
                      <IconBuildingSkyscraper size={16} />
                      <Text fw={500}>Organization:</Text>
                      <Text>{user?.organization?.name || 'Not specified'}</Text>
                    </Group>
                    <Group>
                      <IconBuildingSkyscraper size={16} />
                      <Text fw={500}>Job Title:</Text>
                      <Text>{user?.jobTitle || 'Not specified'}</Text>
                    </Group>
                  </Stack>
                </Group>

                <Divider my="md" label="About" labelPosition="center" />

                <Text>
                  {user?.bio || 'No bio provided. Edit your profile to add a bio.'}
                </Text>

                <Divider my="md" label="Social Links" labelPosition="center" />

                <Group>
                  {user?.socialLinks?.github && (
                    <Button 
                      variant="subtle" 
                      leftSection={<IconBrandGithub size={16} />}
                      component="a"
                      href={user.socialLinks.github}
                      target="_blank"
                    >
                      GitHub
                    </Button>
                  )}
                  {user?.socialLinks?.linkedin && (
                    <Button 
                      variant="subtle" 
                      leftSection={<IconBrandLinkedin size={16} />}
                      component="a"
                      href={user.socialLinks.linkedin}
                      target="_blank"
                    >
                      LinkedIn
                    </Button>
                  )}
                  {user?.socialLinks?.twitter && (
                    <Button 
                      variant="subtle" 
                      leftSection={<IconBrandTwitter size={16} />}
                      component="a"
                      href={user.socialLinks.twitter}
                      target="_blank"
                    >
                      Twitter
                    </Button>
                  )}
                  {!user?.socialLinks?.github && !user?.socialLinks?.linkedin && !user?.socialLinks?.twitter && (
                    <Text c="dimmed">No social links provided. Edit your profile to add links.</Text>
                  )}
                </Group>
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="activity">
            <Title order={3} mb="md">Recent Activity</Title>
            <Stack>
              {recentActivity.map((activity, index) => (
                <Card key={index} withBorder p="md">
                  <Group>
                    <ThemeIcon color="blue" variant="light">
                      {activity.icon}
                    </ThemeIcon>
                    <div style={{ flex: 1 }}>
                      <Text>
                        You {activity.action} {activity.type} "{activity.name}"
                      </Text>
                      <Text size="xs" c="dimmed">
                        {activity.date}
                      </Text>
                    </div>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="settings">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Card withBorder p="lg">
                <Title order={4} mb="md">Notification Settings</Title>
                <Stack>
                  <Group justify="space-between">
                    <Text>Email Notifications</Text>
                    <Button variant="subtle" leftSection={<IconBell size={16} />}>
                      Configure
                    </Button>
                  </Group>
                  <Group justify="space-between">
                    <Text>In-App Notifications</Text>
                    <Button variant="subtle" leftSection={<IconBell size={16} />}>
                      Configure
                    </Button>
                  </Group>
                </Stack>
              </Card>

              <Card withBorder p="lg">
                <Title order={4} mb="md">Security</Title>
                <Stack>
                  <Group justify="space-between">
                    <Text>Change Password</Text>
                    <Button variant="subtle" leftSection={<IconLock size={16} />}>
                      Update
                    </Button>
                  </Group>
                  <Group justify="space-between">
                    <Text>Two-Factor Authentication</Text>
                    <Button variant="subtle" leftSection={<IconLock size={16} />}>
                      Enable
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </SimpleGrid>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
} 
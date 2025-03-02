import { useState } from 'react';
import {
  Group,
  Button,
  Text,
  Menu,
  ActionIcon,
  rem,
  Box,
  Burger,
  useMantineColorScheme,
  Avatar,
  Divider,
  UnstyledButton,
  Tooltip,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconBrain,
  IconUser,
  IconSettings,
  IconLogout,
  IconMoonStars,
  IconSun,
  IconHelp,
  IconBuildingSkyscraper,
  IconChevronDown,
  IconBook,
  IconQuestionMark,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick?: () => void;
  onAIHelperOpen?: () => void;
}

export function Header({ onMenuClick, onAIHelperOpen }: HeaderProps) {
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout, isAuthenticated, setCurrentOrganization } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleColorScheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <Box
      p="md"
      style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Group>
        {isMobile && (
          <Burger
            opened={opened}
            onClick={() => {
              setOpened(!opened);
              onMenuClick?.();
            }}
            size="sm"
          />
        )}
        <Group gap={8} align="center">
          <IconBrain size={24} style={{ color: 'var(--mantine-color-blue-6)' }} />
          <Text fw={700} size="lg">Data Whisperer</Text>
        </Group>
      </Group>

      <Group>
        {!isMobile && (
          <Button 
            variant="subtle" 
            leftSection={<IconHelp size={16} />}
            onClick={() => navigate('/help')}
          >
            Help Center
          </Button>
        )}
        
        {isAuthenticated && user?.organization && (
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <UnstyledButton
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  ':hover': {
                    backgroundColor: 'var(--mantine-color-gray-0)',
                  },
                }}
              >
                <IconBuildingSkyscraper size={16} />
                <Text size="sm" fw={500}>{user.organization.name}</Text>
                <IconChevronDown size={14} />
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Switch Organization</Menu.Label>
              {/* This would be dynamic in a real app */}
              <Menu.Item onClick={() => setCurrentOrganization('1')}>
                Data Science Team
              </Menu.Item>
              <Menu.Item onClick={() => setCurrentOrganization('2')}>
                Research Group
              </Menu.Item>
              <Divider />
              <Menu.Item onClick={() => navigate('/organizations')}>
                Manage Organizations
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}

        <Tooltip label="AI Assistant">
          <ActionIcon
            variant="light"
            color="grape"
            onClick={onAIHelperOpen}
            title="AI Assistant"
          >
            <IconBrain size={20} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Toggle theme">
          <ActionIcon
            variant="light"
            color={isDark ? 'yellow' : 'blue'}
            onClick={toggleColorScheme}
            title="Toggle color scheme"
          >
            {isDark ? <IconSun size={20} /> : <IconMoonStars size={20} />}
          </ActionIcon>
        </Tooltip>

        {isMobile && (
          <Tooltip label="Help Center">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => navigate('/help')}
            >
              <IconQuestionMark size={20} />
            </ActionIcon>
          </Tooltip>
        )}

        {isAuthenticated ? (
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <UnstyledButton style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Avatar 
                  src={user?.avatar} 
                  radius="xl" 
                  size="sm"
                  color="blue"
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                {!isMobile && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Text size="sm" fw={500}>{user?.name || 'User'}</Text>
                    <Text size="xs" c="dimmed">{user?.role || 'User'}</Text>
                  </div>
                )}
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item
                leftSection={<IconUser size={14} />}
                onClick={() => navigate('/profile')}
              >
                Profile
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                onClick={() => navigate('/settings')}
              >
                Settings
              </Menu.Item>
              <Menu.Item
                leftSection={isDark ? <IconSun size={14} /> : <IconMoonStars size={14} />}
                onClick={toggleColorScheme}
              >
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Menu.Item>

              <Menu.Divider />

              <Menu.Label>Help</Menu.Label>
              <Menu.Item
                leftSection={<IconHelp size={14} />}
                onClick={() => navigate('/help')}
              >
                Help Center
              </Menu.Item>
              <Menu.Item
                leftSection={<IconBook size={14} />}
                onClick={() => window.open('https://docs.datawhisperer.app', '_blank')}
              >
                Documentation
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Group>
            <Button variant="subtle" onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button onClick={() => navigate('/register')}>
              Sign up
            </Button>
          </Group>
        )}
      </Group>
    </Box>
  );
} 
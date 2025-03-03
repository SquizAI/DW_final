import React, { useState } from 'react';
import { Stack, NavLink, Text, Box, Group, ThemeIcon, Badge, Divider, ScrollArea, UnstyledButton, Collapse, rem } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  IconDashboard,
  IconUpload,
  IconPlugConnected,
  IconWand,
  IconChartHistogram,
  IconCode,
  IconChartBar,
  IconStars,
  IconChartPie,
  IconRobot,
  IconDownload,
  IconFileAnalytics,
  IconAdjustments,
  IconSettings,
  IconBrandOpenai,
  IconArrowsTransferUp,
  IconChevronRight,
  IconDatabase,
  IconBug,
} from '@tabler/icons-react';

const NAVIGATION = [
  {
    label: 'NAVIGATION',
    items: [
      { 
        id: 'dashboard', 
        label: 'Dashboard',
        description: 'Overview and quick actions',
        icon: IconDashboard, 
        path: '/dashboard',
        color: 'blue'
      },
      { 
        id: 'workflow-builder', 
        label: 'Workflow Builder',
        description: 'Create and manage workflows',
        icon: IconArrowsTransferUp,
        path: '/workflow',
        badge: 'Beta',
        color: 'grape'
      },
      { 
        id: 'data-management', 
        label: 'Data Management',
        description: 'Upload and manage your datasets',
        icon: IconDatabase, 
        path: '/data/management',
        color: 'teal'
      },
      { 
        id: 'data-integration', 
        label: 'Data Integration',
        description: 'Connect to external data sources',
        icon: IconPlugConnected, 
        path: '/data/integration',
        color: 'grape'
      },
      { 
        id: 'kaggle-manager', 
        label: 'Kaggle Manager',
        description: 'Search and import Kaggle datasets',
        icon: IconDatabase, 
        path: '/kaggle/manager',
        color: 'blue'
      },
      { 
        id: 'code-notebook', 
        label: 'Code Notebook',
        description: 'Write and execute code',
        icon: IconCode, 
        path: '/notebook',
        badge: 'New',
        color: 'indigo'
      },
    ]
  },
  {
    label: 'DATA PREPARATION',
    items: [
      { 
        id: 'data-wrangling', 
        label: 'Data Wrangling',
        description: 'Clean and preprocess data',
        icon: IconWand, 
        path: '/data/wrangling',
        color: 'violet'
      },
      { 
        id: 'data-binning', 
        label: 'Data Binning',
        description: 'Discretize continuous variables',
        icon: IconChartHistogram, 
        path: '/data/binning',
        color: 'indigo'
      },
      { 
        id: 'data-organization', 
        label: 'Dataset Organization',
        description: 'Organize and catalog datasets',
        icon: IconDatabase, 
        path: '/data/organization',
        badge: 'New',
        color: 'blue'
      },
    ]
  },
  {
    label: 'FEATURE ENGINEERING',
    items: [
      { 
        id: 'feature-engineering', 
        label: 'Feature Engineering',
        description: 'Create and transform features',
        icon: IconCode, 
        path: '/features/engineering',
        color: 'cyan'
      },
      { 
        id: 'feature-importance', 
        label: 'Feature Importance',
        description: 'Analyze feature relevance',
        icon: IconStars, 
        path: '/features/importance',
        color: 'yellow'
      },
    ]
  },
  {
    label: 'ANALYSIS & INSIGHTS',
    items: [
      { 
        id: 'analysis', 
        label: 'Data Analysis',
        description: 'Analyze and explore data',
        icon: IconChartBar, 
        path: '/analysis/explore',
        color: 'orange'
      },
      { 
        id: 'visualizations', 
        label: 'Visualizations',
        description: 'Create data visualizations',
        icon: IconChartPie, 
        path: '/analysis/visualize',
        color: 'pink'
      },
      { 
        id: 'ai-insights', 
        label: 'AI Insights',
        description: 'AI-powered data analysis',
        icon: IconRobot, 
        path: '/analysis/ai',
        badge: 'New',
        color: 'green'
      },
    ]
  },
  {
    label: 'AUTOMATION',
    items: [
      { 
        id: 'classification', 
        label: 'Classification',
        description: 'Binary classification & resampling',
        icon: IconAdjustments, 
        path: '/automation/classify',
        color: 'grape'
      },
      { 
        id: 'agentic-topology-demo', 
        label: 'Agentic Topology Demo',
        description: 'Experience intelligent workflow orchestration',
        icon: IconRobot, 
        path: '/demo/agentic-topology',
        badge: 'New',
        color: 'blue'
      },
    ]
  },
  {
    label: 'EXPORT',
    items: [
      { 
        id: 'data-export', 
        label: 'Data Export',
        description: 'Export processed data',
        icon: IconDownload, 
        path: '/export/data',
        color: 'teal'
      },
      { 
        id: 'final-report', 
        label: 'Final Report',
        description: 'Generate comprehensive report',
        icon: IconFileAnalytics, 
        path: '/export/report',
        color: 'violet'
      },
    ]
  },
];

interface NavbarLinkProps {
  icon: typeof IconArrowsTransferUp;
  label: string;
  link?: string;
  links?: { label: string; link: string }[];
  initiallyOpened?: boolean;
}

function NavbarLink({ icon: Icon, label, link, links, initiallyOpened }: NavbarLinkProps) {
  const [opened, setOpened] = useState(initiallyOpened);
  const hasLinks = Array.isArray(links);

  const NavButton = (
    <UnstyledButton
      component={link ? NavLink : 'button'}
      to={link}
      onClick={() => setOpened((o) => !o)}
      styles={{
        root: {
          display: 'block',
          width: '100%',
          padding: `${rem(8)} ${rem(12)}`,
          borderRadius: 'var(--mantine-radius-sm)',
          color: 'var(--mantine-color-gray-7)',
          '&:hover': {
            backgroundColor: 'var(--mantine-color-gray-0)',
          },
          '&[data-active="true"]': {
            backgroundColor: 'var(--mantine-color-blue-light)',
          },
        },
      }}
    >
      <Group justify="space-between" gap={0}>
        <Group gap="sm">
          <ThemeIcon size="lg" variant="light">
            <Icon style={{ width: rem(20), height: rem(20) }} />
          </ThemeIcon>
          <Text size="sm">{label}</Text>
        </Group>
        {hasLinks && (
          <IconChevronRight
            style={{
              width: rem(16),
              height: rem(16),
              transform: opened ? 'rotate(90deg)' : 'none',
              transition: 'transform 200ms ease',
            }}
          />
        )}
      </Group>
    </UnstyledButton>
  );

  if (hasLinks) {
    return (
      <>
        {NavButton}
        <Collapse in={opened}>
          <Stack gap={4} ml={32} mt={4}>
            {links.map((link) => (
              <UnstyledButton
                key={link.label}
                component={NavLink}
                to={link.link}
                styles={{
                  root: {
                    display: 'block',
                    padding: `${rem(8)} ${rem(12)}`,
                    borderRadius: 'var(--mantine-radius-sm)',
                    color: 'var(--mantine-color-gray-7)',
                    fontSize: 'var(--mantine-font-size-sm)',
                    '&:hover': {
                      backgroundColor: 'var(--mantine-color-gray-0)',
                    },
                    '&[data-active="true"]': {
                      backgroundColor: 'var(--mantine-color-blue-light)',
                    },
                  },
                }}
              >
                {link.label}
              </UnstyledButton>
            ))}
          </Stack>
        </Collapse>
      </>
    );
  }

  return NavButton;
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <ScrollArea h="100%">
      <Stack h="100%" spacing={0}>
        {/* Logo */}
        <Box py="md" px="md" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <Group>
            <ThemeIcon size="xl" radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
              <IconBrandOpenai size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
              Data Whisperer
            </Text>
          </Group>
        </Box>

        <Divider />

        {/* Navigation Items */}
        <Stack spacing={0} p="md">
          {NAVIGATION.map((section) => (
            <Box key={section.label}>
              <Text size="xs" fw={500} c="dimmed" mb="xs">
                {section.label}
              </Text>
              
              <Stack spacing="xs" mb="md">
                {section.items.map((item) => (
                  <NavLink
                    key={item.id}
                    active={location.pathname.startsWith(item.path)}
                    label={item.label}
                    description={item.description}
                    onClick={() => navigate(item.path)}
                    leftSection={
                      <ThemeIcon 
                        size="lg" 
                        variant="transparent"
                        c={`var(--mantine-color-${item.color}-filled)`}
                      >
                        <item.icon size="1.2rem" stroke={2.5} />
                      </ThemeIcon>
                    }
                    rightSection={
                      item.badge && (
                        <Badge size="sm" variant="gradient" gradient={{ from: item.color, to: `${item.color}.4` }}>
                          {item.badge}
                        </Badge>
                      )
                    }
                    styles={{
                      root: {
                        '&[data-active="true"]': {
                          backgroundColor: `var(--mantine-color-${item.color}-1)`,
                          color: `var(--mantine-color-${item.color}-filled)`,
                        },
                        '&:hover': {
                          backgroundColor: `var(--mantine-color-${item.color}-0)`,
                        },
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </ScrollArea>
  );
} 
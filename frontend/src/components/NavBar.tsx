import React from 'react';
import { Stack, Text, Box, Group, ThemeIcon } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  IconDashboard,
  IconDatabase,
  IconShare2,
  IconBrush,
  IconBinaryTree,
  IconFunction,
  IconChartBar,
  IconChartDots,
  IconChartLine,
  IconRobot,
  IconChartHistogram,
  IconDownload,
  IconFileReport,
  IconSettings,
  IconGitBranch,
} from '@tabler/icons-react';

const menuItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard',
    description: 'Overview and quick actions',
    icon: IconDashboard,
    color: 'blue',
    path: '/' 
  },
  {
    id: 'workflow-builder',
    label: 'Workflow Builder',
    description: 'Build and automate data workflows',
    icon: IconGitBranch,
    color: 'violet',
    path: '/workflow',
    badge: 'New'
  },
  { 
    id: 'data-upload', 
    label: 'Data Upload',
    description: 'Upload and manage datasets',
    icon: IconDatabase,
    color: 'cyan',
    path: '/data-upload' 
  },
  { 
    id: 'data-integration', 
    label: 'Data Integration',
    description: 'Connect to external data sources',
    icon: IconShare2,
    color: 'teal',
    path: '/data-integration' 
  },
  { 
    id: 'data-wrangling', 
    label: 'Data Wrangling',
    description: 'Clean and preprocess data',
    icon: IconBrush,
    color: 'green',
    path: '/data-wrangling' 
  },
  { 
    id: 'data-binning', 
    label: 'Data Binning',
    description: 'Discretize continuous variables',
    icon: IconBinaryTree,
    color: 'lime',
    path: '/data-binning' 
  },
  { 
    id: 'feature-engineering', 
    label: 'Feature Engineering',
    description: 'Create and transform features',
    icon: IconFunction,
    color: 'yellow',
    path: '/feature-engineering' 
  },
  { 
    id: 'analysis', 
    label: 'Data Analysis',
    description: 'Analyze and explore data',
    icon: IconChartBar,
    color: 'orange',
    path: '/analysis' 
  },
  { 
    id: 'feature-importance', 
    label: 'Feature Importance',
    description: 'Analyze feature relevance',
    icon: IconChartDots,
    color: 'red',
    path: '/feature-importance' 
  },
  { 
    id: 'visualizations', 
    label: 'Visualizations',
    description: 'Create data visualizations',
    icon: IconChartLine,
    color: 'pink',
    path: '/visualizations' 
  },
  { 
    id: 'ai-insights', 
    label: 'AI Insights',
    description: 'AI-powered data analysis',
    icon: IconRobot,
    color: 'grape',
    path: '/ai-insights',
    badge: 'New'
  },
  { 
    id: 'classification', 
    label: 'Classification',
    description: 'Binary classification & resampling',
    icon: IconChartHistogram,
    color: 'violet',
    path: '/classification' 
  },
  { 
    id: 'data-export', 
    label: 'Data Export',
    description: 'Export processed data',
    icon: IconDownload,
    color: 'indigo',
    path: '/data-export' 
  },
  { 
    id: 'final-report', 
    label: 'Final Report',
    description: 'Generate analysis report',
    icon: IconFileReport,
    color: 'blue',
    path: '/final-report' 
  },
  { 
    id: 'settings', 
    label: 'Settings',
    description: 'Configure your workspace',
    icon: IconSettings,
    color: 'gray',
    path: '/settings' 
  },
];

export function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="m-45252eee mantine-AppShell-navbar" data-with-border="true">
      <Stack h="100%" className="m-6d731127" style={{ '--stack-gap': 'var(--mantine-spacing-md)' } as any}>
        <div>
          <Text 
            size="xs" 
            className="mantine-focus-auto m-b6d8b162" 
            style={{ 
              marginBottom: 'var(--mantine-spacing-sm)',
              color: 'var(--mantine-color-dimmed)',
              fontWeight: 500,
            }}
          >
            NAVIGATION
          </Text>
          <Stack gap="xs">
            {menuItems.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: 'calc(0.625rem * var(--mantine-scale))',
                  borderRadius: 'calc(0.25rem * var(--mantine-scale))',
                  backgroundColor: location.pathname === item.path 
                    ? `var(--mantine-color-${item.color}-light)` 
                    : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(item.path)}
              >
                <Group gap="md" align="center" wrap="nowrap">
                  <ThemeIcon
                    variant={location.pathname === item.path ? 'filled' : 'light'}
                    radius="md"
                    size="lg"
                    color={item.color}
                    style={{
                      '--ti-size': 'calc(2.5rem * var(--mantine-scale))',
                      '--ti-radius': 'var(--mantine-radius-md)',
                      '--ti-bg': location.pathname === item.path 
                        ? `var(--mantine-color-${item.color}-filled)`
                        : `var(--mantine-color-${item.color}-light)`,
                      '--ti-color': location.pathname === item.path
                        ? 'var(--mantine-color-white)'
                        : `var(--mantine-color-${item.color}-light-color)`,
                    }}
                  >
                    <item.icon size={20} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text fw={500}>{item.label}</Text>
                    <Text size="sm" c="dimmed">{item.description}</Text>
                  </Stack>
                </Group>
              </div>
            ))}
          </Stack>
        </div>

        <div>
          <Group justify="space-between" px="sm">
            <Text size="sm" fw={500}>v1.0.0</Text>
            <Text size="sm" c="dimmed">Beta</Text>
          </Group>
        </div>
      </Stack>
    </nav>
  );
} 
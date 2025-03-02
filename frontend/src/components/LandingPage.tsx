import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Card,
  SimpleGrid,
  ThemeIcon,
  rem,
  Box,
} from '@mantine/core';
import {
  IconBrain,
  IconChartBar,
  IconCode,
  IconChecks,
  IconUsers,
  IconLock,
  IconArrowRight,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import MatrixBackground from './MatrixBackground';
import TypingStreetScene from './TypingStreetScene';

const FEATURES = [
  {
    title: 'AI-Powered Insights',
    description: 'Get intelligent suggestions and automated workflows powered by advanced AI',
    icon: IconBrain,
    color: 'grape',
    details: [
      'Smart data transformations',
      'Automated pattern recognition',
      'Natural language querying',
      'Predictive analytics',
    ],
  },
  {
    title: 'Visual Analytics',
    description: 'Create beautiful visualizations and interactive dashboards',
    icon: IconChartBar,
    color: 'blue',
    details: [
      'Auto-generated charts',
      'Real-time data previews',
      'Custom dashboards',
      'Export capabilities',
    ],
  },
  {
    title: 'Data Quality',
    description: 'Ensure data integrity with automated quality checks',
    icon: IconChecks,
    color: 'green',
    details: [
      'Automated validation',
      'Data profiling',
      'Anomaly detection',
      'Quality monitoring',
    ],
  },
  {
    title: 'No-Code Workflow',
    description: 'Build complex data pipelines without writing code',
    icon: IconCode,
    color: 'orange',
    details: [
      'Drag-and-drop interface',
      'Visual pipeline builder',
      'Pre-built components',
      'Custom transformations',
    ],
  },
  {
    title: 'Collaboration',
    description: 'Work together seamlessly with built-in collaboration tools',
    icon: IconUsers,
    color: 'cyan',
    details: [
      'Shared workspaces',
      'Version control',
      'Team permissions',
      'Activity tracking',
    ],
  },
  {
    title: 'Enterprise Ready',
    description: 'Built for scale with enterprise-grade security and compliance',
    icon: IconLock,
    color: 'dark',
    details: [
      'Role-based access',
      'Audit logging',
      'Data encryption',
      'SSO integration',
    ],
  },
];

export function LandingPage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(26,27,30,0.95) 0%, rgba(37,38,43,0.95) 100%)',
          padding: '80px 0',
          minHeight: '80vh',
          overflow: 'hidden',
        }}
      >
        <TypingStreetScene />
        <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
          <Stack align="center" gap="xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Title
                order={1}
                size={rem(64)}
                fw={900}
                ta="center"
                style={{
                  maxWidth: rem(900),
                  color: 'white',
                  textShadow: '0 0 10px rgba(255,255,255,0.3)',
                }}
              >
                Transform Your Data Journey with AI
              </Title>
              <Text
                size="xl"
                ta="center"
                style={{
                  maxWidth: rem(600),
                  color: '#c1c2c5',
                  margin: '2rem auto',
                }}
              >
                Build powerful data workflows, generate insights, and automate analysis with our AI-powered platform
              </Text>
              <Group justify="center" mt="xl">
                <Button
                  size="xl"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                  rightSection={<IconArrowRight size={20} />}
                >
                  Start Free Project
                </Button>
              </Group>
            </motion.div>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box style={{ padding: '100px 0', background: 'white' }}>
        <Container size="xl">
          <Stack gap={50}>
            <Stack gap="md" align="center">
              <Title order={2} size="h1" ta="center">
                Why Choose Our Platform
              </Title>
              <Text size="xl" c="dimmed" maw={800} ta="center">
                Everything you need to transform, analyze, and visualize your data in one powerful platform
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={30}>
              {FEATURES.map((feature) => (
                <motion.div
                  key={feature.title}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card
                    padding="xl"
                    radius="md"
                    withBorder
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <ThemeIcon
                      size={60}
                      radius="md"
                      variant="light"
                      color={feature.color}
                      style={{ marginBottom: '1rem' }}
                    >
                      <feature.icon size={30} />
                    </ThemeIcon>

                    <Text fw={500} size="lg" mb="sm">
                      {feature.title}
                    </Text>

                    <Text size="sm" c="dimmed" mb="md">
                      {feature.description}
                    </Text>

                    <Stack gap="sm" style={{ marginTop: 'auto' }}>
                      {feature.details.map((detail) => (
                        <Text key={detail} size="sm" c="dimmed">
                          • {detail}
                        </Text>
                      ))}
                    </Stack>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
} 
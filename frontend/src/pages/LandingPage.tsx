import { useState, useEffect, useRef, useCallback } from 'react';
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
  Paper,
  List,
  ActionIcon,
  Divider,
  Transition,
  LoadingOverlay,
  Badge,
  ScrollArea,
  Table,
  AppShell,
  Affix,
  Transition as MantineTransition,
  Burger,
  Drawer,
  NavLink,
} from '@mantine/core';
import {
  IconBrain,
  IconWand,
  IconChartBar,
  IconTable,
  IconCode,
  IconRobot,
  IconDatabase,
  IconFileAnalytics,
  IconArrowRight,
  IconChecks,
  IconUsers,
  IconShare,
  IconLock,
  IconCloud,
  IconBrandOpenai,
  IconBrandTwitter,
  IconBrandGithub,
  IconBrandLinkedin,
  IconDownload,
  IconUpload,
  IconArrowUp,
  IconMenu2,
  IconChartDots,
  IconBox,
  IconDeviceAnalytics,
  IconExternalLink,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import MatrixBackground from '../components/MatrixBackground';
import { useIntersection, useWindowScroll, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import api from '../api';

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

const USE_CASES = [
  {
    title: 'Customer Analytics',
    description: 'Analyze customer behavior and create targeted segments',
    icon: IconUsers,
    color: 'blue',
  },
  {
    title: 'Sales Forecasting',
    description: 'Predict future trends and optimize inventory',
    icon: IconFileAnalytics,
    color: 'green',
  },
  {
    title: 'Data Integration',
    description: 'Connect and transform data from multiple sources',
    icon: IconDatabase,
    color: 'grape',
  },
  {
    title: 'Automated Reporting',
    description: 'Generate and schedule custom reports',
    icon: IconShare,
    color: 'orange',
  },
];

const DATA_SOURCES = [
  {
    title: 'Upload Files',
    description: 'Upload your CSV, Excel, or JSON files directly',
    icon: IconUpload,
    color: 'blue',
    action: '/upload'
  },
  {
    title: 'Connect to Kaggle',
    description: 'Import datasets from Kaggle\'s extensive collection',
    icon: IconBrandGithub,
    color: 'grape',
    action: '/data/integration'
  },
  {
    title: 'Database Connection',
    description: 'Connect to your SQL, MongoDB, or other databases',
    icon: IconDatabase,
    color: 'green',
    action: '/data/integration'
  },
  {
    title: 'Cloud Storage',
    description: 'Import from AWS S3, Google Cloud, or Azure',
    icon: IconCloud,
    color: 'orange',
    action: '/data/integration'
  }
];

// Animation variants for features
const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Throttle function to limit how often a function can be called
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  return function(this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Enhanced smooth scroll function with fallback
const enhancedSmoothScrollTo = (targetY: number, duration: number) => {
  // Try to use our custom smooth scroll first
  try {
    const startY = window.scrollY;
    const difference = targetY - startY;
    const startTime = performance.now();

    // Early return if the distance is very small
    if (Math.abs(difference) < 10) {
      window.scrollTo({ top: targetY });
      return;
    }

    const step = () => {
      const currentTime = performance.now();
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeInOutCubic = (p: number): number => {
        return p < 0.5
          ? 4 * p * p * p
          : 1 - Math.pow(-2 * p + 2, 3) / 2;
      };
      
      window.scrollTo({
        top: startY + difference * easeInOutCubic(progress),
      });
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        // Final adjustment to ensure we hit the target exactly
        setTimeout(() => {
          window.scrollTo({ top: targetY });
        }, 50);
      }
    };
    
    window.requestAnimationFrame(step);
  } catch (error) {
    // Fallback to simpler method if the animation fails
    console.error("Smooth scroll failed, using fallback", error);
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }
};

// Define section IDs type
type SectionIds = 'hero' | 'features' | 'use-cases' | 'data-integration' | 'cta';

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    datasets: 0,
    insights: 0
  });
  
  // References for scroll sections
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const useCasesRef = useRef<HTMLDivElement>(null);
  const dataIntegrationRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  // Track active section for highlighting in navigation
  const [activeSection, setActiveSection] = useState<SectionIds>('hero');
  
  // Scroll position for back-to-top button
  const [scroll, scrollTo] = useWindowScroll();
  
  // Mobile menu state
  const [mobileMenuOpened, { open: openMobileMenu, close: closeMobileMenu }] = useDisclosure(false);

  // Intersection observer for animations
  const { ref: intersectionRef, entry: featuresEntry } = useIntersection({
    threshold: 0.2,
  });

  // Connect the intersection observer to the features section
  useEffect(() => {
    if (featuresRef.current) {
      intersectionRef(featuresRef.current);
    }
  }, [intersectionRef]);

  useEffect(() => {
    // Use mock data for stats since the backend doesn't have a stats endpoint
    setStats({
      users: 1250,
      datasets: 156,
      insights: 3427
    });
    
    // Commented out the API call since the endpoint doesn't exist
    // const fetchStats = async () => {
    //   try {
    //     const response = await api.get('/stats');
    //     if (response.status === 200) {
    //       setStats(response.data);
    //     }
    //   } catch (error) {
    //     console.error('Failed to fetch stats:', error);
    //   }
    // };
    // 
    // fetchStats();
  }, []);

  // Track which section is currently visible - with throttling for performance
  const determineActiveSection = useCallback(() => {
    const scrollPosition = window.scrollY + 100; // Adding offset for better detection
    
    // Get positions accounting for scroll position
    const heroPosition = heroRef.current?.offsetTop || 0;
    const featuresPosition = featuresRef.current?.offsetTop || 0;
    const useCasesPosition = useCasesRef.current?.offsetTop || 0;
    const dataIntegrationPosition = dataIntegrationRef.current?.offsetTop || 0;
    const ctaPosition = ctaRef.current?.offsetTop || 0;
    
    if (scrollPosition >= ctaPosition) {
      setActiveSection('cta');
    } else if (scrollPosition >= dataIntegrationPosition) {
      setActiveSection('data-integration');
    } else if (scrollPosition >= useCasesPosition) {
      setActiveSection('use-cases');
    } else if (scrollPosition >= featuresPosition) {
      setActiveSection('features');
    } else {
      setActiveSection('hero');
    }
  }, []);
  
  // Throttled version for better performance
  const throttledDetermineActiveSection = useCallback(
    throttle(determineActiveSection, 200),
    [determineActiveSection]
  );
  
  // Add scroll event listener to track active section
  useEffect(() => {
    window.addEventListener('scroll', throttledDetermineActiveSection);
    return () => {
      window.removeEventListener('scroll', throttledDetermineActiveSection);
    };
  }, [throttledDetermineActiveSection]);

  // Function to scroll to a section
  const scrollToSection = (sectionId: SectionIds) => {
    const element = sectionRefs[sectionId]?.current;
    if (!element) return;
    
    // Close mobile menu if open
    if (mobileMenuOpened) {
      closeMobileMenu();
    }
    
    const navbarOffset = 70; // Height of the fixed navbar
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - navbarOffset;
    
    // Update the active section
    setActiveSection(sectionId);
    
    // Update the URL without causing page jump
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `#${sectionId}`);
    }
    
    // Use our enhanced smooth scroll with a slightly longer duration for smoother effect
    enhancedSmoothScrollTo(offsetPosition, 1000);
  };

  // Implement scroll on page load if URL has a hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Remove the # character
      const sectionIdFromHash = hash.substring(1);
      
      // Handle each section ID explicitly for type safety
      switch (sectionIdFromHash) {
        case 'hero':
          setTimeout(() => scrollToSection('hero'), 500);
          break;
        case 'features':
          setTimeout(() => scrollToSection('features'), 500);
          break;
        case 'use-cases':
          setTimeout(() => scrollToSection('use-cases'), 500);
          break;
        case 'data-integration':
          setTimeout(() => scrollToSection('data-integration'), 500);
          break;
        case 'cta':
          setTimeout(() => scrollToSection('cta'), 500);
          break;
        default:
          // Default to hero section if the hash doesn't match any section
          setTimeout(() => scrollToSection('hero'), 500);
      }
    }
  }, []);

  const handleGetStarted = async () => {
    navigate('/upload');
  };

  // Create a mapping of section IDs to their refs
  const sectionRefs: Record<SectionIds, React.RefObject<HTMLDivElement>> = {
    'hero': heroRef,
    'features': featuresRef,
    'use-cases': useCasesRef,
    'data-integration': dataIntegrationRef,
    'cta': ctaRef
  };

  return (
    <Box style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
      
      {/* Fixed Navigation Header */}
      <Box
        component="header"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 70,
          backdropFilter: 'blur(10px)', 
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
        }}
      >
        <Container size="xl">
          <Group justify="space-between" h="100%">
            <Group>
              <ThemeIcon 
                size="lg" 
                variant="gradient" 
                gradient={{ from: 'blue', to: 'cyan' }}
                style={{ cursor: 'pointer' }}
                onClick={() => scrollToSection('hero')}
              >
                <IconBrain size={20} />
              </ThemeIcon>
              <Text fw={700} size="lg" c="white" style={{ cursor: 'pointer' }} onClick={() => scrollToSection('hero')}>
                Data Whisperer
              </Text>
            </Group>
            
            {/* Desktop Navigation */}
            <Group gap={30} visibleFrom="sm">
              <Text 
                c={activeSection === 'features' ? 'white' : 'gray.4'} 
                fw={activeSection === 'features' ? 600 : 400}
                style={{ 
                  cursor: 'pointer', 
                  borderBottom: activeSection === 'features' ? '2px solid white' : 'none',
                  paddingBottom: '3px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => scrollToSection('features')}
              >
                Features
              </Text>
              <Text 
                c={activeSection === 'use-cases' ? 'white' : 'gray.4'} 
                fw={activeSection === 'use-cases' ? 600 : 400}
                style={{ 
                  cursor: 'pointer', 
                  borderBottom: activeSection === 'use-cases' ? '2px solid white' : 'none',
                  paddingBottom: '3px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => scrollToSection('use-cases')}
              >
                Use Cases
              </Text>
              <Text 
                c={activeSection === 'data-integration' ? 'white' : 'gray.4'} 
                fw={activeSection === 'data-integration' ? 600 : 400}
                style={{ 
                  cursor: 'pointer', 
                  borderBottom: activeSection === 'data-integration' ? '2px solid white' : 'none',
                  paddingBottom: '3px',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => scrollToSection('data-integration')}
              >
                Data Integration
              </Text>
              <Button 
                variant={activeSection === 'cta' ? 'filled' : 'gradient'}
                gradient={{ from: 'blue', to: 'cyan' }}
                onClick={() => scrollToSection('cta')}
              >
                Get Started
              </Button>
            </Group>
            
            {/* Mobile menu button */}
            <Burger 
              opened={mobileMenuOpened} 
              onClick={openMobileMenu} 
              color="white" 
              hiddenFrom="sm" 
            />
          </Group>
        </Container>
      </Box>
      
      {/* Mobile Navigation Drawer */}
      <Drawer
        opened={mobileMenuOpened}
        onClose={closeMobileMenu}
        title="Navigation"
        size="sm"
        padding="xl"
      >
        <Stack>
          <NavLink
            label="Features"
            leftSection={<IconChartDots size={20} />}
            onClick={() => scrollToSection('features')}
            active={activeSection === 'features'}
          />
          <NavLink
            label="Use Cases"
            leftSection={<IconBox size={20} />}
            onClick={() => scrollToSection('use-cases')}
            active={activeSection === 'use-cases'}
          />
          <NavLink
            label="Data Integration"
            leftSection={<IconDatabase size={20} />}
            onClick={() => scrollToSection('data-integration')}
            active={activeSection === 'data-integration'}
          />
          <NavLink
            label="Get Started"
            leftSection={<IconExternalLink size={20} />}
            onClick={() => scrollToSection('cta')}
            active={activeSection === 'cta'}
          />
          <Button 
            mt="xl"
            variant="gradient" 
            gradient={{ from: 'blue', to: 'cyan' }}
            onClick={() => { scrollToSection('hero'); closeMobileMenu(); }}
          >
            Back to Top
          </Button>
        </Stack>
      </Drawer>
      
      {/* Hero Section */}
      <Box
        ref={heroRef}
        id="hero"
        style={{
          background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-grape-6) 100%)',
          minHeight: '100vh',
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '70px', // Add padding to account for fixed header
        }}
      >
        {/* Matrix Background */}
        <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.15 }}>
          <MatrixBackground />
        </Box>

        {/* Hero Content */}
        <Transition
          mounted={true}
          transition="slide-up"
          duration={1000}
          timingFunction="ease"
        >
          {(styles) => (
            <Container size="xl" style={{ position: 'relative', zIndex: 1, ...styles }}>
              <Stack align="center" gap={40}>
                <Title
                  order={1}
                  size={rem(72)}
                  fw={900}
                  ta="center"
                  style={{
                    maxWidth: rem(1000),
                    background: 'linear-gradient(to bottom, white, rgba(255,255,255,0.7))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Data Whisperer
                </Title>
                <Text
                  size={rem(24)}
                  ta="center"
                  style={{
                    maxWidth: rem(800),
                    color: 'white',
                    opacity: 0.9,
                    lineHeight: 1.6,
                  }}
                >
                  In the digital realm, most only see streams of numbers. We see the code that shapes reality. 
                  Our AI reveals the truth within your data, transforming chaos into clarity.
                </Text>
                <Group mt="xl" gap="xl">
                  <Button
                    size="xl"
                    variant="gradient"
                    gradient={{ from: 'rgba(255,255,255,0.3)', to: 'rgba(255,255,255,0.1)' }}
                    onClick={handleGetStarted}
                    rightSection={<IconArrowRight size={20} />}
                    style={{
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    Enter the System
                  </Button>
                  <Button
                    size="xl"
                    variant="subtle"
                    color="gray.0"
                    onClick={() => scrollToSection('features')}
                    rightSection={<IconWand size={20} />}
                  >
                    See the Code
                  </Button>
                </Group>

                {/* Stats */}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={30} mt={40}>
                  <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                    <Text ta="center" fz="xl" fw={700} c="white">{stats.users.toLocaleString()}</Text>
                    <Text ta="center" c="white" opacity={0.7}>Active Users</Text>
                  </Paper>
                  <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                    <Text ta="center" fz="xl" fw={700} c="white">{stats.datasets.toLocaleString()}</Text>
                    <Text ta="center" c="white" opacity={0.7}>Datasets Analyzed</Text>
                  </Paper>
                  <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                    <Text ta="center" fz="xl" fw={700} c="white">{stats.insights.toLocaleString()}</Text>
                    <Text ta="center" c="white" opacity={0.7}>Insights Generated</Text>
                  </Paper>
                </SimpleGrid>
              </Stack>
            </Container>
          )}
        </Transition>
        
        {/* Scroll Down Indicator */}
        <Box
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 5,
          }}
          onClick={() => scrollToSection('features')}
        >
          <Text c="white" size="sm" mb="xs" style={{ opacity: 0.8 }}>
            Scroll Down
          </Text>
          <Box
            style={{
              width: '30px',
              height: '50px',
              border: '2px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '15px',
              display: 'flex',
              justifyContent: 'center',
              padding: '5px 0',
            }}
          >
            <motion.div
              style={{
                width: '6px',
                height: '10px',
                backgroundColor: 'white',
                borderRadius: '3px',
                marginTop: '5px',
              }}
              animate={{ 
                y: [0, 15, 0],
                opacity: [0.8, 0.2, 0.8],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Box 
        ref={featuresRef}
        id="features"
        style={{ padding: '100px 0', background: 'white', width: '100%', position: 'relative' }}
      >
        <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.05 }}>
          <MatrixBackground />
        </Box>
        
        <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
          <Stack gap={50}>
            <Stack gap="md" align="center">
              <Title order={2} size="h1" ta="center">
                Beyond the Digital Veil
              </Title>
              <Text size="xl" c="dimmed" maw={800} ta="center">
                What if we told you that your data holds secrets beyond conventional analysis? 
                Our agents decode the patterns that others can't see, revealing insights that redefine possibility.
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={30}>
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={featureVariants}
                  initial="hidden"
                  animate={featuresEntry?.isIntersecting ? "visible" : "hidden"}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    padding="xl"
                    radius="md"
                    withBorder
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      transform: 'translateY(0)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 'var(--mantine-shadow-md)',
                      },
                    }}
                  >
                    <ThemeIcon
                      size={60}
                      radius="md"
                      variant="gradient"
                      gradient={{ from: feature.color, to: `${feature.color}.4` }}
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

                    <List spacing="sm" size="sm" c="dimmed" style={{ marginTop: 'auto' }}>
                      {feature.details.map((detail) => (
                        <List.Item key={detail}>{detail}</List.Item>
                      ))}
                    </List>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Use Cases Section */}
      <Box 
        ref={useCasesRef}
        id="use-cases"
        style={{ padding: '100px 0', background: 'var(--mantine-color-gray-0)', width: '100%' }}
      >
        <Container size="xl">
          <Stack gap={50}>
            <Stack gap="md" align="center">
              <Title order={2} size="h1" ta="center">
                Decipher Your Reality
              </Title>
              <Text size="xl" c="dimmed" maw={800} ta="center">
                Every dataset tells a story, encrypted in the language of numbers. 
                Our AI agents are the interpreters, translating complexity into clarity, chaos into strategy.
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={30}>
              {USE_CASES.map((useCase) => (
                <Paper
                  key={useCase.title}
                  p="xl"
                  radius="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 'var(--mantine-shadow-md)',
                    },
                  }}
                  onClick={() => navigate('/dashboard')}
                >
                  <Group>
                    <ThemeIcon
                      size={50}
                      radius="md"
                      variant="gradient"
                      gradient={{ from: useCase.color, to: `${useCase.color}.4` }}
                    >
                      <useCase.icon size={26} />
                    </ThemeIcon>
                    <div style={{ flex: 1 }}>
                      <Text fw={500} size="lg" mb={5}>{useCase.title}</Text>
                      <Text size="sm" c="dimmed">{useCase.description}</Text>
                    </div>
                    <ActionIcon variant="subtle" color={useCase.color}>
                      <IconArrowRight size={18} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Data Integration Section */}
      <Box 
        ref={dataIntegrationRef}
        id="data-integration"
        style={{ padding: '100px 0', background: 'white', width: '100%', position: 'relative' }}
      >
        <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.05 }}>
          <MatrixBackground />
        </Box>
        
        <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
          <Stack gap={50}>
            <Stack gap="md" align="center">
              <Title order={2} size="h1" ta="center">
                Connect Your Data
              </Title>
              <Text size="xl" c="dimmed" maw={800} ta="center">
                Choose how you want to bring your data into the system. Multiple options available to suit your needs.
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              {DATA_SOURCES.map((source) => (
                <Card
                  key={source.title}
                  shadow="sm"
                  padding="xl"
                  radius="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 200ms ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                  }}
                  onClick={() => navigate(source.action)}
                >
                  <Group align="flex-start">
                    <ThemeIcon
                      size={50}
                      radius="md"
                      variant="light"
                      color={source.color}
                    >
                      <source.icon size={26} />
                    </ThemeIcon>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Text fw={500} size="xl">{source.title}</Text>
                      <Text size="sm" c="dimmed">{source.description}</Text>
                      <Group mt="sm">
                        <Button 
                          variant="light" 
                          color={source.color}
                          rightSection={<IconArrowRight size={16} />}
                        >
                          Get Started
                        </Button>
                      </Group>
                    </Stack>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>

            {/* Quick Start Guide */}
            <Paper withBorder radius="md" p="xl" mt="xl">
              <Stack gap="md">
                <Title order={3}>Quick Start Guide</Title>
                <List>
                  <List.Item icon={
                    <ThemeIcon color="blue" size={24} radius="xl">
                      <IconUpload size={16} />
                    </ThemeIcon>
                  }>
                    <Text size="sm">Upload your data files or connect to your data source</Text>
                  </List.Item>
                  <List.Item icon={
                    <ThemeIcon color="grape" size={24} radius="xl">
                      <IconWand size={16} />
                    </ThemeIcon>
                  }>
                    <Text size="sm">Our AI will analyze your data and suggest the best workflows</Text>
                  </List.Item>
                  <List.Item icon={
                    <ThemeIcon color="green" size={24} radius="xl">
                      <IconChartBar size={16} />
                    </ThemeIcon>
                  }>
                    <Text size="sm">Get instant insights and visualizations</Text>
                  </List.Item>
                </List>
                <Button 
                  mt="md"
                  variant="light"
                  rightSection={<IconArrowRight size={16} />}
                  onClick={() => navigate('/upload')}
                >
                  Start Uploading Data
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section with Matrix Background */}
      <Box 
        ref={ctaRef}
        id="cta"
        style={{ padding: '100px 0', background: 'white', width: '100%', position: 'relative' }}
      >
        <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.05 }}>
          <MatrixBackground />
        </Box>
        
        <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
          <Paper
            radius="lg"
            p={50}
            style={{
              background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-grape-6) 100%)',
              border: '1px solid var(--mantine-color-gray-2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1 }}>
              <MatrixBackground />
            </Box>
            
            <Stack gap="xl" align="center" style={{ position: 'relative', zIndex: 1 }}>
              <Title order={2} size="h1" ta="center" c="white">There Is No Spoon</Title>
              <Text size="xl" maw={600} ta="center" c="white" opacity={0.9}>
                Once you understand the true language of data, the boundaries between information and insight disappear. 
                Your digital transformation begins with a single decision.
              </Text>
              <Group>
                <Button
                  size="xl"
                  variant="gradient"
                  gradient={{ from: 'rgba(255,255,255,0.3)', to: 'rgba(255,255,255,0.1)' }}
                  onClick={() => navigate('/dashboard')}
                  rightSection={<IconArrowRight size={20} />}
                  style={{
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  Initialize Sequence
                </Button>
                <Button
                  size="xl"
                  variant="subtle"
                  color="gray.0"
                  onClick={() => navigate('/data/integration')}
                >
                  Connect to Operator
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Back to top button */}
      <Affix position={{ bottom: 20, right: 20 }}>
        <MantineTransition transition="slide-up" mounted={scroll.y > 500}>
          {(transitionStyles) => (
            <ActionIcon
              color="blue"
              size="xl"
              radius="xl"
              variant="filled"
              style={transitionStyles}
              onClick={() => enhancedSmoothScrollTo(0, 800)}
            >
              <IconArrowUp size={20} />
            </ActionIcon>
          )}
        </MantineTransition>
      </Affix>

      {/* Footer with Matrix Background */}
      <Box
        style={{
          padding: '60px 0',
          background: 'var(--mantine-color-dark-7)',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1 }}>
          <MatrixBackground />
        </Box>
        
        <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={50}>
            <Stack>
              <Text size="lg" fw={700} c="white">Product</Text>
              <Stack gap="xs">
                <Text component="a" href="/features/engineering" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Features</Text>
                <Text component="a" href="/analysis/ai" c="gray.5" style={{ '&:hover': { color: 'white' } }}>AI Insights</Text>
                <Text component="a" href="/data/integration" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Integration</Text>
                <Text component="a" href="/workflow" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Workflows</Text>
              </Stack>
            </Stack>
            
            <Stack>
              <Text size="lg" fw={700} c="white">Resources</Text>
              <Stack gap="xs">
                <Text component="a" href="/dashboard" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Dashboard</Text>
                <Text component="a" href="/analysis/explore" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Analysis</Text>
                <Text component="a" href="/data/wrangling" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Data Wrangling</Text>
                <Text component="a" href="/export/report" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Reports</Text>
              </Stack>
            </Stack>
            
            <Stack>
              <Text size="lg" fw={700} c="white">Company</Text>
              <Stack gap="xs">
                <Text component="a" href="/about" c="gray.5" style={{ '&:hover': { color: 'white' } }}>About</Text>
                <Text component="a" href="/careers" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Careers</Text>
                <Text component="a" href="/contact" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Contact</Text>
                <Text component="a" href="/partners" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Partners</Text>
              </Stack>
            </Stack>
            
            <Stack>
              <Text size="lg" fw={700} c="white">Legal</Text>
              <Stack gap="xs">
                <Text component="a" href="/privacy" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Privacy Policy</Text>
                <Text component="a" href="/terms" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Terms of Service</Text>
                <Text component="a" href="/cookies" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Cookie Policy</Text>
                <Text component="a" href="/licenses" c="gray.5" style={{ '&:hover': { color: 'white' } }}>Licenses</Text>
              </Stack>
            </Stack>
          </SimpleGrid>

          <Divider my="xl" color="gray.7" />
          
          <Group justify="space-between" align="center">
            <Group>
              <ThemeIcon 
                size="lg" 
                variant="gradient" 
                gradient={{ from: 'blue', to: 'cyan' }}
              >
                <IconBrain size={20} />
              </ThemeIcon>
              <Text size="sm" c="gray.5">© 2024 Data Whisperer. All rights reserved.</Text>
            </Group>
            <Group gap="lg">
              <ActionIcon variant="subtle" color="gray.5">
                <IconBrandTwitter size={18} />
              </ActionIcon>
              <ActionIcon variant="subtle" color="gray.5">
                <IconBrandGithub size={18} />
              </ActionIcon>
              <ActionIcon variant="subtle" color="gray.5">
                <IconBrandLinkedin size={18} />
              </ActionIcon>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Scroll indicator dots */}
      <Box
        style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '10px 8px',
          borderRadius: '20px',
          backdropFilter: 'blur(4px)',
        }}
        visibleFrom="md"
      >
        {['hero', 'features', 'use-cases', 'data-integration', 'cta'].map((section) => (
          <Box
            key={section}
            style={{
              width: activeSection === section ? '12px' : '8px',
              height: activeSection === section ? '12px' : '8px',
              borderRadius: '50%',
              backgroundColor: activeSection === section ? 'var(--mantine-color-blue-5)' : 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeSection === section ? '0 0 10px rgba(0, 150, 255, 0.7)' : '0 0 5px rgba(0, 0, 0, 0.3)',
              border: activeSection === section ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.5)',
            }}
            onClick={() => {
              let targetRef;
              switch (section) {
                case 'hero': targetRef = heroRef; break;
                case 'features': targetRef = featuresRef; break;
                case 'use-cases': targetRef = useCasesRef; break;
                case 'data-integration': targetRef = dataIntegrationRef; break;
                case 'cta': targetRef = ctaRef; break;
                default: targetRef = heroRef;
              }
              scrollToSection(section as SectionIds);
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function Feature({ icon, title, description, color }: FeatureProps) {
  return (
    <Paper shadow="md" radius="md" p="xl" style={{ height: '100%' }}>
      <Stack gap="md">
        <div style={{ 
          width: rem(40), 
          height: rem(40), 
          borderRadius: rem(8),
          backgroundColor: `var(--mantine-color-${color}-light)`,
          color: `var(--mantine-color-${color}-filled)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        <Text size="lg" fw={500}>{title}</Text>
        <Text size="sm" c="dimmed">{description}</Text>
      </Stack>
    </Paper>
  );
}

function UseCase({ icon, title, description, color }: FeatureProps) {
  return (
    <Paper 
      shadow="md" 
      radius="md" 
      p="xl" 
      style={{ 
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 'var(--mantine-shadow-md)',
        },
      }}
    >
      <Group align="flex-start" gap="xl">
        <div style={{ 
          width: rem(40), 
          height: rem(40), 
          borderRadius: rem(8),
          backgroundColor: `var(--mantine-color-${color}-light)`,
          color: `var(--mantine-color-${color}-filled)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        <div>
          <Text size="lg" fw={500} mb="xs">{title}</Text>
          <Text size="sm" c="dimmed">{description}</Text>
        </div>
      </Group>
    </Paper>
  );
}
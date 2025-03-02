import React, { useState, useEffect } from 'react';
import { AppShell, Box, useMantineTheme, Drawer, rem } from '@mantine/core';
import { useMediaQuery, useDisclosure } from '@mantine/hooks';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Sidebar } from '../components/Layout/Sidebar';
import { Footer } from '../components/Layout/Footer';
import { OnboardingModal } from '../components/Onboarding/OnboardingModal';
import { AIAssistant } from '../components/AIAssistant/AIAssistant';
import { useOnboarding } from '../hooks/useOnboarding';

export function ProtectedLayout() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const [mobileNavOpened, { toggle: toggleMobileNav, close: closeMobileNav }] = useDisclosure(false);
  const [aiHelperOpened, { open: openAiHelper, close: closeAiHelper }] = useDisclosure(false);
  
  // Onboarding state
  const { showOnboarding, closeOnboarding } = useOnboarding();
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  
  // Show onboarding modal when showOnboarding changes
  useEffect(() => {
    if (showOnboarding) {
      setOnboardingModalOpen(true);
    }
  }, [showOnboarding]);
  
  // Handle onboarding modal close
  const handleOnboardingClose = () => {
    setOnboardingModalOpen(false);
    closeOnboarding();
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'md',
        collapsed: { mobile: !mobileNavOpened, desktop: false },
      }}
      padding="md"
      styles={{
        root: {
          height: '100vh',
          overflow: 'hidden',
        },
        main: {
          paddingTop: '60px', // Add padding to push content below header
          paddingLeft: isMobile ? 'md' : '280px', // Add padding for sidebar
          height: 'calc(100vh - 60px)',
          overflow: 'auto',
        },
        header: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        },
        navbar: {
          position: 'fixed',
          top: '60px',
          left: 0,
          height: 'calc(100vh - 60px)',
          zIndex: 99,
        }
      }}
    >
      <AppShell.Header>
        <Header 
          onMenuClick={toggleMobileNav} 
          onAIHelperOpen={openAiHelper}
        />
      </AppShell.Header>

      <AppShell.Navbar p={0}>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Box style={{ flex: 1 }}>
          <Outlet />
        </Box>
        <Footer />
      </AppShell.Main>
      
      {/* Mobile Navigation Drawer */}
      {isMobile && (
        <Drawer
          opened={mobileNavOpened}
          onClose={closeMobileNav}
          size="80%"
          padding="md"
          title="Navigation"
          zIndex={1000}
        >
          <Box h="calc(100vh - 60px)">
            <Sidebar />
          </Box>
        </Drawer>
      )}
      
      {/* AI Helper Drawer */}
      <Drawer
        opened={aiHelperOpened}
        onClose={closeAiHelper}
        position="right"
        size="md"
        padding={0}
        title=""
        withCloseButton={false}
        zIndex={1000}
      >
        <Box h="100vh">
          <AIAssistant onClose={closeAiHelper} />
        </Box>
      </Drawer>
      
      {/* Onboarding Modal */}
      <OnboardingModal 
        opened={onboardingModalOpen} 
        onClose={handleOnboardingClose} 
      />
    </AppShell>
  );
} 
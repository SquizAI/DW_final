import { Outlet, useLocation } from 'react-router-dom';
import { MantineProvider, AppShell, Box } from '@mantine/core';
import { theme } from '../theme';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';

export function PublicLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  return (
    <MantineProvider theme={theme}>
      <AppShell
        padding={0}
        layout="default"
        header={!isLandingPage ? { height: 60 } : undefined}
        styles={{
          root: {
            height: '100vh',
          },
          main: {
            background: 'var(--mantine-color-gray-0)',
            padding: 0,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            paddingTop: !isLandingPage ? '60px' : 0,
          },
        }}
      >
        {!isLandingPage && (
          <AppShell.Header>
            <Header />
          </AppShell.Header>
        )}
        <AppShell.Main>
          <Box style={{ flex: 1 }}>
            <Outlet />
          </Box>
          <Footer />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
} 
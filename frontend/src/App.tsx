import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { useColorScheme } from '@mantine/hooks';

// Auth Provider
import { AuthProvider } from './contexts/AuthContext';

// Router
import { router } from './router';

// Import theme
import { theme } from './theme';

import { WorkflowProvider } from './features/workflow/WorkflowContext';
import { GlobalLoadingIndicator } from './components/ui/LoadingIndicator';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  // Use system color scheme as default
  const preferredColorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme={preferredColorScheme}>
        <ModalsProvider>
          <Notifications />
          <GlobalLoadingIndicator />
          <AuthProvider>
            <WorkflowProvider>
              <RouterProvider router={router} />
            </WorkflowProvider>
          </AuthProvider>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

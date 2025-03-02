import { Component, ReactNode } from 'react';
import { Paper, Text, Button, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper p="xl" shadow="md" radius="md">
          <Stack align="center" gap="md">
            <IconAlertTriangle style={{ width: 48, height: 48, color: 'var(--mantine-color-red-6)' }} />
            <Text size="lg" fw={700}>Something went wrong</Text>
            <Text size="sm" c="dimmed" ta="center">
              We encountered an error while processing your request.
              Please try refreshing the page or contact support if the problem persists.
            </Text>
            <Button
              variant="light"
              color="blue"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Stack>
        </Paper>
      );
    }

    return this.props.children;
  }
} 
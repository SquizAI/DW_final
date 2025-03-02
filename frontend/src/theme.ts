import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, sans-serif',
  defaultRadius: 'md',
  
  // Improve color contrast for both light and dark modes
  colors: {
    // Ensure these colors have proper contrast in both modes
    dark: [
      '#C1C2C5', // 0
      '#A6A7AB', // 1
      '#909296', // 2
      '#5C5F66', // 3
      '#373A40', // 4
      '#2C2E33', // 5
      '#25262B', // 6
      '#1A1B1E', // 7
      '#141517', // 8
      '#101113', // 9
    ],
  },
  
  components: {
    AppShell: {
      styles: {
        main: {
          background: 'var(--mantine-color-gray-0)',
          width: '100%',
          minHeight: '100vh',
          padding: 0,
        },
        header: {
          height: '60px',
          background: 'var(--mantine-color-body)',
          borderBottom: '1px solid var(--mantine-color-gray-3)',
        },
        navbar: {
          width: '280px',
          background: 'var(--mantine-color-body)',
          borderRight: '1px solid var(--mantine-color-gray-3)',
        },
      },
    },
    Container: {
      defaultProps: {
        size: 'xl',
      },
      styles: {
        root: {
          width: '100%',
          maxWidth: rem(1440),
          paddingLeft: rem(16),
          paddingRight: rem(16),
          margin: '0 auto',
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
        p: 'lg',
      },
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-body)',
          borderColor: 'var(--mantine-color-gray-3)',
        },
      },
    },
    Button: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
    Text: {
      styles: {
        root: {
          fontWeight: 400,
          color: 'var(--mantine-color-text)',
          '&.strong': {
            fontWeight: 700,
          },
        },
      },
    },
    Card: {
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-body)',
          borderColor: 'var(--mantine-color-gray-3)',
        },
      },
    },
    Divider: {
      styles: {
        root: {
          borderColor: 'var(--mantine-color-gray-3)',
        },
      },
    },
  },
}); 
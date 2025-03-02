import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
  },
  shadows: {
    md: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
    lg: '0 4px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.12)',
    xl: '0 8px 16px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.14)',
  },
  components: {
    Card: {
      defaultProps: {
        shadow: 'md',
        radius: 'md',
        p: 'xl',
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
          '&.mantineTextStrong': {
            fontWeight: 700,
          },
        },
      },
    },
  },
}); 
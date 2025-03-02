import React from 'react';
import { Box, BoxProps } from '@mantine/core';
import brainLogo from '@/assets/DW_logo.svg';

interface LogoProps extends BoxProps {
  size?: number;
}

export function Logo({ size = 40, ...props }: LogoProps) {
  return (
    <Box
      component="img"
      src={brainLogo}
      alt="Data Whisperer"
      width={size}
      height={size}
      style={{
        filter: 'drop-shadow(0 0 10px rgba(255, 0, 255, 0.3))',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      }}
      {...props}
    />
  );
} 
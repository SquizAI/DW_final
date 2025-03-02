import React, { useEffect, useState } from 'react';
import { Loader, Box, Text, Group } from '@mantine/core';
import { subscribeToLoadingState } from '../../api';

interface LoadingIndicatorProps {
  /**
   * Whether to show the loading text
   * @default false
   */
  showText?: boolean;
  
  /**
   * Custom loading text
   * @default "Loading..."
   */
  text?: string;
  
  /**
   * Size of the loader
   * @default "md"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Color of the loader
   * @default "blue"
   */
  color?: string;
  
  /**
   * Whether to show the loader only when specific keys are loading
   */
  watchKeys?: string[];
  
  /**
   * Custom styles
   */
  style?: React.CSSProperties;
  
  /**
   * Custom class name
   */
  className?: string;
}

/**
 * A loading indicator component that subscribes to the global loading state
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  showText = false,
  text = 'Loading...',
  size = 'md',
  color = 'blue',
  watchKeys,
  style,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Subscribe to loading state changes
    const unsubscribe = subscribeToLoadingState((loadingState) => {
      if (watchKeys && watchKeys.length > 0) {
        // Check if any of the watched keys are loading
        const isAnyKeyLoading = watchKeys.some(key => loadingState[key]);
        setIsLoading(isAnyKeyLoading);
      } else {
        // Check if any key is loading
        const isAnyLoading = Object.values(loadingState).some(value => value);
        setIsLoading(isAnyLoading);
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [watchKeys]);
  
  // Don't render anything if not loading
  if (!isLoading) {
    return null;
  }
  
  return (
    <Box className={className} style={style}>
      <Group align="center" gap="xs">
        <Loader size={size} color={color} />
        {showText && <Text size={size}>{text}</Text>}
      </Group>
    </Box>
  );
};

/**
 * A fixed loading indicator that appears at the top of the page
 */
export const GlobalLoadingIndicator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Subscribe to loading state changes
    const unsubscribe = subscribeToLoadingState((loadingState) => {
      // Check if any key is loading
      const isAnyLoading = Object.values(loadingState).some(value => value);
      setIsLoading(isAnyLoading);
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);
  
  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: isLoading ? '3px' : 0,
        backgroundColor: 'var(--mantine-color-blue-6)',
        transition: 'all 0.3s ease',
        opacity: isLoading ? 1 : 0,
      }}
    />
  );
};

export default LoadingIndicator; 
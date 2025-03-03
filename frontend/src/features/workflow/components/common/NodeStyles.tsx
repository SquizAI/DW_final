import React from 'react';
import { Card, Group, Text, Badge, ThemeIcon, useMantineTheme, Box } from '@mantine/core';
import { Handle, Position } from 'reactflow';

interface NodeHeaderProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

export function NodeHeader({ label, icon, color, badge }: NodeHeaderProps) {
  const theme = useMantineTheme();
  
  return (
    <Card.Section withBorder inheritPadding py="xs">
      <Group justify="space-between">
        <Group>
          <ThemeIcon color={color} size={18}>
            {icon}
          </ThemeIcon>
          <Text fw={500}>{label}</Text>
        </Group>
        {badge && (
          <Badge color={color} size="sm">
            {badge}
          </Badge>
        )}
      </Group>
    </Card.Section>
  );
}

interface NodeContainerProps {
  children: React.ReactNode;
  selected: boolean;
  width?: number;
  hasInputHandle?: boolean;
  hasOutputHandle?: boolean;
  inputHandlePosition?: Position;
  outputHandlePosition?: Position;
  inputHandleId?: string;
  outputHandleId?: string;
}

export function NodeContainer({
  children,
  selected,
  width = 300,
  hasInputHandle = true,
  hasOutputHandle = true,
  inputHandlePosition = Position.Left,
  outputHandlePosition = Position.Right,
  inputHandleId = 'input',
  outputHandleId = 'output'
}: NodeContainerProps) {
  const theme = useMantineTheme();
  
  return (
    <Card 
      shadow="sm" 
      padding="lg" 
      radius="md" 
      withBorder 
      style={{ 
        width, 
        borderColor: selected ? theme.colors.blue[5] : undefined,
        boxShadow: selected ? `0 0 0 2px ${theme.colors.blue[5]}` : undefined
      }}
    >
      {hasInputHandle && (
        <Handle 
          type="target" 
          position={inputHandlePosition} 
          id={inputHandleId} 
          style={{ background: theme.colors.dark[5] }}
        />
      )}
      
      {children}
      
      {hasOutputHandle && (
        <Handle 
          type="source" 
          position={outputHandlePosition} 
          id={outputHandleId} 
          style={{ background: theme.colors.dark[5] }}
        />
      )}
    </Card>
  );
}

interface NodeStatsProps {
  stats: Record<string, any>;
  color?: string;
}

export function NodeStats({ stats, color = 'blue' }: NodeStatsProps) {
  return (
    <Group gap="xs">
      {Object.entries(stats).map(([key, value]) => (
        <Badge key={key} size="sm" variant="dot" color={color}>
          {key}: {value}
        </Badge>
      ))}
    </Group>
  );
}

interface NodeContentProps {
  children: React.ReactNode;
  padding?: string | number;
}

export function NodeContent({ children, padding = "xs" }: NodeContentProps) {
  return (
    <Box p={padding}>
      {children}
    </Box>
  );
} 
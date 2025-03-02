import { Card as MantineCard, CardProps as MantineCardProps, Text, Group } from '@mantine/core';
import { ReactNode } from 'react';

interface CardProps extends Omit<MantineCardProps, 'title'> {
  title?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Card({ title, icon, action, children, className, ...props }: CardProps) {
  return (
    <MantineCard className={className} {...props}>
      {(title || icon || action) && (
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            {icon}
            {title && (
              <Text size="lg" fw={600} data-heading>
                {title}
              </Text>
            )}
          </Group>
          {action}
        </Group>
      )}
      {children}
    </MantineCard>
  );
} 
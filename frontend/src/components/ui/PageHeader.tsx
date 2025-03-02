import { Title, Text, Group, Stack, GroupProps } from '@mantine/core';
import { ReactNode } from 'react';

interface PageHeaderProps extends Omit<GroupProps, 'title'> {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function PageHeader({ title, description, action, icon, ...props }: PageHeaderProps) {
  return (
    <Group justify="space-between" mb="xl" {...props}>
      <Group gap="md">
        {icon}
        <Stack gap={4}>
          <Title order={1} size="h3">
            {title}
          </Title>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>
      </Group>
      {action}
    </Group>
  );
} 
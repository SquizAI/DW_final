import { Group, UnstyledButton, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { ReactNode } from 'react';

interface NavMenuItemProps {
  icon: ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  active?: boolean;
}

export function NavMenuItem({ icon, label, description, onClick, active }: NavMenuItemProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: 'var(--mantine-spacing-md)',
        borderRadius: 'var(--mantine-radius-md)',
        backgroundColor: active ? 
          'var(--mantine-primary-color-light)' : 
          'transparent',
        color: active ? 
          'var(--mantine-primary-color-filled)' : 
          'var(--mantine-color-gray-7)',
        '&:hover': {
          backgroundColor: 'var(--mantine-primary-color-light-hover)',
        },
      }}
    >
      <Group wrap="nowrap" gap="md">
        {icon}
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
        </div>
        <IconChevronRight size={16} />
      </Group>
    </UnstyledButton>
  );
}

interface NavMenuProps {
  items: NavMenuItemProps[];
}

export function NavMenu({ items }: NavMenuProps) {
  return (
    <div>
      {items.map((item, index) => (
        <NavMenuItem key={index} {...item} />
      ))}
    </div>
  );
} 
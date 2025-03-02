import React from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  ActionIcon,
  Tooltip,
  Menu,
  Badge,
  Progress,
} from '@mantine/core';
import {
  IconSettings,
  IconEye,
  IconDownload,
  IconRefresh,
  IconTrash,
  IconCopy,
} from '@tabler/icons-react';
import { Handle, Position } from 'reactflow';
import { NodeData } from './types';

export interface BaseNodeProps {
  data: NodeData;
  selected: boolean;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onRefresh?: () => void;
  onViewDetails?: () => void;
  onExport?: () => void;
  onSettingsChange?: (settings: Record<string, any>) => void;
  children?: React.ReactNode;
}

export function BaseNode({
  data,
  selected,
  onDelete,
  onDuplicate,
  onRefresh,
  onViewDetails,
  onExport,
  onSettingsChange,
  children,
}: BaseNodeProps) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        borderColor: selected ? 'var(--mantine-color-blue-6)' : undefined,
      }}
    >
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Group>
            {data.icon}
            <Text fw={500} size="sm">{data.label}</Text>
            {data.state?.status === 'completed' && (
              <Badge color="green" size="sm">Completed</Badge>
            )}
            {data.state?.status === 'error' && (
              <Badge color="red" size="sm">Error</Badge>
            )}
          </Group>
          <Group gap={8}>
            {onViewDetails && (
              <Tooltip label="View Details">
                <ActionIcon
                  variant="subtle"
                  onClick={onViewDetails}
                  disabled={data.state?.status === 'working'}
                >
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon variant="subtle">
                  <IconSettings size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {onRefresh && (
                  <Menu.Item
                    leftSection={<IconRefresh size={14} />}
                    onClick={onRefresh}
                    disabled={data.state?.status === 'working'}
                  >
                    Refresh
                  </Menu.Item>
                )}
                {onExport && (
                  <Menu.Item
                    leftSection={<IconDownload size={14} />}
                    onClick={onExport}
                  >
                    Export
                  </Menu.Item>
                )}
                {onDuplicate && (
                  <Menu.Item
                    leftSection={<IconCopy size={14} />}
                    onClick={onDuplicate}
                  >
                    Duplicate
                  </Menu.Item>
                )}
                {onDelete && (
                  <>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      onClick={onDelete}
                      color="red"
                    >
                      Delete
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Card.Section>

      <Stack gap="xs" mt="md">
        {data.description && (
          <Text size="sm" c="dimmed">
            {data.description}
          </Text>
        )}

        {data.state?.status === 'working' && (
          <Progress
            value={data.state.progress}
            size="sm"
            animated
            striped
          />
        )}

        {children}

        {data.capabilities && data.capabilities.length > 0 && (
          <Group gap="xs">
            {data.capabilities.map(cap => (
              <Badge
                key={cap.id}
                size="sm"
                variant="dot"
              >
                {cap.label}
              </Badge>
            ))}
          </Group>
        )}
      </Stack>

      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ visibility: data.type === 'dataSource' ? 'hidden' : 'visible' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ visibility: data.type === 'export' ? 'hidden' : 'visible' }}
      />
    </Card>
  );
} 
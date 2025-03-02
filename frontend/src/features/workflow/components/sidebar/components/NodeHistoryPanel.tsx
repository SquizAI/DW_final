import React from 'react';
import { 
  Paper, 
  Text, 
  Group, 
  Badge, 
  ThemeIcon, 
  ActionIcon,
  Box,
  Divider,
  Button,
  Stack,
  Title,
  Tooltip,
  Timeline,
  ScrollArea,
  Card
} from '@mantine/core';
import { 
  IconX, 
  IconHistory, 
  IconPlus, 
  IconTrash,
  IconClock,
  IconArrowRight
} from '@tabler/icons-react';
import { NodeType } from '../../../utils/nodeUtils';

interface NodeHistoryPanelProps {
  onClose: () => void;
  recentlyUsed: any[];
  onAddNode: (nodeType: NodeType, position: { x: number; y: number }) => void;
  onClearHistory: () => void;
}

const NodeHistoryPanel: React.FC<NodeHistoryPanelProps> = ({
  onClose,
  recentlyUsed,
  onAddNode,
  onClearHistory
}) => {
  const handleAddNode = (nodeType: NodeType) => {
    onAddNode(nodeType, { x: 100, y: 100 });
  };
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    if (interval === 1) return `1 year ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    if (interval === 1) return `1 month ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    if (interval === 1) return `1 day ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    if (interval === 1) return `1 hour ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    if (interval === 1) return `1 minute ago`;
    
    return `${Math.floor(seconds)} seconds ago`;
  };
  
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };
  
  return (
    <Paper p="md" withBorder h="100%">
      <Group justify="space-between" mb="md">
        <Group>
          <ThemeIcon size="md" radius="md" color="blue">
            <IconHistory size={16} />
          </ThemeIcon>
          <Title order={4}>Recently Used Nodes</Title>
        </Group>
        
        <ActionIcon variant="subtle" onClick={onClose}>
          <IconX size={18} />
        </ActionIcon>
      </Group>
      
      <Divider mb="md" />
      
      {recentlyUsed.length === 0 ? (
        <Stack align="center" justify="center" h="calc(100% - 100px)">
          <ThemeIcon size="xl" radius="xl" color="gray" variant="light">
            <IconHistory size={24} />
          </ThemeIcon>
          <Text c="dimmed" ta="center">
            No recently used nodes.
            <br />
            Start adding nodes to your workflow to see them here.
          </Text>
        </Stack>
      ) : (
        <>
          <ScrollArea h="calc(100vh - 200px)" offsetScrollbars>
            <Timeline active={recentlyUsed.length - 1} bulletSize={24} lineWidth={2}>
              {recentlyUsed.map((node, index) => (
                <Timeline.Item 
                  key={`${node.id}-${index}`}
                  bullet={
                    <ThemeIcon 
                      size="md" 
                      radius="xl" 
                      color={node.color || 'blue'}
                    >
                      {node.icon}
                    </ThemeIcon>
                  }
                  title={
                    <Group justify="space-between">
                      <Text fw={500}>{node.label}</Text>
                      <Badge color={getComplexityColor(node.complexity)}>
                        {node.complexity}
                      </Badge>
                    </Group>
                  }
                >
                  <Card withBorder shadow="sm" p="sm" radius="md" mb="md">
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">
                        {getTimeAgo(node.timestamp)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Node ID: {node.nodeId?.substring(0, 8)}
                      </Text>
                    </Group>
                    
                    <Text size="sm" lineClamp={2} mb="xs">
                      {node.description}
                    </Text>
                    
                    <Group gap={5} mb="xs">
                      {node.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} size="xs" variant="outline" color="gray">
                          {tag}
                        </Badge>
                      ))}
                      {node.tags.length > 3 && (
                        <Text size="xs" c="dimmed">+{node.tags.length - 3}</Text>
                      )}
                    </Group>
                    
                    <Group justify="flex-end">
                      <Button 
                        size="xs" 
                        variant="light" 
                        leftSection={<IconPlus size={14} />}
                        onClick={() => handleAddNode(node.type)}
                      >
                        Add Again
                      </Button>
                    </Group>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </ScrollArea>
          
          <Divider my="md" />
          
          <Group justify="flex-end">
            <Button 
              variant="light" 
              color="red" 
              leftSection={<IconTrash size={16} />}
              onClick={onClearHistory}
            >
              Clear History
            </Button>
          </Group>
        </>
      )}
    </Paper>
  );
};

export default NodeHistoryPanel; 
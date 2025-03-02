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
  ScrollArea,
  SimpleGrid,
  Card
} from '@mantine/core';
import { 
  IconX, 
  IconStar, 
  IconPlus, 
  IconTrash,
  IconPinnedOff,
  IconBookmark,
  IconList,
  IconLayoutGrid
} from '@tabler/icons-react';
import { NodeType } from '../../../utils/nodeUtils';
import NodeItemComponent from './NodeItemComponent';

interface NodeFavoritesPanelProps {
  onClose: () => void;
  favorites: string[];
  allNodes: any[];
  onAddNode: (nodeType: NodeType, position: { x: number; y: number }) => void;
  onToggleFavorite: (nodeId: string) => void;
  onClearFavorites: () => void;
  viewMode?: 'list' | 'grid';
}

const NodeFavoritesPanel: React.FC<NodeFavoritesPanelProps> = ({
  onClose,
  favorites,
  allNodes,
  onAddNode,
  onToggleFavorite,
  onClearFavorites,
  viewMode = 'grid'
}) => {
  // Get favorite nodes
  const favoriteNodes = allNodes.filter(node => favorites.includes(node.id));
  
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
          <ThemeIcon size="md" radius="md" color="yellow">
            <IconStar size={16} />
          </ThemeIcon>
          <Title order={4}>Favorite Nodes</Title>
        </Group>
        
        <ActionIcon variant="subtle" onClick={onClose}>
          <IconX size={18} />
        </ActionIcon>
      </Group>
      
      <Divider mb="md" />
      
      {favoriteNodes.length === 0 ? (
        <Stack align="center" justify="center" h="calc(100% - 100px)">
          <ThemeIcon size="xl" radius="xl" color="gray" variant="light">
            <IconStar size={24} />
          </ThemeIcon>
          <Text c="dimmed" ta="center">
            No favorite nodes yet.
            <br />
            Click the star icon on any node to add it to your favorites.
          </Text>
        </Stack>
      ) : (
        <>
          <ScrollArea h="calc(100vh - 200px)" offsetScrollbars>
            {viewMode === 'grid' ? (
              <SimpleGrid cols={2} spacing="md">
                {favoriteNodes.map((node, index) => (
                  <Card key={node.id} withBorder shadow="sm" p="md" radius="md">
                    <Group justify="space-between" mb="xs">
                      <ThemeIcon 
                        size="lg" 
                        radius="md" 
                        color={node.color || 'blue'}
                        variant="light"
                      >
                        {node.icon}
                      </ThemeIcon>
                      
                      <Group gap={5}>
                        <Badge color={getComplexityColor(node.complexity)}>
                          {node.complexity}
                        </Badge>
                        
                        <Tooltip label="Remove from favorites">
                          <ActionIcon 
                            size="sm" 
                            variant="subtle" 
                            color="yellow"
                            onClick={() => onToggleFavorite(node.id)}
                          >
                            <IconPinnedOff size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                    
                    <Text fw={500} mb={5}>{node.label}</Text>
                    
                    <Text size="xs" color="dimmed" lineClamp={2} mb={10}>
                      {node.description}
                    </Text>
                    
                    <Group gap={5} mb={10}>
                      {node.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} size="xs" variant="outline" color="gray">
                          {tag}
                        </Badge>
                      ))}
                      {node.tags.length > 3 && (
                        <Text size="xs" c="dimmed">+{node.tags.length - 3}</Text>
                      )}
                    </Group>
                    
                    <Button 
                      fullWidth 
                      variant="light" 
                      leftSection={<IconPlus size={16} />}
                      onClick={() => onAddNode(node.type, { x: 100, y: 100 })}
                    >
                      Add to Canvas
                    </Button>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Stack>
                {favoriteNodes.map((node, index) => (
                  <NodeItemComponent
                    key={node.id}
                    node={node}
                    index={index}
                    onAddNode={onAddNode}
                    isFavorite={true}
                    onToggleFavorite={onToggleFavorite}
                    viewMode="list"
                  />
                ))}
              </Stack>
            )}
          </ScrollArea>
          
          <Divider my="md" />
          
          <Group justify="space-between">
            <Button 
              variant="light" 
              leftSection={viewMode === 'grid' ? <IconList size={16} /> : <IconLayoutGrid size={16} />}
              onClick={() => {}}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
            
            <Button 
              variant="light" 
              color="red" 
              leftSection={<IconTrash size={16} />}
              onClick={onClearFavorites}
            >
              Clear Favorites
            </Button>
          </Group>
        </>
      )}
    </Paper>
  );
};

export default NodeFavoritesPanel; 
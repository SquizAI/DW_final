import React, { useState, useRef, useEffect } from 'react';
import { 
  Group, 
  Text, 
  Badge, 
  ActionIcon, 
  Card, 
  Tooltip, 
  ThemeIcon,
  useMantineTheme,
  Popover,
  Box,
  Progress,
  Divider,
  Stack,
  Paper
} from '@mantine/core';
import { 
  IconInfoCircle,
  IconArrowRight,
  IconChartBar,
  IconTags,
  IconCode,
  IconGripVertical,
  IconPlus,
  IconStar
} from '@tabler/icons-react';
import { Draggable } from 'react-beautiful-dnd';
import { useHover } from '@mantine/hooks';

interface NodeItemProps {
  node: {
    id: string;
    type: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    popularity: number;
    complexity: string;
    tags: string[];
    color: string;
    category: string;
    inputs: number;
    outputs: number;
    configOptions: any[];
    examples: any[];
    documentation: string;
  };
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  viewMode: 'grid' | 'list';
  isFavorite?: boolean;
  onToggleFavorite?: (nodeId: string) => void;
}

const NodeItemComponent: React.FC<NodeItemProps> = ({
  node,
  index,
  isSelected,
  onSelect,
  viewMode,
  isFavorite = false,
  onToggleFavorite
}) => {
  const theme = useMantineTheme();
  const [isDragging, setIsDragging] = useState(false);
  const { hovered, ref: hoverRef } = useHover();
  const dragTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle drag start/end
  useEffect(() => {
    return () => {
      if (dragTimerRef.current) {
        clearTimeout(dragTimerRef.current);
      }
    };
  }, []);
  
  // Get complexity color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };
  
  return (
    <Draggable draggableId={node.id} index={index}>
      {(provided, snapshot) => {
        // Update dragging state
        if (isDragging !== snapshot.isDragging) {
          setIsDragging(snapshot.isDragging);
        }
        
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              opacity: isDragging ? 0.8 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            <Paper
              p="xs"
              radius="md"
              withBorder
              shadow={isDragging ? "md" : "xs"}
              style={{
                cursor: 'grab',
                borderColor: isDragging || isSelected ? theme.colors[node.color || 'blue'][5] : theme.colors.gray[3],
                borderLeft: `3px solid ${theme.colors[node.color || 'blue'][5]}`,
                backgroundColor: isDragging 
                  ? `rgba(${theme.colors[node.color || 'blue'][1]}, 0.7)` 
                  : isSelected 
                    ? `rgba(${theme.colors[node.color || 'blue'][1]}, 0.3)` 
                    : hovered 
                      ? `rgba(${theme.colors[node.color || 'blue'][1]}, 0.1)` 
                      : 'white',
                position: 'relative',
                minHeight: '90px',
                width: '100%',
                boxSizing: 'border-box',
                maxWidth: '100%',
                overflow: 'hidden'
              }}
              onClick={onSelect}
              ref={hoverRef}
            >
              {onToggleFavorite && (
                <ActionIcon 
                  size="xs" 
                  style={{ position: 'absolute', top: '5px', right: '5px' }}
                  color={isFavorite ? "yellow" : "gray"}
                  variant="transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(node.id);
                  }}
                >
                  <IconStar size={14} fill={isFavorite ? theme.colors.yellow[4] : 'transparent'} />
                </ActionIcon>
              )}
              
              <Group gap="xs" mb={4} wrap="nowrap">
                <ThemeIcon color={node.color || 'blue'} size="md" radius="sm">
                  {node.icon}
                </ThemeIcon>
              </Group>
              
              <Text size="xs" fw={600} lineClamp={1}>
                {node.label}
              </Text>
              
              <Text size="xs" c="dimmed" lineClamp={2} mt={2}>
                {node.description}
              </Text>
              
              <Group justify="space-between" mt={8}>
                <Badge size="xs" variant="dot" color={getComplexityColor(node.complexity)}>
                  {node.complexity}
                </Badge>
                <Text size="xs" c="dimmed">{node.inputs}{'->'}{node.outputs}</Text>
              </Group>
              
              {hovered && !isDragging && (
                <Box 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    padding: '4px',
                    borderTop: `1px solid ${theme.colors.gray[2]}`,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Text size="xs" fw={500} c={node.color}>Drag to canvas</Text>
                </Box>
              )}
            </Paper>
          </div>
        );
      }}
    </Draggable>
  );
};

export default NodeItemComponent; 
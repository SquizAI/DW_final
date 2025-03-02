import React, { useState } from 'react';
import { 
  Group, 
  Text, 
  Box, 
  Collapse, 
  ActionIcon, 
  ThemeIcon,
  Badge,
  Divider,
  Paper,
  useMantineTheme
} from '@mantine/core';
import { 
  IconChevronDown, 
  IconChevronRight,
  IconDragDrop
} from '@tabler/icons-react';
import { Droppable } from 'react-beautiful-dnd';
import NodeItemComponent from './NodeItemComponent';

interface CategoryNode {
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
}

interface Category {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  nodes: CategoryNode[];
}

interface NodeCategoryComponentProps {
  category: Category;
  viewMode: 'list' | 'grid';
  selectedNodes: string[];
  onSelectNode: (nodeId: string) => void;
}

export const NodeCategoryComponent: React.FC<NodeCategoryComponentProps> = ({
  category,
  viewMode,
  selectedNodes,
  onSelectNode
}) => {
  const theme = useMantineTheme();
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <Box px="xs" py="xs">
      <Droppable 
        droppableId={`category-${category.id}`}
        type="NODE"
      >
        {(provided, snapshot) => {
          // Update drag over state
          if (isDragOver !== snapshot.isDraggingOver) {
            setIsDragOver(snapshot.isDraggingOver);
          }
          
          return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`sidebar-droppable-area ${snapshot.isDraggingOver ? 'can-drop' : ''}`}
              style={{
                minHeight: 50,
                padding: '4px',
                borderRadius: theme.radius.sm,
                backgroundColor: snapshot.isDraggingOver 
                  ? theme.colors[category.color][0] 
                  : 'transparent',
                transition: 'background-color 0.2s ease',
              }}
            >
              {category.nodes.length === 0 && (
                <Box 
                  py="md" 
                  style={{ 
                    textAlign: 'center',
                    border: `1px dashed ${theme.colors.gray[4]}`,
                    borderRadius: theme.radius.sm,
                    backgroundColor: theme.colors.gray[0],
                  }}
                >
                  <IconDragDrop size={24} style={{ opacity: 0.5, marginBottom: 8 }} />
                  <Text size="xs" c="dimmed">Drag nodes here</Text>
                </Box>
              )}
              
              <div style={{ 
                display: viewMode === 'grid' ? 'grid' : 'flex',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '8px',
                flexDirection: viewMode === 'grid' ? undefined : 'column'
              }}>
                {category.nodes.map((node, index) => (
                  <NodeItemComponent 
                    key={node.id} 
                    node={node} 
                    index={index}
                    isSelected={selectedNodes.includes(node.id)}
                    onSelect={() => onSelectNode(node.id)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </Box>
  );
}; 
import React, { useState } from 'react';
import { 
  Paper, 
  Text, 
  Group, 
  Badge, 
  ThemeIcon, 
  ActionIcon,
  Tabs,
  Box,
  Divider,
  Button,
  Code,
  Table,
  ScrollArea,
  Accordion,
  List,
  Title,
  Tooltip,
  Card,
  Image,
  Anchor
} from '@mantine/core';
import { 
  IconX, 
  IconInfoCircle, 
  IconCode, 
  IconSettings, 
  IconChartBar,
  IconExternalLink,
  IconBookmark,
  IconBookmarkOff,
  IconPlus,
  IconArrowRight,
  IconDeviceFloppy,
  IconCopy
} from '@tabler/icons-react';
import { NodeType } from '../../../utils/nodeUtils';

interface NodeDetailsPanelProps {
  node: any;
  onClose: () => void;
  onAddNode?: (nodeType: NodeType, position: { x: number; y: number }) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (nodeId: string) => void;
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  node,
  onClose,
  onAddNode,
  isFavorite = false,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  
  const handleAddNode = () => {
    if (onAddNode) {
      onAddNode(node.type, { x: 100, y: 100 });
    }
  };
  
  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(node.id);
    }
  };
  
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };
  
  const getComplexityDescription = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'Suitable for beginners, easy to configure';
      case 'intermediate': return 'Requires some understanding of data concepts';
      case 'advanced': return 'Advanced node with complex configuration options';
      default: return '';
    }
  };
  
  return (
    <Paper p="md" withBorder h="100%">
      <Group justify="space-between" mb="md">
        <Group>
          <ThemeIcon 
            size="xl" 
            radius="md" 
            color={node.color || 'blue'}
            variant="light"
          >
            {node.icon}
          </ThemeIcon>
          <div>
            <Title order={4}>{node.label}</Title>
            <Text size="sm" color="dimmed">{node.category}</Text>
          </div>
        </Group>
        
        <Group gap={5}>
          <Tooltip label={isFavorite ? "Remove from favorites" : "Add to favorites"}>
            <ActionIcon 
              variant="subtle" 
              color={isFavorite ? "yellow" : "gray"}
              onClick={handleToggleFavorite}
            >
              {isFavorite ? <IconBookmarkOff size={18} /> : <IconBookmark size={18} />}
            </ActionIcon>
          </Tooltip>
          
          <ActionIcon variant="subtle" onClick={onClose}>
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Group>
      
      <Group mb="md">
        <Badge color={getComplexityColor(node.complexity)}>
          {node.complexity}
        </Badge>
        
        <Badge color={node.color || 'blue'} variant="outline">
          {node.inputs} Inputs
        </Badge>
        
        <Badge color={node.color || 'blue'} variant="outline">
          {node.outputs} Outputs
        </Badge>
        
        <Badge variant="dot" color="blue">
          {node.popularity}% Popularity
        </Badge>
      </Group>
      
      <Text mb="md">{node.description}</Text>
      
      <Group mb="md" gap={5}>
        {node.tags.map((tag: string) => (
          <Badge key={tag} variant="outline" color="gray">
            {tag}
          </Badge>
        ))}
      </Group>
      
      <Divider mb="md" />
      
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="overview" leftSection={<IconInfoCircle size={14} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="config" leftSection={<IconSettings size={14} />}>
            Configuration
          </Tabs.Tab>
          <Tabs.Tab value="examples" leftSection={<IconCode size={14} />}>
            Examples
          </Tabs.Tab>
          <Tabs.Tab value="usage" leftSection={<IconChartBar size={14} />}>
            Usage
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="overview">
          <ScrollArea h="calc(100vh - 350px)" offsetScrollbars>
            <Box mb="md">
              <Text fw={500} mb="xs">Description</Text>
              <Text size="sm">{node.description}</Text>
            </Box>
            
            <Box mb="md">
              <Text fw={500} mb="xs">Complexity</Text>
              <Group gap={10}>
                <Badge color={getComplexityColor(node.complexity)}>
                  {node.complexity}
                </Badge>
                <Text size="sm">{getComplexityDescription(node.complexity)}</Text>
              </Group>
            </Box>
            
            <Box mb="md">
              <Text fw={500} mb="xs">Inputs and Outputs</Text>
              <Group gap={10}>
                <Badge color={node.color || 'blue'} variant="outline">
                  {node.inputs} Inputs
                </Badge>
                <IconArrowRight size={14} />
                <Badge color={node.color || 'blue'} variant="outline">
                  {node.outputs} Outputs
                </Badge>
              </Group>
            </Box>
            
            <Box mb="md">
              <Text fw={500} mb="xs">Tags</Text>
              <Group gap={5}>
                {node.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" color="gray">
                    {tag}
                  </Badge>
                ))}
              </Group>
            </Box>
            
            <Box mb="md">
              <Text fw={500} mb="xs">Documentation</Text>
              <Anchor href={node.documentation} target="_blank" rel="noopener noreferrer">
                <Group gap={5}>
                  <Text size="sm">View Documentation</Text>
                  <IconExternalLink size={14} />
                </Group>
              </Anchor>
            </Box>
          </ScrollArea>
        </Tabs.Panel>
        
        <Tabs.Panel value="config">
          <ScrollArea h="calc(100vh - 350px)" offsetScrollbars>
            <Text fw={500} mb="md">Configuration Options</Text>
            
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Description</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {node.configOptions.map((option: any) => (
                  <Table.Tr key={option.name}>
                    <Table.Td>
                      <Text fw={500}>{option.label}</Text>
                      <Text size="xs" color="dimmed">{option.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm">
                        {option.type}
                      </Badge>
                      {option.options && (
                        <Text size="xs" color="dimmed" mt={5}>
                          Options: {option.options.join(', ')}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {option.description || '-'}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Tabs.Panel>
        
        <Tabs.Panel value="examples">
          <ScrollArea h="calc(100vh - 350px)" offsetScrollbars>
            <Text fw={500} mb="md">Example Configurations</Text>
            
            <Accordion>
              {node.examples.map((example: any, index: number) => (
                <Accordion.Item key={index} value={`example-${index}`}>
                  <Accordion.Control>
                    <Text fw={500}>{example.title}</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Code block>
                      {JSON.stringify(example.config, null, 2)}
                    </Code>
                    <Group justify="flex-end" mt="xs">
                      <Button 
                        size="xs" 
                        variant="light" 
                        leftSection={<IconCopy size={14} />}
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(example.config))}
                      >
                        Copy
                      </Button>
                      <Button 
                        size="xs" 
                        variant="light" 
                        leftSection={<IconDeviceFloppy size={14} />}
                      >
                        Use This
                      </Button>
                    </Group>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </ScrollArea>
        </Tabs.Panel>
        
        <Tabs.Panel value="usage">
          <ScrollArea h="calc(100vh - 350px)" offsetScrollbars>
            <Text fw={500} mb="md">Common Usage Patterns</Text>
            
            <List withPadding>
              <List.Item>Use this node to {node.description.toLowerCase()}</List.Item>
              <List.Item>Typically used after data loading and before analysis</List.Item>
              <List.Item>Can be combined with other transformation nodes for complex pipelines</List.Item>
              <List.Item>Popular in {node.tags.join(', ')} workflows</List.Item>
            </List>
            
            <Text fw={500} mt="lg" mb="md">Related Nodes</Text>
            
            <Group>
              {/* This would be populated with actual related nodes */}
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                  <Image
                    src="https://via.placeholder.com/150"
                    height={80}
                    alt="Related node"
                  />
                </Card.Section>
                
                <Group justify="space-between" mt="md" mb="xs">
                  <Text fw={500}>Related Node</Text>
                  <Badge color="blue">Beginner</Badge>
                </Group>
                
                <Text size="sm" color="dimmed">
                  A related node that works well with this one
                </Text>
                
                <Button variant="light" color="blue" fullWidth mt="md" radius="md">
                  View Details
                </Button>
              </Card>
            </Group>
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
      
      <Divider my="md" />
      
      <Group justify="flex-end">
        <Button 
          variant="light" 
          leftSection={<IconExternalLink size={16} />}
          component="a"
          href={node.documentation}
          target="_blank"
          rel="noopener noreferrer"
        >
          Documentation
        </Button>
        
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={handleAddNode}
        >
          Add to Canvas
        </Button>
      </Group>
    </Paper>
  );
};

export default NodeDetailsPanel; 
import React, { useState } from 'react';
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
  Checkbox,
  CheckboxGroup,
  TextInput,
  Select,
  Stack,
  Accordion,
  RangeSlider,
  Chip,
  ChipGroup,
  Title,
  Tooltip
} from '@mantine/core';
import { 
  IconX, 
  IconFilter, 
  IconSearch, 
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
  IconRefresh,
  IconCheck,
  IconCategory,
  IconTags,
  IconAdjustments,
  IconChartBar
} from '@tabler/icons-react';

interface NodeFilterPanelProps {
  onClose: () => void;
  allTags: string[];
  filterTags: string[];
  setFilterTags: (tags: string[]) => void;
  filterComplexity: string[];
  setFilterComplexity: (complexity: string[]) => void;
  sortBy: 'popularity' | 'name' | 'complexity';
  setSortBy: (sortBy: 'popularity' | 'name' | 'complexity') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
  onResetFilters: () => void;
}

const NodeFilterPanel: React.FC<NodeFilterPanelProps> = ({
  onClose,
  allTags,
  filterTags,
  setFilterTags,
  filterComplexity,
  setFilterComplexity,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  onResetFilters
}) => {
  const [popularityRange, setPopularityRange] = useState<[number, number]>([0, 100]);
  
  const handleToggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  const handleResetFilters = () => {
    setFilterTags([]);
    setFilterComplexity([]);
    setPopularityRange([0, 100]);
    setSortBy('popularity');
    setSortDirection('desc');
    onResetFilters();
  };
  
  return (
    <Paper p="md" withBorder h="100%">
      <Group justify="space-between" mb="md">
        <Group>
          <ThemeIcon size="md" radius="md" color="blue">
            <IconFilter size={16} />
          </ThemeIcon>
          <Title order={4}>Filter Nodes</Title>
        </Group>
        
        <ActionIcon variant="subtle" onClick={onClose}>
          <IconX size={18} />
        </ActionIcon>
      </Group>
      
      <Divider mb="md" />
      
      <Accordion defaultValue="sort" mb="md">
        <Accordion.Item value="sort">
          <Accordion.Control icon={<IconArrowsSort size={16} />}>
            <Text fw={500}>Sort Options</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Select
                label="Sort By"
                value={sortBy}
                onChange={(value) => setSortBy(value as 'popularity' | 'name' | 'complexity')}
                data={[
                  { value: 'popularity', label: 'Popularity' },
                  { value: 'name', label: 'Name' },
                  { value: 'complexity', label: 'Complexity' }
                ]}
              />
              
              <Group justify="space-between">
                <Text size="sm">Sort Direction</Text>
                <Button
                  variant="light"
                  leftSection={sortDirection === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                  onClick={handleToggleSortDirection}
                >
                  {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </Group>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      
      <Accordion defaultValue="complexity" mb="md">
        <Accordion.Item value="complexity">
          <Accordion.Control icon={<IconAdjustments size={16} />}>
            <Text fw={500}>Complexity</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <CheckboxGroup
              value={filterComplexity}
              onChange={setFilterComplexity}
            >
              <Group mt="xs">
                <Checkbox value="beginner" label={<Badge color="green">Beginner</Badge>} />
                <Checkbox value="intermediate" label={<Badge color="yellow">Intermediate</Badge>} />
                <Checkbox value="advanced" label={<Badge color="red">Advanced</Badge>} />
              </Group>
            </CheckboxGroup>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      
      <Accordion defaultValue="popularity" mb="md">
        <Accordion.Item value="popularity">
          <Accordion.Control icon={<IconChartBar size={16} />}>
            <Text fw={500}>Popularity</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Box px="xs">
              <Text size="sm" mb="md">Popularity Range: {popularityRange[0]}% - {popularityRange[1]}%</Text>
              <RangeSlider
                value={popularityRange}
                onChange={setPopularityRange}
                min={0}
                max={100}
                step={5}
                minRange={10}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' }
                ]}
              />
            </Box>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      
      <Accordion defaultValue="tags" mb="md">
        <Accordion.Item value="tags">
          <Accordion.Control icon={<IconTags size={16} />}>
            <Text fw={500}>Tags</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <TextInput
              placeholder="Search tags..."
              leftSection={<IconSearch size={16} />}
              mb="md"
            />
            
            <Text size="sm" mb="xs">Selected Tags:</Text>
            <ChipGroup multiple value={filterTags} onChange={setFilterTags}>
              {allTags.map(tag => (
                <Chip key={tag} value={tag}>
                  {tag}
                </Chip>
              ))}
            </ChipGroup>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      
      <Divider my="md" />
      
      <Group justify="space-between">
        <Button 
          variant="light" 
          leftSection={<IconRefresh size={16} />}
          onClick={handleResetFilters}
        >
          Reset Filters
        </Button>
        
        <Button 
          leftSection={<IconCheck size={16} />}
          onClick={onClose}
        >
          Apply Filters
        </Button>
      </Group>
    </Paper>
  );
};

export default NodeFilterPanel; 
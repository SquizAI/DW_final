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
  Stack,
  Title,
  Tooltip,
  Switch,
  ColorSwatch,
  Slider,
  Select,
  SegmentedControl,
  Accordion,
  Checkbox,
  RangeSlider
} from '@mantine/core';
import { 
  IconX, 
  IconSettings, 
  IconPalette, 
  IconEye, 
  IconLayoutGrid,
  IconList,
  IconRefresh,
  IconDeviceFloppy,
  IconArrowsSort,
  IconCategory,
  IconTags,
  IconAdjustments,
  IconChartBar
} from '@tabler/icons-react';

interface NodeSettingsPanelProps {
  onClose: () => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  sortBy: 'popularity' | 'name' | 'complexity';
  setSortBy: (sortBy: 'popularity' | 'name' | 'complexity') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
  showNodeDetails: boolean;
  setShowNodeDetails: (show: boolean) => void;
  nodeSize: 'small' | 'medium' | 'large';
  setNodeSize: (size: 'small' | 'medium' | 'large') => void;
  onResetSettings: () => void;
}

const NodeSettingsPanel: React.FC<NodeSettingsPanelProps> = ({
  onClose,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  showNodeDetails,
  setShowNodeDetails,
  nodeSize,
  setNodeSize,
  onResetSettings
}) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [animateNodes, setAnimateNodes] = useState(true);
  const [showPopularity, setShowPopularity] = useState(true);
  const [showComplexity, setShowComplexity] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [maxTagsToShow, setMaxTagsToShow] = useState(3);
  const [nodeBorderRadius, setNodeBorderRadius] = useState(8);
  
  const handleSaveSettings = () => {
    // In a real implementation, this would save all settings
    onClose();
  };
  
  return (
    <Paper p="md" withBorder h="100%">
      <Group justify="space-between" mb="md">
        <Group>
          <ThemeIcon size="md" radius="md" color="gray">
            <IconSettings size={16} />
          </ThemeIcon>
          <Title order={4}>Sidebar Settings</Title>
        </Group>
        
        <ActionIcon variant="subtle" onClick={onClose}>
          <IconX size={18} />
        </ActionIcon>
      </Group>
      
      <Divider mb="md" />
      
      <Accordion defaultValue="display" mb="md">
        <Accordion.Item value="display">
          <Accordion.Control icon={<IconEye size={16} />}>
            <Text fw={500}>Display Settings</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Box>
                <Text fw={500} mb="xs">View Mode</Text>
                <SegmentedControl
                  value={viewMode}
                  onChange={(value) => setViewMode(value as 'list' | 'grid')}
                  data={[
                    { 
                      label: (
                        <Group gap={5}>
                          <IconList size={16} />
                          <Text size="sm">List</Text>
                        </Group>
                      ), 
                      value: 'list' 
                    },
                    { 
                      label: (
                        <Group gap={5}>
                          <IconLayoutGrid size={16} />
                          <Text size="sm">Grid</Text>
                        </Group>
                      ), 
                      value: 'grid' 
                    }
                  ]}
                  fullWidth
                />
              </Box>
              
              <Box>
                <Text fw={500} mb="xs">Node Size</Text>
                <SegmentedControl
                  value={nodeSize}
                  onChange={(value) => setNodeSize(value as 'small' | 'medium' | 'large')}
                  data={[
                    { label: 'Small', value: 'small' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'Large', value: 'large' }
                  ]}
                  fullWidth
                />
              </Box>
              
              <Switch
                label="Show Node Details"
                checked={showNodeDetails}
                onChange={(e) => setShowNodeDetails(e.currentTarget.checked)}
              />
              
              <Switch
                label="Animate Nodes on Hover"
                checked={animateNodes}
                onChange={(e) => setAnimateNodes(e.currentTarget.checked)}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      
      <Accordion defaultValue="content" mb="md">
        <Accordion.Item value="content">
          <Accordion.Control icon={<IconCategory size={16} />}>
            <Text fw={500}>Content Settings</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Switch
                label="Show Popularity Ratings"
                checked={showPopularity}
                onChange={(e) => setShowPopularity(e.currentTarget.checked)}
              />
              
              <Switch
                label="Show Complexity Badges"
                checked={showComplexity}
                onChange={(e) => setShowComplexity(e.currentTarget.checked)}
              />
              
              <Switch
                label="Show Tags"
                checked={showTags}
                onChange={(e) => setShowTags(e.currentTarget.checked)}
              />
              
              {showTags && (
                <Box>
                  <Text size="sm" mb="xs">Maximum Tags to Show: {maxTagsToShow}</Text>
                  <Slider
                    value={maxTagsToShow}
                    onChange={setMaxTagsToShow}
                    min={1}
                    max={10}
                    step={1}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 5, label: '5' },
                      { value: 10, label: '10' }
                    ]}
                  />
                </Box>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      
      <Accordion defaultValue="sorting" mb="md">
        <Accordion.Item value="sorting">
          <Accordion.Control icon={<IconArrowsSort size={16} />}>
            <Text fw={500}>Sorting Settings</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Select
                label="Sort Nodes By"
                value={sortBy}
                onChange={(value) => setSortBy(value as 'popularity' | 'name' | 'complexity')}
                data={[
                  { value: 'popularity', label: 'Popularity' },
                  { value: 'name', label: 'Name' },
                  { value: 'complexity', label: 'Complexity' }
                ]}
              />
              
              <Select
                label="Sort Direction"
                value={sortDirection}
                onChange={(value) => setSortDirection(value as 'asc' | 'desc')}
                data={[
                  { value: 'desc', label: 'Descending (Highest First)' },
                  { value: 'asc', label: 'Ascending (Lowest First)' }
                ]}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      
      <Accordion mb="md">
        <Accordion.Item value="advanced">
          <Accordion.Control icon={<IconAdjustments size={16} />}>
            <Text fw={500}>Advanced Settings</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Box>
                <Text fw={500} mb="xs">Node Border Radius: {nodeBorderRadius}px</Text>
                <Slider
                  value={nodeBorderRadius}
                  onChange={setNodeBorderRadius}
                  min={0}
                  max={16}
                  step={1}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 8, label: '8' },
                    { value: 16, label: '16' }
                  ]}
                />
              </Box>
              
              <Checkbox
                label="Show Advanced Node Options"
                checked={showAdvancedSettings}
                onChange={(e) => setShowAdvancedSettings(e.currentTarget.checked)}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      
      <Divider my="md" />
      
      <Group justify="space-between">
        <Button 
          variant="light" 
          leftSection={<IconRefresh size={16} />}
          onClick={onResetSettings}
        >
          Reset to Defaults
        </Button>
        
        <Button 
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Group>
    </Paper>
  );
};

export default NodeSettingsPanel; 
import React, { useState } from 'react';
import { Box, Tabs, Text, Group, Button, Divider, Paper, Title, Grid, Switch } from '@mantine/core';
import WorkflowPage from '../WorkflowPage';
import WorkflowPageNew from '../../WorkflowPageNew';
import { WorkflowProvider } from '../../WorkflowContext';

export const WorkflowComparisonPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('side-by-side');
  const [showSideNav, setShowSideNav] = useState(true);

  return (
    <Box p="md">
      <Paper p="md" mb="md" withBorder>
        <Title order={2} mb="md">Workflow Page Comparison</Title>
        <Text mb="md">
          This page allows you to compare the original WorkflowPage with the new WorkflowPageNew implementation.
          Use the tabs below to switch between different viewing modes.
        </Text>
        
        <Group mb="md">
          <Switch 
            label="Show Side Navigation" 
            checked={showSideNav} 
            onChange={(event) => setShowSideNav(event.currentTarget.checked)} 
          />
        </Group>
        
        <Divider mb="md" />
        
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="side-by-side">Side by Side</Tabs.Tab>
            <Tabs.Tab value="original">Original WorkflowPage</Tabs.Tab>
            <Tabs.Tab value="new">New WorkflowPageNew</Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="side-by-side" pt="md">
            <Grid>
              <Grid.Col span={6}>
                <Paper withBorder p="xs">
                  <Title order={4} mb="sm">Original WorkflowPage</Title>
                  <Box h={600} style={{ overflow: 'hidden', position: 'relative', border: '1px solid #eee' }}>
                    <WorkflowPage />
                  </Box>
                </Paper>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Paper withBorder p="xs">
                  <Title order={4} mb="sm">New WorkflowPageNew</Title>
                  <Box h={600} style={{ overflow: 'hidden', position: 'relative', border: '1px solid #eee' }}>
                    <WorkflowProvider>
                      <div style={{ 
                        height: '600px', 
                        width: '100%', 
                        position: 'relative',
                        transform: 'scale(0.9)',
                        transformOrigin: 'top left'
                      }}>
                        <WorkflowPageNew />
                      </div>
                    </WorkflowProvider>
                  </Box>
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
          
          <Tabs.Panel value="original" pt="md">
            <Paper withBorder p="xs">
              <Title order={4} mb="sm">Original WorkflowPage</Title>
              <Box h={800} style={{ overflow: 'hidden', position: 'relative', border: '1px solid #eee' }}>
                <WorkflowPage />
              </Box>
            </Paper>
          </Tabs.Panel>
          
          <Tabs.Panel value="new" pt="md">
            <Paper withBorder p="xs">
              <Title order={4} mb="sm">New WorkflowPageNew</Title>
              <Box h={800} style={{ overflow: 'hidden', position: 'relative', border: '1px solid #eee' }}>
                <WorkflowProvider>
                  <WorkflowPageNew />
                </WorkflowProvider>
              </Box>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Paper>
      
      <Paper p="md" withBorder>
        <Title order={3} mb="md">Comparison Notes</Title>
        
        <Title order={4} mb="xs">Original WorkflowPage</Title>
        <Text mb="md">
          <ul>
            <li>Uses the main application navigation</li>
            <li>Displays workflows as cards in a grid layout</li>
            <li>Focuses on workflow management rather than workflow editing</li>
            <li>Includes filtering and sorting options</li>
            <li>Uses Material-UI styling</li>
          </ul>
        </Text>
        
        <Title order={4} mb="xs">New WorkflowPageNew</Title>
        <Text mb="md">
          <ul>
            <li>Standalone page without main navigation</li>
            <li>Full-screen workflow editor experience</li>
            <li>Includes sidebar with node categories</li>
            <li>Provides node configuration panel</li>
            <li>Features enhanced header with workflow controls</li>
            <li>Uses ReactFlow for node rendering and connections</li>
            <li>Supports drag-and-drop node placement</li>
            <li>Includes data source management</li>
          </ul>
        </Text>
        
        <Title order={4} mb="xs">Key Differences</Title>
        <Text>
          <ul>
            <li>WorkflowPage is for managing workflows, WorkflowPageNew is for editing workflows</li>
            <li>WorkflowPageNew provides a more focused, distraction-free editing experience</li>
            <li>WorkflowPageNew has more advanced node management capabilities</li>
            <li>WorkflowPageNew integrates with the application's data sources</li>
            <li>WorkflowPageNew has a more modern, streamlined UI</li>
          </ul>
        </Text>
      </Paper>
    </Box>
  );
};

export default WorkflowComparisonPage; 
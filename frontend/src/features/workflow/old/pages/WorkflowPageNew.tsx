import { useState } from 'react';
import { Box, Flex, Text, Button, Group, Title, Divider } from '@mantine/core';
import { ReactFlowProvider } from 'reactflow';
import { WorkflowCanvas } from '../components/canvas/WorkflowCanvas';
import { WorkflowSidebar } from '../components/sidebar/WorkflowSidebar';
import { NodeConfigPanel } from '../components/config/NodeConfigPanel';
import { WorkflowProvider } from '../WorkflowContext';
import { NodePreview } from '../components/execution/NodePreview';

export function WorkflowPageNew() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const [previewNodeType, setPreviewNodeType] = useState<string>('');
  const [previewNodeLabel, setPreviewNodeLabel] = useState<string>('');

  const handlePreviewNode = (nodeId: string, nodeType: string, nodeLabel: string) => {
    setPreviewNodeId(nodeId);
    setPreviewNodeType(nodeType);
    setPreviewNodeLabel(nodeLabel);
    setIsPreviewOpen(true);
  };

  return (
    <WorkflowProvider>
      <Flex direction="column" h="100vh">
        <Box p="md" bg="gray.0" style={{ borderBottom: '1px solid #eee' }}>
          <Group justify="space-between">
            <Title order={3}>Data Whisperer Workflow</Title>
            <Group>
              <Button variant="outline">Save</Button>
              <Button>Execute</Button>
            </Group>
          </Group>
        </Box>
        
        <Flex style={{ flex: 1, overflow: 'hidden' }}>
          <Box w={250} p="md" style={{ borderRight: '1px solid #eee' }}>
            <Text ta="center" fw={600} mb="md">Node Selector</Text>
            <Divider mb="md" />
            <WorkflowSidebar />
          </Box>
          
          <Box style={{ flex: 1, position: 'relative' }}>
            <ReactFlowProvider>
              <WorkflowCanvas />
            </ReactFlowProvider>
          </Box>
          
          <Box w={300} p="md" style={{ borderLeft: '1px solid #eee' }}>
            <Text ta="center" fw={600} mb="md">Node Configuration</Text>
            <Divider mb="md" />
            <NodeConfigPanel onPreviewNode={handlePreviewNode} />
          </Box>
        </Flex>
      </Flex>

      {previewNodeId && (
        <NodePreview
          nodeId={previewNodeId}
          nodeType={previewNodeType}
          nodeLabel={previewNodeLabel}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </WorkflowProvider>
  );
} 
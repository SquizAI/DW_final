/**
 * WorkflowPageNew.tsx
 * 
 * This component serves as the main workflow builder interface for the Data Whisperer application.
 * It provides a comprehensive environment for users to create, edit, and execute data processing workflows.
 * 
 * Features:
 * - Drag-and-drop workflow canvas for node placement and connection
 * - Sidebar with categorized nodes for workflow construction
 * - Configuration panel for editing node properties
 * - Execution controls for running workflows
 * - Preview functionality for examining node outputs
 * - Data lineage visualization
 * - AI assistance for workflow optimization
 * 
 * Note: This is the primary implementation of the workflow interface.
 * A simplified version exists in /old/pages/WorkflowPageNew.tsx for reference.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Group, Tabs, useMantineTheme, Button, ActionIcon, Tooltip, Text, Modal, Paper } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflow } from './WorkflowContext';

// Import our components
import WorkflowHeader from './components/header/WorkflowHeader';
import WorkflowSidebar from './components/sidebar/WorkflowSidebar';
import WorkflowCanvas from './components/canvas/WorkflowCanvas';
import WorkflowModals from './components/modals/WorkflowModals';
import NodeConfigPanel from './components/config/NodeConfigPanel';
import WorkflowExecutionPanel from './components/execution/WorkflowExecutionPanel';
import AIAssistantPanel from './components/ai/AIAssistantPanel';
import WorkflowTemplates from './components/templates/WorkflowTemplates';
import WorkflowSettings from './components/settings/WorkflowSettings';
import WorkflowVariables from './components/variables/WorkflowVariables';
import WorkflowAnalytics from './components/analytics/WorkflowAnalytics';
import DataPreview from './components/data/DataPreview';
import DataLineageGraph from './components/lineage/DataLineageGraph';
import WorkflowAIChat from './components/ai/WorkflowAIChat';
import { DataSourceManager } from './DataSourceManager';
import { NodePreview } from './components/execution/NodePreview';

// Import icons
import { 
  IconLayoutSidebar, 
  IconSettings, 
  IconChartBar, 
  IconVariable, 
  IconRobot,
  IconTable,
  IconArrowsRight,
  IconBrain,
  IconHome,
  IconDatabase,
  IconHelp,
  IconDeviceFloppy,
  IconPlayerPlay,
  IconPlayerStop,
  IconShare,
  IconDownload,
  IconUpload,
  IconEye
} from '@tabler/icons-react';

export const WorkflowPageNew: React.FC = () => {
  // Get workflow ID from URL params
  const { id } = useParams<{ id: string }>();
  const { loadWorkflow, selectedNode, executeWorkflow, isExecuting, workflowName } = useWorkflow();
  const theme = useMantineTheme();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [saveModalOpened, setSaveModalOpened] = useState(false);
  const [agentTopologyOpened, setAgentTopologyOpened] = useState(false);
  const [keyboardShortcutsOpened, setKeyboardShortcutsOpened] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<string | null>('config');
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [dataSourceModalOpen, setDataSourceModalOpen] = useState(false);
  
  // State for NodePreview modal
  const [nodePreviewOpen, setNodePreviewOpen] = useState(false);
  
  // Load workflow data if ID is provided
  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    }
  }, [id, loadWorkflow]);
  
  // Update canvas size when window resizes
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        setCanvasSize({
          width: canvasContainerRef.current.offsetWidth,
          height: canvasContainerRef.current.offsetHeight
        });
      }
    };
    
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);
  
  // Handle file upload
  const handleTriggerFileUpload = () => {
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.click();
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Process file upload
      console.log('File uploaded:', files[0].name);
    }
  };
  
  // Apply AI suggestion
  const handleApplySuggestion = (suggestion: any) => {
    console.log('Applying suggestion:', suggestion);
  };
  
  // Toggle sidebar collapse
  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Open node preview
  const openNodePreview = () => {
    if (selectedNode) {
      setNodePreviewOpen(true);
    }
  };

  // Handle execute workflow
  const handleExecute = async () => {
    if (!id) {
      setSaveModalOpened(true);
      return;
    }
    
    try {
      await executeWorkflow();
    } catch (error: any) {
      console.error('Error executing workflow:', error);
    }
  };
  
  // Navigate to dashboard
  const navigateToDashboard = () => {
    navigate('/dashboard');
  };
  
  // Open data source manager
  const openDataSourceManager = () => {
    setDataSourceModalOpen(true);
  };
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      background: theme.colors.gray[0],
      overflow: 'hidden'
    }}>
      {/* Enhanced Workflow Header */}
      <div style={{
        height: '60px',
        borderBottom: `1px solid ${theme.colors.gray[3]}`,
        background: 'white',
        width: '100%',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px'
      }}>
        <Group>
          <Tooltip label="Back to Dashboard">
            <ActionIcon size="lg" variant="subtle" onClick={navigateToDashboard}>
              <IconHome size={20} />
            </ActionIcon>
          </Tooltip>
          <Text fw={700} size="lg">{workflowName || 'New Workflow'}</Text>
        </Group>
        
        <Group>
          <Tooltip label="Add Data Source">
            <Button 
              variant="light" 
              leftSection={<IconDatabase size={16} />}
              onClick={openDataSourceManager}
            >
              Add Data
            </Button>
          </Tooltip>
          
          <Tooltip label="Save Workflow">
            <Button 
              variant="light" 
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={() => setSaveModalOpened(true)}
              loading={isSaving}
            >
              Save
            </Button>
          </Tooltip>
          
          <Tooltip label={isExecuting ? "Stop Execution" : "Execute Workflow"}>
            <Button 
              variant="filled" 
              color={isExecuting ? "red" : "blue"}
              leftSection={isExecuting ? <IconPlayerStop size={16} /> : <IconPlayerPlay size={16} />}
              onClick={handleExecute}
            >
              {isExecuting ? "Stop" : "Execute"}
            </Button>
          </Tooltip>
          
          <Group gap={8}>
            <Tooltip label="Export Workflow">
              <ActionIcon variant="subtle" size="lg">
                <IconDownload size={20} />
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label="Import Workflow">
              <ActionIcon variant="subtle" size="lg">
                <IconUpload size={20} />
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label="Share Workflow">
              <ActionIcon variant="subtle" size="lg">
                <IconShare size={20} />
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label="Help">
              <ActionIcon variant="subtle" size="lg">
                <IconHelp size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </div>
      
      {/* Main Content Area */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        height: 'calc(100vh - 60px)'
      }}>
        {/* Workflow Sidebar */}
        <div style={{
          width: sidebarCollapsed ? 60 : 320,
          height: '100%',
          transition: 'width 0.3s ease',
          borderRight: `1px solid ${theme.colors.gray[3]}`,
          zIndex: 90,
          background: 'white'
        }}>
          <WorkflowSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />
        </div>
        
        {/* Canvas Area */}
        <div style={{
          flex: 1,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: theme.colors.gray[0]
        }}>
          <div 
            ref={canvasContainerRef}
            style={{ 
              position: 'relative', 
              height: showExecutionPanel ? 'calc(100% - 200px)' : '100%',
              width: '100%',
              overflow: 'hidden',
              transition: 'height 0.3s ease'
            }}
          >
            {/* Main Canvas */}
            <WorkflowCanvas
              showMinimap={true}
              showControls={true}
              showTooltips={true}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
            />
          </div>
          
          {/* Execution Panel */}
          {showExecutionPanel && (
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              height: 200,
              zIndex: 10
            }}>
              <WorkflowExecutionPanel 
                expanded={true}
                onToggleExpand={() => setShowExecutionPanel(!showExecutionPanel)}
              />
            </div>
          )}
          
          {/* Floating button to show execution panel */}
          {!showExecutionPanel && (
            <div style={{ 
              position: 'absolute', 
              bottom: 20, 
              right: 20, 
              zIndex: 10 
            }}>
              <WorkflowExecutionPanel 
                expanded={false}
                onToggleExpand={() => setShowExecutionPanel(true)}
              />
            </div>
          )}
        </div>
        
        {/* Right Panel */}
        {(selectedNode || rightPanelTab !== 'config') && (
          <div style={{
            width: 350,
            height: '100%',
            borderLeft: `1px solid ${theme.colors.gray[3]}`,
            background: 'white',
            zIndex: 90
          }}>
            <Tabs value={rightPanelTab} onChange={setRightPanelTab}>
              <Tabs.List>
                <Tabs.Tab 
                  value="config" 
                  leftSection={<IconSettings size={16} />}
                >
                  Config
                </Tabs.Tab>
                <Tabs.Tab 
                  value="analytics" 
                  leftSection={<IconChartBar size={16} />}
                >
                  Analytics
                </Tabs.Tab>
                <Tabs.Tab 
                  value="variables" 
                  leftSection={<IconVariable size={16} />}
                >
                  Variables
                </Tabs.Tab>
                <Tabs.Tab 
                  value="ai" 
                  leftSection={<IconBrain size={16} />}
                >
                  AI
                </Tabs.Tab>
              </Tabs.List>
              
              <Tabs.Panel value="config" p="md">
                {selectedNode ? (
                  <>
                    <NodeConfigPanel onPreviewNode={openNodePreview} />
                  </>
                ) : (
                  <Text color="dimmed" ta="center" py="xl">
                    Select a node to configure
                  </Text>
                )}
              </Tabs.Panel>
              
              <Tabs.Panel value="analytics" style={{ height: 'calc(100vh - 120px)' }}>
                <Tabs defaultValue="stats">
                  <Tabs.List>
                    <Tabs.Tab value="stats" leftSection={<IconChartBar size={14} />}>Stats</Tabs.Tab>
                    <Tabs.Tab value="preview" leftSection={<IconTable size={14} />}>Preview</Tabs.Tab>
                    <Tabs.Tab value="lineage" leftSection={<IconArrowsRight size={14} />}>Lineage</Tabs.Tab>
                  </Tabs.List>
                  
                  <Tabs.Panel value="stats" style={{ height: 'calc(100vh - 170px)', overflow: 'auto' }}>
                    <WorkflowAnalytics />
                  </Tabs.Panel>
                  
                  <Tabs.Panel value="preview" style={{ height: 'calc(100vh - 170px)', overflow: 'auto' }}>
                    <DataPreview nodeId={selectedNode?.id} />
                  </Tabs.Panel>
                  
                  <Tabs.Panel value="lineage" style={{ height: 'calc(100vh - 170px)', overflow: 'auto' }}>
                    <DataLineageGraph />
                  </Tabs.Panel>
                </Tabs>
              </Tabs.Panel>
              
              <Tabs.Panel value="variables" style={{ height: 'calc(100vh - 120px)' }}>
                <WorkflowVariables />
              </Tabs.Panel>
              
              <Tabs.Panel value="ai" style={{ height: 'calc(100vh - 120px)' }}>
                <WorkflowAIChat onSuggestionApply={handleApplySuggestion} />
              </Tabs.Panel>
            </Tabs>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <WorkflowModals
        saveModalOpened={saveModalOpened}
        onSaveModalClose={() => setSaveModalOpened(false)}
        agentTopologyOpened={agentTopologyOpened}
        onAgentTopologyClose={() => setAgentTopologyOpened(false)}
        keyboardShortcutsOpened={keyboardShortcutsOpened}
        onKeyboardShortcutsClose={() => setKeyboardShortcutsOpened(false)}
        isSaving={isSaving}
      />
      
      {/* Data Source Modal */}
      <Modal 
        opened={dataSourceModalOpen} 
        onClose={() => setDataSourceModalOpen(false)}
        title="Data Sources"
        size="xl"
      >
        <DataSourceManager 
          onDataSourceSelect={(dataSource) => {
            console.log('Selected data source:', dataSource);
            setDataSourceModalOpen(false);
          }}
          initialTab="browse"
        />
      </Modal>
      
      {/* Node Preview Modal */}
      {selectedNode && (
        <NodePreview
          nodeId={selectedNode.id}
          nodeType={selectedNode.type}
          nodeLabel={selectedNode.data.label}
          isOpen={nodePreviewOpen}
          onClose={() => setNodePreviewOpen(false)}
          onExecute={() => console.log(`Executed preview for node: ${selectedNode.id}`)}
        />
      )}
      
      {/* Hidden file input for dataset uploads */}
      <input
        type="file"
        id="file-upload"
        style={{ display: 'none' }}
        accept=".csv,.json,.xlsx,.parquet"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default WorkflowPageNew; 
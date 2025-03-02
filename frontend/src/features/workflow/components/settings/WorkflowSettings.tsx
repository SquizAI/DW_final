import React, { useState } from 'react';
import { 
  Paper, 
  Title, 
  Text, 
  Switch, 
  Slider, 
  Select, 
  TextInput, 
  Button, 
  Group, 
  Stack, 
  Divider,
  Accordion,
  ColorInput,
  NumberInput,
  Tabs,
  ThemeIcon
} from '@mantine/core';
import { 
  IconSettings, 
  IconPalette, 
  IconBell, 
  IconShield, 
  IconDeviceFloppy,
  IconRefresh,
  IconEye,
  IconCpu,
  IconCloudUpload,
  IconDatabase
} from '@tabler/icons-react';
import { useWorkflow } from '../../WorkflowContext';

interface WorkflowSettingsProps {
  onSave?: () => void;
}

export const WorkflowSettings: React.FC<WorkflowSettingsProps> = ({
  onSave
}) => {
  const { workflowName, workflowDescription } = useWorkflow();
  
  // UI Settings
  const [showMinimap, setShowMinimap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [nodeBorderColor, setNodeBorderColor] = useState('#1c7ed6');
  const [nodeBackgroundColor, setNodeBackgroundColor] = useState('#e7f5ff');
  const [edgeColor, setEdgeColor] = useState('#adb5bd');
  const [theme, setTheme] = useState('light');
  
  // Execution Settings
  const [maxConcurrentNodes, setMaxConcurrentNodes] = useState(4);
  const [timeoutSeconds, setTimeoutSeconds] = useState(300);
  const [retryCount, setRetryCount] = useState(3);
  const [logLevel, setLogLevel] = useState('info');
  const [enableCaching, setEnableCaching] = useState(true);
  const [cacheExpiration, setCacheExpiration] = useState(60);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [notifyOnCompletion, setNotifyOnCompletion] = useState(true);
  const [notifyOnError, setNotifyOnError] = useState(true);
  const [emailAddress, setEmailAddress] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  
  // Security Settings
  const [requireAuthentication, setRequireAuthentication] = useState(true);
  const [enableEncryption, setEnableEncryption] = useState(true);
  const [accessLevel, setAccessLevel] = useState('private');
  const [dataRetentionDays, setDataRetentionDays] = useState(30);
  
  // Handle save settings
  const handleSaveSettings = () => {
    // In a real implementation, this would save the settings to the backend
    console.log('Saving workflow settings...');
    
    if (onSave) {
      onSave();
    }
  };
  
  // Handle reset settings
  const handleResetSettings = () => {
    // Reset to default values
    setShowMinimap(true);
    setShowGrid(true);
    setSnapToGrid(true);
    setGridSize(20);
    setNodeBorderColor('#1c7ed6');
    setNodeBackgroundColor('#e7f5ff');
    setEdgeColor('#adb5bd');
    setTheme('light');
    
    setMaxConcurrentNodes(4);
    setTimeoutSeconds(300);
    setRetryCount(3);
    setLogLevel('info');
    setEnableCaching(true);
    setCacheExpiration(60);
    
    setEmailNotifications(false);
    setSlackNotifications(false);
    setNotifyOnCompletion(true);
    setNotifyOnError(true);
    setEmailAddress('');
    setSlackWebhook('');
    
    setRequireAuthentication(true);
    setEnableEncryption(true);
    setAccessLevel('private');
    setDataRetentionDays(30);
  };
  
  return (
    <Paper p="md" withBorder>
      <Title order={4} mb="md">Workflow Settings</Title>
      
      <Tabs defaultValue="ui">
        <Tabs.List mb="md">
          <Tabs.Tab 
            value="ui" 
            leftSection={<IconPalette size={16} />}
          >
            UI Settings
          </Tabs.Tab>
          <Tabs.Tab 
            value="execution" 
            leftSection={<IconCpu size={16} />}
          >
            Execution
          </Tabs.Tab>
          <Tabs.Tab 
            value="notifications" 
            leftSection={<IconBell size={16} />}
          >
            Notifications
          </Tabs.Tab>
          <Tabs.Tab 
            value="security" 
            leftSection={<IconShield size={16} />}
          >
            Security
          </Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="ui">
          <Stack>
            <Group>
              <Switch
                label="Show Minimap"
                checked={showMinimap}
                onChange={(e) => setShowMinimap(e.currentTarget.checked)}
              />
              <Switch
                label="Show Grid"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.currentTarget.checked)}
              />
              <Switch
                label="Snap to Grid"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.currentTarget.checked)}
              />
            </Group>
            
            <Text size="sm" fw={500}>Grid Size</Text>
            <Slider
              value={gridSize}
              onChange={setGridSize}
              min={10}
              max={50}
              step={5}
              marks={[
                { value: 10, label: '10px' },
                { value: 20, label: '20px' },
                { value: 30, label: '30px' },
                { value: 40, label: '40px' },
                { value: 50, label: '50px' },
              ]}
            />
            
            <Divider my="sm" />
            
            <Text size="sm" fw={500}>Colors</Text>
            <Group grow>
              <ColorInput
                label="Node Border"
                value={nodeBorderColor}
                onChange={setNodeBorderColor}
                format="hex"
              />
              <ColorInput
                label="Node Background"
                value={nodeBackgroundColor}
                onChange={setNodeBackgroundColor}
                format="hex"
              />
              <ColorInput
                label="Edge Color"
                value={edgeColor}
                onChange={setEdgeColor}
                format="hex"
              />
            </Group>
            
            <Select
              label="Theme"
              value={theme}
              onChange={(value) => setTheme(value || 'light')}
              data={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System Default' }
              ]}
            />
          </Stack>
        </Tabs.Panel>
        
        <Tabs.Panel value="execution">
          <Stack>
            <NumberInput
              label="Maximum Concurrent Nodes"
              description="Maximum number of nodes that can execute simultaneously"
              value={maxConcurrentNodes}
              onChange={(value) => setMaxConcurrentNodes(Number(value))}
              min={1}
              max={10}
            />
            
            <NumberInput
              label="Execution Timeout (seconds)"
              description="Maximum time a node can run before timing out"
              value={timeoutSeconds}
              onChange={(value) => setTimeoutSeconds(Number(value))}
              min={30}
              max={3600}
            />
            
            <NumberInput
              label="Retry Count"
              description="Number of times to retry a failed node"
              value={retryCount}
              onChange={(value) => setRetryCount(Number(value))}
              min={0}
              max={10}
            />
            
            <Select
              label="Log Level"
              description="Verbosity of execution logs"
              value={logLevel}
              onChange={(value) => setLogLevel(value || 'info')}
              data={[
                { value: 'debug', label: 'Debug' },
                { value: 'info', label: 'Info' },
                { value: 'warning', label: 'Warning' },
                { value: 'error', label: 'Error' }
              ]}
            />
            
            <Divider my="sm" />
            
            <Switch
              label="Enable Result Caching"
              description="Cache node results to improve performance for repeated executions"
              checked={enableCaching}
              onChange={(e) => setEnableCaching(e.currentTarget.checked)}
            />
            
            {enableCaching && (
              <NumberInput
                label="Cache Expiration (minutes)"
                description="Time before cached results expire"
                value={cacheExpiration}
                onChange={(value) => setCacheExpiration(Number(value))}
                min={5}
                max={1440}
              />
            )}
          </Stack>
        </Tabs.Panel>
        
        <Tabs.Panel value="notifications">
          <Stack>
            <Group>
              <Switch
                label="Email Notifications"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.currentTarget.checked)}
              />
              <Switch
                label="Slack Notifications"
                checked={slackNotifications}
                onChange={(e) => setSlackNotifications(e.currentTarget.checked)}
              />
            </Group>
            
            <Group>
              <Switch
                label="Notify on Completion"
                checked={notifyOnCompletion}
                onChange={(e) => setNotifyOnCompletion(e.currentTarget.checked)}
              />
              <Switch
                label="Notify on Error"
                checked={notifyOnError}
                onChange={(e) => setNotifyOnError(e.currentTarget.checked)}
              />
            </Group>
            
            <Divider my="sm" />
            
            {emailNotifications && (
              <TextInput
                label="Email Address"
                placeholder="Enter email address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.currentTarget.value)}
              />
            )}
            
            {slackNotifications && (
              <TextInput
                label="Slack Webhook URL"
                placeholder="Enter Slack webhook URL"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.currentTarget.value)}
              />
            )}
          </Stack>
        </Tabs.Panel>
        
        <Tabs.Panel value="security">
          <Stack>
            <Switch
              label="Require Authentication"
              description="Require users to authenticate before accessing this workflow"
              checked={requireAuthentication}
              onChange={(e) => setRequireAuthentication(e.currentTarget.checked)}
            />
            
            <Switch
              label="Enable Data Encryption"
              description="Encrypt sensitive data in this workflow"
              checked={enableEncryption}
              onChange={(e) => setEnableEncryption(e.currentTarget.checked)}
            />
            
            <Select
              label="Access Level"
              description="Who can access this workflow"
              value={accessLevel}
              onChange={(value) => setAccessLevel(value || 'private')}
              data={[
                { value: 'private', label: 'Private (Only me)' },
                { value: 'team', label: 'Team (My team members)' },
                { value: 'organization', label: 'Organization (Everyone in my organization)' },
                { value: 'public', label: 'Public (Anyone with the link)' }
              ]}
            />
            
            <NumberInput
              label="Data Retention Period (days)"
              description="How long to keep execution results"
              value={dataRetentionDays}
              onChange={(value) => setDataRetentionDays(Number(value))}
              min={1}
              max={365}
            />
          </Stack>
        </Tabs.Panel>
      </Tabs>
      
      <Divider my="md" />
      
      <Group position="right">
        <Button 
          variant="light" 
          leftSection={<IconRefresh size={16} />}
          onClick={handleResetSettings}
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

export default WorkflowSettings; 
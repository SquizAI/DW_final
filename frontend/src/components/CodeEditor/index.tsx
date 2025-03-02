import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { Box, Paper, Tabs, ActionIcon, Group, Button, Text, ThemeIcon } from '@mantine/core';
import { IconPlayerPlay, IconDeviceFloppy, IconCode, IconTerminal, IconMarkdown } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

/* Insert override constant for Editor component */
const MonacoEditor = Editor as unknown as React.FC<any>;

interface CodeEditorProps {
  defaultLanguage?: string;
  defaultValue?: string;
  onExecute?: (code: string) => void;
  onSave?: (code: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({
  defaultLanguage = 'python',
  defaultValue = '',
  onExecute,
  onSave,
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [activeTab, setActiveTab] = React.useState<string | null>('code');
  const [output, setOutput] = React.useState<string>('');

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    
    // Add custom themes if needed
    monaco.editor.defineTheme('customTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1A1B1E',
      },
    });
    
    monaco.editor.setTheme('customTheme');
  };

  const handleExecute = async () => {
    if (!editorRef.current) return;
    
    const code = editorRef.current.getValue();
    try {
      if (onExecute) {
        await onExecute(code);
      } else {
        // Default execution logic
        setOutput('Executing code...\n');
        // Here you would typically send the code to your backend
        setOutput(output + '\nExecution complete!');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to execute code',
        color: 'red',
      });
    }
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    
    const code = editorRef.current.getValue();
    try {
      if (onSave) {
        await onSave(code);
      }
      notifications.show({
        title: 'Success',
        message: 'Code saved successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save code',
        color: 'red',
      });
    }
  };

  return (
    <Paper withBorder p="md">
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Group justify="space-between" mb="md">
          <Tabs.List>
            <Tabs.Tab
              value="code"
              leftSection={<IconCode size={14} />}
            >
              Code
            </Tabs.Tab>
            <Tabs.Tab
              value="output"
              leftSection={<IconTerminal size={14} />}
            >
              Output
            </Tabs.Tab>
          </Tabs.List>
          
          <Group>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconDeviceFloppy size={14} />}
              onClick={handleSave}
              disabled={readOnly}
            >
              Save
            </Button>
            <Button
              size="sm"
              leftSection={<IconPlayerPlay size={14} />}
              onClick={handleExecute}
              disabled={readOnly}
            >
              Run
            </Button>
          </Group>
        </Group>

        <Tabs.Panel value="code">
          <Box h={400}>
            <MonacoEditor
              height="100%"
              defaultLanguage={defaultLanguage}
              defaultValue={defaultValue}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                readOnly,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="output">
          <Box
            h={400}
            bg="dark.8"
            p="md"
            style={{
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              overflowY: 'auto',
            }}
          >
            {output || 'No output yet...'}
          </Box>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
} 
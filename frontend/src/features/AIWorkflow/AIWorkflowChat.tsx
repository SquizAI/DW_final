import React, { useState, useEffect } from 'react';
import { Card, Stack, TextInput, Button, Group, Text, Loader } from '@mantine/core';

interface Message {
  sender: 'assistant' | 'user';
  text: string;
}

export function AIWorkflowChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // On mount, send welcome message with suggestions
    const initialMessage: Message = {
      sender: 'assistant',
      text: 'Welcome to AI Data Magic! What would you like to do today? You can choose from: Analyze Data, Clean Data, Visualize Data, or Report Data.'
    };
    setMessages([initialMessage]);
    setSuggestions(['Analyze Data', 'Clean Data', 'Visualize Data', 'Report Data']);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg: Message = { sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSuggestions([]);
    simulateAssistantResponse(inputText);
  };

  const simulateAssistantResponse = (userInput: string) => {
    setLoading(true);
    setTimeout(() => {
      let response = '';
      let newSuggestions: string[] = [];
      const lowerInput = userInput.toLowerCase();
      if (lowerInput.includes('analyze')) {
        response = "Great choice! Our Analyze Data tool uncovers insights and trends. Would you like to see some example reports?";
        newSuggestions = ['Show Reports', 'More Options'];
      } else if (lowerInput.includes('clean')) {
        response = "Data cleaning is essential. We can help remove anomalies and fill missing values. Would you like to proceed with cleaning?";
        newSuggestions = ['Proceed with Cleaning', 'More Options'];
      } else if (lowerInput.includes('visualize')) {
        response = "Visualizations help reveal patterns. Would you like to generate some charts and graphs?";
        newSuggestions = ['Generate Visuals', 'More Options'];
      } else if (lowerInput.includes('report')) {
        response = "A comprehensive report can summarize your data findings. Would you like to generate one now?";
        newSuggestions = ['Generate Report', 'More Options'];
      } else {
        response = "I'm not sure I understood that. Could you please select one of the options: Analyze Data, Clean Data, Visualize Data, or Report Data?";
        newSuggestions = ['Analyze Data', 'Clean Data', 'Visualize Data', 'Report Data'];
      }
      const assistantMsg: Message = { sender: 'assistant', text: response };
      setMessages(prev => [...prev, assistantMsg]);
      setSuggestions(newSuggestions);
      setLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const userMsg: Message = { sender: 'user', text: suggestion };
    setMessages(prev => [...prev, userMsg]);
    setSuggestions([]);
    simulateAssistantResponse(suggestion);
  };

  return (
    <Card withBorder shadow="sm" p="xl">
      <Stack gap="md">
        {messages.map((msg, index) => (
          <Text key={index} color={msg.sender === 'assistant' ? 'blue' : 'black'}>
            {msg.text}
          </Text>
        ))}
        {loading && <Loader size="sm" />}
        {suggestions.length > 0 && (
          <Group gap="xs" mt="md">
            {suggestions.map((s, index) => (
              <Button key={index} variant="outline" onClick={() => handleSuggestionClick(s)}>
                {s}
              </Button>
            ))}
          </Group>
        )}
      </Stack>
      <Group mt="md">
        <TextInput
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button onClick={handleSend}>Send</Button>
      </Group>
    </Card>
  );
} 
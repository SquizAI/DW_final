import React from 'react';
import { Card, Title, List, Tooltip } from '@mantine/core';
import { AITools } from '../constants/aiTools';

export function AITooltips() {
  return (
    <Card withBorder shadow="sm" p="xl" mt="xl">
      <Title order={4}>Available AI Tools</Title>
      <List spacing="sm" size="sm" mt="md">
        {AITools.map((tool, index) => (
          <List.Item key={index}>
            <Tooltip label={tool.description} color="blue">
              <span>{tool.name}</span>
            </Tooltip>
          </List.Item>
        ))}
      </List>
    </Card>
  );
} 
import React, { useState } from 'react';
import { AppShell } from '@mantine/core';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AIAssistantModal } from '../AIAssistantModal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, setOpened] = useState(false);
  const [aiHelperOpened, setAiHelperOpened] = useState(false);

  return (
    <AppShell
      layout="default"
      header={{ height: 60 }}
      navbar={{ 
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
    >
      <AppShell.Header>
        <Header 
          onMenuClick={() => setOpened(o => !o)}
          onAIHelperOpen={() => setAiHelperOpened(true)}
        />
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>

      <AIAssistantModal
        opened={aiHelperOpened}
        onClose={() => setAiHelperOpened(false)}
      />
    </AppShell>
  );
} 
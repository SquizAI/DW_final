import { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';
import type { AIState, AIContextType, ContextAnalysisResponse } from './types';

interface DataInsight {
  type: 'warning' | 'suggestion' | 'insight';
  message: string;
  confidence: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

interface WorkflowSuggestion {
  id: string;
  name: string;
  description: string;
  confidence: number;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  type: string;
  params: Record<string, any>;
  description: string;
}

const AIContext = createContext<AIContextType | null>(null);

const DEFAULT_STATE: AIState = {
  isAnalyzing: false,
  suggestedWorkflows: [],
  dataInsights: [],
  userIntent: null,
  confidence: 0,
};

export function AIContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AIState>(DEFAULT_STATE);

  // Continuously monitor user actions and context
  useQuery({
    queryKey: ['ai-context-analysis'],
    queryFn: async (): Promise<ContextAnalysisResponse> => {
      try {
        const response = await fetch('/api/ai/analyze-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPath: window.location.pathname,
            recentActions: [], // TODO: Implement action tracking
            activeDatasets: [], // TODO: Implement dataset tracking
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze context');
        }

        const data = await response.json();
        return data;
      } catch (error) {
        showNotification({
          title: 'Error',
          message: 'Failed to analyze context. Please try again later.',
          color: 'red',
          icon: <IconX size={16} />,
        });
        return { insights: [], suggestedWorkflows: [] };
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000,
    select: (data: ContextAnalysisResponse) => {
      if (data.insights?.length > 0 || data.suggestedWorkflows?.length > 0) {
        setState(prev => ({
          ...prev,
          dataInsights: [...(prev.dataInsights || []), ...(data.insights || [])],
          suggestedWorkflows: data.suggestedWorkflows || [],
        }));
      }
      return data;
    },
    retry: 1,
  });

  const analyzeUserIntent = async (input: string) => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    try {
      const response = await fetch('/api/ai/analyze-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze intent');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        userIntent: data.intent,
        confidence: data.confidence,
        suggestedWorkflows: data.workflows || [],
      }));
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to analyze intent. Please try again.',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/ai/execute-workflow/${workflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to execute workflow');
      }

      return response.json();
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to execute workflow. Please try again.',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  const getDatasetRecommendations = async () => {
    try {
      const response = await fetch('/api/ai/dataset-recommendations');
      
      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        dataInsights: [...(prev.dataInsights || []), ...(data.insights || [])],
      }));
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to get dataset recommendations.',
        color: 'red',
        icon: <IconX size={16} />,
      });
    }
  };

  return (
    <AIContext.Provider
      value={{
        ...state,
        analyzeUserIntent,
        executeWorkflow,
        getDatasetRecommendations,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIContextProvider');
  }
  return context;
}; 
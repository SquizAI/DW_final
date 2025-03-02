import React from 'react';
import { IconChartBar, IconChartPie, IconLayoutDashboard } from '@tabler/icons-react';
import { BaseNode } from './BaseNode';
import { NodeData } from './types';

const VISUALIZATION_CAPABILITIES = [
  {
    id: 'auto-viz',
    label: 'Smart Visualization',
    description: 'AI-powered automatic visualization selection',
    function: async (input: any) => {
      // Smart visualization implementation
      return { success: true };
    }
  },
  {
    id: 'interactive-dashboard',
    label: 'Interactive Dashboard',
    description: 'Create interactive dashboards with widgets',
    function: async (input: any) => {
      // Dashboard implementation
      return { success: true };
    }
  },
  {
    id: 'statistical-plots',
    label: 'Statistical Analysis',
    description: 'Generate statistical plots and analyses',
    function: async (input: any) => {
      // Statistical plots implementation
      return { success: true };
    }
  },
  {
    id: 'custom-charts',
    label: 'Custom Charts',
    description: 'Create and customize advanced visualizations',
    function: async (input: any) => {
      // Custom charts implementation
      return { success: true };
    }
  }
];

interface VisualizationNodeProps {
  data: NodeData;
  onShowCapabilities?: () => void;
  onShowDetails?: () => void;
}

export const VisualizationNode: React.FC<VisualizationNodeProps> = (props) => {
  const enhancedData: NodeData = {
    ...props.data,
    type: 'visualization',
    capabilities: VISUALIZATION_CAPABILITIES,
    icon: props.data.icon || <IconChartBar size={20} />,
    tags: [...(props.data.tags || []), 'visualization']
  };

  return (
    <BaseNode
      data={enhancedData}
      onShowCapabilities={props.onShowCapabilities}
      onShowDetails={props.onShowDetails}
    />
  );
}; 
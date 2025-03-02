import React from 'react';
import { IconBrain, IconChartDots, IconRobot } from '@tabler/icons-react';
import { BaseNode } from './BaseNode';
import { NodeData } from './types';

const ANALYSIS_CAPABILITIES = [
  {
    id: 'automl',
    label: 'AutoML',
    description: 'Automated machine learning with model selection',
    function: async (input: any) => {
      // AutoML implementation
      return { success: true };
    }
  },
  {
    id: 'feature-engineering',
    label: 'Feature Engineering',
    description: 'Automated feature engineering and selection',
    function: async (input: any) => {
      // Feature engineering implementation
      return { success: true };
    }
  },
  {
    id: 'model-evaluation',
    label: 'Model Evaluation',
    description: 'Comprehensive model evaluation and metrics',
    function: async (input: any) => {
      // Model evaluation implementation
      return { success: true };
    }
  },
  {
    id: 'hyperparameter-tuning',
    label: 'Hyperparameter Tuning',
    description: 'Automated hyperparameter optimization',
    function: async (input: any) => {
      // Hyperparameter tuning implementation
      return { success: true };
    }
  }
];

interface AnalysisNodeProps {
  data: NodeData;
  onShowCapabilities?: () => void;
  onShowDetails?: () => void;
}

export const AnalysisNode: React.FC<AnalysisNodeProps> = (props) => {
  const enhancedData: NodeData = {
    ...props.data,
    type: 'analysis',
    capabilities: ANALYSIS_CAPABILITIES,
    icon: props.data.icon || <IconBrain size={20} />,
    tags: [...(props.data.tags || []), 'machine-learning']
  };

  return (
    <BaseNode
      data={enhancedData}
      onShowCapabilities={props.onShowCapabilities}
      onShowDetails={props.onShowDetails}
    />
  );
}; 
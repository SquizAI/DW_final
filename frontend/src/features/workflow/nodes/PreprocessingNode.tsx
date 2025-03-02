import React from 'react';
import { IconWand, IconTools, IconAdjustments } from '@tabler/icons-react';
import { BaseNode } from './BaseNode';
import { NodeData } from './types';

const PREPROCESSING_CAPABILITIES = [
  {
    id: 'auto-clean',
    label: 'Auto Clean',
    description: 'Automatically detect and clean data issues',
    function: async (input: any) => {
      // Auto cleaning implementation
      return { success: true };
    }
  },
  {
    id: 'missing-values',
    label: 'Missing Values',
    description: 'Handle missing values with advanced imputation',
    function: async (input: any) => {
      // Missing values handling implementation
      return { success: true };
    }
  },
  {
    id: 'outliers',
    label: 'Outlier Detection',
    description: 'Detect and handle outliers in your data',
    function: async (input: any) => {
      // Outlier detection implementation
      return { success: true };
    }
  },
  {
    id: 'validation',
    label: 'Data Validation',
    description: 'Set up data validation rules and quality checks',
    function: async (input: any) => {
      // Data validation implementation
      return { success: true };
    }
  }
];

interface PreprocessingNodeProps {
  data: NodeData;
  onShowCapabilities?: () => void;
  onShowDetails?: () => void;
}

export const PreprocessingNode: React.FC<PreprocessingNodeProps> = (props) => {
  const enhancedData: NodeData = {
    ...props.data,
    type: 'preprocessing',
    capabilities: PREPROCESSING_CAPABILITIES,
    icon: props.data.icon || <IconWand size={20} />,
    tags: [...(props.data.tags || []), 'data-quality']
  };

  return (
    <BaseNode
      data={enhancedData}
      onShowCapabilities={props.onShowCapabilities}
      onShowDetails={props.onShowDetails}
    />
  );
}; 
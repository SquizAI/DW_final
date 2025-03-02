import React from 'react';
import { DataSourceManager as BaseDataSourceManager } from '../../components/data/DataSourceManager';
import { DataSource } from '../../contexts/DataSourceContext';

interface WorkflowDataSourceManagerProps {
  onDataSourceSelect?: (dataSource: DataSource) => void;
  initialTab?: string;
}

/**
 * DataSourceManager component for the workflow editor
 * This is a wrapper around the base DataSourceManager component
 * that adds workflow-specific functionality
 */
export function DataSourceManager({
  onDataSourceSelect,
  initialTab = 'browse'
}: WorkflowDataSourceManagerProps) {
  // Handle data source selection
  const handleDataSourceSelect = (dataSource: DataSource) => {
    // Add workflow-specific handling here
    console.log('Selected data source in workflow:', dataSource);
    
    // Call the parent handler if provided
    if (onDataSourceSelect) {
      onDataSourceSelect(dataSource);
    }
  };

  return (
    <BaseDataSourceManager
      onDataSourceSelect={handleDataSourceSelect}
      initialTab={initialTab}
    />
  );
} 
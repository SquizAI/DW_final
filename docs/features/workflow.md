# workflow Feature

## Overview

This documentation is automatically generated for the workflow feature.

## Files

```
frontend/src/features/workflow/AIAssistantPanel.tsx
frontend/src/features/workflow/DataExportPanel.tsx
frontend/src/features/workflow/DataLineageGraph.tsx
frontend/src/features/workflow/DataPreview.tsx
frontend/src/features/workflow/DataQualityPanel.tsx
frontend/src/features/workflow/DataSourceManager.tsx
frontend/src/features/workflow/DataSourcesPanel.tsx
frontend/src/features/workflow/DataTransformPanel.tsx
frontend/src/features/workflow/DataVisualizationPanel.tsx
frontend/src/features/workflow/NodeConfigPanel.tsx
frontend/src/features/workflow/WorkflowAIChat.tsx
frontend/src/features/workflow/WorkflowAnalytics.tsx
frontend/src/features/workflow/WorkflowCanvas.tsx
frontend/src/features/workflow/WorkflowContext.tsx
frontend/src/features/workflow/WorkflowExecutionPanel.tsx
frontend/src/features/workflow/WorkflowPageNew.tsx
frontend/src/features/workflow/WorkflowSettings.tsx
frontend/src/features/workflow/WorkflowTemplates.tsx
frontend/src/features/workflow/WorkflowVariables.tsx
frontend/src/features/workflow/agents/AgentTopology.tsx
frontend/src/features/workflow/agents/AlgorithmVisualizer.tsx
frontend/src/features/workflow/builder/NodeConfigPanel.tsx
frontend/src/features/workflow/builder/NodeToolbar.tsx
frontend/src/features/workflow/builder/WorkflowCanvas.tsx
frontend/src/features/workflow/builder/index.ts
frontend/src/features/workflow/builder/nodes/AINode.tsx
frontend/src/features/workflow/builder/nodes/AnalysisNode.tsx
frontend/src/features/workflow/builder/nodes/DataNode.tsx
frontend/src/features/workflow/builder/nodes/ExportNode.tsx
frontend/src/features/workflow/builder/nodes/TransformNode.tsx
frontend/src/features/workflow/builder/nodes/VisualNode.tsx
frontend/src/features/workflow/builder/nodes/index.ts
frontend/src/features/workflow/builder/types.ts
frontend/src/features/workflow/components/ai/AIAssistantPanel.tsx
frontend/src/features/workflow/components/ai/WorkflowAIChat.tsx
frontend/src/features/workflow/components/analytics/WorkflowAnalytics.tsx
frontend/src/features/workflow/components/canvas/WorkflowCanvas.tsx
frontend/src/features/workflow/components/config/NodeConfigPanel.tsx
frontend/src/features/workflow/components/data/DataPreview.tsx
frontend/src/features/workflow/components/execution/WorkflowExecutionPanel.tsx
frontend/src/features/workflow/components/header/WorkflowHeader.tsx
frontend/src/features/workflow/components/lineage/DataLineageGraph.tsx
frontend/src/features/workflow/components/modals/WorkflowModals.tsx
frontend/src/features/workflow/components/settings/WorkflowSettings.tsx
frontend/src/features/workflow/components/sidebar/WorkflowSidebar.tsx
frontend/src/features/workflow/components/sidebar/components/NodeCategoryComponent.tsx
frontend/src/features/workflow/components/sidebar/components/NodeDetailsPanel.tsx
frontend/src/features/workflow/components/sidebar/components/NodeFavoritesPanel.tsx
frontend/src/features/workflow/components/sidebar/components/NodeFilterPanel.tsx
frontend/src/features/workflow/components/sidebar/components/NodeHistoryPanel.tsx
frontend/src/features/workflow/components/sidebar/components/NodeItemComponent.tsx
frontend/src/features/workflow/components/sidebar/components/NodeSettingsPanel.tsx
frontend/src/features/workflow/components/sidebar/components/NodeTemplatesPanel.tsx
frontend/src/features/workflow/components/templates/WorkflowTemplates.tsx
frontend/src/features/workflow/components/variables/WorkflowVariables.tsx
frontend/src/features/workflow/nodes/AINode.tsx
frontend/src/features/workflow/nodes/AnalysisNode.tsx
frontend/src/features/workflow/nodes/BaseNode.tsx
frontend/src/features/workflow/nodes/BinaryClassifierNode.tsx
frontend/src/features/workflow/nodes/DataBinningNode.tsx
frontend/src/features/workflow/nodes/DataIngestionNode.tsx
frontend/src/features/workflow/nodes/DataMergerNode.tsx
frontend/src/features/workflow/nodes/DataNode.tsx
frontend/src/features/workflow/nodes/DatasetLoaderNode.tsx
frontend/src/features/workflow/nodes/EDAAnalysisNode.tsx
frontend/src/features/workflow/nodes/ExportNode.tsx
frontend/src/features/workflow/nodes/FeatureEngineerNode.tsx
frontend/src/features/workflow/nodes/FeatureImportanceNode.tsx
frontend/src/features/workflow/nodes/LambdaFunctionNode.tsx
frontend/src/features/workflow/nodes/PreprocessingNode.tsx
frontend/src/features/workflow/nodes/QualityCheckerNode.tsx
frontend/src/features/workflow/nodes/ReportGeneratorNode.tsx
frontend/src/features/workflow/nodes/StructuralAnalysisNode.tsx
frontend/src/features/workflow/nodes/TransformNode.tsx
frontend/src/features/workflow/nodes/VisualNode.tsx
frontend/src/features/workflow/nodes/VisualizationNode.tsx
frontend/src/features/workflow/nodes/index.ts
frontend/src/features/workflow/nodes/reactflow.d.ts
frontend/src/features/workflow/nodes/types.ts
frontend/src/features/workflow/utils/nodeUtils.ts
```

## Components

- sidebar
- settings
- config
- panels
- modals
- canvas
- lineage
- variables
- execution
- ai
- templates
- data
- header
- analytics

## Dependencies

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/AIAssistantPanel.tsx:        importanceScores: response.data.importance_scores,
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/AIAssistantPanel.tsx:import React, { useState, useEffect } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/AIAssistantPanel.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/AIAssistantPanel.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/AIAssistantPanel.tsx:import { Node, Edge } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/AIAssistantPanel.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/AIAssistantPanel.tsx:import { useDisclosure } from '@mantine/hooks';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataExportPanel.tsx:import axios from 'axios';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataExportPanel.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataExportPanel.tsx:import { IconDownload, IconInfoCircle } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataExportPanel.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataExportPanel.tsx:import { useQuery, useMutation } from '@tanstack/react-query';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataExportPanel.tsx:import { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataExportPanel.tsx:import { z } from 'zod';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataLineageGraph.tsx:import 'reactflow/dist/style.css';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataLineageGraph.tsx:import ReactFlow, {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataLineageGraph.tsx:import axios from 'axios';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataLineageGraph.tsx:import { Paper, Title, Text, Group, Badge, Stack, Card, Loader, Box } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataLineageGraph.tsx:import { useCallback, useMemo } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataLineageGraph.tsx:import { useQuery } from '@tanstack/react-query';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataPreview.tsx:import axios from 'axios';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataPreview.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataPreview.tsx:import { useQuery } from '@tanstack/react-query';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataPreview.tsx:import { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataQualityPanel.tsx:import axios from 'axios';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataQualityPanel.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataQualityPanel.tsx:import { IconPlus, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataQualityPanel.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataQualityPanel.tsx:import { useQuery, useMutation } from '@tanstack/react-query';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataQualityPanel.tsx:import { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourceManager.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourceManager.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourceManager.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourceManager.tsx:import { useDisclosure } from '@mantine/hooks';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:        message: error.response?.data?.detail || 'Failed to import from Kafka',
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:        message: error.response?.data?.detail || 'Failed to import from MongoDB',
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:        message: error.response?.data?.detail || 'Failed to import from S3',
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:        message: error.response?.data?.detail || 'Failed to import from SQL',
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:      const response = await axios.post('/kafka/import', config);
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:      const response = await axios.post('/mongodb/import', config);
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:      const response = await axios.post('/s3/import', config);
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:      const response = await axios.post('/sql/import', config);
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:import axios from 'axios';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:import { useQuery, useMutation } from '@tanstack/react-query';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataSourcesPanel.tsx:import { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataTransformPanel.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataTransformPanel.tsx:import { DataPreview, DataTransformConfig } from '../../types/data';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataTransformPanel.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataTransformPanel.tsx:import { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataVisualizationPanel.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/DataVisualizationPanel.tsx:import { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/NodeConfigPanel.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/NodeConfigPanel.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/NodeConfigPanel.tsx:import { Node } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/NodeConfigPanel.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowAIChat.tsx:import { IconSend, IconRobot, IconUser } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowAIChat.tsx:import { Node, Edge } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowAIChat.tsx:import { Paper, TextInput, Button, Text, Stack, ScrollArea, Box, Group, Loader } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowAIChat.tsx:import { useMutation } from '@tanstack/react-query';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowAIChat.tsx:import { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowAnalytics.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowAnalytics.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowCanvas.tsx:import ReactFlow, {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowCanvas.tsx:import { Box } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowContext.tsx:        importance: {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowContext.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowContext.tsx:import { Edge, Position, XYPosition } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowContext.tsx:import { createContext, useContext, useState, useCallback, useEffect } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowContext.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowExecutionPanel.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowExecutionPanel.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowExecutionPanel.tsx:import { useDisclosure } from '@mantine/hooks';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowPageNew.tsx:import React, { useState, useEffect, useRef } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowPageNew.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowPageNew.tsx:import { AppShell, Box, Grid, Tabs, useMantineTheme } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowPageNew.tsx:import { useParams } from 'react-router-dom';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowSettings.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowSettings.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowSettings.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowTemplates.tsx:                    message: 'Template import feature is coming soon!',
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowTemplates.tsx:    description: 'Advanced feature engineering workflow with automated feature selection and importance analysis.',
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowTemplates.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowTemplates.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowTemplates.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowTemplates.tsx:import { useDisclosure } from '@mantine/hooks';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowVariables.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowVariables.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowVariables.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/WorkflowVariables.tsx:import { useDisclosure } from '@mantine/hooks';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/agents/AgentTopology.tsx:              { value: 'feature_importance', label: 'Feature Importance' },
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/agents/AgentTopology.tsx:import 'reactflow/dist/style.css';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/agents/AgentTopology.tsx:import React, { useState, useEffect, useCallback } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/agents/AgentTopology.tsx:import ReactFlow, {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/agents/AgentTopology.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/agents/AgentTopology.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/agents/AlgorithmVisualizer.tsx:import React, { useState, useEffect, useRef } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/agents/AlgorithmVisualizer.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/NodeConfigPanel.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/NodeConfigPanel.tsx:import { useEffect, useMemo } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/NodeConfigPanel.tsx:import { useForm } from '@mantine/form';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/NodeToolbar.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/NodeToolbar.tsx:import { Group, Paper, Tooltip, ActionIcon, Text, Stack } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/WorkflowCanvas.tsx:import ReactFlow, {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/WorkflowCanvas.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/WorkflowCanvas.tsx:import { Box, ActionIcon, Tooltip, Group } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/WorkflowCanvas.tsx:import { useCallback, useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/AINode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/AINode.tsx:import { IconBrain } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/AINode.tsx:import { Paper, Text, Group, ThemeIcon, Badge, Progress } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/AINode.tsx:import { WorkflowNodeData } from '../types';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/AnalysisNode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/AnalysisNode.tsx:import { IconChartBar } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/AnalysisNode.tsx:import { Paper, Text, Group, ThemeIcon, Badge } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/AnalysisNode.tsx:import { WorkflowNodeData } from '../types';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/DataNode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/DataNode.tsx:import { IconTable } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/DataNode.tsx:import { Paper, Text, Group, ThemeIcon, Badge } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/DataNode.tsx:import { WorkflowNodeData } from '../types';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/ExportNode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/ExportNode.tsx:import { IconFileExport } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/ExportNode.tsx:import { Paper, Text, Group, ThemeIcon, Badge, Progress } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/ExportNode.tsx:import { WorkflowNodeData } from '../types';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/TransformNode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/TransformNode.tsx:import { IconTransform } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/TransformNode.tsx:import { Paper, Text, Group, ThemeIcon, Badge } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/TransformNode.tsx:import { WorkflowNodeData } from '../types';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/VisualNode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/VisualNode.tsx:import { IconChartPie } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/VisualNode.tsx:import { Paper, Text, Group, ThemeIcon, Badge } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/VisualNode.tsx:import { WorkflowNodeData } from '../types';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/nodes/index.ts:import { NodeTypes } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/builder/types.ts:import { Node, Edge } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/ai/AIAssistantPanel.tsx:It works by training a model (usually a Random Forest) and measuring how much each feature contributes to the prediction accuracy. Features with higher importance scores have a stronger influence on the target variable.
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/ai/AIAssistantPanel.tsx:You can configure this node to use different methods for calculating importance, such as permutation importance or SHAP values.`;
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/ai/AIAssistantPanel.tsx:import React, { useState, useRef, useEffect } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/ai/AIAssistantPanel.tsx:import pandas as pd
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/ai/AIAssistantPanel.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/ai/AIAssistantPanel.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/ai/WorkflowAIChat.tsx:import React, { useState, useRef, useEffect } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/ai/WorkflowAIChat.tsx:import pandas as pd
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/ai/WorkflowAIChat.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/ai/WorkflowAIChat.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/analytics/WorkflowAnalytics.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/analytics/WorkflowAnalytics.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/analytics/WorkflowAnalytics.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/canvas/WorkflowCanvas.tsx:import 'reactflow/dist/style.css';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/canvas/WorkflowCanvas.tsx:import React, { useCallback, useState, useRef, useEffect } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/canvas/WorkflowCanvas.tsx:import ReactFlow, {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/canvas/WorkflowCanvas.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/canvas/WorkflowCanvas.tsx:import { Box, ActionIcon, Tooltip, Group, Paper, Text, RingProgress } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/canvas/WorkflowCanvas.tsx:import { WorkflowNode } from '../../nodes/reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/canvas/WorkflowCanvas.tsx:import { nodeTypes } from '../../nodes';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/canvas/WorkflowCanvas.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/config/NodeConfigPanel.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/config/NodeConfigPanel.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/config/NodeConfigPanel.tsx:import { WorkflowNode } from '../../nodes/reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/config/NodeConfigPanel.tsx:import { WorkflowNodeData } from '../../nodes/types';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/config/NodeConfigPanel.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/data/DataPreview.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/data/DataPreview.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/data/DataPreview.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/execution/WorkflowExecutionPanel.tsx:import React, { useState, useEffect, useRef } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/execution/WorkflowExecutionPanel.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/execution/WorkflowExecutionPanel.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/header/WorkflowHeader.tsx:              onClick={() => window.open('https://colab.research.google.com/import', '_blank')}
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/header/WorkflowHeader.tsx:import React, { useState, useRef, useEffect } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/header/WorkflowHeader.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/header/WorkflowHeader.tsx:import { Group, Title, Text, Button, Tooltip, ActionIcon, Menu, rem, ThemeIcon, Kbd, TextInput } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/header/WorkflowHeader.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/header/WorkflowHeader.tsx:import { useNavigate } from 'react-router-dom';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/header/WorkflowHeader.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/lineage/DataLineageGraph.tsx:import 'reactflow/dist/style.css';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/lineage/DataLineageGraph.tsx:import React, { useState, useCallback, useEffect } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/lineage/DataLineageGraph.tsx:import ReactFlow, {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/lineage/DataLineageGraph.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/lineage/DataLineageGraph.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/modals/WorkflowModals.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/modals/WorkflowModals.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/modals/WorkflowModals.tsx:import { AgentTopology } from '../../agents/AgentTopology';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/modals/WorkflowModals.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/settings/WorkflowSettings.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/settings/WorkflowSettings.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/settings/WorkflowSettings.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/WorkflowSidebar.tsx:        description: 'Analyze feature importance',
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/WorkflowSidebar.tsx:        documentation: 'https://docs.example.com/nodes/feature-importance'
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/WorkflowSidebar.tsx:        tags: ['import', 'csv', 'database'],
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/WorkflowSidebar.tsx:        tags: ['importance', 'ranking', 'features'],
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/WorkflowSidebar.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/WorkflowSidebar.tsx:import { DragDropContext, DropResult } from 'react-beautiful-dnd';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/WorkflowSidebar.tsx:import { useCallback, useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeCategoryComponent.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeCategoryComponent.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeCategoryComponent.tsx:import { Droppable } from 'react-beautiful-dnd';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeDetailsPanel.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeDetailsPanel.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeDetailsPanel.tsx:import { NodeType } from '../../../utils/nodeUtils';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeFavoritesPanel.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeFavoritesPanel.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeFavoritesPanel.tsx:import { NodeType } from '../../../utils/nodeUtils';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeFilterPanel.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeFilterPanel.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeHistoryPanel.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeHistoryPanel.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeHistoryPanel.tsx:import { NodeType } from '../../../utils/nodeUtils';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeItemComponent.tsx:import React, { useState, useRef, useEffect } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeItemComponent.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeItemComponent.tsx:import { Draggable } from 'react-beautiful-dnd';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeItemComponent.tsx:import { useHover } from '@mantine/hooks';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeSettingsPanel.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeSettingsPanel.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeTemplatesPanel.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/sidebar/components/NodeTemplatesPanel.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/templates/WorkflowTemplates.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/templates/WorkflowTemplates.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/templates/WorkflowTemplates.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:              disabled={!importText.trim()}
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:            Paste JSON array of variables to import. This will replace all existing variables.
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:            value={importText}
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:          onVariableChange(importedVariables);
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:        opened={importModalOpen}
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:        setVariables(importedVariables);
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:      const importedVariables = JSON.parse(importText);
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:      if (Array.isArray(importedVariables)) {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:  const [importModalOpen, setImportModalOpen] = useState(false);
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:  const [importText, setImportText] = useState('');
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/components/variables/WorkflowVariables.tsx:import { useWorkflow } from '../../WorkflowContext';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/AINode.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/AINode.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/AINode.tsx:import { AgentTopology } from '../agents/AgentTopology';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/AINode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/AnalysisNode.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/AnalysisNode.tsx:import { IconBrain, IconChartDots, IconRobot } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/BaseNode.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/BaseNode.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/BaseNode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/BinaryClassifierNode.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/BinaryClassifierNode.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/BinaryClassifierNode.tsx:import { Handle, Position, NodeProps } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DataBinningNode.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DataBinningNode.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DataBinningNode.tsx:import { Handle, Position, NodeProps } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DataIngestionNode.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DataIngestionNode.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DataIngestionNode.tsx:import { Dropzone, FileWithPath } from '@mantine/dropzone';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DataMergerNode.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DataMergerNode.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DataMergerNode.tsx:import { Handle, Position, NodeProps } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DataNode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DataNode.tsx:import { IconTable } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DataNode.tsx:import { Paper, Text, Group, ThemeIcon, Badge } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DatasetLoaderNode.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DatasetLoaderNode.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DatasetLoaderNode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/DatasetLoaderNode.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/EDAAnalysisNode.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/EDAAnalysisNode.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/EDAAnalysisNode.tsx:import { Handle, Position, NodeProps } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/ExportNode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/ExportNode.tsx:import { IconDownload } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/ExportNode.tsx:import { Paper, Text, Group, ThemeIcon, Badge, Progress } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/FeatureEngineerNode.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/FeatureEngineerNode.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/FeatureEngineerNode.tsx:import { Handle, Position, NodeProps } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/FeatureImportanceNode.tsx:          {method === 'permutation' && 'Measures importance by randomly shuffling feature values and observing the decrease in model performance.'}
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/FeatureImportanceNode.tsx:          {method === 'random_forest' && 'Uses Random Forest model to calculate feature importance based on Gini impurity or entropy reduction.'}
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/FeatureImportanceNode.tsx:  // Get importance color
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/FeatureImportanceNode.tsx:  // Get importance description
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/FeatureImportanceNode.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/FeatureImportanceNode.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/FeatureImportanceNode.tsx:import { Handle, Position, NodeProps } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/LambdaFunctionNode.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/LambdaFunctionNode.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/LambdaFunctionNode.tsx:import { Handle, Position, NodeProps } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/PreprocessingNode.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/PreprocessingNode.tsx:import { IconWand, IconTools, IconAdjustments } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/QualityCheckerNode.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/QualityCheckerNode.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/QualityCheckerNode.tsx:import { Handle, Position, NodeProps } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/ReportGeneratorNode.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/ReportGeneratorNode.tsx:import { 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/ReportGeneratorNode.tsx:import { Handle, Position, NodeProps } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/StructuralAnalysisNode.tsx:import React, { useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/StructuralAnalysisNode.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/StructuralAnalysisNode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/StructuralAnalysisNode.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/TransformNode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/TransformNode.tsx:import { IconTransform } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/TransformNode.tsx:import { Paper, Text, Group, ThemeIcon, Badge } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/VisualNode.tsx:import { Handle, Position } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/VisualNode.tsx:import { IconChartPie } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/VisualNode.tsx:import { Paper, Text, Group, ThemeIcon } from '@mantine/core';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/VisualizationNode.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/VisualizationNode.tsx:import { IconChartBar, IconChartPie, IconLayoutDashboard } from '@tabler/icons-react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/index.ts:import { NodeTypes } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/reactflow.d.ts:import { Node as ReactFlowNode, XYPosition } from 'reactflow';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/types.ts:  importance?: {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/nodes/types.ts:import { ReactNode } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/features/workflow/utils/nodeUtils.ts:import { nodeTypes } from '../nodes';
```

## Last Updated

Wed Feb 26 21:17:52 EST 2025

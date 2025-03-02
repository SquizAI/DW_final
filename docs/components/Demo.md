# Demo Component

## Overview

This documentation is automatically generated for the Demo component.

## Files

```
frontend/src/components/Demo/AgenticTopologyDemo.tsx
frontend/src/components/Demo/ExecutionStatus.tsx
frontend/src/components/Demo/InsightsPanel.tsx
frontend/src/components/Demo/ResultsVisualization.tsx
frontend/src/components/Demo/WorkflowVisualization.tsx
```

## Dependencies

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/AgenticTopologyDemo.tsx:import React, { useState, useEffect } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/AgenticTopologyDemo.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/AgenticTopologyDemo.tsx:import { notifications } from '@mantine/notifications';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/ExecutionStatus.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/ExecutionStatus.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/InsightsPanel.tsx:              <Text>{mockInsights.model_insights.feature_importance_analysis}</Text>
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/InsightsPanel.tsx:      feature_importance_analysis: "The model identified monthly charges, contract type, and tenure as the three most predictive features, collectively accounting for 68% of the model's predictive power.",
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/InsightsPanel.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/InsightsPanel.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/ResultsVisualization.tsx:                          width: `${(importance as number) * 100}%`, 
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/ResultsVisualization.tsx:                  <Table.Td>{(importance as number * 100).toFixed(1)}%</Table.Td>
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/ResultsVisualization.tsx:              .map(([feature, importance]) => (
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/ResultsVisualization.tsx:            {Object.entries(classificationResults.feature_importance)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/ResultsVisualization.tsx:    feature_importance: {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/ResultsVisualization.tsx:import React from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/ResultsVisualization.tsx:import {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/WorkflowVisualization.tsx:import React, { useEffect, useState } from 'react';
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/frontend/src/components/Demo/WorkflowVisualization.tsx:import {
```

## Usage

Check the component files for usage examples.

## Last Updated

Wed Feb 26 21:17:52 EST 2025

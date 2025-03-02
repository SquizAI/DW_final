# Workflow Node Types

This document provides an overview of the node types available in the Data Whisperer workflow editor. For detailed information about each node category, please refer to the specific documentation files.

## Overview

The workflow editor supports various node types for data processing, analysis, and visualization. Each node type has specific inputs, outputs, and configuration options designed to handle different aspects of the data science workflow.

## Node Categories

Nodes are organized into the following categories:

1. [**Data Sources**](./nodes/DATA_SOURCE_NODES.md): Nodes for loading and importing data
2. [**Data Preparation**](./nodes/DATA_PREPARATION_NODES.md): Nodes for cleaning and transforming data
3. [**Analysis**](./nodes/ANALYSIS_NODES.md): Nodes for analyzing data
4. [**Visualization**](./nodes/VISUALIZATION_NODES.md): Nodes for creating visualizations
5. [**Machine Learning**](./nodes/MACHINE_LEARNING_NODES.md): Nodes for training and evaluating models
6. [**Output**](./nodes/OUTPUT_NODES.md): Nodes for exporting and reporting results

## Node Architecture

Each node in the Data Whisperer workflow editor follows a consistent architecture:

### Components

1. **Frontend Component**: React component that renders the node in the workflow editor
2. **Backend Processor**: Python class that executes the node's functionality
3. **Schema Definition**: TypeScript and Python schemas that define the node's inputs, outputs, and configuration

### Lifecycle

1. **Creation**: Node is added to the workflow canvas
2. **Configuration**: User configures the node's parameters
3. **Validation**: Node validates its configuration
4. **Execution**: Node processes its inputs and produces outputs
5. **Monitoring**: Node reports its progress and status
6. **Completion**: Node finalizes its execution and makes outputs available

## Node Connections

Nodes can be connected to create a workflow. Each node has input and output ports that can be connected to other nodes. The data flows from one node to another through these connections.

### Connection Types

- **Data Connections**: Transfer datasets between nodes
- **Control Connections**: Determine execution order
- **Parameter Connections**: Pass configuration parameters between nodes

## Node State

Each node has a state that indicates its current status:

- **Idle**: The node is waiting for input or execution
- **Learning**: The node is analyzing the data
- **Working**: The node is processing the data
- **Completed**: The node has completed its processing
- **Error**: The node encountered an error during processing

## Node Validation

Nodes validate their inputs and configuration before execution. If validation fails, the node will enter an error state and provide information about the validation errors.

### Validation Levels

1. **Schema Validation**: Ensures the node's configuration matches its schema
2. **Type Validation**: Ensures input data types match expected types
3. **Semantic Validation**: Ensures the node's configuration makes logical sense
4. **Dependency Validation**: Ensures required dependencies are available

## Custom Node Development

The Data Whisperer platform supports the development of custom nodes. For information on creating custom nodes, please refer to the [Custom Node Development Guide](./CUSTOM_NODE_DEVELOPMENT.md). 
# Data Whisperer Workflow Editor

The Workflow Editor is the central component of Data Whisperer, where you design, configure, and execute data processing workflows. This document provides a comprehensive guide to using the Workflow Editor effectively.

## Overview

The Workflow Editor provides a visual canvas where you can create data processing pipelines by connecting nodes that represent different operations. The intuitive drag-and-drop interface makes it easy to design complex workflows without writing code.

## Modern UI Components

The Workflow Editor is built with modern UI components that provide a seamless and responsive user experience:

### React Flow Integration

The canvas is powered by [React Flow](https://reactflow.dev/), a highly customizable library for building node-based editors and interactive diagrams. Key features include:

- **Smooth interactions**: Drag-and-drop nodes with fluid animations
- **Custom node types**: Visually distinct nodes for different operations
- **Interactive connections**: Create and modify connections between nodes
- **Minimap**: Navigate complex workflows with an overview map
- **Controls**: Zoom, pan, and fit view controls for easy navigation
- **Selection**: Select multiple nodes for batch operations

### Mantine UI Framework

The interface uses the [Mantine](https://mantine.dev/) UI framework, providing:

- **Consistent styling**: Unified design language across all components
- **Responsive layouts**: Adapts to different screen sizes
- **Dark mode support**: Toggle between light and dark themes
- **Accessible components**: WCAG-compliant UI elements
- **Rich form controls**: Advanced inputs for node configuration

## Interface Components

### Canvas

The canvas is the main area where you build your workflow. It provides a visual representation of your data processing pipeline, showing nodes and the connections between them.

**Features:**
- **Grid background**: Visual reference for alignment
- **Infinite canvas**: Unlimited space for complex workflows
- **Node snapping**: Automatic alignment of nodes
- **Multi-selection**: Select and move multiple nodes at once
- **Keyboard shortcuts**: Efficient workflow editing

### Node Library

The Node Library contains all available nodes organized by category. You can search for specific nodes or browse by category to find the nodes you need.

**Categories:**
- **Data**: Nodes for loading and transforming data
- **Transformation**: Nodes for data manipulation and feature engineering
- **Analysis**: Nodes for statistical analysis and visualization
- **Export**: Nodes for saving and exporting results

**Features:**
- **Search**: Find nodes by name, description, or tags
- **Favorites**: Mark frequently used nodes for quick access
- **Drag-and-drop**: Add nodes to the canvas with a simple drag
- **Node details**: View detailed information about each node
- **Difficulty indicators**: See the complexity level of each node

### Properties Panel

The Properties Panel displays the configuration options for the currently selected node. Here you can set parameters, configure inputs and outputs, and customize the node's behavior.

**Features:**
- **Dynamic forms**: Context-aware configuration options
- **Validation**: Real-time validation of inputs
- **Help text**: Guidance for each configuration option
- **Preview**: See the effect of changes in real-time
- **Advanced options**: Toggle visibility of advanced settings

### Toolbar

The toolbar provides access to common actions such as saving, running, and debugging your workflow. It also includes tools for zooming, panning, and arranging nodes on the canvas.

**Actions:**
- **Save**: Save the current workflow
- **Execute**: Run the entire workflow
- **Preview**: Preview the output of selected nodes
- **Undo/Redo**: Navigate through edit history
- **Layout**: Automatically arrange nodes for better readability
- **Export**: Export the workflow as JSON or image

### Execution Panel

The Execution Panel shows the status and progress of your workflow when it's running. It displays logs, errors, and performance metrics to help you monitor and debug your workflow.

**Features:**
- **Progress tracking**: Visual indication of execution progress
- **Node status**: See which nodes are running, completed, or failed
- **Execution time**: Track the performance of each node
- **Error handling**: Detailed error messages with suggestions
- **Data preview**: Examine intermediate results

## FastAPI Integration

The Workflow Editor is tightly integrated with a powerful FastAPI backend, providing robust data processing capabilities:

### API Endpoints

The editor communicates with the following FastAPI endpoints:

- **GET /api/workflows**: Retrieve all workflows
- **GET /api/workflows/{id}**: Get a specific workflow
- **POST /api/workflows**: Create a new workflow
- **PUT /api/workflows/{id}**: Update an existing workflow
- **DELETE /api/workflows/{id}**: Delete a workflow
- **POST /api/workflows/{id}/execute**: Execute a workflow
- **GET /api/workflows/{id}/status**: Get execution status
- **POST /api/workflows/node-preview**: Preview a single node's output

### Data Processing Engine

The backend provides a powerful data processing engine that:

- **Executes nodes**: Processes data according to node configurations
- **Manages data flow**: Passes data between connected nodes
- **Handles large datasets**: Efficiently processes big data
- **Provides caching**: Caches intermediate results for performance
- **Supports parallel execution**: Runs independent nodes concurrently

### Real-time Updates

The editor receives real-time updates from the backend:

- **Execution progress**: Live updates on workflow execution
- **Node status changes**: Immediate notification of node completion or failure
- **Data previews**: Real-time data samples for inspection
- **Error notifications**: Instant alerts for execution issues

## Creating a Workflow

### Adding Nodes

To add a node to your workflow:

1. Find the node you want in the Node Library.
2. Drag it onto the canvas.
3. Position it where you want it in your workflow.

Alternatively, you can:
- Double-click on the canvas to open a quick-add menu
- Use the "+" button in the toolbar to add a node at the center
- Right-click on the canvas for a context menu with node options

### Connecting Nodes

To connect nodes:

1. Click on an output port of a node.
2. Drag to an input port of another node.
3. Release to create the connection.

Different types of connections are represented by different colors:

- **Blue**: Data connections
- **Green**: Model connections
- **Purple**: Visualization connections
- **Orange**: Control flow connections

### Configuring Nodes

To configure a node:

1. Click on the node to select it.
2. Use the Properties Panel to set parameters and options.
3. Click "Apply" to save the configuration.

Many nodes provide interactive previews of their outputs to help you configure them correctly.

## Running a Workflow

### Execution Controls

The Workflow Editor provides several options for running your workflow:

- **Run**: Executes the entire workflow from start to finish.
- **Run Selected**: Runs only the selected node and its dependencies.
- **Debug**: Runs the workflow in debug mode, with additional logging and step-by-step execution.
- **Schedule**: Sets up automatic execution of the workflow on a schedule.

### Monitoring Execution

During execution, you can monitor the progress of your workflow:

- The status of each node is indicated by its color (idle, running, completed, error).
- The Execution Panel shows logs and performance metrics.
- You can view intermediate outputs by clicking on nodes during or after execution.

### Handling Errors

If an error occurs during execution:

1. The node where the error occurred is highlighted in red.
2. The Execution Panel shows the error message and stack trace.
3. You can click on the node to see more details about the error.
4. After fixing the issue, you can resume execution from the failed node.

## Advanced Features

### Node Preview

The Node Preview feature allows you to execute a single node without running the entire workflow:

1. Select a node in the canvas.
2. Click the "Preview" button in the Properties Panel.
3. View the output data, schema, and statistics.
4. Download the preview data as CSV for further analysis.

This feature is powered by the `/api/workflows/node-preview` endpoint, which processes the node configuration and returns the results.

### Data Lineage Visualization

The Data Lineage feature provides a visual representation of how data flows through your workflow:

1. Click the "Data Lineage" button in the toolbar.
2. View a graph showing data sources, transformations, and outputs.
3. Hover over nodes to see detailed information.
4. Use the visualization to identify data dependencies and potential issues.

### AI-Assisted Workflow Creation

The AI Assistant helps you build and optimize workflows:

1. Click the "AI Assistant" button in the toolbar.
2. Describe what you want to achieve in natural language.
3. The assistant suggests nodes and configurations.
4. Apply the suggestions with a single click.

This feature uses OpenAI's API to analyze your workflow and provide intelligent recommendations.

### Workflow Variables

Workflow variables allow you to parameterize your workflow:

1. Define variables in the Workflow Settings.
2. Use variables in node configurations using the `${variable_name}` syntax.
3. Set variable values when running the workflow or in scheduled executions.

### Conditional Branches

You can create conditional branches in your workflow:

1. Add a "Condition" node to your workflow.
2. Configure the condition based on data values or variables.
3. Connect the "true" and "false" outputs to different branches of your workflow.

### Loops

For iterative processing, you can create loops:

1. Add a "Loop" node to your workflow.
2. Configure the loop parameters (iteration variable, range, etc.).
3. Connect nodes inside the loop body.
4. Use the loop iteration variable in node configurations.

## Best Practices

### Workflow Organization

- **Group related nodes**: Use groups to organize your workflow logically.
- **Use clear node names**: Rename nodes to describe their purpose.
- **Add comments**: Use comment nodes to document your workflow.
- **Create modular workflows**: Break complex workflows into smaller, reusable subworkflows.

### Performance Optimization

- **Filter early**: Reduce data volume as early as possible in the workflow.
- **Use caching**: Enable caching for nodes with expensive computations.
- **Parallelize when possible**: Use parallel execution for independent branches.
- **Monitor resource usage**: Check memory and CPU usage during execution.

### Version Control

- **Save versions**: Create named versions of your workflow at important milestones.
- **Document changes**: Add descriptions to versions to track what changed.
- **Test before committing**: Validate changes before saving a new version.
- **Use branching**: Create branches for experimental changes.

## Keyboard Shortcuts

| Action | Shortcut (Windows/Linux) | Shortcut (macOS) |
|--------|--------------------------|------------------|
| Save | Ctrl+S | Cmd+S |
| Run | Ctrl+R | Cmd+R |
| Copy | Ctrl+C | Cmd+C |
| Paste | Ctrl+V | Cmd+V |
| Undo | Ctrl+Z | Cmd+Z |
| Redo | Ctrl+Y | Cmd+Shift+Z |
| Delete | Delete | Delete |
| Select All | Ctrl+A | Cmd+A |
| Zoom In | Ctrl++ | Cmd++ |
| Zoom Out | Ctrl+- | Cmd+- |
| Fit to Screen | Ctrl+0 | Cmd+0 |

## Troubleshooting

### Common Issues

- **Node configuration errors**: Check the node's configuration in the Properties Panel.
- **Connection type mismatches**: Ensure you're connecting compatible input and output ports.
- **Resource limitations**: Check if your workflow is using too much memory or CPU.
- **Data format issues**: Verify that the data format matches what the node expects.
- **API connection problems**: Ensure the backend API is running and accessible.

### Debugging Techniques

- **Enable debug mode**: Run the workflow in debug mode for more detailed logs.
- **Inspect intermediate outputs**: Click on nodes to view their outputs during or after execution.
- **Add debug nodes**: Insert "Debug" nodes to log intermediate values.
- **Check node status**: Look at the status indicators on nodes to identify where issues occur.
- **Check API responses**: Use browser developer tools to inspect API calls and responses.

## Related Documentation

- [Workflow Nodes](./WORKFLOW_NODES.md): Detailed information about all available node types.
- [Data Explorer](./DATA_EXPLORER.md): How to use the Data Explorer to interact with your data.
- [Scheduling](./SCHEDULING.md): How to set up automatic execution of workflows.
- [Version Control](./VERSION_CONTROL.md): How to manage workflow versions. 
# Workflow Editor

The Workflow Editor is the central component of Data Whisperer, where you design, configure, and execute data processing workflows. This document provides a comprehensive guide to using the Workflow Editor effectively.

## Overview

The Workflow Editor provides a visual canvas where you can create data processing pipelines by connecting nodes that represent different operations. The intuitive drag-and-drop interface makes it easy to design complex workflows without writing code.

## Interface Components

### Canvas

The canvas is the main area where you build your workflow. It provides a visual representation of your data processing pipeline, showing nodes and the connections between them.

### Node Library

The Node Library contains all available nodes organized by category. You can search for specific nodes or browse by category to find the nodes you need.

### Properties Panel

The Properties Panel displays the configuration options for the currently selected node. Here you can set parameters, configure inputs and outputs, and customize the node's behavior.

### Toolbar

The toolbar provides access to common actions such as saving, running, and debugging your workflow. It also includes tools for zooming, panning, and arranging nodes on the canvas.

### Execution Panel

The Execution Panel shows the status and progress of your workflow when it's running. It displays logs, errors, and performance metrics to help you monitor and debug your workflow.

## Creating a Workflow

### Adding Nodes

To add a node to your workflow:

1. Find the node you want in the Node Library.
2. Drag it onto the canvas.
3. Position it where you want it in your workflow.

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

### Subworkflows

For complex workflows, you can create reusable subworkflows:

1. Create a new workflow that performs a specific task.
2. Save it as a subworkflow.
3. Add a "Subworkflow" node to your main workflow.
4. Select the saved subworkflow.
5. Configure inputs and outputs.

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

### Debugging Techniques

- **Enable debug mode**: Run the workflow in debug mode for more detailed logs.
- **Inspect intermediate outputs**: Click on nodes to view their outputs during or after execution.
- **Add debug nodes**: Insert "Debug" nodes to log intermediate values.
- **Check node status**: Look at the status indicators on nodes to identify where issues occur.

## Related Documentation

- [Node Types](./nodes/README.md): Detailed information about all available node types.
- [Data Explorer](./DATA_EXPLORER.md): How to use the Data Explorer to interact with your data.
- [Scheduling](./SCHEDULING.md): How to set up automatic execution of workflows.
- [Version Control](./VERSION_CONTROL.md): How to manage workflow versions. 
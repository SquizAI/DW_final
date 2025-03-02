# Quick Start Guide

This guide will help you get started with Data Whisperer quickly. We'll walk through the installation process, setting up your first workflow, and running a basic analysis.

## Installation

### System Requirements

Before installing Data Whisperer, ensure your system meets the following requirements:

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+, CentOS 8+)
- **CPU**: 4+ cores recommended
- **RAM**: 8GB minimum, 16GB+ recommended
- **Disk Space**: 10GB minimum
- **Browser**: Chrome 90+, Firefox 90+, Edge 90+, Safari 15+

### Installation Options

#### Option 1: Docker (Recommended)

The easiest way to get started is using Docker:

```bash
# Pull the Data Whisperer image
docker pull datawhisperer/platform:latest

# Run the container
docker run -d -p 8080:8080 -v dw-data:/data datawhisperer/platform:latest
```

Once the container is running, access Data Whisperer at `http://localhost:8080`.

#### Option 2: Native Installation

1. Download the installer for your operating system from [our website](https://datawhisperer.io/download).
2. Run the installer and follow the on-screen instructions.
3. Launch Data Whisperer from your applications menu or desktop shortcut.

#### Option 3: Cloud Instance

You can also use Data Whisperer in the cloud without any installation:

1. Sign up for an account at [app.datawhisperer.io](https://app.datawhisperer.io).
2. Log in to access your cloud instance.

## First Login

After installation, you'll need to create an account or log in:

1. Open Data Whisperer in your browser.
2. Click "Create Account" if you're a new user, or "Log In" if you already have an account.
3. Follow the prompts to complete the setup process.

## Creating Your First Workflow

Let's create a simple workflow to analyze a dataset:

1. **Create a New Workflow**:
   - Click the "New Workflow" button on the dashboard.
   - Enter a name for your workflow (e.g., "My First Analysis").
   - Click "Create".

2. **Add a Data Source Node**:
   - Drag a "Dataset Loader" node from the node library to the canvas.
   - Click on the node to configure it.
   - Select "Sample Dataset" from the dropdown menu.
   - Choose "Retail Sales" as the dataset.
   - Click "Apply".

3. **Add a Data Preparation Node**:
   - Drag a "Data Cleaner" node to the canvas.
   - Connect the output of the "Dataset Loader" to the input of the "Data Cleaner".
   - Configure the node to handle missing values and remove duplicates.
   - Click "Apply".

4. **Add an Analysis Node**:
   - Drag an "EDA Analysis" node to the canvas.
   - Connect the output of the "Data Cleaner" to the input of the "EDA Analysis".
   - Configure the node to analyze sales patterns.
   - Click "Apply".

5. **Add a Visualization Node**:
   - Drag a "Chart Generator" node to the canvas.
   - Connect the output of the "EDA Analysis" to the input of the "Chart Generator".
   - Configure the node to create a bar chart of sales by category.
   - Click "Apply".

6. **Add an Output Node**:
   - Drag a "Report Generator" node to the canvas.
   - Connect the outputs of the "EDA Analysis" and "Chart Generator" to the inputs of the "Report Generator".
   - Configure the node to create a PDF report.
   - Click "Apply".

## Running Your Workflow

Now that you've created your workflow, let's run it:

1. Click the "Run" button in the top toolbar.
2. Monitor the progress in the execution panel.
3. Once the workflow completes, click on the "Report Generator" node to view the generated report.

## Exploring the Results

After running the workflow, you can explore the results:

1. Click on any node to view its outputs.
2. Use the data explorer to interact with the data.
3. View the generated visualizations and reports.
4. Export the results if needed.

## Next Steps

Congratulations! You've created and run your first Data Whisperer workflow. Here are some next steps to explore:

- **Try Different Datasets**: Load your own data or explore other sample datasets.
- **Experiment with Nodes**: Try different node types and configurations.
- **Create More Complex Workflows**: Add branching, loops, and conditional logic.
- **Schedule Your Workflow**: Set up automatic execution on a schedule.
- **Share Your Results**: Export reports or share dashboards with colleagues.

## Getting Help

If you need assistance, there are several resources available:

- **Documentation**: Explore the rest of our documentation for detailed information.
- **Tutorials**: Check out our [tutorials](https://datawhisperer.io/tutorials) for step-by-step guides.
- **Community Forum**: Join our [community forum](https://community.datawhisperer.io) to ask questions and share ideas.
- **Support**: Contact our support team at support@datawhisperer.io.

Happy data whispering! 
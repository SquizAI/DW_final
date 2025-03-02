# Data Explorer

The Data Explorer is a powerful component of Data Whisperer that allows you to interactively explore, visualize, and understand your data. This document provides a comprehensive guide to using the Data Explorer effectively.

## Overview

The Data Explorer provides an intuitive interface for exploring datasets, examining data distributions, identifying patterns, and generating visualizations. It helps you gain insights into your data before, during, and after workflow execution.

## Accessing the Data Explorer

There are several ways to access the Data Explorer:

1. **From the Dashboard**: Click on a dataset in the "Recent Datasets" section.
2. **From a Workflow**: Click on a node's output in the Workflow Editor.
3. **From the Data Catalog**: Click on any dataset in the Data Catalog.
4. **Direct Navigation**: Click on "Data Explorer" in the main navigation menu.

## Interface Components

### Data Grid

The Data Grid displays your data in a tabular format, similar to a spreadsheet. It provides the following features:

- **Sorting**: Click on column headers to sort data.
- **Filtering**: Use the filter row to filter data by column values.
- **Pagination**: Navigate through large datasets using pagination controls.
- **Column Resizing**: Drag column borders to resize columns.
- **Column Reordering**: Drag column headers to reorder columns.
- **Cell Formatting**: Automatic formatting based on data types.

### Data Summary

The Data Summary panel provides an overview of your dataset:

- **Row Count**: Total number of rows in the dataset.
- **Column Count**: Total number of columns in the dataset.
- **Data Types**: Distribution of data types across columns.
- **Missing Values**: Summary of missing values in the dataset.
- **Memory Usage**: Estimated memory usage of the dataset.

### Column Details

The Column Details panel shows detailed information about the selected column:

- **Data Type**: The detected data type of the column.
- **Unique Values**: Number of unique values in the column.
- **Missing Values**: Number and percentage of missing values.
- **Statistical Summary**: Min, max, mean, median, standard deviation, etc.
- **Distribution Visualization**: Histogram or bar chart showing the distribution.

### Visualization Panel

The Visualization Panel allows you to create and customize visualizations:

- **Chart Types**: Bar charts, line charts, scatter plots, histograms, box plots, etc.
- **Chart Configuration**: X and Y axes, color, size, facets, etc.
- **Interactive Controls**: Zoom, pan, selection, tooltips, etc.
- **Export Options**: Save visualizations as images or interactive HTML.

### Query Builder

The Query Builder enables you to create custom queries to filter and transform your data:

- **Filter Builder**: Create complex filter conditions using a visual interface.
- **Aggregation**: Group data and calculate aggregates (sum, average, count, etc.).
- **Sorting**: Specify sort order for results.
- **Limit**: Limit the number of rows returned.

## Exploring Data

### Basic Data Exploration

To start exploring a dataset:

1. Load the dataset in the Data Explorer.
2. Examine the Data Summary to understand the overall structure.
3. Scroll through the Data Grid to get a feel for the data.
4. Click on column headers to sort and explore patterns.
5. Use filters to focus on specific subsets of data.

### Column Analysis

To analyze a specific column:

1. Click on the column header to select it.
2. View the Column Details panel to see statistics and distribution.
3. Use the Visualization Panel to create charts for deeper analysis.
4. Check for outliers, missing values, and unusual patterns.

### Multi-Column Analysis

To analyze relationships between columns:

1. Select multiple columns using Ctrl/Cmd+click.
2. Use the Visualization Panel to create scatter plots, correlation matrices, or other multi-variable charts.
3. Look for correlations, clusters, and patterns.

## Creating Visualizations

### Quick Visualizations

For quick visualizations:

1. Select one or more columns in the Data Grid.
2. Click the "Visualize" button in the toolbar.
3. Choose a recommended chart type from the suggestions.
4. The visualization will be created automatically based on the data types.

### Custom Visualizations

For more control over your visualizations:

1. Open the Visualization Panel.
2. Select a chart type from the available options.
3. Configure the chart by mapping columns to visual properties (X-axis, Y-axis, color, etc.).
4. Customize the appearance using the styling options.
5. Add titles, labels, and annotations as needed.

### Saving and Sharing Visualizations

To save and share your visualizations:

1. Click the "Save" button in the Visualization Panel.
2. Enter a name and description for the visualization.
3. Choose whether to save it to your personal collection or a shared project.
4. Use the "Export" button to download the visualization as an image or HTML file.
5. Use the "Share" button to generate a shareable link or embed code.

## Advanced Features

### Data Transformations

The Data Explorer allows you to perform various transformations on your data:

- **Filtering**: Filter rows based on column values.
- **Sorting**: Sort data by one or more columns.
- **Aggregation**: Group data and calculate aggregates.
- **Pivoting**: Create pivot tables to summarize data.
- **Sampling**: Work with a random sample of large datasets.
- **Derived Columns**: Create new columns based on expressions.

### Statistical Analysis

For statistical analysis:

1. Select a column or multiple columns.
2. Click the "Statistics" button in the toolbar.
3. Choose from available statistical tests and analyses.
4. View the results in the Statistics Panel.

Available analyses include:

- **Descriptive Statistics**: Mean, median, mode, standard deviation, etc.
- **Distribution Tests**: Normality tests, distribution fitting, etc.
- **Correlation Analysis**: Pearson, Spearman, and other correlation measures.
- **Hypothesis Testing**: t-tests, chi-square tests, ANOVA, etc.

### Data Quality Assessment

To assess data quality:

1. Click the "Data Quality" button in the toolbar.
2. View the Data Quality Report showing issues and recommendations.
3. Click on specific issues to see details and affected rows.
4. Use the suggested fixes to address quality issues.

The Data Quality Assessment checks for:

- **Missing Values**: Identifies columns with missing values.
- **Outliers**: Detects potential outliers in numerical columns.
- **Inconsistencies**: Finds inconsistent values in categorical columns.
- **Format Issues**: Identifies values that don't match the expected format.
- **Duplicates**: Detects duplicate rows or values.

### Data Profiling

For comprehensive data profiling:

1. Click the "Profile" button in the toolbar.
2. Wait for the profiling process to complete.
3. View the Data Profile Report showing detailed analysis of each column.

The Data Profile includes:

- **Value Distributions**: Histograms and frequency tables.
- **Pattern Analysis**: Common patterns in string columns.
- **Cardinality Analysis**: Unique value counts and ratios.
- **Correlation Matrix**: Correlations between numerical columns.
- **Dependency Analysis**: Potential functional dependencies between columns.

## Integration with Workflows

The Data Explorer integrates seamlessly with the Workflow Editor:

- **Explore Node Outputs**: Click on any node in a workflow to explore its output data.
- **Create Nodes from Explorations**: Generate workflow nodes based on your explorations.
- **Compare Datasets**: Compare datasets before and after transformations.
- **Debug Workflows**: Identify issues by examining intermediate data.

## Best Practices

### Performance Tips

For optimal performance with large datasets:

- **Use Sampling**: Enable sampling for initial exploration of large datasets.
- **Limit Columns**: Focus on relevant columns instead of loading all columns.
- **Apply Filters Early**: Filter data to reduce the working set size.
- **Use Aggregation**: Aggregate data when possible to reduce the number of rows.
- **Close Unused Tabs**: Close Data Explorer tabs you're not actively using.

### Exploration Workflow

A recommended workflow for data exploration:

1. **Start with Summary**: Begin by examining the Data Summary to understand the overall structure.
2. **Check Data Quality**: Run a Data Quality Assessment to identify potential issues.
3. **Explore Key Columns**: Focus on columns that are most relevant to your analysis.
4. **Look for Relationships**: Analyze relationships between key variables.
5. **Create Visualizations**: Create visualizations to communicate your findings.
6. **Document Insights**: Document your insights and observations.

## Keyboard Shortcuts

| Action | Shortcut (Windows/Linux) | Shortcut (macOS) |
|--------|--------------------------|------------------|
| Refresh Data | F5 | Cmd+R |
| Filter | Ctrl+F | Cmd+F |
| Clear Filters | Alt+C | Option+C |
| Select All Cells | Ctrl+A | Cmd+A |
| Copy Selected Cells | Ctrl+C | Cmd+C |
| Export Data | Ctrl+E | Cmd+E |
| Create Visualization | Ctrl+V | Cmd+V |
| Show Statistics | Ctrl+S | Cmd+S |
| Toggle Data Types | Ctrl+T | Cmd+T |
| Zoom In | Ctrl++ | Cmd++ |
| Zoom Out | Ctrl+- | Cmd+- |
| Reset Zoom | Ctrl+0 | Cmd+0 |

## Troubleshooting

### Common Issues

- **Slow Performance**: Try enabling sampling or limiting the number of columns.
- **Visualization Errors**: Check that you've mapped appropriate data types to visual properties.
- **Missing Data**: Verify that your filters aren't excluding all data.
- **Browser Crashes**: Large datasets may cause browser memory issues; try using sampling.

### Getting Help

If you encounter issues with the Data Explorer:

- **Hover for Tips**: Hover over UI elements to see tooltips with helpful information.
- **Check Documentation**: Refer to this documentation for detailed guidance.
- **Use the Help Panel**: Click the "Help" button in the Data Explorer for context-specific help.
- **Contact Support**: If you can't resolve an issue, contact support with details about the problem.

## Related Documentation

- [Workflow Editor](./WORKFLOW_EDITOR.md): How to create and run data processing workflows.
- [Data Catalog](./DATA_CATALOG.md): How to manage and organize your datasets.
- [Visualization Guide](./VISUALIZATION_GUIDE.md): Detailed guide to creating effective visualizations.
- [Data Quality](./DATA_QUALITY.md): In-depth information about data quality assessment and improvement. 
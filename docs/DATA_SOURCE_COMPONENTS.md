# Data Source Components

This document outlines the data source components created for the Data Whisperer application to provide a unified approach to data source management across the application.

## Overview

The data source components provide a consistent way to browse, select, and preview data sources throughout the application. These components are built on top of the `DataSourceContext` provider, which manages application-wide data source state.

## Components

### DataSourceContext

The `DataSourceContext` provides application-wide state management for data sources. It includes:

- A list of all available data sources
- Loading and error states
- Selected data source
- Recent and favorite data sources
- Actions for fetching, selecting, and managing data sources

**Usage:**

```tsx
import { useDataSources } from '../../contexts/DataSourceContext';

function MyComponent() {
  const { 
    dataSources, 
    loading, 
    error, 
    selectedDataSource,
    recentDataSources,
    favoriteDataSources,
    fetchDataSources,
    selectDataSource,
    toggleFavorite 
  } = useDataSources();
  
  // Use data sources and actions in your component
}
```

### DataSourceCard

The `DataSourceCard` component displays a single data source with its metadata, quality metrics, and actions.

**Props:**

- `dataSource`: The data source to display
- `onSelect`: Callback when the card is clicked
- `onToggleFavorite`: Callback to toggle favorite status
- `onPreview`: Callback to preview the data source
- `onEdit`: Callback to edit the data source
- `onDelete`: Callback to delete the data source
- `compact`: Whether to display a compact version of the card

**Usage:**

```tsx
import { DataSourceCard } from '../../components/data/DataSourceCard';

function MyComponent() {
  const handleSelect = (dataSource) => {
    console.log('Selected data source:', dataSource);
  };
  
  return (
    <DataSourceCard
      dataSource={myDataSource}
      onSelect={handleSelect}
      onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
      compact={false}
    />
  );
}
```

### DataSourceBrowser

The `DataSourceBrowser` component displays a list of data sources with filtering, search, and tabs for different views.

**Props:**

- `onSelectDataSource`: Callback when a data source is selected
- `showFavoriteToggle`: Whether to show the favorite toggle
- `showPreview`: Whether to show the preview button
- `showEdit`: Whether to show the edit button
- `showDelete`: Whether to show the delete button
- `compact`: Whether to display compact cards
- `maxItems`: Maximum number of items to display

**Usage:**

```tsx
import { DataSourceBrowser } from '../../components/data/DataSourceBrowser';

function MyComponent() {
  const handleSelect = (dataSource) => {
    console.log('Selected data source:', dataSource);
  };
  
  return (
    <DataSourceBrowser
      onSelectDataSource={handleSelect}
      showFavoriteToggle={true}
      showPreview={true}
      compact={false}
    />
  );
}
```

### DataSourcePreview

The `DataSourcePreview` component displays a preview of a data source with tabs for data, schema, JSON, and info views.

**Props:**

- `dataSource`: The data source to preview
- `loading`: Whether the preview is loading
- `error`: Error message if preview failed
- `onClose`: Callback when the preview is closed

**Usage:**

```tsx
import { DataSourcePreview } from '../../components/data/DataSourcePreview';

function MyComponent() {
  return (
    <DataSourcePreview
      dataSource={selectedDataSource}
      loading={false}
      error={null}
      onClose={() => setPreviewOpen(false)}
    />
  );
}
```

### DataSourceSelector

The `DataSourceSelector` component combines the `DataSourceBrowser` and `DataSourcePreview` components in a modal for selecting data sources.

**Props:**

- `opened`: Whether the modal is open
- `onClose`: Callback when the modal is closed
- `onSelect`: Callback when a data source is selected
- `title`: Modal title
- `description`: Modal description
- `multiSelect`: Whether to allow multiple selection

**Usage:**

```tsx
import { DataSourceSelector } from '../../components/data/DataSourceSelector';

function MyComponent() {
  const [selectorOpen, setSelectorOpen] = useState(false);
  
  const handleSelect = (dataSource) => {
    console.log('Selected data source:', dataSource);
    setSelectorOpen(false);
  };
  
  return (
    <>
      <Button onClick={() => setSelectorOpen(true)}>
        Select Data Source
      </Button>
      
      <DataSourceSelector
        opened={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleSelect}
        title="Select Data Source"
        description="Choose a data source to use in your workflow"
      />
    </>
  );
}
```

## Integration with Existing Components

### DatasetLoaderNode

The `DatasetLoaderNode` has been updated to use the `DataSourceSelector` for selecting data sources, providing a consistent experience with the rest of the application. This integration includes:

- Using the `DataSourceSelector` modal for browsing and selecting data sources
- Displaying data source metadata and quality metrics
- Showing a preview of the selected data source
- Consistent UI for data source selection across the application

### DataManagementPage

The `DataManagementPage` has been updated to use the `DataSourceBrowser` and `DataSourcePreview` components, providing a consistent experience with the workflow editor. This integration includes:

- Replacing the custom file browser with the shared `DataSourceBrowser` component
- Adding a side panel with the `DataSourcePreview` component for viewing selected data sources
- Consistent UI for data management across the application
- Improved user experience with quality metrics and data previews

## Data Source Quality Metrics

Each data source includes quality metrics to help users assess the quality of the data:

- **Quality Score**: Overall quality score from 0-100
- **Missing Values**: Number of missing values in the data
- **Duplicates**: Number of duplicate records
- **Outliers**: Number of outlier values

These metrics are displayed in the `DataSourceCard` and `DataSourcePreview` components to help users make informed decisions about which data sources to use.

## Next Steps

1. Add data source widgets to the Dashboard
2. Implement real API integration for fetching data sources and previews
3. Add data caching to improve performance
4. Implement guided data selection process
5. Add context-sensitive help for data selection 
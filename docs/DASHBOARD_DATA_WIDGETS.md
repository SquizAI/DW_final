# Dashboard Data Source Widgets

This document outlines the plan for adding data source widgets to the Dashboard in the Data Whisperer application.

## Overview

The Dashboard is the central hub of the Data Whisperer application, providing users with an overview of their data, workflows, and recent activities. Adding data source widgets to the Dashboard will enhance the user experience by providing quick access to important data sources and insights.

## Widget Types

### Recent Data Sources Widget

This widget will display the most recently accessed data sources, allowing users to quickly return to their recent work.

**Features:**
- Display 3-5 most recently accessed data sources
- Show data source name, type, and quality score
- Provide quick actions (preview, open, favorite)
- Include a "View All" link to the Data Management page

**Implementation:**
```tsx
import { useDataSources } from '../../contexts/DataSourceContext';
import { DataSourceCard } from '../../components/data/DataSourceCard';

function RecentDataSourcesWidget() {
  const { recentDataSources, loading } = useDataSources();
  
  return (
    <Card withBorder>
      <Group position="apart" mb="md">
        <Title order={4}>Recent Data Sources</Title>
        <Button variant="subtle" component={Link} to="/data/management">
          View All
        </Button>
      </Group>
      
      {loading ? (
        <Skeleton height={200} />
      ) : recentDataSources.length === 0 ? (
        <Text color="dimmed" ta="center">No recent data sources</Text>
      ) : (
        <Stack>
          {recentDataSources.slice(0, 3).map((dataSource) => (
            <DataSourceCard
              key={dataSource.id}
              dataSource={dataSource}
              compact={true}
              onSelect={handleSelect}
            />
          ))}
        </Stack>
      )}
    </Card>
  );
}
```

### Data Quality Overview Widget

This widget will provide an overview of the quality of the user's data sources, highlighting potential issues that need attention.

**Features:**
- Display overall data quality score across all data sources
- Show breakdown of quality issues (missing values, duplicates, outliers)
- Highlight data sources with the lowest quality scores
- Provide recommendations for improving data quality

**Implementation:**
```tsx
import { useDataSources } from '../../contexts/DataSourceContext';

function DataQualityWidget() {
  const { dataSources } = useDataSources();
  
  // Calculate overall quality metrics
  const qualityMetrics = useMemo(() => {
    if (!dataSources.length) return null;
    
    const totalScore = dataSources.reduce((sum, ds) => sum + ds.quality.score, 0);
    const avgScore = totalScore / dataSources.length;
    
    const totalMissing = dataSources.reduce((sum, ds) => sum + ds.quality.missingValues, 0);
    const totalDuplicates = dataSources.reduce((sum, ds) => sum + ds.quality.duplicates, 0);
    const totalOutliers = dataSources.reduce((sum, ds) => sum + ds.quality.outliers, 0);
    
    return {
      avgScore,
      totalMissing,
      totalDuplicates,
      totalOutliers
    };
  }, [dataSources]);
  
  return (
    <Card withBorder>
      <Title order={4} mb="md">Data Quality Overview</Title>
      
      {!qualityMetrics ? (
        <Text color="dimmed" ta="center">No data sources available</Text>
      ) : (
        <>
          <RingProgress
            sections={[{ value: qualityMetrics.avgScore, color: getQualityColor(qualityMetrics.avgScore) }]}
            label={
              <Text fw={700} ta="center" size="xl">
                {Math.round(qualityMetrics.avgScore)}%
              </Text>
            }
            mb="md"
          />
          
          <Stack>
            <Group position="apart">
              <Text>Missing Values:</Text>
              <Badge color={qualityMetrics.totalMissing > 100 ? "red" : "yellow"}>
                {qualityMetrics.totalMissing}
              </Badge>
            </Group>
            <Group position="apart">
              <Text>Duplicates:</Text>
              <Badge color={qualityMetrics.totalDuplicates > 50 ? "red" : "yellow"}>
                {qualityMetrics.totalDuplicates}
              </Badge>
            </Group>
            <Group position="apart">
              <Text>Outliers:</Text>
              <Badge color={qualityMetrics.totalOutliers > 50 ? "red" : "yellow"}>
                {qualityMetrics.totalOutliers}
              </Badge>
            </Group>
          </Stack>
        </>
      )}
    </Card>
  );
}
```

### Data Source Recommendations Widget

This widget will provide AI-powered recommendations for data sources based on the user's recent activities and workflows.

**Features:**
- Recommend data sources that complement the user's current work
- Suggest data sources that might improve existing workflows
- Provide explanations for why each data source is recommended
- Allow users to quickly add recommended data sources to their workspace

**Implementation:**
```tsx
function DataSourceRecommendationsWidget() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch recommendations from API
    async function fetchRecommendations() {
      setLoading(true);
      try {
        const response = await api.getDataSourceRecommendations();
        setRecommendations(response.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecommendations();
  }, []);
  
  return (
    <Card withBorder>
      <Title order={4} mb="md">Recommended Data Sources</Title>
      
      {loading ? (
        <Skeleton height={200} />
      ) : recommendations.length === 0 ? (
        <Text color="dimmed" ta="center">No recommendations available</Text>
      ) : (
        <Stack>
          {recommendations.map((recommendation) => (
            <Paper key={recommendation.id} withBorder p="sm">
              <Text fw={500}>{recommendation.name}</Text>
              <Text size="sm" color="dimmed" mb="xs">{recommendation.reason}</Text>
              <Button size="xs" variant="light">Add to Workspace</Button>
            </Paper>
          ))}
        </Stack>
      )}
    </Card>
  );
}
```

## Dashboard Integration

The widgets will be integrated into the Dashboard layout as follows:

```tsx
function Dashboard() {
  return (
    <Container size="xl">
      <Title order={1} mb="xl">Dashboard</Title>
      
      <Grid>
        {/* Main content area */}
        <Grid.Col span={8}>
          <Stack spacing="lg">
            <ActivitySummaryWidget />
            <RecentWorkflowsWidget />
            {/* Other main widgets */}
          </Stack>
        </Grid.Col>
        
        {/* Sidebar */}
        <Grid.Col span={4}>
          <Stack spacing="lg">
            <RecentDataSourcesWidget />
            <DataQualityWidget />
            <DataSourceRecommendationsWidget />
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
```

## Implementation Plan

1. **Phase 1: Recent Data Sources Widget**
   - Implement the RecentDataSourcesWidget component
   - Integrate with DataSourceContext
   - Add to Dashboard sidebar
   - Test with mock data

2. **Phase 2: Data Quality Overview Widget**
   - Implement the DataQualityWidget component
   - Calculate quality metrics from available data sources
   - Add visual indicators for quality issues
   - Add to Dashboard sidebar

3. **Phase 3: Data Source Recommendations Widget**
   - Design the recommendation algorithm
   - Implement the API endpoint for recommendations
   - Create the DataSourceRecommendationsWidget component
   - Add to Dashboard sidebar

4. **Phase 4: Dashboard Layout Optimization**
   - Optimize widget layout for different screen sizes
   - Add responsive behavior for mobile devices
   - Implement widget customization options
   - Add widget state persistence

## Success Metrics

- **Engagement**: Increase in data source access from the Dashboard
- **Efficiency**: Reduction in time spent navigating to frequently used data sources
- **Quality Improvement**: Increase in overall data quality scores
- **User Satisfaction**: Positive feedback on the usefulness of the widgets

## Timeline

- Phase 1: 1 week
- Phase 2: 1 week
- Phase 3: 2 weeks
- Phase 4: 1 week

Total: 5 weeks 
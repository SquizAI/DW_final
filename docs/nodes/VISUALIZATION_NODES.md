# Visualization Nodes

Visualization nodes transform data into visual representations that help users understand patterns, trends, and relationships. These nodes create various types of charts, graphs, and interactive visualizations.

## Available Visualization Nodes

### Chart Generator

**Type ID**: `chartGenerator`

**Description**: Creates various types of charts and graphs from data.

**Frontend Component**: `ChartGeneratorNode.tsx`

**Backend Processor**: `ChartGeneratorProcessor.py`

**Inputs**:
- **Data**: The dataset to visualize

**Configuration Options**:
- **Chart Type**:
  - Bar Chart: For categorical comparisons
  - Line Chart: For trends over time or sequences
  - Scatter Plot: For relationships between variables
  - Pie Chart: For part-to-whole relationships
  - Area Chart: For cumulative totals over time
  - Histogram: For distribution of a single variable
  - Box Plot: For distribution statistics
  - Heatmap: For matrix data and correlations
- **Data Mapping**:
  - X-axis: Column to use for x-axis
  - Y-axis: Column(s) to use for y-axis
  - Color: Column to use for color encoding
  - Size: Column to use for size encoding
  - Facet: Column to use for faceting
- **Styling Options**:
  - Colors: Color scheme or specific colors
  - Fonts: Font family, size, and style
  - Legend: Position, style, and content
  - Axes: Labels, ticks, and gridlines
  - Title: Chart title and subtitle

**Outputs**:
- **Visualization**: The generated chart or graph
- **Image**: Static image of the visualization
- **Interactive**: Interactive version of the visualization
- **Embed Code**: HTML/JavaScript code to embed the visualization

**Example Configuration**:
```json
{
  "type": "chartGenerator",
  "chart": {
    "type": "bar",
    "subtype": "grouped",
    "orientation": "vertical"
  },
  "data": {
    "x": {
      "column": "category",
      "label": "Product Category",
      "sort": "ascending"
    },
    "y": {
      "columns": ["sales", "profit"],
      "labels": ["Sales ($)", "Profit ($)"],
      "aggregation": "sum"
    },
    "color": {
      "column": "region",
      "scale": "categorical"
    },
    "tooltip": {
      "columns": ["category", "sales", "profit", "region"],
      "format": {
        "sales": "${value}",
        "profit": "${value}"
      }
    }
  },
  "style": {
    "colors": {
      "scheme": "tableau10",
      "custom": {
        "sales": "#1f77b4",
        "profit": "#2ca02c"
      }
    },
    "fonts": {
      "family": "Arial, sans-serif",
      "title": {
        "size": 18,
        "weight": "bold"
      },
      "labels": {
        "size": 12,
        "weight": "normal"
      }
    },
    "legend": {
      "position": "right",
      "title": "Region"
    },
    "axes": {
      "x": {
        "grid": false,
        "title": "Product Category"
      },
      "y": {
        "grid": true,
        "title": "Amount ($)",
        "format": "${value}"
      }
    },
    "title": {
      "text": "Sales and Profit by Category",
      "subtitle": "Fiscal Year 2023"
    }
  },
  "dimensions": {
    "width": 800,
    "height": 500,
    "responsive": true
  },
  "interactivity": {
    "enabled": true,
    "actions": {
      "hover": true,
      "click": true,
      "zoom": true,
      "pan": false
    }
  },
  "export": {
    "formats": ["png", "svg", "html"],
    "dpi": 300
  }
}
```

### Dashboard Creator

**Type ID**: `dashboardCreator`

**Description**: Creates interactive dashboards with multiple visualizations.

**Frontend Component**: `DashboardCreatorNode.tsx`

**Backend Processor**: `DashboardCreatorProcessor.py`

**Inputs**:
- **Data**: The dataset(s) to visualize
- **Visualizations**: Existing visualizations to include (optional)

**Configuration Options**:
- **Layout**:
  - Grid: Arrange visualizations in a grid
  - Tabs: Organize visualizations in tabs
  - Free-form: Custom positioning of visualizations
- **Panels**:
  - Visualization panels: Charts, graphs, etc.
  - Filter panels: Interactive filters
  - Text panels: Markdown or HTML content
  - Metric panels: KPI displays
- **Interactivity**:
  - Cross-filtering: Filter multiple visualizations
  - Drill-down: Navigate to detailed views
  - Parameter controls: Interactive parameters

**Outputs**:
- **Dashboard**: The generated dashboard
- **HTML**: HTML version of the dashboard
- **URL**: URL to access the dashboard
- **Embed Code**: Code to embed the dashboard

**Example Configuration**:
```json
{
  "type": "dashboardCreator",
  "layout": {
    "type": "grid",
    "columns": 12,
    "rows": "auto",
    "padding": 10,
    "backgroundColor": "#f5f5f5"
  },
  "title": {
    "text": "Sales Performance Dashboard",
    "align": "center",
    "style": {
      "fontSize": 24,
      "fontWeight": "bold",
      "color": "#333333"
    }
  },
  "panels": [
    {
      "id": "panel1",
      "type": "metric",
      "title": "Total Sales",
      "gridPosition": {
        "x": 0,
        "y": 0,
        "w": 3,
        "h": 2
      },
      "data": {
        "column": "sales",
        "aggregation": "sum",
        "format": "${value}",
        "comparison": {
          "type": "previous_period",
          "format": "{value}%"
        }
      },
      "style": {
        "backgroundColor": "#ffffff",
        "valueColor": "#2c3e50",
        "trendPositiveColor": "#27ae60",
        "trendNegativeColor": "#e74c3c"
      }
    },
    {
      "id": "panel2",
      "type": "visualization",
      "title": "Sales by Region",
      "gridPosition": {
        "x": 3,
        "y": 0,
        "w": 9,
        "h": 4
      },
      "visualization": {
        "type": "bar",
        "data": {
          "x": {
            "column": "region"
          },
          "y": {
            "columns": ["sales"]
          }
        }
      }
    },
    {
      "id": "panel3",
      "type": "filter",
      "title": "Filters",
      "gridPosition": {
        "x": 0,
        "y": 2,
        "w": 3,
        "h": 6
      },
      "filters": [
        {
          "column": "date",
          "type": "date_range",
          "label": "Date Range"
        },
        {
          "column": "region",
          "type": "multi_select",
          "label": "Region"
        },
        {
          "column": "product_category",
          "type": "multi_select",
          "label": "Product Category"
        }
      ]
    },
    {
      "id": "panel4",
      "type": "visualization",
      "title": "Sales Trend",
      "gridPosition": {
        "x": 3,
        "y": 4,
        "w": 9,
        "h": 4
      },
      "visualization": {
        "type": "line",
        "data": {
          "x": {
            "column": "date",
            "timeUnit": "month"
          },
          "y": {
            "columns": ["sales"]
          },
          "color": {
            "column": "product_category"
          }
        }
      }
    },
    {
      "id": "panel5",
      "type": "text",
      "gridPosition": {
        "x": 0,
        "y": 8,
        "w": 12,
        "h": 1
      },
      "content": "## Sales Analysis\nThis dashboard provides an overview of sales performance across different regions and product categories.",
      "contentType": "markdown"
    }
  ],
  "interactivity": {
    "crossFiltering": true,
    "defaultFilters": {
      "date": {
        "start": "2023-01-01",
        "end": "2023-12-31"
      }
    },
    "drilldowns": [
      {
        "from": "panel2",
        "to": "panel4",
        "mapping": {
          "region": "region"
        }
      }
    ]
  },
  "export": {
    "enabled": true,
    "formats": ["pdf", "png"]
  }
}
```

### Geospatial Visualizer

**Type ID**: `geospatialVisualizer`

**Description**: Creates maps and geospatial visualizations.

**Frontend Component**: `GeospatialVisualizerNode.tsx`

**Backend Processor**: `GeospatialVisualizerProcessor.py`

**Inputs**:
- **Data**: The dataset with geospatial information

**Configuration Options**:
- **Map Type**:
  - Choropleth: Color-coded regions
  - Point Map: Points on a map
  - Heat Map: Density visualization
  - Flow Map: Movement between locations
  - Bubble Map: Sized bubbles on a map
- **Geospatial Data**:
  - Coordinates: Latitude and longitude columns
  - Regions: Geographic region identifiers
  - GeoJSON: Custom GeoJSON data
- **Visual Encoding**:
  - Color: Column for color encoding
  - Size: Column for size encoding
  - Tooltip: Columns to show in tooltips

**Outputs**:
- **Map**: The generated map visualization
- **Interactive Map**: Interactive version of the map
- **GeoJSON**: Processed GeoJSON data
- **Image**: Static image of the map

**Example Configuration**:
```json
{
  "type": "geospatialVisualizer",
  "map": {
    "type": "choropleth",
    "baseMap": "light",
    "projection": "mercator",
    "center": [0, 0],
    "zoom": 2
  },
  "data": {
    "type": "regions",
    "regionColumn": "country",
    "regionType": "iso3",
    "valueColumn": "gdp_per_capita",
    "geoJSON": {
      "source": "natural_earth",
      "resolution": "110m",
      "custom": null
    },
    "coordinates": {
      "latitudeColumn": null,
      "longitudeColumn": null
    }
  },
  "visual": {
    "color": {
      "column": "gdp_per_capita",
      "scale": "sequential",
      "scheme": "Blues",
      "domain": [0, 100000],
      "legend": {
        "title": "GDP per Capita (USD)",
        "position": "bottom-right"
      }
    },
    "tooltip": {
      "columns": ["country", "gdp_per_capita", "population"],
      "format": {
        "gdp_per_capita": "${value}",
        "population": "{value:,.0f}"
      }
    },
    "borders": {
      "show": true,
      "color": "#333333",
      "width": 0.5
    }
  },
  "interactivity": {
    "enabled": true,
    "actions": {
      "hover": true,
      "click": true,
      "zoom": true,
      "pan": true
    }
  },
  "style": {
    "backgroundColor": "#f5f5f5",
    "title": {
      "text": "Global GDP per Capita",
      "position": "top-center",
      "fontSize": 18
    },
    "noDataColor": "#cccccc"
  },
  "dimensions": {
    "width": 900,
    "height": 600,
    "responsive": true
  },
  "export": {
    "formats": ["png", "svg", "html"],
    "dpi": 300
  }
}
```

### Network Visualizer

**Type ID**: `networkVisualizer`

**Description**: Creates network and graph visualizations to show relationships between entities.

**Frontend Component**: `NetworkVisualizerNode.tsx`

**Backend Processor**: `NetworkVisualizerProcessor.py`

**Inputs**:
- **Data**: The dataset with network/graph information

**Configuration Options**:
- **Network Type**:
  - Node-Link: Traditional network diagram
  - Adjacency Matrix: Matrix representation of connections
  - Arc Diagram: Linear layout with arcs for connections
  - Force-Directed: Physics-based layout
- **Network Data**:
  - Nodes: Node data and attributes
  - Edges: Edge data and attributes
  - Directed: Whether the network is directed
- **Visual Encoding**:
  - Node Color: Column for node color
  - Node Size: Column for node size
  - Edge Color: Column for edge color
  - Edge Width: Column for edge width

**Outputs**:
- **Network Visualization**: The generated network visualization
- **Interactive Network**: Interactive version of the network
- **Network Statistics**: Metrics about the network
- **Image**: Static image of the network

**Example Configuration**:
```json
{
  "type": "networkVisualizer",
  "network": {
    "type": "force-directed",
    "directed": true,
    "layout": {
      "algorithm": "d3-force",
      "linkDistance": 100,
      "charge": -300,
      "gravity": 0.1,
      "iterations": 300
    }
  },
  "data": {
    "nodes": {
      "idColumn": "node_id",
      "labelColumn": "name",
      "groupColumn": "category",
      "sizeColumn": "importance",
      "tooltipColumns": ["name", "category", "importance", "description"]
    },
    "edges": {
      "sourceColumn": "source",
      "targetColumn": "target",
      "weightColumn": "weight",
      "typeColumn": "relationship",
      "tooltipColumns": ["relationship", "weight", "date_established"]
    }
  },
  "visual": {
    "nodes": {
      "color": {
        "column": "category",
        "scale": "categorical",
        "scheme": "category10"
      },
      "size": {
        "column": "importance",
        "range": [5, 30],
        "scale": "sqrt"
      },
      "label": {
        "show": true,
        "fontSize": 12,
        "fontFamily": "Arial",
        "color": "#333333"
      },
      "shape": {
        "column": "type",
        "mapping": {
          "person": "circle",
          "organization": "square",
          "location": "triangle"
        },
        "default": "circle"
      }
    },
    "edges": {
      "color": {
        "column": "relationship",
        "scale": "categorical",
        "scheme": "Set2"
      },
      "width": {
        "column": "weight",
        "range": [1, 5],
        "scale": "linear"
      },
      "style": {
        "column": "relationship",
        "mapping": {
          "strong": "solid",
          "weak": "dashed",
          "potential": "dotted"
        },
        "default": "solid"
      },
      "arrows": {
        "show": true,
        "position": "end",
        "size": 5
      }
    }
  },
  "interactivity": {
    "enabled": true,
    "actions": {
      "hover": true,
      "click": true,
      "drag": true,
      "zoom": true,
      "pan": true
    },
    "highlighting": {
      "enabled": true,
      "neighbors": true,
      "degree": 1
    },
    "filtering": {
      "enabled": true,
      "nodeProperties": ["category", "importance"],
      "edgeProperties": ["relationship", "weight"]
    }
  },
  "style": {
    "backgroundColor": "#ffffff",
    "title": {
      "text": "Relationship Network",
      "fontSize": 20,
      "position": "top-center"
    },
    "legend": {
      "show": true,
      "position": "bottom-right",
      "title": "Categories"
    }
  },
  "dimensions": {
    "width": 800,
    "height": 600,
    "responsive": true
  },
  "export": {
    "formats": ["png", "svg", "json"],
    "dpi": 300
  }
}
```

### 3D Visualizer

**Type ID**: `3dVisualizer`

**Description**: Creates 3D visualizations for multidimensional data.

**Frontend Component**: `3DVisualizerNode.tsx`

**Backend Processor**: `3DVisualizerProcessor.py`

**Inputs**:
- **Data**: The dataset to visualize in 3D

**Configuration Options**:
- **Visualization Type**:
  - 3D Scatter Plot: Points in 3D space
  - 3D Surface: Surface representation of 3D data
  - 3D Bar Chart: Bars in 3D space
  - 3D Network: Network visualization in 3D
- **Axes Mapping**:
  - X-axis: Column for x-axis
  - Y-axis: Column for y-axis
  - Z-axis: Column for z-axis
- **Visual Encoding**:
  - Color: Column for color encoding
  - Size: Column for size encoding
  - Shape: Column for shape encoding

**Outputs**:
- **3D Visualization**: The generated 3D visualization
- **Interactive 3D**: Interactive version of the 3D visualization
- **Image**: Static image of the 3D visualization
- **3D Model**: Exportable 3D model

**Example Configuration**:
```json
{
  "type": "3dVisualizer",
  "visualization": {
    "type": "scatter3d",
    "subtype": "point"
  },
  "data": {
    "x": {
      "column": "feature1",
      "label": "Feature 1",
      "domain": [0, 100]
    },
    "y": {
      "column": "feature2",
      "label": "Feature 2",
      "domain": [0, 100]
    },
    "z": {
      "column": "feature3",
      "label": "Feature 3",
      "domain": [0, 100]
    },
    "color": {
      "column": "category",
      "scale": "categorical",
      "scheme": "tableau10"
    },
    "size": {
      "column": "importance",
      "range": [3, 15],
      "scale": "sqrt"
    },
    "tooltip": {
      "columns": ["id", "feature1", "feature2", "feature3", "category", "importance"],
      "format": {
        "feature1": "{value:.2f}",
        "feature2": "{value:.2f}",
        "feature3": "{value:.2f}",
        "importance": "{value:.1f}"
      }
    }
  },
  "style": {
    "axes": {
      "x": {
        "title": "Feature 1",
        "titleFont": {
          "size": 12,
          "family": "Arial",
          "color": "#333333"
        },
        "grid": true,
        "tickFormat": ".1f"
      },
      "y": {
        "title": "Feature 2",
        "titleFont": {
          "size": 12,
          "family": "Arial",
          "color": "#333333"
        },
        "grid": true,
        "tickFormat": ".1f"
      },
      "z": {
        "title": "Feature 3",
        "titleFont": {
          "size": 12,
          "family": "Arial",
          "color": "#333333"
        },
        "grid": true,
        "tickFormat": ".1f"
      }
    },
    "legend": {
      "show": true,
      "title": "Category",
      "position": "right"
    },
    "background": {
      "color": "#f5f5f5"
    },
    "title": {
      "text": "3D Feature Visualization",
      "font": {
        "size": 16,
        "family": "Arial",
        "color": "#333333"
      }
    }
  },
  "camera": {
    "eye": {
      "x": 1.25,
      "y": 1.25,
      "z": 1.25
    },
    "center": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "up": {
      "x": 0,
      "y": 0,
      "z": 1
    }
  },
  "interactivity": {
    "enabled": true,
    "actions": {
      "rotate": true,
      "zoom": true,
      "pan": true,
      "select": true
    },
    "highlighting": {
      "enabled": true,
      "color": "#ff0000"
    }
  },
  "dimensions": {
    "width": 800,
    "height": 600,
    "responsive": true
  },
  "export": {
    "formats": ["png", "html", "gltf"],
    "dpi": 300
  }
}
```

### Interactive Report

**Type ID**: `interactiveReport`

**Description**: Creates interactive reports with text, visualizations, and controls.

**Frontend Component**: `InteractiveReportNode.tsx`

**Backend Processor**: `InteractiveReportProcessor.py`

**Inputs**:
- **Data**: The dataset(s) to include in the report
- **Visualizations**: Existing visualizations to include (optional)
- **Analysis Results**: Results from analysis nodes (optional)

**Configuration Options**:
- **Report Structure**:
  - Sections: Report sections and hierarchy
  - Content: Text, visualizations, tables, etc.
  - Layout: Arrangement of content
- **Interactivity**:
  - Controls: Interactive controls and filters
  - Navigation: Section navigation
  - Drill-down: Detailed views

**Outputs**:
- **Report**: The generated interactive report
- **HTML**: HTML version of the report
- **PDF**: PDF version of the report
- **URL**: URL to access the report

**Example Configuration**:
```json
{
  "type": "interactiveReport",
  "report": {
    "title": "Annual Sales Analysis Report",
    "subtitle": "Fiscal Year 2023",
    "author": "Data Whisperer",
    "date": "2023-12-31",
    "logo": "https://example.com/logo.png"
  },
  "structure": {
    "sections": [
      {
        "id": "executive_summary",
        "title": "Executive Summary",
        "level": 1,
        "content": [
          {
            "type": "text",
            "content": "# Executive Summary\n\nThis report provides a comprehensive analysis of sales performance for the fiscal year 2023. Key findings include:\n\n- Total sales increased by 12% compared to the previous year\n- The North America region showed the strongest growth at 18%\n- Product category 'Electronics' continues to be the top performer",
            "contentType": "markdown"
          },
          {
            "type": "metrics",
            "layout": "grid",
            "metrics": [
              {
                "title": "Total Sales",
                "column": "sales",
                "aggregation": "sum",
                "format": "${value:,.0f}",
                "comparison": {
                  "type": "previous_year",
                  "format": "{value:+.1f}%"
                }
              },
              {
                "title": "Profit Margin",
                "column": "profit_margin",
                "aggregation": "mean",
                "format": "{value:.1f}%",
                "comparison": {
                  "type": "previous_year",
                  "format": "{value:+.1f}pp"
                }
              },
              {
                "title": "Customer Count",
                "column": "customer_id",
                "aggregation": "count_distinct",
                "format": "{value:,.0f}",
                "comparison": {
                  "type": "previous_year",
                  "format": "{value:+.1f}%"
                }
              }
            ]
          }
        ]
      },
      {
        "id": "sales_performance",
        "title": "Sales Performance",
        "level": 1,
        "content": [
          {
            "type": "text",
            "content": "## Sales Performance\n\nThis section analyzes sales performance across different dimensions including time, region, and product category.",
            "contentType": "markdown"
          },
          {
            "type": "visualization",
            "title": "Monthly Sales Trend",
            "visualization": {
              "type": "line",
              "data": {
                "x": {
                  "column": "date",
                  "timeUnit": "month"
                },
                "y": {
                  "columns": ["sales"]
                }
              }
            }
          },
          {
            "type": "visualization",
            "title": "Sales by Region",
            "visualization": {
              "type": "bar",
              "data": {
                "x": {
                  "column": "region"
                },
                "y": {
                  "columns": ["sales"]
                }
              }
            }
          },
          {
            "type": "table",
            "title": "Top 10 Products by Sales",
            "data": {
              "columns": ["product_name", "category", "sales", "profit", "profit_margin"],
              "sortBy": "sales",
              "sortDirection": "descending",
              "limit": 10,
              "format": {
                "sales": "${value:,.0f}",
                "profit": "${value:,.0f}",
                "profit_margin": "{value:.1f}%"
              }
            }
          }
        ]
      },
      {
        "id": "customer_analysis",
        "title": "Customer Analysis",
        "level": 1,
        "content": [
          {
            "type": "text",
            "content": "## Customer Analysis\n\nThis section provides insights into customer behavior and segmentation.",
            "contentType": "markdown"
          },
          {
            "type": "visualization",
            "title": "Customer Segments",
            "visualization": {
              "type": "pie",
              "data": {
                "values": {
                  "column": "customer_count"
                },
                "labels": {
                  "column": "segment"
                }
              }
            }
          }
        ]
      },
      {
        "id": "recommendations",
        "title": "Recommendations",
        "level": 1,
        "content": [
          {
            "type": "text",
            "content": "## Recommendations\n\nBased on the analysis, we recommend the following actions:\n\n1. Increase marketing investment in the North America region\n2. Expand the Electronics product line\n3. Implement customer retention programs for the High-Value segment",
            "contentType": "markdown"
          }
        ]
      }
    ]
  },
  "interactivity": {
    "controls": [
      {
        "type": "date_range",
        "label": "Date Range",
        "defaultValue": {
          "start": "2023-01-01",
          "end": "2023-12-31"
        },
        "position": "top"
      },
      {
        "type": "multi_select",
        "label": "Region",
        "column": "region",
        "defaultValue": ["all"],
        "position": "top"
      },
      {
        "type": "multi_select",
        "label": "Product Category",
        "column": "category",
        "defaultValue": ["all"],
        "position": "top"
      }
    ],
    "navigation": {
      "type": "sidebar",
      "sticky": true,
      "collapsible": true
    },
    "drilldowns": [
      {
        "from": "sales_by_region",
        "to": "region_detail",
        "mapping": {
          "region": "region"
        }
      }
    ]
  },
  "style": {
    "theme": "light",
    "colors": {
      "primary": "#1f77b4",
      "secondary": "#ff7f0e",
      "background": "#ffffff",
      "text": "#333333"
    },
    "fonts": {
      "headings": "Roboto, sans-serif",
      "body": "Open Sans, sans-serif"
    },
    "spacing": {
      "sectionMargin": 40,
      "contentMargin": 20
    }
  },
  "export": {
    "formats": ["pdf", "html", "docx"],
    "pageSize": "letter",
    "orientation": "portrait",
    "includeTableOfContents": true
  }
}
```

## Best Practices

1. **Data Preparation**: Ensure data is properly cleaned and prepared before visualization
2. **Visual Encoding**: Use appropriate visual encodings for different data types
3. **Color Usage**: Use color effectively and consider accessibility
4. **Interactivity**: Add interactivity to enhance exploration but avoid overwhelming users
5. **Context**: Provide context and explanations for visualizations

## Troubleshooting

### Common Issues

1. **Performance Issues**:
   - Reduce the amount of data being visualized
   - Use aggregation for large datasets
   - Optimize rendering settings

2. **Visual Clarity Problems**:
   - Simplify complex visualizations
   - Use appropriate chart types for the data
   - Improve labeling and annotations

3. **Export Issues**:
   - Check browser compatibility for interactive visualizations
   - Adjust dimensions for exported images
   - Use vector formats (SVG) for better quality 
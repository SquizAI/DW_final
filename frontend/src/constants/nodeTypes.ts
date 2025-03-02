export interface NodeTypeInfo {
  category: string;
  operations: string[];
}

export interface NodeTypes {
  [key: string]: NodeTypeInfo;
}

export const NODE_TYPES: NodeTypes = {
  dataSource: {
    category: "Input",
    operations: ["csvUpload", "kaggleDataset", "databaseConnection", "apiEndpoint"]
  },
  transformation: {
    category: "Processing",
    operations: ["filter", "aggregate", "join", "sort", "groupBy", "pivot"]
  },
  analysis: {
    category: "Analysis",
    operations: ["statistics", "correlation", "regression", "clustering", "prediction"]
  },
  visualization: {
    category: "Output",
    operations: ["lineChart", "barChart", "scatterPlot", "heatmap", "dashboard"]
  },
  aiAssistant: {
    category: "AI",
    operations: ["dataInsights", "anomalyDetection", "featureEngineering", "modelSelection"]
  }
}; 
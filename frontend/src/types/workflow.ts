export interface NodeTypeInfo {
  category: string;
  operations: string[];
}

export interface NodeTypes {
  [key: string]: NodeTypeInfo;
}

export const NODE_TYPES: NodeTypes = {
  dataSource: {
    category: "Data Sources",
    operations: [
      "csvUpload",
      "kaggleDataset",
      "sqlDatabase",
      "apiEndpoint",
      "excelFile",
      "jsonData"
    ]
  },
  dataProfile: {
    category: "Data Profiling",
    operations: [
      "columnStats",
      "dataTypes",
      "missingValues",
      "correlationMatrix",
      "distributionAnalysis",
      "outlierDetection"
    ]
  },
  dataQuality: {
    category: "Data Quality",
    operations: [
      "missingValueHandler",
      "outlierHandler",
      "duplicateRemover",
      "typeConverter",
      "rangeValidator",
      "consistencyChecker"
    ]
  },
  dataMerge: {
    category: "Data Merging",
    operations: [
      "innerJoin",
      "leftJoin",
      "rightJoin",
      "outerJoin",
      "concatenate",
      "keyMatcher"
    ]
  },
  dataBinning: {
    category: "Data Binning",
    operations: [
      "equalWidth",
      "equalFrequency",
      "customBins",
      "optimalBinning",
      "categoricalBinning",
      "binEvaluation"
    ]
  },
  transformation: {
    category: "Transformations",
    operations: [
      "lambdaFunction",
      "columnFilter",
      "rowFilter",
      "sorting",
      "grouping",
      "pivoting"
    ]
  },
  featureEngineering: {
    category: "Feature Engineering",
    operations: [
      "polynomialFeatures",
      "interactionTerms",
      "dateTimeFeatures",
      "textFeatures",
      "categoricalEncoding",
      "dimensionReduction"
    ]
  },
  analysis: {
    category: "Analysis",
    operations: [
      "univariateAnalysis",
      "bivariateAnalysis",
      "multivariatePlots",
      "hypothesisTesting",
      "anomalyDetection",
      "trendAnalysis"
    ]
  },
  featureImportance: {
    category: "Feature Importance",
    operations: [
      "correlationAnalysis",
      "mutualInformation",
      "featureRanking",
      "permutationImportance",
      "shapValues",
      "featureSelection"
    ]
  },
  modelTraining: {
    category: "Model Training",
    operations: [
      "datasetSplit",
      "crossValidation",
      "modelSelection",
      "hyperparameterTuning",
      "ensembleMethods",
      "modelEvaluation"
    ]
  },
  visualization: {
    category: "Visualization",
    operations: [
      "scatterPlot",
      "lineChart",
      "barChart",
      "heatmap",
      "boxPlot",
      "violinPlot",
      "histogram",
      "densityPlot",
      "correlationPlot",
      "facetGrid"
    ]
  },
  export: {
    category: "Export",
    operations: [
      "csvExport",
      "excelExport",
      "jsonExport",
      "reportGeneration",
      "modelSerialization",
      "dashboardExport"
    ]
  }
};

export interface NodeData {
  label: string;
  type: string;
  settings?: Record<string, any>;
  inputs?: string[];
  outputs?: string[];
  validation?: {
    required: string[];
    rules: Record<string, any>;
  };
}

export interface WorkflowValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface NodeValidation {
  isValid: boolean;
  messages: {
    type: 'error' | 'warning' | 'info';
    message: string;
  }[];
}

export interface WorkflowMetadata {
  id: string;
  name: string;
  description: string;
  created: Date;
  modified: Date;
  tags: string[];
  author: string;
  version: string;
}

export interface WorkflowExecutionResult {
  success: boolean;
  nodeResults: Record<string, any>;
  errors: Record<string, string>;
  metrics: {
    executionTime: number;
    memoryUsage: number;
    nodesExecuted: number;
  };
}

export interface AIAssistantConfig {
  enabled: boolean;
  features: {
    suggestions: boolean;
    validation: boolean;
    optimization: boolean;
    documentation: boolean;
  };
  model: {
    name: string;
    temperature: number;
    maxTokens: number;
  };
}

export const DEFAULT_AI_CONFIG: AIAssistantConfig = {
  enabled: true,
  features: {
    suggestions: true,
    validation: true,
    optimization: true,
    documentation: true
  },
  model: {
    name: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000
  }
}; 
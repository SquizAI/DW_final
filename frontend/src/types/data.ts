export interface DataStats {
  rowCount: number;
  columnCount: number;
  missingValues: { [key: string]: number };
  dataTypes: { [key: string]: string };
}

export interface DataPreview {
  columns: string[];
  sample: any[];
  stats: DataStats;
}

export interface DataTransformConfig {
  type: 'column' | 'row' | 'aggregation' | 'join';
  config: Record<string, any>;
}

export interface DataQualityRule {
  field: string;
  type: 'missing' | 'unique' | 'range' | 'regex' | 'custom';
  params: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
}

export interface DataQualityResults {
  isValid: boolean;
  rules: DataQualityRule[];
  issues: Array<{
    field: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  summary: {
    totalIssues: number;
    issuesByType: Record<string, number>;
    issuesBySeverity: Record<string, number>;
  };
}

export interface DataExportConfig {
  format: 'csv' | 'json' | 'parquet' | 'excel' | 'sql';
  options: {
    columns?: string[];
    compression?: 'none' | 'gzip' | 'zip';
    encoding?: string;
    delimiter?: string;
    includeHeader?: boolean;
    dateFormat?: string;
    sheetName?: string;
    sqlTable?: string;
    sqlSchema?: string;
  };
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'scatter' | 'pie' | 'histogram' | 'box';
  xAxis: string;
  yAxis?: string;
  groupBy?: string;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  options?: Record<string, any>;
} 
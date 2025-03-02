import { NodeTypes } from 'reactflow';
import { DatasetLoaderNode } from './DatasetLoaderNode';
import { StructuralAnalysisNode } from './StructuralAnalysisNode';
import { QualityCheckerNode } from './QualityCheckerNode';
import { DataMergerNode } from './DataMergerNode';
import { DataBinningNode } from './DataBinningNode';
import { LambdaFunctionNode } from './LambdaFunctionNode';
import { FeatureEngineerNode } from './FeatureEngineerNode';
import { EDAAnalysisNode } from './EDAAnalysisNode';
import { FeatureImportanceNode } from './FeatureImportanceNode';
import { BinaryClassifierNode } from './BinaryClassifierNode';
import { ReportGeneratorNode } from './ReportGeneratorNode';

// Define the node types mapping for ReactFlow
export const nodeTypes: NodeTypes = {
  datasetLoader: DatasetLoaderNode,
  structuralAnalysis: StructuralAnalysisNode,
  qualityChecker: QualityCheckerNode,
  dataMerger: DataMergerNode,
  dataBinning: DataBinningNode,
  lambdaFunction: LambdaFunctionNode,
  featureEngineer: FeatureEngineerNode,
  edaAnalysis: EDAAnalysisNode,
  featureImportance: FeatureImportanceNode,
  binaryClassifier: BinaryClassifierNode,
  reportGenerator: ReportGeneratorNode,
};

// Export node components for direct usage
export {
  DatasetLoaderNode,
  StructuralAnalysisNode,
  QualityCheckerNode,
  DataMergerNode,
  DataBinningNode,
  LambdaFunctionNode,
  FeatureEngineerNode,
  EDAAnalysisNode,
  FeatureImportanceNode,
  BinaryClassifierNode,
  ReportGeneratorNode,
}; 
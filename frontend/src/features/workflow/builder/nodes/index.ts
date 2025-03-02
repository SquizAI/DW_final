import { NodeTypes } from 'reactflow';
import { DataNode } from './DataNode';
import { TransformNode } from './TransformNode';
import { AnalysisNode } from './AnalysisNode';
import { AINode } from './AINode';
import { VisualNode } from './VisualNode';
import { ExportNode } from './ExportNode';

export const nodeTypes: NodeTypes = {
  dataNode: DataNode,
  transformNode: TransformNode,
  analysisNode: AnalysisNode,
  aiNode: AINode,
  visualNode: VisualNode,
  exportNode: ExportNode,
}; 
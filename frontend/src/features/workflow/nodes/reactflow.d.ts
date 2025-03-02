import { Node as ReactFlowNode, XYPosition } from 'reactflow';
import { WorkflowNodeData } from './types';

declare module 'reactflow' {
  export interface Node<T = any> extends ReactFlowNode<T> {
    type: string;
    id: string;
  }
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: XYPosition;
  data: WorkflowNodeData;
  dragHandle?: string;
  style?: React.CSSProperties;
  sourcePosition?: string;
  targetPosition?: string;
  selected?: boolean;
  dragging?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  connectable?: boolean;
  deletable?: boolean;
  hidden?: boolean;
  zIndex?: number;
  expandParent?: boolean;
  parentNode?: string;
  extent?: 'parent' | [number, number, number, number];
  className?: string;
} 
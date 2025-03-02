import { nodeTypes } from '../nodes';

export type NodeType = keyof typeof nodeTypes;

/**
 * Generates a unique node ID with proper type safety
 * @param type The type of node (optional)
 * @returns A string ID
 */
export function generateNodeId(type?: NodeType): string {
  const timestamp = `${Date.now()}`;
  const random = `${Math.random().toString(36).slice(2)}`;
  
  if (type) {
    return `${type}-${timestamp}-${random}`;
  }
  
  return `node_${random.substring(0, 7)}`;
} 
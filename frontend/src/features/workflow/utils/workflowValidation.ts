import { Edge } from 'reactflow';

// Define a custom Node type that includes the data property
interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label: string;
    dataSource?: any;
    [key: string]: any;
  };
  position: {
    x: number;
    y: number;
  };
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

/**
 * Validates a workflow to ensure it can be executed properly
 * @param nodes The workflow nodes
 * @param edges The workflow edges
 * @returns Validation result with any issues found
 */
export function validateWorkflow(nodes: WorkflowNode[], edges: Edge[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  
  // Check if workflow is empty
  if (nodes.length === 0) {
    issues.push({
      type: 'error',
      message: 'Workflow is empty. Add at least one node to create a workflow.'
    });
  }
  
  // Check for disconnected nodes (no inputs or outputs)
  nodes.forEach(node => {
    const nodeHasInputEdge = edges.some(edge => edge.target === node.id);
    const nodeHasOutputEdge = edges.some(edge => edge.source === node.id);
    
    // Skip data source nodes which don't need input
    if (node.type === 'datasetLoader' && !nodeHasOutputEdge) {
      issues.push({
        type: 'warning',
        message: `Node "${node.data.label}" has no output connections.`,
        nodeId: node.id
      });
    } 
    // Skip output/visualization nodes which don't need output
    else if (!['output', 'visualization', 'dataExport'].includes(node.type) && !nodeHasOutputEdge) {
      issues.push({
        type: 'warning',
        message: `Node "${node.data.label}" has no output connections.`,
        nodeId: node.id
      });
    }
    
    // Check for nodes that need input but don't have any
    if (!['datasetLoader', 'manualInput', 'apiConnector'].includes(node.type) && !nodeHasInputEdge) {
      issues.push({
        type: 'error',
        message: `Node "${node.data.label}" has no input connections.`,
        nodeId: node.id
      });
    }
  });
  
  // Check for cycles in the workflow
  const hasCycle = detectCycle(nodes, edges);
  if (hasCycle) {
    issues.push({
      type: 'error',
      message: 'Workflow contains a cycle. Workflows must be acyclic (no loops).'
    });
  }
  
  // Check for incomplete node configurations
  nodes.forEach(node => {
    // This would need to be customized based on your node types and their required configurations
    if (node.type === 'datasetLoader' && !node.data.dataSource) {
      issues.push({
        type: 'error',
        message: `Dataset Loader node "${node.data.label}" has no data source selected.`,
        nodeId: node.id
      });
    }
    
    // Add more node-specific configuration checks here
  });
  
  return {
    valid: issues.filter(issue => issue.type === 'error').length === 0,
    issues
  };
}

/**
 * Detects if there's a cycle in the workflow graph
 * @param nodes The workflow nodes
 * @param edges The workflow edges
 * @returns True if a cycle is detected
 */
function detectCycle(nodes: WorkflowNode[], edges: Edge[]): boolean {
  // Create an adjacency list representation of the graph
  const graph: Record<string, string[]> = {};
  
  nodes.forEach(node => {
    graph[node.id] = [];
  });
  
  edges.forEach(edge => {
    if (graph[edge.source]) {
      graph[edge.source].push(edge.target);
    }
  });
  
  // Track visited nodes and nodes in the current recursion stack
  const visited: Record<string, boolean> = {};
  const recStack: Record<string, boolean> = {};
  
  // DFS function to detect cycle
  function isCyclicUtil(nodeId: string): boolean {
    // Mark the current node as visited and part of recursion stack
    if (!visited[nodeId]) {
      visited[nodeId] = true;
      recStack[nodeId] = true;
      
      // Check all adjacent nodes
      for (const adjacentNode of graph[nodeId]) {
        if (!visited[adjacentNode] && isCyclicUtil(adjacentNode)) {
          return true;
        } else if (recStack[adjacentNode]) {
          return true;
        }
      }
    }
    
    // Remove the node from recursion stack
    recStack[nodeId] = false;
    return false;
  }
  
  // Check for cycles starting from each node
  for (const nodeId in graph) {
    if (!visited[nodeId] && isCyclicUtil(nodeId)) {
      return true;
    }
  }
  
  return false;
} 
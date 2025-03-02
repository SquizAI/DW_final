export const typeDefs = `#graphql
  type Stats {
    totalUsers: Int!
    activeProjects: Int!
    dataPoints: Int!
  }

  type Position {
    x: Float!
    y: Float!
  }

  type NodeData {
    label: String!
    type: String
    config: String
  }

  type Node {
    id: String!
    type: String!
    position: Position!
    data: NodeData!
  }

  type Edge {
    id: String!
    source: String!
    target: String!
    type: String
  }

  type Workflow {
    id: String!
    name: String!
    description: String
    dataset_id: String
    template: String
    nodes: [Node!]!
    edges: [Edge!]!
    created_at: String
    updated_at: String
  }

  input PositionInput {
    x: Float!
    y: Float!
  }

  input NodeDataInput {
    label: String!
    type: String
    config: String
  }

  input NodeInput {
    id: String!
    type: String!
    position: PositionInput!
    data: NodeDataInput!
  }

  input EdgeInput {
    id: String!
    source: String!
    target: String!
    type: String
  }

  input WorkflowInput {
    name: String!
    description: String
    dataset_id: String
    template: String
    nodes: [NodeInput!]!
    edges: [EdgeInput!]!
  }

  type Query {
    stats: Stats!
    workflows: [Workflow!]!
    workflow(id: String!): Workflow
  }

  type Mutation {
    createWorkflow(input: WorkflowInput!): Workflow!
    updateWorkflow(id: String!, input: WorkflowInput!): Workflow!
    deleteWorkflow(id: String!): Boolean!
    executeWorkflow(id: String!): Boolean!
  }
`;

// In-memory storage for workflows
const workflowsData = new Map<string, any>();

export const resolvers = {
  Query: {
    stats: async () => {
      // In a real application, these would come from your database
      return {
        totalUsers: 1234,
        activeProjects: 567,
        dataPoints: 890123
      };
    },
    workflows: async () => {
      return Array.from(workflowsData.values());
    },
    workflow: async (_: any, { id }: { id: string }) => {
      return workflowsData.get(id);
    }
  },
  Mutation: {
    createWorkflow: async (_: any, { input }: { input: any }) => {
      const id = `workflow-${Date.now()}`;
      const workflow = {
        id,
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      workflowsData.set(id, workflow);
      return workflow;
    },
    updateWorkflow: async (_: any, { id, input }: { id: string, input: any }) => {
      const existingWorkflow = workflowsData.get(id);
      if (!existingWorkflow) {
        throw new Error(`Workflow with id ${id} not found`);
      }
      
      const updatedWorkflow = {
        ...existingWorkflow,
        ...input,
        updated_at: new Date().toISOString()
      };
      
      workflowsData.set(id, updatedWorkflow);
      return updatedWorkflow;
    },
    deleteWorkflow: async (_: any, { id }: { id: string }) => {
      const exists = workflowsData.has(id);
      if (exists) {
        workflowsData.delete(id);
        return true;
      }
      return false;
    },
    executeWorkflow: async (_: any, { id }: { id: string }) => {
      const workflow = workflowsData.get(id);
      if (!workflow) {
        throw new Error(`Workflow with id ${id} not found`);
      }
      
      console.log(`Executing workflow: ${workflow.name}`);
      // In a real application, this would trigger the workflow execution
      
      return true;
    }
  }
}; 
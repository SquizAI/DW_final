export interface AgentCapability {
  id: string;
  label: string;
  description: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  requirements?: string[];
}

export interface AgentDefinition {
  label: string;
  description: string;
  capabilities: AgentCapability[];
  learningCapacity: number; // 0-1 scale of learning ability
  autonomyLevel: number; // 0-1 scale of autonomous decision making
  specializations: string[];
  requirements?: {
    minDataPoints?: number;
    preferredDataTypes?: string[];
    computationalNeeds?: string;
  };
}

// Enhanced agent types with more sophisticated capabilities
export const AGENT_TYPES: Record<string, AgentDefinition> = {
  dataExplorer: {
    label: 'Data Explorer Agent',
    description: 'Autonomously explores and analyzes datasets using advanced pattern recognition',
    capabilities: [
      { 
        id: 'pattern_discovery',
        label: 'Pattern Discovery',
        description: 'Uses advanced ML to identify complex patterns in data',
        complexity: 'advanced',
        requirements: ['structured_data', 'min_rows_1000']
      },
      { 
        id: 'anomaly_detection',
        label: 'Anomaly Detection',
        description: 'Detects outliers using ensemble methods',
        complexity: 'advanced'
      },
      { 
        id: 'correlation_analysis',
        label: 'Correlation Analysis',
        description: 'Analyzes linear and non-linear relationships',
        complexity: 'intermediate'
      },
      { 
        id: 'data_profiling',
        label: 'Data Profiling',
        description: 'Creates comprehensive data quality reports',
        complexity: 'basic'
      },
      {
        id: 'semantic_analysis',
        label: 'Semantic Analysis',
        description: 'Understands data meaning and context',
        complexity: 'advanced'
      }
    ],
    learningCapacity: 0.8,
    autonomyLevel: 0.7,
    specializations: ['pattern_recognition', 'statistical_analysis'],
    requirements: {
      minDataPoints: 1000,
      preferredDataTypes: ['numerical', 'categorical', 'temporal'],
      computationalNeeds: 'medium'
    }
  },

  featureEngineer: {
    label: 'Feature Engineer Agent',
    description: 'Creates optimal features using advanced ML techniques',
    capabilities: [
      {
        id: 'automated_feature_generation',
        label: 'Automated Feature Generation',
        description: 'Creates features using deep learning',
        complexity: 'advanced'
      },
      {
        id: 'feature_selection',
        label: 'Feature Selection',
        description: 'Selects optimal features using ensemble methods',
        complexity: 'advanced'
      },
      {
        id: 'feature_transformation',
        label: 'Feature Transformation',
        description: 'Applies advanced transformations',
        complexity: 'intermediate'
      },
      {
        id: 'cross_feature_synthesis',
        label: 'Cross-Feature Synthesis',
        description: 'Creates interaction features automatically',
        complexity: 'advanced'
      }
    ],
    learningCapacity: 0.9,
    autonomyLevel: 0.8,
    specializations: ['feature_engineering', 'dimensionality_reduction'],
    requirements: {
      minDataPoints: 5000,
      preferredDataTypes: ['numerical', 'categorical'],
      computationalNeeds: 'high'
    }
  },

  modelArchitect: {
    label: 'Model Architect Agent',
    description: 'Designs and optimizes advanced ML architectures',
    capabilities: [
      {
        id: 'neural_architecture_search',
        label: 'Neural Architecture Search',
        description: 'Automatically designs neural networks',
        complexity: 'advanced'
      },
      {
        id: 'automated_ensemble',
        label: 'Automated Ensemble Creation',
        description: 'Creates optimal model ensembles',
        complexity: 'advanced'
      },
      {
        id: 'transfer_learning',
        label: 'Transfer Learning',
        description: 'Adapts pre-trained models',
        complexity: 'advanced'
      }
    ],
    learningCapacity: 0.95,
    autonomyLevel: 0.9,
    specializations: ['deep_learning', 'model_optimization'],
    requirements: {
      minDataPoints: 10000,
      preferredDataTypes: ['numerical', 'image', 'text'],
      computationalNeeds: 'very_high'
    }
  },

  experimentationAgent: {
    label: 'Experimentation Agent',
    description: 'Conducts automated ML experiments',
    capabilities: [
      {
        id: 'hypothesis_testing',
        label: 'Hypothesis Testing',
        description: 'Automatically generates and tests hypotheses',
        complexity: 'advanced'
      },
      {
        id: 'ablation_studies',
        label: 'Ablation Studies',
        description: 'Systematically evaluates feature importance',
        complexity: 'advanced'
      },
      {
        id: 'a_b_testing',
        label: 'A/B Testing',
        description: 'Conducts model comparison experiments',
        complexity: 'intermediate'
      }
    ],
    learningCapacity: 0.85,
    autonomyLevel: 0.8,
    specializations: ['experimental_design', 'statistical_testing'],
    requirements: {
      minDataPoints: 5000,
      preferredDataTypes: ['numerical', 'categorical'],
      computationalNeeds: 'medium'
    }
  },

  explainabilityAgent: {
    label: 'Explainability Agent',
    description: 'Provides interpretable AI insights',
    capabilities: [
      {
        id: 'local_explanations',
        label: 'Local Explanations',
        description: 'Explains individual predictions',
        complexity: 'advanced'
      },
      {
        id: 'global_explanations',
        label: 'Global Explanations',
        description: 'Explains overall model behavior',
        complexity: 'advanced'
      },
      {
        id: 'counterfactual_analysis',
        label: 'Counterfactual Analysis',
        description: 'Generates what-if explanations',
        complexity: 'advanced'
      }
    ],
    learningCapacity: 0.8,
    autonomyLevel: 0.7,
    specializations: ['model_interpretation', 'visualization'],
    requirements: {
      minDataPoints: 1000,
      preferredDataTypes: ['numerical', 'categorical', 'text'],
      computationalNeeds: 'medium'
    }
  },

  automationAgent: {
    label: 'Automation Agent',
    description: 'Automates end-to-end ML workflows',
    capabilities: [
      {
        id: 'workflow_optimization',
        label: 'Workflow Optimization',
        description: 'Optimizes ML pipelines automatically',
        complexity: 'advanced'
      },
      {
        id: 'resource_management',
        label: 'Resource Management',
        description: 'Manages computational resources',
        complexity: 'intermediate'
      },
      {
        id: 'error_handling',
        label: 'Error Handling',
        description: 'Automatically handles errors and retries',
        complexity: 'intermediate'
      }
    ],
    learningCapacity: 0.9,
    autonomyLevel: 0.95,
    specializations: ['workflow_automation', 'resource_optimization'],
    requirements: {
      computationalNeeds: 'low'
    }
  }
};

export type AgentType = keyof typeof AGENT_TYPES;

export interface AgentState {
  status: 'idle' | 'learning' | 'working' | 'completed' | 'error';
  progress: number;
  results?: any;
  insights?: string[];
  learningProgress?: number;
  confidence?: number;
  performance?: {
    accuracy?: number;
    latency?: number;
    resourceUsage?: number;
  };
}

// Enhanced interaction types with more sophisticated patterns
export interface AgentInteraction {
  from: string;
  to: string;
  type: InteractionType;
  protocol: InteractionProtocol;
  timestamp: Date;
  status: InteractionStatus;
  priority: number; // 0-1 scale
  context?: any;
  messages: Array<{
    from: string;
    to: string;
    content: string;
    timestamp: Date;
    type: MessageType;
    metadata?: any;
  }>;
  results?: {
    success: boolean;
    outputs?: any;
    metrics?: any;
    recommendations?: string[];
  };
}

export type InteractionType = 
  | 'collaboration'
  | 'supervision'
  | 'learning'
  | 'negotiation'
  | 'delegation'
  | 'consensus_building'
  | 'knowledge_sharing'
  | 'conflict_resolution';

export type InteractionProtocol =
  | 'request_response'
  | 'publish_subscribe'
  | 'voting'
  | 'auction'
  | 'contract_net'
  | 'blackboard'
  | 'peer_to_peer';

export type InteractionStatus =
  | 'pending'
  | 'active'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type MessageType =
  | 'request'
  | 'response'
  | 'notification'
  | 'proposal'
  | 'acceptance'
  | 'rejection'
  | 'query'
  | 'inform'
  | 'error';

// Interaction patterns for complex multi-agent scenarios
export const INTERACTION_PATTERNS = {
  hierarchical: {
    description: 'Hierarchical organization with supervisor and worker agents',
    roles: ['supervisor', 'worker'],
    protocols: ['delegation', 'reporting'],
  },
  peer_to_peer: {
    description: 'Decentralized collaboration between equal agents',
    roles: ['peer'],
    protocols: ['negotiation', 'knowledge_sharing'],
  },
  market_based: {
    description: 'Agents compete and bid for tasks',
    roles: ['auctioneer', 'bidder'],
    protocols: ['auction', 'contract_net'],
  },
  consensus: {
    description: 'Agents work together to reach agreement',
    roles: ['proposer', 'voter'],
    protocols: ['voting', 'discussion'],
  },
  blackboard: {
    description: 'Agents share a common knowledge base',
    roles: ['contributor', 'observer'],
    protocols: ['publish_subscribe'],
  },
}; 
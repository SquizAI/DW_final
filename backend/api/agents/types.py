from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

class AgentRole(str, Enum):
    COORDINATOR = "coordinator"
    DATA_ENGINEER = "data_engineer"
    DATA_ANALYST = "data_analyst"
    ML_ENGINEER = "ml_engineer"
    VISUALIZATION_EXPERT = "visualization_expert"
    REPORT_WRITER = "report_writer"

class AgentStatus(str, Enum):
    IDLE = "idle"
    WORKING = "working"
    WAITING = "waiting"

class ToolCall(BaseModel):
    tool: str
    params: Dict[str, Any]
    result: Optional[Dict[str, Any]] = None

class Message(BaseModel):
    role: str
    content: str
    agent_id: Optional[str] = None
    tool_calls: Optional[List[ToolCall]] = None
    timestamp: datetime

class Agent(BaseModel):
    id: str
    name: str
    role: AgentRole
    capabilities: List[str]
    status: AgentStatus
    context: Dict[str, Any] = {}

class AgentResponse(BaseModel):
    agent_id: str
    message: str
    tool_calls: Optional[List[ToolCall]] = None
    status: AgentStatus

class AgentInteraction(BaseModel):
    message: str
    context: Dict[str, Any]

# Agent Capabilities by Role
AGENT_CAPABILITIES = {
    AgentRole.COORDINATOR: [
        "task_planning",
        "agent_coordination",
        "workflow_management"
    ],
    AgentRole.DATA_ENGINEER: [
        "data_integration",
        "data_cleaning",
        "data_transformation",
        "schema_management"
    ],
    AgentRole.DATA_ANALYST: [
        "descriptive_analysis",
        "statistical_analysis",
        "data_exploration",
        "feature_analysis"
    ],
    AgentRole.ML_ENGINEER: [
        "feature_engineering",
        "model_training",
        "model_evaluation",
        "hyperparameter_tuning"
    ],
    AgentRole.VISUALIZATION_EXPERT: [
        "data_visualization",
        "chart_creation",
        "dashboard_design",
        "visual_analysis"
    ],
    AgentRole.REPORT_WRITER: [
        "report_generation",
        "documentation",
        "insight_summarization",
        "narrative_creation"
    ]
}

# Tool Access by Role
TOOL_ACCESS = {
    AgentRole.COORDINATOR: ["all"],  # Coordinator can access all tools
    AgentRole.DATA_ENGINEER: [
        "data_integration",
        "data_wrangling",
        "data_binning",
        "export"
    ],
    AgentRole.DATA_ANALYST: [
        "data_analysis",
        "data_wrangling",
        "visualization",
        "export"
    ],
    AgentRole.ML_ENGINEER: [
        "feature_engineering",
        "classification",
        "data_binning",
        "export"
    ],
    AgentRole.VISUALIZATION_EXPERT: [
        "visualization",
        "data_analysis",
        "export"
    ],
    AgentRole.REPORT_WRITER: [
        "report",
        "visualization",
        "export"
    ]
}

# Agent System Constants
MAX_CONCURRENT_AGENTS = 5
MAX_TOOL_CALLS_PER_INTERACTION = 10
MAX_INTERACTION_TURNS = 20
INTERACTION_TIMEOUT = 300  # seconds 
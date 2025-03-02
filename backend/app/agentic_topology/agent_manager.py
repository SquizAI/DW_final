"""
Agent Manager Module

This module defines the AgentManager class for managing intelligent agents
in the agentic topology system.
"""

import logging
import uuid
import asyncio
from typing import Dict, List, Any, Optional, Set, Callable
from enum import Enum
from pydantic import BaseModel, Field
import json
import time
from datetime import datetime

logger = logging.getLogger(__name__)

class AgentRole(str, Enum):
    """Roles that agents can take in the system."""
    COORDINATOR = "coordinator"
    DATA_PROCESSOR = "data_processor"
    ANALYZER = "analyzer"
    VISUALIZER = "visualizer"
    EXPLAINER = "explainer"
    OPTIMIZER = "optimizer"
    VALIDATOR = "validator"
    RESEARCHER = "researcher"

class AgentCapability(str, Enum):
    """Capabilities that agents can have."""
    DATA_CLEANING = "data_cleaning"
    FEATURE_ENGINEERING = "feature_engineering"
    MODEL_SELECTION = "model_selection"
    HYPERPARAMETER_TUNING = "hyperparameter_tuning"
    VISUALIZATION = "visualization"
    INSIGHT_GENERATION = "insight_generation"
    ANOMALY_DETECTION = "anomaly_detection"
    FORECASTING = "forecasting"
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    CLUSTERING = "clustering"
    DIMENSIONALITY_REDUCTION = "dimensionality_reduction"
    TEXT_ANALYSIS = "text_analysis"
    IMAGE_ANALYSIS = "image_analysis"
    TIME_SERIES_ANALYSIS = "time_series_analysis"

class AgentStatus(str, Enum):
    """Status of an agent."""
    IDLE = "idle"
    LEARNING = "learning"
    WORKING = "working"
    COMPLETED = "completed"
    ERROR = "error"

class InteractionType(str, Enum):
    """Types of interactions between agents."""
    COLLABORATION = "collaboration"
    DELEGATION = "delegation"
    NEGOTIATION = "negotiation"
    COMPETITION = "competition"
    SUPERVISION = "supervision"

class InteractionProtocol(str, Enum):
    """Protocols for agent interactions."""
    REQUEST_RESPONSE = "request_response"
    PUBLISH_SUBSCRIBE = "publish_subscribe"
    CONTRACT_NET = "contract_net"
    VOTING = "voting"
    AUCTION = "auction"

class Message(BaseModel):
    """Message exchanged between agents."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_agent: str
    to_agent: str
    content: Dict[str, Any]
    interaction_type: InteractionType
    protocol: InteractionProtocol
    timestamp: datetime = Field(default_factory=datetime.now)
    requires_response: bool = True
    response_to: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AgentConfig(BaseModel):
    """Configuration for an agent."""
    id: str
    name: str
    role: AgentRole
    capabilities: List[AgentCapability]
    learning_capacity: float = 0.5  # 0.0 to 1.0
    autonomy_level: float = 0.5  # 0.0 to 1.0
    specializations: List[str] = Field(default_factory=list)
    parameters: Dict[str, Any] = Field(default_factory=dict)

class AgentState(BaseModel):
    """State of an agent."""
    status: AgentStatus = AgentStatus.IDLE
    progress: float = 0.0
    current_task: Optional[str] = None
    performance: Dict[str, float] = Field(default_factory=dict)
    knowledge_base: Dict[str, Any] = Field(default_factory=dict)
    last_updated: datetime = Field(default_factory=datetime.now)

class AgentInteraction(BaseModel):
    """Interaction between agents."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    interaction_type: InteractionType
    protocol: InteractionProtocol
    participants: List[str]
    messages: List[Message] = Field(default_factory=list)
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class Agent(BaseModel):
    """Intelligent agent in the system."""
    config: AgentConfig
    state: AgentState = Field(default_factory=AgentState)
    interactions: Dict[str, AgentInteraction] = Field(default_factory=dict)
    
    def update_state(self, **kwargs):
        """Update the agent's state."""
        for key, value in kwargs.items():
            if hasattr(self.state, key):
                setattr(self.state, key, value)
        self.state.last_updated = datetime.now()
    
    def add_interaction(self, interaction: AgentInteraction):
        """Add an interaction to the agent."""
        self.interactions[interaction.id] = interaction
    
    def add_message(self, interaction_id: str, message: Message):
        """Add a message to an interaction."""
        if interaction_id in self.interactions:
            self.interactions[interaction_id].messages.append(message)
            self.interactions[interaction_id].updated_at = datetime.now()
    
    def get_capability_score(self, capability: AgentCapability) -> float:
        """Get the agent's score for a capability."""
        if capability in self.config.capabilities:
            # Base score from having the capability
            base_score = 0.7
            
            # Bonus if it's a specialization
            specialization_bonus = 0.2 if capability.value in self.config.specializations else 0.0
            
            # Performance bonus if available
            performance_bonus = self.state.performance.get(capability.value, 0.0) * 0.1
            
            return min(1.0, base_score + specialization_bonus + performance_bonus)
        return 0.0

class AgentManager:
    """
    Manager for intelligent agents in the agentic topology system.
    
    Handles:
    - Agent creation and management
    - Agent interactions
    - Task delegation and coordination
    - Learning and adaptation
    """
    
    def __init__(self):
        """Initialize the AgentManager."""
        self.agents: Dict[str, Agent] = {}
        self.interactions: Dict[str, AgentInteraction] = {}
        self.message_queue: List[Message] = []
        self.task_registry: Dict[str, Dict[str, Any]] = {}
        self.callbacks: Dict[str, List[Callable]] = {}
    
    def create_agent(self, config: AgentConfig) -> Agent:
        """
        Create a new agent.
        
        Args:
            config: Configuration for the agent
            
        Returns:
            The created agent
        """
        agent = Agent(config=config)
        self.agents[config.id] = agent
        logger.info(f"Created agent: {config.id} ({config.name})")
        return agent
    
    def get_agent(self, agent_id: str) -> Optional[Agent]:
        """
        Get an agent by ID.
        
        Args:
            agent_id: ID of the agent
            
        Returns:
            The agent, or None if not found
        """
        return self.agents.get(agent_id)
    
    def delete_agent(self, agent_id: str) -> bool:
        """
        Delete an agent.
        
        Args:
            agent_id: ID of the agent
            
        Returns:
            True if the agent was deleted, False otherwise
        """
        if agent_id in self.agents:
            del self.agents[agent_id]
            logger.info(f"Deleted agent: {agent_id}")
            return True
        return False
    
    def create_interaction(
        self,
        interaction_type: InteractionType,
        protocol: InteractionProtocol,
        participants: List[str],
        metadata: Dict[str, Any] = None
    ) -> Optional[AgentInteraction]:
        """
        Create a new interaction between agents.
        
        Args:
            interaction_type: Type of interaction
            protocol: Protocol for the interaction
            participants: IDs of participating agents
            metadata: Additional metadata for the interaction
            
        Returns:
            The created interaction, or None if any agent was not found
        """
        # Verify all participants exist
        for agent_id in participants:
            if agent_id not in self.agents:
                logger.error(f"Agent not found: {agent_id}")
                return None
        
        # Create the interaction
        interaction = AgentInteraction(
            interaction_type=interaction_type,
            protocol=protocol,
            participants=participants,
            metadata=metadata or {}
        )
        
        # Add the interaction to the registry
        self.interactions[interaction.id] = interaction
        
        # Add the interaction to each agent
        for agent_id in participants:
            self.agents[agent_id].add_interaction(interaction)
        
        logger.info(f"Created interaction: {interaction.id} ({interaction_type})")
        return interaction
    
    def send_message(
        self,
        from_agent: str,
        to_agent: str,
        content: Dict[str, Any],
        interaction_id: str,
        requires_response: bool = True,
        response_to: Optional[str] = None
    ) -> Optional[Message]:
        """
        Send a message from one agent to another.
        
        Args:
            from_agent: ID of the sending agent
            to_agent: ID of the receiving agent
            content: Content of the message
            interaction_id: ID of the interaction
            requires_response: Whether the message requires a response
            response_to: ID of the message this is a response to
            
        Returns:
            The created message, or None if the interaction or agents were not found
        """
        # Verify the interaction exists
        if interaction_id not in self.interactions:
            logger.error(f"Interaction not found: {interaction_id}")
            return None
        
        # Verify both agents exist
        if from_agent not in self.agents:
            logger.error(f"Sending agent not found: {from_agent}")
            return None
        
        if to_agent not in self.agents:
            logger.error(f"Receiving agent not found: {to_agent}")
            return None
        
        # Get the interaction
        interaction = self.interactions[interaction_id]
        
        # Create the message
        message = Message(
            from_agent=from_agent,
            to_agent=to_agent,
            content=content,
            interaction_type=interaction.interaction_type,
            protocol=interaction.protocol,
            requires_response=requires_response,
            response_to=response_to
        )
        
        # Add the message to the interaction
        interaction.messages.append(message)
        interaction.updated_at = datetime.now()
        
        # Add the message to the agents
        self.agents[from_agent].add_message(interaction_id, message)
        self.agents[to_agent].add_message(interaction_id, message)
        
        # Add the message to the queue for processing
        self.message_queue.append(message)
        
        logger.info(f"Sent message: {message.id} from {from_agent} to {to_agent}")
        return message
    
    def process_messages(self):
        """Process all messages in the queue."""
        while self.message_queue:
            message = self.message_queue.pop(0)
            self._process_message(message)
    
    def _process_message(self, message: Message):
        """
        Process a message.
        
        Args:
            message: The message to process
        """
        # Get the receiving agent
        agent = self.agents.get(message.to_agent)
        if not agent:
            logger.error(f"Receiving agent not found: {message.to_agent}")
            return
        
        # Process the message based on the protocol
        if message.protocol == InteractionProtocol.REQUEST_RESPONSE:
            self._process_request_response(message, agent)
        elif message.protocol == InteractionProtocol.PUBLISH_SUBSCRIBE:
            self._process_publish_subscribe(message, agent)
        elif message.protocol == InteractionProtocol.CONTRACT_NET:
            self._process_contract_net(message, agent)
        elif message.protocol == InteractionProtocol.VOTING:
            self._process_voting(message, agent)
        elif message.protocol == InteractionProtocol.AUCTION:
            self._process_auction(message, agent)
    
    def _process_request_response(self, message: Message, agent: Agent):
        """
        Process a request-response message.
        
        Args:
            message: The message to process
            agent: The receiving agent
        """
        # If this is a request, generate a response
        if message.requires_response and not message.response_to:
            # TODO: Implement agent-specific logic to generate a response
            response_content = {
                "status": "success",
                "data": {"message": "This is a placeholder response"}
            }
            
            # Send the response
            self.send_message(
                from_agent=agent.config.id,
                to_agent=message.from_agent,
                content=response_content,
                interaction_id=next(
                    (i.id for i in agent.interactions.values() if message in i.messages),
                    None
                ),
                requires_response=False,
                response_to=message.id
            )
    
    def _process_publish_subscribe(self, message: Message, agent: Agent):
        """
        Process a publish-subscribe message.
        
        Args:
            message: The message to process
            agent: The receiving agent
        """
        # TODO: Implement publish-subscribe protocol
        pass
    
    def _process_contract_net(self, message: Message, agent: Agent):
        """
        Process a contract net message.
        
        Args:
            message: The message to process
            agent: The receiving agent
        """
        # TODO: Implement contract net protocol
        pass
    
    def _process_voting(self, message: Message, agent: Agent):
        """
        Process a voting message.
        
        Args:
            message: The message to process
            agent: The receiving agent
        """
        # TODO: Implement voting protocol
        pass
    
    def _process_auction(self, message: Message, agent: Agent):
        """
        Process an auction message.
        
        Args:
            message: The message to process
            agent: The receiving agent
        """
        # TODO: Implement auction protocol
        pass
    
    def find_best_agent_for_task(self, task_type: str, required_capabilities: List[AgentCapability]) -> Optional[Agent]:
        """
        Find the best agent for a task.
        
        Args:
            task_type: Type of task
            required_capabilities: Capabilities required for the task
            
        Returns:
            The best agent for the task, or None if no suitable agent was found
        """
        best_agent = None
        best_score = 0.0
        
        for agent in self.agents.values():
            # Skip agents that are not idle
            if agent.state.status != AgentStatus.IDLE:
                continue
            
            # Calculate the agent's score for the task
            score = 0.0
            for capability in required_capabilities:
                score += agent.get_capability_score(capability)
            
            # Normalize the score
            score /= len(required_capabilities) if required_capabilities else 1.0
            
            # Update the best agent if this one is better
            if score > best_score:
                best_agent = agent
                best_score = score
        
        return best_agent
    
    def delegate_task(self, task_id: str, task_type: str, required_capabilities: List[AgentCapability], data: Dict[str, Any]) -> bool:
        """
        Delegate a task to the best agent.
        
        Args:
            task_id: ID of the task
            task_type: Type of task
            required_capabilities: Capabilities required for the task
            data: Data for the task
            
        Returns:
            True if the task was delegated, False otherwise
        """
        # Find the best agent for the task
        agent = self.find_best_agent_for_task(task_type, required_capabilities)
        if not agent:
            logger.error(f"No suitable agent found for task: {task_id}")
            return False
        
        # Register the task
        self.task_registry[task_id] = {
            "type": task_type,
            "agent_id": agent.config.id,
            "status": "assigned",
            "created_at": datetime.now(),
            "data": data
        }
        
        # Update the agent's state
        agent.update_state(
            status=AgentStatus.WORKING,
            current_task=task_id,
            progress=0.0
        )
        
        logger.info(f"Delegated task {task_id} to agent {agent.config.id}")
        return True
    
    def update_task_progress(self, task_id: str, progress: float, status: str = None, result: Dict[str, Any] = None):
        """
        Update the progress of a task.
        
        Args:
            task_id: ID of the task
            progress: Progress of the task (0.0 to 1.0)
            status: Status of the task
            result: Result of the task
        """
        if task_id not in self.task_registry:
            logger.error(f"Task not found: {task_id}")
            return
        
        # Update the task
        task = self.task_registry[task_id]
        if status:
            task["status"] = status
        task["progress"] = progress
        if result:
            task["result"] = result
        
        # Update the agent's state
        agent_id = task["agent_id"]
        if agent_id in self.agents:
            agent = self.agents[agent_id]
            agent.update_state(progress=progress)
            
            # If the task is complete, update the agent's status
            if progress >= 1.0 or status in ["completed", "failed"]:
                agent.update_state(
                    status=AgentStatus.COMPLETED if status == "completed" else AgentStatus.ERROR,
                    current_task=None
                )
        
        # Trigger callbacks
        self._trigger_callbacks("task_progress", task_id=task_id, progress=progress, status=status)
    
    def register_callback(self, event_type: str, callback: Callable):
        """
        Register a callback for an event.
        
        Args:
            event_type: Type of event
            callback: Callback function
        """
        if event_type not in self.callbacks:
            self.callbacks[event_type] = []
        self.callbacks[event_type].append(callback)
    
    def _trigger_callbacks(self, event_type: str, **kwargs):
        """
        Trigger callbacks for an event.
        
        Args:
            event_type: Type of event
            **kwargs: Arguments for the callbacks
        """
        if event_type in self.callbacks:
            for callback in self.callbacks[event_type]:
                try:
                    callback(**kwargs)
                except Exception as e:
                    logger.error(f"Error in callback: {e}")
    
    def create_default_agents(self):
        """Create a set of default agents with predefined roles and capabilities."""
        # Coordinator agent
        self.create_agent(AgentConfig(
            id="coordinator",
            name="Workflow Coordinator",
            role=AgentRole.COORDINATOR,
            capabilities=[
                AgentCapability.MODEL_SELECTION,
                AgentCapability.HYPERPARAMETER_TUNING,
                AgentCapability.INSIGHT_GENERATION
            ],
            learning_capacity=0.8,
            autonomy_level=0.9,
            specializations=["workflow_optimization", "task_delegation"]
        ))
        
        # Data processor agent
        self.create_agent(AgentConfig(
            id="data_processor",
            name="Data Cleaner",
            role=AgentRole.DATA_PROCESSOR,
            capabilities=[
                AgentCapability.DATA_CLEANING,
                AgentCapability.FEATURE_ENGINEERING,
                AgentCapability.ANOMALY_DETECTION
            ],
            learning_capacity=0.7,
            autonomy_level=0.6,
            specializations=["missing_value_imputation", "outlier_detection"]
        ))
        
        # Analyzer agent
        self.create_agent(AgentConfig(
            id="analyzer",
            name="Data Analyzer",
            role=AgentRole.ANALYZER,
            capabilities=[
                AgentCapability.CLASSIFICATION,
                AgentCapability.REGRESSION,
                AgentCapability.CLUSTERING,
                AgentCapability.DIMENSIONALITY_REDUCTION
            ],
            learning_capacity=0.9,
            autonomy_level=0.7,
            specializations=["predictive_modeling", "pattern_recognition"]
        ))
        
        # Visualizer agent
        self.create_agent(AgentConfig(
            id="visualizer",
            name="Data Visualizer",
            role=AgentRole.VISUALIZER,
            capabilities=[
                AgentCapability.VISUALIZATION,
                AgentCapability.INSIGHT_GENERATION
            ],
            learning_capacity=0.6,
            autonomy_level=0.5,
            specializations=["interactive_visualization", "dashboard_creation"]
        ))
        
        # Explainer agent
        self.create_agent(AgentConfig(
            id="explainer",
            name="Model Explainer",
            role=AgentRole.EXPLAINER,
            capabilities=[
                AgentCapability.INSIGHT_GENERATION,
                AgentCapability.MODEL_SELECTION
            ],
            learning_capacity=0.8,
            autonomy_level=0.6,
            specializations=["model_interpretation", "feature_importance"]
        ))
        
        logger.info("Created default agents")

# Initialize the agent manager
agent_manager = AgentManager() 
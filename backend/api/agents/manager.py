import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
import openai
from .types import (
    Agent, AgentRole, AgentStatus, Message, ToolCall,
    AgentResponse, AGENT_CAPABILITIES, TOOL_ACCESS,
    MAX_CONCURRENT_AGENTS, MAX_TOOL_CALLS_PER_INTERACTION,
    MAX_INTERACTION_TURNS, INTERACTION_TIMEOUT
)

class AgentManager:
    def __init__(self):
        self.agents: Dict[str, Agent] = {}
        self.message_history: List[Message] = []
        self.active_workflows: Dict[str, Dict[str, Any]] = {}

    def initialize_agents(self):
        """Initialize the default set of agents."""
        # Create coordinator agent
        coordinator = Agent(
            id=str(uuid.uuid4()),
            name="Coordinator",
            role=AgentRole.COORDINATOR,
            capabilities=AGENT_CAPABILITIES[AgentRole.COORDINATOR],
            status=AgentStatus.IDLE
        )
        self.agents[coordinator.id] = coordinator

        # Create specialized agents
        specialized_roles = [
            (AgentRole.DATA_ENGINEER, "Data Engineer"),
            (AgentRole.DATA_ANALYST, "Data Analyst"),
            (AgentRole.ML_ENGINEER, "ML Engineer"),
            (AgentRole.VISUALIZATION_EXPERT, "Visualization Expert"),
            (AgentRole.REPORT_WRITER, "Report Writer")
        ]

        for role, name in specialized_roles:
            agent = Agent(
                id=str(uuid.uuid4()),
                name=name,
                role=role,
                capabilities=AGENT_CAPABILITIES[role],
                status=AgentStatus.IDLE
            )
            self.agents[agent.id] = agent

    async def handle_interaction(self, message: str, context: Dict[str, Any]) -> List[AgentResponse]:
        """Handle a new interaction from the user."""
        # Add user message to history
        self.message_history.append(Message(
            role="user",
            content=message,
            timestamp=datetime.now()
        ))

        # Get coordinator response first
        coordinator = next(agent for agent in self.agents.values() if agent.role == AgentRole.COORDINATOR)
        coordinator_response = await self._get_agent_response(coordinator, message, context)
        
        # Parse coordinator's response to determine which agents to involve
        involved_agents = await self._parse_coordinator_response(coordinator_response)
        
        # Get responses from involved agents
        responses = [coordinator_response]
        for agent in involved_agents:
            if len(responses) < MAX_CONCURRENT_AGENTS:
                agent_response = await self._get_agent_response(agent, message, context)
                responses.append(agent_response)

        return responses

    async def _get_agent_response(self, agent: Agent, message: str, context: Dict[str, Any]) -> AgentResponse:
        """Get a response from a specific agent."""
        agent.status = AgentStatus.WORKING
        
        try:
            # Prepare the prompt for the agent
            prompt = self._prepare_agent_prompt(agent, message, context)
            
            # Get response from OpenAI
            response = await openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Parse the response
            content = response.choices[0].message.content
            tool_calls = await self._extract_tool_calls(content)
            
            # Execute tool calls if any
            if tool_calls:
                tool_calls = await self._execute_tool_calls(agent, tool_calls)
            
            agent.status = AgentStatus.IDLE
            return AgentResponse(
                agent_id=agent.id,
                message=content,
                tool_calls=tool_calls,
                status=agent.status
            )
            
        except Exception as e:
            agent.status = AgentStatus.IDLE
            return AgentResponse(
                agent_id=agent.id,
                message=f"Error: {str(e)}",
                status=agent.status
            )

    def _prepare_agent_prompt(self, agent: Agent, message: str, context: Dict[str, Any]) -> str:
        """Prepare the prompt for an agent based on their role and context."""
        # Base prompt with agent's role and capabilities
        prompt = f"""You are a {agent.role.value} AI agent with the following capabilities:
{', '.join(agent.capabilities)}

You have access to these tools:
{self._get_available_tools(agent)}

Your task is to help with data analysis and processing. You can use your capabilities and tools to assist the user.
"""

        # Add role-specific instructions
        if agent.role == AgentRole.COORDINATOR:
            prompt += """
As the coordinator, your job is to:
1. Understand the user's request
2. Break it down into subtasks
3. Determine which agents should handle each subtask
4. Provide a high-level plan of action
"""
        elif agent.role == AgentRole.DATA_ENGINEER:
            prompt += """
Focus on data integration, cleaning, and transformation tasks. Ensure data quality and proper schema management.
"""
        # Add similar role-specific instructions for other roles...

        # Add context from previous messages if available
        if context.get("messages"):
            prompt += "\nRecent conversation context:"
            for msg in context["messages"][-3:]:  # Last 3 messages
                prompt += f"\n{msg['role']}: {msg['content']}"

        return prompt

    def _get_available_tools(self, agent: Agent) -> str:
        """Get the list of tools available to an agent."""
        if agent.role == AgentRole.COORDINATOR:
            tools = list(context.get("availableTools", {}).keys())
        else:
            tools = TOOL_ACCESS.get(agent.role, [])
        
        tool_descriptions = []
        for tool in tools:
            if tool in context.get("availableTools", {}):
                desc = context["availableTools"][tool]
                tool_descriptions.append(f"- {tool}: {desc['description']}")
        
        return "\n".join(tool_descriptions)

    async def _parse_coordinator_response(self, response: AgentResponse) -> List[Agent]:
        """Parse the coordinator's response to determine which agents to involve."""
        try:
            # Extract agent roles from coordinator's message
            involved_roles = []
            for role in AgentRole:
                if role.value in response.message.lower():
                    involved_roles.append(role)
            
            # Get the corresponding agents
            return [
                agent for agent in self.agents.values()
                if agent.role in involved_roles and agent.role != AgentRole.COORDINATOR
            ]
        except Exception:
            # Default to no additional agents if parsing fails
            return []

    async def _extract_tool_calls(self, content: str) -> List[ToolCall]:
        """Extract tool calls from an agent's response."""
        # This is a simplified version. In practice, you'd want to use a more robust
        # parsing mechanism or have the LLM output in a specific format
        tool_calls = []
        try:
            # Look for tool calls in the format: TOOL_NAME(parameters)
            import re
            pattern = r'(\w+)\((.*?)\)'
            matches = re.findall(pattern, content)
            
            for tool_name, params_str in matches:
                try:
                    params = eval(f"dict({params_str})")
                    tool_calls.append(ToolCall(
                        tool=tool_name,
                        params=params
                    ))
                except:
                    continue
                    
        except Exception:
            pass
            
        return tool_calls

    async def _execute_tool_calls(self, agent: Agent, tool_calls: List[ToolCall]) -> List[ToolCall]:
        """Execute a list of tool calls and update their results."""
        for tool_call in tool_calls:
            try:
                # Check if agent has access to this tool
                if agent.role != AgentRole.COORDINATOR and tool_call.tool not in TOOL_ACCESS[agent.role]:
                    tool_call.result = {"error": "Agent does not have access to this tool"}
                    continue

                # Execute the tool call
                # In practice, you'd have a tool registry and proper error handling
                result = await self._execute_single_tool(tool_call.tool, tool_call.params)
                tool_call.result = result

            except Exception as e:
                tool_call.result = {"error": str(e)}

        return tool_calls

    async def _execute_single_tool(self, tool: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single tool call."""
        # This would be replaced with actual tool execution logic
        # For now, return a mock result
        return {
            "status": "success",
            "message": f"Executed {tool} with params {params}"
        }

# Create a global instance of the agent manager
agent_manager = AgentManager()
agent_manager.initialize_agents() 
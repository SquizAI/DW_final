from typing import Dict, Any, Optional, List
from enum import Enum
from openai import OpenAI
from app.config import settings
import logging
import json

logger = logging.getLogger(__name__)

class TaskComplexity(Enum):
    BASIC = "basic"          # Simple operations, data validation, basic transformations
    ADVANCED = "advanced"    # Complex analysis, feature engineering, model optimization
    DIRECTOR = "director"    # Strategic decisions, architecture recommendations
    EXECUTIVE = "executive"  # Critical business decisions, high-stakes operations

class AIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        # Update model mapping to use the correct model names
        self.model_mapping = {
            TaskComplexity.BASIC: "gpt-4o-mini-2024-07-18",    # For basic tasks
            TaskComplexity.ADVANCED: "gpt-4o-2024-08-06",      # For advanced analysis
            TaskComplexity.DIRECTOR: "o1-2024-12-17",          # For director-level decisions
            TaskComplexity.EXECUTIVE: "o3-mini-2025-1-31",     # For executive-level decisions
        }
        self.token_mapping = {
            TaskComplexity.BASIC: 4000,      # Basic operations
            TaskComplexity.ADVANCED: 8000,   # Complex analysis
            TaskComplexity.DIRECTOR: 16000,  # Strategic decisions
            TaskComplexity.EXECUTIVE: 32000, # Critical operations
        }

    async def get_completion(
        self,
        prompt: str,
        complexity: TaskComplexity,
        structured_output: Dict[str, Any],
        temperature: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Get completion from OpenAI based on task complexity.
        Always uses structured output for consistent agent communication.
        """
        try:
            model = self.model_mapping[complexity]
            max_tokens = self.token_mapping[complexity]
            
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are an AI agent specialized in data science and workflow automation. "
                        "Always provide responses in the exact JSON structure specified. "
                        f"Required output format: {json.dumps(structured_output, indent=2)}"
                    )
                },
                {"role": "user", "content": prompt}
            ]

            response = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature or 0.7,
                max_tokens=max_tokens,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            
            try:
                parsed_content = json.loads(content)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON response: {content}")
                raise ValueError("Invalid JSON response from OpenAI")

            return {
                "content": parsed_content,
                "model_used": model,
                "complexity": complexity.value,
                "tokens_used": response.usage.total_tokens if response.usage else None,
                "max_tokens_allowed": max_tokens
            }

        except Exception as e:
            logger.error(f"Error in AI completion: {str(e)}")
            raise

    async def analyze_workflow(self, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze workflow structure and provide recommendations"""
        structured_output = {
            "workflow_analysis": {
                "complexity_score": "float",  # 0-1 score of workflow complexity
                "node_count": "integer",
                "edge_count": "integer",
                "depth": "integer",           # Maximum path length
                "bottlenecks": [{
                    "node_id": "string",
                    "type": "string",
                    "severity": "float",
                    "recommendation": "string"
                }]
            },
            "optimization_suggestions": [{
                "type": "string",             # e.g., "performance", "architecture", "data_flow"
                "target_nodes": ["string"],   # List of node IDs
                "suggestion": "string",
                "expected_impact": "float",   # 0-1 score
                "implementation_complexity": "float"  # 0-1 score
            }],
            "ai_capabilities": [{
                "node_id": "string",
                "current_capability": "string",
                "suggested_enhancements": [{
                    "type": "string",
                    "description": "string",
                    "benefit": "string"
                }]
            }],
            "data_flow_analysis": {
                "efficiency_score": "float",
                "data_transformations": [{
                    "from_node": "string",
                    "to_node": "string",
                    "transformation_type": "string",
                    "optimization_possible": "boolean",
                    "suggestion": "string"
                }]
            }
        }
        
        prompt = f"Analyze this workflow and provide comprehensive optimization recommendations: {json.dumps(workflow_data)}"
        response = await self.get_completion(prompt, TaskComplexity.ADVANCED, structured_output)
        return response["content"]

    async def get_node_suggestions(self, current_state: Dict[str, Any]) -> Dict[str, Any]:
        """Get AI-powered suggestions for next workflow steps"""
        structured_output = {
            "node_suggestions": [{
                "type": "string",            # Node type (e.g., "data_preprocessing", "feature_engineering")
                "name": "string",            # Suggested node name
                "description": "string",     # What this node would do
                "confidence": "float",       # How confident the AI is about this suggestion (0-1)
                "prerequisites": ["string"], # Required nodes/conditions
                "expected_benefits": [{
                    "aspect": "string",      # e.g., "performance", "accuracy", "interpretability"
                    "description": "string",
                    "impact_score": "float"  # 0-1 score
                }],
                "configuration": {
                    "suggested_params": {},  # Key-value pairs of suggested parameters
                    "rationale": "string"    # Why these parameters were chosen
                }
            }],
            "workflow_insights": {
                "missing_capabilities": ["string"],
                "potential_improvements": ["string"],
                "data_quality_suggestions": ["string"]
            },
            "integration_opportunities": [{
                "service_type": "string",    # e.g., "AutoML", "DataValidation", "Monitoring"
                "benefit": "string",
                "implementation_effort": "string",
                "priority": "float"          # 0-1 score
            }]
        }
        
        prompt = f"Based on the current workflow state, suggest optimal next steps and improvements: {json.dumps(current_state)}"
        response = await self.get_completion(prompt, TaskComplexity.DIRECTOR, structured_output)
        return response["content"]

    async def evaluate_data_pipeline(self, pipeline_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate and optimize data pipeline configuration"""
        structured_output = {
            "pipeline_analysis": {
                "efficiency_metrics": {
                    "throughput": "float",
                    "latency": "float",
                    "resource_utilization": "float",
                    "data_quality_score": "float"
                },
                "bottlenecks": [{
                    "stage": "string",
                    "metric": "string",
                    "current_value": "float",
                    "target_value": "float",
                    "optimization_strategy": "string"
                }],
                "data_quality_checks": [{
                    "check_name": "string",
                    "status": "string",
                    "metrics": {},
                    "recommendations": ["string"]
                }]
            },
            "optimization_plan": {
                "immediate_actions": [{
                    "action": "string",
                    "impact": "string",
                    "effort": "string",
                    "priority": "float"
                }],
                "long_term_improvements": [{
                    "improvement": "string",
                    "benefits": ["string"],
                    "prerequisites": ["string"],
                    "timeline": "string"
                }]
            },
            "monitoring_suggestions": [{
                "metric": "string",
                "threshold": "float",
                "alert_condition": "string",
                "rationale": "string"
            }]
        }
        
        prompt = f"Evaluate this data pipeline and provide comprehensive optimization recommendations: {json.dumps(pipeline_data)}"
        response = await self.get_completion(prompt, TaskComplexity.EXECUTIVE, structured_output)
        return response["content"]

# Create a singleton instance
ai_service = AIService() 
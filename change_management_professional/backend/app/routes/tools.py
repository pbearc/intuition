# app/routes/tools.py
from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging
import os
import json
import datetime
from app.services.llm_service import LLMService

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter()
llm_service = LLMService()

# Define behavioral psychology models data
BEHAVIORAL_MODELS = {
    "kubler-ross": {
        "name": "Kübler-Ross Change Curve",
        "stages": ["Shock/Denial", "Anger/Fear", "Bargaining/Negotiation", "Depression/Confusion", "Acceptance", "Integration"],
        "descriptions": {
            "Shock/Denial": "Initial reaction where individuals deny the change or its impact. They focus on the past and may ignore information about the change.",
            "Anger/Fear": "Individuals realize change is real and respond with anger, blame, anxiety or fear about impacts.",
            "Bargaining/Negotiation": "Attempting to negotiate better terms or delay the change. Looking for compromises or workarounds.",
            "Depression/Confusion": "Low energy and morale as reality sets in. May be confused about next steps or feel overwhelmed.",
            "Acceptance": "Beginning to accept the new reality and explore how to adapt to it.",
            "Integration": "The change is integrated into normal operations. New behaviors and processes become routine."
        },
        "intervention_strategies": {
            "Shock/Denial": ["Provide clear, consistent information", "Acknowledge emotions", "Focus on the 'why' of change", "Use multiple communication channels", "Repeat key messages"],
            "Anger/Fear": ["Listen actively to concerns", "Don't take it personally", "Provide forums for expression", "Acknowledge feelings as valid", "Be transparent about impacts"],
            "Bargaining/Negotiation": ["Stay focused on non-negotiables", "Find areas for flexibility", "Involve in implementation details", "Create opportunities for input", "Emphasize benefits"],
            "Depression/Confusion": ["Provide extra support and resources", "Celebrate small wins", "Be visible and available", "Offer skills development", "Connect to support networks"],
            "Acceptance": ["Provide training and tools", "Recognize progress", "Offer coaching", "Encourage peer support", "Create opportunities to practice new behaviors"],
            "Integration": ["Recognize and reward new behaviors", "Remove obstacles", "Share success stories", "Establish new performance expectations", "Document new processes"]
        }
    },
    "adkar": {
        "name": "ADKAR Model",
        "stages": ["Awareness", "Desire", "Knowledge", "Ability", "Reinforcement"],
        "descriptions": {
            "Awareness": "Understanding why the change is necessary and the risks of not changing.",
            "Desire": "Personal motivation and choice to support and participate in the change.",
            "Knowledge": "Information, training and education on how to change.",
            "Ability": "Implementing the change on a day-to-day basis and developing new skills.",
            "Reinforcement": "Factors that sustain and reinforce the change to make it stick."
        },
        "intervention_strategies": {
            "Awareness": ["Communicate the business case", "Explain external drivers", "Share the vision", "Provide context and background", "Create urgency"],
            "Desire": ["Address 'What's in it for me?'", "Involve in planning", "Identify and work with sponsors", "Address concerns directly", "Connect to personal values"],
            "Knowledge": ["Provide comprehensive training", "Create job aids and resources", "Offer multiple learning formats", "Ensure access to experts", "Create knowledge-sharing opportunities"],
            "Ability": ["Provide coaching", "Allow time for practice", "Set up sandboxes and simulations", "Create feedback loops", "Remove barriers to performance"],
            "Reinforcement": ["Recognize and celebrate successes", "Measure adoption", "Address resistance to reversion", "Align rewards and recognition", "Share success stories"]
        }
    }
}

# Mock database of past change campaigns (for the archive feature)
PAST_CAMPAIGNS = [
    {
        "id": "campaign-001",
        "title": "Global ERP Implementation",
        "industry": "Manufacturing",
        "year": 2023,
        "approach": "Used ADKAR framework with heavy focus on awareness and desire phases",
        "success_factors": [
            "Executive sponsorship at every level",
            "Dedicated change network of 200 champions",
            "Comprehensive training program with role-specific modules"
        ],
        "challenges": [
            "Initial resistance from middle management",
            "Cultural differences across regions",
            "Technical complexity requiring extensive training"
        ],
        "outcomes": {
            "adoption_rate": "87%",
            "timeline_adherence": "On schedule",
            "budget_adherence": "5% over budget",
            "business_value_realized": "94% of projected benefits"
        },
        "lessons_learned": [
            "Earlier involvement of middle managers would have reduced resistance",
            "More localization of change materials for different regions",
            "Pre-implementation technical readiness assessment would have improved adoption"
        ]
    },
    {
        "id": "campaign-002",
        "title": "Digital Workplace Transformation",
        "industry": "Financial Services",
        "year": 2022,
        "approach": "Lewin's Unfreeze-Change-Refreeze with Agile implementation approach",
        "success_factors": [
            "Pilot program with influential early adopters",
            "Daily stand-ups for change team to address issues quickly",
            "Peer learning communities established"
        ],
        "challenges": [
            "Regulatory compliance concerns",
            "Legacy systems integration issues",
            "Reluctance to adopt collaborative work practices"
        ],
        "outcomes": {
            "adoption_rate": "79%",
            "timeline_adherence": "2 months delayed",
            "budget_adherence": "On budget",
            "business_value_realized": "81% of projected benefits"
        },
        "lessons_learned": [
            "Regulatory considerations should be addressed earlier",
            "More involvement from IT architecture team needed",
            "Greater emphasis on benefits to individual workflows would have improved adoption"
        ]
    },
    {
        "id": "campaign-003",
        "title": "Agile Methodology Adoption",
        "industry": "Healthcare",
        "year": 2023,
        "approach": "Kotter's 8-Step Process with heavy emphasis on building a guiding coalition",
        "success_factors": [
            "Cross-functional transformation team",
            "Incremental implementation by department",
            "Visible success metrics dashboards"
        ],
        "challenges": [
            "Hierarchical organization structure",
            "Compliance and documentation requirements",
            "Shift from long-term planning to iterative approach"
        ],
        "outcomes": {
            "adoption_rate": "92%",
            "timeline_adherence": "1 month ahead of schedule",
            "budget_adherence": "12% under budget",
            "business_value_realized": "108% of projected benefits"
        },
        "lessons_learned": [
            "Starting with small, high-visibility wins built momentum",
            "Adapting agile practices to healthcare context was crucial",
            "Regular celebration of milestones improved engagement"
        ]
    }
]

# Mock visualization data for interactive dashboards
MOCK_VISUALIZATION_DATA = {
    "resistance_factors": {
        "fear_of_job_loss": 68,
        "comfort_with_current_processes": 72,
        "lack_of_skills": 54,
        "poor_past_experiences": 61,
        "unclear_benefits": 78,
        "timeline_concerns": 45,
        "leadership_mistrust": 39
    },
    "adoption_curve": {
        "innovators": 2.5,
        "early_adopters": 13.5,
        "early_majority": 34,
        "late_majority": 34,
        "laggards": 16
    },
    "communication_effectiveness": {
        "email": 45,
        "team_meetings": 72,
        "town_halls": 68,
        "intranet": 38,
        "training_sessions": 81,
        "one_on_one": 89,
        "videos": 64
    },
    "stakeholder_support": {
        "executives": 82,
        "middle_management": 61,
        "supervisors": 74,
        "end_users": 58,
        "IT_department": 86,
        "HR_department": 77,
        "external_partners": 49
    }
}

# Pydantic models
class ScopeAnalysisStep(BaseModel):
    step: int
    input_data: Dict[str, Any] = {}

class ScopeAnalysisResponse(BaseModel):
    next_step: int
    prompt: str
    current_data: Dict[str, Any] = {}
    analysis: Optional[Dict[str, Any]] = None
    visualization_data: Optional[Dict[str, Any]] = None

class CommunicationReviewRequest(BaseModel):
    communication_draft: str
    audience: Optional[str] = None
    purpose: Optional[str] = None
    change_context: Optional[str] = None

class StakeholderRequest(BaseModel):
    step: int
    input_data: Dict[str, Any] = {}

class ResistanceRequest(BaseModel):
    step: int
    input_data: Dict[str, Any] = {}

class FAQRequest(BaseModel):
    change_name: str
    change_description: str
    target_audience: str
    key_concerns: Optional[List[str]] = None

class FeedbackRequest(BaseModel):
    tool_used: str
    rating: int
    feedback_text: Optional[str] = None
    improvement_suggestions: Optional[str] = None

class CampaignSearchRequest(BaseModel):
    keywords: Optional[str] = None
    industry: Optional[str] = None
    framework: Optional[str] = None
    year_from: Optional[int] = None
    year_to: Optional[int] = None
class EnhancedResistanceRequest(BaseModel):
    step: int
    input_data: Dict[str, Any] = {}
    behavioral_model: Optional[str] = None  # "kubler-ross" or "adkar"

class CoachingTipsRequest(BaseModel):
    resistance_type: str
    stakeholder_level: Optional[str] = None
    change_type: Optional[str] = None
    industry: Optional[str] = None

# ----------------------- SCOPE ANALYSIS ENDPOINTS -----------------------

@router.post("/scope-analysis", response_model=ScopeAnalysisResponse)
async def analyze_scope(request: ScopeAnalysisStep):
    """Interactive scope analysis with step-by-step approach"""
    try:
        step = request.step
        data = request.input_data
        logger.info(f"Scope analysis step {step}: {data}")
        
        # Initialize response with default values
        response = ScopeAnalysisResponse(
            next_step=step + 1,
            prompt="",
            current_data=data
        )
        
        # Handle different steps
        if step == 0:
            # Initial step
            response.prompt = "Let's analyze the scope of your change initiative. First, what's the name or title of the change initiative?"
            
        elif step == 1:
            # Collect initiative description
            data["initiative_name"] = data.get("user_input", "")
            response.current_data = data
            response.prompt = f"Great! Now, please provide a brief description of what {data['initiative_name']} involves."
            
        elif step == 2:
            # Collect organization type
            data["initiative_description"] = data.get("user_input", "")
            response.current_data = data
            response.prompt = "What type of organization is implementing this change? (e.g., healthcare, finance, technology, manufacturing, etc.)"
            
        elif step == 3:
            # Collect current state
            data["organization_type"] = data.get("user_input", "")
            response.current_data = data
            response.prompt = "Please describe the current state or situation that the change is addressing."
            
        elif step == 4:
            # Collect desired state
            data["current_state"] = data.get("user_input", "")
            response.current_data = data
            response.prompt = "What is the desired future state after the change is implemented?"
            
        elif step == 5:
            # Analyze the data and provide results
            data["desired_state"] = data.get("user_input", "")
            response.current_data = data
            
            # Generate analysis using LLM
            prompt = f"""
            You are a Change Management AI Assistant specializing in scope analysis.
            
            Analyze the following change initiative and provide a comprehensive scope analysis covering organizational, project, and people impacts.
            
            Change Name: {data.get('initiative_name', 'Unnamed Initiative')}
            Change Description: {data.get('initiative_description', 'No description provided')}
            Organization Type: {data.get('organization_type', 'Unknown')}
            Current State: {data.get('current_state', 'Not specified')}
            Desired State: {data.get('desired_state', 'Not specified')}
            
            Provide your analysis in these sections:
            
            1. EXECUTIVE SUMMARY: A brief 2-3 sentence overview of the change and its significance.
            
            2. ORGANIZATIONAL IMPACT:
               - Key departments affected
               - Structural changes needed
               - Policy/procedural implications
               - Cultural considerations
            
            3. PROJECT IMPACT:
               - Timeline considerations
               - Resource requirements
               - Critical milestones
               - Dependencies and constraints
            
            4. PEOPLE IMPACT:
               - Roles affected
               - Skill changes required
               - Behavioral changes needed
               - Potential resistance areas
            
            5. RECOMMENDATIONS:
               - Specific actions to effectively manage this scope
               - Change management approach recommendations
               - Critical success factors
               
            Make your response conversational, practical and actionable. Don't use JSON format - write as if you're a consultant presenting findings to a client.
            """
            
            analysis_text = await llm_service.generate_response(prompt, [], None)
            
            # Create structured analysis
            analysis = {
                "executive_summary": extract_section(analysis_text, "EXECUTIVE SUMMARY", "ORGANIZATIONAL IMPACT"),
                "organizational_impact": extract_section(analysis_text, "ORGANIZATIONAL IMPACT", "PROJECT IMPACT"),
                "project_impact": extract_section(analysis_text, "PROJECT IMPACT", "PEOPLE IMPACT"),
                "people_impact": extract_section(analysis_text, "PEOPLE IMPACT", "RECOMMENDATIONS"),
                "recommendations": extract_section(analysis_text, "RECOMMENDATIONS", None),
                "full_analysis": analysis_text
            }
            
            # Include visualization data
            visualization_data = {
                "impact_heatmap": {
                    "departments": generate_impact_heatmap(data),
                    "description": "This heatmap shows the relative impact on different departments."
                },
                "readiness_assessment": {
                    "categories": generate_readiness_data(data),
                    "description": "This chart displays organizational readiness across key dimensions."
                },
                "timeline_estimate": {
                    "phases": generate_timeline_data(data),
                    "description": "Estimated timeline for implementing the change initiative."
                }
            }
            
            response.analysis = analysis
            response.visualization_data = visualization_data
            response.prompt = "I've completed the scope analysis based on the information provided. Would you like me to focus on any particular aspect in more detail?"
            response.next_step = 6  # Move to optional follow-up
            
        elif step == 6:
            # Handle follow-up questions
            user_input = data.get("user_input", "")
            prev_analysis = data.get("analysis", {})
            
            prompt = f"""
            Based on the previous scope analysis:
            {json.dumps(prev_analysis)}
            
            The user has asked for more information about: "{user_input}"
            
            Provide a detailed response to their specific question, focusing on practical advice and actionable recommendations.
            Keep your response conversational and helpful.
            """
            
            follow_up_response = await llm_service.generate_response(prompt, [], None)
            
            response.analysis = {
                "follow_up_question": user_input,
                "detailed_response": follow_up_response
            }
            response.next_step = 6  # Stay in follow-up mode
            response.prompt = "Is there anything else you'd like to know about the scope of this change initiative?"
        
        return response
            
    except Exception as e:
        logger.error(f"Error in scope analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing scope: {str(e)}")


# ----------------------- COMMUNICATION REVIEW ENDPOINTS -----------------------

@router.post("/communication-review")
async def review_communication(request: CommunicationReviewRequest):
    """Review a communication draft for a change initiative"""
    try:
        logger.info(f"Communication review request for audience: {request.audience}")
        
        # Prepare prompt for communication review
        prompt = f"""
        You are a Change Management AI Assistant specializing in communication review.
        
        Review the following communication draft for a change initiative:
        
        Communication Draft:
        {request.communication_draft}
        
        Target Audience: {request.audience or "General stakeholders"}
        Purpose: {request.purpose or "Informing about change"}
        Change Context: {request.change_context or "Organizational change initiative"}
        
        Evaluate this communication on:
        1. Clarity - Is the message clear and easy to understand?
        2. Impact - Does it effectively communicate the impact of the change?
        3. Completeness - Does it cover the why, what, when, and how of the change?
        4. Emotional tone - Is the tone appropriate for the audience and situation?
        5. Call to action - Does it clearly state what the audience should do next?
        
        Provide your analysis in these sections:
        
        QUICK ASSESSMENT:
        Give a brief 2-3 sentence overall assessment of the communication.
        
        STRENGTHS:
        Identify 3-5 specific strengths of the communication.
        
        IMPROVEMENT AREAS:
        Identify 3-5 specific areas that could be improved.
        
        CLARITY SCORE (1-100):
        
        IMPACT SCORE (1-100):
        
        COMPLETENESS SCORE (1-100):
        
        EMOTIONAL TONE SCORE (1-100):
        
        CALL TO ACTION SCORE (1-100):
        
        OVERALL SCORE (1-100):
        
        REVISED DRAFT:
        Provide an improved version of the communication that addresses the issues you've identified.
        
        Write in a helpful, constructive tone - like a skilled communications advisor providing feedback.
        """
        
        # Get response from LLM service
        response_text = await llm_service.generate_response(prompt, [], None)
        
        # Parse the response into structured format
        review_results = {
            "quick_assessment": extract_section(response_text, "QUICK ASSESSMENT", "STRENGTHS"),
            "strengths": extract_list(extract_section(response_text, "STRENGTHS", "IMPROVEMENT AREAS")),
            "improvement_areas": extract_list(extract_section(response_text, "IMPROVEMENT AREAS", "CLARITY SCORE")),
            "scores": {
                "clarity": extract_score(response_text, "CLARITY SCORE"),
                "impact": extract_score(response_text, "IMPACT SCORE"),
                "completeness": extract_score(response_text, "COMPLETENESS SCORE"),
                "emotional_tone": extract_score(response_text, "EMOTIONAL TONE SCORE"),
                "call_to_action": extract_score(response_text, "CALL TO ACTION SCORE"),
                "overall": extract_score(response_text, "OVERALL SCORE")
            },
            "revised_draft": extract_section(response_text, "REVISED DRAFT", None),
        }
        
        # Generate visual representation of the scores for the frontend
        review_results["visualization"] = {
            "radar_chart_data": {
                "labels": ["Clarity", "Impact", "Completeness", "Emotional Tone", "Call to Action"],
                "datasets": [{
                    "label": "Communication Effectiveness",
                    "data": [
                        review_results["scores"]["clarity"],
                        review_results["scores"]["impact"],
                        review_results["scores"]["completeness"],
                        review_results["scores"]["emotional_tone"],
                        review_results["scores"]["call_to_action"]
                    ]
                }]
            },
            "sentiment_analysis": analyze_sentiment(request.communication_draft),
            "key_message_check": check_key_messages(request.communication_draft, request.purpose)
        }
        
        # Add reading metrics
        review_results["readability"] = {
            "flesch_reading_ease": calculate_flesch_reading_ease(request.communication_draft),
            "average_sentence_length": calculate_avg_sentence_length(request.communication_draft),
            "complex_word_percentage": calculate_complex_word_percentage(request.communication_draft),
            "passive_voice_instances": find_passive_voice(request.communication_draft)
        }
        
        return review_results
            
    except Exception as e:
        logger.error(f"Error in communication review: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error reviewing communication: {str(e)}")


# ----------------------- STAKEHOLDER MAPPING ENDPOINTS -----------------------

@router.post("/stakeholder-mapping")
async def map_stakeholders(request: StakeholderRequest):
    """Interactive stakeholder mapping with step-by-step approach"""
    try:
        step = request.step
        data = request.input_data
        logger.info(f"Stakeholder mapping step {step}: {data}")
        
        # Initialize response
        response = {
            "next_step": step + 1,
            "prompt": "",
            "current_data": data
        }
        
        # Handle different steps
        if step == 0:
            # Initial step
            response["prompt"] = "Let's identify and map the stakeholders for your change initiative. What's the name of the change initiative?"
            
        elif step == 1:
            # Collect initiative description
            data["initiative_name"] = data.get("user_input", "")
            response["current_data"] = data
            response["prompt"] = f"Great! Now, please provide a brief description of what {data['initiative_name']} involves."
            
        elif step == 2:
            # Collect key departments
            data["initiative_description"] = data.get("user_input", "")
            response["current_data"] = data
            response["prompt"] = "Which departments or teams will be most affected by this change? Please list them separated by commas."
            
        elif step == 3:
            # Collect organizational structure info
            data["key_departments"] = [dept.strip() for dept in data.get("user_input", "").split(",")]
            response["current_data"] = data
            response["prompt"] = "Please describe your organization's structure briefly (hierarchical, matrix, flat, etc.)."
            
        elif step == 4:
            # Generate stakeholder map
            data["org_structure"] = data.get("user_input", "")
            response["current_data"] = data
            
            # Generate analysis using LLM
            prompt = f"""
            You are a Change Management AI Assistant specializing in stakeholder analysis.
            
            Map the stakeholders for the following change initiative:
            
            Change Name: {data.get('initiative_name', 'Unnamed Initiative')}
            Change Description: {data.get('initiative_description', 'No description provided')}
            Key Departments: {', '.join(data.get('key_departments', ['Not specified']))}
            Organization Structure: {data.get('org_structure', 'Not specified')}
            
            Provide your analysis in these sections:
            
            EXECUTIVE SUMMARY:
            A brief 2-3 sentence overview of the key stakeholder groups and their importance.
            
            STAKEHOLDER MAP:
            Identify at least 10 specific stakeholder roles or groups, including details about their:
            - Role/Title
            - Department
            - Influence Level (High, Medium, Low)
            - Interest Level (High, Medium, Low)
            - Current Support Level (Champion, Supporter, Neutral, Resistant, Opponent)
            - Key Concerns or Interests
            
            ENGAGEMENT STRATEGY:
            For each influence/interest combination (High/High, High/Low, etc.), provide specific engagement approaches.
            
            COMMUNICATION RECOMMENDATIONS:
            Provide tailored communication approaches for different stakeholder groups, including:
            - Key messages
            - Communication channels
            - Frequency
            - Who should deliver the message
            
            INFLUENCE NETWORK:
            Identify key influencers and relationships between stakeholder groups.
            
            Write in a practical, actionable style focused on helping the change manager understand and engage stakeholders effectively.
            """
            
            analysis_text = await llm_service.generate_response(prompt, [], None)
            
            # Parse the analysis into structured format
            stakeholder_analysis = {
                "executive_summary": extract_section(analysis_text, "EXECUTIVE SUMMARY", "STAKEHOLDER MAP"),
                "stakeholder_map": parse_stakeholder_map(extract_section(analysis_text, "STAKEHOLDER MAP", "ENGAGEMENT STRATEGY")),
                "engagement_strategy": extract_section(analysis_text, "ENGAGEMENT STRATEGY", "COMMUNICATION RECOMMENDATIONS"),
                "communication_recommendations": extract_section(analysis_text, "COMMUNICATION RECOMMENDATIONS", "INFLUENCE NETWORK"),
                "influence_network": extract_section(analysis_text, "INFLUENCE NETWORK", None),
                "full_analysis": analysis_text
            }
            
            # Create visualization data
            visualization_data = {
                "influence_interest_matrix": create_influence_interest_matrix(stakeholder_analysis["stakeholder_map"]),
                "support_level_distribution": create_support_distribution(stakeholder_analysis["stakeholder_map"]),
                "department_impact_heatmap": create_department_heatmap(stakeholder_analysis["stakeholder_map"]),
                "network_graph": create_network_graph(stakeholder_analysis["influence_network"])
            }
            
            response["analysis"] = stakeholder_analysis
            response["visualization_data"] = visualization_data
            response["prompt"] = "I've completed the stakeholder analysis. Would you like me to focus on any particular aspect in more detail?"
            response["next_step"] = 5  # Move to follow-up questions
            
        elif step == 5:
            # Handle follow-up questions
            user_input = data.get("user_input", "")
            prev_analysis = data.get("analysis", {})
            
            prompt = f"""
            Based on the previous stakeholder analysis:
            {json.dumps(prev_analysis)[:1000]}... (truncated)
            
            The user has asked for more information about: "{user_input}"
            
            Provide a detailed response to their specific question, focusing on practical advice for stakeholder engagement.
            """
            
            follow_up_response = await llm_service.generate_response(prompt, [], None)
            
            response["analysis"] = {
                "follow_up_question": user_input,
                "detailed_response": follow_up_response
            }
            response["next_step"] = 5  # Stay in follow-up mode
            response["prompt"] = "Is there anything else you'd like to know about these stakeholders?"
        
        return response
            
    except Exception as e:
        logger.error(f"Error in stakeholder mapping: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error mapping stakeholders: {str(e)}")


# ----------------------- RESISTANCE MANAGEMENT ENDPOINTS -----------------------

@router.post("/resistance-management")
async def enhanced_resistance_management(request: EnhancedResistanceRequest):
    """Interactive resistance management with behavioral psychology models"""
    try:
        step = request.step
        data = request.input_data
        logger.info(f"Enhanced resistance management step {step}: {data}")
        
        # Initialize response
        response = {
            "next_step": step + 1,
            "prompt": "",
            "current_data": data
        }
        
        # Handle different steps
        if step == 0:
            # Initial step - choose behavioral model
            response["prompt"] = "Let's develop strategies to manage resistance to change. First, would you like to use a specific behavioral model? Type 'kubler-ross' for the Kübler-Ross Change Curve, 'adkar' for the ADKAR model, or 'general' for a general approach."
            
        elif step == 1:
            # Set behavioral model or use general approach
            model_choice = data.get("user_input", "").lower()
            
            if "kubler" in model_choice or "ross" in model_choice:
                data["behavioral_model"] = "kubler-ross"
            elif "adkar" in model_choice:
                data["behavioral_model"] = "adkar"
            else:
                data["behavioral_model"] = "general"
                
            response["current_data"] = data
            response["prompt"] = "What's the name of the change initiative you're implementing?"
            
        elif step == 2:
            # Collect initiative description
            data["initiative_name"] = data.get("user_input", "")
            response["current_data"] = data
            response["prompt"] = f"What does the {data['initiative_name']} initiative involve? Please provide a brief description."
            
        elif step == 3:
            # Collect resistance concerns
            data["initiative_description"] = data.get("user_input", "")
            response["current_data"] = data
            
            # Tailor the question based on the behavioral model
            if data.get("behavioral_model") == "kubler-ross":
                response["prompt"] = "Based on the Kübler-Ross model, where do you think most stakeholders are on the change curve? (Shock/Denial, Anger/Fear, Bargaining, Depression, Acceptance, Integration)"
            elif data.get("behavioral_model") == "adkar":
                response["prompt"] = "Based on the ADKAR model, which element do you think is most challenging right now? (Awareness, Desire, Knowledge, Ability, Reinforcement)"
            else:
                response["prompt"] = "What specific forms of resistance are you experiencing or anticipating? Please list the main concerns or behaviors."
            
        elif step == 4:
            # Collect stage or resistance information based on model
            if data.get("behavioral_model") == "kubler-ross" or data.get("behavioral_model") == "adkar":
                data["current_stage"] = data.get("user_input", "")
            else:
                data["resistance_concerns"] = [concern.strip() for concern in data.get("user_input", "").split(",")]
                
            response["current_data"] = data
            response["prompt"] = "How would you describe your organization's culture and previous experiences with change? This helps tailor the strategies to your context."
            
        elif step == 5:
            # Generate resistance management strategies with behavioral model insights
            data["org_culture"] = data.get("user_input", "")
            response["current_data"] = data
            
            # Prepare the prompt based on the selected behavioral model
            model_name = data.get("behavioral_model", "general")
            
            if model_name == "kubler-ross":
                current_stage = data.get("current_stage", "")
                stage_info = ""
                
                # Find the closest stage in our model
                for stage in BEHAVIORAL_MODELS["kubler-ross"]["stages"]:
                    if any(s.lower() in current_stage.lower() for s in stage.split("/")):
                        stage_info = f"""
                        Current Kübler-Ross Stage: {stage}
                        Description: {BEHAVIORAL_MODELS["kubler-ross"]["descriptions"].get(stage, "")}
                        Recommended Intervention Strategies:
                        - {(chr(10) + "- ").join(BEHAVIORAL_MODELS["kubler-ross"]["intervention_strategies"].get(stage, []))}
                        """
                        break
                
                # Generate analysis using LLM with Kübler-Ross model
                prompt = f"""
                You are a Change Management AI Assistant specializing in resistance management using the Kübler-Ross Change Curve.
                
                Analyze potential resistance and provide management strategies for the following change initiative:
                
                Change Name: {data.get('initiative_name', 'Unnamed Initiative')}
                Change Description: {data.get('initiative_description', 'No description provided')}
                Current Stage on the Kübler-Ross Change Curve: {data.get('current_stage', 'Not specified')}
                Organization Culture: {data.get('org_culture', 'Not specified')}
                
                {stage_info}
                
                Provide your analysis in these sections:
                
                EXECUTIVE SUMMARY:
                A brief 2-3 sentence overview of where stakeholders are on the change curve and what this means for your approach.
                
                EMOTIONAL JOURNEY ANALYSIS:
                Analyze the current emotional state based on the Kübler-Ross model:
                - Indicators that confirm the current stage
                - Potential variation across different stakeholder groups
                - Likely progression to next stages
                - Warning signs of regression
                
                TAILORED INTERVENTION STRATEGIES:
                For the current stage, provide specific strategies to:
                - Support emotional needs
                - Move stakeholders to the next stage
                - Prevent regression to earlier stages
                
                COMMUNICATION RECOMMENDATIONS:
                Based on the Kübler-Ross model, recommend:
                - Key messages appropriate for this stage
                - Communication approaches that address emotional needs
                - What to say and what to avoid
                - Frequency and format considerations
                
                LEADERSHIP COACHING TIPS:
                Advice for leaders on:
                - How to recognize and respond to emotions at this stage
                - Self-management techniques when facing resistance
                - How to role model appropriate behaviors
                
                MEASURING PROGRESS:
                How to track movement along the change curve:
                - Observable behavioral indicators
                - Feedback mechanisms
                - Signs of progress
                
                Write in a practical, actionable style that a change manager can immediately apply to their situation.
                """
            
            elif model_name == "adkar":
                current_element = data.get("current_stage", "")
                element_info = ""
                
                # Find the matching element in our model
                for element in BEHAVIORAL_MODELS["adkar"]["stages"]:
                    if element.lower() in current_element.lower():
                        element_info = f"""
                        Current ADKAR Element Needing Focus: {element}
                        Description: {BEHAVIORAL_MODELS["adkar"]["descriptions"].get(element, "")}
                        Recommended Intervention Strategies:
                        - {(chr(10) + "- ").join(BEHAVIORAL_MODELS["adkar"]["intervention_strategies"].get(element, []))}
                        """
                        break
                
                # Generate analysis using LLM with ADKAR model
                prompt = f"""
                You are a Change Management AI Assistant specializing in resistance management using the ADKAR model.
                
                Analyze potential resistance and provide management strategies for the following change initiative:
                
                Change Name: {data.get('initiative_name', 'Unnamed Initiative')}
                Change Description: {data.get('initiative_description', 'No description provided')}
                Current ADKAR Focus Element: {data.get('current_stage', 'Not specified')}
                Organization Culture: {data.get('org_culture', 'Not specified')}
                
                {element_info}
                
                Provide your analysis in these sections:
                
                EXECUTIVE SUMMARY:
                A brief 2-3 sentence overview of the current ADKAR barrier and its impact on change progress.
                
                ADKAR ASSESSMENT:
                Analyze the current ADKAR status:
                - Root causes of barriers in the current element
                - Impact on overall change adoption
                - Interconnection with other ADKAR elements
                - Variations across stakeholder groups
                
                TARGETED INTERVENTION STRATEGIES:
                For the current ADKAR element, provide specific strategies to:
                - Remove barriers
                - Strengthen this element
                - Support progression to the next element
                
                COMMUNICATION RECOMMENDATIONS:
                Based on the ADKAR model, recommend:
                - Key messages that address this specific element
                - Communication approaches most effective for this element
                - How to target different stakeholder segments
                
                LEADERSHIP COACHING TIPS:
                Advice for leaders on:
                - How to model behaviors that reinforce this ADKAR element
                - Coaching approaches for team members struggling with this element
                - Strategies for building organizational capability in this area
                
                MEASURING PROGRESS:
                How to assess improvement in this ADKAR element:
                - Observable indicators of progress
                - Assessment mechanisms
                - Readiness to move to the next element
                
                Write in a practical, actionable style that a change manager can immediately apply to their situation.
                """
            
            else:
                # Generate analysis using LLM with general approach (existing functionality)
                prompt = f"""
                You are a Change Management AI Assistant specializing in resistance management.
                
                Analyze potential resistance and provide management strategies for the following change initiative:
                
                Change Name: {data.get('initiative_name', 'Unnamed Initiative')}
                Change Description: {data.get('initiative_description', 'No description provided')}
                Anticipated Resistance: {', '.join(data.get('resistance_concerns', ['Not specified']))}
                Organization Culture: {data.get('org_culture', 'Not specified')}
                
                Provide your analysis in these sections:
                
                EXECUTIVE SUMMARY:
                A brief 2-3 sentence overview of the key resistance factors and general approach.
                
                RESISTANCE ASSESSMENT:
                For each resistance factor identified or implied, analyze:
                - Root causes
                - Affected groups
                - Intensity level
                - Potential impact if not addressed
                
                MITIGATION STRATEGIES:
                For each resistance factor, provide specific strategies to address it, including:
                - Proactive measures
                - Responsive tactics
                - Who should lead these efforts
                - Timing considerations
                
                EMOTIONAL SUPPORT APPROACHES:
                Specific techniques to provide emotional support during change, including:
                - Creating psychological safety
                - Building resilience
                - Managing anxiety and uncertainty
                - Fostering positive emotions
                
                COMMUNICATION RECOMMENDATIONS:
                Targeted communication approaches to address resistance, including:
                - Key messages for different resistance types
                - Channels and formats
                - Frequency
                - What to emphasize and what to avoid
                
                MEASURING PROGRESS:
                How to track whether resistance is being effectively managed.
                
                COACHING TIPS FOR CHANGE MANAGERS:
                Specific advice for change management professionals handling this type of resistance:
                - How to prepare personally for difficult conversations
                - Techniques for maintaining objectivity
                - Self-care strategies during high-stress change periods
                - How to coach leaders through their own resistance
                
                Write in a practical, actionable style that a change manager can immediately apply to their situation.
                """
            
            analysis_text = await llm_service.generate_response(prompt, [], None)
            
            # Parse the analysis into structured format
            resistance_analysis = {
                "executive_summary": extract_section(analysis_text, "EXECUTIVE SUMMARY", "RESISTANCE ASSESSMENT" if model_name == "general" else "EMOTIONAL JOURNEY ANALYSIS" if model_name == "kubler-ross" else "ADKAR ASSESSMENT"),
                "model_specific_analysis": extract_section(analysis_text, "EMOTIONAL JOURNEY ANALYSIS" if model_name == "kubler-ross" else "ADKAR ASSESSMENT" if model_name == "adkar" else "RESISTANCE ASSESSMENT", "TAILORED INTERVENTION STRATEGIES" if model_name != "general" else "MITIGATION STRATEGIES"),
                "intervention_strategies": extract_section(analysis_text, "TAILORED INTERVENTION STRATEGIES" if model_name != "general" else "MITIGATION STRATEGIES", "COMMUNICATION RECOMMENDATIONS"),
                "communication_recommendations": extract_section(analysis_text, "COMMUNICATION RECOMMENDATIONS", "LEADERSHIP COACHING TIPS" if model_name != "general" else "MEASURING PROGRESS"),
                "coaching_tips": extract_section(analysis_text, "LEADERSHIP COACHING TIPS" if model_name != "general" else "COACHING TIPS FOR CHANGE MANAGERS", "MEASURING PROGRESS"),
                "measuring_progress": extract_section(analysis_text, "MEASURING PROGRESS", None),
                "full_analysis": analysis_text,
                "model_used": model_name
            }
            
            # Include visualization data for frontend
            visualization_data = {
                "resistance_factors": MOCK_VISUALIZATION_DATA["resistance_factors"],
                "adoption_curve": MOCK_VISUALIZATION_DATA["adoption_curve"],
                "emotional_journey": create_emotional_journey_with_prediction(model_name, data),
                "resistance_mitigation_matrix": create_resistance_mitigation_matrix(data),
                "communication_effectiveness": MOCK_VISUALIZATION_DATA["communication_effectiveness"]
            }
            
            response["analysis"] = resistance_analysis
            response["visualization_data"] = visualization_data
            response["prompt"] = f"I've analyzed the resistance factors using the {BEHAVIORAL_MODELS.get(model_name, {}).get('name', 'general approach')}. Would you like personalized coaching tips for change management professionals?"
            response["next_step"] = 6  # Move to coaching tips or follow-up questions
            
        elif step == 6:
            # Handle request for coaching tips or follow-up questions
            user_input = data.get("user_input", "").lower()
            
            if "yes" in user_input or "coaching" in user_input or "tips" in user_input:
                # Generate personalized coaching tips for change management professionals
                model_name = data.get("behavioral_model", "general")
                
                prompt = f"""
                You are a Change Management AI Assistant specializing in professional development for change managers.
                
                Based on the resistance analysis for this change initiative:
                
                Change Name: {data.get('initiative_name', 'Unnamed Initiative')}
                Change Description: {data.get('initiative_description', 'No description provided')}
                Using Model: {BEHAVIORAL_MODELS.get(model_name, {}).get('name', 'General resistance management approach')}
                
                Provide personalized professional coaching tips for change management professionals handling this initiative.
                
                Focus on:
                
                PERSONAL PREPARATION:
                How the change manager should prepare themselves mentally and emotionally for this work.
                
                CRITICAL SKILLS TO DEVELOP:
                The most important skills to strengthen for this specific change situation.
                
                CHALLENGING SITUATIONS:
                How to handle the most difficult scenarios they're likely to encounter.
                
                STAKEHOLDER MANAGEMENT:
                Techniques for managing complex stakeholder dynamics.
                
                SELF-CARE STRATEGIES:
                How to maintain resilience and effectiveness throughout a challenging change.
                
                MEASURING SUCCESS:
                How they should evaluate their own effectiveness as a change manager.
                
                PROFESSIONAL DEVELOPMENT:
                Resources, readings, or training that would be particularly valuable.
                
                Write as an experienced change management mentor providing actionable, practical advice to a fellow professional.
                """
                
                coaching_tips = await llm_service.generate_response(prompt, [], None)
                
                response["analysis"] = {
                    "type": "coaching_tips",
                    "coaching_tips": coaching_tips,
                    "model_used": model_name
                }
                response["next_step"] = 7  # Move to final follow-up
                response["prompt"] = "I've provided personalized coaching tips for change management professionals. Is there anything specific about managing this resistance that you'd like me to elaborate on?"
                
            else:
                # Handle as a follow-up question about the analysis
                prev_analysis = data.get("analysis", {})
                model_name = data.get("behavioral_model", "general")
                
                prompt = f"""
                Based on the previous resistance management analysis using the {BEHAVIORAL_MODELS.get(model_name, {}).get('name', 'general approach')}:
                {json.dumps(prev_analysis)[:1000]}... (truncated)
                
                The user has asked for more information about: "{user_input}"
                
                Provide a detailed response to their specific question, focusing on practical advice for managing resistance to change using the appropriate behavioral model.
                """
                
                follow_up_response = await llm_service.generate_response(prompt, [], None)
                
                response["analysis"] = {
                    "follow_up_question": user_input,
                    "detailed_response": follow_up_response,
                    "model_used": model_name
                }
                response["next_step"] = 6  # Stay in follow-up mode
                response["prompt"] = "Is there anything else you'd like to know about managing resistance to this change?"
                
        elif step == 7:
            # Final follow-up for coaching tips
            user_input = data.get("user_input", "").lower()
            model_name = data.get("behavioral_model", "general")
            
            prompt = f"""
            Based on the previous coaching tips for change management professionals dealing with resistance in the {data.get('initiative_name', 'Unnamed Initiative')} initiative:
            
            The user has asked for more information about: "{user_input}"
            
            Provide specific, practical advice for change management professionals on this topic, drawing on best practices and the {BEHAVIORAL_MODELS.get(model_name, {}).get('name', 'general approach')} where appropriate.
            """
            
            follow_up_response = await llm_service.generate_response(prompt, [], None)
            
            response["analysis"] = {
                "follow_up_question": user_input,
                "detailed_response": follow_up_response
            }
            response["next_step"] = 7  # Stay in final follow-up mode
            response["prompt"] = "Is there anything else you'd like to know about professional approaches to change management?"
        
        return response
            
    except Exception as e:
        logger.error(f"Error in enhanced resistance management: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error managing resistance: {str(e)}")

# New helper function for emotional journey with predictions
def create_emotional_journey_with_prediction(model_name, data):
    """Create emotional journey visualization data with predictions based on behavioral model"""
    
    if model_name == "kubler-ross":
        stages = BEHAVIORAL_MODELS["kubler-ross"]["stages"]
        current_stage = data.get("current_stage", "")
        
        # Find current stage index
        current_index = 0
        for i, stage in enumerate(stages):
            if any(s.lower() in current_stage.lower() for s in stage.split("/")):
                current_index = i
                break
        
        # Create emotional journey with prediction
        emotions = {
            "anxiety": [20, 50, 70, 60, 40, 20, 10],
            "uncertainty": [30, 70, 80, 65, 45, 25, 15],
            "motivation": [60, 40, 30, 35, 50, 70, 85],
            "optimism": [55, 30, 20, 25, 45, 65, 80],
            "competence": [70, 40, 30, 35, 50, 65, 75]
        }
        
        # Mark current position and future prediction
        journey_markers = {
            "current_stage": current_index,
            "stages": stages,
            "predicted_timeline": {
                stage: (i - current_index) * 4 + "weeks" if i > current_index else "current" if i == current_index else "past" 
                for i, stage in enumerate(stages)
            }
        }
        
        return {
            "stages": stages,
            "emotions": emotions,
            "journey_markers": journey_markers,
            "model": "kubler-ross"
        }
    
    elif model_name == "adkar":
        elements = BEHAVIORAL_MODELS["adkar"]["stages"]
        current_element = data.get("current_stage", "")
        
        # Find current element
        current_index = 0
        for i, element in enumerate(elements):
            if element.lower() in current_element.lower():
                current_index = i
                break
        
        # Create ADKAR progress visualization
        progress_levels = []
        for i in range(len(elements)):
            if i < current_index:
                # Past elements - relatively high scores
                progress_levels.append(random.randint(70, 95))
            elif i == current_index:
                # Current focus element - lower score
                progress_levels.append(random.randint(30, 50))
            else:
                # Future elements - even lower or not started
                progress_levels.append(random.randint(10, 25) if i == current_index + 1 else random.randint(0, 10))
        
        # Mark current position and recommended focus
        adkar_assessment = {
            "current_focus": current_index,
            "elements": elements,
            "progress_levels": progress_levels,
            "recommendations": {
                element: BEHAVIORAL_MODELS["adkar"]["intervention_strategies"].get(element, [])[0]
                for i, element in enumerate(elements)
            }
        }
        
        return {
            "elements": elements,
            "progress_levels": progress_levels,
            "adkar_assessment": adkar_assessment,
            "model": "adkar"
        }
    
    else:
        # Return the standard emotional journey for general approach
        return create_emotional_journey()

# New endpoint for personalized coaching tips
@router.post("/coaching-tips")
async def get_coaching_tips(request: CoachingTipsRequest):
    """Get personalized coaching tips for change management professionals"""
    try:
        logger.info(f"Coaching tips request for resistance type: {request.resistance_type}")
        
        # Prepare prompt for generating coaching tips
        prompt = f"""
        You are a Change Management AI Assistant specializing in professional development for change managers.
        
        Provide personalized coaching tips for a change management professional dealing with the following:
        
        Resistance Type: {request.resistance_type}
        Stakeholder Level: {request.stakeholder_level or "Various levels"}
        Change Type: {request.change_type or "Organizational change"}
        Industry: {request.industry or "General business"}
        
        Structure your response with these sections:
        
        SITUATIONAL ASSESSMENT:
        A brief assessment of the specific challenges in this situation.
        
        PROFESSIONAL APPROACH:
        The most effective stance and mindset for the change manager to adopt.
        
        KEY TECHNIQUES:
        3-5 specific techniques or approaches that would be most effective.
        
        COMMUNICATION STRATEGIES:
        Effective ways to frame messages and conduct conversations.
        
        PERSONAL RESILIENCE:
        How to maintain effectiveness and wellbeing when facing this type of resistance.
        
        MEASURING SUCCESS:
        How to know if the approach is working.
        
        Write as an experienced change management mentor providing actionable, practical advice to a fellow professional.
        """
        
        # Get response from LLM service
        coaching_tips = await llm_service.generate_response(prompt, [], None)
        
        # Parse the coaching tips into structured format
        tips_structure = {
            "situational_assessment": extract_section(coaching_tips, "SITUATIONAL ASSESSMENT", "PROFESSIONAL APPROACH"),
            "professional_approach": extract_section(coaching_tips, "PROFESSIONAL APPROACH", "KEY TECHNIQUES"),
            "key_techniques": extract_section(coaching_tips, "KEY TECHNIQUES", "COMMUNICATION STRATEGIES"),
            "communication_strategies": extract_section(coaching_tips, "COMMUNICATION STRATEGIES", "PERSONAL RESILIENCE"),
            "personal_resilience": extract_section(coaching_tips, "PERSONAL RESILIENCE", "MEASURING SUCCESS"),
            "measuring_success": extract_section(coaching_tips, "MEASURING SUCCESS", None),
            "full_response": coaching_tips
        }
        
        # Generate recommendations for further development
        development_resources = generate_development_resources(request.resistance_type, request.change_type)
        
        return {
            "coaching_tips": tips_structure,
            "development_resources": development_resources
        }
            
    except Exception as e:
        logger.error(f"Error generating coaching tips: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating coaching tips: {str(e)}")

# Helper function for development resources
def generate_development_resources(resistance_type, change_type):
    """Generate relevant development resources for change management professionals"""
    
    # Mock development resources based on resistance and change types
    resources = {
        "books": [
            {
                "title": "Leading Change",
                "author": "John P. Kotter",
                "relevance": "Classic framework for managing organizational change"
            },
            {
                "title": "Switch: How to Change Things When Change Is Hard",
                "author": "Chip Heath & Dan Heath",
                "relevance": "Practical approaches to overcoming resistance"
            },
            {
                "title": "Emotional Intelligence for Change Management",
                "author": "Anna Hughes",
                "relevance": "Managing emotions during change initiatives"
            }
        ],
        "courses": [
            {
                "title": "Prosci Change Management Certification",
                "provider": "Prosci",
                "relevance": "Industry-standard change management methodology"
            },
            {
                "title": "Dealing with Resistance to Change",
                "provider": "LinkedIn Learning",
                "relevance": "Specific techniques for resistance management"
            }
        ],
        "techniques": [
            "Stakeholder mapping and influence planning",
            "Resistance assessment frameworks",
            "Active listening techniques for resistance conversations",
            "Change impact assessment methodologies",
            "Communication planning for different resistance types"
        ]
    }
    
    # Customize based on resistance type
    resistance_lower = resistance_type.lower()
    if "fear" in resistance_lower or "anxiety" in resistance_lower:
        resources["techniques"].append("Psychological safety building exercises")
        resources["techniques"].append("Fear-to-hope conversion frameworks")
    elif "confusion" in resistance_lower or "knowledge" in resistance_lower:
        resources["techniques"].append("Knowledge gap assessment tools")
        resources["techniques"].append("Learning acceleration techniques")
    elif "culture" in resistance_lower or "identity" in resistance_lower:
        resources["techniques"].append("Cultural assessment methodologies")
        resources["techniques"].append("Identity transition frameworks")
    
    return resources


# ----------------------- FAQ GENERATION ENDPOINTS -----------------------

@router.post("/generate-faqs")
async def generate_faqs(request: FAQRequest):
    """Generate FAQs for a change initiative"""
    try:
        logger.info(f"FAQ generation request: {request.change_name}")
        
        # Prepare prompt for FAQ generation
        key_concerns = ', '.join(request.key_concerns) if request.key_concerns else "Not specified"
        
        prompt = f"""
        You are a Change Management AI Assistant specializing in creating helpful FAQs.
        
        Generate a comprehensive list of Frequently Asked Questions (FAQs) for the following change initiative:
        
        Change Name: {request.change_name}
        Change Description: {request.change_description}
        Target Audience: {request.target_audience}
        Key Concerns: {key_concerns}
        
        Create 10-15 FAQs that would be most helpful for the target audience. Include questions about:
        - The purpose and benefits of the change
        - Timeline and implementation details
        - How the change will affect day-to-day work
        - Training and support available
        - How success will be measured
        
        For each FAQ, provide:
        1. A clear, concise question from the perspective of the target audience
        2. A thorough but accessible answer that addresses concerns and provides necessary information
        3. A category tag (Purpose, Timeline, Impact, Training, Support, Success Metrics, Other)
        
        Format your response as a list of FAQs with clear headings and structured answers.
        """
        
        # Get response from LLM service
        response_text = await llm_service.generate_response(prompt, [], None)
        
        # Parse FAQs from text
        faqs = parse_faqs(response_text)
        
        # Group FAQs by category
        categorized_faqs = {}
        for faq in faqs:
            category = faq.get("category", "Other")
            if category not in categorized_faqs:
                categorized_faqs[category] = []
            categorized_faqs[category].append(faq)
        
        # Add recommended formats for different channels
        formats = generate_faq_formats(request.change_name, faqs)
        
        return {
            "faqs": faqs,
            "categorized_faqs": categorized_faqs,
            "recommended_formats": formats,
            "metadata": {
                "total_faqs": len(faqs),
                "categories": list(categorized_faqs.keys()),
                "generated_timestamp": datetime.datetime.now().isoformat()
            }
        }
            
    except Exception as e:
        logger.error(f"Error generating FAQs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating FAQs: {str(e)}")


# ----------------------- PAST CAMPAIGNS ENDPOINTS -----------------------

@router.get("/past-campaigns")
async def get_past_campaigns():
    """Get list of past change management campaigns"""
    try:
        return {"campaigns": PAST_CAMPAIGNS}
    except Exception as e:
        logger.error(f"Error retrieving past campaigns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving past campaigns: {str(e)}")

@router.post("/search-campaigns")
async def search_campaigns(request: CampaignSearchRequest):
    """Search past change management campaigns"""
    try:
        filtered_campaigns = PAST_CAMPAIGNS
        
        # Apply filters
        if request.keywords:
            keywords = request.keywords.lower().split()
            filtered_campaigns = [
                campaign for campaign in filtered_campaigns
                if any(keyword in json.dumps(campaign).lower() for keyword in keywords)
            ]
            
        if request.industry:
            filtered_campaigns = [
                campaign for campaign in filtered_campaigns
                if campaign.get("industry", "").lower() == request.industry.lower()
            ]
            
        if request.framework:
            filtered_campaigns = [
                campaign for campaign in filtered_campaigns
                if request.framework.lower() in campaign.get("approach", "").lower()
            ]
            
        if request.year_from:
            filtered_campaigns = [
                campaign for campaign in filtered_campaigns
                if campaign.get("year", 0) >= request.year_from
            ]
            
        if request.year_to:
            filtered_campaigns = [
                campaign for campaign in filtered_campaigns
                if campaign.get("year", 0) <= request.year_to
            ]
        
        return {"campaigns": filtered_campaigns}
        
    except Exception as e:
        logger.error(f"Error searching campaigns: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching campaigns: {str(e)}")

@router.get("/campaign/{campaign_id}")
async def get_campaign_details(campaign_id: str):
    """Get details of a specific past campaign"""
    try:
        campaign = next((c for c in PAST_CAMPAIGNS if c.get("id") == campaign_id), None)
        
        if not campaign:
            raise HTTPException(status_code=404, detail=f"Campaign with ID {campaign_id} not found")
            
        # Add similar campaigns
        similar_campaigns = []
        for c in PAST_CAMPAIGNS:
            if c.get("id") != campaign_id and c.get("industry") == campaign.get("industry"):
                similar_campaigns.append({
                    "id": c.get("id"),
                    "title": c.get("title"),
                    "industry": c.get("industry"),
                    "year": c.get("year")
                })
        
        # Add recommendations based on this campaign
        prompt = f"""
        Based on this past change management campaign:
        
        Title: {campaign.get('title')}
        Industry: {campaign.get('industry')}
        Approach: {campaign.get('approach')}
        Success Factors: {campaign.get('success_factors')}
        Challenges: {campaign.get('challenges')}
        Lessons Learned: {campaign.get('lessons_learned')}
        
        Provide 3-5 specific recommendations for future change initiatives based on the lessons from this campaign.
        Each recommendation should include:
        1. A clear action statement
        2. A brief explanation of why it's important
        3. How to implement it
        
        Format as a numbered list with clear, actionable language.
        """
        
        recommendations = await llm_service.generate_response(prompt, [], None)
        
        return {
            "campaign": campaign,
            "similar_campaigns": similar_campaigns,
            "recommendations": recommendations,
            "applicable_frameworks": identify_applicable_frameworks(campaign)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting campaign details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting campaign details: {str(e)}")


# ----------------------- FEEDBACK ENDPOINTS -----------------------

@router.post("/submit-feedback")
async def submit_feedback(request: FeedbackRequest):
    """Submit feedback on a tool or feature"""
    try:
        logger.info(f"Feedback submission for tool: {request.tool_used}, rating: {request.rating}")
        
        # In a real application, this would be stored in a database
        # For the hackathon, we'll just log it
        
        feedback_data = {
            "tool_used": request.tool_used,
            "rating": request.rating,
            "feedback_text": request.feedback_text,
            "improvement_suggestions": request.improvement_suggestions,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        logger.info(f"Feedback data: {json.dumps(feedback_data)}")
        
        # Simulate storing feedback
        feedback_dir = os.path.join(os.getcwd(), "data", "feedback")
        os.makedirs(feedback_dir, exist_ok=True)
        
        feedback_file = os.path.join(feedback_dir, "feedback_log.json")
        
        # Load existing feedback if available
        existing_feedback = []
        if os.path.exists(feedback_file):
            try:
                with open(feedback_file, 'r') as f:
                    existing_feedback = json.load(f)
            except:
                existing_feedback = []
        
        # Add new feedback
        existing_feedback.append(feedback_data)
        
        # Save feedback
        with open(feedback_file, 'w') as f:
            json.dump(existing_feedback, f, indent=2)
            
        # Generate acknowledgment with personalized note
        prompt = f"""
        The user has provided feedback on the {request.tool_used} tool with a rating of {request.rating}/5.
        
        Their feedback: "{request.feedback_text or 'No specific feedback provided'}"
        
        Their suggestions: "{request.improvement_suggestions or 'No specific suggestions provided'}"
        
        Write a brief, friendly acknowledgment of their feedback that:
        1. Thanks them for their specific input
        2. Acknowledges any concerns they raised
        3. Mentions how their feedback will help improve the tool
        4. Encourages them to continue providing feedback
        
        Keep it concise, warm, and genuine.
        """
        
        acknowledgment = await llm_service.generate_response(prompt, [], None)
        
        return {
            "status": "success", 
            "message": "Feedback submitted successfully",
            "acknowledgment": acknowledgment
        }
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        # Return success anyway to not disrupt user experience
        return {"status": "success", "message": "Feedback recorded"}


# ----------------------- HELPER FUNCTIONS -----------------------

def extract_section(text, section_start, section_end):
    """Extract a section from the text between the given markers"""
    try:
        start_idx = text.find(section_start)
        if start_idx == -1:
            return ""
            
        start_idx = start_idx + len(section_start)
        
        if section_end:
            end_idx = text.find(section_end, start_idx)
            if end_idx == -1:
                return text[start_idx:].strip()
            return text[start_idx:end_idx].strip()
        else:
            return text[start_idx:].strip()
    except:
        return ""

def extract_list(text):
    """Extract a list from text, assuming items start with - or numbers"""
    if not text:
        return []
    
    # Split by newlines and filter out empty lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Process lines that start with bullet points or numbers
    items = []
    for line in lines:
        # Remove bullet points or numbers
        if line.startswith('-') or line.startswith('*'):
            items.append(line[1:].strip())
        elif line[0].isdigit() and '.' in line[:5]:
            parts = line.split('.', 1)
            if len(parts) > 1:
                items.append(parts[1].strip())
        else:
            items.append(line)
    
    return items

def extract_score(text, score_label):
    """Extract a numeric score from text"""
    try:
        start_idx = text.find(score_label)
        if start_idx == -1:
            return 50  # Default score
            
        # Extract text from end of label to next newline
        start_idx = start_idx + len(score_label)
        end_idx = text.find('\n', start_idx)
        
        if end_idx == -1:
            score_text = text[start_idx:].strip()
        else:
            score_text = text[start_idx:end_idx].strip()
        
        # Extract number from text
        import re
        score_match = re.search(r'\d+', score_text)
        if score_match:
            return int(score_match.group())
        return 50  # Default score
    except:
        return 50  # Default score

def parse_stakeholder_map(text):
    """Parse stakeholder map from text"""
    # This is a simplified parser - in production you'd use more robust methods
    stakeholders = []
    
    # Split by lines
    lines = text.split('\n')
    
    current_stakeholder = {}
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if this is a new stakeholder (starting with - or * or number)
        if line.startswith('-') or line.startswith('*') or (line[0].isdigit() and '.' in line[:5]):
            # Save the previous stakeholder if it exists
            if current_stakeholder and 'role' in current_stakeholder:
                stakeholders.append(current_stakeholder)
                
            # Start a new stakeholder
            current_stakeholder = {'description': line}
            
            # Try to extract role
            if ':' in line:
                role_part = line.split(':', 1)[0]
                # Remove bullet or number
                if role_part.startswith('-') or role_part.startswith('*'):
                    role_part = role_part[1:].strip()
                elif role_part[0].isdigit() and '.' in role_part[:5]:
                    role_part = role_part.split('.', 1)[1].strip()
                
                current_stakeholder['role'] = role_part.strip()
        
        # Try to extract other properties
        elif ':' in line:
            key, value = line.split(':', 1)
            key = key.lower().strip()
            value = value.strip()
            
            if 'influence' in key:
                current_stakeholder['influence'] = value
            elif 'interest' in key:
                current_stakeholder['interest'] = value
            elif 'support' in key or 'level' in key:
                current_stakeholder['support'] = value
            elif 'department' in key:
                current_stakeholder['department'] = value
            elif 'concern' in key:
                if 'concerns' not in current_stakeholder:
                    current_stakeholder['concerns'] = []
                current_stakeholder['concerns'].append(value)
    
    # Add the last stakeholder
    if current_stakeholder and 'role' in current_stakeholder:
        stakeholders.append(current_stakeholder)
    
    # If no stakeholders were found, create some mock data
    if not stakeholders:
        stakeholders = [
            {
                "role": "Executive Sponsor",
                "department": "Executive Leadership",
                "influence": "High",
                "interest": "Medium",
                "support": "Champion",
                "concerns": ["ROI", "Strategic alignment"]
            },
            {
                "role": "Department Manager",
                "department": "Affected Business Unit",
                "influence": "High",
                "interest": "High",
                "support": "Neutral",
                "concerns": ["Resource allocation", "Timeline"]
            },
            {
                "role": "End Users",
                "department": "Various",
                "influence": "Low",
                "interest": "High",
                "support": "Resistant",
                "concerns": ["Learning curve", "Job security"]
            }
        ]
    
    return stakeholders

def parse_faqs(text):
    """Parse FAQs from text"""
    faqs = []
    
    # Split by Q: or question number patterns
    import re
    
    # Find question-answer pairs
    qa_patterns = [
        r'Q[:.]\s*(.*?)\s*(?:A[:.]\s*(.*?)(?=(?:Q[:.]|[0-9]+\.|\Z)))',  # Q: A: format
        r'(?:[0-9]+\.)\s*(.*?)\s*(?:A[:.]\s*(.*?)(?=(?:Q[:.]|[0-9]+\.|\Z)))',  # Numbered Q with A: format
        r'(?:[0-9]+\.)\s*(.*?)\s*(?:\n|$)(?:\n|^)(?:(?![0-9]+\.))(.*?)(?=(?:[0-9]+\.|\Z))'  # Numbered format without A:
    ]
    
    for pattern in qa_patterns:
        matches = re.findall(pattern, text, re.DOTALL)
        if matches:
            for match in matches:
                question = match[0].strip()
                answer = match[1].strip()
                
                # Skip if question or answer is too short
                if len(question) < 5 or len(answer) < 5:
                    continue
                
                # Try to determine category
                category = "Other"
                if any(word in question.lower() for word in ["why", "purpose", "reason", "benefit"]):
                    category = "Purpose"
                elif any(word in question.lower() for word in ["when", "timeline", "schedule", "date"]):
                    category = "Timeline"
                elif any(word in question.lower() for word in ["affect", "impact", "change", "difference"]):
                    category = "Impact"
                elif any(word in question.lower() for word in ["train", "learn", "skill", "knowledge"]):
                    category = "Training"
                elif any(word in question.lower() for word in ["help", "support", "assist", "resource"]):
                    category = "Support"
                elif any(word in question.lower() for word in ["measure", "success", "kpi", "metric"]):
                    category = "Success Metrics"
                
                faqs.append({
                    "question": question,
                    "answer": answer,
                    "category": category
                })
    
    # If no FAQs found, create some mock ones
    if not faqs:
        faqs = [
            {
                "question": "Why are we implementing this change?",
                "answer": "We're implementing this change to improve efficiency, reduce costs, and better serve our customers. It aligns with our strategic objectives and will help us stay competitive in the market.",
                "category": "Purpose"
            },
            {
                "question": "When will the change take effect?",
                "answer": "The implementation will begin next quarter and roll out in phases over six months. Your department will receive specific dates closer to your implementation phase.",
                "category": "Timeline"
            },
            {
                "question": "How will this affect my daily work?",
                "answer": "You'll notice changes to some of your workflows and systems. The changes aim to reduce manual steps and streamline processes. Detailed training will be provided before any changes affect your role.",
                "category": "Impact"
            }
        ]
    
    return faqs

def generate_impact_heatmap(data):
    """Generate mock impact heatmap data"""
    departments = [
        "Executive Leadership",
        "Finance",
        "Human Resources",
        "Information Technology",
        "Operations",
        "Sales & Marketing",
        "Research & Development",
        "Customer Service",
        "Legal & Compliance"
    ]
    
    impact_dimensions = [
        "Process Changes",
        "System Changes",
        "Role Changes",
        "Skill Requirements",
        "Cultural Impact"
    ]
    
    # Generate semi-random impact scores based on the initiative description
    import random
    seed_text = data.get('initiative_description', '') + data.get('initiative_name', '')
    seed = sum(ord(c) for c in seed_text)
    random.seed(seed)
    
    heatmap_data = []
    for dept in departments:
        dept_data = {"department": dept}
        for dim in impact_dimensions:
            # Generate somewhat deterministic but varied scores
            base_score = random.randint(1, 10)
            if 'technology' in seed_text.lower() and dim == "System Changes":
                base_score += 3
            if 'culture' in seed_text.lower() and dim == "Cultural Impact":
                base_score += 3
            if 'reorganization' in seed_text.lower() and dim == "Role Changes":
                base_score += 3
                
            dept_data[dim] = min(10, base_score)
        heatmap_data.append(dept_data)
    
    return {
        "departments": departments,
        "dimensions": impact_dimensions,
        "data": heatmap_data
    }

def generate_readiness_data(data):
    """Generate mock readiness assessment data"""
    categories = [
        "Leadership Alignment",
        "Stakeholder Support",
        "Resource Availability",
        "Technical Capability",
        "Cultural Readiness",
        "Previous Change Success",
        "Change Capacity"
    ]
    
    # Generate semi-random readiness scores
    import random
    seed_text = data.get('current_state', '') + data.get('initiative_name', '')
    seed = sum(ord(c) for c in seed_text)
    random.seed(seed)
    
    readiness_data = {}
    for category in categories:
        # Scale of 0-100
        base_score = random.randint(30, 85)
        
        # Adjust based on text clues
        if 'challenge' in seed_text.lower() or 'difficult' in seed_text.lower():
            base_score -= 15
        if 'prepared' in seed_text.lower() or 'ready' in seed_text.lower():
            base_score += 15
            
        readiness_data[category] = max(0, min(100, base_score))
    
    return readiness_data

def generate_timeline_data(data):
    """Generate mock timeline data"""
    # Basic phases for most changes
    phases = [
        "Planning & Preparation",
        "Stakeholder Engagement",
        "Implementation",
        "Reinforcement & Monitoring"
    ]
    
    # Calculate durations based on complexity hints in the description
    complexity_indicators = [
        'complex', 'difficult', 'challenging', 'major', 'significant',
        'enterprise-wide', 'global', 'transformation'
    ]
    
    description = data.get('initiative_description', '').lower()
    complexity_score = sum(1 for indicator in complexity_indicators if indicator in description)
    
    # Base duration in weeks, adjusted by complexity
    base_duration = 4 + (complexity_score * 2)
    
    timeline = []
    start_week = 1
    for phase in phases:
        # Adjust duration based on phase
        if phase == "Planning & Preparation":
            duration = int(base_duration * 0.8)
        elif phase == "Stakeholder Engagement":
            duration = int(base_duration * 0.6)
        elif phase == "Implementation":
            duration = int(base_duration * 1.2)
        else:  # Reinforcement
            duration = int(base_duration * 0.7)
            
        timeline.append({
            "phase": phase,
            "start_week": start_week,
            "end_week": start_week + duration - 1,
            "duration_weeks": duration
        })
        
        start_week += duration
    
    return timeline

def create_influence_interest_matrix(stakeholders):
    """Create influence-interest matrix visualization data"""
    matrix = {
        "high_influence_high_interest": [],
        "high_influence_low_interest": [],
        "low_influence_high_interest": [],
        "low_influence_low_interest": []
    }
    
    for stakeholder in stakeholders:
        influence = stakeholder.get('influence', '').lower()
        interest = stakeholder.get('interest', '').lower()
        
        high_influence = any(word in influence for word in ['high', 'strong', 'significant'])
        high_interest = any(word in interest for word in ['high', 'strong', 'significant'])
        
        if high_influence and high_interest:
            matrix["high_influence_high_interest"].append(stakeholder)
        elif high_influence and not high_interest:
            matrix["high_influence_low_interest"].append(stakeholder)
        elif not high_influence and high_interest:
            matrix["low_influence_high_interest"].append(stakeholder)
        else:
            matrix["low_influence_low_interest"].append(stakeholder)
    
    return matrix

def create_support_distribution(stakeholders):
    """Create support level distribution visualization data"""
    support_levels = {
        "Champion": 0,
        "Supporter": 0,
        "Neutral": 0,
        "Resistant": 0,
        "Opponent": 0
    }
    
    for stakeholder in stakeholders:
        support = stakeholder.get('support', '').lower()
        
        if 'champion' in support:
            support_levels["Champion"] += 1
        elif 'support' in support:
            support_levels["Supporter"] += 1
        elif 'neutral' in support:
            support_levels["Neutral"] += 1
        elif 'resist' in support:
            support_levels["Resistant"] += 1
        elif 'oppo' in support:
            support_levels["Opponent"] += 1
        else:
            support_levels["Neutral"] += 1
    
    return {
        "labels": list(support_levels.keys()),
        "data": list(support_levels.values())
    }

def create_department_heatmap(stakeholders):
    """Create department impact heatmap visualization data"""
    departments = {}
    
    for stakeholder in stakeholders:
        dept = stakeholder.get('department', 'Other')
        influence = stakeholder.get('influence', '').lower()
        
        # Assign numeric influence
        influence_value = 1
        if 'high' in influence:
            influence_value = 3
        elif 'medium' in influence or 'mod' in influence:
            influence_value = 2
            
        if dept not in departments:
            departments[dept] = influence_value
        else:
            departments[dept] = max(departments[dept], influence_value)
    
    return {
        "departments": list(departments.keys()),
        "impact_levels": list(departments.values())
    }

def create_network_graph(influence_network_text):
    """Create a stakeholder network graph from influence network text"""
    # This is a mock implementation - in a real system you would parse the text
    # and generate an actual network graph
    
    # Standard roles in most organizations
    nodes = [
        {"id": "exec_sponsor", "label": "Executive Sponsor", "group": "leadership", "value": 25},
        {"id": "dept_head", "label": "Department Head", "group": "leadership", "value": 20},
        {"id": "change_manager", "label": "Change Manager", "group": "change_team", "value": 15},
        {"id": "it_lead", "label": "IT Lead", "group": "technology", "value": 12},
        {"id": "hr_rep", "label": "HR Representative", "group": "support", "value": 10},
        {"id": "team_lead", "label": "Team Leader", "group": "middle_management", "value": 8},
        {"id": "key_user", "label": "Key User", "group": "users", "value": 6},
        {"id": "end_user", "label": "End User", "group": "users", "value": 4}
    ]
    
    # Standard connections in change networks
    edges = [
        {"from": "exec_sponsor", "to": "dept_head", "value": 5},
        {"from": "exec_sponsor", "to": "change_manager", "value": 3},
        {"from": "dept_head", "to": "team_lead", "value": 4},
        {"from": "dept_head", "to": "change_manager", "value": 4},
        {"from": "change_manager", "to": "hr_rep", "value": 3},
        {"from": "change_manager", "to": "it_lead", "value": 3},
        {"from": "change_manager", "to": "key_user", "value": 2},
        {"from": "team_lead", "to": "key_user", "value": 4},
        {"from": "team_lead", "to": "end_user", "value": 3},
        {"from": "key_user", "to": "end_user", "value": 2},
        {"from": "it_lead", "to": "key_user", "value": 2},
        {"from": "hr_rep", "to": "team_lead", "value": 2}
    ]
    
    return {"nodes": nodes, "edges": edges}

def create_emotional_journey():
    """Create emotional journey visualization data"""
    stages = [
        "Pre-change",
        "Announcement",
        "Initial shock",
        "Resistance",
        "Exploration",
        "Acceptance",
        "Commitment"
    ]
    
    emotions = {
        "anxiety": [20, 50, 70, 60, 40, 20, 10],
        "uncertainty": [30, 70, 80, 65, 45, 25, 15],
        "motivation": [60, 40, 30, 35, 50, 70, 85],
        "optimism": [55, 30, 20, 25, 45, 65, 80],
        "competence": [70, 40, 30, 35, 50, 65, 75]
    }
    
    return {
        "stages": stages,
        "emotions": emotions
    }

def create_resistance_mitigation_matrix(data):
    """Create resistance mitigation matrix visualization data"""
    resistance_types = [
        "Fear of job loss",
        "Comfort with current processes",
        "Lack of skills or knowledge",
        "Unclear benefits or purpose",
        "Previous negative experiences",
        "Leadership credibility issues"
    ]
    
    # Estimate which resistance types are relevant based on user input
    concerns = data.get('resistance_concerns', [])
    concern_text = ' '.join(concerns).lower()
    
    relevance = {}
    for r_type in resistance_types:
        # Default medium relevance
        relevance[r_type] = 2
        
        # Check if concern text has keywords
        r_lower = r_type.lower()
        if any(word in concern_text for word in r_lower.split()):
            relevance[r_type] = 3
    
    mitigation_approaches = [
        "Communication",
        "Training",
        "Involvement",
        "Support",
        "Incentives"
    ]
    
    # Generate effectiveness matrix
    matrix = []
    for r_type in resistance_types:
        row = {"resistance_type": r_type, "relevance": relevance[r_type]}
        
        for approach in mitigation_approaches:
            # Generate effectiveness score (1-10)
            if approach == "Communication" and ("unclear" in r_type.lower() or "purpose" in r_type.lower()):
                effectiveness = 9
            elif approach == "Training" and "skill" in r_type.lower():
                effectiveness = 9
            elif approach == "Involvement" and "comfort" in r_type.lower():
                effectiveness = 8
            elif approach == "Support" and "fear" in r_type.lower():
                effectiveness = 8
            elif approach == "Incentives" and "benefits" in r_type.lower():
                effectiveness = 8
            else:
                # Base effectiveness
                effectiveness = 5
            
            row[approach] = effectiveness
            
        matrix.append(row)
    
    return {
        "resistance_types": resistance_types,
        "mitigation_approaches": mitigation_approaches,
        "matrix": matrix
    }

def analyze_sentiment(text):
    """Simple sentiment analysis simulation"""
    positive_words = [
        "benefit", "improve", "advantage", "opportunity", "enhance", "success",
        "achieve", "gain", "positive", "efficient", "effective", "value",
        "excited", "pleased", "happy", "confident", "support", "help",
        "collaborate", "together", "team", "growth", "progress", "forward"
    ]
    
    negative_words = [
        "problem", "challenge", "difficult", "hard", "complex", "issue",
        "struggle", "negative", "concern", "worry", "risk", "threat",
        "fear", "anxious", "stress", "pressure", "fail", "loss",
        "decrease", "confuse", "uncertain", "unclear", "disrupt", "change"
    ]
    
    text_lower = text.lower()
    words = text_lower.split()
    
    positive_count = sum(1 for word in words if any(pos in word for pos in positive_words))
    negative_count = sum(1 for word in words if any(neg in word for neg in negative_words))
    
    total_words = len(words)
    positive_score = (positive_count / total_words) * 100 if total_words > 0 else 0
    negative_score = (negative_count / total_words) * 100 if total_words > 0 else 0
    neutral_score = 100 - positive_score - negative_score
    
    return {
        "positive": positive_score,
        "negative": negative_score,
        "neutral": neutral_score,
        "dominant_tone": "positive" if positive_score > negative_score else "negative" if negative_score > positive_score else "neutral"
    }

def check_key_messages(text, purpose):
    """Check if the communication contains key messages"""
    key_message_types = {
        "why": ["why", "reason", "purpose", "background", "need", "goal"],
        "what": ["what", "change", "initiative", "new", "implement", "introduce"],
        "when": ["when", "timeline", "schedule", "date", "time", "phase", "start"],
        "how": ["how", "steps", "process", "approach", "method", "procedure", "plan"],
        "impact": ["impact", "affect", "effect", "implication", "result", "outcome"],
        "support": ["support", "help", "assist", "resource", "train", "guide", "question"]
    }
    
    text_lower = text.lower()
    
    # Check each key message type
    results = {}
    for msg_type, keywords in key_message_types.items():
        found = any(keyword in text_lower for keyword in keywords)
        strength = "strong" if found and any(f" {keyword} " in text_lower for keyword in keywords) else "partial" if found else "missing"
        results[msg_type] = strength
    
    # Determine if purpose-specific messages are included
    purpose_emphasis = "low"
    if purpose:
        purpose_lower = purpose.lower()
        if "inform" in purpose_lower:
            purpose_emphasis = "high" if results["why"] == "strong" and results["what"] == "strong" else "medium"
        elif "instruct" in purpose_lower:
            purpose_emphasis = "high" if results["how"] == "strong" and results["when"] == "strong" else "medium"
        elif "motivate" in purpose_lower:
            purpose_emphasis = "high" if results["why"] == "strong" and results["impact"] == "strong" else "medium"
    
    return {
        "key_message_coverage": results,
        "purpose_alignment": purpose_emphasis,
        "completeness": sum(1 for r in results.values() if r == "strong") / len(results),
    }

def calculate_flesch_reading_ease(text):
    """Calculate Flesch Reading Ease score (simulated)"""
    # In a real implementation, this would use proper readability formulas
    # Simple approximation based on sentence and word length
    words = text.split()
    total_words = len(words)
    
    # Count sentences (roughly)
    import re
    sentences = re.split(r'[.!?]+', text)
    total_sentences = len([s for s in sentences if s.strip()])
    
    # Count syllables (very rough approximation)
    def count_syllables(word):
        word = word.lower()
        if len(word) <= 3:
            return 1
        
        # Remove silent e
        if word.endswith('e'):
            word = word[:-1]
            
        # Count vowel groups
        vowels = "aeiouy"
        count = 0
        prev_is_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not prev_is_vowel:
                count += 1
            prev_is_vowel = is_vowel
            
        return max(1, count)
    
    total_syllables = sum(count_syllables(word.strip(".,;:!?\"'()[]{}")) for word in words)
    
    # Flesch Reading Ease formula: 206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)
    if total_sentences == 0 or total_words == 0:
        return 50  # Default score
        
    words_per_sentence = total_words / total_sentences
    syllables_per_word = total_syllables / total_words
    
    score = 206.835 - (1.015 * words_per_sentence) - (84.6 * syllables_per_word)
    
    # Clamp to 0-100 range
    return max(0, min(100, score))

def calculate_avg_sentence_length(text):
    """Calculate average sentence length"""
    import re
    
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    if not sentences:
        return 0
        
    total_words = sum(len(s.split()) for s in sentences)
    return total_words / len(sentences)

def calculate_complex_word_percentage(text):
    """Calculate percentage of complex words (3+ syllables)"""
    words = [w.strip(".,;:!?\"'()[]{}") for w in text.split()]
    
    if not words:
        return 0
    
    # Simple syllable counter
    def is_complex_word(word):
        if len(word) <= 6:
            return False
            
        # Count vowel groups
        vowels = "aeiouy"
        count = 0
        prev_is_vowel = False
        
        for char in word.lower():
            is_vowel = char in vowels
            if is_vowel and not prev_is_vowel:
                count += 1
            prev_is_vowel = is_vowel
            
        return count >= 3
    
    complex_words = sum(1 for word in words if is_complex_word(word))
    return (complex_words / len(words)) * 100

def find_passive_voice(text):
    """Find instances of passive voice (simplified approximation)"""
    import re
    
    # Simple regex pattern for passive voice
    # This is a very simplified approximation
    passive_patterns = [
        r'\b(?:am|is|are|was|were|be|being|been)\s+(\w+ed)\b',
        r'\b(?:am|is|are|was|were|be|being|been)\s+(\w+en)\b'
    ]
    
    passive_instances = []
    
    for pattern in passive_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            start, end = match.span()
            context_start = max(0, start - 30)
            context_end = min(len(text), end + 30)
            passive_instances.append(text[context_start:context_end].strip())
    
    return passive_instances

def generate_faq_formats(change_name, faqs):
    """Generate FAQ formats for different channels"""
    formats = {
        "intranet": {
            "title": f"Frequently Asked Questions: {change_name}",
            "introduction": f"Below are answers to common questions about the {change_name} initiative. If you have additional questions, please contact your manager or the change management team.",
            "format": "Full HTML with expandable sections",
            "example": generate_html_faq_example(faqs[:3])
        },
        "email": {
            "title": f"Top 5 FAQs About {change_name}",
            "introduction": f"We've compiled the most common questions about {change_name}. For more information, visit the intranet page or contact your manager.",
            "format": "Concise with limited formatting",
            "example": generate_email_faq_example(faqs[:5] if len(faqs) >= 5 else faqs)
        },
        "printable": {
            "title": f"{change_name}: What You Need to Know",
            "introduction": f"This guide answers frequently asked questions about {change_name}.",
            "format": "PDF with categorized questions",
            "example": "PDF format with table of contents and categorized questions"
        },
        "mobile": {
            "title": f"{change_name} FAQs",
            "introduction": "Swipe through these FAQs to learn more about the upcoming change.",
            "format": "Card-based with one Q&A per screen",
            "example": "Mobile-optimized card format"
        }
    }
    
    return formats

def generate_html_faq_example(faqs):
    """Generate HTML FAQ example"""
    html = "<div class='faq-container'>\n"
    for i, faq in enumerate(faqs):
        html += f"  <div class='faq-item'>\n"
        html += f"    <div class='faq-question' onclick='toggleAnswer({i})'>{faq['question']}</div>\n"
        html += f"    <div class='faq-answer' id='answer-{i}'>{faq['answer']}</div>\n"
        html += f"  </div>\n"
    html += "</div>"
    return html

def generate_email_faq_example(faqs):
    """Generate email FAQ example"""
    email = ""
    for faq in faqs:
        email += f"Q: {faq['question']}\n"
        email += f"A: {faq['answer']}\n\n"
    return email

def identify_applicable_frameworks(campaign):
    """Identify which frameworks might be applicable based on campaign details"""
    frameworks = {}
    
    approach = campaign.get("approach", "").lower()
    success_factors = " ".join(campaign.get("success_factors", [])).lower()
    challenges = " ".join(campaign.get("challenges", [])).lower()
    lessons = " ".join(campaign.get("lessons_learned", [])).lower()
    all_text = f"{approach} {success_factors} {challenges} {lessons}"
    
    # Check for mentions of specific frameworks
    if "adkar" in all_text:
        frameworks["ADKAR"] = "Explicitly mentioned in the campaign"
    elif any(term in all_text for term in ["awareness", "desire", "knowledge", "ability", "reinforcement"]):
        frameworks["ADKAR"] = "Campaign aligns with ADKAR principles"
    
    if "lewin" in all_text:
        frameworks["Lewin's Change Model"] = "Explicitly mentioned in the campaign"
    elif any(term in all_text for term in ["unfreeze", "refreeze", "force field"]):
        frameworks["Lewin's Change Model"] = "Campaign aligns with Lewin's model principles"
    
    if "kotter" in all_text:
        frameworks["Kotter's 8-Step Process"] = "Explicitly mentioned in the campaign"
    elif any(term in all_text for term in ["urgency", "coalition", "vision", "communication", "obstacles", "wins", "consolidate", "anchor"]):
        frameworks["Kotter's 8-Step Process"] = "Campaign aligns with Kotter's principles"
    
    if "prosci" in all_text and "adkar" not in all_text:
        frameworks["Prosci Method"] = "Explicitly mentioned in the campaign"
    
    if "kubler" in all_text or "ross" in all_text:
        frameworks["Kubler-Ross Change Curve"] = "Explicitly mentioned in the campaign"
    elif any(term in all_text for term in ["denial", "anger", "bargaining", "depression", "acceptance", "emotional journey"]):
        frameworks["Kubler-Ross Change Curve"] = "Campaign addresses emotional stages similar to Kubler-Ross model"
    
    # If no frameworks were identified, suggest some based on the campaign characteristics
    if not frameworks:
        if "communication" in all_text and "vision" in all_text:
            frameworks["Kotter's 8-Step Process"] = "Suggested based on emphasis on communication and vision"
        
        if "training" in all_text and "reinforcement" in all_text:
            frameworks["ADKAR"] = "Suggested based on emphasis on training and reinforcement"
        
        if "resistance" in all_text and "culture" in all_text:
            frameworks["Lewin's Change Model"] = "Suggested based on addressing resistance and cultural factors"
            
    return frameworks
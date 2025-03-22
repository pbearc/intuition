# app/routes/faqs.py
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging
import json
import datetime
import random
from app.services.llm_service import LLMService

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter()
llm_service = LLMService()

class FAQGenerationRequest(BaseModel):
    initiative_name: str
    initiative_description: str
    target_audiences: List[str]
    key_concerns: Optional[List[str]] = None
    timeline: Optional[str] = None
    delivery_channels: Optional[List[str]] = None

@router.post("/generate-faqs")
async def generate_faqs(request: FAQGenerationRequest):
    """Generate adaptive, role-based FAQs for change initiatives"""
    try:
        # Create a sophisticated prompt for LLM
        prompt = f"""
        As an advanced Change Management AI Assistant, create comprehensive FAQs for the following change initiative:
        
        Initiative Name: {request.initiative_name}
        Description: {request.initiative_description}
        Target Audiences: {', '.join(request.target_audiences)}
        Key Concerns: {', '.join(request.key_concerns or ['Not specified'])}
        Timeline: {request.timeline or 'Not specified'}
        Delivery Channels: {', '.join(request.delivery_channels or ['Email', 'Intranet', 'Meetings'])}
        
        Create role-based FAQs specifically tailored for each of these audience groups:
        {', '.join(request.target_audiences)}
        
        For each audience group, include questions about:
        - The purpose and benefits of the change (relevant to their role)
        - Timeline and implementation details (what they need to know)
        - How the change will affect their day-to-day work
        - Training and support available to them
        - Their specific responsibilities in the change
        - How success will be measured for their role
        
        For each FAQ, provide:
        1. A clear, concise question from the perspective of the audience
        2. A thorough but accessible answer tailored to their role and concerns
        3. A category tag (Purpose, Timeline, Impact, Training, Support, Success Metrics, Responsibilities)
        
        Also provide an "Evolution Plan" for these FAQs - how they should be updated over time as the change progresses.
        
        Format your response with clear headings for each audience group.
        """
        
        # Get response from LLM
        response_text = await llm_service.generate_response(prompt, [], None)
        
        # Process and structure the response
        faq_data = process_faq_generation(response_text, request)
        
        return faq_data
    
    except Exception as e:
        logger.error(f"Error generating FAQs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating FAQs: {str(e)}")

def process_faq_generation(text, request):
    """Process the LLM response into structured FAQ data"""
    # In a real implementation, this would parse the LLM text
    # For the hackathon, we'll create a structured output
    
    role_based_faqs = {}
    
    # Generate role-based FAQs for each audience
    for audience in request.target_audiences:
        role_faqs = generate_role_faqs(audience, request)
        role_based_faqs[audience] = role_faqs
    
    # Generate adaptive plan
    adaptive_plan = generate_adaptive_plan(request)
    
    # Generate format suggestions for different channels
    format_suggestions = generate_format_suggestions(request)
    
    return {
        "initiative": request.initiative_name,
        "role_based_faqs": role_based_faqs,
        "adaptive_plan": adaptive_plan,
        "format_suggestions": format_suggestions,
        "metadata": {
            "generated_at": datetime.datetime.now().isoformat(),
            "total_faqs": sum(len(faqs) for faqs in role_based_faqs.values()),
            "audiences": request.target_audiences
        }
    }

def generate_role_faqs(role, request):
    """Generate role-specific FAQs"""
    categories = ["Purpose", "Timeline", "Impact", "Training", "Support", "Responsibilities", "Success Metrics"]
    faqs = []
    
    # Generate FAQs for each category
    for category in categories:
        # Number of FAQs per category varies by role and category
        num_faqs = 1
        if role in ["Executives", "Leaders", "Managers"] and category in ["Purpose", "Success Metrics"]:
            num_faqs = 2
        elif role in ["End Users", "Employees"] and category in ["Impact", "Training", "Support"]:
            num_faqs = 2
            
        for i in range(num_faqs):
            faq = {
                "question": generate_question(role, category, i, request),
                "answer": generate_answer(role, category, i, request),
                "category": category,
                "relevance_score": random.randint(70, 95)
            }
            faqs.append(faq)
    
    # Sort by relevance score
    faqs.sort(key=lambda x: x["relevance_score"], reverse=True)
    return faqs

def generate_question(role, category, index, request):
    """Generate a role-specific question for a category"""
    # Questions tailored to role and category
    questions = {
        "Executives": {
            "Purpose": [
                f"What strategic objectives does the {request.initiative_name} initiative support?",
                "What is the expected ROI and business case for this change?"
            ],
            "Timeline": [
                f"What is the high-level timeline for the {request.initiative_name} implementation?"
            ],
            "Impact": [
                "How will this change impact our organizational structure and operations?"
            ],
            "Training": [
                "What investment in training and development is required?"
            ],
            "Support": [
                "What executive actions are needed to support this change?"
            ],
            "Responsibilities": [
                "What is my role as an executive sponsor in this change?"
            ],
            "Success Metrics": [
                "How will we measure the success of this initiative?",
                "What KPIs should I monitor to track progress?"
            ]
        },
        "Managers": {
            "Purpose": [
                f"Why is the {request.initiative_name} initiative important for our department?",
                "How does this change align with our current objectives?"
            ],
            "Timeline": [
                "What are the key milestones that will affect my team?"
            ],
            "Impact": [
                "How will this change affect my team's daily operations?"
            ],
            "Training": [
                "What training will my team members need to complete?"
            ],
            "Support": [
                "What resources are available to help me lead my team through this change?"
            ],
            "Responsibilities": [
                "What specific actions do I need to take as a manager during this change?"
            ],
            "Success Metrics": [
                "How will my team's performance be measured during and after this change?"
            ]
        },
        "Employees": {
            "Purpose": [
                f"Why is the organization implementing the {request.initiative_name}?"
            ],
            "Timeline": [
                "When will these changes affect my daily work?"
            ],
            "Impact": [
                "How will my job change as a result of this initiative?",
                "Will I need to learn new skills or take on new responsibilities?"
            ],
            "Training": [
                "What training will be provided to help me adapt to the changes?",
                "How much time will I need to dedicate to training?"
            ],
            "Support": [
                "Who can I contact if I have questions or concerns?",
                "What support resources are available to me?"
            ],
            "Responsibilities": [
                "What am I expected to do differently after this change?"
            ],
            "Success Metrics": [
                "How will my performance be evaluated after this change?"
            ]
        }
    }
    
    # Default questions for roles not explicitly defined
    default_questions = {
        "Purpose": [f"Why is the {request.initiative_name} being implemented?"],
        "Timeline": ["What is the timeline for implementation?"],
        "Impact": ["How will this change affect my role?"],
        "Training": ["What training will be provided?"],
        "Support": ["What support resources are available?"],
        "Responsibilities": ["What are my responsibilities during this change?"],
        "Success Metrics": ["How will success be measured?"]
    }
    
    # Get role-specific questions or default to generic ones
    role_questions = questions.get(role, default_questions)
    category_questions = role_questions.get(category, default_questions[category])
    
    # Return appropriate question or create a generic one if index is out of range
    if index < len(category_questions):
        return category_questions[index]
    else:
        return f"{category} question for {role} regarding {request.initiative_name}"

def generate_answer(role, category, index, request):
    """Generate a role-specific answer"""
    # This would normally generate based on initiative details
    # For the hackathon, create a realistic but generic answer
    return f"This is a tailored answer for {role} about {category.lower()} aspects of the {request.initiative_name} initiative. The answer addresses specific concerns and provides information relevant to their role and responsibilities."

def generate_adaptive_plan(request):
    """Generate an adaptive FAQ evolution plan"""
    phases = ["Pre-launch", "Launch", "Early Adoption", "Full Implementation", "Reinforcement"]
    
    plan = {
        "overview": f"This adaptive plan ensures FAQs evolve throughout the {request.initiative_name} implementation.",
        "phases": []
    }
    
    for phase in phases:
        plan["phases"].append({
            "phase": phase,
            "focus_areas": get_phase_focus(phase),
            "update_triggers": get_update_triggers(phase),
            "audience_emphasis": get_audience_emphasis(phase, request.target_audiences)
        })
    
    return plan

def get_phase_focus(phase):
    """Get focus areas for each phase"""
    focus_areas = {
        "Pre-launch": ["Purpose", "Timeline", "Impact"],
        "Launch": ["Training", "Support", "Timeline"],
        "Early Adoption": ["Support", "Impact", "Responsibilities"],
        "Full Implementation": ["Success Metrics", "Responsibilities", "Impact"],
        "Reinforcement": ["Success Metrics", "Support", "Future Developments"]
    }
    return focus_areas.get(phase, [])

def get_update_triggers(phase):
    """Get update triggers for each phase"""
    triggers = {
        "Pre-launch": ["New stakeholder questions", "Timeline changes", "Scope adjustments"],
        "Launch": ["Common support requests", "Training feedback", "Initial resistance points"],
        "Early Adoption": ["User feedback", "Adoption metrics", "Emerging challenges"],
        "Full Implementation": ["Performance data", "Process adjustments", "Compliance issues"],
        "Reinforcement": ["Long-term results", "Success stories", "Lessons learned"]
    }
    return triggers.get(phase, [])

def get_audience_emphasis(phase, audiences):
    """Get audience emphasis for each phase"""
    # Different emphasis by phase
    if phase == "Pre-launch":
        return [audience for audience in audiences if audience in ["Executives", "Managers", "Leaders"]]
    elif phase == "Launch":
        return audiences  # All audiences
    elif phase == "Early Adoption":
        return [audience for audience in audiences if audience in ["Employees", "End Users", "Frontline Staff"]]
    elif phase == "Full Implementation":
        return [audience for audience in audiences if audience in ["Managers", "Employees", "End Users"]]
    else:  # Reinforcement
        return audiences  # All audiences

def generate_format_suggestions(request):
    """Generate format suggestions for different channels"""
    channels = request.delivery_channels or ["Email", "Intranet", "Meetings", "Mobile App"]
    
    suggestions = {}
    
    for channel in channels:
        if channel == "Email":
            suggestions[channel] = {
                "format": "Concise Q&A with clickable sections",
                "recommended_length": "5-7 FAQs per email",
                "frequency": "Weekly during launch, bi-weekly after",
                "special_features": "Personalization based on role, 'Ask a Question' reply option"
            }
        elif channel == "Intranet":
            suggestions[channel] = {
                "format": "Searchable knowledge base with categories",
                "recommended_length": "Comprehensive - all FAQs",
                "frequency": "Real-time updates",
                "special_features": "Role-based views, popularity indicators, related questions"
            }
        elif channel == "Meetings":
            suggestions[channel] = {
                "format": "Discussion guide with key FAQs",
                "recommended_length": "3-5 FAQs per meeting",
                "frequency": "Weekly team meetings",
                "special_features": "Interactive polling, anonymous question submission"
            }
        elif channel == "Mobile App":
            suggestions[channel] = {
                "format": "Card-based swipeable interface",
                "recommended_length": "One FAQ per card, 10-15 cards",
                "frequency": "Push notifications for new content",
                "special_features": "Save favorites, offline access, notification preferences"
            }
        else:
            suggestions[channel] = {
                "format": "Standard Q&A format",
                "recommended_length": "10-15 FAQs",
                "frequency": "As needed",
                "special_features": "None"
            }
    
    return suggestions
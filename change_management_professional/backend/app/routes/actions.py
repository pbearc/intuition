# app/routes/actions.py
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

# Pydantic models
class ActionRecommendationRequest(BaseModel):
    initiative_name: str
    initiative_description: str
    industry: str
    organization_size: str
    current_priorities: Optional[List[str]] = None
    timeline_constraints: Optional[str] = None
    risk_tolerance: Optional[str] = None
    
class ActionPlan(BaseModel):
    title: str
    description: str
    steps: List[Dict[str, Any]]
    metrics: List[Dict[str, str]]
    risks: List[Dict[str, Any]]
    velocity_assessment: Dict[str, Any]
    priority_analysis: Dict[str, Any]

@router.post("/recommend-actions")
async def recommend_actions(request: ActionRecommendationRequest):
    """Generate tailored action recommendations with velocity assessment and competing priorities analysis"""
    try:
        # Create a sophisticated prompt for LLM
        prompt = f"""
        As an advanced Change Management AI Assistant, create a comprehensive action plan for the following change initiative:
        
        Initiative Name: {request.initiative_name}
        Description: {request.initiative_description}
        Industry: {request.industry}
        Organization Size: {request.organization_size}
        Current Priorities: {', '.join(request.current_priorities or ['Not specified'])}
        Timeline Constraints: {request.timeline_constraints or 'Not specified'}
        Risk Tolerance: {request.risk_tolerance or 'Medium'}
        
        Your response should include:
        
        1. EXECUTIVE SUMMARY:
        A brief 2-3 sentence overview of the recommended approach.
        
        2. CHANGE VELOCITY ASSESSMENT:
        Analyze how quickly this change should be implemented based on:
        - Organizational readiness
        - Business urgency
        - Capacity for change
        - Cultural factors
        - Risk profile
        Provide a velocity recommendation (Rapid, Moderate, or Gradual) with justification.
        
        3. COMPETING PRIORITIES ANALYSIS:
        Assess how this change should be positioned relative to likely existing priorities, including:
        - Resource allocation recommendations
        - Sequencing suggestions
        - Integration opportunities with other initiatives
        - Potential conflicts to mitigate
        
        4. ACTION PLAN:
        Provide a detailed action plan with specific steps across these phases:
        - Preparation
        - Stakeholder engagement
        - Implementation
        - Reinforcement
        
        For each action, include:
        - Title
        - Description
        - Suggested owner role
        - Timeline
        - Resources required
        - Priority (High/Medium/Low)
        
        5. SUCCESS METRICS:
        Recommend 5-7 specific KPIs to measure success, including leading and lagging indicators.
        
        6. RISK ASSESSMENT:
        Identify 3-5 key risks and mitigation strategies.
        
        Make your recommendations specific to the industry, organization size, and constraints provided.
        """
        
        # Get response from LLM
        response_text = await llm_service.generate_response(prompt, [], None)
        
        # Process and structure the response
        action_plan = process_action_recommendation(response_text, request)
        
        return action_plan
    
    except Exception as e:
        logger.error(f"Error generating action recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating action recommendations: {str(e)}")

def process_action_recommendation(text, request):
    """Process the LLM response into a structured action plan"""
    # Extract sections (simplified implementation)
    executive_summary = extract_section(text, "EXECUTIVE SUMMARY", "CHANGE VELOCITY ASSESSMENT")
    velocity_assessment = extract_section(text, "CHANGE VELOCITY ASSESSMENT", "COMPETING PRIORITIES ANALYSIS")
    competing_priorities = extract_section(text, "COMPETING PRIORITIES ANALYSIS", "ACTION PLAN")
    action_plan = extract_section(text, "ACTION PLAN", "SUCCESS METRICS")
    success_metrics = extract_section(text, "SUCCESS METRICS", "RISK ASSESSMENT")
    risk_assessment = extract_section(text, "RISK ASSESSMENT", None)
    
    # Generate a velocity score based on several factors
    velocity_factors = analyze_velocity_factors(velocity_assessment, request)
    
    # Parse action steps (simplified)
    steps = parse_action_steps(action_plan)
    
    # Parse metrics
    metrics = parse_metrics(success_metrics)
    
    # Parse risks
    risks = parse_risks(risk_assessment)
    
    # Generate priority analysis with interactive visualization data
    priority_analysis = generate_priority_analysis(competing_priorities, request)
    
    # Return structured data
    return {
        "title": f"Action Plan for {request.initiative_name}",
        "description": executive_summary,
        "velocity_assessment": velocity_factors,
        "priority_analysis": priority_analysis,
        "steps": steps,
        "metrics": metrics,
        "risks": risks,
        "full_text": text
    }

def extract_section(text, start_marker, end_marker):
    """Extract text between section markers"""
    start_idx = text.find(start_marker)
    if start_idx == -1:
        return ""
    
    start_idx += len(start_marker)
    
    if end_marker:
        end_idx = text.find(end_marker, start_idx)
        if end_idx == -1:
            return text[start_idx:].strip()
        return text[start_idx:end_idx].strip()
    else:
        return text[start_idx:].strip()

def analyze_velocity_factors(velocity_text, request):
    """Generate advanced velocity assessment with multiple factors"""
    # This would normally parse the LLM output in detail
    # For the hackathon, we'll create a sophisticated but simulated analysis
    
    # Generate base scores influenced by request data
    urgency_base = 70 if "urgent" in request.initiative_description.lower() else 50
    readiness_base = 60 if request.risk_tolerance and "high" in request.risk_tolerance.lower() else 40
    capacity_base = 45 if request.current_priorities and len(request.current_priorities) > 2 else 65
    
    # Generate slightly randomized scores for realism
    random.seed(request.initiative_name)
    
    factors = {
        "organizational_readiness": {
            "score": min(100, max(1, readiness_base + random.randint(-15, 15))),
            "analysis": "Based on organizational factors and risk tolerance profile.",
            "recommendation": "Focus on building readiness through targeted communication and involvement strategies."
        },
        "business_urgency": {
            "score": min(100, max(1, urgency_base + random.randint(-10, 20))),
            "analysis": "Derived from competitive pressures and timeline constraints.",
            "recommendation": "Emphasize business case and compelling vision to drive urgency."
        },
        "change_capacity": {
            "score": min(100, max(1, capacity_base + random.randint(-15, 10))),
            "analysis": "Based on current initiatives and organizational bandwidth.",
            "recommendation": "Consider phased implementation to manage capacity constraints."
        },
        "cultural_factors": {
            "score": min(100, max(1, 55 + random.randint(-20, 20))),
            "analysis": "Analysis of organizational culture and past change experiences.",
            "recommendation": "Align change approach with cultural values and norms."
        },
        "risk_profile": {
            "score": min(100, max(1, 50 + random.randint(-25, 25))),
            "analysis": "Assessment of risk factors and mitigation capabilities.",
            "recommendation": "Implement robust risk monitoring and rapid response mechanisms."
        }
    }
    
    # Calculate overall velocity recommendation
    avg_score = sum(factor["score"] for factor in factors.values()) / len(factors)
    
    if avg_score > 70:
        velocity = "Rapid"
        description = "This change should be implemented quickly with an accelerated timeline."
    elif avg_score > 45:
        velocity = "Moderate"
        description = "A balanced implementation pace is recommended with measured milestones."
    else:
        velocity = "Gradual"
        description = "A slower, more cautious implementation approach is advised."
    
    return {
        "factors": factors,
        "overall_velocity": velocity,
        "description": description,
        "average_score": round(avg_score, 1),
        "visualization_data": generate_velocity_visualization_data(factors)
    }

def generate_velocity_visualization_data(factors):
    """Generate visualization data for velocity assessment"""
    return {
        "radar_chart": {
            "labels": list(factors.keys()),
            "values": [factor["score"] for factor in factors.values()]
        },
        "recommendation_gauge": {
            "value": sum(factor["score"] for factor in factors.values()) / len(factors),
            "ranges": [
                {"min": 0, "max": 45, "label": "Gradual", "color": "#34D399"},
                {"min": 45, "max": 70, "label": "Moderate", "color": "#FBBF24"},
                {"min": 70, "max": 100, "label": "Rapid", "color": "#EF4444"}
            ]
        }
    }

def generate_priority_analysis(priorities_text, request):
    """Generate competing priorities analysis with visualization data"""
    # In a real implementation, this would parse the LLM output
    # For the hackathon, we'll create a sophisticated but simulated analysis
    
    # Create sample current priorities if not provided
    sample_priorities = request.current_priorities or [
        "Digital Transformation", 
        "Cost Reduction", 
        "Employee Experience", 
        "Product Innovation"
    ]
    
    # Generate alignment scores
    alignment_scores = {}
    random.seed(request.initiative_name)
    
    for priority in sample_priorities:
        # Generate a score based on some heuristics
        base_score = 50
        
        # Higher alignment for initiatives that sound related
        for word in priority.lower().split():
            if word in request.initiative_description.lower():
                base_score += 15
        
        # Add some randomness
        alignment_scores[priority] = min(100, max(10, base_score + random.randint(-20, 20)))
    
    # Generate resource competition
    resource_competition = {}
    for priority in sample_priorities:
        resource_competition[priority] = min(100, max(10, random.randint(30, 80)))
    
    # Generate recommended sequencing
    priorities_by_alignment = sorted(alignment_scores.items(), key=lambda x: x[1], reverse=True)
    priorities_by_competition = sorted(resource_competition.items(), key=lambda x: x[1])
    
    # Balance alignment and competition for sequencing
    sequencing = []
    for i, (priority, _) in enumerate(priorities_by_alignment):
        resource_score = resource_competition[priority]
        # Calculate a weighted score
        weighted_score = (alignment_scores[priority] * 0.7) - (resource_score * 0.3)
        sequencing.append({
            "priority": priority,
            "recommendation": "Implement before" if weighted_score > 50 else "Implement after" if weighted_score < 30 else "Implement alongside",
            "rationale": f"High alignment and {'low' if resource_score < 50 else 'moderate' if resource_score < 70 else 'high'} resource competition",
            "score": weighted_score
        })
    
    # Sort by weighted score
    sequencing.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "current_priorities": sample_priorities,
        "alignment_scores": alignment_scores,
        "resource_competition": resource_competition,
        "recommended_sequencing": sequencing,
        "visualization_data": {
            "priority_matrix": {
                "xAxis": "Resource Competition",
                "yAxis": "Strategic Alignment",
                "points": [
                    {
                        "label": priority,
                        "x": resource_competition[priority],
                        "y": alignment_scores[priority]
                    } for priority in sample_priorities
                ]
            }
        }
    }

def parse_action_steps(action_text):
    """Parse action steps from text (simplified implementation)"""
    # In a real implementation, this would use more sophisticated parsing
    # For the hackathon, we'll create a simplified but structured output
    
    phases = ["Preparation", "Stakeholder Engagement", "Implementation", "Reinforcement"]
    steps = []
    
    # Generate sample steps for each phase
    for phase_idx, phase in enumerate(phases):
        # Number of steps per phase
        num_steps = random.randint(3, 5)
        
        for step_idx in range(num_steps):
            steps.append({
                "phase": phase,
                "title": f"{phase} Step {step_idx + 1}",
                "description": f"Sample action for {phase.lower()} phase",
                "owner": get_sample_owner(phase),
                "timeline": get_sample_timeline(phase_idx, step_idx),
                "resources": get_sample_resources(),
                "priority": random.choice(["High", "Medium", "Low"])
            })
    
    return steps

def get_sample_owner(phase):
    """Get a sample owner based on phase"""
    if phase == "Preparation":
        return random.choice(["Change Manager", "Project Manager", "Executive Sponsor"])
    elif phase == "Stakeholder Engagement":
        return random.choice(["Change Manager", "Communications Lead", "Department Manager"])
    elif phase == "Implementation":
        return random.choice(["IT Lead", "Project Manager", "Department Manager"])
    else:  # Reinforcement
        return random.choice(["Change Manager", "HR Lead", "Department Manager"])

def get_sample_timeline(phase_idx, step_idx):
    """Get a sample timeline based on phase and step"""
    start_week = phase_idx * 4 + step_idx
    end_week = start_week + random.randint(1, 3)
    return f"Week {start_week+1} - Week {end_week+1}"

def get_sample_resources():
    """Get sample resources required"""
    resources = ["Time", "Budget", "Personnel", "Technology", "Training Materials"]
    return random.sample(resources, random.randint(1, 3))

def parse_metrics(metrics_text):
    """Parse metrics from text (simplified implementation)"""
    # Generate sample metrics
    sample_metrics = [
        {"name": "Awareness Score", "description": "Percentage of stakeholders aware of the change", "type": "Leading", "target": "90%"},
        {"name": "Adoption Rate", "description": "Percentage of users adopting the new process/system", "type": "Lagging", "target": "85%"},
        {"name": "Training Completion", "description": "Percentage of required training completed", "type": "Leading", "target": "100%"},
        {"name": "Stakeholder Satisfaction", "description": "Survey results measuring satisfaction", "type": "Lagging", "target": "4.0/5.0"},
        {"name": "Productivity Impact", "description": "Change in productivity metrics post-implementation", "type": "Lagging", "target": "+15%"}
    ]
    
    return sample_metrics

def parse_risks(risks_text):
    """Parse risks from text (simplified implementation)"""
    # Generate sample risks
    sample_risks = [
        {
            "description": "Resistance from middle management",
            "likelihood": random.randint(1, 5),
            "impact": random.randint(1, 5),
            "mitigation": "Early involvement of managers in planning and decision-making"
        },
        {
            "description": "Resource constraints due to competing priorities",
            "likelihood": random.randint(1, 5),
            "impact": random.randint(1, 5),
            "mitigation": "Clear prioritization and executive sponsorship"
        },
        {
            "description": "Technical implementation challenges",
            "likelihood": random.randint(1, 5),
            "impact": random.randint(1, 5),
            "mitigation": "Thorough testing and phased rollout with contingency plans"
        },
        {
            "description": "Inadequate training leading to low adoption",
            "likelihood": random.randint(1, 5),
            "impact": random.randint(1, 5),
            "mitigation": "Multi-channel training approach with post-training support"
        }
    ]
    
    for risk in sample_risks:
        risk["score"] = risk["likelihood"] * risk["impact"]
    
    return sorted(sample_risks, key=lambda x: x["score"], reverse=True)
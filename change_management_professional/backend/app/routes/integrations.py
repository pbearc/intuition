# app/routes/integrations.py
from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging
import json
from app.services.integration_service import IntegrationService

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter()
integration_service = IntegrationService()

# Models for integration requests
class JiraIntegrationRequest(BaseModel):
    jira_project_key: str
    initiative_data: Dict[str, Any]
    jira_base_url: Optional[str] = None
    jira_email: Optional[str] = None
    jira_api_token: Optional[str] = None

class GoogleCalendarRequest(BaseModel):
    initiative_data: Dict[str, Any]
    training_dates: List[Dict[str, str]]
    api_key: Optional[str] = None

class JiraProjectsRequest(BaseModel):
    jira_base_url: Optional[str] = None
    jira_email: Optional[str] = None
    jira_api_token: Optional[str] = None

# Jira integration endpoint
@router.post("/jira-integration")
async def create_jira_issues(request: JiraIntegrationRequest):
    """Create Jira issues for a change initiative"""
    try:
        logger.info(f"Creating Jira issues for project: {request.jira_project_key}")
        
        result = await integration_service.create_jira_change_initiative(
            request.jira_project_key,
            request.initiative_data
        )
        
        return result
    except Exception as e:
        logger.error(f"Error creating Jira issues: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating Jira issues: {str(e)}")
# Replace the calendar integration endpoint
@router.post("/calendar-integration")
async def create_calendar_events(request: GoogleCalendarRequest):
    """Create Google Calendar events for learning sessions"""
    try:
        logger.info(f"Creating Google Calendar events for initiative: {request.initiative_data.get('initiative_name', 'Unknown')}")
        
        result = await integration_service.create_google_calendar_events_with_api_key(
            request.initiative_data,
            request.training_dates,
            request.api_key
        )
        
        return result
    except Exception as e:
        logger.error(f"Error creating calendar events: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating calendar events: {str(e)}")

@router.post("/jira-projects")
async def get_jira_projects(request: JiraProjectsRequest):
    """Get projects from a Jira instance"""
    try:
        logger.info(f"Fetching Jira projects from base URL: {request.jira_base_url}")
        
        result = await integration_service.get_jira_projects(
            request.jira_base_url,
            request.jira_email,
            request.jira_api_token
        )
        
        return result
    except Exception as e:
        logger.error(f"Error getting Jira projects: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting Jira projects: {str(e)}")
        
# Endpoint to check available integrations
@router.get("/available-integrations")
async def get_available_integrations():
    """Get information about available integrations"""
    try:
        return {
            "integrations": [
                {
                    "id": "jira",
                    "name": "Jira",
                    "description": "Create Jira issues for your change initiative",
                    "status": "available",
                    "configuration_required": True
                },
                {
                    "id": "google_calendar",
                    "name": "Google Calendar",
                    "description": "Schedule learning sessions in Google Calendar",
                    "status": "available",
                    "configuration_required": True
                }
            ]
        }
    except Exception as e:
        logger.error(f"Error getting available integrations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting available integrations: {str(e)}")
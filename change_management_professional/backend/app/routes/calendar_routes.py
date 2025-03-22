# app/routes/calendar_routes.py
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import httpx
import os
import logging
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime

# Setup logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

router = APIRouter(prefix="/api/integrations/calendar", tags=["calendar"])

# Path to service account credentials file
CREDENTIALS_FILE = os.getenv("GOOGLE_CREDENTIALS_FILE", "service-account.json")
CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "primary")  # Use 'primary' for the default calendar

# Pydantic models
class CalendarSession(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: str  # ISO format
    end_date: str  # ISO format
    location: Optional[str] = None

class CalendarRequest(BaseModel):
    initiative_data: dict
    sessions: List[CalendarSession]

class CalendarEvent(BaseModel):
    id: str
    title: str
    date: str
    time: Optional[str] = None
    formatted_date: Optional[str] = None
    formatted_time: Optional[str] = None
    link: Optional[str] = None

class CalendarResponse(BaseModel):
    success: bool
    events: List[CalendarEvent]

@router.post("/create-events", response_model=CalendarResponse)
async def create_calendar_events(request: CalendarRequest):
    """Create Google Calendar events for training sessions"""
    try:
        logger.info(f"Creating {len(request.sessions)} calendar events")
        
        # Check if credentials file exists
        if not os.path.exists(CREDENTIALS_FILE):
            logger.error(f"Credentials file not found: {CREDENTIALS_FILE}")
            raise HTTPException(
                status_code=500,
                detail="Google Calendar credentials not configured"
            )
        
        # Create calendar service
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_FILE,
            scopes=['https://www.googleapis.com/auth/calendar']
        )
        
        calendar_service = build('calendar', 'v3', credentials=credentials)
        
        created_events = []
        
        for session in request.sessions:
            event_body = {
                'summary': session.title,
                'description': session.description or f"Training session for {request.initiative_data.get('initiative_name', 'technology change')}",
                'start': {
                    'dateTime': session.start_date,
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': session.end_date,
                    'timeZone': 'UTC',
                },
                'location': session.location,
            }
            
            try:
                event = calendar_service.events().insert(
                    calendarId=CALENDAR_ID,
                    body=event_body
                ).execute()
                
                # Parse dates for formatted output
                start_dt = datetime.fromisoformat(session.start_date.replace('Z', '+00:00'))
                
                created_events.append(CalendarEvent(
                    id=event['id'],
                    title=session.title,
                    date=session.start_date,
                    formatted_date=start_dt.strftime('%B %d, %Y'),
                    formatted_time=start_dt.strftime('%I:%M %p'),
                    link=event.get('htmlLink')
                ))
                
                logger.info(f"Created calendar event: {event['id']}")
                
            except Exception as e:
                logger.error(f"Error creating event {session.title}: {str(e)}")
                # Continue with other sessions
        
        return CalendarResponse(
            success=True,
            events=created_events
        )
        
    except Exception as e:
        logger.exception(f"Error creating calendar events: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create calendar events: {str(e)}"
        )

@router.get("/diagnostic")
async def calendar_diagnostic():
    """Check Google Calendar configuration"""
    return {
        "configuration": {
            "credentials_file": CREDENTIALS_FILE,
            "credentials_file_exists": os.path.exists(CREDENTIALS_FILE),
            "calendar_id": CALENDAR_ID
        }
    }
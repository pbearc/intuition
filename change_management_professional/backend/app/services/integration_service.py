# app/services/integration_service.py
import logging
import os
import json
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from base64 import b64encode
import google.oauth2.credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configure logger
logger = logging.getLogger(__name__)

class IntegrationService:
    """Service for handling integrations with external systems like Jira and Google Calendar"""
    
    def __init__(self):
        """Initialize the integration service"""
        self.jira_base_url = os.getenv("JIRA_BASE_URL", "")
        self.jira_api_token = os.getenv("JIRA_API_TOKEN", "")
        self.jira_email = os.getenv("JIRA_EMAIL", "")
        logger.info("Integration service initialized")
    async def get_jira_projects(
        self,
        jira_base_url: str = None,
        jira_email: str = None,
        jira_api_token: str = None
    ) -> Dict[str, Any]:
        """
        Get Jira projects for a specific instance
        
        Args:
            jira_base_url: Jira base URL
            jira_email: Jira email
            jira_api_token: Jira API token
                
        Returns:
            Dictionary with projects information
        """
        try:
            # Use provided values or default to instance variables
            base_url = jira_base_url or self.jira_base_url
            headers = self._get_jira_auth_headers(jira_email, jira_api_token)
            
            # If we're in development/testing mode with no real Jira credentials
            if not base_url or ":" not in headers.get("Authorization", ""):
                logger.warning("Using mock mode for Jira projects")
                return {
                    "projects": [
                        {"key": "CHAN", "name": "Change Management"},
                        {"key": "BHY", "name": "BhanYu Jira Project"}
                    ]
                }
            
            # Get projects from Jira API
            try:
                response = requests.get(
                    f"{base_url}/rest/api/2/project",
                    headers=headers
                )
                
                if response.status_code >= 400:
                    logger.error(f"Error fetching Jira projects: {response.text}")
                    return {"error": f"Failed to fetch Jira projects: {response.status_code}", "projects": []}
                
                # Process response
                projects_data = response.json()
                projects = []
                
                for project in projects_data:
                    projects.append({
                        "key": project.get("key", ""),
                        "name": project.get("name", "")
                    })
                
                return {"projects": projects}
                    
            except Exception as e:
                logger.error(f"Error in Jira projects request: {str(e)}")
                return {"error": str(e), "projects": []}
                
        except Exception as e:
            logger.error(f"Error fetching Jira projects: {str(e)}")
            # Return mock response in case of error
            return {
                "projects": [
                    {"key": "CHAN", "name": "Change Management"},
                    {"key": "BHY", "name": "BhanYu Jira Project"}
                ]
            }
    def _get_jira_auth_headers(self, jira_email: str = None, jira_api_token: str = None):
        """
        Get authentication headers for Jira API
        
        Args:
            jira_email: Optional email for Jira authentication
            jira_api_token: Optional API token for Jira authentication
            
        Returns:
            Headers dictionary for Jira API authentication
        """
        email = jira_email or self.jira_email
        token = jira_api_token or self.jira_api_token
        
        if not email or not token:
            logger.warning("Jira credentials not properly configured")
            return {"Content-Type": "application/json"}
            
        auth_str = f"{email}:{token}"
        auth_bytes = auth_str.encode('ascii')
        base64_bytes = b64encode(auth_bytes)
        base64_auth = base64_bytes.decode('ascii')
        
        return {
            "Authorization": f"Basic {base64_auth}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    async def create_jira_change_initiative(self, jira_project_key: str, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"Attempting to create Jira issue in project: {jira_project_key}")
        logger.info(f"Using Jira base URL: {self.jira_base_url}")
        logger.info(f"Using Jira email: {self.jira_email}")
        
        try:
            # Use environment variables for Jira credentials
            base_url = self.jira_base_url
            headers = self._get_jira_auth_headers()
            
            # If no credentials, use mock mode
            if not base_url or ":" not in headers.get("Authorization", ""):
                logger.warning(f"Using mock mode - no valid credentials. Authorization header: {headers.get('Authorization', '')[:10]}...")
                return self._mock_jira_integration(jira_project_key, initiative_data)
            
            # Create main issue for the initiative
            initiative_name = initiative_data.get("initiative_name", "Change Initiative")
            initiative_description = initiative_data.get("initiative_description", "")
            
            # Create the main issue
            issue_data = {
                "fields": {
                    "project": {"key": jira_project_key},
                    "summary": f"Change Initiative: {initiative_name}",
                    "description": initiative_description,
                    "issuetype": {"name": "Task"}  # Using Task as most projects have this type
                }
            }
            
            logger.info(f"Sending request to Jira: {json.dumps(issue_data)}")
            
            issue_response = requests.post(
                f"{base_url}/rest/api/2/issue",
                headers=headers,
                data=json.dumps(issue_data)
            )
            
            logger.info(f"Jira response status: {issue_response.status_code}")
            logger.info(f"Jira response: {issue_response.text[:500]}")
            
            if issue_response.status_code >= 400:
                logger.error(f"Error creating Jira issue: {issue_response.text}")
                return {"error": f"Failed to create Jira issue: {issue_response.status_code}", "mock": True}

            issue_key = issue_response.json().get("key")
            
            # Return success response
            return {
                "success": True,
                "project_key": jira_project_key,
                "initiative_name": initiative_name,
                "jira_base_url": base_url,
                "created_items": [
                    {
                        "key": issue_key,
                        "type": "Task",
                        "summary": f"Change Initiative: {initiative_name}"
                    }
                ],
                "main_issue_key": issue_key
            }
                
        except Exception as e:
            logger.error(f"Error in Jira integration: {str(e)}")
            # Return mock response in case of error
            return self._mock_jira_integration(jira_project_key, initiative_data)
    def _mock_jira_integration(self, jira_project_key: str, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a mock Jira integration response
        
        Args:
            jira_project_key: Jira project key
            initiative_data: Change initiative data
            
        Returns:
            Dictionary with simulated Jira issues
        """
        initiative_name = initiative_data.get("initiative_name", "Change Initiative")
        
        # Mock epic
        epic_key = f"{jira_project_key}-1"
        jira_items = [{
            "key": epic_key,
            "type": "epic",
            "summary": f"Change Initiative: {initiative_name}",
            "status": "To Do"
        }]
        
        # Mock stories for different phases
        phases = ["Planning", "Preparation", "Implementation", "Reinforcement"]
        for i, phase in enumerate(phases, 2):
            jira_items.append({
                "key": f"{jira_project_key}-{i}",
                "type": "story",
                "summary": f"{phase} Phase for {initiative_name}",
                "status": "To Do",
                "epic_link": epic_key
            })
        
        return {
            "success": True,
            "project_key": jira_project_key,
            "initiative_name": initiative_name,
            "jira_base_url": "https://your-instance.atlassian.net",
            "mock": True,
            "created_items": jira_items,
            "epic_key": epic_key
        }
    
    # Update to app/services/integration_service.py

    # Add this method to the IntegrationService class
    async def create_google_calendar_events_with_api_key(
        self,
        initiative_data: Dict[str, Any],
        training_dates: List[Dict[str, str]],
        api_key: str = None
    ) -> Dict[str, Any]:
        """
        Create Google Calendar events for learning sessions using API key
        
        Args:
            initiative_data: Change initiative data
            training_dates: List of training dates with start and end times
            api_key: Google Calendar API key
                
        Returns:
            Dictionary with created events information
        """
        try:
            # Use provided API key or default from environment
            calendar_api_key = api_key or os.getenv("GOOGLE_CALENDAR_API_KEY", "")
            
            if not calendar_api_key:
                logger.warning("No Google Calendar API key provided, using mock mode")
                return self._mock_calendar_integration(initiative_data)
            
            # Build calendar service with API key
            from googleapiclient.discovery import build
            
            service = build('calendar', 'v3', developerKey=calendar_api_key)
            
            # Create calendar events
            initiative_name = initiative_data.get("initiative_name", "Change Initiative")
            created_events = []
            
            # We can only insert events into calendars we have permission for
            # with an API key, so instead of creating actual events,
            # we'll generate shareable event links
            for i, session in enumerate(training_dates):
                # Format dates for URL
                start_date = session.get("start_date", "")
                end_date = session.get("end_date", "")
                
                if not start_date or not end_date:
                    continue
                    
                # Parse dates to proper format
                from urllib.parse import quote
                from datetime import datetime
                
                # Parse start and end dates
                try:
                    start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                    end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                    
                    # Format for Google Calendar URL
                    start_str = start_dt.strftime("%Y%m%dT%H%M%S")
                    end_str = end_dt.strftime("%Y%m%dT%H%M%S")
                    
                    # Create event details
                    session_title = session.get("title", f"{initiative_name} - Training Session {i+1}")
                    session_description = session.get("description", f"Training session for the {initiative_name} change initiative.")
                    session_location = session.get("location", "Virtual Meeting")
                    
                    # Generate the Google Calendar link
                    base_url = "https://calendar.google.com/calendar/render"
                    params = {
                        'action': 'TEMPLATE',
                        'text': session_title,
                        'details': session_description,
                        'location': session_location,
                        'dates': f"{start_str}/{end_str}"
                    }
                    
                    # Build query string
                    query_string = "&".join([f"{k}={quote(v)}" for k, v in params.items()])
                    calendar_link = f"{base_url}?{query_string}"
                    
                    created_events.append({
                        'id': f"session_{i+1}",
                        'title': session_title,
                        'description': session_description,
                        'start_date': start_date,
                        'end_date': end_date,
                        'formatted_date': start_dt.strftime("%Y-%m-%d"),
                        'formatted_time': f"{start_dt.strftime('%I:%M %p')} - {end_dt.strftime('%I:%M %p')}",
                        'link': calendar_link
                    })
                except Exception as e:
                    logger.error(f"Error formatting calendar date: {str(e)}")
                    # Continue to next session
            
            return {
                'success': True,
                'initiative_name': initiative_name,
                'events': created_events,
                'add_to_calendar_links': True
            }
                
        except Exception as e:
            logger.error(f"Error in Google Calendar integration: {str(e)}")
            # Return mock response in case of error
            return self._mock_calendar_integration(initiative_data)
    
    async def create_google_calendar_events(
        self,
        calendar_id: str,
        initiative_data: Dict[str, Any],
        credentials_json: str
    ) -> Dict[str, Any]:
        """
        Create Google Calendar events for learning sessions
        
        Args:
            calendar_id: Google Calendar ID
            initiative_data: Change initiative data
            credentials_json: Google OAuth credentials JSON
            
        Returns:
            Dictionary with created events
        """
        try:
            # If credentials are not provided, use mock mode
            if not credentials_json or not calendar_id:
                logger.warning("Using mock mode for Google Calendar integration")
                return self._mock_calendar_integration(initiative_data)
                
            # Parse credentials
            credentials_dict = json.loads(credentials_json)
            credentials = google.oauth2.credentials.Credentials(**credentials_dict)
            
            # Build calendar service
            service = build('calendar', 'v3', credentials=credentials)
            
            # Create calendar events
            initiative_name = initiative_data.get("initiative_name", "Change Initiative")
            events = []
            
            # Create training session events
            start_date = datetime.now() + timedelta(days=7)  # Start in one week
            for i in range(3):  # Create 3 training sessions
                session_date = start_date + timedelta(days=i*2)  # Every other day
                event = {
                    'summary': f"{initiative_name} - Training Session {i+1}",
                    'description': f"Training session for the {initiative_name} change initiative.",
                    'start': {
                        'dateTime': session_date.strftime("%Y-%m-%dT10:00:00"),
                        'timeZone': 'UTC',
                    },
                    'end': {
                        'dateTime': session_date.strftime("%Y-%m-%dT11:30:00"),
                        'timeZone': 'UTC',
                    },
                    'attendees': [],
                    'reminders': {
                        'useDefault': False,
                        'overrides': [
                            {'method': 'email', 'minutes': 24 * 60},
                            {'method': 'popup', 'minutes': 30},
                        ],
                    },
                }
                
                created_event = service.events().insert(calendarId=calendar_id, body=event).execute()
                events.append({
                    'id': created_event['id'],
                    'summary': created_event['summary'],
                    'link': created_event['htmlLink']
                })
            
            return {
                'success': True,
                'calendar_id': calendar_id,
                'initiative_name': initiative_name,
                'events': events
            }
                
        except Exception as e:
            logger.error(f"Error in Google Calendar integration: {str(e)}")
            # Return mock response in case of error
            return self._mock_calendar_integration(initiative_data)
    
    def _mock_calendar_integration(self, initiative_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a mock Google Calendar integration response
        
        Args:
            initiative_data: Change initiative data
            
        Returns:
            Dictionary with simulated calendar events
        """
        initiative_name = initiative_data.get("initiative_name", "Change Initiative")
        
        # Create mock events
        events = []
        start_date = datetime.now() + timedelta(days=7)  # Start in one week
        
        for i in range(3):  # Create 3 training sessions
            session_date = start_date + timedelta(days=i*2)  # Every other day
            events.append({
                'id': f"event_{i+1}",
                'summary': f"{initiative_name} - Training Session {i+1}",
                'date': session_date.strftime("%Y-%m-%d"),
                'time': "10:00 AM - 11:30 AM",
                'link': "https://calendar.google.com/calendar/event?eid=example"
            })
        
        return {
            'success': True,
            'mock': True,
            'calendar_id': "primary",
            'initiative_name': initiative_name,
            'events': events
        }
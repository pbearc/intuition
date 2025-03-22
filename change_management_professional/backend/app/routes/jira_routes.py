# app/routes/jira_routes.py
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import httpx
import os
import base64
import json
import logging

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Set to DEBUG for detailed logs

# Get Jira credentials from environment
JIRA_BASE_URL = os.getenv("JIRA_BASE_URL", "")
JIRA_EMAIL = os.getenv("JIRA_EMAIL", "")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN", "")

# Ensure JIRA_API_URL is properly formatted
if JIRA_BASE_URL and not JIRA_BASE_URL.endswith("/"):
    JIRA_BASE_URL += "/"
JIRA_API_URL = f"{JIRA_BASE_URL}rest/api/3" if JIRA_BASE_URL else ""

# Log configuration for debugging
logger.debug(f"JIRA_BASE_URL: {JIRA_BASE_URL}")
logger.debug(f"JIRA_API_URL: {JIRA_API_URL}")
logger.debug(f"JIRA_EMAIL: {JIRA_EMAIL}")
logger.debug(f"JIRA_API_TOKEN exists: {bool(JIRA_API_TOKEN)}")

# Create basic auth token
if JIRA_EMAIL and JIRA_API_TOKEN:
    jira_auth = base64.b64encode(f"{JIRA_EMAIL}:{JIRA_API_TOKEN}".encode()).decode()
else:
    jira_auth = ""
    logger.error("Jira credentials not properly configured!")

router = APIRouter(prefix="/api/integrations/jira", tags=["jira"])

# Pydantic models
class JiraProject(BaseModel):
    id: str
    key: str
    name: str
    description: Optional[str] = None

class JiraProjectsResponse(BaseModel):
    projects: List[JiraProject]

class JiraIssueRequest(BaseModel):
    project_key: str
    initiative_name: str
    initiative_description: Optional[str] = None
    departments: Optional[str] = None
    training_link: Optional[str] = None
    created_by: Optional[str] = None
    created_date: Optional[str] = None

class JiraItem(BaseModel):
    key: str
    id: str
    type: str
    summary: Optional[str] = None

class JiraIssueResponse(BaseModel):
    success: bool
    project_key: str
    epic: JiraItem
    created_items: List[JiraItem]

# This function in your jira_routes.py needs improvement
# Replace the create_jira_issues function with this enhanced version

@router.get("/projects", response_model=JiraProjectsResponse)
async def get_jira_projects():
    """Get all available Jira projects"""
    try:
        # Verify configuration
        if not JIRA_API_URL or not jira_auth:
            logger.error("Jira is not properly configured")
            raise HTTPException(
                status_code=500, 
                detail="Jira integration is not properly configured. Please check your environment variables."
            )
            
        logger.info("Fetching Jira projects")
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{JIRA_API_URL}/project",
                headers={
                    "Authorization": f"Basic {jira_auth}",
                    "Accept": "application/json"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch Jira projects: {response.text}")
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Failed to fetch Jira projects: {response.text}"
                )
            
            projects_data = response.json()
            logger.info(f"Successfully fetched {len(projects_data)} Jira projects")
            
            # Format the projects data
            projects = [
                JiraProject(
                    id=project["id"],
                    key=project["key"],
                    name=project["name"],
                    description=project.get("description", "")
                ) 
                for project in projects_data
            ]
            
            return JiraProjectsResponse(projects=projects)
            
    except httpx.RequestError as exc:
        logger.exception(f"Network error occurred: {str(exc)}")
        raise HTTPException(status_code=500, detail=f"Network error occurred: {str(exc)}")
    
@router.post("/create-issues", response_model=JiraIssueResponse)
async def create_jira_issues(request: JiraIssueRequest):
    """Create Jira issues for a technology change initiative"""
    # Verify configuration
    if not JIRA_API_URL or not jira_auth:
        logger.error("Jira is not properly configured")
        raise HTTPException(
            status_code=500, 
            detail="Jira integration is not properly configured. Please check your environment variables."
        )
    
    try:
        # Validate required fields
        if not request.project_key or not request.initiative_name:
            raise HTTPException(status_code=400, detail="Project key and initiative name are required")
        
        logger.info(f"Creating Jira issues for initiative '{request.initiative_name}' in project '{request.project_key}'")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            # 1. First, check if we can access the project and get available issue types
            try:
                logger.debug(f"Checking project {request.project_key} and available issue types")
                project_response = await client.get(
                    f"{JIRA_API_URL}/project/{request.project_key}",
                    headers={
                        "Authorization": f"Basic {jira_auth}",
                        "Accept": "application/json"
                    }
                )
                
                if project_response.status_code != 200:
                    logger.error(f"Failed to access project: {project_response.text}")
                    raise HTTPException(
                        status_code=project_response.status_code,
                        detail=f"Failed to access project {request.project_key}: {project_response.text}"
                    )
                
                # Get available issue types for this project
                meta_response = await client.get(
                    f"{JIRA_API_URL}/issue/createmeta?projectKeys={request.project_key}&expand=projects.issuetypes",
                    headers={
                        "Authorization": f"Basic {jira_auth}",
                        "Accept": "application/json"
                    }
                )
                
                if meta_response.status_code != 200:
                    logger.error(f"Failed to get project metadata: {meta_response.text}")
                    raise HTTPException(
                        status_code=meta_response.status_code,
                        detail=f"Failed to get project metadata: {meta_response.text}"
                    )
                
                meta_data = meta_response.json()
                
                # Find Epic and Task issue types
                issue_types = {}
                if meta_data.get("projects") and len(meta_data["projects"]) > 0:
                    available_types = meta_data["projects"][0].get("issuetypes", [])
                    for issue_type in available_types:
                        issue_types[issue_type["name"]] = issue_type["id"]
                
                logger.debug(f"Available issue types: {issue_types}")
                
                # Check if Epic and Task types are available
                epic_type = None
                task_type = None
                
                # Try to find Epic type - look for exact match first, then case-insensitive
                if "Epic" in issue_types:
                    epic_type = {"id": issue_types["Epic"], "name": "Epic"}
                else:
                    # Try case-insensitive match or alternatives
                    for name, type_id in issue_types.items():
                        if "epic" in name.lower():
                            epic_type = {"id": type_id, "name": name}
                            break
                
                # If still no Epic type, try to use Story or another type as fallback
                if not epic_type:
                    for fallback in ["Story", "Task", "Initiative"]:
                        if fallback in issue_types:
                            logger.warning(f"Epic type not found, using {fallback} as fallback")
                            epic_type = {"id": issue_types[fallback], "name": fallback}
                            break
                
                # Try to find Task type - look for exact match first, then case-insensitive
                if "Task" in issue_types:
                    task_type = {"id": issue_types["Task"], "name": "Task"}
                else:
                    # Try case-insensitive match or alternatives
                    for name, type_id in issue_types.items():
                        if "task" in name.lower():
                            task_type = {"id": type_id, "name": name}
                            break
                
                # If still no Task type, try to use Story or another type as fallback
                if not task_type:
                    for fallback in ["Story", "Sub-task", "Subtask"]:
                        if fallback in issue_types:
                            logger.warning(f"Task type not found, using {fallback} as fallback")
                            task_type = {"id": issue_types[fallback], "name": fallback}
                            break
                
                if not epic_type:
                    logger.error("No suitable Epic or equivalent issue type found")
                    raise HTTPException(
                        status_code=400,
                        detail=f"No suitable Epic or equivalent issue type found for project {request.project_key}"
                    )
                
                if not task_type:
                    logger.error("No suitable Task or equivalent issue type found")
                    raise HTTPException(
                        status_code=400,
                        detail=f"No suitable Task or equivalent issue type found for project {request.project_key}"
                    )
                
                logger.info(f"Using issue types - Epic: {epic_type['name']}, Task: {task_type['name']}")
                
            except httpx.RequestError as e:
                logger.exception(f"Error checking project metadata: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error checking project metadata: {str(e)}"
                )
            
            # 2. Create the main Epic
            logger.info("Creating Epic for technology change")
            epic_payload = {
                "fields": {
                    "project": {
                        "key": request.project_key
                    },
                    "summary": f"Technology Change: {request.initiative_name}",
                    "description": {
                        "type": "doc",
                        "version": 1,
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": request.initiative_description or 'Technology change initiative'
                                    }
                                ]
                            }
                        ]
                    },
                    "issuetype": {
                        "id": epic_type["id"],
                        "name": epic_type["name"]
                    },
                    "labels": ["technology-change", "change-management"]
                }
            }
            
            # If there are departments, add them to the description
            if request.departments:
                epic_payload["fields"]["description"]["content"].append({
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Affected departments: {request.departments}"
                        }
                    ]
                })
            
            # If there's a training link, add it to the description
            if request.training_link:
                epic_payload["fields"]["description"]["content"].append({
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Training link: {request.training_link}"
                        }
                    ]
                })
            
            # Log the request payload for debugging
            logger.debug(f"Epic payload: {json.dumps(epic_payload, indent=2)}")
            
            epic_response = await client.post(
                f"{JIRA_API_URL}/issue",
                headers={
                    "Authorization": f"Basic {jira_auth}",
                    "Content-Type": "application/json"
                },
                json=epic_payload
            )
            
            # Log the response for debugging
            logger.debug(f"Epic creation response status: {epic_response.status_code}")
            if epic_response.status_code not in (200, 201):
                logger.error(f"Failed to create Epic: {epic_response.text}")
                raise HTTPException(
                    status_code=epic_response.status_code,
                    detail=f"Failed to create Epic in Jira: {epic_response.text}"
                )
            
            epic_data = epic_response.json()
            epic_key = epic_data["key"]
            epic_id = epic_data["id"]
            logger.info(f"Successfully created Epic with key: {epic_key}")
            
            # 3. Try to find the correct Epic link field
            epic_link_fields = await find_epic_link_field(client, epic_key)
            
            if not epic_link_fields:
                logger.warning("Could not determine Epic link field, tasks will not be linked to Epic")
            else:
                logger.info(f"Found Epic link fields: {epic_link_fields}")
            
            # 4. Create standard tasks for the technology change process
            tasks = [
                {
                    "name": "Initial Impact Assessment",
                    "description": "Evaluate the impact of the technology change across departments"
                },
                {
                    "name": "Stakeholder Communication Plan",
                    "description": "Develop communication strategies for all affected stakeholders"
                },
                {
                    "name": "Training Development",
                    "description": "Create training materials for the new technology"
                },
                {
                    "name": "Resistance Management",
                    "description": "Identify potential resistance and create mitigation plans"
                },
                {
                    "name": "Go-Live Planning",
                    "description": "Prepare for the technology rollout"
                }
            ]
            
            # Create all tasks and link them to the Epic
            created_tasks = []
            
            for task in tasks:
                task_payload = {
                    "fields": {
                        "project": {
                            "key": request.project_key
                        },
                        "summary": task["name"],
                        "description": {
                            "type": "doc",
                            "version": 1,
                            "content": [
                                {
                                    "type": "paragraph",
                                    "content": [
                                        {
                                            "type": "text",
                                            "text": task["description"]
                                        }
                                    ]
                                }
                            ]
                        },
                        "issuetype": {
                            "id": task_type["id"],
                            "name": task_type["name"]
                        }
                    }
                }
                
                # Add Epic link if we found it
                if epic_link_fields:
                    for field_id in epic_link_fields:
                        task_payload["fields"][field_id] = epic_key
                
                logger.debug(f"Creating task: {task['name']}")
                task_response = await client.post(
                    f"{JIRA_API_URL}/issue",
                    headers={
                        "Authorization": f"Basic {jira_auth}",
                        "Content-Type": "application/json"
                    },
                    json=task_payload
                )
                
                if task_response.status_code not in (200, 201):
                    # Log the error but continue with other tasks
                    logger.warning(f"Failed to create task {task['name']}: {task_response.text}")
                    continue
                
                task_data = task_response.json()
                created_tasks.append({
                    "key": task_data["key"],
                    "id": task_data["id"],
                    "type": task_type["name"],
                    "summary": task["name"]
                })
                logger.debug(f"Successfully created task with key: {task_data['key']}")
            
            # Return the created issues
            logger.info(f"Created {len(created_tasks)} tasks for Epic {epic_key}")
            return JiraIssueResponse(
                success=True,
                project_key=request.project_key,
                epic=JiraItem(
                    key=epic_key,
                    id=epic_id,
                    type=epic_type["name"],
                    summary=f"Technology Change: {request.initiative_name}"
                ),
                created_items=[
                    JiraItem(
                        key=epic_key,
                        id=epic_id,
                        type=epic_type["name"],
                        summary=f"Technology Change: {request.initiative_name}"
                    ),
                    *[JiraItem(**task) for task in created_tasks]
                ]
            )
            
    except httpx.RequestError as exc:
        logger.exception(f"Network error while connecting to Jira: {str(exc)}")
        raise HTTPException(status_code=500, detail=f"Network error occurred: {str(exc)}")
    except Exception as exc:
        logger.exception(f"Unexpected error: {str(exc)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(exc)}")

# Helper function to find Epic link field
async def find_epic_link_field(client, issue_key=None):
    """Try to find the Epic link field ID"""
    potential_fields = []
    
    try:
        # First approach: Get all fields and look for Epic link fields
        fields_response = await client.get(
            f"{JIRA_API_URL}/field",
            headers={
                "Authorization": f"Basic {jira_auth}",
                "Accept": "application/json"
            }
        )
        
        if fields_response.status_code == 200:
            fields = fields_response.json()
            
            # Look for fields with 'epic' in the name
            for field in fields:
                if 'epic' in field.get('name', '').lower() and 'link' in field.get('name', '').lower():
                    potential_fields.append(field['id'])
        
        # If we have an issue key, try to examine it
        if issue_key and not potential_fields:
            issue_response = await client.get(
                f"{JIRA_API_URL}/issue/{issue_key}?expand=names,schema",
                headers={
                    "Authorization": f"Basic {jira_auth}",
                    "Accept": "application/json"
                }
            )
            
            if issue_response.status_code == 200:
                issue_data = issue_response.json()
                
                # Look for fields with 'epic' in the name
                for field_id, field_name in issue_data.get('names', {}).items():
                    if 'epic' in field_name.lower() and ('link' in field_name.lower() or 'parent' in field_name.lower()):
                        potential_fields.append(field_id)
        
        # If still no fields found, use common customfield IDs as fallback
        if not potential_fields:
            # Common Epic link field IDs across different Jira instances
            common_fields = ["customfield_10014", "customfield_10008", "customfield_10000"]
            potential_fields = common_fields
        
        return potential_fields
        
    except Exception as e:
        logger.error(f"Error finding Epic link field: {str(e)}")
        # Return common Epic link fields as fallback
        return ["customfield_10014"]
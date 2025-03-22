#!/usr/bin/env python3
"""
This script tests Jira ticket creation directly to help debug any issues.
Run this script to verify your Jira credentials can create tickets.
"""

import os
import sys
import httpx
import base64
import asyncio
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Jira configuration
JIRA_BASE_URL = os.getenv("JIRA_BASE_URL", "")
JIRA_EMAIL = os.getenv("JIRA_EMAIL", "")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN", "")

# Ensure JIRA_API_URL is properly formatted
if JIRA_BASE_URL and not JIRA_BASE_URL.endswith("/"):
    JIRA_BASE_URL += "/"
JIRA_API_URL = f"{JIRA_BASE_URL}rest/api/3" if JIRA_BASE_URL else ""

# Create basic auth token
if JIRA_EMAIL and JIRA_API_TOKEN:
    jira_auth = base64.b64encode(f"{JIRA_EMAIL}:{JIRA_API_TOKEN}".encode()).decode()
else:
    jira_auth = ""

async def test_jira_ticket_creation():
    """Test creating a Jira ticket"""
    print("\n=== JIRA TICKET CREATION TEST ===\n")
    
    # Check configuration
    print("Configuration:")
    print(f"  JIRA_BASE_URL: {JIRA_BASE_URL}")
    print(f"  JIRA_API_URL: {JIRA_API_URL}")
    print(f"  JIRA_EMAIL: {JIRA_EMAIL}")
    print(f"  JIRA_API_TOKEN: {'*****' if JIRA_API_TOKEN else 'Not set'}")
    print("")
    
    if not JIRA_API_URL or not jira_auth:
        print("❌ ERROR: Jira is not properly configured. Please check your environment variables.")
        return False
    
    # Ask for project key
    project_key = input("Enter Jira project key (e.g., PROJ): ").strip().upper()
    if not project_key:
        print("❌ ERROR: Project key is required.")
        return False
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. First check if we can access the project
        print(f"\nChecking project {project_key}...")
        try:
            project_response = await client.get(
                f"{JIRA_API_URL}/project/{project_key}",
                headers={
                    "Authorization": f"Basic {jira_auth}",
                    "Accept": "application/json"
                }
            )
            
            if project_response.status_code != 200:
                print(f"❌ ERROR: Failed to access project: {project_response.text}")
                return False
            
            project_data = project_response.json()
            print(f"✅ Project found: {project_data.get('name', project_key)}")
            
            # 2. Check available issue types
            print("\nChecking available issue types...")
            meta_response = await client.get(
                f"{JIRA_API_URL}/issue/createmeta?projectKeys={project_key}&expand=projects.issuetypes",
                headers={
                    "Authorization": f"Basic {jira_auth}",
                    "Accept": "application/json"
                }
            )
            
            if meta_response.status_code != 200:
                print(f"❌ ERROR: Failed to get project metadata: {meta_response.text}")
                return False
            
            meta_data = meta_response.json()
            
            issue_types = {}
            if meta_data.get("projects") and len(meta_data["projects"]) > 0:
                available_types = meta_data["projects"][0].get("issuetypes", [])
                print("\nAvailable issue types:")
                for issue_type in available_types:
                    issue_types[issue_type["name"]] = issue_type["id"]
                    print(f"  - {issue_type['name']} (ID: {issue_type['id']})")
            
            # Find suitable issue type for test
            test_type = None
            for preferred in ["Task", "Story", "Bug"]:
                if preferred in issue_types:
                    test_type = {"name": preferred, "id": issue_types[preferred]}
                    break
            
            if not test_type and issue_types:
                # Just use the first available type
                name = list(issue_types.keys())[0]
                test_type = {"name": name, "id": issue_types[name]}
            
            if not test_type:
                print("❌ ERROR: No issue types found for this project.")
                return False
            
            print(f"\nUsing issue type '{test_type['name']}' for test")
            
            # 3. Create a test ticket
            print("\nCreating test ticket...")
            
            test_payload = {
                "fields": {
                    "project": {
                        "key": project_key
                    },
                    "summary": "Test Ticket - Please Delete",
                    "description": {
                        "type": "doc",
                        "version": 1,
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": "This is a test ticket created to verify Jira API access. Please delete."
                                    }
                                ]
                            }
                        ]
                    },
                    "issuetype": {
                        "id": test_type["id"]
                    }
                }
            }
            
            # Print the payload for debugging
            print("\nRequest payload:")
            print(json.dumps(test_payload, indent=2))
            
            ticket_response = await client.post(
                f"{JIRA_API_URL}/issue",
                headers={
                    "Authorization": f"Basic {jira_auth}",
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                json=test_payload
            )
            
            print(f"\nResponse status: {ticket_response.status_code}")
            
            if ticket_response.status_code not in (200, 201):
                print(f"❌ ERROR: Failed to create ticket: {ticket_response.text}")
                
                # Try to provide more helpful error information
                if "issuetype" in ticket_response.text:
                    print("\nThere may be an issue with the issue type. Try creating a ticket manually in Jira and check which types are available.")
                
                if "permission" in ticket_response.text.lower():
                    print("\nYou may not have permission to create issues in this project. Check your permissions in Jira.")
                
                return False
            
            ticket_data = ticket_response.json()
            print(f"✅ Test ticket created successfully with key: {ticket_data.get('key')}")
            print(f"You can view it at: {JIRA_BASE_URL}browse/{ticket_data.get('key')}")
            
            print("\nDo you want to delete this test ticket? (y/n)")
            delete_choice = input().strip().lower()
            
            if delete_choice == 'y':
                print(f"\nDeleting test ticket {ticket_data.get('key')}...")
                delete_response = await client.delete(
                    f"{JIRA_API_URL}/issue/{ticket_data.get('key')}",
                    headers={
                        "Authorization": f"Basic {jira_auth}"
                    }
                )
                
                if delete_response.status_code in (204, 200):
                    print("✅ Test ticket deleted successfully")
                else:
                    print(f"❌ Failed to delete ticket: {delete_response.status_code} {delete_response.text}")
            
            return True
            
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            return False

if __name__ == "__main__":
    success = asyncio.run(test_jira_ticket_creation())
    sys.exit(0 if success else 1)
# test_jira_credentials.py
import requests
import base64
import argparse
import sys

def test_jira_credentials(jira_url, email, api_token):
    """
    Test Jira credentials by making a simple API call.
    Returns True if credentials are valid, False otherwise.
    """
    # Make sure the URL ends with /rest/api/3 or /rest/api/2
    if not jira_url.endswith(("/rest/api/3", "/rest/api/2")):
        if not jira_url.endswith("/"):
            jira_url += "/"
        jira_url += "rest/api/3"
    
    # Create basic auth token
    auth_str = f"{email}:{api_token}"
    auth_bytes = auth_str.encode('ascii')
    base64_bytes = base64.b64encode(auth_bytes)
    auth_token = base64_bytes.decode('ascii')
    
    # URLs to test
    endpoints = [
        "myself",  # Get current user info
        "project"  # List projects
    ]
    
    results = []
    
    print(f"Testing connection to Jira API at: {jira_url}")
    print(f"Using email: {email}")
    print(f"API Token: {'*' * len(api_token)} (hidden for security)")
    print("-" * 60)
    
    for endpoint in endpoints:
        url = f"{jira_url}/{endpoint}"
        headers = {
            "Authorization": f"Basic {auth_token}",
            "Accept": "application/json"
        }
        
        print(f"Testing endpoint: {endpoint}")
        print(f"  Request URL: {url}")
        
        try:
            response = requests.get(url, headers=headers)
            status_code = response.status_code
            
            if status_code == 200:
                print(f"  ✅ Success! Status code: {status_code}")
                if endpoint == "myself":
                    user_data = response.json()
                    print(f"  Authenticated as: {user_data.get('displayName', 'Unknown')} ({user_data.get('emailAddress', 'No email')})")
                elif endpoint == "project":
                    projects = response.json()
                    print(f"  Found {len(projects)} projects")
                    if len(projects) > 0:
                        print("  First few projects:")
                        for project in projects[:3]:
                            print(f"    - {project.get('name', 'Unknown')} ({project.get('key', 'No key')})")
                results.append(True)
            else:
                print(f"  ❌ Failed! Status code: {status_code}")
                print(f"  Error: {response.text}")
                results.append(False)
        except Exception as e:
            print(f"  ❌ Exception: {str(e)}")
            results.append(False)
        
        print("-" * 60)
    
    if all(results):
        print("🎉 SUCCESS! Your Jira credentials are valid.")
        print("You can proceed with the integration.")
        return True
    else:
        print("❌ FAILED! There are issues with your Jira credentials or configuration.")
        print("Please check the error messages above and correct them before proceeding.")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test Jira API credentials')
    parser.add_argument('--url', required=True, help='Jira API URL (e.g., https://your-domain.atlassian.net)')
    parser.add_argument('--email', required=True, help='Atlassian account email')
    parser.add_argument('--token', required=True, help='Jira API token')
    
    args = parser.parse_args()
    
    success = test_jira_credentials(args.url, args.email, args.token)
    
    if not success:
        sys.exit(1)
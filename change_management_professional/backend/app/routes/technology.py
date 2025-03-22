# app/routes/technology.py
from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import os
import json
import logging
import traceback
import datetime

# For email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import ssl

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Hardcoded departments for MSD (pharmaceutical company)
DEPARTMENTS = [
    {"id": 1, "name": "Research & Development", "description": "Responsible for drug discovery and development"},
    {"id": 2, "name": "Clinical Research", "description": "Designs and manages clinical trials"},
    {"id": 3, "name": "Regulatory Affairs", "description": "Ensures compliance with regulations"},
    {"id": 4, "name": "Manufacturing", "description": "Produces pharmaceutical products"},
    {"id": 5, "name": "Quality Assurance", "description": "Ensures product quality and compliance"},
    {"id": 6, "name": "Sales & Marketing", "description": "Promotes and sells products"},
    {"id": 7, "name": "Medical Affairs", "description": "Provides medical expertise and education"},
    {"id": 8, "name": "Information Technology", "description": "Manages technology systems and support"},
    {"id": 9, "name": "Human Resources", "description": "Manages personnel and workplace culture"},
    {"id": 10, "name": "Finance", "description": "Manages financial operations and planning"}
]

# Email settings
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

# Fixed email recipient
FIXED_EMAIL_RECIPIENT = "hanyubeh@gmail.com"  # Adjust this to the desired recipient

# Pydantic models
class Department(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

class TechnologyChange(BaseModel):
    name: str
    description: str
    training_link: Optional[str] = None
    department_ids: List[int]
    created_by: Optional[str] = "System"
    send_notifications: bool = False

class ChangeEntry(BaseModel):
    id: str
    name: str
    description: str
    training_link: Optional[str] = None
    affected_departments: List[str]
    created_at: str
    created_by: str
    status: str
    
class NotificationResult(BaseModel):
    recipient: str
    departments: str
    status: str
    error: Optional[str] = None
    
class TechnologyResponse(BaseModel):
    id: int
    status: str
    message: str
    notifications: List[Dict[str, Any]] = []

@router.get("/departments", response_model=List[Department])
async def get_departments():
    """Get all departments"""
    try:
        logger.info("Getting departments")
        return DEPARTMENTS
    except Exception as e:
        logger.error(f"Error getting departments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/technology-changes", response_model=TechnologyResponse)
async def create_technology_change(technology: TechnologyChange):
    """Create a new technology change"""
    try:
        # Log the technology change details
        logger.info(f"Technology change data: {json.dumps(technology.dict())}")
        logger.info(f"Creating technology change: {technology.name}")
        
        # Generate a unique ID for the technology change
        technology_id = int(datetime.datetime.now().timestamp())
        
        # In a real application, store the technology change in a database
        # For the hackathon, we'll store it in a JSON file
        try:
            # Create data directory if it doesn't exist
            data_dir = os.path.join(os.getcwd(), "data", "technology_changes")
            os.makedirs(data_dir, exist_ok=True)
            
            # Create a change entry
            department_names = []
            for dept_id in technology.department_ids:
                for dept in DEPARTMENTS:
                    if dept["id"] == dept_id:
                        department_names.append(dept["name"])
            
            change_entry = {
                "id": technology_id,
                "name": technology.name,
                "description": technology.description,
                "training_link": technology.training_link,
                "affected_departments": department_names,
                "created_at": datetime.datetime.now().isoformat(),
                "created_by": technology.created_by,
                "status": "pending",
                "notifications_sent": False
            }
            
            # Save to file
            with open(os.path.join(data_dir, f"{technology_id}.json"), 'w') as f:
                json.dump(change_entry, f, indent=2)
                
            logger.info(f"Saved technology change with ID: {technology_id}")
            
        except Exception as save_error:
            logger.error(f"Error saving technology change: {str(save_error)}")
            # Continue anyway - not critical for the demo
        
        # Send notifications if requested
        notification_status = []
        if technology.send_notifications:
            logger.info("Notifications requested - attempting to send email")
            notification_status = await send_notification_email(technology)
        else:
            logger.info("No notifications requested")
        
        return {
            "id": technology_id,
            "status": "success",
            "message": "Technology change created successfully",
            "notifications": notification_status
        }
        
    except Exception as e:
        logger.error(f"Error creating technology change: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating technology change: {str(e)}")

@router.get("/technology-changes", response_model=List[ChangeEntry])
async def get_technology_changes():
    """Get all technology changes"""
    try:
        logger.info("Getting all technology changes")
        
        # In a real application, retrieve from a database
        # For the hackathon, we'll read from JSON files
        changes = []
        data_dir = os.path.join(os.getcwd(), "data", "technology_changes")
        
        if os.path.exists(data_dir):
            for filename in os.listdir(data_dir):
                if filename.endswith(".json"):
                    try:
                        with open(os.path.join(data_dir, filename), 'r') as f:
                            change_entry = json.load(f)
                            changes.append(change_entry)
                    except Exception as read_error:
                        logger.error(f"Error reading change file {filename}: {str(read_error)}")
        
        # Sort by created_at date, newest first
        changes.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return changes
        
    except Exception as e:
        logger.error(f"Error getting technology changes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting technology changes: {str(e)}")

@router.get("/test-email")
async def test_email():
    """Test endpoint to verify email sending works"""
    try:
        logger.info("Test email endpoint called")
        
        # Create a simple test message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = FIXED_EMAIL_RECIPIENT
        msg['Subject'] = "Test Email from Change Management API"
        
        body = """
        <html>
        <body>
            <h2>Test Email</h2>
            <p>This is a test email from the Change Management API.</p>
            <p>If you received this, email sending is working correctly!</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Attempt to send email
        result = send_email(msg)
        
        return {
            "status": "success" if result else "failed",
            "message": "Test email sent successfully" if result else "Failed to send test email",
            "smtp_server": SMTP_SERVER,
            "smtp_port": SMTP_PORT,
            "smtp_username": SMTP_USERNAME,
            "recipient": FIXED_EMAIL_RECIPIENT
        }
        
    except Exception as e:
        logger.error(f"Error in test email: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error sending test email: {str(e)}")

def send_email(msg):
    """Helper function to send an email"""
    try:
        logger.info(f"Email settings: Server={SMTP_SERVER}, Port={SMTP_PORT}, Username={SMTP_USERNAME}")
        logger.info(f"Recipient: {msg['To']}")
        
        # Try sending with SSL first (more secure)
        try:
            logger.info("Attempting to send email using SSL")
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(SMTP_SERVER, 465, context=context) as server:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(msg)
            logger.info("Email sent successfully using SSL")
            return True
        except Exception as ssl_error:
            logger.warning(f"SSL email failed: {str(ssl_error)}")
            logger.warning("Falling back to TLS")
            
            # Fall back to TLS if SSL fails
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.set_debuglevel(1)  # Enable debug output
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(msg)
                server.quit()
            logger.info("Email sent successfully using TLS")
            return True
            
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        logger.error(traceback.format_exc())
        return False

async def send_notification_email(technology: TechnologyChange):
    """Send email notification about new technology change"""
    try:
        # Get department names
        department_names = []
        for dept_id in technology.department_ids:
            for dept in DEPARTMENTS:
                if dept["id"] == dept_id:
                    department_names.append(dept["name"])
        
        dept_names_str = ", ".join(department_names) if department_names else "None specified"
        
        # Create email
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = FIXED_EMAIL_RECIPIENT
        msg['Subject'] = f"New Technology Change: {technology.name}"
        
        # Email body with HTML formatting
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 5px; border: 1px solid #ddd;">
                <h2 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Technology Change Notice</h2>
                <p>Dear Change Management Team,</p>
                <p>A new technology change has been registered that requires your attention.</p>
                
                <div style="background: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3498db;">
                    <h3 style="margin-top: 0; color: #3498db;">Technology Details:</h3>
                    <p><strong>Name:</strong> {technology.name}</p>
                    <p><strong>Description:</strong> {technology.description}</p>
                    <p><strong>Affected Departments:</strong> {dept_names_str}</p>
                    {f'<p><strong>Training Link:</strong> <a href="{technology.training_link}" style="color: #3498db; text-decoration: none;">{technology.training_link}</a></p>' if technology.training_link else ''}
                </div>
                
                <p>Please review this change and prepare the affected departments accordingly.</p>
                <p>Regards,<br>Change Management AI Assistant</p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Send the email
        success = send_email(msg)
        
        if success:
            return [{
                "recipient": FIXED_EMAIL_RECIPIENT,
                "departments": dept_names_str,
                "status": "sent"
            }]
        else:
            return [{
                "recipient": FIXED_EMAIL_RECIPIENT,
                "departments": dept_names_str,
                "status": "failed",
                "error": "Failed to send email. Check server logs for details."
            }]
        
    except Exception as e:
        logger.error(f"Error preparing notification email: {str(e)}")
        logger.error(traceback.format_exc())
        return [{
            "recipient": FIXED_EMAIL_RECIPIENT,
            "status": "failed",
            "error": str(e)
        }]
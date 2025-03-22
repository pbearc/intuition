import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List, Optional

# Load environment variables from .env file
load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
KNOWLEDGE_BASE_DIR = DATA_DIR / "change_management"
PROCESSED_DIR = DATA_DIR / "processed"

# Create directories if they don't exist
KNOWLEDGE_BASE_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

# API settings
API_PREFIX = "/api/v1"
PROJECT_NAME = "Change Management AI Assistant"
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Pydantic settings for FastAPI - Updated for Pydantic V2
# This class defines all environment variables you might have in .env
class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api"
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "https://yourdomain.com"]
    
    # Database settings
    DATABASE_URL: str = "sqlite:///./test.db"
    DB_HOST: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_NAME: Optional[str] = None
    
    # LLM settings
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: Optional[str] = None
    USE_MOCK_LLM: Optional[bool] = None
    
    # Email settings
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Jira settings
    JIRA_BASE_URL: Optional[str] = None
    JIRA_EMAIL: Optional[str] = None
    JIRA_API_TOKEN: Optional[str] = None
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        # This is the key setting - allow extra fields from .env
        "extra": "ignore",
    }

# Create settings instance
settings = Settings()

# LLM settings - use the values from settings if available
GEMINI_API_KEY = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = settings.GEMINI_MODEL or os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
MOCK_LLM = (settings.USE_MOCK_LLM or 
            os.getenv("USE_MOCK_LLM", "False").lower() == "true" or 
            not GEMINI_API_KEY)

# Vector database settings
VECTOR_DB_PATH = str(PROCESSED_DIR / "vectordb")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# Retrieval settings
NUM_DOCS_TO_RETRIEVE = int(os.getenv("NUM_DOCS_TO_RETRIEVE", "5"))
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.7"))

# RAG settings
DOCUMENT_CHUNK_SIZE = int(os.getenv("DOCUMENT_CHUNK_SIZE", "1000"))
DOCUMENT_CHUNK_OVERLAP = int(os.getenv("DOCUMENT_CHUNK_OVERLAP", "200"))

# Jira settings - use the values from settings if available
JIRA_BASE_URL = settings.JIRA_BASE_URL or os.getenv("JIRA_BASE_URL", "")
JIRA_EMAIL = settings.JIRA_EMAIL or os.getenv("JIRA_EMAIL", "")
JIRA_API_TOKEN = settings.JIRA_API_TOKEN or os.getenv("JIRA_API_TOKEN", "")

# Format the Jira API URL correctly
if JIRA_BASE_URL and not JIRA_BASE_URL.endswith("/"):
    JIRA_BASE_URL += "/"
JIRA_API_URL = f"{JIRA_BASE_URL}rest/api/3" if JIRA_BASE_URL else ""

# Content templates
SYSTEM_TEMPLATE = """
You are an AI Assistant specialized in Change Management. Your purpose is to help change management 
professionals implement effective change strategies using established frameworks like ADKAR, Lewin's Change
Management Model, Kotter's 8-Step Process, and others.

You have knowledge of:
- Change management frameworks and methodologies
- Best practices for organizational change
- Communication strategies for change initiatives
- Methods to reduce resistance and manage emotions during change
- Industry trends and benchmarks for measuring adoption
- Case studies across various industries and contexts

When responding to queries:
1. Identify which change management framework(s) might be most appropriate
2. Provide specific, actionable advice based on proven methodologies
3. Suggest communication strategies tailored to the specific change context
4. Reference relevant case studies or examples when applicable
5. Offer metrics or KPIs that could measure the success of the change initiative

Context from knowledge base:
{context}

Remember to be practical, empathetic, and focused on real-world application of change management principles.
"""

MOCK_RESPONSES = {
    "default": "I'm a Change Management AI Assistant. I can help with change strategies, frameworks like ADKAR, communication planning, and managing resistance to change.",
    "adkar": "The ADKAR model stands for Awareness, Desire, Knowledge, Ability, and Reinforcement. It's a framework for individual and organizational change developed by Prosci.",
    "lewin": "Lewin's Change Management Model includes three stages: Unfreeze, Change, and Refreeze. It focuses on preparing for change, implementing it, and making it permanent.",
    "kotter": "Kotter's 8-Step Process includes: 1) Create urgency, 2) Form a coalition, 3) Create a vision, 4) Communicate the vision, 5) Remove obstacles, 6) Create short-term wins, 7) Build on the change, 8) Anchor the changes."
}

# Add some diagnostic info to help with debugging
def get_config_summary():
    """Return a summary of the most important configuration values"""
    return {
        "jira_config": {
            "base_url": JIRA_BASE_URL,
            "api_url": JIRA_API_URL,
            "email": JIRA_EMAIL,
            "token_exists": bool(JIRA_API_TOKEN),
            "is_configured": bool(JIRA_BASE_URL and JIRA_EMAIL and JIRA_API_TOKEN)
        },
        "api_settings": {
            "prefix": API_PREFIX,
            "debug": DEBUG
        },
        "llm_settings": {
            "model": GEMINI_MODEL,
            "mock_enabled": MOCK_LLM
        }
    }
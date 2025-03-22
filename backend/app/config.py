import os
from pathlib import Path
from dotenv import load_dotenv

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

# LLM settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
MOCK_LLM = os.getenv("USE_MOCK_LLM", "False").lower() == "true" or not GEMINI_API_KEY

# Vector database settings
VECTOR_DB_PATH = str(PROCESSED_DIR / "vectordb")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# Retrieval settings
NUM_DOCS_TO_RETRIEVE = int(os.getenv("NUM_DOCS_TO_RETRIEVE", "5"))
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.7"))

# RAG settings
DOCUMENT_CHUNK_SIZE = int(os.getenv("DOCUMENT_CHUNK_SIZE", "1000"))
DOCUMENT_CHUNK_OVERLAP = int(os.getenv("DOCUMENT_CHUNK_OVERLAP", "200"))

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
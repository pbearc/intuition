# app/main.py
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes import chat, technology, tools, integrations
from app.routes import jira_routes  # Import the jira_routes directly
from app.config import API_PREFIX, PROJECT_NAME, DEBUG

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=PROJECT_NAME,
    description="API for Change Management AI Assistant",
    version="0.1.0",
    debug=DEBUG,
)

# Add CORS middleware - allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],  # Add your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(
    chat.router,
    prefix=f"{API_PREFIX}/chat",
    tags=["chat"],
)

app.include_router(
    technology.router,
    prefix=f"{API_PREFIX}/technology",
    tags=["technology"],
)

app.include_router(
    tools.router,
    prefix=f"{API_PREFIX}/tools",
    tags=["tools"],
)

# Add the integrations router
app.include_router(
    integrations.router,
    prefix=f"{API_PREFIX}/integrations",
    tags=["integrations"],
)

# Add the Jira router - make sure the prefix matches what your frontend expects
# Note: We're not adding the API_PREFIX here because the router already includes /api in its prefix
app.include_router(jira_routes.router)

# Add a diagnostic endpoint
@app.get(f"{API_PREFIX}/diagnostic")
async def run_diagnostic():
    """Run a system diagnostic check"""
    from app.routes.jira_routes import JIRA_BASE_URL, JIRA_API_URL, JIRA_EMAIL
    
    return {
        "api_status": "operational",
        "environment": {
            "debug": DEBUG,
            "jira_base_url": JIRA_BASE_URL,
            "jira_api_url": JIRA_API_URL,
            "jira_email": JIRA_EMAIL,
            "jira_creds_configured": bool(JIRA_EMAIL and JIRA_API_URL)
        }
    }

@app.get("/")
async def root():
    """Root endpoint to check if API is running"""
    return {"message": "Change Management AI Assistant API", "status": "operational"}

@app.get(f"{API_PREFIX}/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=DEBUG)
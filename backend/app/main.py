import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes import chat
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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
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
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class Message(BaseModel):
    """Model for a chat message"""
    role: str = Field(..., description="Role of the message sender ('user' or 'assistant')")
    content: str = Field(..., description="Content of the message")
    timestamp: datetime = Field(default_factory=datetime.now, description="Time the message was sent")

class ChatRequest(BaseModel):
    """Model for a chat request"""
    message: str = Field(..., description="User message")
    conversation_id: Optional[str] = Field(None, description="Unique identifier for the conversation")
    history: Optional[List[Dict[str, str]]] = Field(None, description="Previous messages in the conversation")

class ChatResponse(BaseModel):
    """Model for a chat response"""
    response: str = Field(..., description="Assistant response")
    conversation_id: str = Field(..., description="Unique identifier for the conversation")
    sources: Optional[List[Dict[str, str]]] = Field(None, description="Source documents used for response")
    suggested_questions: Optional[List[str]] = Field(None, description="Follow-up questions the user might ask")

class FeedbackRequest(BaseModel):
    """Model for user feedback on a response"""
    conversation_id: str = Field(..., description="Conversation identifier")
    message_id: Optional[str] = Field(None, description="Message identifier (if applicable)")
    rating: int = Field(..., description="Rating from 1-5", ge=1, le=5)
    feedback_text: Optional[str] = Field(None, description="Detailed feedback")
    
class FeedbackResponse(BaseModel):
    """Model for feedback response"""
    id: str = Field(..., description="Feedback identifier")
    status: str = Field("success", description="Status of the feedback submission")
    message: str = Field("Thank you for your feedback", description="Response message")
    timestamp: datetime = Field(default_factory=datetime.now)
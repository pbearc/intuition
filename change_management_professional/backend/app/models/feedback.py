from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class FeedbackAnalysis(BaseModel):
    """Model for analyzed feedback data"""
    sentiment: str = Field(..., description="Sentiment of the feedback (positive, neutral, negative)")
    key_issues: List[str] = Field(default_factory=list, description="Key issues identified in the feedback")
    improvement_areas: List[str] = Field(default_factory=list, description="Areas for improvement")
    actionable_insights: str = Field(..., description="Actionable insights derived from the feedback")

class FeedbackRecord(BaseModel):
    """Model for a complete feedback record"""
    id: int = Field(..., description="Unique identifier for the feedback")
    timestamp: datetime = Field(..., description="Time the feedback was submitted")
    rating: int = Field(..., description="Rating from 1-5", ge=1, le=5)
    feedback_text: str = Field(..., description="Feedback text")
    query: Optional[str] = Field(None, description="Original user query")
    response: Optional[str] = Field(None, description="Assistant response that received feedback")
    analysis: Optional[FeedbackAnalysis] = Field(None, description="Analysis of the feedback")
    user_id: str = Field(..., description="Anonymous identifier for the user")

class FeedbackSummary(BaseModel):
    """Model for summarized feedback data"""
    total_feedback: int = Field(..., description="Total number of feedback records")
    average_rating: float = Field(..., description="Average rating")
    rating_distribution: Dict[str, int] = Field(..., description="Distribution of ratings")
    sentiment_distribution: Optional[Dict[str, int]] = Field(None, description="Distribution of sentiment")
    recent_feedback: List[FeedbackRecord] = Field(default_factory=list, description="Recent feedback records")

class ImprovementInsight(BaseModel):
    """Model for an improvement insight derived from feedback"""
    area: str = Field(..., description="Area for improvement")
    frequency: int = Field(..., description="Frequency of occurrence")
    source: str = Field(..., description="Source of the insight (analysis/keyword)")
    examples: Optional[List[str]] = Field(None, description="Example feedback")
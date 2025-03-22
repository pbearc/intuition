import logging
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel

from app.models.chat import ChatRequest, ChatResponse, FeedbackRequest, FeedbackResponse
from app.services.llm_service import LLMService
from app.services.knowledge_base import KnowledgeBase
from app.services.feedback_service import FeedbackService

# Configure logger
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Service dependencies
def get_llm_service():
    return LLMService()

def get_knowledge_base():
    return KnowledgeBase()

def get_feedback_service():
    return FeedbackService()

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    llm_service: LLMService = Depends(get_llm_service),
    knowledge_base: KnowledgeBase = Depends(get_knowledge_base)
):
    """
    Process a chat message and generate a response
    """
    try:
        # Generate or use existing conversation ID
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Retrieve relevant documents from knowledge base
        retrieved_docs = await knowledge_base.retrieve_relevant_documents(request.message)
        
        # Generate response using LLM
        response_text = await llm_service.generate_response(
            query=request.message,
            retrieved_docs=retrieved_docs,
            chat_history=request.history
        )
        
        # Extract sources from retrieved documents
        sources = []
        seen_sources = set()
        for doc in retrieved_docs:
            source = doc.metadata.get("source", "")
            # Avoid duplicate sources
            if source and source not in seen_sources:
                seen_sources.add(source)
                source_entry = {
                    "title": source.split("/")[-1] if "/" in source else source,
                    "path": source
                }
                sources.append(source_entry)
        
        # Generate suggested follow-up questions (in background)
        suggested_questions = []
        # This would typically be done in a background task to not delay response
        # background_tasks.add_task(generate_follow_up_questions, request.message, response_text)
        
        return ChatResponse(
            response=response_text,
            conversation_id=conversation_id,
            sources=sources if sources else None,
            suggested_questions=suggested_questions if suggested_questions else None
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(
    request: FeedbackRequest,
    background_tasks: BackgroundTasks,
    llm_service: LLMService = Depends(get_llm_service),
    feedback_service: FeedbackService = Depends(get_feedback_service)
):
    """
    Submit feedback for a chat response
    """
    try:
        # Generate feedback ID
        feedback_id = str(uuid.uuid4())
        
        # Store feedback basic information (without analysis)
        # This could be done in background, but we want to confirm it worked
        feedback_record = await feedback_service.store_feedback(
            feedback_text=request.feedback_text or "",
            rating=request.rating,
            query=None,  # We don't have this in the current structure
            response=None,  # We don't have this in the current structure
            user_id=request.conversation_id
        )
        
        # Analyze feedback in background task
        if request.feedback_text:
            background_tasks.add_task(
                analyze_and_update_feedback,
                llm_service,
                feedback_service,
                feedback_record["id"],
                request.feedback_text,
                request.rating
            )
        
        return FeedbackResponse(
            id=str(feedback_record["id"]),
            status="success",
            message="Thank you for your feedback! It helps us improve."
        )
        
    except Exception as e:
        logger.error(f"Error in feedback endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/knowledge-stats")
async def get_knowledge_stats(knowledge_base: KnowledgeBase = Depends(get_knowledge_base)):
    """
    Get statistics about the knowledge base
    """
    try:
        doc_count = knowledge_base.get_document_count()
        
        return {
            "total_documents": doc_count,
            "status": "operational" if doc_count > 0 else "empty"
        }
        
    except Exception as e:
        logger.error(f"Error getting knowledge stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feedback-summary")
async def get_feedback_summary(
    feedback_service: FeedbackService = Depends(get_feedback_service)
):
    """
    Get summary of collected feedback
    """
    try:
        summary = feedback_service.get_feedback_summary()
        return summary
        
    except Exception as e:
        logger.error(f"Error getting feedback summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/improvement-insights")
async def get_improvement_insights(
    feedback_service: FeedbackService = Depends(get_feedback_service)
):
    """
    Get insights for improvement based on feedback
    """
    try:
        insights = feedback_service.get_improvement_insights()
        return {"insights": insights}
        
    except Exception as e:
        logger.error(f"Error getting improvement insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Background task for analyzing feedback
async def analyze_and_update_feedback(
    llm_service: LLMService,
    feedback_service: FeedbackService,
    feedback_id: int,
    feedback_text: str,
    rating: int
):
    """Background task to analyze feedback and update the record"""
    try:
        # Analyze feedback
        analysis = await llm_service.analyze_feedback(feedback_text, rating)
        
        # Update feedback record with analysis
        # This would require an update method in the feedback service
        # await feedback_service.update_feedback(feedback_id, analysis)
        
        logger.info(f"Successfully analyzed and updated feedback #{feedback_id}")
        
    except Exception as e:
        logger.error(f"Error analyzing feedback #{feedback_id}: {str(e)}")
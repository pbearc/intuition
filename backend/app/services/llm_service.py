import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai

from app.config import GEMINI_API_KEY, GEMINI_MODEL, MOCK_LLM, MOCK_RESPONSES, SYSTEM_TEMPLATE

# Configure logger
logger = logging.getLogger(__name__)

class LLMService:
    """Service for handling LLM operations using Google's Gemini API"""
    
    def __init__(self):
        """Initialize the LLM service with API key and model configuration"""
        self.mock_mode = MOCK_LLM
        
        if not self.mock_mode:
            try:
                # Configure Gemini API
                genai.configure(api_key=GEMINI_API_KEY)
                self.model = GEMINI_MODEL
                self.genai_model = genai.GenerativeModel(self.model)
                logger.info(f"LLM service initialized with model: {self.model}")
            except Exception as e:
                logger.error(f"Failed to initialize LLM service: {str(e)}")
                self.mock_mode = True
                logger.warning("Fallback to mock mode due to initialization failure")
        
        if self.mock_mode:
            logger.warning("LLM service running in mock mode. Responses will be simulated.")
    
    def _prepare_context(self, retrieved_docs: List[Any]) -> str:
        """
        Prepare context from retrieved documents
        
        Args:
            retrieved_docs: List of retrieved documents
            
        Returns:
            Formatted context string
        """
        if not retrieved_docs:
            return "No relevant information found in the knowledge base."
        
        context_parts = []
        for i, doc in enumerate(retrieved_docs):
            source = doc.metadata.get("source", "Unknown source")
            content = doc.page_content
            context_parts.append(f"[Document {i+1}] From {source}:\n{content}\n")
        
        return "\n".join(context_parts)
    
    def _get_mock_response(self, query: str) -> str:
        """
        Generate a mock response for testing without API calls
        
        Args:
            query: User query
            
        Returns:
            Mock response based on query keywords
        """
        query_lower = query.lower()
        
        if "adkar" in query_lower:
            return MOCK_RESPONSES["adkar"]
        elif "lewin" in query_lower:
            return MOCK_RESPONSES["lewin"]
        elif "kotter" in query_lower:
            return MOCK_RESPONSES["kotter"]
        else:
            return MOCK_RESPONSES["default"]
    
    async def generate_response(
        self, 
        query: str, 
        retrieved_docs: List[Any],
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        Generate a response to the user query using Gemini
        
        Args:
            query: User query
            retrieved_docs: List of retrieved documents
            chat_history: Optional chat history
            
        Returns:
            Generated response from the LLM or mock response
        """
        if self.mock_mode:
            return self._get_mock_response(query)
        
        try:
            # Create context from retrieved documents
            context = self._prepare_context(retrieved_docs)
            
            # Prepare system prompt with context
            system_prompt = SYSTEM_TEMPLATE.format(context=context)
            
            # Convert chat history to Google Generative AI format
            chat = []
            if chat_history:
                for message in chat_history:
                    role = message["role"]
                    content = message["content"]
                    chat.append({"role": role, "parts": [content]})
            
            # Add the system prompt as context to the user query
            current_query = f"{system_prompt}\n\nUser query: {query}"
            
            # Create chat session with history
            if chat:
                # Add current query to chat history
                chat.append({"role": "user", "parts": [current_query]})
                response = self.genai_model.generate_content(chat)
            else:
                # No history, just use the current query
                response = self.genai_model.generate_content(current_query)
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return "I'm sorry, I encountered an error while generating a response. Please try again later."
    
    async def analyze_feedback(self, feedback_text: str, rating: int) -> Dict[str, Any]:
        """
        Analyze feedback to extract insights and improvement areas
        
        Args:
            feedback_text: User feedback text
            rating: Numerical rating (1-5)
            
        Returns:
            Dictionary with analyzed feedback insights
        """
        if self.mock_mode:
            return {
                "sentiment": "positive" if rating >= 4 else "negative",
                "key_issues": ["mock issue 1", "mock issue 2"],
                "improvement_areas": ["mock area 1", "mock area 2"],
                "actionable_insights": "This is a mock analysis of the feedback."
            }
        
        try:
            # Create prompt for feedback analysis
            analysis_prompt = f"""
            Analyze the following user feedback about a Change Management AI Assistant.
            
            Feedback text: "{feedback_text}"
            Rating: {rating}/5
            
            Please provide:
            1. The sentiment (positive, neutral, or negative)
            2. Key issues mentioned (if any)
            3. Areas for improvement (if any)
            4. Actionable insights to enhance the assistant's performance
            
            Format your response as a JSON object with the following keys:
            "sentiment", "key_issues", "improvement_areas", "actionable_insights"
            """
            
            # Generate analysis
            response = self.genai_model.generate_content(analysis_prompt)
            response_text = response.text
            
            # Parse response to extract JSON
            import json
            try:
                # Try to extract JSON from the response
                # Find JSON content between curly braces
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = response_text[json_start:json_end]
                    return json.loads(json_str)
                else:
                    # Fallback if JSON parsing fails
                    return {
                        "sentiment": "unknown",
                        "key_issues": [],
                        "improvement_areas": [],
                        "actionable_insights": response_text
                    }
            except json.JSONDecodeError:
                return {
                    "sentiment": "unknown",
                    "key_issues": [],
                    "improvement_areas": [],
                    "actionable_insights": response_text
                }
                
        except Exception as e:
            logger.error(f"Error analyzing feedback: {str(e)}")
            return {
                "sentiment": "unknown",
                "key_issues": [],
                "improvement_areas": [],
                "actionable_insights": "Error analyzing feedback"
            }
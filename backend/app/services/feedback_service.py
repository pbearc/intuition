import logging
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd

from app.config import DATA_DIR

# Configure logger
logger = logging.getLogger(__name__)

# Feedback storage path
FEEDBACK_DIR = DATA_DIR / "feedback"
FEEDBACK_FILE = FEEDBACK_DIR / "feedback_records.json"

class FeedbackService:
    """Service for collecting and analyzing user feedback"""
    
    def __init__(self):
        """Initialize the feedback service"""
        # Create feedback directory if it doesn't exist
        FEEDBACK_DIR.mkdir(parents=True, exist_ok=True)
        
        # Initialize or load existing feedback data
        if FEEDBACK_FILE.exists():
            try:
                with open(FEEDBACK_FILE, 'r') as f:
                    self.feedback_data = json.load(f)
                logger.info(f"Loaded {len(self.feedback_data)} feedback records")
            except Exception as e:
                logger.error(f"Error loading feedback data: {str(e)}")
                self.feedback_data = []
        else:
            self.feedback_data = []
            
        logger.info("Feedback service initialized")
    
    async def store_feedback(
        self, 
        feedback_text: str, 
        rating: int, 
        query: Optional[str] = None,
        response: Optional[str] = None,
        analysis: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Store user feedback and associated data
        
        Args:
            feedback_text: Feedback text from user
            rating: Numerical rating (1-5)
            query: Original user query that received feedback
            response: Assistant response that received feedback
            analysis: Analysis of the feedback (if available)
            user_id: Anonymous identifier for the user (if available)
            
        Returns:
            The stored feedback record
        """
        try:
            # Create feedback record
            feedback_record = {
                "id": len(self.feedback_data) + 1,
                "timestamp": datetime.now().isoformat(),
                "rating": rating,
                "feedback_text": feedback_text,
                "query": query,
                "response": response,
                "analysis": analysis,
                "user_id": user_id or "anonymous"
            }
            
            # Add to in-memory data
            self.feedback_data.append(feedback_record)
            
            # Save to disk
            with open(FEEDBACK_FILE, 'w') as f:
                json.dump(self.feedback_data, f, indent=2)
                
            logger.info(f"Stored feedback record #{feedback_record['id']}")
            return feedback_record
            
        except Exception as e:
            logger.error(f"Error storing feedback: {str(e)}")
            # Return basic record even if storage failed
            return {
                "id": -1,
                "timestamp": datetime.now().isoformat(),
                "rating": rating,
                "feedback_text": feedback_text,
                "error": str(e)
            }
    
    def get_feedback_summary(self) -> Dict[str, Any]:
        """
        Generate a summary of collected feedback
        
        Returns:
            Dictionary with feedback statistics and insights
        """
        if not self.feedback_data:
            return {
                "total_feedback": 0,
                "average_rating": 0,
                "rating_distribution": {},
                "recent_feedback": []
            }
            
        try:
            # Convert to DataFrame for easier analysis
            df = pd.DataFrame(self.feedback_data)
            
            # Calculate statistics
            total_feedback = len(df)
            average_rating = df["rating"].mean()
            
            # Rating distribution
            rating_distribution = df["rating"].value_counts().to_dict()
            
            # Extract sentiment from analysis if available
            sentiment_counts = {}
            if "analysis" in df.columns:
                for analysis in df["analysis"].dropna():
                    if isinstance(analysis, dict) and "sentiment" in analysis:
                        sentiment = analysis["sentiment"]
                        sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
            
            # Get most recent feedback
            recent_feedback = df.sort_values("timestamp", ascending=False).head(5).to_dict("records")
            
            # Prepare summary
            summary = {
                "total_feedback": total_feedback,
                "average_rating": round(average_rating, 2),
                "rating_distribution": rating_distribution,
                "sentiment_distribution": sentiment_counts,
                "recent_feedback": recent_feedback
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating feedback summary: {str(e)}")
            return {
                "total_feedback": len(self.feedback_data),
                "error": str(e)
            }
    
    def get_improvement_insights(self) -> List[Dict[str, Any]]:
        """
        Extract actionable insights from feedback for system improvement
        
        Returns:
            List of improvement insights and recommendations
        """
        if not self.feedback_data:
            return []
            
        try:
            # Convert to DataFrame
            df = pd.DataFrame(self.feedback_data)
            
            # Focus on negative feedback (rating < 4)
            negative_feedback = df[df["rating"] < 4]
            
            insights = []
            
            # Extract improvement areas from analysis if available
            if "analysis" in df.columns and not df["analysis"].isna().all():
                # Collect all improvement areas
                all_areas = []
                for analysis in df["analysis"].dropna():
                    if isinstance(analysis, dict) and "improvement_areas" in analysis:
                        all_areas.extend(analysis["improvement_areas"])
                
                # Count occurrences
                from collections import Counter
                area_counts = Counter(all_areas)
                
                # Convert to insights
                for area, count in area_counts.most_common(5):
                    insights.append({
                        "area": area,
                        "frequency": count,
                        "source": "analysis"
                    })
            
            # Add common keywords from negative feedback text
            if not negative_feedback.empty and "feedback_text" in negative_feedback.columns:
                # Simple keyword extraction (in production you'd use NLP)
                keywords = ["unclear", "wrong", "slow", "confusing", "incorrect", 
                            "irrelevant", "unhelpful", "complicated", "error", "missing"]
                
                keyword_counts = {}
                for keyword in keywords:
                    count = negative_feedback["feedback_text"].str.contains(keyword, case=False).sum()
                    if count > 0:
                        keyword_counts[keyword] = count
                
                # Add to insights
                for keyword, count in sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True):
                    insights.append({
                        "area": f"Issue related to: {keyword}",
                        "frequency": count,
                        "source": "keyword"
                    })
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating improvement insights: {str(e)}")
            return []
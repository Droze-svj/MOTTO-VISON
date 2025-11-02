"""
Feedback API Endpoint
Handles beta feedback submission and collection
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class DeviceInfo(BaseModel):
    platform: str
    osVersion: str
    appVersion: str
    deviceModel: Optional[str] = None


class FeedbackRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    rating: int
    message: str
    category: str  # 'bug', 'feature', 'improvement', 'other'
    deviceInfo: DeviceInfo
    attachments: Optional[List[str]] = None  # Base64 encoded screenshots
    timestamp: Optional[str] = None


class FeedbackResponse(BaseModel):
    success: bool
    id: Optional[str] = None
    message: str


@router.post("/api/feedback", response_model=FeedbackResponse)
async def submit_feedback(feedback: FeedbackRequest):
    """
    Submit beta feedback
    """
    try:
        # Validate rating
        if feedback.rating < 0 or feedback.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 0 and 5")
        
        # Validate category
        valid_categories = ['bug', 'feature', 'improvement', 'other']
        if feedback.category not in valid_categories:
            raise HTTPException(status_code=400, detail=f"Category must be one of: {valid_categories}")
        
        # Validate message
        if not feedback.message or len(feedback.message.strip()) == 0:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Generate feedback ID (in production, use database)
        import uuid
        feedback_id = str(uuid.uuid4())
        
        # Log feedback (in production, save to database)
        feedback_data = {
            "id": feedback_id,
            "name": feedback.name,
            "email": feedback.email,
            "rating": feedback.rating,
            "message": feedback.message,
            "category": feedback.category,
            "deviceInfo": feedback.deviceInfo.dict(),
            "timestamp": feedback.timestamp or datetime.utcnow().isoformat(),
            "hasAttachments": bool(feedback.attachments and len(feedback.attachments) > 0),
        }
        
        logger.info(f"Feedback submitted: {feedback_id} - {feedback.category} - Rating: {feedback.rating}")
        
        # TODO: Save to database
        # await db.feedback.insert_one(feedback_data)
        
        # Optional: Send email notification
        # await send_feedback_email(feedback_data)
        
        return FeedbackResponse(
            success=True,
            id=feedback_id,
            message="Feedback submitted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")


@router.get("/api/feedback")
async def get_feedback_list(
    category: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    Get list of feedback (admin only - add authentication)
    """
    # TODO: Add authentication
    # TODO: Query from database
    return {
        "feedback": [],
        "total": 0,
        "limit": limit,
        "offset": offset
    }


# Add this router to your main app
# from feedback_endpoint import router as feedback_router
# app.include_router(feedback_router)


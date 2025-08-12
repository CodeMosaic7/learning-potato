from fastapi import APIRouter, Depends,HTTPException, status
from typing import List, Dict, Any
from fastapi.responses import JSONResponse
from app.dependencies import get_db
from app.services.chatbot.chatbot_model import get_learning_insights
from app.services.chatbot.chatbot_model import create_chatbot, MentalAgeAssessmentChatbot,ChatbotStage
from app.schemas import ChatMessage, ChatResponse, InitializeChatbotResponse, ChatbotStatus
from app.schemas import AssessmentReport,LearningRecommendation,ErrorResponse
from app.authentication.auth import get_current_user
from app.authentication.user_logic import UserDatabase
from datetime import datetime
import logging
from app.models import User
router = APIRouter(prefix="/chatbot", tags=["Chatbot"])
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.post("/initialize", 
             response_model=InitializeChatbotResponse,
             summary="Initialize chatbot session for user",
             description="Creates a new chatbot session and returns initial welcome message")
async def initialize_chatbot(
    current_user: dict = Depends(get_current_user),
    db_session = Depends(get_db)
):
    """Initialize a new chatbot session for the authenticated user."""
    try:
        print(current_user)
        user_id = getattr(current_user, "id", None)
    
        print(f"User ID: {user_id}")
        logger.info(f"Initializing chatbot for user {user_id}")
        
        chatbot = create_chatbot(user_id, db_session)
        
        welcome_response =await chatbot.process_message("Hello! I'm ready to start.")
        
        return InitializeChatbotResponse(
            session_id=f"chatbot_{user_id}",
            initial_response=ChatResponse(**welcome_response),
            status="initialized",
            user_id=user_id
        )
        
    except Exception as e:
        logger.error(f"Error processing chat message for user {getattr(current_user, 'id', None)}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize chatbot: {str(e)}"
        )

@router.post("/chat",
             response_model=ChatResponse,
             summary="Send message to chatbot",
             description="Process user message and get AI-powered response")
async def chat_with_bot(
    message: ChatMessage,
    current_user: dict = Depends(get_current_user),
    db_session = Depends(get_db)
):
    """Process a user message through the chatbot."""
    try:
        user_id = getattr(current_user, "id", None)
        logger.info(f"Processing message from user {user_id}: {message.message[:50]}...")
        
        # current conversation_state
        user_record = db_session.query(User).filter(User.id == user_id).first()
        if not user_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        current_conversation_state = getattr(user_record, 'conversation_state', None)
        logger.info(f"Current conversation state for user {user_id}: {current_conversation_state}")
        
        
        chatbot = create_chatbot(user_id, db_session)
        
        new_stage = response_data.get("stage")
        if new_stage == "assessment_in_progress" and current_conversation_state != "assessment_in_progress":
            db_session.query(User).filter(User.id == user_id).update({
                "conversation_state": "assessment_in_progress"
            })
            db_session.commit()

        elif new_stage == "assessment_completed" and current_conversation_state != "assessment_completed":
            db_session.query(User).filter(User.id == user_id).update({
                "conversation_state": "assessment_completed"
    })
            # If user agrees to start assessment, update conversation state
            if response_data.get("intent") == "yes":
                try:
                    db_session.query(User).filter(User.id == user_id).update({
                        "conversation_state": "assessment_in_progress",  
                    })
                    db_session.commit()
                    logger.info(f"Updated conversation_state to 'assessment_in_progress' for user {user_id}")
                except Exception as db_error:
                    logger.error(f"Failed to update conversation_state for user {user_id}: {str(db_error)}")
                    db_session.rollback()
                    
        else:
            logger.info(f"User {user_id} in state '{current_conversation_state}', processing message normally")
            response_data = await chatbot.process_message(message.message)
            
        if (current_conversation_state == "assessment_in_progress" and 
            response_data.get("stage") == "assessment_completed"):
            try:
                db_session.query(User).filter(User.id == user_id).update({
                    "conversation_state": "assessment_completed",  
                })
                db_session.commit()
                logger.info(f"Updated conversation_state to 'assessment_completed' for user {user_id}")
            except Exception as db_error:
                logger.error(f"Failed to update conversation_state to completed for user {user_id}: {str(db_error)}")
                db_session.rollback()
        
        return ChatResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat message for user {getattr(current_user, 'id', None)}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )
@router.get("/status",
            response_model=ChatbotStatus,
            summary="Get chatbot status",
            description="Get current chatbot session status and progress")
async def get_chatbot_status(
    current_user: dict = Depends(get_current_user),
    db_session = Depends(get_db)
):
    """Get the current status of the user's chatbot session."""
    try:
        user_id = getattr(current_user, "id", None)
        logger.info(f"Getting chatbot status for user {user_id}")
        
        # Create chatbot instance to check status
        chatbot = create_chatbot(user_id, db_session)
        
        return ChatbotStatus(
            user_id=user_id,
            current_stage=chatbot.stage.value,
            mental_age=chatbot.mental_age,
            intellect_level=chatbot.intellect_level.value if chatbot.intellect_level else None,
            assessment_progress=f"{chatbot.current_question}/5" if chatbot.stage == ChatbotStage.ASSESSMENT_IN_PROGRESS else None,
            last_interaction=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Error getting chatbot status for user {current_user.get('id', 'unknown')}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get chatbot status: {str(e)}"
        )

@router.get("/assessment/report",
            response_model=AssessmentReport,
            summary="Get detailed assessment report",
            description="Generate comprehensive learning assessment report with AI analysis")
async def get_assessment_report(
    current_user: dict = Depends(get_current_user),
    db_session = Depends(get_db)
):
    """Get a detailed assessment report for the user."""
    try:
        user_id = getattr(current_user, "id", None)
        logger.info(f"Generating assessment report for user {user_id}")
        
        # Get learning insights
        insights = get_learning_insights(user_id)
        
        if "error" in insights:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not completed yet. Please complete the 5-question assessment first."
            )
        
        return AssessmentReport(**insights)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating assessment report for user {current_user.get('id', 'unknown')}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate assessment report: {str(e)}"
        )

@router.post("/recommendations",
             response_model=ChatResponse,
             summary="Get learning recommendations",
             description="Get personalized learning recommendations based on assessment")
async def get_learning_recommendations(
    request: LearningRecommendation,
    current_user: dict = Depends(get_current_user),
    db_session = Depends(get_db)
):
    """Get personalized learning recommendations."""
    try:
        user_id = getattr(current_user, "id", None)
        topic = request.topic or "general learning guidance"
        logger.info(f"Getting learning recommendations for user {user_id}, topic: {topic}")
        
        # Create chatbot instance
        chatbot = create_chatbot(user_id, db_session)
        
        # Check if assessment is completed
        if not chatbot.mental_age:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please complete the mental age assessment first to get personalized recommendations."
            )
        
        # Generate recommendations
        recommendation_query = f"I need help with {topic}" if request.topic else "Give me learning recommendations"
        response_data = chatbot.process_message(recommendation_query)
        
        return ChatResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting recommendations for user {current_user.get('id', 'unknown')}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get learning recommendations: {str(e)}"
        )

@router.post("/assessment/restart",
             response_model=ChatResponse,
             summary="Restart mental age assessment",
             description="Reset and restart the mental age assessment process")
async def restart_assessment(
    current_user: dict = Depends(get_current_user),
    db_session = Depends(get_db)
):
    """Restart the mental age assessment for the user."""
    try:
        user_id = getattr(current_user, "id", None)
        logger.info(f"Restarting assessment for user {user_id}")
        
        # Clear existing mental age data
        db = UserDatabase(db_session)
        # You might want to add a method to clear/reset mental age data
        # db.reset_user_mental_age(user_id)
        
        # Create fresh chatbot instance
        chatbot = MentalAgeAssessmentChatbot(user_id, db_session)
        # Force reset to assessment start
        chatbot.stage = ChatbotStage.ASSESSMENT_START
        chatbot.mental_age = None
        chatbot.intellect_level = None
        chatbot.current_question = 0
        chatbot.responses = []
        
        # Start assessment
        response_data = chatbot.process_message("Yes, I want to restart the assessment")
        
        return ChatResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error restarting assessment for user {current_user.get('id', 'unknown')}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to restart assessment: {str(e)}"
        )

@router.get("/conversation/history",
            response_model=List[Dict[str, Any]],
            summary="Get conversation history",
            description="Retrieve recent conversation history with the chatbot")
async def get_conversation_history(
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db_session = Depends(get_db)
):
    """Get conversation history for the user."""
    try:
        user_id = getattr(current_user, "id", None)
        logger.info(f"Getting conversation history for user {user_id}")
        
        # Create chatbot instance
        chatbot = create_chatbot(user_id, db_session)
        
        # Get recent conversation history
        history = []
        for i, message in enumerate(chatbot.conversation_history[-limit:]):
            history.append({
                "id": i,
                "type": "user" if hasattr(message, 'content') and isinstance(message, type(chatbot.conversation_history[0])) else "assistant",
                "content": message.content,
                "timestamp": datetime.utcnow().isoformat()
            })
        
        return history
        
    except Exception as e:
        logger.error(f"Error getting conversation history for user {current_user.get('id', 'unknown')}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get conversation history: {str(e)}"
        )

@router.delete("/session/reset",
               summary="Reset chatbot session",
               description="Reset the entire chatbot session and conversation history")
async def reset_chatbot_session(
    current_user: dict = Depends(get_current_user),
    db_session = Depends(get_db)
):
    """Reset the chatbot session completely."""
    try:
        user_id = getattr(current_user, "id", None)
        logger.info(f"Resetting chatbot session for user {user_id}")
        
        # This would typically clear session data, conversation history, etc.
        # You might want to implement session management in your database
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Chatbot session reset successfully",
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"Error resetting session for user {current_user.get('id', 'unknown')}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset chatbot session: {str(e)}"
        )

@router.get("/health",
            summary="Chatbot health check",
            description="Check if the chatbot service is healthy and operational")
async def chatbot_health_check():
    """Health check endpoint for the chatbot service."""
    try:
            
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": "healthy",
                "service": "Mental Age Assessment Chatbot",
                "timestamp": datetime.utcnow().isoformat(),
                "version": "1.0.0"
            }
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chatbot service is not healthy"
        )





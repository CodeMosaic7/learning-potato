from datetime import datetime
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from app.dependencies import get_db
from app.authentication.auth import get_current_user
from app.schemas import (
    ChatMessage,
    ChatResponse,
    InitializeChatbotResponse,
    ChatbotStatus
)

from app.services.chatbot.agent_chatbot import (
    getState,
    run_graph
)

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])
logger = logging.getLogger(__name__)


@router.post(
    "/initialize",
    response_model=InitializeChatbotResponse,
    summary="Initialize chatbot session",
    description="Creates chatbot session & returns welcome response"
)
async def initialize_chatbot(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = str(current_user.id)

    try:
        logger.info(f"Initializing chatbot for {user_id}")

        # check if existing session
        session = await db.chat_sessions.find_one({"user_id": user_id})

        if not session:
            # create session
            state = getState(username=current_user.name)

            session_doc = {
                "user_id": user_id,
                "state": state,
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "completed": False
            }

            await db.chat_sessions.insert_one(session_doc)
        else:
            state = session["state"]

        # run welcome node
        result = run_graph(state)

        # save updated state
        await db.chat_sessions.update_one(
            {"user_id": user_id},
            {"$set": {
                "state": result,
                "updated_at": datetime.utcnow()
            }}
        )

        return InitializeChatbotResponse(
            session_id=f"chatbot_{user_id}",
            initial_response=ChatResponse(
                message=result.get("current_response", "Hello 👋")
            ),
            status="initialized",
            user_id=user_id
        )

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to initialize chatbot"
        )

@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send message to chatbot",
    description="Processes user message"
)
async def chat_with_bot(
    message: ChatMessage,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = str(current_user.id)

    try:
        session = await db.chat_sessions.find_one({"user_id": user_id})

        if not session:
            raise HTTPException(400, "Chat not initialized")

        state = session["state"]

        # push new user msg
        state["user_input"] = message.message
        state["conversation_history"].append({
            "role": "user",
            "content": message.message,
            "timestamp": datetime.utcnow().isoformat()
        })

        # run graph
        result = run_graph(state)

        # save back
        await db.chat_sessions.update_one(
            {"user_id": user_id},
            {"$set": {
                "state": result,
                "updated_at": datetime.utcnow()
            }}
        )

        return ChatResponse(
            message=result["current_response"],
            stage=(
                "assessment_completed" if result.get("follow_up_done")
                else "assessment_in_progress"
            )
        )

    except Exception as e:
        logger.error(str(e))
        raise HTTPException(500, "Failed to process message")


@router.get(
    "/status",
    response_model=ChatbotStatus
)
async def get_chatbot_status(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = str(current_user.id)

    session = await db.chat_sessions.find_one({"user_id": user_id})

    if not session:
        raise HTTPException(404, "No session found")

    state = session["state"]

    return ChatbotStatus(
        user_id=user_id,
        current_stage="completed" if state.get("follow_up_done") else "in_progress",
        mental_age=state.get("estimated_age"),
        intellect_level=state.get("age_category"),
        assessment_progress=str(len(state.get("age_answers", []))) + "/5",
        last_interaction=session["updated_at"]
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
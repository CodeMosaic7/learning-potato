from datetime import datetime, timezone
import logging
from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import PyMongoError, DuplicateKeyError

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

class ChatStage:
    INIT = "INIT"
    ASSESSMENT_IN_PROGRESS = "ASSESSMENT_IN_PROGRESS"
    ASSESSMENT_COMPLETED = "ASSESSMENT_COMPLETED"

def determine_stage(state: dict) -> str:
    if state.get("follow_up_done"):
        return ChatStage.ASSESSMENT_COMPLETED
    return ChatStage.ASSESSMENT_IN_PROGRESS

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
    print(current_user)
    user_id = str(current_user["id"])
    username = current_user['username']
    try:
        logger.info(f"Initializing chatbot for {user_id}")
        
        # Single DB request - try to find existing session
        session = await db.chat_sessions.find_one({"user_id": user_id})

        if not session:
            # Initialize new state (removed duplicate db call)
            state = getState(None)
            current_stage = ChatStage.ASSESSMENT_IN_PROGRESS
            
            # Run graph to get initial response
            result = run_graph(state)
            next_stage = determine_stage(result)

            # Single DB request - insert new session
            try:
                await db.chat_sessions.insert_one({
                    "user_id": user_id,
                    "state": result,
                    "current_stage": next_stage,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                })
            except DuplicateKeyError:
                # Handle race condition - another request created session
                session = await db.chat_sessions.find_one({"user_id": user_id})
                result = session["state"]
                next_stage = session["current_stage"]
        else:
            # Session exists - use existing state
            state = session["state"]
            current_stage = session.get("current_stage", ChatStage.ASSESSMENT_IN_PROGRESS)
            
            # Run graph with existing state
            result = run_graph(state)
            next_stage = determine_stage(result)

            # Single DB request - atomic update
            await db.chat_sessions.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "state": result,
                        "current_stage": next_stage,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )

        return InitializeChatbotResponse(
            session_id=user_id,  # Simplified - use user_id directly
            initial_response=ChatResponse(
                response=result.get("current_response", "Hello"),
                stage=next_stage
            ),
            status="initialized",
            user_id=user_id  
        )
    except PyMongoError as e:
        logger.error(f"MongoDB error for user {user_id}: {str(e)}")
        raise HTTPException(500, "Database error occurred")
    except Exception as e:
        logger.error(f"Error initializing chatbot for user {user_id}: {str(e)}")
        raise HTTPException(500, "Failed to initialize chatbot")


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
    print("In chat- chatbot")
    user_id = str(current_user["id"])
    try:
        # Single DB request - find session
        session = await db.chat_sessions.find_one({"user_id": user_id})
        if not session:
            raise HTTPException(400, "Chat not initialized. Please initialize first.")
        # Check if assessment is completed
        if session["current_stage"] == ChatStage.ASSESSMENT_COMPLETED:
            return ChatResponse(
                response="Assessment already completed. Thank you 🙏",
                stage=ChatStage.ASSESSMENT_COMPLETED
            )
        # Work with state (in-memory operations, right now)
        state = session["state"]
        state["user_input"] = message.message
        state["conversation_history"].append({
            "role": "user",
            "content": message.message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        # Process with agent
        result = run_graph(state)
        next_stage = determine_stage(result)
        # Single DB request - atomic update
        updated_session = await db.chat_sessions.find_one_and_update(
            {"user_id": user_id},
            {
                "$set": {
                    "state": result,
                    "current_stage": next_stage,
                    "updated_at": datetime.now(timezone.utc)
                }
            },
            return_document=True  # Returns updated document
        )

        if not updated_session:
            raise HTTPException(500, "Failed to update chat session")

        return ChatResponse(
            response=result["current_response"],
            stage=next_stage
        )

    except HTTPException:
        raise
    except PyMongoError as e:
        logger.error(f"MongoDB error for user {user_id}: {str(e)}")
        raise HTTPException(500, "Database error occurred")
    except Exception as e:
        logger.error(f"Error processing message for user {user_id}: {str(e)}")
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

    try:
        # Single DB request - project only needed fields
        session = await db.chat_sessions.find_one(
            {"user_id": user_id},
            {
                "current_stage": 1,
                "state.estimated_age": 1,
                "state.age_category": 1,
                "state.age_answers": 1,
                "updated_at": 1
            }
        )

        if not session:
            raise HTTPException(404, "No chat session found. Please initialize first.")

        state = session.get("state", {})

        return ChatbotStatus(
            user_id=user_id,  
            current_stage=session.get("current_stage", ChatStage.INIT),
            mental_age=state.get("estimated_age"),
            intellect_level=state.get("age_category"),
            assessment_progress=f"{len(state.get('age_answers', []))}/5",
            last_interaction=session.get("updated_at")
        )

    except HTTPException:
        raise
    except PyMongoError as e:
        logger.error(f"MongoDB error for user {user_id}: {str(e)}")
        raise HTTPException(500, "Database error occurred")
    except Exception as e:
        logger.error(f"Error getting status for user {user_id}: {str(e)}")
        raise HTTPException(500, "Failed to get chatbot status")
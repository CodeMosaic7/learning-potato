from datetime import datetime, timezone
from copy import deepcopy
import logging
from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import PyMongoError, DuplicateKeyError
from app.mongo_db import get_mongo_connection as get_db
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

class ChatStage:
    INIT = "INIT"
    ASSESSMENT_IN_PROGRESS = "ASSESSMENT_IN_PROGRESS"
    ASSESSMENT_COMPLETED = "ASSESSMENT_COMPLETED"

def determine_stage(state: dict) -> str:
    """Determines the current status of the conversation from the state."""
    if state.get("follow_up_done"):
        return ChatStage.ASSESSMENT_COMPLETED
    return ChatStage.ASSESSMENT_IN_PROGRESS

def _welcome_response(state: dict) -> str:
    """Extract the chatbot's opening line from a graph result, with a safe fallback."""
    return state.get("current_response") or "Hello! Let's get started."


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
    """ initialise chatbot session based on the current state and gives a simple welcome message """
    print(current_user)
    user_id = str(current_user["id"])
    try:
        logger.info(f"Initializing chatbot for {user_id}")
        session = await db.chat_collection.find_one({"user_id": user_id})
        if not session:
            initial_state = getState(None)
            graph_result = run_graph(initial_state)       
            next_stage = determine_stage(graph_result)
            welcome = _welcome_response(graph_result)

            try:
                await db.chat_sessions.insert_one({
                    "user_id": user_id,
                    "state": graph_result,               
                    "current_stage": next_stage,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                })
            except DuplicateKeyError:
                # Race condition — another request just created the session
                session = await db.chat_sessions.find_one({"user_id": user_id})
                graph_result = session["state"]
                next_stage = session["current_stage"]
                welcome = _welcome_response(graph_result)

        else:
            # ── Resume existing session ────────────────────────────────────
            # On re-initialization we don't re-run the graph; we just return
            # whatever the session's current state already says.
            graph_result = session["state"]
            next_stage = session.get("current_stage", ChatStage.ASSESSMENT_IN_PROGRESS)
            welcome = _welcome_response(graph_result)

            await db.chat_sessions.update_one(
                {"user_id": user_id},
                {"$set": {"updated_at": datetime.now(timezone.utc)}},
            )

        return InitializeChatbotResponse(
            session_id=user_id,
            initial_response=ChatResponse(response=welcome, stage=next_stage),
            status="initialized",
            user_id=user_id,
        )

    except PyMongoError as e:
        logger.error("MongoDB error for user %s: %s", user_id, e)
        raise HTTPException(500, "Database error occurred")
    except Exception as e:
        logger.error("Error initializing chatbot for user %s: %s", user_id, e)
        raise HTTPException(500, "Failed to initialize chatbot")


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send message to chatbot",
    description="Processes a user message and advances the assessment graph.",
)
async def chat_with_bot(
    message: ChatMessage,
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    user_id = str(current_user["id"])

    try:
        session = await db.chat_sessions.find_one({"user_id": user_id})
        if not session:
            raise HTTPException(400, "Chat not initialized. Please call /initialize first.")

        if session["current_stage"] == ChatStage.ASSESSMENT_COMPLETED:
            return ChatResponse(
                response="Assessment already completed. Thank you 🙏",
                stage=ChatStage.ASSESSMENT_COMPLETED,
            )

        # Build a clean state copy so the original isn't mutated on graph failure
        state = deepcopy(session["state"])
        state["user_input"] = message.message
        state.setdefault("conversation_history", []).append({
            "role": "user",
            "content": message.message,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

        graph_result = run_graph(state)
        next_stage = determine_stage(graph_result)

        updated_session = await db.chat_sessions.find_one_and_update(
            {"user_id": user_id},
            {
                "$set": {
                    "state": graph_result,
                    "current_stage": next_stage,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
            return_document=True,
        )

        if not updated_session:
            raise HTTPException(500, "Failed to update chat session")

        return ChatResponse(
            response=graph_result["current_response"],
            stage=next_stage,
        )

    except HTTPException:
        raise
    except PyMongoError as e:
        logger.error("MongoDB error for user %s: %s", user_id, e)
        raise HTTPException(500, "Database error occurred")
    except Exception as e:
        logger.error("Error processing message for user %s: %s", user_id, e)
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
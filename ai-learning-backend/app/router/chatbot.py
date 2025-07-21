# app/routers/chatbot.py

from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.services.chatbot.chatbot_model import initialize_chatbot_for_user, process_user_message

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

chatbot_states = {}  # In-memory storage; ideally replace with DB or Redis

@router.post("/start")
def start_chat(user_id: int = Body(...), db: Session = Depends(get_db)):
    state = initialize_chatbot_for_user(user_id, db)
    chatbot_states[user_id] = state
    return {"message": "Chatbot initialized"}

@router.post("/message")
def send_message(user_id: int = Body(...), message: str = Body(...)):
    if user_id not in chatbot_states:
        return {"error": "Session not initialized. Hit /start first."}
    result = process_user_message(chatbot_states[user_id], message)
    return result

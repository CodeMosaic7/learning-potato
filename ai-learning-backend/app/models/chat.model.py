from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from base import MongoModel, PyObjectId

class ChatSessionBase(BaseModel):
    estimated_age: Optional[int] = None
    age_category: Optional[str] = None
    mental_state_summary: Optional[str] = None
    risk_level: Optional[str] = None
    final_recommendation: Optional[str] = None
    completed: bool = False

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSessionDB(MongoModel, ChatSessionBase):
    user_id: PyObjectId
    started_at: datetime
    ended_at: Optional[datetime] = None


# Chat message models
class ChatMessageBase(BaseModel):
    sender: str
    content: str
    timestamp: datetime

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageDB(MongoModel, ChatMessageBase):
    session_id: PyObjectId

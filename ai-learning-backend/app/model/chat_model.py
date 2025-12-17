from pydantic import BaseModel
from datetime import datetime
import datetime
from typing import Optional
from base import MongoModel, PyObjectId


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    stage = Column(String, default="welcome")
    current_question = Column(Integer, default=0)
    responses = Column(JSON, default=list)
    conversation_history = Column(JSON, default=list)

    mental_age = Column(Integer, nullable=True)
    intellect_level = Column(String, nullable=True)

    completed = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

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

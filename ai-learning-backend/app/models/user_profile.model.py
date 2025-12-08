from datetime import datetime
from pydantic import BaseModel
from typing import Optional,List
from base import MongoModel, PyObjectId

class UserProfileBase(BaseModel):
    user_id: PyObjectId
    bio: Optional[str] = None
    location: Optional[str] = None
    interests: List[str] = []
    learning_goals: List[str] = []
    preferred_learning_style: Optional[str] = None

    intellectual_level: Optional[str] = None
    emotional_state: Optional[str] = None
    strengths: List[str] = []
    weaknesses: List[str] = []
    learning_style: Optional[str] = None
    recommended_subjects: List[str] = []

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileDB(MongoModel, UserProfileBase):
    user_id: PyObjectId
    updated_at: datetime

class UserProfileOut(UserProfileDB):
    pass

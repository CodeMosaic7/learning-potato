from datetime import datetime
from pydantic import BaseModel, EmailStr,Field
from typing import Optional

from .base import MongoModel

class UserBase(BaseModel):
    name:str
    username:str
    email: EmailStr
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    grade_level: Optional[str] = None
    profile_image: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserDB(MongoModel, UserBase):
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserOut(MongoModel, UserBase):
    created_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(MongoModel):
    email:str
    access_token: str
    token_type: str
    # refresh_token
        

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: str | None = None

    class Config:
        from_attributes = True

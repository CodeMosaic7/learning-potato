from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional

from base import MongoModel

class UserBase(BaseModel):
    name:str
    usename:str
    email: EmailStr
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    grade_level: Optional[str] = None
    profile_image: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserDB(MongoModel, UserBase):
    password_hash: str
    created_at: datetime = datetime

class UserOut(MongoModel, UserBase):
    created_at: datetime
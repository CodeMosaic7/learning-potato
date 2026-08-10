from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, EmailStr, Field


class StudentProfileData(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    grade_level: Optional[str] = None
    profile_image: Optional[str] = ""


class StudentOut(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: str
    role: Literal["student"] = "student"
    account_status: str = "active"
    is_verified: bool = False
    profile: Optional[StudentProfileData] = None


class RegisterStudentRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=1)
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    grade_level: Optional[str] = None
    profile_image: Optional[str] = None


class LoginStudentRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    student: StudentOut


class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    student: StudentOut


class LogoutResponse(BaseModel):
    status: str = "logged_out"

from datetime import datetime
from pydantic import BaseModel
from typing import Optional,List,Dict,Any
from .base import MongoModel, PyObjectId

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

class UserStats(BaseModel):
    total_courses: int
    completed_courses: int
    in_progress: int
    completion_rate: float

class UserInfo(BaseModel):
    id: str
    name: str
    username: str
    email: str
    profile_image: str
    grade_level: str
    member_since: str

class LearningProfile(BaseModel):
    intellectual_level: Optional[str]
    learning_style: Optional[str]
    interests: List[str]

class DashboardOverview(BaseModel):
    message: str
    user: UserInfo
    stats: UserStats
    profile_completed: bool
    learning_profile: LearningProfile

class LearningInsights(BaseModel):
    profile_completed: bool
    insights: Optional[Dict[str, Any]] = None
    recommendations: Optional[Dict[str, Any]] = None

class ProgressSummary(BaseModel):
    total_courses: int
    completed: int
    in_progress: int
    not_started: int
    overall_completion: float

class CourseProgress(BaseModel):
    course_id: str
    status: str
    progress_percentage: float
    last_accessed: Optional[datetime]

class UserProgress(BaseModel):
    user_id: str
    summary: ProgressSummary
    progress_details: List[CourseProgress]

class Activity(BaseModel):
    id: str
    activity_type: str
    description: str
    timestamp: datetime
    course_id: Optional[str] = None

class RecentActivity(BaseModel):
    count: int
    activities: List[Activity]

class WeeklyStatsSummary(BaseModel):
    total_activities: int
    active_days: int
    average_daily_activities: float

class WeeklyStatsPeriod(BaseModel):
    start: str
    end: str

class WeeklyStats(BaseModel):
    period: WeeklyStatsPeriod
    summary: WeeklyStatsSummary
    daily_breakdown: Dict[str, int]

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from base import MongoModel, PyObjectId

class HomeworkSubmissionBase(BaseModel):
    subject: str
    image_url: str #one image per submission
    extracted_text: Optional[str] = None
    ai_solution: Optional[str] = None
    explanation_steps: List[str] = []

class HomeworkSubmissionCreate(HomeworkSubmissionBase):
    pass

class HomeworkSubmissionDB(MongoModel, HomeworkSubmissionBase):
    user_id: PyObjectId
    created_at: datetime

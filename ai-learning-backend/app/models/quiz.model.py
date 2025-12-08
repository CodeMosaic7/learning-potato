from pydantic import BaseModel
from datetime import datetime
from typing import List
from base import MongoModel, PyObjectId

class QuizBase(BaseModel):
    subject: str
    difficulty: str
    total_questions: int
    time_limit: int   # seconds

class QuizCreate(QuizBase):
    pass

class QuizDB(MongoModel, QuizBase):
    user_id: PyObjectId
    created_at: datetime


class QuestionBase(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: str

class QuestionCreate(QuestionBase):
    pass

class QuestionDB(MongoModel, QuestionBase):
    quiz_id: PyObjectId

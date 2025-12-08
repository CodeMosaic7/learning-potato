from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict
from base import MongoModel, PyObjectId

class QuizAttemptBase(BaseModel):
    answers: List[Dict]   # {question_id, selected}
    score: int

class QuizAttemptCreate(QuizAttemptBase):
    pass

class QuizAttemptDB(MongoModel, QuizAttemptBase):
    quiz_id: PyObjectId
    user_id: PyObjectId
    attempted_at: datetime

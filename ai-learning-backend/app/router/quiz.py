from fastapi import APIRouter, Body, Depends
from app.domains.identity import AuthenticatedStudent, get_current_student
from app.services.quiz.quiz_generator import create_quiz

router = APIRouter(prefix="/quiz", tags=["Quiz Generator"])

@router.post("/")
async def generate_quiz_api(
    mental_age: int = Body(...),
    topic: str = Body(...),
    num_questions: int = Body(5),
    time_limit: int=Body(10),
    current_student: AuthenticatedStudent = Depends(get_current_student),
):
    return await create_quiz(mental_age, topic, num_questions,time_limit)

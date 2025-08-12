from fastapi import APIRouter, Body
from app.services.quiz.quiz_generator import create_quiz

router = APIRouter(prefix="/quiz", tags=["Quiz Generator"])

@router.post("/")
async def generate_quiz_api(
    mental_age: int = Body(...),
    topic: str = Body(...),
    num_questions: int = Body(5),
    time_limit: int=Body(10)
):
    return await create_quiz(mental_age, topic, num_questions,time_limit)

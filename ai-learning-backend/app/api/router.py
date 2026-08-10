from fastapi import APIRouter
from app.authentication.routes import router as auth_router
from app.router.chatbot import router as chatbot_router
from app.router.dashboard import router as dashboard_router
from app.router.homework import router as homework_router
from app.router.quiz import router as quiz_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(chatbot_router)
api_router.include_router(dashboard_router)
api_router.include_router(homework_router)
api_router.include_router(quiz_router)

# Entry for fastapi
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.db import engine
from fastapi.middleware.cors import CORSMiddleware
from app.models import Base, User  # Ensure `User` is imported
from app.authentication.routes import router as auth_router
from app.router.chatbot import router as chatbot_router
from app.router.quiz import router as quiz_router
from app.router.homework import router as hw_router
import os


Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI Authentication System", version="1.0.0")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL], 
    allow_credentials=True,
    
    allow_headers=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)


@app.get("/")
async def root():
    return {"message": "FastAPI Authentication System is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/users/")
def read_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# Include routers
app.include_router(auth_router)
app.include_router(chatbot_router)
app.include_router(quiz_router)
app.include_router(hw_router)

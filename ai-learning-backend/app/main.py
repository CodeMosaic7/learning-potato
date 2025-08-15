# Entry point
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from app.dependencies import get_db
from app.db import engine
from app.models import Base, User  
from app.authentication.routes import router as auth_router
from app.router.chatbot import router as chatbot_router
from app.router.quiz import router as quiz_router
from app.router.homework import router as hw_router
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Learning Platform", version="1.0.0")

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

# testing purpose
@app.get("/users/")
def read_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# routers
app.include_router(auth_router)
app.include_router(chatbot_router)
app.include_router(quiz_router)
app.include_router(hw_router)

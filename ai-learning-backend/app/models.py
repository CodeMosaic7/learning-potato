from sqlalchemy import Column, Integer,String,Boolean,DateTime,func,JSON
from app.db import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name= Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    conversation_state=Column(JSON,nullable=True)
    mental_age = Column(Integer, nullable=True)
    assessment_data = Column(JSON, nullable=True)  
    assessment_date = Column(DateTime(timezone=True), nullable=True)
    quiz_results = Column(JSON, nullable=True)


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    questions = Column(JSON, nullable=False)  
    marks = Column(Integer, nullable=False)
    time_limit = Column(Integer, nullable=False)  
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


"""
Entities:

User:
- user_id (PK)
- name, email, password_hash, date_of_birth, gender, grade_level, created_at, profile_image(optional)

UserProfile
- profile_id (PK)
- user_id (FK)
- bio, interests, learning_goals, preferred_learning_style
- intellectual_level, emotional_state
- strengths, weaknesses, learning_style, recommended_subjects, updated_at


ChatSession:
- session_id (PK)
- user_id (FK)
- started_at, ended_at, estimated_age, age_category, mental_state_summary, risk_level, final_recommendation, completed

ChatMessage:
- message_id (PK)
- session_id (FK)
- sender, content, timestamp

HomeworkSubmission:
- submission_id (PK)
- user_id (FK)
- subject, image_url, extracted_text, ai_solution, explanation_steps, created_at

Quiz:
- quiz_id (PK)
- user_id (FK)
- subject, difficulty, total_questions, time_limit, created_at

Question:
- question_id (PK)
- quiz_id (FK)
- question_text, options, correct_answer

QuizAttempt:
- attempt_id (PK)
- quiz_id (FK)
- user_id (FK)
- answers, score, attempted_at

Relationships:
- User (1) — (∞) ChatSession
- ChatSession (1) — (∞) ChatMessage
- User (1) — (∞) HomeworkSubmission
- User (1) — (∞) Quiz
- Quiz (1) — (∞) Question
- User (1) — (∞) QuizAttempt
- Quiz (1) — (∞) QuizAttempt
- User (1) — (1) UserProfile

"""
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
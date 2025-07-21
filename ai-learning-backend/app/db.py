import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, JSON, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./auth_app.db")

# SQLAlchemy setup
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Needed for SQLite
    poolclass=StaticPool,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ✅ User Database Utility

# ✅ Create tables if run directly
if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("✅ Database and tables created successfully.")

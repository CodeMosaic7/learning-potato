from app.db import Session
from app.models import User
import datetime
from typing import Optional
class UserDatabase:
    def __init__(self, db_session: Session):
        self.db = db_session

    def save_mental_age(self, user_id: int, mental_age: int, assessment_data: dict):
        """Save mental age assessment to database"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                user.mental_age = mental_age
                user.assessment_data = assessment_data
                user.assessment_date = datetime.now()
                self.db.commit()
                print(f"✅ Saved mental age {mental_age} for user {user_id}")
            else:
                print(f"❌ User {user_id} not found")
        except Exception as e:
            print(f"❌ Error saving mental age: {e}")
            self.db.rollback()

    def get_user_mental_age(self, user_id: int) -> Optional[int]:
        """Get user's mental age from database"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            return user.mental_age if user else None
        except Exception as e:
            print(f"❌ Error getting mental age: {e}")
            return None


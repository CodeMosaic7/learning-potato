from app.db import Session
from app.models import User
import datetime
from typing import Optional
import json
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
    
    # Add these methods to your UserDatabase class

    def save_conversation_state(self, user_id: int, state_data: dict):
        """Save conversation state to database"""
        try:
            # You can either add a new table for conversation_states or 
            # use an existing table with a JSON column
            
            # Option 1: If you have a conversation_states table
            query = """
            INSERT INTO conversation_states (user_id, state_data, updated_at)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE 
            state_data = VALUES(state_data),
            updated_at = VALUES(updated_at)
            """
            self.db_session.execute(query, (user_id, json.dumps(state_data), datetime.now()))
            self.db_session.commit()
            
            # Option 2: If you want to add it to users table
            # query = """
            # UPDATE users 
            # SET conversation_state = %s, updated_at = %s 
            # WHERE id = %s
            # """
            # self.db_session.execute(query, (json.dumps(state_data), datetime.now(), user_id))
            # self.db_session.commit()
            
        except Exception as e:
            print(f"Error saving conversation state: {e}")
            self.db_session.rollback()

    def get_conversation_state(self, user_id: int) -> dict:
        """Get conversation state from database"""
        try:
            # Option 1: From conversation_states table
            query = "SELECT state_data FROM conversation_states WHERE user_id = %s"
            result = self.db_session.execute(query, (user_id,)).fetchone()
            
            # Option 2: From users table
            # query = "SELECT conversation_state FROM users WHERE id = %s"
            # result = self.db_session.execute(query, (user_id,)).fetchone()
            
            if result and result[0]:
                return json.loads(result[0])
            return None
            
        except Exception as e:
            print(f"Error getting conversation state: {e}")
            return None

    def clear_conversation_state(self, user_id: int):
        """Clear conversation state when assessment is complete"""
        try:
            # Option 1: Delete from conversation_states table
            query = "DELETE FROM conversation_states WHERE user_id = %s"
            self.db_session.execute(query, (user_id,))
            self.db_session.commit()
            
            # Option 2: Update users table
            # query = "UPDATE users SET conversation_state = NULL WHERE id = %s"
            # self.db_session.execute(query, (user_id,))
            # self.db_session.commit()
            
        except Exception as e:
            print(f"Error clearing conversation state: {e}")
            self.db_session.rollback()


from sqlalchemy.orm import Session
from app import models, schemas
from authentication.auth import get_password_hash

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

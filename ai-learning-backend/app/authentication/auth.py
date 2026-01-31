from datetime import datetime, timedelta, timezone
from typing import Optional, Union
import os
from dotenv import load_dotenv
from jose import jwt,JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException,status,Cookie,Depends,Request,Response
from fastapi.security import OAuth2PasswordBearer,HTTPBearer

from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models import User
from app.schemas import TokenData                                                   

load_dotenv()
# Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
 
# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Authentication
def authenticate_user(db: Session, email: str, password: str) -> Union[User, bool]:
    # print(f"DEBUG: Looking up user: {email}")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"DEBUG: User not found: {email}")
        return False        
    if not verify_password(password, user['hashed_password']):
        return False        
    # print(f"DEBUG: Password verification successful")
    return user

# Extracting token from cookies
async def get_token_from_cookie(request:Request):
    token=token = request.cookies.get("access_token")
    print("Token from cookie:", token)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer "},
        )
    return token

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def run_if_authenticated(user: User):
    if user and getattr(user, 'is_authenticated', False):
        print("Running protected logic...")
    else:
        print("Access denied.")

async def get_current_user(
    request: Request,
    db=Depends(get_db)
):
    token = request.cookies.get("access_token")
    print(token)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    # Normalize MongoDB document
    user["id"] = str(user["_id"])
    user.pop("_id", None)
    user.pop("password_hash", None)
    return user


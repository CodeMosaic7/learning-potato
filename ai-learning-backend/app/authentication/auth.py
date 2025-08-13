from datetime import datetime, timedelta, timezone
from typing import Optional, Union
import os
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException,status,Cookie,Depends
from fastapi.security import OAuth2PasswordBearer,HTTPBearer
from sqlalchemy.orm import Session
from dotenv import load_dotenv
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
    print(f"DEBUG: Looking up user: {email}")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        print(f"DEBUG: User not found: {email}")
        return False
        
    print(f"DEBUG: User found, checking password")
    if not verify_password(password, user.hashed_password):
        print(f"DEBUG: Password verification failed")
        return False
        
    print(f"DEBUG: Password verification successful")
    return user

# Extracting token from cookies
async def get_token_from_cookie(token:Optional[str] = Cookie(None, alias="access_token")):
    print("Token from cookie:", token)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token
# Dependency to Get Current User
async def get_current_user(
    token: str = Depends(get_token_from_cookie),
    db: Session = Depends(get_db)
) -> User:
    print("Token",token)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == token_data.email).first()
    print(user)
    if user is None:
        raise credentials_exception
    
    return user


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
from fastapi import APIRouter, Depends, HTTPException, status,Response,Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import timedelta

from app.dependencies import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, Token,UserLogin
from app.authentication.auth import (
    get_password_hash, 
    authenticate_user, 
    create_access_token, 
    # get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # look for user in database, if it exists
    existing_user = db.query(User).filter(0
        (User.email == user.email) | (User.username == user.username)
    ).first()
    # if user already exists, raise an error
    if existing_user:
        if existing_user.email == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            raise HTTPException(status_code=400, detail="Username already taken")
    # else create a new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    try:
        # add to database
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="User registration failed")
    return db_user

@router.post("/login", response_model=Token)
async def login_user(login_data: UserLogin,response: Response, db: Session = Depends(get_db)):
    # look if user exists
    # authenticate user
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # generate access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    # set access token in response cookies
    response.set_cookie(
        key="access_token",
        value=access_token,  
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="None",  
        secure=True,
    
    )
    print(f"DEBUG: Created access token: {access_token[:20]}...")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello {current_user.username}, this is a protected route!"}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}



@router.get("/debug-token")
async def debug_token(request: Request):
    headers = dict(request.headers)
    auth_header = headers.get("authorization", "Not found")
    
    return {
        "auth_header": auth_header,
        "headers": headers
    }
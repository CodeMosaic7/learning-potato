from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from datetime import timedelta
from dotenv import load_dotenv
import datetime
from app.dependencies import get_db
from app.model.user_model import UserCreate, UserResponse, UserLogin, Token, UserOut
from app.authentication.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)
from app.middleware.cloudinary_middleware import upload_profile_image

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Authentication"])

# REGISTER
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db=Depends(get_db)):
    users_collection = db["users"]
    # check if user exists
    existing_user = await users_collection.find_one({
        "$or": [
            {"email": user.email},
            {"username": user.username}
        ]
    })
    if existing_user:
        if existing_user.get("email") == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            raise HTTPException(status_code=400, detail="Username already taken")
    if user.profile_image:
        url=await upload_profile_image(image_data=user.profile_image,user_id=user.username)
    else:
        url=None
    hashed_password = get_password_hash(user.password)
    db_user = {
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "password_hash": hashed_password,
        "date_of_birth": user.date_of_birth or "",
        "gender": user.gender,
        "grade_level": user.grade_level,
        "profile_image": url or "",
        "created_at": datetime.datetime.now(),
    }
    result = await users_collection.insert_one(db_user)
    return UserOut(
        id=str(result.inserted_id),
        **db_user
    )

# LOGIN
@router.post("/login", response_model=Token)
async def login_user(login_data: UserLogin, response: Response, db=Depends(get_db)):
    users_collection = db["users"]
    user = await users_collection.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="None",
        secure=True
    )
    return {"access_token": access_token, "token_type": "bearer"}

# USER INFO ENDPOINTS
@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user=Depends(get_current_user)):
    return current_user

@router.get("/user-details", response_model=UserResponse)
async def get_user_details(current_user=Depends(get_current_user)):
    return current_user

# PROTECTED
@router.get("/protected")
async def protected_route(current_user=Depends(get_current_user)):
    return {"message": f"Hello {current_user['username']}, this is a protected route!"}

# LOGOUT
@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}

# DEBUG TOKEN
@router.get("/debug-token")
async def debug_token(request: Request):
    headers = dict(request.headers)
    auth_header = headers.get("authorization", "Not found")
    return {"auth_header": auth_header, "headers": headers}

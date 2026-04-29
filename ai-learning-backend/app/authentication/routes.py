from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from datetime import timedelta, datetime, timezone
from dotenv import load_dotenv
from app import mongo_db
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

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    existing_user = await mongo_db.user_collection.find_one({
        "$or": [
            {"email": user.email},
            {"username": user.username}
        ]
    })
    print(f"Existing user check: {existing_user}")  
    if existing_user:
        if existing_user.get("email") == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            raise HTTPException(status_code=400, detail="Username already taken")
    profile_image_url = None
    if getattr(user, "profile_image", None):
        profile_image_url = await upload_profile_image(
            image_data=user.profile_image,
            user_id=user.username
        )
    hashed_password = get_password_hash(user.password)
    created_at = datetime.now(timezone.utc)
    db_user = {
        "email": user.email,
        "username": user.username,
        "full_name": user.name,
        "hashed_password": hashed_password,
        "is_active": True,
        "is_verified": False,
        "created_at": created_at,
        "updated_at": None,
        "profile": {
            "date_of_birth": getattr(user, "date_of_birth", None),
            "gender": getattr(user, "gender", None),
            "grade_level": getattr(user, "grade_level", None),
            "profile_image": profile_image_url,
        },
        "conversation_state": {},
        "mental_age": None,
        "assessment": {
            "data": None,
            "date": None
        }
    }
    await mongo_db.user_collection.insert_one(db_user)
    # also initialize user_profile and other needed collections for the user_id
    user_id = db_user["_id"]
    await mongo_db.user_profiles.insert_one({"user_id": user_id})
    await mongo_db.user_courses.insert_one({"user_id": user_id})
    await mongo_db.user_progress.insert_one({"user_id": user_id})
    return UserOut(
        name=user.name,
        username=user.username,
        email=user.email,
        date_of_birth=user.date_of_birth,
        gender=user.gender,
        grade_level=user.grade_level,
        profile_image=profile_image_url or "",
        created_at=created_at
    )


@router.post("/login", response_model=Token)
async def login_user(login_data: UserLogin, response: Response):
    user = await mongo_db.user_collection.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["hashed_password"]):
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
        samesite="none",
        secure=True
    )
    return Token(email=user["email"])


@router.get("/me", response_model=UserResponse)
async def read_user_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user


@router.get("/user-details", response_model=UserResponse)
async def get_user_details(current_user=Depends(get_current_user)):
    return current_user


@router.get("/protected")
async def protected_route(current_user=Depends(get_current_user)):
    return {"message": f"Hello {current_user['username']}, this is a protected route!"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}


@router.get("/debug-token")
async def debug_token(request: Request):
    headers = dict(request.headers)
    auth_header = headers.get("authorization", "Not found")
    return {"auth_header": auth_header, "headers": headers}
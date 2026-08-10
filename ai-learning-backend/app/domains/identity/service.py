from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple
from bson import ObjectId
from fastapi import status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.config import Settings
from app.core.exceptions import AppException
from app.db.collections import Collections
from app.domains.identity.passwords import hash_password, verify_password
from app.domains.identity.repository import RefreshSessionRepository, UserRepository
from app.domains.identity.schemas import RegisterStudentRequest, StudentOut, StudentProfileData
from app.domains.identity.tokens import create_access_token, generate_opaque_refresh_token, hash_token


class IdentityService:
    def __init__(self, db: AsyncIOMotorDatabase, settings: Settings):
        self.db = db
        self.settings = settings
        self.user_repo = UserRepository(db)
        self.refresh_repo = RefreshSessionRepository(db)

    def _to_student_out(self, user_doc: Dict[str, Any]) -> StudentOut:
        profile_doc = user_doc.get("profile", {})
        profile_data = StudentProfileData(
            date_of_birth=profile_doc.get("date_of_birth"),
            gender=profile_doc.get("gender"),
            grade_level=profile_doc.get("grade_level"),
            profile_image=profile_doc.get("profile_image", ""),
        )
        return StudentOut(
            id=str(user_doc["_id"]),
            email=user_doc["email"],
            username=user_doc["username"],
            full_name=user_doc.get("full_name", user_doc["username"]),
            role="student",
            account_status=user_doc.get("account_status", "active"),
            is_verified=user_doc.get("is_verified", False),
            profile=profile_data,
        )

    async def register_student(self, req: RegisterStudentRequest) -> StudentOut:
        normalized_email = req.email.lower().strip()
        normalized_username = req.username.strip()

        if await self.user_repo.find_by_email(normalized_email):
            raise AppException(
                message="An account with this email address already exists.",
                code="EMAIL_ALREADY_REGISTERED",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if await self.user_repo.find_by_username(normalized_username):
            raise AppException(
                message="This username is already taken.",
                code="USERNAME_ALREADY_REGISTERED",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        hashed_pwd = hash_password(req.password)
        now = datetime.now(timezone.utc)

        db_user = {
            "email": normalized_email,
            "username": normalized_username,
            "full_name": req.name,
            "hashed_password": hashed_pwd,
            "role": "student",
            "account_status": "active",
            "is_active": True,
            "is_verified": False,
            "created_at": now,
            "updated_at": now,
            "profile": {
                "date_of_birth": req.date_of_birth,
                "gender": req.gender,
                "grade_level": req.grade_level,
                "profile_image": req.profile_image or "",
            },
        }

        res = await self.user_repo.insert_one(db_user)
        user_id = res.inserted_id
        db_user["_id"] = user_id

        # Initialize student profile & progress containers
        await self.db[Collections.STUDENT_PROFILES].insert_one({
            "user_id": user_id,
            "bio": None,
            "interests": [],
            "created_at": now,
            "updated_at": now,
        })
        await self.db[Collections.USER_COURSES].insert_one({
            "user_id": user_id,
            "enrolled_courses": [],
            "completed_courses": [],
            "created_at": now,
            "updated_at": now,
        })
        await self.db[Collections.USER_PROGRESS].insert_one({
            "user_id": user_id,
            "progress": {},
            "last_activity": None,
            "created_at": now,
            "updated_at": now,
        })

        return self._to_student_out(db_user)

    async def authenticate_student(self, email: str, password: str) -> Tuple[StudentOut, str, str]:
        user_doc = await self.user_repo.find_by_email(email)
        if not user_doc or not verify_password(password, user_doc.get("hashed_password", "")):
            raise AppException(
                message="Incorrect email or password.",
                code="INVALID_CREDENTIALS",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        if user_doc.get("account_status") != "active" or not user_doc.get("is_active", True):
            raise AppException(
                message="Account is inactive or disabled.",
                code="ACCOUNT_INACTIVE",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        user_id_str = str(user_doc["_id"])
        access_token = create_access_token(user_id_str, user_doc["email"], "student", self.settings)
        raw_refresh_token = generate_opaque_refresh_token()
        refresh_hash = hash_token(raw_refresh_token)

        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=self.settings.REFRESH_TOKEN_EXPIRE_DAYS)

        session_doc = {
            "user_id": user_doc["_id"],
            "token_hash": refresh_hash,
            "created_at": now,
            "expires_at": expires_at,
            "revoked_at": None,
        }
        await self.refresh_repo.insert_one(session_doc)

        await self.user_repo.update_one(
            {"_id": user_doc["_id"]},
            {"$set": {"last_login_at": now, "updated_at": now}},
        )

        return self._to_student_out(user_doc), access_token, raw_refresh_token

    async def refresh_session(self, raw_refresh_token: str) -> Tuple[StudentOut, str, str]:
        if not raw_refresh_token:
            raise AppException(
                message="Refresh token cookie missing.",
                code="UNAUTHENTICATED",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        refresh_hash = hash_token(raw_refresh_token)
        session = await self.refresh_repo.find_by_token_hash(refresh_hash)
        if not session:
            raise AppException(
                message="Invalid or revoked refresh session.",
                code="INVALID_REFRESH_TOKEN",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        now = datetime.now(timezone.utc)
        expires_at = session["expires_at"]
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < now:
            await self.refresh_repo.revoke_session(refresh_hash)
            raise AppException(
                message="Refresh session has expired. Please log in again.",
                code="REFRESH_TOKEN_EXPIRED",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        user_doc = await self.user_repo.find_by_id(session["user_id"])
        if not user_doc or user_doc.get("account_status") != "active":
            await self.refresh_repo.revoke_session(refresh_hash)
            raise AppException(
                message="Account associated with session is no longer active.",
                code="ACCOUNT_INACTIVE",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        # Rotate refresh token
        await self.refresh_repo.revoke_session(refresh_hash)

        user_id_str = str(user_doc["_id"])
        new_access_token = create_access_token(user_id_str, user_doc["email"], "student", self.settings)
        new_raw_refresh_token = generate_opaque_refresh_token()
        new_refresh_hash = hash_token(new_raw_refresh_token)

        new_session_doc = {
            "user_id": user_doc["_id"],
            "token_hash": new_refresh_hash,
            "created_at": now,
            "expires_at": now + timedelta(days=self.settings.REFRESH_TOKEN_EXPIRE_DAYS),
            "revoked_at": None,
        }
        await self.refresh_repo.insert_one(new_session_doc)

        return self._to_student_out(user_doc), new_access_token, new_raw_refresh_token

    async def logout_session(self, raw_refresh_token: Optional[str]) -> None:
        if raw_refresh_token:
            refresh_hash = hash_token(raw_refresh_token)
            await self.refresh_repo.revoke_session(refresh_hash)

    async def get_student_by_id(self, user_id: str) -> StudentOut:
        if not UserRepository.is_valid_object_id(user_id):
            raise AppException(
                message="Invalid student ID format.",
                code="INVALID_STUDENT_ID",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        user_doc = await self.user_repo.find_by_id(user_id)
        if not user_doc or user_doc.get("account_status") != "active":
            raise AppException(
                message="Student not found or account inactive.",
                code="RESOURCE_NOT_FOUND",
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return self._to_student_out(user_doc)

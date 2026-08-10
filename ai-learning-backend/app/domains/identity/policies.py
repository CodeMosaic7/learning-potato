from typing import Any, Dict, Optional
from bson import ObjectId
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import Settings, get_settings
from app.core.exceptions import AppException
from app.db.client import get_database
from app.domains.identity.repository import UserRepository
from app.domains.identity.schemas import StudentOut
from app.domains.identity.tokens import decode_access_token

security = HTTPBearer(auto_error=False)


class AuthenticatedStudent(StudentOut):
    _mongo_id: ObjectId

    @property
    def object_id(self) -> ObjectId:
        return ObjectId(self.id)


async def get_current_student(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    settings: Settings = Depends(get_settings),
    db=Depends(get_database),
) -> AuthenticatedStudent:
    raw_token = None

    if credentials and credentials.credentials:
        raw_token = credentials.credentials
    else:
        # Fallback check for access_token cookie if present for backward compatibility
        raw_token = request.cookies.get("access_token")

    if not raw_token:
        raise AppException(
            message="Authentication credentials were not provided.",
            code="UNAUTHENTICATED",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        payload = decode_access_token(raw_token, settings)
    except ValueError as exc:
        raise AppException(
            message=str(exc),
            code="INVALID_ACCESS_TOKEN",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id or not UserRepository.is_valid_object_id(user_id):
        raise AppException(
            message="Invalid access token payload.",
            code="INVALID_ACCESS_TOKEN",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user_repo = UserRepository(db)
    user_doc = await user_repo.find_by_id(user_id)

    if not user_doc or user_doc.get("account_status") != "active":
        raise AppException(
            message="Student account does not exist or is disabled.",
            code="ACCOUNT_INACTIVE",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    profile_doc = user_doc.get("profile", {})
    student = AuthenticatedStudent(
        id=str(user_doc["_id"]),
        email=user_doc["email"],
        username=user_doc["username"],
        full_name=user_doc.get("full_name", user_doc["username"]),
        role="student",
        account_status=user_doc.get("account_status", "active"),
        is_verified=user_doc.get("is_verified", False),
        profile={
            "date_of_birth": profile_doc.get("date_of_birth"),
            "gender": profile_doc.get("gender"),
            "grade_level": profile_doc.get("grade_level"),
            "profile_image": profile_doc.get("profile_image", ""),
        },
    )
    return student


def verify_resource_ownership(resource_owner_id: str | ObjectId, current_student: AuthenticatedStudent) -> None:
    owner_str = str(resource_owner_id)
    if owner_str != current_student.id:
        raise AppException(
            message="You do not have permission to access this resource.",
            code="RESOURCE_ACCESS_DENIED",
            status_code=status.HTTP_403_FORBIDDEN,
        )

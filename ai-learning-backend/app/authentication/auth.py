from typing import Any, Dict
from fastapi import Depends, Request
from app.domains.identity.policies import AuthenticatedStudent, get_current_student
from app.domains.identity.passwords import hash_password as get_password_hash, verify_password

SECRET_KEY = "legacy-compat"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


async def get_current_user(
    student: AuthenticatedStudent = Depends(get_current_student),
) -> Dict[str, Any]:
    return {
        "id": student.id,
        "_id": student.object_id,
        "email": student.email,
        "username": student.username,
        "full_name": student.full_name,
        "role": student.role,
        "account_status": student.account_status,
        "is_active": True,
        "profile": student.profile.model_dump() if student.profile else {},
    }
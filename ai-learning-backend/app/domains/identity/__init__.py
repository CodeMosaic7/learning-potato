from app.domains.identity.policies import AuthenticatedStudent, get_current_student, verify_resource_ownership
from app.domains.identity.schemas import LoginStudentRequest, LogoutResponse, RefreshTokenResponse, RegisterStudentRequest, StudentOut, TokenResponse
from app.domains.identity.service import IdentityService

__all__ = [
    "RegisterStudentRequest",
    "LoginStudentRequest",
    "TokenResponse",
    "RefreshTokenResponse",
    "LogoutResponse",
    "StudentOut",
    "IdentityService",
    "get_current_student",
    "AuthenticatedStudent",
    "verify_resource_ownership",
]

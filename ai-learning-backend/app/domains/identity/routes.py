from typing import Optional
from fastapi import APIRouter, Cookie, Depends, Request, Response, status
from app.core.config import Settings, get_settings
from app.db.client import get_database
from app.domains.identity.policies import AuthenticatedStudent, get_current_student
from app.domains.identity.schemas import (
    LoginStudentRequest,
    LogoutResponse,
    RefreshTokenResponse,
    RegisterStudentRequest,
    StudentOut,
    TokenResponse,
)
from app.domains.identity.service import IdentityService

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _set_refresh_cookie(response: Response, raw_refresh_token: str, settings: Settings) -> None:
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=raw_refresh_token,
        httponly=True,
        max_age=max_age,
        expires=max_age,
        path=settings.REFRESH_COOKIE_PATH,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        domain=settings.COOKIE_DOMAIN,
    )


def _clear_refresh_cookie(response: Response, settings: Settings) -> None:
    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        path=settings.REFRESH_COOKIE_PATH,
        domain=settings.COOKIE_DOMAIN,
    )


@router.post(
    "/register",
    response_model=StudentOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register new student account",
    description="Registers a new student account and initializes baseline user profile state.",
)
async def register(
    req: RegisterStudentRequest,
    settings: Settings = Depends(get_settings),
    db=Depends(get_database),
):
    service = IdentityService(db, settings)
    return await service.register_student(req)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Student Login",
    description="Authenticates student credentials and sets an HttpOnly refresh cookie.",
)
async def login(
    req: LoginStudentRequest,
    response: Response,
    settings: Settings = Depends(get_settings),
    db=Depends(get_database),
):
    service = IdentityService(db, settings)
    student, access_token, raw_refresh_token = await service.authenticate_student(req.email, req.password)
    _set_refresh_cookie(response, raw_refresh_token, settings)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        student=student,
    )


@router.post(
    "/refresh",
    response_model=RefreshTokenResponse,
    summary="Refresh Access Token",
    description="Rotates the refresh token stored in the HttpOnly cookie and issues a new access token.",
)
async def refresh(
    response: Response,
    refresh_token: Optional[str] = Cookie(None, alias="refresh_token"),
    settings: Settings = Depends(get_settings),
    db=Depends(get_database),
):
    service = IdentityService(db, settings)
    student, new_access_token, new_raw_refresh_token = await service.refresh_session(refresh_token)
    _set_refresh_cookie(response, new_raw_refresh_token, settings)

    return RefreshTokenResponse(
        access_token=new_access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        student=student,
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Student Logout",
    description="Revokes the active refresh session and clears the HttpOnly cookie.",
)
async def logout(
    response: Response,
    refresh_token: Optional[str] = Cookie(None, alias="refresh_token"),
    settings: Settings = Depends(get_settings),
    db=Depends(get_database),
):
    service = IdentityService(db, settings)
    await service.logout_session(refresh_token)
    _clear_refresh_cookie(response, settings)
    return LogoutResponse(status="logged_out")


@router.get(
    "/me",
    response_model=StudentOut,
    summary="Get Current Authenticated Student",
    description="Returns the active authenticated student profile.",
)
async def get_me(
    current_student: AuthenticatedStudent = Depends(get_current_student),
):
    return current_student

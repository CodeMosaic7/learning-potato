from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.core.config import get_settings
from app.db.health import check_database_health

health_router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class ReadinessChecks(BaseModel):
    database: str


class ReadinessResponse(BaseModel):
    status: str
    checks: ReadinessChecks


@health_router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health Check",
    description="Confirms the API process is running without checking external dependencies.",
)
async def health_check():
    settings = get_settings()
    return HealthResponse(
        status="ok",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
    )


@health_router.get(
    "/ready",
    response_model=ReadinessResponse,
    summary="Service Readiness Check",
    description="Confirms required backend dependencies (such as MongoDB) are operational.",
)
async def readiness_check():
    db_result = await check_database_health()
    if not db_result["healthy"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "not_ready",
                "checks": {"database": "error"},
            },
        )
    return ReadinessResponse(
        status="ready",
        checks=ReadinessChecks(database="ok"),
    )

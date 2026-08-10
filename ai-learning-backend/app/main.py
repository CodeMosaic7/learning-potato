from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.health_routes import health_router
from app.api.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.core.middleware import register_middleware
from app.db.client import close_database, connect_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    configure_logging(settings)

    await connect_database(app, settings)
    from app.db.client import db_client
    from app.db.indexes import ensure_identity_indexes
    if db_client.client:
        await ensure_identity_indexes(db_client.get_database())
    yield
    await close_database(app)


def create_application() -> FastAPI:
    settings = get_settings()

    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        lifespan=lifespan,
    )

    register_middleware(application, settings)
    register_exception_handlers(application)

    application.include_router(health_router)
    application.include_router(api_router, prefix=settings.API_PREFIX)

    return application


app = create_application()

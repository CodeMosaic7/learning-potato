import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from app.core.config import Settings, get_settings
from app.main import app


@pytest.fixture
def override_settings(monkeypatch):
    settings = Settings(
        APP_NAME="Mello Test AI",
        APP_VERSION="0.0.1-test",
        APP_ENV="test",
        DATABASE_NAME="MELLO_TEST_DB",
        SECRET_KEY="test-secret-key-12345",
    )
    monkeypatch.setattr("app.main.get_settings", lambda: settings)
    monkeypatch.setattr("app.core.config.get_settings", lambda: settings)
    return settings


@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        yield client

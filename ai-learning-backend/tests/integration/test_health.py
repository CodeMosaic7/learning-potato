import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "service" in data
        assert "version" in data


@pytest.mark.asyncio
async def test_readiness_endpoint_unhealthy(monkeypatch):
    async def mock_unhealthy():
        return {"status": "error", "healthy": False}

    monkeypatch.setattr("app.api.health_routes.check_database_health", mock_unhealthy)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        response = await client.get("/ready")
        assert response.status_code == 503
        data = response.json()
        assert data["error"]["code"] == "HTTP_ERROR"


@pytest.mark.asyncio
async def test_readiness_endpoint_healthy(monkeypatch):
    async def mock_healthy():
        return {"status": "ok", "healthy": True}

    monkeypatch.setattr("app.api.health_routes.check_database_health", mock_healthy)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        response = await client.get("/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
        assert data["checks"]["database"] == "ok"

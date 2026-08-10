import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.db.client import get_database


@pytest.mark.asyncio
async def test_student_auth_flow(monkeypatch):
    # Mock Database and identity operations for test isolation
    users_db = {}
    sessions_db = {}

    class MockUserRepo:
        def __init__(self, db): pass
        @staticmethod
        def is_valid_object_id(val): return True
        @staticmethod
        def to_object_id(val): return "user_id_1"
        async def find_by_email(self, email): return users_db.get(email.lower())
        async def find_by_username(self, username): return None
        async def find_by_id(self, user_id): return users_db.get(str(user_id))
        async def insert_one(self, doc):
            doc["_id"] = "user_id_1"
            users_db[doc["email"]] = doc
            users_db["user_id_1"] = doc
            return type("Res", (), {"inserted_id": "user_id_1"})()
        async def update_one(self, filter_q, update_q): pass

    class MockRefreshRepo:
        def __init__(self, db): pass
        async def insert_one(self, doc):
            sessions_db[doc["token_hash"]] = doc
        async def find_by_token_hash(self, token_hash):
            return sessions_db.get(token_hash)
        async def revoke_session(self, token_hash):
            if token_hash in sessions_db:
                sessions_db[token_hash]["revoked_at"] = "now"

    class MockDb:
        def __getitem__(self, name):
            async def async_noop(*args, **kwargs):
                return None
            return type("MockCol", (), {
                "insert_one": async_noop,
                "find_one": async_noop,
                "update_one": async_noop,
            })()

    monkeypatch.setattr("app.domains.identity.service.UserRepository", MockUserRepo)
    monkeypatch.setattr("app.domains.identity.service.RefreshSessionRepository", MockRefreshRepo)
    monkeypatch.setattr("app.domains.identity.policies.UserRepository", MockUserRepo)
    app.dependency_overrides[get_database] = lambda: MockDb()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        # 1. Register student
        reg_resp = await client.post("/auth/register", json={
            "email": "student@example.com",
            "username": "student1",
            "password": "securepassword123",
            "name": "Student One",
        })
        assert reg_resp.status_code == 201
        assert reg_resp.json()["email"] == "student@example.com"
        assert reg_resp.json()["role"] == "student"

        # 2. Login
        login_resp = await client.post("/auth/login", json={
            "email": "student@example.com",
            "password": "securepassword123",
        })
        assert login_resp.status_code == 200
        token_data = login_resp.json()
        assert "access_token" in token_data
        assert "refresh_token" in login_resp.cookies
        access_token = token_data["access_token"]

        # 3. GET /auth/me
        me_resp = await client.get("/auth/me", headers={"Authorization": f"Bearer {access_token}"})
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == "student@example.com"

        # 4. Refresh token
        refresh_resp = await client.post("/auth/refresh", cookies={"refresh_token": login_resp.cookies["refresh_token"]})
        assert refresh_resp.status_code == 200
        assert "access_token" in refresh_resp.json()

        # 5. Logout
        logout_resp = await client.post("/auth/logout", cookies={"refresh_token": refresh_resp.cookies["refresh_token"]})
        assert logout_resp.status_code == 200
        assert logout_resp.json()["status"] == "logged_out"

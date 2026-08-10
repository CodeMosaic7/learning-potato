from app.main import app


def test_app_creation():
    assert app.title == "Mello AI Learning Platform"


def test_routes_registered():
    routes = [route.path for route in app.routes]
    assert "/health" in routes
    assert "/ready" in routes
    assert "/auth/login" in routes
    assert "/chatbot/initialize" in routes
    assert "/dashboard/" in routes
    assert "/homework/upload" in routes
    assert "/quiz/" in routes

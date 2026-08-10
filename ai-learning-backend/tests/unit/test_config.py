import pytest
from app.core.config import Settings, get_settings


def test_settings_load_defaults():
    settings = get_settings()
    assert settings.APP_NAME is not None
    assert settings.MONGO_DB_URI is not None
    assert settings.DATABASE_NAME is not None


def test_settings_isolation():
    s1 = get_settings()
    s2 = Settings(APP_NAME="Custom Name")
    assert s2.APP_NAME == "Custom Name"
    assert s1.DATABASE_NAME != "PROD_SECRET_DB"

import asyncio
import logging
from typing import Optional
from fastapi import FastAPI, Request
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
from app.core.config import Settings
from app.db.collections import Collections

logger = logging.getLogger(__name__)


class DatabaseClient:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db_name: Optional[str] = None

    async def connect(self, settings: Settings, db_name_override: Optional[str] = None) -> None:
        self.db_name = db_name_override or settings.DATABASE_NAME
        logger.info("Connecting to MongoDB [db_name=%s]...", self.db_name)
        
        # Configure client with explicit timeouts
        self.client = AsyncIOMotorClient(
            settings.MONGO_DB_URI,
            server_api=ServerApi('1'),
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )

        try:
            await self.client.admin.command("ping")
            logger.info("Successfully connected to MongoDB [db_name=%s]", self.db_name)
        except Exception as e:
            logger.error("Failed to connect to MongoDB: %s", str(e))
            raise

    async def close(self) -> None:
        if self.client:
            self.client.close()
            self.client = None
            logger.info("MongoDB connection closed.")

    def get_database(self):
        if not self.client or not self.db_name:
            raise RuntimeError("Database connection has not been initialized.")
        return self.client[self.db_name]

    async def check_health(self, timeout_seconds: float = 2.0) -> bool:
        if not self.client:
            return False
        try:
            await asyncio.wait_for(
                self.client.admin.command("ping"),
                timeout=timeout_seconds,
            )
            return True
        except Exception as e:
            logger.warning("Database health check ping failed: %s", str(e))
            return False


db_client = DatabaseClient()


async def connect_database(app: FastAPI, settings: Settings, db_name_override: Optional[str] = None) -> None:
    await db_client.connect(settings, db_name_override=db_name_override)
    app.state.db_client = db_client


async def close_database(app: FastAPI) -> None:
    await db_client.close()


def get_database(request: Request = None):
    if request and hasattr(request.app.state, "db_client"):
        return request.app.state.db_client.get_database()
    return db_client.get_database()

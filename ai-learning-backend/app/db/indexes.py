import logging
from pymongo import ASCENDING
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.collections import Collections

logger = logging.getLogger(__name__)


async def ensure_identity_indexes(db: AsyncIOMotorDatabase) -> None:
    logger.info("Ensuring identity MongoDB indexes...")
    try:
        # Unique email on users
        await db[Collections.USERS].create_index(
            [("email", ASCENDING)],
            unique=True,
            name="uniq_users_email",
        )

        # Unique username on users if present
        await db[Collections.USERS].create_index(
            [("username", ASCENDING)],
            unique=True,
            name="uniq_users_username",
        )

        # Indexes on refresh_sessions
        await db[Collections.REFRESH_SESSIONS].create_index(
            [("token_hash", ASCENDING)],
            unique=True,
            name="uniq_refresh_token_hash",
        )
        await db[Collections.REFRESH_SESSIONS].create_index(
            [("user_id", ASCENDING)],
            name="idx_refresh_user_id",
        )
        await db[Collections.REFRESH_SESSIONS].create_index(
            [("expires_at", ASCENDING)],
            expireAfterSeconds=0,
            name="ttl_refresh_expires_at",
        )
        logger.info("Identity MongoDB indexes verified successfully.")
    except Exception as e:
        logger.warning("Could not create identity indexes: %s", str(e))

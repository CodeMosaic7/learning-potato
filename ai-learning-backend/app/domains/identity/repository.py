from typing import Any, Dict, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.collections import Collections
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository):
    def __init__(self, db: AsyncIOMotorDatabase):
        super().__init__(db, Collections.USERS)

    async def find_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return await self.find_one({"email": email.lower().strip()})

    async def find_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        return await self.find_one({"username": username.strip()})

    async def find_by_id(self, user_id: str | ObjectId) -> Optional[Dict[str, Any]]:
        obj_id = self.to_object_id(user_id) if isinstance(user_id, str) else user_id
        return await self.find_one({"_id": obj_id})


class RefreshSessionRepository(BaseRepository):
    def __init__(self, db: AsyncIOMotorDatabase):
        super().__init__(db, Collections.REFRESH_SESSIONS)

    async def find_by_token_hash(self, token_hash: str) -> Optional[Dict[str, Any]]:
        return await self.find_one({"token_hash": token_hash, "revoked_at": None})

    async def revoke_session(self, token_hash: str) -> None:
        await self.update_one(
            {"token_hash": token_hash},
            {"$set": {"revoked_at": self.current_utc_time()}},
        )

    async def revoke_all_for_user(self, user_id: ObjectId) -> None:
        await self.collection.update_many(
            {"user_id": user_id, "revoked_at": None},
            {"$set": {"revoked_at": self.current_utc_time()}},
        )

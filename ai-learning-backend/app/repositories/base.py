from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase


class BaseRepository:
    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str):
        self.db = db
        self.collection_name = collection_name
        self.collection: AsyncIOMotorCollection = db[collection_name]

    @staticmethod
    def is_valid_object_id(id_str: str) -> bool:
        return ObjectId.is_valid(id_str)

    @staticmethod
    def to_object_id(id_str: str) -> ObjectId:
        return ObjectId(id_str)

    @staticmethod
    def current_utc_time() -> datetime:
        return datetime.now(timezone.utc)

    async def find_one(self, filter_query: Dict[str, Any], projection: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one(filter_query, projection)

    async def insert_one(self, document: Dict[str, Any]) -> Any:
        return await self.collection.insert_one(document)

    async def update_one(self, filter_query: Dict[str, Any], update_query: Dict[str, Any]) -> Any:
        return await self.collection.update_one(filter_query, update_query)

    async def delete_one(self, filter_query: Dict[str, Any]) -> Any:
        return await self.collection.delete_one(filter_query)

    async def find_many(
        self,
        filter_query: Dict[str, Any],
        projection: Optional[Dict[str, Any]] = None,
        limit: int = 100,
        sort: Optional[List] = None,
    ) -> List[Dict[str, Any]]:
        cursor = self.collection.find(filter_query, projection)
        if sort:
            cursor = cursor.sort(sort)
        return await cursor.to_list(length=limit)

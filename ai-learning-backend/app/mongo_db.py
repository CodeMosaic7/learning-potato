from typing import Any
from app.db.client import db_client, get_database as core_get_database


class ProxyCollection:
    def __init__(self, name: str):
        self.name = name

    def __getattr__(self, item: str) -> Any:
        db = core_get_database()
        collection = db[self.name]
        return getattr(collection, item)


class MongoDbProxy:
    def __getattr__(self, item: str) -> Any:
        db = core_get_database()
        return getattr(db, item)

    def __getitem__(self, item: str) -> Any:
        db = core_get_database()
        return db[item]


client = db_client
user_collection = ProxyCollection("users")
chat_collection = ProxyCollection("chats")
chat_sessions = ProxyCollection("chat_sessions")
quiz_collection = ProxyCollection("quizzes")
user_profiles = ProxyCollection("user_profiles")
user_courses = ProxyCollection("user_courses")
user_progress = ProxyCollection("user_progress")
progress_collection = ProxyCollection("user_progress")
user_activity = ProxyCollection("user_activity")


async def connect_to_mongo():
    pass


async def close_mongo_connection():
    pass


def get_mongo_connection():
    return MongoDbProxy()
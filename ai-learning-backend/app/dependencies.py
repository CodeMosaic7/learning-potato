from fastapi import Depends
from .mongo_db import db
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = AsyncIOMotorClient(settings.MONGO_DB_URI)
db = client[settings.MONGO_DB_NAME]

async def get_db():
    print("DEBUG:",db)
    return db

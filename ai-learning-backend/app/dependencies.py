from fastapi import Depends
from .mongo_db import db

async def get_db():
    return db

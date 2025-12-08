from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client=None
db=None
def connect_mongo_db():
    global db,client
    client=AsyncIOMotorClient(settings.MONGO_DB_URI)
    db=client[settings.MONGO_DB_NAME]
    print("Connected to MongoDB successfully.")
    return client,db

def close_mongo_db():
    global client
    if client :
        client.close()
        print("MongoDB connection closed.")




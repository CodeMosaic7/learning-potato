import os
from dotenv import load_dotenv
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()
client=None
db=None
def connect_mongo_db():
    global db,client
    client=AsyncIOMotorClient(os.getenv("MONGO_DB_URL"))
    db=client[os.getenv("MONGO_DB_NAME")]
    print("Connected to MongoDB successfully.")
    return client,db

def close_mongo_db():
    global client
    if client :
        client.close()
        print("MongoDB connection closed.")




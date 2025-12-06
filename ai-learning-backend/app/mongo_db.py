import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def connect_mongo_db(client=None, db=None):
    client=MongoClient(os.getenv("MONGO_DB_URL"))
    db=client[os.getenv("MONGO_DB_NAME")]
    print("Connected to MongoDB successfully.")
    return client,db

def close_mongo_db(client: MongoClient):
    client.close()
    print("MongoDB connection closed.")




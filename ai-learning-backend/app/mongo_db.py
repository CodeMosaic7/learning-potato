from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()

uri = f"mongodb+srv://manika348_db_user:{os.getenv('MONGO_DB_PASSWORD')}@cluster0.7ab3cqu.mongodb.net/?appName=Cluster0"

client: AsyncIOMotorClient = None
user_collection = None
chat_collection = None
quiz_collection = None


async def connect_to_mongo():
    global client, user_collection, chat_collection, quiz_collection

    client = AsyncIOMotorClient(uri, server_api=ServerApi('1'))

    try:
        await client.admin.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Connection failed: {e}")
        raise  # stop the app if connection fails

    db = client['manika348_db_user']
    user_collection = db["users"]
    chat_collection = db["chats"]
    quiz_collection = db["quizzes"]
    print("Collections initialized.")


async def close_mongo_connection():
    global client
    if client is not None:
        client.close()
        print("MongoDB connection closed.") 

def get_mongo_connection():
    return client['manika348_db_user']
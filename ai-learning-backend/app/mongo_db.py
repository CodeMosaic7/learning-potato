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
user_profiles = None
user_courses = None
user_progress = None


async def connect_to_mongo():
    global client, user_collection, chat_collection, quiz_collection, user_profiles, user_courses, user_progress, progress_collection

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
    user_profiles = db["user_profiles"]
    user_courses = db["user_courses"]
    user_progress = db["user_progress"]
    progress_collection = db["user_progress"]

    print("Collections initialized.")


async def close_mongo_connection():
    global client
    if client is not None:
        client.close()
        print("MongoDB connection closed.") 

def get_mongo_connection():
    return client['manika348_db_user']
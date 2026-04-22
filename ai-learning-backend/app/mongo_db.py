from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os 
from dotenv import load_dotenv
load_dotenv()

uri = f"mongodb+srv://manika348_db_user:{os.getenv('MONGO_DB_PASSWORD')}@cluster0.7ab3cqu.mongodb.net/?appName=Cluster0"
def connect_to_mongo():
    global client
    client = MongoClient(uri, server_api=ServerApi('1'))
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)

def close_mongo_connection():
    client.close()

def get_mongo_connection():
    return client

import os
import dotenv
from pydantic_settings import BaseSettings

dotenv.load_dotenv()   

class Settings(BaseSettings):
    MONGO_DB_URI: str = os.getenv("MONGO_DB_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME: str = os.getenv("DATABASE_NAME", "MELLO")
    APP_NAME: str = "Mello AI"
    DEBUG: bool = True
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

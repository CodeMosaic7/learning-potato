import os
import dotenv
from pydantic_settings import BaseSettings

dotenv.load_dotenv()   

class Settings(BaseSettings):
    MONGO_DB_URI: str = os.getenv("MONGO_DB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "MELLO")
    APP_NAME: str = "Mello AI"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

import os
from dotenv import load_dotenv
from bson import ObjectId
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.dependencies import get_db
from pydantic_settings import BaseSettings
from app.config import settings 

load_dotenv()
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

async def upload_profile_image(
    file: UploadFile = File(...),
    user_id: str = None,
    db=Depends(get_db)
):
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id")
    try:
        upload_res = cloudinary.uploader.upload(
            file.file,
            folder="user_profiles",
            public_id=user_id,
            overwrite=True,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    image_url = upload_res["secure_url"]

    return image_url
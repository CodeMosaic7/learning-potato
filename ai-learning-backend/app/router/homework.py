from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.HWhelper.helper import process_homework_image

import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/homework", tags=["Homework Helper"])

@router.post("/upload")
async def handle_homework(file: UploadFile = File(...)):
    """
    Upload homework image and extract text/solve problems from it
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, 
            detail="Please upload a valid image file (jpg, png, webp, etc.)"
        )
    
    # Check file size (reasonable limit for image processing)
    if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=400,
            detail="File size too large. Please upload an image smaller than 10MB."
        )
    
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # Validate that we actually got content
        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file appears to be empty"
            )
        
        # Process the homework image (extract text and generate solution)
        extracted_text_and_solution = await process_homework_image(file_bytes)
        
        # Validate response from text extraction
        if not extracted_text_and_solution:
            raise HTTPException(
                status_code=422,
                detail="Could not extract readable text from the image. Please ensure the image is clear and contains visible text."
            )
        
        return {
            "status": "success",
            "result": extracted_text_and_solution,
            "message": "Homework image processed successfully"
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Log the actual error for debugging
        logger.error(f"Error processing homework image: {str(e)}", exc_info=True)
        # Return more specific error for image processing failures
        raise HTTPException(
            status_code=500,
            detail="Failed to process the homework image. This could be due to unclear text, unsupported image format, or processing error."
        )
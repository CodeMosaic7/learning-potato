from PIL import Image
import pytesseract
from io import BytesIO

def extract_text_from_image(image_bytes):
    
    """
    Extract text from image bytes using OCR
    
    Args:
        image_bytes: Raw bytes of the image file
        
    Returns:
        str: Extracted text from the image
    """
    try:
        # Create a BytesIO object from the bytes
        image_stream = BytesIO(image_bytes)
        
        # Open the image from the byte stream
        image = Image.open(image_stream)
        print(image)
        
        # Convert to RGB if necessary (for better OCR results)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Extract text using pytesseract
        text = pytesseract.image_to_string(image)
        
        # Clean up the extracted text
        text = text.strip()
        
        return text
        
    except Exception as e:
        raise Exception(f"Failed to extract text from image: {str(e)}")


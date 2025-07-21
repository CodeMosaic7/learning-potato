# app/services/homework_helper.py

import os
import httpx
from dotenv import load_dotenv
from app.services.HWhelper.imagereader import extract_text_from_image

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama3-8b-8192"

async def get_conversational_response(homework_text: str) -> str:
    prompt = f"""
You're a friendly and supportive tutor for children aged 8 to 14.
You are talking to a kid who just uploaded a photo of their homework.

Step-by-step:
- Greet them kindly
- Tell them what you understood from the homework image
- Explain or solve it step-by-step
- End with an encouraging sentence like "You're doing great!" or "Want to try another one?"

Here is what the image says:
\"\"\"{homework_text}\"\"\"
Now help the child!
"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(GROQ_API_URL, json=payload, headers=headers)

        if response.status_code != 200:
            return f"Error: {response.status_code} - {response.text}"
        print(response)
        data = response.json()

        # Extract the actual message content from the LLM response
        return data["choices"][0]["message"]["content"]

async def process_homework_image(file_bytes: bytes) -> str:
   
    text = extract_text_from_image(file_bytes)
    if not text.strip():
        raise ValueError("No text found in image.")

    
    return await get_conversational_response(text)

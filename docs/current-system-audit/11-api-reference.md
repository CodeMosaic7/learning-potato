# 11 - API Reference Documentation

## Overview

This section details all API routers declared in `ai-learning-backend/app/router/` and `ai-learning-backend/app/authentication/routes.py`.

> [!WARNING]
> Due to the missing `app/main.py` entrypoint, these endpoints cannot currently be served by Uvicorn.

---

## 1. Authentication Router (`/auth`)

### `POST /auth/register`
- **Summary**: Register a new user account.
- **Request Body** (`UserCreate`):
  ```json
  {
    "email": "student@example.com",
    "username": "student1",
    "name": "Alex Smith",
    "password": "SecretPassword123",
    "date_of_birth": "2014-05-10",
    "gender": "male",
    "grade_level": "5",
    "profile_image": "data:image/png;base64,..."
  }
  ```
- **Response** (`UserOut`): HTTP 201 Created with created user profile details.

### `POST /auth/login`
- **Summary**: Authenticate user and issue JWT cookie.
- **Request Body** (`UserLogin`): `{"email": "...", "password": "..."}`
- **Response** (`Token`): Sets `HttpOnly` cookie `access_token` and returns `{"email": "..."}`.

---

## 2. Chatbot Router (`/chatbot`)

### `POST /chatbot/initialize`
- **Summary**: Initialize or resume a LangGraph chatbot session for the user.
- **Headers**: Authorization Cookie / Bearer
- **Response** (`InitializeChatbotResponse`):
  ```json
  {
    "session_id": "60d5ec49f1b2c81234567890",
    "initial_response": {
      "response": "Hello! Let's get started.",
      "stage": "ASSESSMENT_IN_PROGRESS"
    },
    "status": "initialized",
    "user_id": "60d5ec49f1b2c81234567890"
  }
  ```

### `POST /chatbot/chat`
- **Summary**: Send message to chatbot and advance graph state.
- **Request Body** (`ChatMessage`): `{"message": "I'm having trouble with math homework."}`
- **Response** (`ChatResponse`): `{"response": "...", "stage": "..."}`
- **Known Defect**: Throws `NameError: name 'deepcopy' is not defined` at runtime.

---

## 3. Homework Helper Router (`/homework`)

### `POST /homework/upload`
- **Summary**: Upload homework image for OCR text extraction and solution generation.
- **Content-Type**: `multipart/form-data`
- **Form Data**: `file` (image bytes, max 10MB)
- **Response**: `{"status": "success", "result": "...", "message": "Homework image processed successfully"}`

---

## 4. Quiz Router (`/quiz`)

### `POST /quiz/`
- **Summary**: Generate AI quiz.
- **Request Body**: `{"mental_age": 10, "topic": "Photosynthesis", "num_questions": 5, "time_limit": 10}`
- **Response**: JSON object containing generated questions array.

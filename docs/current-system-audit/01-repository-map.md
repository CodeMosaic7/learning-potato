# 01 - Repository Map & Inventory

## Directory Hierarchy & Responsibility Inventory

The repository is structured as a multi-service monorepo containing a Python backend and a React single-page application.

```text
learning-potato/
├── docker-compose.yml
├── notes.txt
├── README.md
├── ai-learning-backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── test.py
│   └── app/
│       ├── config.py
│       ├── crud.py
│       ├── models.py
│       ├── mongo_db.py
│       ├── schemas.py
│       ├── authentication/
│       ├── middleware/
│       ├── model/
│       ├── router/
│       └── services/
│           ├── HWhelper/
│           ├── chatbot/
│           └── quiz/
└── ai-learning-frontend/
    ├── Dockerfile
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── api/
        ├── components/
        ├── elements/
        └── pages/
```

---

## Detailed Directory Responsibility Analysis

### Root Level
- `docker-compose.yml` `VERIFIED`: Defines container orchestration for `backend` (port 8000) and `frontend` (port 3000). [docker-compose.yml](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/docker-compose.yml)
- `README.md` `CONFLICT`: Documents outdated/inaccurate commands, non-existent endpoints, and non-existent test runners. [README.md](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/README.md)
- `notes.txt` `INFORMATIONAL`: Scratchpad mentioning authentication, mental age chatbot, quiz generator, homework helper, and snowflake schema goals. [notes.txt](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/notes.txt)

### `ai-learning-backend/`
- `Dockerfile` `RISK`: Builds Python 3.12-slim container. Calls `CMD ["uvicorn", "app.main:app", ...]`, which fails because `app/main.py` is `MISSING`. [Dockerfile](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/Dockerfile#L13)
- `requirements.txt` `VERIFIED`: Declares 118 Python packages including FastAPI, Motor, Pymongo, LangGraph, LangChain, LangChain-Groq, Pytesseract, Cloudinary. [requirements.txt](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/requirements.txt)
- `test.py` `RISK`: Drops and creates database tables via `from database.db import Base, engine` (module `database` does not exist). [test.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/test.py)
- `app/config.py` `VERIFIED`: Pydantic BaseSettings class reading `.env`. [config.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/config.py)
- `app/crud.py` `UNUSED`: Legacy SQLAlchemy user creation function. [crud.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/crud.py)
- `app/models.py` `UNUSED`: Commented-out SQLAlchemy models and entity documentation notes. [models.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/models.py)
- `app/mongo_db.py` `VERIFIED`: Async Motor client connection and MongoDB collection definitions. [mongo_db.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/mongo_db.py)
- `app/schemas.py` `VERIFIED`: Pydantic request/response schemas for chat, quiz, and dashboard. [schemas.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/schemas.py)
- `app/authentication/` `VERIFIED`: JWT token generation, password hashing, and user auth routes (`routes.py`, `auth.py`, `user_logic.py`).
- `app/middleware/` `VERIFIED`: `cloudinary_middleware.py` for uploading profile images.
- `app/model/` `VERIFIED`: Pydantic model definitions for User, UserProfile, Chat, Quiz, QuizAttempt, Homework.
- `app/router/` `VERIFIED / RISK`: FastAPI routers (`chatbot.py`, `dashboard.py`, `homework.py`, `quiz.py`). Unreachable due to missing `app/main.py`.
- `app/services/chatbot/` `VERIFIED / RISK`: LangGraph agent chatbot implementation (`agent_chatbot.py`, `llm.py`, `rate_limiter.py`, `web_guidance.py`). Contains empty `main.py` and empty directory `nodes.py/`.
- `app/services/HWhelper/` `VERIFIED`: Pytesseract OCR image text extraction and Groq solution generation (`helper.py`, `imagereader.py`).
- `app/services/quiz/` `VERIFIED`: AI quiz prompt generator and Groq completion parser (`quiz_generator.py`, `groq.py`, `prompt.py`).

### `ai-learning-frontend/`
- `package.json` `VERIFIED`: React 19, Vite 7, TailwindCSS 3.4, React Router DOM 7, Axios, Lucide React. Missing `test` script. [package.json](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/package.json)
- `src/api/` `VERIFIED / CONFLICT`: Axios instance configuration (`config.js`) and API integration functions (`api.js`).
- `src/pages/` `VERIFIED`: `Home.jsx`, `Chatbot.jsx`, `Dashboard.jsx`, `HomeWorkHelper.jsx`, `Quiz.jsx`, `Roadmap.jsx`.
- `src/components/` `VERIFIED`: `AuthComponent.jsx`, `Header.jsx`, `Footer.jsx`, `Sidebar.jsx` (Sidebar is `UNUSED` and missing imports).
- `src/elements/` `VERIFIED`: Reusable UI elements (`Badge.jsx`, `Button.jsx`, `Card.jsx`, `Input.jsx`).

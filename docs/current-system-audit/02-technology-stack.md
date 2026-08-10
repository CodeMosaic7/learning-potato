# 02 - Technology Stack Inventory

## Overview & Verified Dependency Tables

### Frontend Stack
- **Framework**: React 19.1.0 (`VERIFIED`)
- **Build Tool**: Vite 7.0.4 (`VERIFIED`)
- **Routing**: React Router DOM 7.6.3 (`VERIFIED`)
- **API Client**: Axios 1.10.0 (`VERIFIED`)
- **Styling**: Tailwind CSS 3.4.17 + PostCSS + Autoprefixer (`VERIFIED`)
- **Icons**: Lucide React 0.525.0 (`VERIFIED`)
- **Animations**: Framer Motion 12.23.6 (`UNUSED`)

### Backend Stack
- **Framework**: FastAPI 0.116.1 (`VERIFIED` in requirements, `MISSING` entrypoint app)
- **ASGI Server**: Uvicorn 0.35.0 (`VERIFIED`)
- **Database Driver**: Motor 3.7.1 (Async MongoDB) + PyMongo 4.15.5 (`VERIFIED`)
- **ORM / Legacy**: SQLAlchemy 2.0.42 (`UNUSED` / Commented-out models)
- **Data Validation**: Pydantic 2.11.7 + Pydantic-Settings 2.12.0 (`VERIFIED`)
- **Authentication**: PyJWT 2.10.1 / python-jose 3.5.0 + Passlib bcrypt 1.7.4 (`VERIFIED`)
- **Image Processing / OCR**: Pytesseract 0.3.13 + Pillow 11.3.0 + Cloudinary 1.44.1 (`VERIFIED`)

### AI / Agent Stack
- **Graph Engine**: LangGraph 0.6.4 (`VERIFIED`)
- **Agent Framework**: LangChain 0.3.27 (`VERIFIED`)
- **LLM Integrations**: LangChain-Groq 0.3.7 (`VERIFIED`), Groq Python SDK 0.37.1 (`VERIFIED`), LangChain-Google-GenAI 2.1.9 (`UNUSED`)
- **Models Used**: `llama-3.1-8b-instant` (in Chatbot via Groq), `llama3-8b-8192` (in Homework Helper via Groq HTTP REST)

---

## Detailed Dependency Table

| Dependency | Version | Used By | Purpose | Status | Evidence |
| :--- | ---: | :--- | :--- | :--- | :--- |
| `fastapi` | 0.116.1 | Backend Routers | Web API framework | `VERIFIED` (Missing `app/main.py`) | [requirements.txt](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/requirements.txt#L22) |
| `uvicorn[standard]` | 0.35.0 | Backend Dockerfile | ASGI server runner | `VERIFIED` | [Dockerfile](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/Dockerfile#L13) |
| `motor` | 3.7.1 | Backend DB | Async MongoDB client | `VERIFIED` | [mongo_db.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/mongo_db.py#L1) |
| `langgraph` | 0.6.4 | Chatbot Service | Orchestrating StateGraph | `VERIFIED` | [agent_chatbot.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/chatbot/agent_chatbot.py#L4) |
| `langchain-groq` | 0.3.7 | Chatbot Service | Groq LLM wrapper | `VERIFIED` | [llm.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/chatbot/llm.py#L5) |
| `pytesseract` | 0.3.13 | Homework Helper | Image OCR text extraction | `VERIFIED` | [imagereader.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/HWhelper/imagereader.py#L2) |
| `cloudinary` | 1.44.1 | Auth Middleware | User profile image storage | `VERIFIED` | [cloudinary_middleware.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/middleware/cloudinary_middleware.py#L1) |
| `SQLAlchemy` | 2.0.42 | Backend app/crud.py | Relational ORM | `UNUSED` / `CONFLICT` | [models.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/models.py#L1-L21) |
| `react` | 19.1.0 | Frontend SPA | Client UI framework | `VERIFIED` | [package.json](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/package.json#L17) |
| `framer-motion` | 12.23.6 | Frontend package.json | Animations | `UNUSED` | [package.json](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/package.json#L15) |

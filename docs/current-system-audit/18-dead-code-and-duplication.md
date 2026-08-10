# 18 - Dead Code & Duplication Audit

## Overview

This document inventories all unused files, commented-out code blocks, duplicate API clients, and orphaned artifacts in the repository.

---

## Dead & Obsolete Code Inventory

| Item / File Path | Classification | Evidence | Referenced By | Risk of Removal | Rebuild Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ai-learning-backend/app/crud.py` | `Obsolete / Unused` | SQLAlchemy user creation function; project migrated to MongoDB Motor. | None | Low | Delete in rebuild |
| `ai-learning-backend/app/models.py` | `Obsolete / Unused` | Commented-out SQLAlchemy models (lines 1-33). | None | Low | Delete in rebuild |
| `ai-learning-backend/test.py` | `Obsolete / Unused` | Destructive table dropping script referencing non-existent `database.db`. | None | Low | Replace with Pytest test suite |
| `ai-learning-backend/app/services/chatbot/main.py` | `Empty File` | 0 bytes file. | None | Low | Delete in rebuild |
| `ai-learning-backend/app/services/chatbot/nodes.py/` | `Empty Directory` | Git status shows all python files inside `nodes.py/` were deleted. | None | Low | Delete in rebuild |
| `ai-learning-frontend/src/components/Sidebar.jsx` | `Unused Component` | React component with missing Lucide icon imports; never imported in `App.jsx`. | None | Low | Delete or refactor |
| `ai-learning-backend/app/services/chatbot/web_guidance.py` | `Disconnected Config` | Dictionary of website guidance routes; never imported in `agent_chatbot.py` or `chatbot.py`. | None | Low | Integrate or delete |
| `ai-learning-backend/app/services/chatbot/agent_chatbot.py` (lines 364-498) | `Commented Code` | Interactive CLI session & automated test functions commented out. | None | Low | Move to CLI utility script |

---

## Duplicate Logic & Dual Implementation Analysis

1. **Dual LLM Provider Libraries**:
   - `requirements.txt` includes both `langchain-groq` and `langchain-google-genai`.
   - `agent_chatbot.py` loads `GEMINI_API_KEY` but invokes `llm.py` which uses `ChatGroq`.
   - `helper.py` and `groq.py` write custom `httpx` POST requests to Groq REST API, duplicating the Groq client logic.

2. **Dual Database Access Patterns**:
   - `crud.py` uses synchronous SQLAlchemy `Session`.
   - `routes.py` and `dashboard.py` use asynchronous `motor.motor_asyncio`.
   - SQLAlchemy dependencies can be removed entirely to simplify backend packaging.

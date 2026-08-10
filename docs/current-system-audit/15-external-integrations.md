# 15 - External Integrations Audit

## Overview & Service Matrix

The system currently integrates with three external third-party cloud services.

---

## Integration Inventory Table (Current Implementation)

| Integration | Purpose | Implementation Files | Authentication Method | External Endpoint / Host | Timeout / Retry | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Groq LLM API** | AI Chatbot, Homework Solution, Quiz Generation | `llm.py, helper.py, groq.py` | Bearer Token (`GROQ_API_KEY`, `GROQ_API_KEY_TEST`) | `https://api.groq.com/openai/v1/chat/completions` | `groq.py` sets 30s timeout; `rate_limiter.py` has broken OpenAI exception handling | `VERIFIED / PARTIALLY BROKEN` |
| **MongoDB Atlas** | Database storage | `app/mongo_db.py` | Database User + Password | `cluster0.7ab3cqu.mongodb.net` | Motor async pool ping check on startup | `VERIFIED` |
| **Cloudinary** | Profile picture cloud hosting | `cloudinary_middleware.py` | Cloudinary API Key + Secret | Cloudinary API | Async wrapper around Cloudinary SDK | `VERIFIED` |
| **Tesseract OCR** | Local OCR engine | `imagereader.py` | Native binary execution | System `/usr/bin/tesseract` | None | `DEPENDS ON HOST OS` |

---

## External Call Details & Current Risk Analysis

1. **Groq API Rate Limiting Vulnerability**:
   - `helper.py` and `groq.py` call `https://api.groq.com/openai/v1/chat/completions` via `httpx.AsyncClient()`.
   - If Groq rate limits or fails, `helper.py` returns an unformatted error string `Error: 429 - ...`, which is passed to the child user as an answer.
   - `rate_limiter.py` catches `openai.RateLimitError` instead of `groq.RateLimitError`, causing retries to crash. [rate_limiter.py:L13](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/chatbot/rate_limiter.py#L13), [helper.py:L44-L45](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/HWhelper/helper.py#L44-L45)

2. **System Binary Dependency (`tesseract-ocr`)**:
   - `pytesseract.image_to_string` requires the binary `tesseract` to be installed on the host OS or Docker container.
   - The backend `Dockerfile` (`python:3.12-slim`) does **not** install `tesseract-ocr` via `apt-get install`. Invoking image upload in Docker will throw `TesseractNotFoundError`. [Dockerfile](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/Dockerfile)

---

## Target Integration Architecture Recommendation `TARGET REBUILD DESIGN`

Per Decision 4:
> **Standardize access through one internal AI gateway while allowing multiple provider implementations.**

Rather than locking the codebase to a single provider or calling provider REST APIs directly inside feature services:
- **Internal AI Gateway**: All AI requests pass through a unified internal interface (`LLMProvider.generate()`).
- **Provider Adapters**: Implement provider-specific adapters (`GroqProvider`, `GeminiProvider`, `OpenAIProvider`).
- **Resilience**: The gateway handles rate-limiting backoffs, exception translation, and task-based fallback routing.

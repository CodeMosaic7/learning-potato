# 16 - Backend Architecture

## Overview

The target backend architecture enforces strict modular layering for `ai-learning-backend`. Route handlers are prohibited from directly invoking MongoDB driver calls or external AI SDKs.

---

## Recommended Directory Structure (`TARGET V1`)

```text
ai-learning-backend/app/
├── main.py                          # Entrypoint: FastAPI instantiation, middleware, routers
├── core/
│   ├── config.py                    # Pydantic settings & ENV validation
│   ├── security.py                  # JWT decoding, password hashing, auth dependencies
│   ├── logging.py                   # Structured JSON logger
│   └── exceptions.py                # Global exception handlers
├── api/
│   ├── dependencies.py              # Shared FastAPI dependencies (db, current_student)
│   └── v1/                          # API Routers (v1)
│       ├── auth.py
│       ├── students.py
│       ├── assessment.py
│       ├── learner_profile.py
│       ├── chat.py
│       ├── quizzes.py
│       ├── homework.py
│       ├── dashboard.py
│       └── roadmap.py
├── domains/                         # Business Domain Logic
│   ├── students/
│   ├── assessment/
│   ├── learner_profile/
│   ├── adaptation/                  # Adaptation Policy Engine
│   ├── chatbot/                     # LangGraph StateGraph & Nodes
│   ├── quiz/
│   ├── homework/
│   ├── roadmap/
│   └── learning_events/             # Telemetry Event Producer/Consumer
├── integrations/                    # External Infrastructure Integrations
│   ├── ai/                          # Internal AI Gateway & Provider Adapters
│   │   ├── gateway.py
│   │   ├── base.py (LLMProvider)
│   │   ├── groq_adapter.py
│   │   ├── gemini_adapter.py
│   │   └── openai_adapter.py
│   ├── database/                    # MongoDB Motor Repositories
│   └── ocr/                         # Pytesseract wrapper
└── tests/                           # Pytest test suite
```

---

## Strict Layering Dependencies Rule

```text
API Router (FastAPI)  -->  Application Domain Service  -->  Domain Logic / Engine  -->  Repository / Integration
```

- **Rule 1**: API Routers may ONLY call Application Domain Services.
- **Rule 2**: Application Domain Services handle business workflows and invoke Repositories or the AI Gateway.
- **Rule 3**: Repositories contain all database Motor queries. Route handlers must never call `db.collection.find()`.
- **Rule 4**: Feature services must call `AI Gateway` (`integrations/ai/gateway.py`), never provider SDKs directly.

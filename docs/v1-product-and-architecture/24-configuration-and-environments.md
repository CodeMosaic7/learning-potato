# 24 - Configuration & Environments

## Overview

This document specifies the environment configuration management architecture using `Pydantic-Settings`.

---

## AI Gateway & Task Routing Configuration (`TARGET V1`)

```yaml
# Target Application Configuration Schema
environment: "development" # "development", "staging", "production"
app_name: "Mello Learning Platform"

database:
  mongo_uri: "mongodb://localhost:27017" # Loaded from ENV: MONGO_DB_URI
  database_name: "MELLO_V1"
  max_pool_size: 50

security:
  secret_key: "ENV:SECRET_KEY"
  algorithm: "HS256"
  access_token_expire_minutes: 60

ai_gateway:
  tasks:
    learner_assessment:
      provider: "groq"
      model: "llama-3.1-8b-instant"
      temperature: 0.2
      timeout_seconds: 30

    tutoring_chatbot:
      provider: "groq"
      model: "llama-3.1-8b-instant"
      temperature: 0.7
      timeout_seconds: 45

    quiz_generation:
      provider: "groq"
      model: "llama-3.1-8b-instant"
      temperature: 0.5
      timeout_seconds: 30

    homework_explanation:
      provider: "groq"
      model: "llama-3.1-8b-instant"
      temperature: 0.6
      timeout_seconds: 30

providers:
  groq:
    api_key_env: "GROQ_API_KEY"
    max_retries: 3
  gemini:
    api_key_env: "GEMINI_API_KEY"
    max_retries: 3
  openai:
    api_key_env: "OPENAI_API_KEY"
    max_retries: 3
```

---

## Startup Validation Requirements

At FastAPI boot (`app/core/config.py`):
1. **ENV Key Check**: Validates `SECRET_KEY` and `MONGO_DB_URI` are non-empty.
2. **Provider Key Check**: Verifies API keys exist for all providers configured in `ai_gateway.tasks`.
3. **Database Ping**: Performs async ping check against MongoDB Atlas before accepting HTTP connections.

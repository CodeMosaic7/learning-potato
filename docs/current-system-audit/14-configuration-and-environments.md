# 14 - Configuration & Environment Audit

## Overview & Variable Inventory

Backend environment settings are currently loaded via `python-dotenv` and `pydantic-settings` in `app/config.py`.

---

## Environment Variable Matrix (Current Implementation)

| Variable | Required | Default in Code | Used In File(s) | Sensitive | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `MONGO_DB_URI` | No | `mongodb://localhost:27017` | `app/config.py` | Yes | `CONFLICT` (Hardcoded Atlas connection string in `mongo_db.py` overrides this) | [config.py:L7](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/config.py#L7), [mongo_db.py:L8](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/mongo_db.py#L8) |
| `DATABASE_NAME` | No | `MELLO` | `app/config.py` | No | `CONFLICT` (Hardcoded `'manika348_db_user'` in `mongo_db.py`) | [config.py:L8](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/config.py#L8), [mongo_db.py:L31](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/mongo_db.py#L31) |
| `MONGO_DB_PASSWORD` | Yes | None | `app/mongo_db.py` | Yes | `VERIFIED` | [mongo_db.py:L8](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/mongo_db.py#L8) |
| `SECRET_KEY` | Yes | None | `app/authentication/auth.py` | Yes | `VERIFIED` | [auth.py:L14](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/authentication/auth.py#L14) |
| `ALGORITHM` | No | `HS256` | `app/authentication/auth.py` | No | `VERIFIED` | [auth.py:L15](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/authentication/auth.py#L15) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `30` | `app/authentication/auth.py` | No | `VERIFIED` | [auth.py:L16](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/authentication/auth.py#L16) |
| `GROQ_API_KEY` | Yes | None | `helper.py, groq.py` | Yes | `VERIFIED` | [helper.py:L10](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/HWhelper/helper.py#L10) |
| `GROQ_API_KEY_TEST` | Yes | None | `llm.py` | Yes | `VERIFIED` (Used by ChatGroq) | [llm.py:L4](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/chatbot/llm.py#L4) |
| `MODEL` | Yes | None | `groq.py` | No | `RISK` (No fallback; crashes if unset) | [groq.py:L9](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/quiz/groq.py#L9) |
| `GEMINI_API_KEY` | No | None | `agent_chatbot.py` | Yes | `UNUSED` | [agent_chatbot.py:L12](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/chatbot/agent_chatbot.py#L12) |
| `CLOUDINARY_CLOUD_NAME` | No | `""` | `app/config.py` | No | `VERIFIED` | [config.py:L11](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/config.py#L11) |
| `CLOUDINARY_API_KEY` | No | `""` | `app/config.py` | Yes | `VERIFIED` | [config.py:L12](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/config.py#L12) |
| `CLOUDINARY_API_SECRET` | No | `""` | `app/config.py` | Yes | `VERIFIED` | [config.py:L13](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/config.py#L13) |

---

## Target AI Provider Configuration Architecture `TARGET REBUILD DESIGN`

Per Decision 4, the platform will use task-based AI provider selection via an internal AI Gateway.

### Recommended Configuration Schema (e.g. `config.yaml` or `.env`)

```yaml
# Target AI Gateway Configuration Strategy
ai_gateway:
  default_provider: "configured_per_task"
  tasks:
    learner_assessment:
      provider: "configured_at_deployment"
      model: "configured_at_deployment"
      temperature: 0.2
      timeout_seconds: 30

    tutoring_chatbot:
      provider: "configured_at_deployment"
      model: "configured_at_deployment"
      temperature: 0.7
      timeout_seconds: 45

    quiz_generation:
      provider: "configured_at_deployment"
      model: "configured_at_deployment"
      temperature: 0.5
      timeout_seconds: 30

    homework_explanation:
      provider: "configured_at_deployment"
      model: "configured_at_deployment"
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

### Configuration Validation Checklist for Rebuild
1. **Pydantic Validation**: Validate all database connection strings, AI provider API keys, model identifiers, and timeouts at startup using `Pydantic-Settings`.
2. **Environment Separation**: Ensure distinct configuration environments (`development`, `staging`, `production`).
3. **Secret Security**: Never hardcode connection strings or credentials inside python source files.

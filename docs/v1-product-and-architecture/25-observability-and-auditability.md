# 25 - Observability & Auditability Specification

## Overview

This specification details the structured logging, metrics collection, and telemetry audit trail requirements for the V1 backend.

---

## Structured JSON Logging Standard

All backend services emit structured JSON logs (`structlog` / standard `logging`) to stdout for ingestion by log collectors:

```json
{
  "timestamp": "2026-08-03T01:00:00.000Z",
  "level": "INFO",
  "event": "ai_gateway_call_completed",
  "service": "ai-learning-backend",
  "user_id": "60c72b2f9b1d8b2a3c4d5e6f",
  "task": "tutoring_chatbot",
  "provider": "groq",
  "model": "llama-3.1-8b-instant",
  "prompt_tokens": 240,
  "completion_tokens": 120,
  "latency_ms": 680,
  "status": "success"
}
```

---

## Auditability & Telemetry Requirements

1. **PII Masking**: Logs must NEVER output raw student passwords, full unhashed tokens, or raw child chat text.
2. **AI Provider Latency Metrics**: Metrics log latency, provider name, model identifier, and total tokens per task invocation to track AI costs.
3. **Database Audit Log**: Significant student actions (profile updates, diagnostic completion, quiz submissions) generate immutable audit records in `learning_events` and `activity_logs`.

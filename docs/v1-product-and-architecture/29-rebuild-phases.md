# 29 - Rebuild Phase Plan (Phases A through G)

## Overview

The V1 rebuild execution is structured into 7 sequential phases (Phase A through Phase G).

---

## Phase Execution Roadmap

```text
Phase A: Foundation & Architecture Layer
   │
   ▼
Phase B: Student Auth & Account Ownership
   │
   ▼
Phase C: Diagnostic Assessment & Learner Profile
   │
   ▼
Phase D: Adaptive Chatbot & AI Gateway
   │
   ▼
Phase E: Adaptive Quiz & Homework Helper
   │
   ▼
Phase F: Dashboard, Roadmap & Event Analytics
   │
   ▼
Phase G: Production Hardening & Testing
```

---

## Detailed Phase Specifications

### Phase A — Foundation & Core Infrastructure
- **Goal**: Restore backend entrypoint `app/main.py`, set up Pydantic configuration, logging, and Motor MongoDB repository pattern.
- **Deliverables**: Working FastAPI boot, clean ENV settings, Pytest infrastructure.
- **Risks**: Ensuring environment variable parity across development environments.

### Phase B — Student Identity & Auth Scope
- **Goal**: Implement student-only registration, JWT login, and ownership security dependencies.
- **Deliverables**: `/auth/register`, `/auth/login`, `/students/me`, and frontend auth pages.

### Phase C — Diagnostic Assessment & Learner Profile
- **Goal**: Build initial diagnostic assessment wizard and multidimensional `LearnerProfile` schema.
- **Deliverables**: `/assessments/initialize`, `/assessments/answer`, `/learner-profile`, and profile creation engine.

### Phase D — Adaptive Chatbot & AI Gateway
- **Goal**: Build internal AI Gateway (`LLMProvider`) and refactor LangGraph tutoring chatbot to consume adaptation policy context.
- **Deliverables**: AI Gateway, provider adapters (Groq/Gemini/OpenAI), and `/chat/message` endpoint.

### Phase E — Adaptive Quiz & Homework Helper
- **Goal**: Build adaptive quiz generator and homework image OCR scaffolding pipeline.
- **Deliverables**: `/quizzes/generate`, `/quizzes/submit`, `/homework/upload`, and Pytesseract OCR integration.

### Phase F — Dashboard, Roadmap & Learning Events
- **Goal**: Build `LearningEvent` telemetry pipeline, personalised student dashboard, and adaptive roadmap.
- **Deliverables**: `/dashboard/overview`, `/roadmap`, `/learning-events`, and event-driven profile recalibration.

### Phase G — Production Hardening & Quality Verification
- **Goal**: Implement full automated Pytest & Vitest test suites, low-bandwidth UI optimizations, and policy boundary validation.
- **Deliverables**: 100% passing test suite, complete API documentation, build readiness sign-off.

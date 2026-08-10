# 26 - Testing Strategy

## Overview

This document specifies the mandatory automated testing framework for the V1 rebuild, replacing the legacy dropping script `test.py` with comprehensive Pytest and Vitest test suites.

---

## Test Suite Hierarchy & Architecture

```text
┌────────────────────────────────────────────────────────┐
│  End-to-End Tests (Playwright / Cypress)               │
│  - Registration -> Initial Assessment -> Dashboard     │
├────────────────────────────────────────────────────────┤
│  API Contract & Integration Tests (Pytest + AsyncClient)│
│  - Protected Route Auth & Ownership Checks             │
│  - Endpoint Payload Schema Validation                  │
├────────────────────────────────────────────────────────┤
│  Domain Unit Tests (Pytest & Vitest)                   │
│  - Adaptation Policy Engine Rules (Deterministic)      │
│  - Learner Profile Recalibration Logic                 │
│  - Mocked AI Gateway Providers (No live LLM API calls) │
└────────────────────────────────────────────────────────┘
```

---

## Testing Mandates & Mock Strategy

1. **Zero External AI Calls in Standard Test Suite**: Standard CI/CD test runs must NEVER make live external API calls to Groq, Gemini, or OpenAI. All AI Gateway interactions use mock providers (`MockAIProvider`) returning deterministic test fixtures.
2. **Database Test Isolation**: Pytest backend tests use `mongomock-motor` or a dedicated test MongoDB container that drops test collections after each test function.
3. **Frontend Component Coverage**: Vitest component tests verify React components render correctly for loading, error, empty, and data-loaded states.
4. **Ownership Security Tests**: Automated tests explicitly attempt horizontal privilege escalation (e.g. Student A requesting Student B's chat history) to verify HTTP 403 Forbidden enforcement.

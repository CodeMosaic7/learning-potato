# 00 - V1 Product & Architecture Overview

## Executive Summary

This document establishes the official **V1 Product Specification and Target Technical Architecture** for rebuilding the **Mello.ai (Learning-Potato)** platform. 

The platform is designed to provide an adaptive, agentic AI educational experience tailored for underprivileged children. Based on confirmed product decisions, the V1 rebuild focuses exclusively on the **student experience**, powered by a **multidimensional Learner Profile** and a provider-independent **AI Gateway**.

> [!IMPORTANT]
> **Source of Truth Compliance**: This document set describes the **Target V1 Design** for rebuilding the application. Historical codebase defects and baseline audit findings remain documented in `docs/current-system-audit/`. No application source code has been altered during this documentation phase.

---

## Key Confirmed V1 Pillars

1. **Student-Only Scope (`CONFIRMED`)**: V1 focuses on student registration, initial assessment, adaptive tutoring, quizzes, homework assistance, dashboard, and learning roadmaps. Parent, educator, and admin portals are explicitly out of V1 scope.
2. **Platform-Wide Adaptive Learning (`CONFIRMED`)**: Adaptivity is driven by a multidimensional **Learner Profile** (Cognitive, Academic, Interaction dimensions) that controls chatbot depth, quiz difficulty, homework hints, dashboard insights, and roadmap sequencing.
3. **Task-Based AI Gateway (`CONFIRMED`)**: Feature services invoke a unified internal `AI Gateway` (`LLMProvider`) supporting provider adapters (Groq, Gemini, OpenAI) chosen by task requirements.
4. **MongoDB Persistence & Learning Events (`CONFIRMED`)**: Primary storage uses MongoDB with clean repository layers, strict `ObjectId` ownership, and an immutable `LearningEvent` telemetry stream.
5. **Deferred Moderation (`DEFERRED`)**: Input/output moderation layers are architected as pass-through extension boundaries in V1, requiring full policy enforcement prior to unrestricted public release.

---

## Document Index Map

```text
docs/v1-product-and-architecture/
├── 00-v1-overview.md                           (System Overview)
├── 01-product-scope.md                          (In-Scope vs Excluded Matrix)
├── 02-product-principles.md                     (Design & Low-Bandwidth Rules)
├── 03-student-personas-and-needs.md             (Provisional Student Needs)
├── 04-v1-capability-specification.md            (Detailed V1 Functional Specs)
├── 05-user-journeys.md                          (End-to-End Student Flows)
├── 06-adaptive-learning-specification.md       (Platform Adaptivity Framework)
├── 07-initial-assessment-specification.md      (Diagnostic Evaluation Design)
├── 08-learner-profile-specification.md         (Multidimensional Schema)
├── 09-adaptation-policy-engine.md               (Policy Evaluation Rules)
├── 10-chatbot-specification.md                  (LangGraph Tutoring System)
├── 11-quiz-specification.md                     (Adaptive Quiz Engine)
├── 12-homework-helper-specification.md          (OCR & Scaffolding Engine)
├── 13-dashboard-specification.md                (Personalised Student Dashboard)
├── 14-roadmap-and-recommendations.md            (Topic Progression & Revision)
├── 15-target-system-architecture.md            (High-Level System Topology)
├── 16-backend-architecture.md                   (FastAPI Modular Services)
├── 17-frontend-architecture.md                  (React SPA Feature Structure)
├── 18-langgraph-target-architecture.md         (Modular Graph Nodes & State)
├── 19-ai-gateway-architecture.md                (Provider Abstraction Layer)
├── 20-database-target-model.md                  (MongoDB Collections & Indexes)
├── 21-api-contract-plan.md                      (REST Endpoint Specifications)
├── 22-authentication-and-ownership.md          (JWT & Resource Protection)
├── 23-learning-event-model.md                   (Telemetry Event Schemas)
├── 24-configuration-and-environments.md        (Settings & AI Task Config)
├── 25-observability-and-auditability.md          (Logging & Event Metrics)
├── 26-testing-strategy.md                       (Pytest & Vitest Requirements)
├── 27-security-and-deferred-moderation.md       (Policy Layer Extension Points)
├── 28-migration-and-data-preservation.md       (Data Transition Guidelines)
├── 29-rebuild-phases.md                         (Phase A to G Rebuild Roadmap)
├── 30-acceptance-criteria.md                    (Given-When-Then Verification)
├── 31-architecture-decisions.md                (Architecture Decision Register)
├── 32-unresolved-decisions.md                  (TBD Decision Matrix)
└── README.md                                    (Directory Guide)
```

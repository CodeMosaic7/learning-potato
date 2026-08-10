# 01 - V1 Product Scope

## Overview

This document explicitly demarcates the functional boundaries for the V1 rebuild of the platform, separating required V1 capabilities from deferred capabilities and future platform extensions.

---

## Scope Boundary Matrix

| Capability Area | V1 Rebuild Scope (`TARGET V1`) | Out of Scope for V1 (`DEFERRED / FUTURE`) | Rationale / Notes |
| :--- | :--- | :--- | :--- |
| **User Identity** | Student Registration, Authentication, Profile | Parent, Guardian, Educator, Admin Portals | `CONFIRMED`: Single-role student focus simplifies V1 execution. Auth policies remain role-ready. |
| **Assessment & Profile** | Initial Diagnostic Assessment & Multidimensional Learner Profile | Parent-managed profile overrides or clinical psychometrics | `CONFIRMED`: System infers cognitive, academic, and interaction dimensions directly from student activity. |
| **Tutoring & Chat** | LangGraph Adaptive Chatbot with session history | Multi-agent student collaboration or live human tutoring | `TARGET V1`: Focused on personalized AI tutoring. |
| **Quiz Generator** | Adaptive Quiz Generation, attempts, hints, & scoring | Multi-player competitive quizzes or manual teacher quiz builders | `TARGET V1`: Dynamic AI quiz generation based on topic mastery. |
| **Homework Assistance**| OCR text extraction & adaptive step-by-step scaffolding | Direct assignment auto-grading or teacher gradebook submission | `TARGET V1`: Helps student understand homework step-by-step. |
| **Dashboard** | Personalised Student Progress, Mastery Matrix, Next Actions | Parent oversight dashboard or multi-student classroom reporting | `CONFIRMED`: Student-only dashboard. |
| **Roadmap** | Personalised Topic Sequence & Scheduled Revision | Multi-course degree catalog or school district curriculum sync | `TARGET V1`: Dynamic topic progression based on skill mastery. |
| **Safety & Moderation** | Policy extension points (pass-through in V1) | Live human review queue, automated safety filters, PII sanitizers | `CONFIRMED / DEFERRED`: Required prior to public production release. |
| **Payments & Social** | None | Subscriptions, payments, social feeds, public forums | `FUTURE`: Out of scope for V1 core platform. |

---

## Detailed In-Scope Features List (`TARGET V1`)

1. **Student Registration & Login**: Account creation with credentials, grade level, and JWT auth persistence.
2. **Student Session Restoration**: Ability to resume active chat, assessment, or quiz sessions upon logging in.
3. **Student Profile Management**: View and edit student profile details (name, grade level, preferences).
4. **Initial Diagnostic Assessment**: Short interactive diagnostic evaluating cognitive and academic dimensions.
5. **Multidimensional Learner Profile**: Real-time profile state (Cognitive, Academic, Interaction dimensions).
6. **Adaptation Policy Engine**: Deterministic policy evaluation mapping profile state to feature configurations.
7. **Adaptive Tutoring Chatbot**: LangGraph agent adapting vocabulary, step count, and explanation depth.
8. **Adaptive Quiz Generator**: AI-generated questions tailored to skill mastery and target difficulty.
9. **Adaptive Homework Helper**: Image OCR text extraction and step-by-step adaptive hint scaffolding.
10. **Personalised Student Dashboard**: Event-driven dashboard showing streak, quiz stats, skill mastery, and next actions.
11. **Adaptive Learning Roadmap**: Topic progression map with automated revision scheduling.
12. **Learning Telemetry Events**: Immutable event logging for all completed student interactions.
13. **Task-Based AI Gateway**: Unified internal LLM gateway supporting Groq, Gemini, and OpenAI adapters.

---

## Detailed Excluded Features List (`DEFERRED / FUTURE`)

- **Parent / Guardian Portal**: Account monitoring, progress emails, child controls.
- **Educator / Mentor Portal**: Classroom creation, assignment distribution, gradebook.
- **Admin Dashboard**: System telemetry, user management console, feature flags UI.
- **Payment & Monetization**: Subscriptions, payment gateways, premium tiers.
- **Human Moderation Interface**: Review queue for flagged safety incidents.

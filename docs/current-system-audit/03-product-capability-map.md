# 03 - Product Capability Map

## Overview

This matrix maps every product capability identified in the prompt or repository against its current audit status, V1 rebuild requirement, and long-term architectural scope.

---

## Product Feature Implementation & Scope Matrix

| Capability | Current Status | V1 Requirement | Deferred / Future Scope | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Student Accounts & Profile** | `Partially Implemented` | **Core Requirement** | Single-role active for V1 | [AuthComponent.jsx](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/components/AuthComponent.jsx#L84), [routes.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/authentication/routes.py#L19) |
| **Parent / Guardian Portal** | `Not Found` | **Out of Scope** | Future Capability | No parent portal in V1; design role-extensible auth |
| **Educator / Mentor Portal** | `Not Found` | **Out of Scope** | Future Capability | No educator workflows in V1 |
| **Admin Portal** | `Not Found` | **Out of Scope** | Future Capability | No admin portal in V1 |
| **Platform-Wide Adaptivity** | `Missing` (Prototype signal only) | **Core Requirement** | Multidimensional Learner Profile | Current code only tunes system prompt tone via age estimate |
| **Adaptive Chatbot** | `Partially Implemented` | **Core Requirement** | LangGraph + AI Gateway | Backend router has `NameError: deepcopy` |
| **Adaptive Quiz Generation** | `Disconnected` | **Core Requirement** | Adaptive difficulty via LLM | Current UI uses hardcoded questions |
| **Adaptive Homework Assistance** | `Partially Implemented` | **Core Requirement** | OCR + Adaptive Scaffolding | Frontend image upload has `ReferenceError` |
| **Personalised Dashboard** | `Partially Implemented` | **Core Requirement** | Event-driven metrics | Header parameter bug causes HTTP 401 |
| **Learning Roadmap** | `Placeholder` | **Core Requirement** | Adaptive topic sequence | UI currently displays "COMING SOON" |
| **Content Moderation & Safety** | `Missing` | **Deferred** | Required for Public Release | Policy extension points built in V1; moderation deferred |

---

## Capability Status Detail Table

| Feature | Frontend | Backend | Database | AI Integration | Tests | Status | V1 Scope |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Student Auth** | `AuthComponent.jsx` | `routes.py` | MongoDB `users` | N/A | None | `Partially Implemented` | `Required` |
| **Learner Profile** | `Dashboard.jsx` | `dashboard.py` | MongoDB `user_profiles` | Prototype Prompt | None | `Partially Implemented` | `Required (Target: Multidimensional)` |
| **Mental Age Chatbot** | `Chatbot.jsx` | `chatbot.py` | MongoDB `chat_sessions` | LangGraph + Groq | None | `Partially Implemented` | `Required (Target: AI Gateway)` |
| **Homework Helper** | `HomeWorkHelper.jsx` | `homework.py` | None | OCR + Groq | None | `Partially Implemented` | `Required (Target: Adaptive Scaffolding)` |
| **Quiz Generator** | `Quiz.jsx` (Mocked) | `quiz.py` | None | Groq LLM | None | `Disconnected` | `Required (Target: Adaptive Quiz)` |
| **Dashboard Metrics** | `Dashboard.jsx` | `dashboard.py` | MongoDB `user_progress` | N/A | None | `Partially Implemented` | `Required (Target: Event-Driven)` |
| **Content Moderation** | None | None | None | Prompt Text Only | None | `Risk / Missing` | `Deferred (Extension Points Only)` |

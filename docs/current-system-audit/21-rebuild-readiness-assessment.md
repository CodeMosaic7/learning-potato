# 21 - Rebuild Readiness Assessment

## Subsystem Classification & Technical Assessment

This assessment categorizes each subsystem in the existing codebase according to its readiness for reuse, repair, or total replacement during the upcoming platform rebuild, aligned with the confirmed product decisions.

---

## Subsystem Classification Table

| Subsystem | Classification | Technical Justification | Evidence |
| :--- | :--- | :--- | :--- |
| **Frontend UI Layout & Styling** | `Preserve after repair` | Component structure in Tailwind CSS and React 19 is well-formatted. Requires fixing API client function calls and state bugs for student-only scope. | [Home.jsx](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/pages/Home.jsx), [Dashboard.jsx](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/pages/Dashboard.jsx) |
| **Frontend API Integration Layer** | `Replace entirely` | `src/api/api.js` contains broken parameter mappings (`Authorization: Bearer [object Object]`), token storage bugs (`response.access_token`), and missing error boundaries. | [api.js:L44](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/api/api.js#L44), [api.js:L223](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/api/api.js#L223) |
| **Backend Main Application & Routers** | `Rebuild entirely` | `app/main.py` entrypoint is missing. Routers contain missing imports (`deepcopy`), indexing errors (`current_user.id`), and schema query bugs. | [Dockerfile:L13](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/Dockerfile#L13), [chatbot.py:L128](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/router/chatbot.py#L128) |
| **LangGraph Chatbot Engine** | `Preserve after repair` | StateGraph node flow in `agent_chatbot.py` correctly models age-diagnostic dialog sequences. Requires refactoring nodes to consume AI Gateway and Learner Profile context. | [agent_chatbot.py:L328-L360](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/chatbot/agent_chatbot.py#L328-L360) |
| **AI Provider Abstraction** | `Build New (AI Gateway)` | Replace fragmented direct Groq calls and unused Gemini keys with a unified `LLMProvider` gateway and task adapters. | [helper.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/HWhelper/helper.py), [llm.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/chatbot/llm.py) |
| **AI Safety & Child Protection** | `Architect Extension Points` | Moderation deferred for V1. Build input/output policy boundary layers to allow future moderation insertion prior to public release. | Verified absent from repository |
| **Database Model Abstraction** | `Refactor & Standardize` | Standardize on MongoDB Motor repository pattern. Eliminate SQLAlchemy code, unify primary keys as `ObjectId`, and add `learning_events` collection. | [mongo_db.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/mongo_db.py), [models.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/models.py) |
| **Testing Infrastructure** | `Replace entirely` | `test.py` is a database dropping script. Implement automated Pytest unit/integration tests and Vitest frontend tests. | [test.py](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/test.py) |

---

## Detailed Scope Categorization for Rebuild Phase

### 1. Build in the Initial Rebuild (V1 Scope)
- Student Authentication & Account Ownership
- Student Profile & Initial Diagnostic Assessment
- Multidimensional Learner Profile Engine
- Adaptation Policy Engine (platform-wide adaptation rules)
- Adaptive Chatbot (LangGraph + AI Gateway)
- Adaptive Quiz Generator
- Adaptive Homework Helper (OCR + Scaffolding)
- Personalised Student Dashboard
- Adaptive Learning Roadmap
- MongoDB Repositories & Learning Event Model
- AI Provider Gateway & Provider Adapters
- Automated Testing Suite (Pytest & Vitest)

### 2. Architect Now but Implement Later (Deferred Extension Points)
- Input Moderation Policy Layer
- Output Moderation Policy Layer
- Safety Incident Logging & Workflow
- Parent Role & Account Permissions Structure
- Educator Role & Course Management Structure
- Admin System Management Structure
- Human-in-the-loop Review Queue
- Guardian Email Notifications

### 3. Explicitly Out of Initial Rebuild Scope
- Parent Portal UI
- Educator Portal UI
- Admin Dashboard UI
- Multi-Role UI Navigation Switches
- Moderation Management Interface
- Payment Processing & Subscription System

# 04 - System Architecture Documentation

## Overview

This document describes both the empirical current system architecture (audited codebase) and the target rebuild architecture established by the confirmed product decisions.

---

## 1. Current System Architecture (Audited Baseline)

```mermaid
graph TB
    subgraph Client Layer
        SPA["React SPA (Vite) <br> Port 3000"]
    end

    subgraph API Gateway / Server (BROKEN / UNREACHABLE)
        UVICORN["Uvicorn ASGI Server"]
        MAIN["app/main.py <br> (MISSING FILE)"]
        AUTH_R["/auth Router"]
        CHAT_R["/chatbot Router"]
        DASH_R["/dashboard Router"]
        HW_R["/homework Router"]
        QUIZ_R["/quiz Router"]
    end

    subgraph Service & Engine Layer
        LG_AGENT["LangGraph Agent Engine <br> (agent_chatbot.py)"]
        HW_SERVICE["OCR + HW Helper <br> (Pytesseract + helper.py)"]
        QUIZ_SERVICE["Quiz Generator <br> (quiz_generator.py)"]
        AUTH_SERVICE["JWT Auth Service <br> (auth.py + user_logic.py)"]
    end

    subgraph External APIs
        GROQ_API["Groq Llama-3 API"]
        CLOUDINARY_API["Cloudinary CDN"]
    end

    subgraph Persistence Layer
        MONGO_DB["MongoDB Atlas Cluster <br> (Async Motor Driver)"]
    end

    SPA -->|HTTP REST / Cookies| UVICORN
    UVICORN -.->|ModuleNotFoundError| MAIN
    MAIN --> AUTH_R
    MAIN --> CHAT_R
    MAIN --> DASH_R
    MAIN --> HW_R
    MAIN --> QUIZ_R

    AUTH_R --> AUTH_SERVICE
    CHAT_R --> LG_AGENT
    HW_R --> HW_SERVICE
    QUIZ_R --> QUIZ_SERVICE

    AUTH_SERVICE --> MONGO_DB
    AUTH_SERVICE --> CLOUDINARY_API
    CHAT_R --> MONGO_DB
    LG_AGENT --> GROQ_API
    HW_SERVICE --> GROQ_API
    QUIZ_SERVICE --> GROQ_API
```

---

## 2. Target Rebuild Architecture Based on Confirmed Decisions

The target architecture incorporates the 5 confirmed product decisions:
- Single-role Student API boundary (extensible authorization model).
- Unified **Adaptation Policy Engine** driving all feature services.
- Provider-independent **AI Gateway** abstraction.
- **MongoDB** as primary document store + **Learning Event Stream**.
- Policy extension points for deferred moderation.

```mermaid
graph TB
    subgraph Student Client
        SPA["Student React SPA (Vite)"]
    end

    subgraph API Gateway Layer
        FASTAPI["FastAPI App (app/main.py)"]
        POLICY_IN["Input Policy Layer (Pass-Through / Extension Point)"]
        POLICY_OUT["Output Policy Layer (Pass-Through / Extension Point)"]
    end

    subgraph Application Services Layer
        AUTH_SVC["Student Auth & Identity Service"]
        PROFILE_SVC["Learner Profile Service"]
        ADAPT_ENG["Adaptation Policy Engine"]
        EVENT_SVC["Learning Event Service"]
        
        CHAT_SVC["Adaptive Chatbot (LangGraph)"]
        QUIZ_SVC["Adaptive Quiz Service"]
        HW_SVC["Adaptive Homework Helper"]
        DASH_SVC["Personalised Dashboard Service"]
        ROADMAP_SVC["Learning Roadmap Service"]
    end

    subgraph AI Infrastructure Layer
        AI_GW["Internal AI Gateway (LLMProvider)"]
        GROQ_ADP["Groq Adapter"]
        GEMINI_ADP["Gemini Adapter"]
        OPENAI_ADP["OpenAI Adapter"]
    end

    subgraph Persistence Layer (MongoDB)
        MONGO_REPO["MongoDB Repositories"]
        COLL_USERS[("users / student_profiles")]
        COLL_PROFILE[("learner_profiles")]
        COLL_EVENTS[("learning_events")]
        COLL_SESSIONS[("chat_sessions / messages")]
        COLL_QUIZ[("quiz_definitions / attempts")]
    end

    SPA -->|REST API / Bearer Token| FASTAPI
    FASTAPI --> POLICY_IN
    POLICY_IN --> AUTH_SVC
    POLICY_IN --> CHAT_SVC
    POLICY_IN --> QUIZ_SVC
    POLICY_IN --> HW_SVC
    POLICY_IN --> DASH_SVC

    CHAT_SVC & QUIZ_SVC & HW_SVC & DASH_SVC & ROADMAP_SVC -->|Request Adaptation Rules| ADAPT_ENG
    ADAPT_ENG -->|Read Learner Profile| PROFILE_SVC
    
    CHAT_SVC & QUIZ_SVC & HW_SVC -->|Task LLM Requests| AI_GW
    AI_GW --> GROQ_ADP & GEMINI_ADP & OPENAI_ADP

    CHAT_SVC & QUIZ_SVC & HW_SVC -->|Emit Events| EVENT_SVC
    EVENT_SVC -->|Append Event| COLL_EVENTS
    EVENT_SVC -->|Recalibrate Profile| PROFILE_SVC

    PROFILE_SVC & AUTH_SVC & EVENT_SVC --> MONGO_REPO
    MONGO_REPO --> COLL_USERS & COLL_PROFILE & COLL_EVENTS & COLL_SESSIONS & COLL_QUIZ

    CHAT_SVC & QUIZ_SVC & HW_SVC --> POLICY_OUT
    POLICY_OUT --> SPA
```

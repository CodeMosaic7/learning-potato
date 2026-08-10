# 15 - Target System Architecture

## Overview

This document presents the complete technical system topology for the V1 rebuild, illustrating the decoupling between frontend client, FastAPI application domain services, internal AI Gateway, policy layers, and MongoDB data storage.

---

## High-Level V1 System Topology Diagram

```mermaid
graph TB
    subgraph Client Layer
        SPA["React Student SPA (Vite) <br> Student-Only Single Role UI"]
    end

    subgraph API Gateway & Policy Layer
        FASTAPI["FastAPI App (app/main.py)"]
        POLICY_IN["Input Policy Layer <br> (Pass-Through Extension Point)"]
        POLICY_OUT["Output Policy Layer <br> (Pass-Through Extension Point)"]
    end

    subgraph Core Application Domain Services
        AUTH_SVC["Auth Service (JWT)"]
        ASSESS_SVC["Assessment Service"]
        PROFILE_SVC["Learner Profile Service"]
        ADAPT_ENG["Adaptation Policy Engine"]
        
        CHAT_SVC["Tutoring Chat Service <br> (LangGraph Engine)"]
        QUIZ_SVC["Adaptive Quiz Service"]
        HW_SVC["Homework Helper Service <br> (Pytesseract OCR)"]
        DASH_SVC["Dashboard Service"]
        ROADMAP_SVC["Roadmap Service"]
        EVENT_SVC["Learning Event Telemetry Service"]
    end

    subgraph AI Infrastructure Layer
        AI_GW["Internal AI Gateway <br> (LLMProvider Interface)"]
        GROQ_ADP["Groq Provider Adapter"]
        GEMINI_ADP["Gemini Provider Adapter"]
        OPENAI_ADP["OpenAI Provider Adapter"]
    end

    subgraph Persistence Layer (MongoDB Atlas)
        MONGO_REPO["Repository Layer (Motor Async Client)"]
        DB_USERS[("users / student_profiles")]
        DB_PROFILES[("learner_profiles / versions")]
        DB_EVENTS[("learning_events / skill_mastery")]
        DB_SESSIONS[("chat_sessions / messages")]
        DB_QUIZ[("quiz_definitions / attempts")]
        DB_HW[("homework_submissions")]
    end

    SPA -->|REST API / Bearer Token| FASTAPI
    FASTAPI --> POLICY_IN
    POLICY_IN --> AUTH_SVC & ASSESS_SVC & CHAT_SVC & QUIZ_SVC & HW_SVC & DASH_SVC & ROADMAP_SVC

    CHAT_SVC & QUIZ_SVC & HW_SVC & DASH_SVC & ROADMAP_SVC -->|Request Adaptation Rules| ADAPT_ENG
    ADAPT_ENG -->|Read Profile| PROFILE_SVC

    CHAT_SVC & QUIZ_SVC & HW_SVC -->|Task LLM Requests| AI_GW
    AI_GW --> GROQ_ADP & GEMINI_ADP & OPENAI_ADP

    ASSESS_SVC & CHAT_SVC & QUIZ_SVC & HW_SVC -->|Emit Telemetry| EVENT_SVC
    EVENT_SVC --> DB_EVENTS
    EVENT_SVC -->|Recalibrate| PROFILE_SVC

    AUTH_SVC & ASSESS_SVC & PROFILE_SVC & CHAT_SVC & QUIZ_SVC & HW_SVC & DASH_SVC & ROADMAP_SVC --> MONGO_REPO
    MONGO_REPO --> DB_USERS & DB_PROFILES & DB_EVENTS & DB_SESSIONS & DB_QUIZ & DB_HW

    CHAT_SVC & QUIZ_SVC & HW_SVC & DASH_SVC --> POLICY_OUT
    POLICY_OUT --> SPA
```

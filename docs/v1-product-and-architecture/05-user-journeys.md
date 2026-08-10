# 05 - User Journeys & End-to-End Workflows

## Overview

This document details the primary end-to-end student user journeys for V1.

---

## Journey UJ-01: Onboarding, Assessment & Initial Profile Setup

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant SPA as Student React App
    participant Auth as Auth Service
    participant Assess as Assessment Service
    participant Profile as Learner Profile Service
    participant DB as MongoDB Atlas

    Student->>SPA: Fill registration form (email, username, password, grade)
    SPA->>Auth: POST /api/v1/auth/register
    Auth->>DB: Save student credentials (role: "student")
    Auth-->>SPA: Return JWT Token
    SPA->>Assess: POST /api/v1/assessments/initialize
    Assess->>DB: Create assessment_sessions document (status: "IN_PROGRESS")
    Assess-->>SPA: Present initial diagnostic question
    
    loop Diagnostic Interaction (3-5 turns)
        Student->>SPA: Submit answer
        SPA->>Assess: POST /api/v1/assessments/answer
        Assess->>DB: Log raw answer & evidence turn
        Assess-->>SPA: Present next question / complete signal
    end
    
    Assess->>Profile: Trigger Learner Profile Generation
    Profile->>DB: Create multidimensional document in learner_profiles
    Assess-->>SPA: Assessment Completed -> Redirect to Dashboard
```

---

## Journey UJ-02: Adaptive AI Tutoring Chat Session

1. Student navigates to `/chatbot` tab.
2. App sends `POST /api/v1/chat/initialize`. Backend retrieves active `LearnerProfile` from `learner_profiles`.
3. Adaptation Policy Engine resolves current prompt configuration (`vocabulary_level: "simple"`, `explanation_depth: "guided"`).
4. Student sends question: *"Why is the sky blue?"*
5. Chatbot Service invokes LangGraph workflow; nodes request LLM text via internal `AI Gateway`.
6. AI Gateway dispatches request to configured provider adapter (e.g. `GroqProvider` or `GeminiProvider`).
7. Response is returned to student UI; `CHAT_INTERACTION_COMPLETED` telemetry event is logged.

---

## Journey UJ-03: Homework Helper Step-by-Step Scaffolding

1. Student navigates to `/HomeWorkHelper` and uploads photo of math homework.
2. App sends `POST /api/v1/homework/upload` with multipart image payload.
3. Homework Service passes image bytes to OCR engine (`tesseract` / vision API).
4. Extracted text is analyzed by Adaptation Engine alongside student's `reading_level` and `instruction_following` metrics.
5. Service returns micro-step 1: *"First, let's identify the numbers in the equation."*
6. `HOMEWORK_PROCESSED` event logged to `learning_events`.

---

## Journey UJ-04: Adaptive Quiz Challenge & Mastery Feedback

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant SPA as Quiz Page UI
    participant QuizSvc as Quiz Service
    participant AI as Internal AI Gateway
    participant EventSvc as Learning Event Service
    participant Profile as Learner Profile Service

    Student->>SPA: Select topic "Fractions"
    SPA->>QuizSvc: POST /api/v1/quizzes/generate {topic: "Fractions"}
    QuizSvc->>AI: Generate structured quiz matching skill_mastery difficulty
    AI-->>QuizSvc: Return 5 JSON questions
    QuizSvc-->>SPA: Display Quiz questions
    
    Student->>SPA: Answer questions & click Submit
    SPA->>QuizSvc: POST /api/v1/quizzes/submit {answers}
    QuizSvc->>EventSvc: Emit QUIZ_COMPLETED event
    EventSvc->>Profile: Update skill_mastery ("fractions": 0.85)
    QuizSvc-->>SPA: Return Quiz Results & Explanations
```

# 21 - Target API Contract Plan

## Overview

This document specifies the RESTful API endpoints for `ai-learning-backend` in V1.

---

## API Resource Endpoint Inventory

| Method | Endpoint Path | Auth Required | Description | Request Schema | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | None | Register a new student account | `UserRegisterRequest` | `UserRegisterResponse` |
| `POST` | `/api/v1/auth/login` | None | Authenticate student credentials | `UserLoginRequest` | `TokenResponse` |
| `POST` | `/api/v1/auth/logout` | Bearer Token | Invalidate current session | None | `SuccessResponse` |
| `GET` | `/api/v1/students/me` | Bearer Token | Fetch authenticated student profile | None | `StudentProfileResponse` |
| `PUT` | `/api/v1/students/me` | Bearer Token | Update student preferences | `UpdateProfileRequest` | `StudentProfileResponse` |
| `POST` | `/api/v1/assessments/initialize` | Bearer Token | Initialize diagnostic assessment | `AssessmentInitRequest` | `AssessmentInitResponse` |
| `POST` | `/api/v1/assessments/answer` | Bearer Token | Submit diagnostic answer turn | `AssessmentAnswerRequest` | `AssessmentAnswerResponse` |
| `GET` | `/api/v1/learner-profile` | Bearer Token | Fetch active Learner Profile | None | `LearnerProfileResponse` |
| `POST` | `/api/v1/chat/initialize` | Bearer Token | Initialize/resume chat session | `ChatInitRequest` | `ChatInitResponse` |
| `POST` | `/api/v1/chat/message` | Bearer Token | Send message to AI Chatbot | `ChatMessageRequest` | `ChatMessageResponse` |
| `POST` | `/api/v1/quizzes/generate` | Bearer Token | Generate adaptive quiz | `QuizGenerateRequest` | `QuizGenerateResponse` |
| `POST` | `/api/v1/quizzes/submit` | Bearer Token | Submit completed quiz attempt | `QuizSubmitRequest` | `QuizResultResponse` |
| `POST` | `/api/v1/homework/upload` | Bearer Token | Upload HW photo for OCR & hints | Multipart File Payload | `HomeworkProcessResponse` |
| `GET` | `/api/v1/dashboard/overview` | Bearer Token | Fetch personalised dashboard metrics | None | `DashboardOverviewResponse` |
| `GET` | `/api/v1/roadmap` | Bearer Token | Fetch topic roadmap & revision steps | None | `RoadmapResponse` |
| `GET` | `/api/v1/learning-events` | Bearer Token | Query student's activity telemetry | Query Params | `LearningEventsListResponse` |

---

## Standard Error Response Payload (`TARGET V1`)

All error responses return a standardized JSON format:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested chat session does not exist or belong to you.",
    "details": {},
    "timestamp": "2026-08-03T01:00:00Z"
  }
}
```

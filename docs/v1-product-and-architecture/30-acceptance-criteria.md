# 30 - Acceptance Criteria

## Overview

This document provides formal, testable acceptance criteria for every V1 capability using `Given-When-Then` format.

---

## Acceptance Criteria Registry

### AC-01: Student Registration
- **Given** an unauthenticated new user on the registration page,
- **When** they submit a valid email, username, full name, password, and grade level,
- **Then** a new user document is created with `role: "student"`, a student profile is created, and an HTTP 201 response with a JWT token is returned.

### AC-02: Resource Ownership Isolation
- **Given** an authenticated Student A with user ID `ObjectId("111111111111111111111111")`,
- **When** they request Student B's chat history at `POST /api/v1/chat/message` using Student B's `session_id`,
- **Then** the backend returns an HTTP 403 Forbidden error response and blocks access.

### AC-03: Learner Profile Initialization
- **Given** a new student completing turn 5 of the initial assessment,
- **When** the assessment service processes the final diagnostic answer,
- **Then** a multidimensional Learner Profile document containing Cognitive, Academic, and Interaction dimensions is created in `learner_profiles`.

### AC-04: Adaptive Chatbot Vocabulary Adaptation
- **Given** an authenticated student whose active Learner Profile has `reading_level: "GRADE_3"`,
- **When** they send a tutoring question to `/api/v1/chat/message`,
- **Then** the Chatbot response is generated using simplified vocabulary and a maximum sentence limit of 3.

### AC-05: AI Gateway Provider Decoupling
- **Given** a feature service requesting LLM text generation,
- **When** the service invokes `ai_gateway.generate_text(...)`,
- **Then** the Gateway dispatches the request to the configured provider adapter without feature code invoking external provider SDKs directly.

### AC-06: Event Telemetry & Dashboard Update
- **Given** a student completing a quiz with score 85%,
- **When** the quiz attempt is submitted to `/api/v1/quizzes/submit`,
- **Then** a `QUIZ_COMPLETED` learning event is logged, `skill_mastery` is updated, and the Dashboard overview reflects the new score and streak.

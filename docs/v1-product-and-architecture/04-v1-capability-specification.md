# 04 - V1 Capability Specification

## Overview

This document provides detailed functional specifications for every core V1 student capability in the target rebuild.

---

## 1. Authentication & Identity Capabilities

### CAP-01: Student Registration
- **Requirement**: Allows a student to create an account using `email`, `username`, `full_name`, `password`, and `grade_level`.
- **Target Contract**: `POST /api/v1/auth/register` returns `UserRegisterResponse` and assigns `role: "student"`.
- **Data Persistence**: Creates documents in `users` and `student_profiles` collections.

### CAP-02: Student Login & Session Restoration
- **Requirement**: Authenticates credentials and returns a JWT access token. Restores student session state upon login.
- **Target Contract**: `POST /api/v1/auth/login` sets token in secure storage. Active session endpoint `GET /api/v1/students/me` fetches profile and active session IDs.

---

## 2. Learner Profile & Assessment Capabilities

### CAP-03: Initial Diagnostic Assessment
- **Requirement**: Presents a short, non-medical, age-diagnostic interaction evaluating cognitive and academic dimensions.
- **Target Contract**: `POST /api/v1/assessments/initialize` creates an assessment session; `POST /api/v1/assessments/answer` logs raw evidence turns.
- **States**: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `PARTIAL`.

### CAP-04: Multidimensional Learner Profile Management
- **Requirement**: Maintains a structured `LearnerProfile` document in `learner_profiles` collection storing Cognitive, Academic, and Interaction dimensions.
- **Target Contract**: `GET /api/v1/learner-profile` returns versioned profile object for the authenticated student.

---

## 3. Tutoring & Chatbot Capabilities

### CAP-05: Adaptive LangGraph Chatbot
- **Requirement**: Provides personalized AI tutoring using LangGraph state graph. Responses adapt vocabulary, step count, and explanation depth based on active Learner Profile parameters evaluated by the Adaptation Policy Engine.
- **Target Contract**: `POST /api/v1/chat/initialize` gets/creates chat session; `POST /api/v1/chat/message` advances graph state via AI Gateway and logs `CHAT_INTERACTION_COMPLETED` events.

---

## 4. Assessment & Practice Capabilities

### CAP-06: Adaptive Quiz Generator
- **Requirement**: Dynamically generates topic-specific quizzes tailored to student skill mastery and target difficulty.
- **Target Contract**: `POST /api/v1/quizzes/generate` returns structured quiz definition; `POST /api/v1/quizzes/submit` evaluates answers, updates `skill_mastery`, and logs `QUIZ_COMPLETED` event.

### CAP-07: Adaptive Homework Helper
- **Requirement**: Processes uploaded homework images, performs OCR text extraction, and delivers step-by-step adaptive guidance and hints.
- **Target Contract**: `POST /api/v1/homework/upload` receives image file, extracts text, generates scaffolding, and logs `HOMEWORK_PROCESSED` event.

---

## 5. Dashboard & Roadmap Capabilities

### CAP-08: Personalised Student Dashboard
- **Requirement**: Aggregates event telemetry to render streak count, quiz stats, skill mastery matrix, and top 3 recommended next actions.
- **Target Contract**: `GET /api/v1/dashboard/overview` returns aggregated metrics derived from `learner_profiles`, `skill_mastery`, and `learning_events`.

### CAP-09: Adaptive Learning Roadmap
- **Requirement**: Displays an ordered sequence of learning modules with automated revision scheduling when skill mastery decays.
- **Target Contract**: `GET /api/v1/roadmap` returns personalized roadmap items and active recommendations.

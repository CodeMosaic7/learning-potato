# 11 - Quiz Specification

## Overview

The V1 Quiz Service dynamically generates adaptive practice quizzes matching the student's topic mastery and adaptation policy configuration.

---

## Quiz Generation & Submission Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Quiz Page
    participant QuizSvc as Quiz Service
    participant Policy as Adaptation Policy Engine
    participant Gateway as AI Gateway
    participant EventSvc as Learning Event Service
    participant DB as MongoDB

    Student->>UI: Select topic "Fractions Addition"
    UI->>QuizSvc: POST /api/v1/quizzes/generate {subject, topic}
    QuizSvc->>Policy: Get target difficulty & hint mode
    Policy-->>QuizSvc: {difficulty: "FOUNDATIONAL", hints_enabled: true}
    QuizSvc->>Gateway: generate_structured(QuizSchema)
    Gateway-->>QuizSvc: Structured 5-Question JSON
    QuizSvc->>DB: Save to quiz_definitions
    QuizSvc-->>UI: Return Quiz Payload

    Student->>UI: Complete quiz & click Submit
    UI->>QuizSvc: POST /api/v1/quizzes/submit {quiz_id, answers}
    QuizSvc->>DB: Save attempt to quiz_attempts
    QuizSvc->>EventSvc: Emit QUIZ_COMPLETED event
    EventSvc->>DB: Update skill_mastery ("fractions_addition": 0.85)
    QuizSvc-->>UI: Return Results & Scored Explanations
```

---

## Structured Quiz Schema (`TARGET V1`)

```json
{
  "quiz_id": "qz_123456789",
  "subject": "mathematics",
  "topic": "fractions_addition",
  "difficulty": "FOUNDATIONAL",
  "questions": [
    {
      "question_id": "q1",
      "question_text": "What is 1/4 + 2/4?",
      "options": ["1/4", "2/4", "3/4", "4/4"],
      "correct_option_index": 2,
      "hint": "Since the bottom numbers (denominators) are the same, just add the top numbers!",
      "explanation": "1 + 2 = 3, so 1/4 + 2/4 = 3/4."
    }
  ]
}
```

---

## Mastery Update & Retry Rules

1. **Mastery Increment**: A quiz score ≥ 80% increments topic mastery by `+0.15` (max `1.0`).
2. **Mastery Decrement & Misconceptions**: A score < 50% decrements topic mastery and flags incorrect answer patterns as potential misconceptions.
3. **Retry Scaffolding**: Failed quizzes generate a revision recommendation with hints enabled before allowing re-attempt.

# 09 - Adaptation Policy Engine

## Overview

The **Adaptation Policy Engine** is a deterministic application domain service that evaluates the active `LearnerProfile` state and generates feature-specific adaptation configurations for the Chatbot, Quiz Generator, Homework Helper, Dashboard, and Roadmap.

---

## Policy Evaluation Architecture

```text
       ┌────────────────────────┐
       │   Learner Profile DB   │
       └───────────┬────────────┘
                   │ Active Dimensions
                   ▼
       ┌────────────────────────┐
       │ Adaptation Policy Engine│
       └───────────┬────────────┘
                   │ Resolves Config
                   ▼
┌────────────────────────────────────────────────────────┐
│ Feature-Specific Adaptation Config Object              │
│ ├─ Chatbot: { vocabulary, step_count, depth }         │
│ ├─ Quiz   : { difficulty, hint_mode, time_limit }     │
│ ├─ HW     : { scaffolding_mode, show_prereqs }        │
│ ├─ Dash   : { priority_actions, highlighted_chips }   │
│ └─ Roadmap: { revision_mode, pacing_speed }           │
└────────────────────────────────────────────────────────┘
```

---

## Adaptation Policy Output Schema Example (`TARGET V1`)

```json
{
  "user_id": "60c72b2f9b1d8b2a3c4d5e6f",
  "evaluated_at": "2026-08-03T01:00:00Z",
  "policy_version": "1.0",
  "features": {
    "chatbot": {
      "vocabulary_complexity": "SIMPLE",
      "max_sentences_per_turn": 3,
      "explanation_depth": "GUIDED",
      "include_analogies": true,
      "system_prompt_tone": "Warm, encouraging, step-by-step 5th-grade tutor"
    },
    "quiz": {
      "target_difficulty": "FOUNDATIONAL",
      "hints_enabled": true,
      "max_time_per_question_sec": 90,
      "question_count": 5
    },
    "homework": {
      "scaffolding_mode": "MICRO_STEPS",
      "auto_explain_prerequisites": true,
      "hint_depth": "HIGH"
    },
    "dashboard": {
      "highlight_mode": "STRENGTHS_AND_RECOMMENDATIONS",
      "show_streak_banner": true
    },
    "roadmap": {
      "pacing": "MODERATE",
      "revision_required": false
    }
  }
}
```

---

## Policy Determinism & Stability Rules

- **Deterministic Rules**: The policy engine uses pure functions mapping profile values to output configs. Identical profile inputs always yield identical adaptation configurations.
- **Provider-Independent**: Policy evaluation is 100% independent of external AI models. It outputs configuration parameters that guide prompt construction in the AI Gateway.
- **Versioning**: Adaptation rules are versioned (`policy_version: "1.0"`), enabling auditability and A/B policy testing.

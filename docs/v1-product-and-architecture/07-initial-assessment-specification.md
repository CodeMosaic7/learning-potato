# 07 - Initial Assessment Specification

## Overview

The initial assessment is a short, non-medical, interactive evaluation designed to establish the student's baseline Learner Profile.

---

## Assessment Question Design Principles

- **Age-Appropriate & Encouraging**: Uses friendly, non-intimidating phrasing. Avoids medical, psychiatric, or diagnostic labels.
- **Short & Progressive**: Consists of 3 to 5 short turns so underprivileged students with limited time or bandwidth can complete it quickly.
- **Non-Binary Scoring**: Questions evaluate thinking style, preference, and reasoning approach rather than simple pass/fail.
- **Uncertainty Friendly**: Provides options for "I don't know yet" to distinguish lack of knowledge from low confidence.

---

## Assessed Dimension Categories

### 1. Cognitive Evidence Collection
- **Comprehension**: Evaluated via short story/passage understanding.
- **Logical Reasoning**: Evaluated via simple pattern and sequence completion.
- **Instruction Handling**: Evaluated via multi-step choice selections.

### 2. Academic Evidence Collection
- **Reading Level**: Inferred from vocabulary choices in selected answers.
- **Numeracy Baseline**: Evaluated via simple mental math and estimation choices.

### 3. Interaction Evidence Collection
- **Preferred Response Length**: Student chooses between short bullet summary vs longer narrative story.
- **Example Preference**: Student indicates preference for real-world analogies vs numerical steps.

---

## Assessment Session State Lifecycle

```text
       ┌──────────────┐
       │ NOT_STARTED  │
       └──────┬───────┘
              │ Start Assessment
              ▼
       ┌──────────────┐
       │ IN_PROGRESS  │◄───────┐ (Submit Answer Turn)
       └──────┬───────┘────────┘
              │ All Turns Answered
              ▼
       ┌──────────────┐
       │  COMPLETED   │
       └──────────────┘
```

> [!NOTE]
> **Skipping & Thresholds (`TBD`)**: Whether a student can skip the initial assessment, and the exact scoring formulas converting answers to numerical weights, remain `TBD — Product-owner decision required.`

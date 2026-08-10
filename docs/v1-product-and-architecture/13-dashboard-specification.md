# 13 - Dashboard Specification

## Overview

The **Personalised Student Dashboard** provides a single-role UI overview displaying progress metrics, skill mastery chips, active learning streaks, and recommended next actions derived from the **Learning Event Stream**.

---

## Target Dashboard Section Breakdown

```text
┌────────────────────────────────────────────────────────────────────────┐
│  WELCOME BANNER: "Welcome back, [Student Name]!"                       │
│  [ Active Grade Level ]  |  [ Assessment Status: COMPLETED ]            │
├────────────────────────────────────────────────────────────────────────┤
│  METRIC CARDS                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Learning     │ │ Quizzes      │ │ Avg Quiz     │ │ Homework     │   │
│  │ Streak: 5d   │ │ Completed: 8 │ │ Score: 84%   │ │ Solved: 12   │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
├────────────────────────────────────────────────────────────────────────┤
│  SKILL MASTERY MATRIX                                                  │
│  [ Fractions: 85% ]  [ Algebra: 40% (Needs Support) ]  [ Science: 70% ] │
├────────────────────────────────────────────────────────────────────────┤
│  TOP 3 RECOMMENDED NEXT ACTIONS                                        │
│  1. 🎯 Practice Fractions Quiz (Foundational)                          │
│  2. 📖 Review Science Chapter 3 Analogy                                │
│  3. ✏️ Try Step-by-Step Homework Helper                                 │
├────────────────────────────────────────────────────────────────────────┤
│  RECENT ACTIVITY TIMELINE (Derived from learning_events)               │
│  - Completed Fractions Quiz (Score 80%) — 2 hours ago                  │
│  - Solved Homework Problem — Yesterday                                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Source Projection Rules

- **Streak & Quizzes Completed**: Projected directly from `learning_events` (aggregating `QUIZ_COMPLETED` and `HOMEWORK_PROCESSED` grouped by `occurred_at` date).
- **Skill Mastery Matrix**: Projected from `skill_mastery` collection.
- **Top 3 Recommendations**: Populated by the Adaptation Policy Engine based on active skill gaps.
- **Zero Mock Data Contract**: Replaces hardcoded static values with authenticated MongoDB aggregations via `GET /api/v1/dashboard/overview`.

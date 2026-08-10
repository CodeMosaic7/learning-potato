# 20 - Open & Resolved Product Questions

## Overview

This document tracks both the **Resolved Product Decisions** confirmed by the product owner following the initial audit and the **Remaining Open Implementation Questions** required for the rebuild phase.

---

## Resolved Product Decisions

The following key architectural and product scope decisions are now resolved:

1. **Initial Role Scope**:
   - **RESOLVED**: **Student only** for V1. Parent, educator, and admin portals are deferred. Authorization policies will be role-extensible for future growth.
2. **Platform-Wide Adaptivity**:
   - **RESOLVED**: Adaptivity applies **platform-wide** (chatbot, quizzes, homework, dashboard, roadmap) driven by a structured multidimensional **Learner Profile** rather than chatbot prompt tone alone.
3. **Moderation Scope**:
   - **RESOLVED**: Moderation and human escalation workflows are **deferred** from initial rebuild V1. Policy extension boundaries will be architected into V1; full moderation remains required before unrestricted public release.
4. **AI Provider Strategy**:
   - **RESOLVED**: No single permanent AI provider is locked. Access will be standardized through an internal **AI Gateway** selecting provider adapters (Groq, Gemini, OpenAI) by task requirements.
5. **Database Persistence Strategy**:
   - **RESOLVED**: Most application data will be persisted in **MongoDB**, using a standardized repository layer and learning event stream.

---

## Remaining Open Implementation Questions

The following implementation-level questions remain open and will be resolved during the rebuild design phase:

### Learner Profile & Assessment Design
1. **Initial Assessment Questions**: What exact question set or diagnostic workflow will be used to initialize the cognitive and academic dimensions of a new student's Learner Profile?
2. **Profile Dimension Scoring**: What scoring algorithms or weightings will convert assessment answers and event metrics into dimension values (e.g. `Comprehension: 0.85`)?
3. **Profile Recalibration Frequency**: Should the Learner Profile update after every single event turn, or asynchronously via background batch jobs?
4. **Assessment Bypass**: Can a student skip the initial diagnostic assessment, and if so, what default baseline profile will be assigned?

### Curriculum & Subject Scope
5. **V1 Subject Scope**: Which specific academic subjects (e.g. Mathematics, Science, English, History) will be fully supported with quiz and homework templates in V1?
6. **Curriculum Source**: Will topic sequences and skill prerequisites be ingested from an external standard (e.g. Common Core) or defined internally?

### Dashboard & Personalisation Rules
7. **Recommendation Ranking**: What rules or algorithms will determine the top 3 recommended next actions displayed on the student dashboard?
8. **Learning Streak Rules**: How will daily learning streaks and active days be calculated from the learning event stream?

### Operations & Release Requirements
9. **Data Retention Duration**: What is the retention period for raw user event logs and chat message histories?
10. **Public Release Thresholds**: What specific moderation capability milestones must be met prior to opening the platform to public child registration?

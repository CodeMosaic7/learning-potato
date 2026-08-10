# 20 - MongoDB Target Data Model

## Overview

This document specifies the target **MongoDB Atlas** database schema for V1. It eliminates the dual-state SQLAlchemy legacy code, standardizes on BSON `ObjectId` for foreign keys, enforces clean indexes, and introduces versioned schemas.

---

## Target Collection Schema Index

```text
Target Database: MELLO_V1

Collections:
1.  users                      (Student credentials & auth status)
2.  student_profiles           (Demographics & grade level)
3.  learner_profiles           (Multidimensional cognitive/academic profile)
4.  learner_profile_versions   (Historical profile snapshots)
5.  assessment_sessions        (Diagnostic assessment sessions)
6.  assessment_answers         (Raw diagnostic answer turns)
7.  chat_sessions              (LangGraph chatbot session metadata)
8.  chat_messages              (Individual chat turns with token metrics)
9.  learning_events            (Immutable activity telemetry stream)
10. skill_mastery              (Per-student topic mastery levels)
11. quiz_definitions           (Structured AI-generated & template quizzes)
12. quiz_attempts              (Student quiz attempts & scores)
13. homework_submissions       (Uploaded HW images, OCR text & steps)
14. recommendations            (Adaptive next actions generated for student)
15. roadmaps                   (Topic progression sequence & revision states)
16. activity_logs              (Aggregated timeline feed for dashboard)
```

---

## Detailed Collection Definitions & Index Rules

### 1. `users` Collection
- **`_id`**: `ObjectId`
- **Fields**: `email` (string, unique), `username` (string, unique), `full_name` (string), `hashed_password` (string), `role` ("student"), `is_active` (bool), `schema_version` (1), `created_at` (UTC), `updated_at` (UTC).
- **Indexes**: `email` (unique), `username` (unique).

### 2. `learner_profiles` Collection
- **`_id`**: `ObjectId`
- **Fields**: `user_id` (`ObjectId`, unique), `profile_version` (int), `status` ("ACTIVE"), `cognitive` (object), `academic` (object), `interaction` (object), `created_at` (UTC), `updated_at` (UTC).
- **Indexes**: `user_id` (unique).

### 3. `learning_events` Collection
- **`_id`**: `ObjectId`
- **Fields**: `event_id` (string, unique), `user_id` (`ObjectId`), `event_type` (string), `source` (string), `payload` (object), `schema_version` (1), `occurred_at` (UTC), `recorded_at` (UTC).
- **Indexes**: `event_id` (unique), `(user_id, occurred_at)`, `(user_id, event_type, occurred_at)`.

---

## Centralized Repository Access Rule

Route handlers and domain services are strictly prohibited from importing `Motor` or calling `db.collection.find()` directly. All database access passes through dedicated repository classes in `app/integrations/database/`:

```python
class LearnerProfileRepository:
    def __init__(self, db_client):
        self.collection = db_client["learner_profiles"]

    async def get_by_user_id(self, user_id: ObjectId) -> Optional[dict]:
        return await self.collection.find_one({"user_id": user_id})
```

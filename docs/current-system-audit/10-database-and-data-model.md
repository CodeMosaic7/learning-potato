# 10 - Database & Data Model Audit

## Overview & Model Dual-State (`CONFLICT`)

The repository currently exhibits a **dual database architecture**:
1. **SQLAlchemy Models (`app/models.py`, `app/crud.py`)**: SQLite / PostgreSQL relational schema (`users`, `quizzes`). Lines 1-33 of `models.py` are commented out, and `test.py` imports a non-existent `database.db`.
2. **Motor / PyMongo Collections (`app/mongo_db.py`, `app/authentication/routes.py`, `app/router/dashboard.py`, `app/router/chatbot.py`)**: Active async MongoDB implementation using database `manika348_db_user`.

---

## Active MongoDB Entity Relationship & Collection Map (Current Implementation)

```mermaid
erDiagram
    users ||--o| user_profiles : "1 : 1 Profile"
    users ||--o| user_courses : "1 : 1 Enrolled Courses"
    users ||--o| user_progress : "1 : N Course Progress"
    users ||--o| chat_sessions : "1 : N LangGraph State"
    users ||--o| user_activity : "1 : N Activities (Unpopulated)"

    users {
        ObjectId _id PK
        string email
        string username
        string full_name
        string hashed_password
        boolean is_active
        boolean is_verified
        datetime created_at
        object profile
        object conversation_state
        int mental_age
        object assessment
    }

    user_profiles {
        ObjectId _id PK
        ObjectId user_id FK
        string bio
        string location
        array interests
        array learning_goals
        string preferred_learning_style
        string intellectual_level
        string emotional_state
        array strengths
        array weaknesses
        string learning_style
        array recommended_subjects
        datetime created_at
        datetime updated_at
    }

    user_courses {
        ObjectId _id PK
        ObjectId user_id FK
        array enrolled_courses
        array completed_courses
        datetime created_at
        datetime updated_at
    }

    user_progress {
        ObjectId _id PK
        ObjectId user_id FK
        object progress
        string status
        ObjectId course_id
        float progress_percentage
        datetime last_accessed
        datetime last_activity
        datetime created_at
        datetime updated_at
    }

    chat_sessions {
        ObjectId _id PK
        string user_id FK
        object state
        string current_stage
        datetime created_at
        datetime updated_at
    }

    user_activity {
        ObjectId _id PK
        ObjectId user_id FK
        string activity_type
        string description
        datetime timestamp
        ObjectId course_id
    }
```

---

## Key Data Model Bugs & Anomaly Analysis (Current Implementation)

1. **Foreign Key Identifier Type Mismatch (`ObjectId` vs `string`)**:
   - In `routes.py`: `user_id = result.inserted_id` (an `ObjectId` instance). It stores `user_id` as `ObjectId` in `user_profiles`, `user_courses`, and `user_progress`.
   - In `chatbot.py`: `user_id = str(current_user["id"])` (a string). It stores `user_id` as a `string` in `chat_sessions`.
   - In `dashboard.py`: Queries use `ObjectId(current_user["id"])` for `user_profiles` and `user_progress`, but fail if `user_id` was written as a string. [routes.py:L67](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/authentication/routes.py#L67), [chatbot.py:L50](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/router/chatbot.py#L50)

2. **Collection Naming Discrepancies**:
   - `mongo_db.py` initializes module variables `user_collection`, `chat_collection`, `quiz_collection`, `user_profiles`, `user_courses`, `user_progress`, `progress_collection`.
   - `chatbot.py:L53` queries `db.chat_collection`, but `chatbot.py:L61` inserts into `db.chat_sessions`. [chatbot.py:L53-L61](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/router/chatbot.py#L53-L61)

3. **Hardcoded MongoDB Atlas Credentials**:
   - `mongo_db.py:L8` hardcodes:
     `uri = f"mongodb+srv://manika348_db_user:{os.getenv('MONGO_DB_PASSWORD')}@cluster0.7ab3cqu.mongodb.net/?appName=Cluster0"`
   - This ignores `Settings.MONGO_DB_URI` configured in `app/config.py`. [mongo_db.py:L8](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/mongo_db.py#L8)

---

## Target MongoDB Data Architecture `TARGET REBUILD DESIGN`

Based on Decision 5, **MongoDB** remains the recommended primary persistence layer for V1.

### Target Collections & Purpose
- `users`: Student authentication, account credentials, and account metadata.
- `student_profiles`: Demographics, grade level, and profile settings.
- `learner_profiles`: Multidimensional cognitive, academic, and interaction dimensions.
- `assessment_sessions`: Active and historical initial cognitive/academic assessment sessions.
- `assessment_answers`: Raw student responses to diagnostic assessment questions.
- `chat_sessions`: Metadata for student LangGraph tutoring sessions.
- `chat_messages`: Full message history with timestamps, roles, and token counts.
- `learning_events`: Immutable telemetry event stream (`QUIZ_COMPLETED`, `HOMEWORK_SUBMITTED`, etc.).
- `skill_mastery`: Per-student topic/skill mastery matrix with confidence scores.
- `quiz_definitions`: AI-generated and template quiz structures.
- `quiz_attempts`: Student quiz attempt records, answers, and scores.
- `homework_submissions`: Homework image uploads, extracted text, and generated explanations.
- `recommendations`: Adaptive content recommendations generated by the Adaptation Policy Engine.
- `roadmaps`: Personalized topic progression sequences and revision schedules.
- `activity_logs`: Aggregated user activity history for dashboard timeline rendering.

### Target Design Rules
1. **Unified Identifier Strategy**: All relational foreign keys (`user_id`, `session_id`, `quiz_id`) will use BSON `ObjectId` consistently.
2. **Repository Pattern**: Route handlers will never invoke `db.collection.find()` directly. Access will be managed via repository classes (`UserRepository`, `LearnerProfileRepository`, `EventRepository`).
3. **Database Indexes**: Mandatory indexes on `user_id`, `created_at`, `event_type`, and compound index `(user_id, event_type, created_at)`.
4. **Schema & Versioning**: Every document will include `schema_version: 1` and standard UTC timestamps (`created_at`, `updated_at`).

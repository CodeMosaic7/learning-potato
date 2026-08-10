# 06 - Backend Architecture Audit

## Overview & Routing Inventory

The backend is intended to be a FastAPI web application structured into modules (`app/authentication`, `app/router`, `app/services`, `app/middleware`, `app/model`).

---

## Critical Entrypoint Finding (`MISSING`)

> [!CAUTION]
> **Fatal Deployment Bug**: The main application entrypoint file `app/main.py` does **NOT** exist in the codebase.
> - The backend `Dockerfile` specifies `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`.
> - Because `app/main.py` is missing, running Uvicorn or building the Docker container crashes instantly with `ModuleNotFoundError: No module named 'app.main'`.
> - None of the FastAPI routers in `app/router/` (`chatbot.py`, `dashboard.py`, `homework.py`, `quiz.py`) or `app/authentication/routes.py` are registered or reachable via HTTP.

---

## Complete API Endpoint Inventory

| Method | Route Path | File & Handler | Auth Required | Request Payload | Response Schema | Collections Used | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | `routes.py:register_user` | None | `UserCreate` | `UserOut` | `users, user_profiles, user_courses, user_progress` | `Unreachable` |
| `POST` | `/auth/login` | `routes.py:login_user` | None | `UserLogin` | `Token` | `users` | `Unreachable` |
| `GET` | `/auth/me` | `routes.py:read_user_me` | Required | None | `UserResponse` | `users` | `Unreachable` |
| `GET` | `/auth/user-details` | `routes.py:get_user_details` | Required | None | `UserResponse` | `users` | `Unreachable` |
| `GET` | `/auth/protected` | `routes.py:protected_route` | Required | None | Dict | `users` | `Unreachable` |
| `POST` | `/auth/logout` | `routes.py:logout` | None | None | Dict | None | `Unreachable` |
| `GET` | `/auth/debug-token` | `routes.py:debug_token` | None | None | Dict | None | `Unreachable` |
| `POST` | `/chatbot/initialize` | `chatbot.py:initialize_chatbot` | Required | None | `InitializeChatbotResponse` | `chat_collection / chat_sessions` | `Unreachable & Collection Mismatch` |
| `POST` | `/chatbot/chat` | `chatbot.py:chat_with_bot` | Required | `ChatMessage` | `ChatResponse` | `chat_sessions` | `Unreachable & Throws NameError` |
| `GET` | `/chatbot/status` | `chatbot.py:get_chatbot_status` | Required | None | `ChatbotStatus` | `chat_sessions` | `Unreachable & Throws AttributeError` |
| `GET` | `/dashboard/` | `dashboard.py:get_dashboard_overview` | Required | None | Dict | `users, user_profiles, user_courses, user_progress` | `Unreachable & Field Count Mismatch` |
| `GET` | `/dashboard/profile` | `dashboard.py:get_user_profile` | Required | None | `UserProfileOut` | `user_profiles` | `Unreachable` |
| `POST` | `/dashboard/profile` | `dashboard.py:create_user_profile` | Required | `UserProfileCreate` | `UserProfileOut` | `user_profiles` | `Unreachable & ID query bug` |
| `PUT` | `/dashboard/profile` | `dashboard.py:update_user_profile` | Required | `UserProfileCreate` | `UserProfileOut` | `user_profiles` | `Unreachable` |
| `DELETE` | `/dashboard/profile` | `dashboard.py:delete_user_profile` | Required | None | None | `user_profiles` | `Unreachable & Key error (_id)` |
| `GET` | `/dashboard/learning-insights` | `dashboard.py:get_learning_insights` | Required | None | Dict | `user_profiles` | `Unreachable` |
| `GET` | `/dashboard/progress` | `dashboard.py:get_learning_progress` | Required | None | Dict | `user_progress` | `Unreachable` |
| `GET` | `/dashboard/recent-activity` | `dashboard.py:get_recent_activity` | Required | Query `limit` | Dict | `user_activity` | `Unreachable & Unpopulated DB` |
| `GET` | `/dashboard/stats/weekly` | `dashboard.py:get_weekly_stats` | Required | None | Dict | `user_activity` | `Unreachable & Unpopulated DB` |
| `POST` | `/homework/upload` | `homework.py:handle_homework` | None | `UploadFile (File)` | Dict | None | `Unreachable` |
| `POST` | `/quiz/` | `quiz.py:generate_quiz_api` | None | Body (`mental_age, topic, num_questions, time_limit`) | Dict | None | `Unreachable` |

---

## Detailed Backend Handler Bugs & Defects

1. **`app/router/chatbot.py` Runtime Crashes**:
   - `chat_with_bot` calls `state = deepcopy(session["state"])` (line 128), but `deepcopy` is **not imported** in `chatbot.py`. Calling `/chat` causes a fatal `NameError: name 'deepcopy' is not defined`. [chatbot.py:L128](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/router/chatbot.py#L128)
   - `get_chatbot_status` accesses `user_id = str(current_user.id)` (line 176). Since `current_user` returned by `get_current_user` is a `dict`, this raises `AttributeError: 'dict' object has no attribute 'id'`. [chatbot.py:L176](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/router/chatbot.py#L176)
   - Collection Name Conflict: `initialize_chatbot` searches `db.chat_collection.find_one` (line 53), but inserts new sessions into `db.chat_sessions.insert_one` (line 61). Sessions are never found upon re-initialization. [chatbot.py:L53-L61](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/router/chatbot.py#L53-L61)

2. **`app/router/dashboard.py` Model & Indexing Defects**:
   - In `create_user_profile` (line 112): `created_profile = await profiles_collection.find_one({"id": result.inserted_id})`. In MongoDB, the primary key field is `_id`, not `id`. Querying `{"id": result.inserted_id}` returns `None`, causing a `TypeError` when unpacking `**created_profile`. [dashboard.py:L112](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/router/dashboard.py#L112)
   - In `delete_user_profile` (line 175): `user_id = ObjectId(current_user["_id"])`. `current_user` dict key is `"id"`, not `"_id"`. Raises `KeyError: '_id'`. [dashboard.py:L175](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/router/dashboard.py#L175)

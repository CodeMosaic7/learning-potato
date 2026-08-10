# 12 - Authentication, Roles & Permissions Audit

## Overview & Role-Permission Matrix

Authentication is currently implemented in `app/authentication/auth.py` and `routes.py` using **JWT tokens** signed with **HS256**. Passwords are hashed using **bcrypt** via `passlib`.

---

## Role Scope & Permission Matrix

> [!NOTE]
> **V1 Scope Update**: Per Product Decision 1, **`student` is the only active user role** for the V1 rebuild. Parent, Educator, and Admin roles are moved to future architectural scope.

| Capability / Route | Student (V1 Active) | Parent/Guardian (Future Scope) | Educator (Future Scope) | Admin (Future Scope) | Enforcement Layer | V1 Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Register / Login** | Yes | Out of Scope | Out of Scope | Out of Scope | Backend (`/auth/register`, `/auth/login`) | `Required` |
| **View Own Dashboard** | Yes (Own Data) | Out of Scope | Out of Scope | Out of Scope | Backend (`Depends(get_current_user)`) | `Required` |
| **Access LangGraph Chatbot** | Yes (Own Session) | Out of Scope | Out of Scope | Out of Scope | Backend (`Depends(get_current_user)`) | `Required` |
| **Upload Homework** | Yes (Own Submission) | Out of Scope | Out of Scope | Out of Scope | Protected Endpoint (Token Auth) | `Required` |
| **Generate Quiz** | Yes (Own Quiz) | Out of Scope | Out of Scope | Out of Scope | Protected Endpoint (Token Auth) | `Required` |
| **Parent Supervision** | Out of Scope | Future Scope | Out of Scope | Out of Scope | Out of Scope for V1 | `Out of Scope` |
| **Educator Dashboard** | Out of Scope | Out of Scope | Future Scope | Out of Scope | Out of Scope for V1 | `Out of Scope` |
| **Admin Operations** | Out of Scope | Out of Scope | Out of Scope | Future Scope | Out of Scope for V1 | `Out of Scope` |

---

## Target Resource Ownership & Security Design (V1 Rebuild)

To prevent privilege escalation or horizontal data leakage between students while maintaining an extensible role structure:

1. **Role-Ready Account Model**: User accounts will store `role: "student"` by default. Auth policies will validate `role` against permissions without hardcoding single-role logic across business functions.
2. **Resource Ownership Enforcement**: Protected routes will strictly enforce student ownership:
   - A student owns their `student_profile` and `learner_profile`.
   - A student owns their `chat_sessions` and `chat_messages`.
   - A student owns their `quiz_attempts` and `homework_submissions`.
   - A student owns their `roadmap` and `recommendations`.
3. **Endpoint Protection**: All API endpoints (including `/homework/upload` and `/quiz/`) must require valid JWT authentication via `Depends(get_current_user)`.

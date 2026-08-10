# 17 - Frontend Architecture

## Overview

The target frontend architecture reorganizes `ai-learning-frontend` into feature-based modules using React 19, Vite, and Tailwind CSS.

---

## Recommended Directory Structure (`TARGET V1`)

```text
ai-learning-frontend/src/
├── app/
│   ├── App.jsx                      # App root, React Router routes, global providers
│   └── main.jsx                     # Entrypoint
├── api/
│   ├── client.js                    # Axios instance with request/response interceptors
│   ├── authApi.js                   # Auth endpoints
│   ├── assessmentApi.js             # Assessment endpoints
│   ├── chatApi.js                   # Chatbot endpoints
│   ├── quizApi.js                   # Quiz endpoints
│   ├── homeworkApi.js               # Homework endpoints
│   ├── dashboardApi.js              # Dashboard endpoints
│   └── roadmapApi.js                # Roadmap endpoints
├── features/                        # Feature-Oriented Modules
│   ├── auth/                        # Registration, Login components & state
│   ├── assessment/                  # Diagnostic Assessment wizard
│   ├── chatbot/                     # Chatbot conversation UI & message history
│   ├── quiz/                        # Quiz challenge UI, questions & timer
│   ├── homework/                    # HW Helper image upload & step scaffolding
│   ├── dashboard/                   # Student progress dashboard & metrics
│   ├── roadmap/                     # Topic roadmap map & revision prompts
│   └── profile/                     # Student profile management
├── shared/
│   ├── components/                  # UI System (Navbar, Cards, Buttons, LoadingSpinners)
│   ├── hooks/                       # Custom hooks (useAuth, useAdaptiveTheme)
│   └── utils/                       # Token helpers, formatters
└── routes/
    ├── ProtectedRoute.jsx           # Student ownership auth guard
    └── AppRoutes.jsx                # Router table
```

---

## Technical Standards & API Contract Handling

1. **Strict Token Storage**: Auth token is extracted from `response.data.access_token` and saved in `localStorage` or memory. Axios interceptor attaches string `Authorization: Bearer <token>`.
2. **Global State & API Handling**: Component state is kept local to features; API calls use centralized API modules with error boundaries.
3. **Empty & Error States**: Every feature view implements explicit `LoadingSpinner`, `EmptyState`, and `ErrorRetry` components for low-bandwidth resiliency.

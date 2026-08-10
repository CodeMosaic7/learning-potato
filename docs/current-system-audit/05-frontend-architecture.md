# 05 - Frontend Architecture Audit

## Overview & Routing Inventory

The frontend is a Single Page Application (SPA) built using **React 19**, **Vite 7**, and **Tailwind CSS 3.4**. Routing is configured in `src/App.jsx` via `react-router-dom`.

---

## Route Inventory & Data Connections

| Route | Page Component | Required Auth | API Endpoints Invoked | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `Home.jsx` | None | None | `Complete` | [App.jsx:L15](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/App.jsx#L15), [Home.jsx](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/pages/Home.jsx) |
| `/login` | `AuthComponent.jsx` | None | `/auth/login`, `/auth/register`, `/auth/me` | `Partially Implemented` (Token storage bug `response.access_token`) | [App.jsx:L16](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/App.jsx#L16), [AuthComponent.jsx](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/components/AuthComponent.jsx) |
| `/dashboard` | `Dashboard.jsx` | Authenticated User | `/dashboard/`, `/dashboard/learning-insights`, `/dashboard/progress`, `/dashboard/recent-activity`, `/dashboard/stats/weekly` | `Partially Implemented` (Header object parameter passing bug) | [App.jsx:L17](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/App.jsx#L17), [Dashboard.jsx](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/pages/Dashboard.jsx) |
| `/chatbot` | `Chatbot.jsx` | Authenticated User | `/chatbot/initialize`, `/chatbot/chat` | `Partially Implemented` (Backend throws NameError) | [App.jsx:L18](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/App.jsx#L18), [Chatbot.jsx](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/pages/Chatbot.jsx) |
| `/HomeWorkHelper` | `HomeWorkHelper.jsx` | None | `/homework/upload` | `Partially Implemented` (Unawaited upload promise & `suggestionsMessage` ReferenceError) | [App.jsx:L19](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/App.jsx#L19), [HomeWorkHelper.jsx](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/pages/HomeWorkHelper.jsx) |
| `/Quiz` | `Quiz.jsx` | None | None (Mock data) | `Disconnected` from backend API | [App.jsx:L20](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/App.jsx#L20), [Quiz.jsx](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/pages/Quiz.jsx#L63-L86) |
| `/Roadmap` | `Roadmap.jsx` | None | None | `Placeholder` ("COMING SOON") | [App.jsx:L21](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/App.jsx#L21), [Roadmap.jsx](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/pages/Roadmap.jsx#L7) |

---

## Detailed Frontend Audit Findings

### 1. API Parameter & Token Passing Bugs in `api.js` and `Dashboard.jsx`
- In `src/api/api.js`:
  ```javascript
  // Line 44: loginUser attempts to read response.access_token instead of response.data.access_token
  localStorage.setItem('access_token', response.access_token);
  ```
  Result: `localStorage.getItem("access_token")` returns the string `"undefined"`. [api.js:L44](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/api/api.js#L44)

- In `src/pages/Dashboard.jsx`:
  ```javascript
  // Lines 52-54: headers object is created
  const headers = { Authorization: `Bearer ${token}` };
  // Lines 66-70: headers object is passed directly into functions expecting a token string
  getDashboardOverview(headers)
  ```
  In `src/api/api.js`:
  ```javascript
  export async function getDashboardOverview(token) {
    const res = await API.get('/dashboard/', {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  ```
  Result: The outgoing HTTP header becomes `Authorization: Bearer [object Object]`, causing backend authentication failures. [Dashboard.jsx:L66](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/pages/Dashboard.jsx#L66), [api.js:L223](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/api/api.js#L223)

### 2. Runtime Errors in `HomeWorkHelper.jsx`
- Line 25: `const text = uploadHomeworkImage(file)` is executed without `await` and the result is ignored. [HomeWorkHelper.jsx:L25](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/pages/HomeWorkHelper.jsx#L25)
- Line 52: `setMessages(prev => [...prev, suggestionsMessage]);` throws `ReferenceError: suggestionsMessage is not defined` when a user uploads an image. [HomeWorkHelper.jsx:L52](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/pages/HomeWorkHelper.jsx#L52)

### 3. Disconnected Functionality in `Quiz.jsx`
- `Quiz.jsx` defines a complete UI for taking quizzes, but its `startQuiz` function uses hardcoded mock questions (`What is the capital of France?`, `Which planet is known as the Red Planet?`, `What is 2 + 2?`). It never calls the `generateQuiz` API in `api.js`. [Quiz.jsx:L63-L86](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/src/pages/Quiz.jsx#L63-L86)

# 16 - Testing & Quality Audit

## Overview & Test Suite Inventory

The repository documentation (`README.md`) claims:
- Backend: `python -m pytest test.py -v`
- Frontend: `npm run test`

---

## Test Inventory & Execution Findings

| Layer | Test Command | Declared in Code? | Execution Result | Status / Defects | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend** | `python -m pytest test.py -v` | File `ai-learning-backend/test.py` exists | **FAILS / BROKEN** | `test.py` is NOT a pytest suite. It is a script that executes `Base.metadata.drop_all(bind=engine)` importing non-existent `database.db`. | [test.py:L2-L5](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/test.py#L2-L5) |
| **Frontend** | `npm run test` | **MISSING** in `package.json` | **FAILS** | `package.json` has scripts `dev`, `build`, `lint`, `preview`. Executing `npm run test` returns `npm ERR! missing script: test`. | [package.json:L6-L11](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-frontend/package.json#L6-L11) |
| **LangGraph** | None | None | None | `test_workflow()` function exists in `agent_chatbot.py:L427`, but is commented out at `L488`. | [agent_chatbot.py:L427-L498](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/chatbot/agent_chatbot.py#L427-L498) |

---

## Quality & Code Smell Summary

1. **Destructive Script Misnamed as Test File**:
   - `ai-learning-backend/test.py`:
     ```python
     from database.db import Base, engine
     Base.metadata.drop_all(bind=engine)
     Base.metadata.create_all(bind=engine)
     ```
   - Running this script attempts to wipe database tables and crashes due to `ModuleNotFoundError: No module named 'database'`.

2. **Zero Automated Test Coverage**:
   - There are zero unit tests, zero integration tests, and zero end-to-end browser tests in either backend or frontend.

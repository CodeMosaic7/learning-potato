# 28 - Data Migration & Preservation Guidelines

## Overview

This document outlines guidelines for transitioning data from the legacy pre-rebuild codebase to the target V1 schema structure.

---

## Migration & Data Handling Strategy

1. **Clean Rebuild Strategy**: Because the pre-rebuild codebase exhibits broken schema contracts, inconsistent collection names (`chat_collection` vs `chat_sessions`), and hardcodedAtlas database credentials (`manika348_db_user`), the V1 rebuild initializes a fresh MongoDB database target (`MELLO_V1`).
2. **User Credential Migration Script (`IF REQUIRED`)**:
   - A standalone migration script (`scripts/migrate_users.py`) can read existing `users` documents from the legacy cluster, convert legacy string user IDs into BSON `ObjectId`, and populate the new `users` and `student_profiles` collections.
3. **Obsolete Model Cleanup**: Legacy commented-out SQLAlchemy models in `app/models.py` and the table-dropping script `test.py` will be removed during the build phase.

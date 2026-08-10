# 31 - Architecture Decision Register (ADRs)

## Overview

This document records the official Architecture Decision Records (ADRs) governing the V1 rebuild.

---

## Architecture Decision Records

### ADR-001: Student-Only Scope for Initial Rebuild (V1)
- **Context**: The platform serves underprivileged children. Focusing on student capabilities ensures V1 execution quality.
- **Decision**: Restrict V1 to student features only. Exclude parent, educator, and admin portals from V1 implementation.
- **Consequences**: Simplifies V1 architecture. Authorization policies must remain role-ready for future roles.
- **Status**: `APPROVED`

### ADR-002: Multidimensional Learner Profile Strategy
- **Context**: Existing age-estimation integer is inadequate for platform-wide adaptation.
- **Decision**: Replace single age score with a multidimensional Learner Profile (Cognitive, Academic, Interaction).
- **Consequences**: Enables platform-wide adaptivity across Chatbot, Quiz, Homework, Dashboard, and Roadmap.
- **Status**: `APPROVED`

### ADR-003: Deferred Moderation with Boundary Layers
- **Context**: Full child moderation software is deferred from initial rebuild V1.
- **Decision**: Architect `Input Policy Layer` and `Output Policy Layer` as pass-through extension points in V1.
- **Consequences**: Allows future safety plugin insertion without altering core workflows. Unrestricted public release requires full moderation implementation.
- **Status**: `APPROVED`

### ADR-004: Provider-Independent AI Gateway
- **Context**: Fragmented direct provider SDK calls create lock-in and rate-limiting bugs.
- **Decision**: Build an internal `AI Gateway` (`LLMProvider`) supporting Groq, Gemini, and OpenAI task adapters.
- **Consequences**: Decouples feature code from provider SDKs and enables dynamic model routing.
- **Status**: `APPROVED`

### ADR-005: MongoDB Primary Persistence & BSON ObjectId Standard
- **Context**: Current database code mixes SQLAlchemy and Motor/MongoDB async driver.
- **Decision**: Standardize on MongoDB Motor repository pattern and BSON `ObjectId` identifiers.
- **Consequences**: Eliminates SQLAlchemy legacy code and fixes collection naming and type mismatches.
- **Status**: `APPROVED`

### ADR-006: Telemetry Event Stream (`learning_events`)
- **Context**: Adaptation engine and dashboard metrics require real-time evidence streaming.
- **Decision**: Emit immutable `LearningEvent` records to `learning_events` collection for all student activities.
- **Consequences**: Provides complete audit trail and decouples activity logging from profile recalibration.
- **Status**: `APPROVED`

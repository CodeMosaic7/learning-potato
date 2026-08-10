# 27 - Security & Deferred Moderation Architecture

## Overview

This specification documents the child security model and the architectural policy extension points designed for deferred moderation in V1.

> [!CAUTION]
> **Production Release Requirement**: Full moderation, child-safety classification, prompt injection defense, and crisis escalation workflows are **deferred from the initial rebuild (V1)**. Full policy implementation is mandatory prior to unrestricted public production release.

---

## Policy Boundary Layer Architecture

In the V1 rebuild, the system implements boundary interfaces that act as pass-through wrappers in V1, allowing safety layers to be plugged in seamlessly during subsequent phases:

```text
Student Input String
        │
        ▼
┌────────────────────────────────────────────────────────┐
│  Input Policy Layer (app/core/policies/input.py)       │
│  - V1 Behavior     : Pass-Through (Log string length)  │
│  - Future Behavior : Prompt Injection & PII Filter     │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│  AI Gateway & LangGraph Agent Workflow                 │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│  Output Policy Layer (app/core/policies/output.py)     │
│  - V1 Behavior     : Pass-Through                      │
│  - Future Behavior : Toxicity & Profanity Check        │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
Student Output Payload
```

---

## Extension Interface Definitions (`TARGET V1`)

```python
class InputPolicyLayer:
    async def evaluate_input(self, user_id: str, input_text: str) -> dict:
        """V1 Pass-Through implementation for input safety policy."""
        return {"is_allowed": True, "flagged_reasons": [], "sanitized_text": input_text}

class OutputPolicyLayer:
    async def evaluate_output(self, user_id: str, output_text: str) -> dict:
        """V1 Pass-Through implementation for output safety policy."""
        return {"is_allowed": True, "flagged_reasons": [], "sanitized_text": output_text}
```

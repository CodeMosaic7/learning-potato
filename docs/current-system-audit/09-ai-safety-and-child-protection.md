# 09 - AI Safety & Child Protection Audit

## Overview & Risk Assessment

Because this platform is intended for **underprivileged children**, child protection, content moderation, PII defense, and emergency escalation mechanisms are paramount safety requirements.

> [!NOTE]
> **Product Decision Note**: Moderation, child-safety classification, human escalation, and guardian notification workflows are **deferred from the initial rebuild (V1)**. However, policy extension points will be architected into V1. Full moderation remains a mandatory requirement before unrestricted public release.

---

## Safety Control & Rebuild Scope Matrix

| Risk Domain | Current Control in Code | Rebuild V1 Scope | Production Release Status | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **Self-Harm / Crisis** | Prompt text asks LLM to include hotlines if urgency > 6 | Policy Layer Extension Point (Pass-Through) | `Mandatory` (Human escalation & alerts) | [agent_chatbot.py:L284](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/chatbot/agent_chatbot.py#L284) |
| **CSAM / Exploitation** | None | Policy Layer Extension Point (Pass-Through) | `Mandatory` (Automated blocking & reporting) | Verified absent from code |
| **Violence / Abuse** | Urgency score parsed from string | Policy Layer Extension Point (Pass-Through) | `Mandatory` (Automated safety filter) | [agent_chatbot.py:L213-L224](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/services/chatbot/agent_chatbot.py#L213-L224) |
| **Prompt Injection** | None | Input Policy Boundary | `Mandatory` (Llama-Guard / NeMo Guardrails) | User input interpolated directly |
| **Profanity Filter** | None | Output Policy Boundary | `Mandatory` (Automated profanity filter) | Verified absent from code |
| **PII & Privacy** | DOB/Grade stored unencrypted | Encrypted Mongo fields & ownership checks | `Mandatory` (COPPA / Privacy Compliance) | [routes.py:L51-L54](file:///home/manika/Documents/Projects/Learning-Platform/learning-potato/ai-learning-backend/app/authentication/routes.py#L51-L54) |
| **Guardian Consent** | None | Out of Scope for V1 | `Mandatory` (Parental consent workflow) | Self-registration without verification |

---

## Architecture Extension Points for Deferred Moderation

In the V1 rebuild, the system will establish clear boundary interfaces so moderation can be plugged in seamlessly during subsequent phases:

```text
Student Input  -->  [ Input Policy Layer ]  -->  LangGraph / AI Gateway  -->  [ Output Policy Layer ]  -->  Student Output
                          │                                                        │
                    (V1: Pass-Through)                                       (V1: Pass-Through)
                    (Future: Safety Filter)                                  (Future: Profanity Check)
```

1. **`Input Policy Layer`**: Intercepts user prompt strings before graph execution to evaluate prompt injection, PII disclosure, and self-harm intent.
2. **`Output Policy Layer`**: Intercepts LLM response text before sending to client to check for appropriate vocabulary, profanity, or toxic content.
3. **`Safety Incident Storage`**: Dedicated collection schema for logging flagged safety events when moderation is activated.

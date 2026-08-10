# 08 - Learner Profile Specification

## Overview

The **Learner Profile** is the central data representation of the student in the target V1 architecture. It replaces single "mental age" integer values with a versioned, multidimensional model.

---

## Target Learner Profile JSON Schema (`TARGET V1 SCHEMA`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "LearnerProfile",
  "type": "object",
  "required": ["user_id", "profile_version", "status", "cognitive", "academic", "interaction", "created_at", "updated_at"],
  "properties": {
    "user_id": { "type": "string", "description": "BSON ObjectId reference to users collection" },
    "profile_version": { "type": "integer", "default": 1 },
    "status": { "type": "string", "enum": ["UNINITIALIZED", "INITIALIZING", "ACTIVE"] },
    
    "cognitive": {
      "type": "object",
      "properties": {
        "comprehension": { "$ref": "#/$defs/dimensionMetric" },
        "reasoning": { "$ref": "#/$defs/dimensionMetric" },
        "problem_solving": { "$ref": "#/$defs/dimensionMetric" },
        "memory_recall": { "$ref": "#/$defs/dimensionMetric" },
        "attention_consistency": { "$ref": "#/$defs/dimensionMetric" },
        "processing_speed": { "$ref": "#/$defs/dimensionMetric" },
        "abstraction_ability": { "$ref": "#/$defs/dimensionMetric" },
        "instruction_following": { "$ref": "#/$defs/dimensionMetric" }
      }
    },

    "academic": {
      "type": "object",
      "properties": {
        "reading_level": { "type": "string", "example": "GRADE_5" },
        "numeracy_level": { "type": "string", "example": "GRADE_5" },
        "strengths": { "type": "array", "items": { "type": "string" } },
        "weaknesses": { "type": "array", "items": { "type": "string" } },
        "misconceptions": { "type": "array", "items": { "type": "string" } }
      }
    },

    "interaction": {
      "type": "object",
      "properties": {
        "explanation_depth": { "type": "string", "enum": ["CONCISE", "GUIDED", "DETAILED"] },
        "response_length": { "type": "string", "enum": ["SHORT", "MEDIUM", "LONG"] },
        "learning_pace": { "type": "string", "enum": ["SLOW", "MODERATE", "ACCELERATED"] },
        "example_preference": { "type": "string", "enum": ["ANALOGY", "NUMERICAL", "FORMAL"] },
        "visual_preference": { "type": "boolean", "default": false }
      }
    },

    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" }
  },

  "$defs": {
    "dimensionMetric": {
      "type": "object",
      "properties": {
        "level": { "type": "number", "minimum": 0.0, "maximum": 1.0, "nullable": true },
        "confidence": { "type": "number", "minimum": 0.0, "maximum": 1.0, "nullable": true },
        "evidence_count": { "type": "integer", "default": 0 }
      }
    }
  }
}
```

---

## Dimension Audit & Consuming Features Map

| Dimension Group | Field | Evidentiary Trigger | Primary Consuming Services |
| :--- | :--- | :--- | :--- |
| **Cognitive** | `comprehension` | Assessment & Chat turns | Chatbot Service, Homework Scaffolding |
| **Cognitive** | `reasoning` | Quiz attempts | Quiz Generator, Difficulty Evaluator |
| **Academic** | `reading_level` | Inferred from answers | AI Gateway System Prompts |
| **Academic** | `strengths/weaknesses` | Quiz/HW event streams | Dashboard Service, Roadmap Engine |
| **Interaction** | `explanation_depth` | Student UI selection | Chatbot & HW Response Formatter |

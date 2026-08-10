# 02 - Product Principles & Low-Bandwidth Guidelines

## Overview

This document outlines the core engineering and design principles governing the V1 rebuild, with explicit constraints to support **underprivileged students** operating in resource-constrained environments.

---

## Core Product Principles

### 1. Student-Centered Design
Every interface, interaction, and message must prioritize the student's learning journey, self-efficacy, and psychological safety. Language must be encouraging, clear, and age-appropriate.

### 2. Explainable & Transparent Adaptation
Adaptation should never feel opaque or punitive to the student. If the platform adjusts difficulty or suggests a revision topic, it should provide a simple, encouraging explanation (e.g., *"Let me give you a quick hint to help you master this step!"*).

### 3. No Single Score Labeling
The system must avoid reducing a student's capabilities to a single "mental age" or IQ integer. The platform uses a multidimensional Learner Profile, treating every dimension as dynamic and growable.

### 4. Evidence-Based Profile Updates
Profile recalibrations must be backed by concrete learning telemetry events. The adaptation engine must avoid overreacting to isolated incorrect answers or temporary network delays.

### 5. Provider-Independent Architecture
Feature code must never be hardcoded to specific third-party AI provider SDKs. All AI capabilities pass through an internal AI Gateway.

---

## Underprivileged & Low-Resource Operating Requirements `TARGET V1 REQUIREMENT`

Because many target students access the platform on low-end mobile devices over slow or metered mobile networks (2G/3G/4G):

| Constraint | Design & Architecture Rule | Implementation Detail |
| :--- | :--- | :--- |
| **Slow / Unstable Internet** | Optimistic UI updates & graceful offline recovery | API client handles request retries; user inputs are cached locally until network sync succeeds. |
| **Low-End Mobile Devices** | Lightweight DOM & minimal animation overhead | CSS animation is constrained; heavy JS bundles are split; smooth fallback without Framer Motion bloat. |
| **Limited Data Packages** | Minimal asset payload size | Images (e.g., homework uploads) are compressed on the client before upload; SVG icons are used instead of raster images. |
| **Request Timeouts** | Clear failure states & session preservation | If an LLM call times out, the UI displays a clear "AI is taking longer than usual" prompt with a Retry button without wiping input state. |
| **Interrupted Activities** | State checkpointing & activity resume | Chat turns, quiz attempts, and initial assessments save progress per step to MongoDB, allowing seamless session restoration. |

---

## Accessibility & UI Standards

- **Color Contrast**: Compliant with WCAG AA contrast ratios for dark mode UI elements.
- **Font Legibility**: High-readability sans-serif typography with adjustable text scaling.
- **Touch Targets**: Minimum 44x44px touch targets on all interactive buttons and inputs for mobile usability.

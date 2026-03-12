def guidance_node(state: State) -> State:
    """Provide comprehensive, age-appropriate guidance"""
    age_category = state.get("age_category", "adult")
    estimated_age = state.get("estimated_age", 15)
    assessment_score = state.get("assessment_score", 5)
    primary_concern = state.get("primary_concern", "general")
    emotional_state = state.get("emotional_state", "")
    risk_level = state.get("risk_level", "low")
    # Get conversation summary
    recent_messages = state.get("conversation_history", [])[-6:]
    tone_guide = {
        "child": "simple, warm words and short sentences. Use examples they can relate to.",
        "teen": "respectful, relatable language. Acknowledge their independence and feelings.",
        "young_adult": "supportive but mature. Respect their adult perspective.",
        "adult": "professional, empathetic counseling approach."
    }
    prompt = f"""Provide final guidance for a {age_category} (age ~{estimated_age}) dealing with {primary_concern}.

Context:
- Urgency: {assessment_score}/10
- Emotional state: {emotional_state}
- Risk level: {risk_level}

Use {tone_guide.get(age_category, tone_guide['adult'])}

Include:
1. Validation and empathy (2-3 sentences)
2. 3-4 specific, actionable coping strategies appropriate for their age
3. When to seek additional help
4. Age-appropriate resources or hotlines (if urgency > 6)
5. Encouraging closing message

Make it warm, practical, and hopeful."""
    response = safe_invoke(prompt)
    guidance = response.content
    state["final_guidance"] = guidance
    state["current_response"] = guidance
    state["conversation_history"].append({
        "role": "assistant",
        "content": guidance
    })
    print(f"\nFinal Guidance:\n{guidance}")
    return state
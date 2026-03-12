def follow_up_node(state: State) -> State:
    """Ask follow-up questions to better understand the user"""
    age_category = state.get("age_category", "adult")
    estimated_age = state.get("estimated_age", 15)
    primary_concern = state.get("primary_concern", "general")
    prompt = f"""You're talking to a {age_category} (around {estimated_age} years old) about {primary_concern}.
Generate a warm, empathetic follow-up response that:
1. Acknowledges their feelings briefly
2. Asks ONE thoughtful question to understand them better
3. Uses age-appropriate language

Keep it conversational and supportive. Make them feel heard."""

    response = safe_invoke(prompt)
    follow_up = response.content
    
    state["current_response"] = follow_up
    state["conversation_history"].append({
        "role": "assistant",
        "content": follow_up
    })
    
    print(f"\n💬 Assistant: {follow_up}")
    state["follow_up_done"] = True

    return state
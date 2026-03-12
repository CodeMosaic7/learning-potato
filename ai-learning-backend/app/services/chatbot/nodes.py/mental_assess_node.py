def mental_state_assessor_node(state: State) -> State:
    """Assess mental and emotional state"""
    # Get the FIRST user message (their initial concern)
    user_messages = [m["content"] for m in state.get("conversation_history", []) 
                     if m["role"] == "user"]
    if not user_messages:
        state["mental_assessment_complete"] = True
        return state
    first_message = user_messages[0]
    age_category = state.get("age_category", "adult")
    estimated_age = state.get("estimated_age", 15)
    prompt = f"""As a mental health professional, assess this message from a {age_category} (approximately {estimated_age} years old):
"{first_message}"

Provide assessment in this format:
1. Urgency Score: [1-10]
2. Primary Concern: [anxiety/depression/stress/trauma/relationships/academic/family/general]
3. Emotional State: [brief description]
4. Risk Level: [low/medium/high]
5. Needs Immediate Help: [yes/no]
Consider age-appropriate concerns and expression styles."""
    
    response = safe_invoke(prompt)
    assessment = response.content
    
    # Parse assessment
    for line in assessment.split('\n'):
        line = line.strip()
        if 'Urgency Score:' in line:
            try:
                score_str = line.split(':')[1].strip()
                state["assessment_score"] = int(''.join(filter(str.isdigit, score_str.split()[0])))
            except:
                state["assessment_score"] = 5
        elif 'Primary Concern:' in line:
            state["primary_concern"] = line.split(':')[1].strip()
        elif 'Emotional State:' in line:
            state["emotional_state"] = line.split(':')[1].strip()
        elif 'Risk Level:' in line:
            state["risk_level"] = line.split(':')[1].strip().lower()
    print(f"📊 Assessment - Urgency: {state.get('assessment_score', 0)}/10, Concern: {state.get('primary_concern', 'Unknown')}, Risk: {state.get('risk_level', 'Unknown')}")
    state["mental_assessment_complete"] = True
    return state
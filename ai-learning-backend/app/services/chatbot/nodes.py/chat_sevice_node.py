def chat_service_node(state: State) -> State:
    prompt = f"""
Continue as a supportive counselor + general AI assistant.

User said:
"{state['user_input']}"

Provide helpful, safe, supportive, and optionally informative guidance.
    """
    response = safe_invoke(prompt).content
    state["current_response"] = response
    state["conversation_history"].append({"role": "assistant", "content": response})
    return state

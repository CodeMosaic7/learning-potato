def age_ans_node(state: State) -> State:
    """Process the user's answer to age question"""
    user_input = state.get("user_input", "")
    if user_input.strip()!="":
        last_msg = state["conversation_history"][-1] if state["conversation_history"] else {}
        if last_msg.get("content") != user_input:
            state["conversation_history"].append({"role": "user", "content": user_input})
        prev_ans = state.get("age_answers", [])
        prev_ans.append(user_input)
        state["age_answers"] = prev_ans
        state["age_questions_asked"] = state.get("age_questions_asked", 0) + 1
    return state
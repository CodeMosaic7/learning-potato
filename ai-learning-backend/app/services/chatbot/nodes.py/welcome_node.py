from "../agent_chatbot.py" import State

def welcome_node(state: State) -> State:
    """Welcome the user and start conversation"""
    welcome_msg = "Hello! I'm here to support you. How are you feeling today? Feel free to share what's on your mind."
    if state.get("conversation_history"):
        return state
    state["conversation_history"] = [{"role": "assistant", "content": welcome_msg}]
    # print("DEBUG:",state["conversation_history"])
    state["needs_more_info"] = True
    state["age_indicators"] = []
    # print("DEBUG 1: Starting new session.")
    print(f"\n🤖 Assistant: {welcome_msg}")
    return state

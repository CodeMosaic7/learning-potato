def age_router_node(state: State):
    """Update state, then decide route in conditional edge function."""
    questions_asked = state.get("age_questions_asked", 0)
    print("DEBUG 3: Router")
    # if questions_asked >= 5:
    #     print("DEBUG 4: Evaluating age now.")
    #     state["age_router_flag"] = "evaluate_age"
    # elif questions_asked > 0 and state.get("user_input"):
    #     state["age_router_flag"] = "ask_more"
    # else:
    #     state["age_router_flag"] = "done"
    # return state
    return {
        **state,
        "age_router_flag": (
            "skip" if state.get("age_assessment_complete")
            else "evaluate_age" if int(state["age_questions_asked"]) >= 5
            else "ask_more"
        )
    }
def age_evaluation_node(state: State) -> State:
    """Evaluate the user's intellectual age based on their answers"""
    print("DEBUG 5: Evaluating age based on answers.")
    answers = state.get("age_answers", [])
    prompt = f"""
You are a cognitive psychologist estimating the user's **intellectual age**.

Here are the user's answers to age-assessment questions:
{answers}

Evaluate and return ONLY a JSON object:

{{
  "estimated_age": <number>,
  "confidence": <0-10>,
  "category": "child/teen/young_adult/adult",
  "indicators": [
      "short description of reasoning",
      "short description of emotional maturity",
      "short description of decision patterns"
  ]
}}
"""
    result = safe_invoke(prompt).content
    data = json.loads(result)

    state["estimated_age"] = data["estimated_age"]
    state["age_confidence"] = data["confidence"]
    state["age_category"] = data["category"]
    state["age_indicators"] = data["indicators"]
    state["age_assessment_complete"] = True
    state["current_response"] = (
        f"Thanks! I’ve finished understanding your thinking style. "
        f"Estimated intellectual age: {data['estimated_age']} ({data['category']})."
    )
    state["conversation_history"].append({
        "role": "assistant",
        "content": state["current_response"]
    })
    return state

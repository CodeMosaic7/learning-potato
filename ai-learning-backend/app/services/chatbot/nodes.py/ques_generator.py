

def age_question_generator(state: State) -> State:
    """Generates the age assessment questions"""
    print("DEBUG: Starting assessment.")
    prev_ans=state.get("age_answers", [])
    ques_no=state.get("age_questions_asked", 0)
    print("DEBUG 2: Generating question number", ques_no+1)
    prompt = f"""
You are an expert cognitive psychologist. 
You are estimating the user's **intellectual age**.

User's previous answers: {prev_ans}

Generate ONLY the next question (no explanation) that helps assess:
- abstract reasoning
- emotional maturity
- decision-making style
- impulse control
- future planning

Make it short, clear, and age-diagnostic.

Return:
QUESTION: <question>
"""
    response = safe_invoke(prompt)
    question = response.content.split("QUESTION:")[1].strip()
    state["current_response"] = question
    state["conversation_history"].append({
        "role": "assistant",
        "content": question
    })
    print(f"\nAge Evaluation question DEBUG: Assistant: {question}")
    return state

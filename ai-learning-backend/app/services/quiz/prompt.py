def build_quiz_prompt(mental_age: int, topic: str,time_limit:int, num_questions: int) -> str:
    return f"""
You are an expert teacher creating a quiz for a student with a mental age of {mental_age} years.
Generate {num_questions} multiple choice questions on the topic of {topic}.
Each question must have:
- A question
- 4 answer options (A, B, C, D)
- The correct answer

Return the quiz that can be completed in {time_limit}in only raw_format only.

"""

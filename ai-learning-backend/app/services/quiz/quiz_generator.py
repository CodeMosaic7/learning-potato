# app/services/quiz_generator.py

import json
from app.services.quiz.prompt import build_quiz_prompt
from app.services.quiz.groq import generate_quiz

import json
import re

def convert_quiz_to_json(quiz_text):
    """
    Convert quiz text format to JSON structure
    """
    # Split the text into individual questions
    questions = re.split(r'\d+\.', quiz_text)[1:]  # Remove empty first element
    
    quiz_data = {
        "questions": []
    }
    
    for i, question_text in enumerate(questions):
        if not question_text.strip():
            continue
            
        lines = [line.strip() for line in question_text.strip().split('\n') if line.strip()]
        
        if len(lines) < 6:  # Need at least question + 4 options + correct answer
            continue
            
        # Extract question
        question = lines[0]
        
        # Extract options
        options = {}
        option_labels = ['A', 'B', 'C', 'D']
        
        for j, line in enumerate(lines[1:5]):
            if j < len(option_labels):
                # Remove the letter and parenthesis from the beginning
                option_text = re.sub(r'^[A-D]\)\s*', '', line)
                options[option_labels[j]] = option_text
        
        # Extract correct answer
        correct_line = None
        for line in lines:
            if line.startswith('Correct answer:'):
                correct_line = line
                break
        
        if correct_line:
            correct_answer = re.search(r'Correct answer:\s*([A-D])', correct_line)
            correct_key = correct_answer.group(1) if correct_answer else 'A'
        else:
            correct_key = 'A'  # Default fallback
        
        question_data = {
            "id": i + 1,
            "question": question,
            "options": options,
            "correct_answer": correct_key,
            "correct_answer_text": options.get(correct_key, "")
        }
        
        quiz_data["questions"].append(question_data)
    
    return quiz_data


async def create_quiz(mental_age: int, topic: str, time_limit:int,num_questions: int = 5):
    prompt = build_quiz_prompt(mental_age, topic,time_limit, num_questions)
    response = await generate_quiz(prompt)

    response=convert_quiz_to_json(response)
    return response
    
    # try:
    #     quiz_data = json.loads(response)
    #     return {"quiz": quiz_data}
    # except json.JSONDecodeError:
    #     return {
    #         "error": "Could not parse the quiz response as JSON.",
    #         "raw_output": response
    #     }

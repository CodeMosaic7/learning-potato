from typing import Annotated, Optional, Dict, Any
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

from langchain_core.messages import AIMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.language_models.chat_models import BaseChatModel

from dotenv import load_dotenv
import os

from app.services.chatbot.mental_age_ques import MENTAL_AGE_QUESTIONS
from app.db import SessionLocal
from app.authentication.user_logic import UserDatabase

load_dotenv()

def initialise_llm() -> BaseChatModel:
    """ Initialising the LLM
    """
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash-exp",
        google_api_key=api_key,
        temperature=0.4,
        max_tokens=200,
        convert_system_message_to_human=True
    )

llm = initialise_llm()


class State(TypedDict):
    """Defines the initial state"""
    messages: Annotated[list, add_messages]
    user_id: int
    assessment_stage: str
    current_question: int
    assessment_responses: list
    mental_age: Optional[int]
    conversation_context: str
    db_session: Any  # SQLAlchemy session


def analyze_mental_age_fallback(responses: list) -> int:
    age_scores = []
    for i, response in enumerate(responses):
        question_data = MENTAL_AGE_QUESTIONS[i]
        response_lower = response.lower()
        for keywords, age_range in question_data["age_indicators"].items():
            for keyword in keywords.split(", "):
                if keyword in response_lower:
                    age_scores.append(sum(age_range) // 2)
                    break
        else:
            age_scores.append(12)
    return sum(age_scores) // len(age_scores) if age_scores else 12


def assessment_node(state: State) -> Dict[str, Any]:
    """This node calculates the mental age."""
    last_message = state["messages"][-1].content if state["messages"] else ""
    db = UserDatabase(state["db_session"])

    if state["assessment_stage"] == "not_started":
        welcome_msg = llm.invoke("Introduce the mental age test warmly to a child. Ask if they are ready.").content
        return {
            "messages": [AIMessage(content=welcome_msg)],
            "assessment_stage": "ready_to_start",
            "conversation_context": "assessment"
        }

    elif state["assessment_stage"] == "ready_to_start" and ("yes" in last_message.lower() or "ready" in last_message.lower()):
        q = MENTAL_AGE_QUESTIONS[0]["question"]
        prompt = f"Ask this question in a child-friendly tone: {q}"
        generated_q = llm.invoke(prompt).content
        return {
            "messages": [AIMessage(content=f"Question 1: {generated_q}")],
            "assessment_stage": "in_progress",
            "current_question": 0,
            "assessment_responses": []
        }

    elif state["assessment_stage"] == "in_progress":
        i = state["current_question"]
        responses = state["assessment_responses"] + [last_message]
        if i + 1 < len(MENTAL_AGE_QUESTIONS):
            q = MENTAL_AGE_QUESTIONS[i + 1]["question"]
            prompt = f"Ask this question in a child-friendly tone: {q}"
            generated_q = llm.invoke(prompt).content
            return {
                "messages": [AIMessage(content=f"Question {i+2}: {generated_q}")],
                "current_question": i + 1,
                "assessment_responses": responses
            }
        else:
            # === Mental age via LLM ===
            prompt = f"""
You are a child psychologist AI. Based on the following answers to mental age and intellectual test questions, estimate the mental age (in years) of the child. 
Only return a integer as the mental age.

Answers:
{responses}
"""
            try:
                mental_age_str = llm.invoke(prompt).content.strip()
                mental_age = int("".join(filter(str.isdigit, mental_age_str)))
            except Exception as e:
                print("❌ LLM parsing failed, using fallback:", e)
                mental_age = analyze_mental_age_fallback(responses)

            db.save_mental_age(state["user_id"], mental_age, {"responses": responses})

            return {
                "messages": [AIMessage(content=f"Thanks! Based on your answers, I estimate your mental age as {mental_age}.")],
                "assessment_stage": "completed",
                "mental_age": mental_age,
                "assessment_responses": responses,
                "conversation_context": "guidance"
            }

    return guidance_node(state)

def guidance_node(state: State) -> Dict[str, Any]:
    """Provides Help"""
    last = state["messages"][-1].content if state["messages"] else ""
    prompt = f"""
You are a helpful educational assistant for kids. Based on the message: "{last}", suggest what they can explore on the learning platform.
Mention things like homework help, quiz practice, progress reports, games, or study tips.
"""
    reply = llm.invoke(prompt).content
    return {"messages": [AIMessage(content=reply)]}


def router_node(state: State) -> str:
    """Routes the conversation"""
    if state["assessment_stage"] in ["not_started", "ready_to_start", "in_progress"]:
        return "assessment"
    return "guidance"

# Graph Construction 
graph_builder = StateGraph(State)
graph_builder.add_node("assessment", assessment_node)
graph_builder.add_node("guidance", guidance_node)

graph_builder.add_conditional_edges(START, router_node, {
    "assessment": "assessment",
    "guidance": "guidance"
})
graph_builder.add_conditional_edges("assessment", router_node, {
    "assessment": "assessment",
    "guidance": "guidance"
})
graph_builder.add_edge("guidance", END)

graph = graph_builder.compile()

# Connecting Functions
def initialize_chatbot_for_user(user_id: int, db_session) -> dict:
    db = UserDatabase(db_session)
    existing_mental_age = db.get_user_mental_age(user_id)
    return {
        "messages": [],
        "user_id": user_id,
        "assessment_stage": "completed" if existing_mental_age else "not_started",
        "current_question": 0,
        "assessment_responses": [],
        "mental_age": existing_mental_age,
        "conversation_context": "guidance" if existing_mental_age else "assessment",
        "db_session": db_session
    }

def process_user_message(state: dict, user_message: str) -> dict:
    state["messages"].append(HumanMessage(content=user_message))
    result = graph.invoke(state)
    state.update(result)
    return {
        "response": result["messages"][-1].content,
        "updated_state": state
    }

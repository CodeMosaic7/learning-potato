import os
import json
import dotenv
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import TypedDict, Literal
from rate_limiter import llm_rate_limiter
dotenv.load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# wrapper to limit llm calls
@llm_rate_limiter
def safe_invoke(prompt):
    return llm.invoke(prompt)

# State
# this state keeps track of the conversation and assessment data, so need to store this in a database
class State(TypedDict):
    username:str
    user_input: str
    conversation_history: list
    
    # Age assessment fields
    estimated_age: int  
    age_category: str  
    age_confidence: int 
    age_indicators: list  

    age_questions_asked: int
    age_answers: list
        
    # Mental state fields
    assessment_score: int  
    primary_concern: str  
    emotional_state: str
    risk_level: str  
    
    # Response fields
    current_response: str
    needs_more_info: bool
    final_guidance: str

    # checks
    age_assessment_complete: bool
    mental_assessment_complete: bool
    follow_up_done: bool

    # flags
    router_flag: Literal["age_question_generator", "mental_state_assessor", "follow_up", "guidance"]
    age_router_flag: Literal["ask_more", "evaluate_age", "skip"]

# llm = ChatGoogleGenerativeAI(
#     model="gemini-2.0-flash-exp",
#     google_api_key=api_key,
#     temperature=0.6,
#     max_tokens=500,
#     limit_response_tokens=True,
#     convert_system_message_to_human=True
# )
llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.6,
    max_tokens=400
)
# === NODES ===
def welcome_node(state: State) -> State:
    """Welcome the user and start conversation"""
    welcome_msg = "Hello! I'm here to support you. How are you feeling today? Feel free to share what's on your mind."
    state["conversation_history"] = [{"role": "assistant", "content": welcome_msg}]
    print("DEBUG:",state["conversation_history"])
    state["needs_more_info"] = True
    state["age_indicators"] = []
    print("DEBUG: Starting new session.")
    print(f"\n🤖 Assistant: {welcome_msg}")
    return state

def age_question_generator(state: State) -> State:
    """Generates the age assessment questions"""
    print("DEBUG: Starting assessment.")
    prev_ans=state.get("age_answers", [])
    ques_no=state.get("age_questions_asked", 0)
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
    print(f"\nDEBUG: Assistant: {question}")
    return state

def age_ans_node(state: State) -> State:
    """Process the user's answer to age question"""
    user_input = state.get("user_input", "")
    prev_ans=state.get("age_answers", [])
    prev_ans.append(user_input)
    state["age_answers"]=prev_ans
    state["age_questions_asked"]=state.get("age_questions_asked",0)+1
    return state

def age_router_node(state: State):
    """Update state, then decide route in conditional edge function."""

    # No routing here — only update state if needed
    return {
        **state,
        "age_router_flag": (
            "skip" if state.get("age_assessment_complete")
            else "evaluate_age" if state["age_questions_asked"] >= 5
            else "ask_more"
        )
    }

def age_route_decision(state: State):
    return state["age_router_flag"]



def age_evaluation_node(state: State) -> State:
    """Evaluate the user's intellectual age based on their answers"""
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

# need to refine: use rag to pull in relevant knowledge
def mental_state_assessor_node(state: State) -> State:
    """Assess mental and emotional state"""
    user_input = state.get("user_input", "")
    age_category = state.get("age_category", "adult")
    estimated_age = state.get("estimated_age", 15)    
    prompt = f"""As a mental health professional, assess this message from a {age_category} (approximately {estimated_age} years old):
"{user_input}"
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
    lines = assessment.split('\n')
    for line in lines:
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
    
    print(f"   Urgency: {state.get('assessment_score', 0)}/10")
    print(f"   Concern: {state.get('primary_concern', 'Unknown')}")
    print(f"   Risk: {state.get('risk_level', 'Unknown')}")
    state["mental_assessment_complete"] = True
    return state

def follow_up_node(state: State) -> State:
    """Ask follow-up questions to better understand the user"""
    age_category = state.get("age_category", "adult")
    estimated_age = state.get("estimated_age", 15)
    primary_concern = state.get("primary_concern", "general")
    
    prompt = f"""You're talking to a {age_category} (around {estimated_age} years old) about {primary_concern}.

Generate a warm, empathetic follow-up response that:
1. Acknowledges their feelings briefly
2. Asks ONE thoughtful question to understand them better
3. Uses age-appropriate language

Keep it conversational and supportive. Make them feel heard."""

    response = safe_invoke(prompt)
    follow_up = response.content
    
    state["current_response"] = follow_up
    state["conversation_history"].append({
        "role": "assistant",
        "content": follow_up
    })
    
    print(f"\n💬 Assistant: {follow_up}")
    state["follow_up_done"] = True

    return state

def guidance_node(state: State) -> State:
    """Provide comprehensive, age-appropriate guidance"""
    age_category = state.get("age_category", "adult")
    estimated_age = state.get("estimated_age", 15)
    assessment_score = state.get("assessment_score", 5)
    primary_concern = state.get("primary_concern", "general")
    emotional_state = state.get("emotional_state", "")
    risk_level = state.get("risk_level", "low")
    
    # Get conversation summary
    recent_messages = state.get("conversation_history", [])[-6:]
    
    tone_guide = {
        "child": "simple, warm words and short sentences. Use examples they can relate to.",
        "teen": "respectful, relatable language. Acknowledge their independence and feelings.",
        "young_adult": "supportive but mature. Respect their adult perspective.",
        "adult": "professional, empathetic counseling approach."
    }
    
    prompt = f"""Provide final guidance for a {age_category} (age ~{estimated_age}) dealing with {primary_concern}.

Context:
- Urgency: {assessment_score}/10
- Emotional state: {emotional_state}
- Risk level: {risk_level}

Use {tone_guide.get(age_category, tone_guide['adult'])}

Include:
1. Validation and empathy (2-3 sentences)
2. 3-4 specific, actionable coping strategies appropriate for their age
3. When to seek additional help
4. Age-appropriate resources or hotlines (if urgency > 6)
5. Encouraging closing message

Make it warm, practical, and hopeful."""

    response = safe_invoke(prompt)
    guidance = response.content
    
    state["final_guidance"] = guidance
    state["current_response"] = guidance
    state["conversation_history"].append({
        "role": "assistant",
        "content": guidance
    })
    print(f"\nFinal Guidance:\n{guidance}")
    return state

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

def router_node(state: State):
    return {
        **state,
        "router_flag": (
            "age_question_generator" if not state.get("age_assessment_complete")
            else "mental_state_assessor" if not state.get("mental_assessment_complete")
            else "follow_up" if not state.get("follow_up_done")
            else "guidance"
        )
    }

def router_decision(state: State):
    return state["router_flag"]

# === WORKFLOW ===
workflow = StateGraph(State)

# Add all nodes first
workflow.add_node("welcome", welcome_node)
workflow.add_node("age_question_generator", age_question_generator)
workflow.add_node("age_answer", age_ans_node)
workflow.add_node("age_router", age_router_node)
workflow.add_node("age_evaluation", age_evaluation_node)
workflow.add_node("mental_state_assessor", mental_state_assessor_node)
workflow.add_node("follow_up", follow_up_node)
workflow.add_node("guidance", guidance_node)
workflow.add_node("router", router_node)

# Set entry point
workflow.set_entry_point("welcome")

# Add conditional edges
workflow.add_conditional_edges(
    "age_router",
    age_route_decision,
    {
        "ask_more": "age_question_generator",
        "evaluate_age": "age_evaluation",
        "skip": "router"
    }
)

workflow.add_conditional_edges(
    "router",
    router_decision,
    {
        "age_question_generator": "age_question_generator",
        "mental_state_assessor": "mental_state_assessor",
        "follow_up": "follow_up",
        "guidance": "guidance"
    }
)

# Add regular edges
workflow.add_edge("welcome", "age_router")
workflow.add_edge("age_question_generator", "age_answer")
workflow.add_edge("age_answer", "age_router")
workflow.add_edge("age_evaluation", "router")
workflow.add_edge("mental_state_assessor", "router")
workflow.add_edge("follow_up", END)
workflow.add_edge("guidance", END)
# === COMPILE ===
app = workflow.compile()
print(app)

# === INTERACTIVE SESSION ===
def run_interactive_session():
    print("\n" + "="*80)
    print("🏥 Mental Health Counseling Chatbot - Interactive Mode")
    print("="*80)
    print("Type 'quit' to exit\n")
    
    state = {
        "user_input": "",
        "conversation_history": [],
        "estimated_age": 0,
        "age_category": "",
        "age_confidence": 0,
        "age_indicators": [],
        "assessment_score": 0,
        "primary_concern": "",
        "emotional_state": "",
        "risk_level": "",
        "current_response": "",
        "needs_more_info": True,
        "final_guidance": "",
        "age_assessment_complete": False,
        "mental_assessment_complete": False,
        "follow_up_done": False,
        "age_questions_asked": 0,
        "age_answers": [],
    }
    
    # Initial welcome - only invoke ONCE
    for event in app.stream(state):
        if "welcome" in event:
            state = event["welcome"]
            print(f"\n🤖 Assistant: {state['current_response']}")
            break
    
    while True:
        user_input = input("\n👤 You: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'bye']:
            print("\n💙 Take care! Remember, you're not alone.")
            break
            
        if not user_input:
            continue
        
        # Update state with user input
        state["user_input"] = user_input
        state["conversation_history"].append({
            "role": "user",
            "content": user_input
        })
        
        # Stream through remaining nodes
        for event in app.stream(state):
            # Get the last node's output
            node_name = list(event.keys())[0]
            state = event[node_name]
            
            # Print only if there's a response
            if state.get("current_response"):
                print(f"\n🤖 Assistant: {state['current_response']}")
        
        # Check if we've reached the end
        if state.get("follow_up_done") or state.get("final_guidance"):
            break
# === TESTING ===
def test_workflow():
    """Test with automated scenarios"""
    test_cases = [
        {
            "name": "Child Case (Age 8-10)",
            "messages": [
                "I'm scared to go to school because the other kids are mean to me",
                "They call me names and don't let me play with them at recess"
            ]
        },
        {
            "name": "Teen Case (Age 14-16)",
            "messages": [
                "everything is so stressful rn, school is hard and my parents keep fighting",
                "i feel like nobody gets me and i just want to be alone all the time"
            ]
        },
        {
            "name": "Adult Case (Age 25+)",
            "messages": [
                "I've been experiencing persistent anxiety about my career and relationships",
                "The stress is affecting my sleep and I'm having difficulty concentrating at work"
            ]
        }
    ]   
    for test_case in test_cases:
        print("\n" + "="*80)
        print(f"TEST: {test_case['name']}")
        print("="*80)        
        state = {
            "user_input": "",
            "conversation_history": [],
            "evaluation_complete": False,
            "estimated_age": 0,
            "age_category": "",
            "age_confidence": 0,
            "age_indicators": [],
            "assessment_score": 0,
            "primary_concern": "",
            "emotional_state": "",
            "risk_level": "",
            "current_response": "",
            "needs_more_info": True,
            "final_guidance": ""
        }        
        # Welcome
        state = app.invoke(state)
        # Simulate conversation
        for msg in test_case["messages"]:
            state["user_input"] = msg
            state["conversation_history"].append({"role": "user", "content": msg})
            print(f"\n👤 User: {msg}")
            state = app.invoke(state)
            if state.get("evaluation_complete"):
                break        
        print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    if not api_key:
        print("ERROR: API KEY not found!")
        print("Please set your API key in .env file")
    else:
        print("API Key loaded\n")
        mode = input("Choose mode:\n1. Interactive Session\n2. Run Tests\n\nEnter 1 or 2: ").strip()
        if mode == "1":
            run_interactive_session()
        else:
            test_workflow()
    
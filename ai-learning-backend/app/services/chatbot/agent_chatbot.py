from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
import os
import dotenv
import time
import openai

dotenv.load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
# wrapper to limit llm calls
MAX_REQUESTS_PER_MIN = 20 
DELAY = 60 / MAX_REQUESTS_PER_MIN

def llm_rate_limiter(func):
    def wrapper(*args, **kwargs):
        time.sleep(DELAY)  # delay each call
        for attempt in range(5):
            try:
                return func(*args, **kwargs)
            except openai.RateLimitError:
                wait = 2 ** attempt
                print(f"Rate limit reached. Retrying in {wait}s ...")
                time.sleep(wait)
        raise Exception("Failed after multiple retries.")
    return wrapper

@llm_rate_limiter
def safe_invoke(prompt):
    return llm.invoke(prompt)
# State
class State(TypedDict):
    username:str
    user_input: str
    conversation_history: list
    evaluation_complete: bool 
    
    # Age assessment fields
    estimated_age: int  
    age_category: str  
    age_confidence: int 
    age_indicators: list  
    
    # Mental state fields
    assessment_score: int  
    primary_concern: str  
    emotional_state: str
    risk_level: str  
    
    # Response fields
    current_response: str
    needs_more_info: bool
    final_guidance: str

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
    state["needs_more_info"] = True
    state["age_indicators"] = []
    
    print(f"\n🤖 Assistant: {welcome_msg}")
    return state

def age_evaluator_node(state: State) -> State:
    """Continuously evaluate age based on conversation patterns"""
    if state.get("evaluation_complete", False):
        return state
    user_input = state.get("user_input", "")
    history = state.get("conversation_history", [])
    
    recent_messages = "\n".join([
        f"{msg['role']}: {msg['content']}" 
        for msg in history[-6:]  # to maintain context, use last 6 messages
    ])
    
    prompt = f"""You have to analyze this conversation to determine the user's age and intellectual/emotional maturity, being the child psycologist.

Recent conversation:
{recent_messages}

Current message: {user_input}

Provide a detailed assessment:
1. Estimated Age: [specific number like 8, 14, 25, etc.]
2. Age Category: [child (5-12), teen (13-17), young_adult (18-24), adult (25+)]
3. Confidence Level: [1-10, where 10 is very confident]
4. Key Indicators: [List 3-4 specific language/content clues]
5. Language Complexity: [simple/moderate/advanced]
6. Emotional Maturity: [developing/adolescent/mature]
7. Topics of Concern: [what they're worried about]

Base your assessment on:
- Vocabulary and sentence structure
- Topics they discuss
- How they express emotions
- Cultural references
- Concerns and priorities
- Communication style

Format your response exactly as shown above."""

    response = safe_invoke(prompt)
    evaluation = response.content
    
    # Parse the evaluation
    lines = evaluation.split('\n')
    indicators = []
    
    for line in lines:
        line = line.strip()
        if 'Estimated Age:' in line:
            try:
                age_str = line.split(':')[1].strip()
                # Extract just the number
                age_num = ''.join(filter(str.isdigit, age_str.split()[0]))
                state["estimated_age"] = int(age_num) if age_num else 15
            except:
                state["estimated_age"] = 15
                
        elif 'Age Category:' in line:
            category = line.split(':')[1].strip().lower()
            # Extract just the category word
            if 'child' in category:
                state["age_category"] = "child"
            elif 'teen' in category:
                state["age_category"] = "teen"
            elif 'young_adult' in category:
                state["age_category"] = "young_adult"
            else:
                state["age_category"] = "adult"
                
        elif 'Confidence Level:' in line:
            try:
                conf_str = line.split(':')[1].strip()
                state["age_confidence"] = int(''.join(filter(str.isdigit, conf_str.split()[0])))
            except:
                state["age_confidence"] = 5
                
        elif 'Key Indicators:' in line or line.startswith('-') or line.startswith('•'):
            if line.startswith('-') or line.startswith('•'):
                indicators.append(line[1:].strip())
    
    state["age_indicators"] = indicators
    
    print(f"\n🔍 Age Assessment:")
    print(f"   Estimated Age: {state.get('estimated_age', 'Unknown')}")
    print(f"   Category: {state.get('age_category', 'Unknown')}")
    print(f"   Confidence: {state.get('age_confidence', 0)}/10")
    
    return state

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
    
    return state

def conversation_router_node(state: State) -> State:
    """Decide if we need more info or can provide guidance"""
    age_confidence = state.get("age_confidence", 0)
    assessment_score = state.get("assessment_score", 5)
    
    # Need at least 2-3 interactions unless it's an emergency
    if assessment_score < 8:
        state["needs_more_info"] = True
        state["evaluation_complete"] = False
    elif age_confidence >= 7:
        state["needs_more_info"] = False
        state["evaluation_complete"] = True
    elif assessment_score >= 8: 
        state["needs_more_info"] = False
        state["evaluation_complete"] = True
    else:
        state["needs_more_info"] = True
        state["evaluation_complete"] = False
    
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
    
    print(f"\n✨ Final Guidance:\n{guidance}")
    return state

# === CONDITIONAL EDGES ===

def route_after_assessment(state: State) -> Literal["follow_up", "guidance"]:
    """Route based on whether we need more information"""
    needs_more = state.get("needs_more_info", True)
    
    if needs_more:
        return "follow_up"
    else:
        return "guidance"

# === BUILD WORKFLOW ===

workflow = StateGraph(State)

# Add all nodes
workflow.add_node("welcome", welcome_node)
workflow.add_node("age_evaluator", age_evaluator_node)
workflow.add_node("mental_state_assessor", mental_state_assessor_node)
workflow.add_node("conversation_router", conversation_router_node)
workflow.add_node("follow_up", follow_up_node)
workflow.add_node("guidance", guidance_node)

# Define flow
workflow.set_entry_point("welcome")
workflow.add_edge("welcome", "age_evaluator")
workflow.add_edge("age_evaluator", "mental_state_assessor")
workflow.add_edge("mental_state_assessor", "conversation_router")

# Conditional routing
workflow.add_conditional_edges(
    "conversation_router",
    route_after_assessment,
    {
        "follow_up": "follow_up",
        "guidance": "guidance"
    }
)

workflow.add_edge("follow_up", END)
workflow.add_edge("guidance", END)

app = workflow.compile()

# === INTERACTIVE SESSION ===

def run_interactive_session():
    """Run an interactive counseling session"""
    print("\n" + "="*80)
    print("🏥 Mental Health Counseling Chatbot - Interactive Mode")
    print("="*80)
    print("Type 'quit' to exit\n")
    
    # Initialize state
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
    
    # Start with welcome
    state = app.invoke(state)
    
    while True:
        # Get user input
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
        
        # Process through workflow
        state = app.invoke(state)
        
        # Check if evaluation is complete
        if state.get("evaluation_complete"):
            print("\n" + "-"*80)
            print("📊 EVALUATION SUMMARY:")
            print(f"   Age: ~{state.get('estimated_age', 'Unknown')} years ({state.get('age_category', 'Unknown')})")
            print(f"   Primary Concern: {state.get('primary_concern', 'Unknown')}")
            print(f"   Assessment: {state.get('assessment_score', 0)}/10 urgency")
            print("-"*80)
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
        
        # Simulate
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
        print("⚠️  ERROR: GEMINI_API_KEY not found!")
        print("Please set your API key in .env file")
    else:
        print("✅ API Key loaded\n")
        
        mode = input("Choose mode:\n1. Interactive Session\n2. Run Tests\n\nEnter 1 or 2: ").strip()
        
        if mode == "1":
            run_interactive_session()
        else:
            test_workflow()
    
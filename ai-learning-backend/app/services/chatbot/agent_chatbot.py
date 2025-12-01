from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal
from langchain_google_genai import ChatGoogleGenerativeAI
import os
import dotenv

dotenv.load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# State definition
class State(TypedDict): #to be customized based on the workflow
    user_input: str
    conversation_history: list
    user_category: str 
    assessment_score: int  
    evaluation_result: str
    counsellor_response: str
    final_guidance: str

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",
    google_api_key=api_key,
    temperature=0.6,
    max_tokens=400,
    convert_system_message_to_human=True
)

# nodes
def welcome_node(state: State) -> State:
    """Welcome the user and initialize conversation"""
    welcome_msg = "Hello! I'm here to support you. How are you feeling today?"
    state["conversation_history"] = [{"role": "assistant", "content": welcome_msg}]
    print(f"\n🤖 Assistant: {welcome_msg}")
    return state

def evaluator_node(state: State) -> State:
    """Evaluate user's request and categorize their needs"""
    user_input = state.get("user_input", "")
    
    prompt = f"""Analyze this user message and provide:
1. Category (child/teen/adult) based on language complexity
2. Urgency level (1-10)
3. Main concern (anxiety/depression/stress/general)

User message: {user_input}

Respond in format:
Category: [child/teen/adult]
Urgency: [1-10]
Concern: [type]"""

    response = llm.invoke(prompt)
    evaluation = response.content
    
    # Parse evaluation
    lines = evaluation.split('\n')
    for line in lines:
        if 'Category:' in line:
            state["user_category"] = line.split(':')[1].strip().lower()
        elif 'Urgency:' in line:
            try:
                state["assessment_score"] = int(line.split(':')[1].strip())
            except:
                state["assessment_score"] = 5
    
    state["evaluation_result"] = evaluation
    print(f"\nEvaluation: {evaluation}")
    return state

def assessment_node(state: State) -> State:
    """Assess mental/emotional state and determine approach"""
    user_input = state.get("user_input", "")
    category = state.get("user_category", "adult")
    
    prompt = f"""As a mental health assessment specialist, analyze this {category}'s message:
"{user_input}"

Provide:
1. Emotional state assessment
2. Key concerns identified
3. Recommended approach
4. Risk factors (if any)

Keep response concise and professional."""

    response = llm.invoke(prompt)
    assessment = response.content
    
    state["conversation_history"].append({
        "role": "system",
        "content": f"Assessment: {assessment}"
    })
    
    print(f"\n🔍 Assessment: {assessment}")
    return state

def counsellor_agent_node(state: State) -> State:
    """Generate personalized counseling response"""
    user_input = state.get("user_input", "")
    category = state.get("user_category", "adult")
    assessment_score = state.get("assessment_score", 5)
    
    # Adjust tone based on category
    tone_guide = {
        "child": "simple, warm, and encouraging language suitable for children", #needs to age in number
        "teen": "relatable, supportive language that respects their independence",
        "adult": "professional yet empathetic counseling approach"
    }
    
    prompt = f"""You are a compassionate counselor speaking to a {category}.
Use {tone_guide.get(category, tone_guide['adult'])}.

User's message: "{user_input}"
Urgency level: {assessment_score}/10

Provide:
1. Empathetic acknowledgment
2. Validation of feelings
3. Practical coping strategies
4. Encouragement

Keep response warm and actionable."""

    response = llm.invoke(prompt)
    counsellor_response = response.content
    
    state["counsellor_response"] = counsellor_response
    state["conversation_history"].append({
        "role": "assistant",
        "content": counsellor_response
    })
    
    print(f"\n💬 Counselor: {counsellor_response}")
    return state

def guidance_node(state: State) -> State:
    """Provide final guidance and resources"""
    category = state.get("user_category", "adult")
    assessment_score = state.get("assessment_score", 5)
    
    prompt = f"""Provide final guidance for a {category} with urgency level {assessment_score}/10.

Include:
1. Summary of key takeaways
2. 2-3 actionable next steps
3. Relevant resources or hotlines (if urgency > 7)
4. Positive closing message

Keep it brief and encouraging."""

    response = llm.invoke(prompt)
    final_guidance = response.content
    
    state["final_guidance"] = final_guidance
    state["conversation_history"].append({
        "role": "assistant",
        "content": final_guidance
    })
    
    print(f"\n✨ Final Guidance: {final_guidance}")
    return state

# Conditional edge function
def should_escalate(state: State) -> Literal["counsellor_agent", "guidance"]:
    """Determine if counseling is needed or can proceed to guidance"""
    score = state.get("assessment_score", 5)
    # If urgency is high (>6), provide counseling
    if score > 6:
        return "counsellor_agent"
    else:
        return "guidance"

workflow = StateGraph(State)

# Add nodes
workflow.add_node("welcome", welcome_node)
workflow.add_node("evaluator", evaluator_node)
workflow.add_node("assessment", assessment_node)
workflow.add_node("counsellor_agent", counsellor_agent_node)
workflow.add_node("guidance", guidance_node)

# edges
workflow.set_entry_point("welcome")
workflow.add_edge("welcome", "evaluator")
workflow.add_edge("evaluator", "assessment")

# Conditional edge based on assessment
workflow.add_conditional_edges(
    "assessment",
    should_escalate,
    {
        "counsellor_agent": "counsellor_agent",
        "guidance": "guidance"
    }
)

workflow.add_edge("counsellor_agent", "guidance")
workflow.add_edge("guidance", END)

app = workflow.compile()

# test
def test_workflow():
    """Test the workflow with various scenarios"""
    
    test_cases = [
        {
            "name": "High Anxiety Case",
            "input": "I've been feeling really anxious lately. I can't sleep and my heart races all the time. I'm worried something is seriously wrong with me."
        },
        {
            "name": "Teen Stress Case",
            "input": "School is so stressful rn and my parents don't understand. I feel like I'm drowning in homework and nobody cares."
        },
        {
            "name": "Mild Concern Case",
            "input": "I'm feeling a bit down today. Just wanted to talk to someone."
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print("\n" + "="*80)
        print(f"TEST CASE {i}: {test_case['name']}")
        print("="*80)
        
        initial_state = {
            "user_input": test_case["input"],
            "conversation_history": [],
            "user_category": "",
            "assessment_score": 0,
            "evaluation_result": "",
            "counsellor_response": "",
            "final_guidance": ""
        }
        
        try:
            # Run the workflow
            final_state = app.invoke(initial_state)
            
            print("\n" + "-"*80)
            print("WORKFLOW SUMMARY:")
            print(f"User Category: {final_state.get('user_category', 'N/A')}")
            print(f"Assessment Score: {final_state.get('assessment_score', 'N/A')}/10")
            print(f"Total Messages: {len(final_state.get('conversation_history', []))}")
            print("-"*80)
            
        except Exception as e:
            print(f"\n❌ Error in test case: {str(e)}")
        
        print("\n")

if __name__ == "__main__":
    print("🏥 Mental Health Counseling Workflow - LangGraph")
    print("="*80)
    
    # Check if API key is available
    if not api_key:
        print("⚠️  WARNING: GOOGLE_API_KEY not found in environment variables")
        print("Please set your API key in .env file")
    else:
        print("✅ API Key loaded successfully")
        print("\nStarting test workflow...\n")
        test_workflow()
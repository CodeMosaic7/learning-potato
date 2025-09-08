# improved code for chatbot model with LLM integration
# work on resonse generation, conversation state management, and user data handling
from typing import Optional, Dict, Any, List
from enum import Enum
import json
import os
from datetime import datetime
from dotenv import load_dotenv

from langchain_core.messages import AIMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.language_models.chat_models import BaseChatModel

from app.db import SessionLocal
from app.authentication.user_logic import UserDatabase

load_dotenv()

class ChatbotStage(Enum):
    """Chatbot conversation stages"""
    WELCOME = "welcome"
    ASSESSMENT_START = "assessment_start"
    ASSESSMENT_IN_PROGRESS = "assessment_in_progress"
    ASSESSMENT_COMPLETE = "assessment_complete"
    GUIDANCE = "guidance"

class IntellectLevel(Enum):
    """Intellect levels based on mental age"""
    BEGINNER = "beginner"      # 5-8 years
    INTERMEDIATE = "intermediate"  # 9-12 years
    ADVANCED = "advanced"      # 13-16 years
    EXPERT = "expert"          # 17+ years

class MentalAgeAssessmentChatbot:
    """LLM-powered chatbot for mental age assessment and educational guidance"""
    
    def __init__(self, user_id: int, db_session):
        self.user_id = user_id
        self.db_session = db_session
        
        # Initialize database connection
        self.db = UserDatabase(db_session)
        self.llm = self._initialize_llm()
        
        # Initial states - Initialize stage first to prevent None errors
        self.stage = ChatbotStage.WELCOME
        self.conversation_history = []
        self.current_question = 0
        self.responses = []
        self.mental_age = None
        self.intellect_level = None
        self.current_assessment_question = None
        
        # Load existing user data and state
        self._load_user_data()
        self._load_conversation_state()
    
    def _initialize_llm(self) -> BaseChatModel:
        """Initialize the language model"""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables.")
        
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=api_key,
            temperature=0.6,
            max_tokens=400,
            convert_system_message_to_human=True
        )
    
    def _load_user_data(self):
        """Load existing mental age data for the user"""
        try:
            existing_mental_age = self.db.get_user_mental_age(self.user_id)
            if existing_mental_age:
                self.mental_age = existing_mental_age
                self.intellect_level = self._determine_intellect_level(existing_mental_age)
                # Only set to GUIDANCE if no active conversation state exists
                if not self._has_active_conversation():
                    self.stage = ChatbotStage.GUIDANCE
        except Exception as e:
            print(f"Error loading user data: {e}")
            # Continue with default values
    
    def _has_active_conversation(self) -> bool:
        """Check if user has an active conversation in progress"""
        try:
            conversation_state = self.db.get_conversation_state(self.user_id)
            return conversation_state is not None and conversation_state.get('stage') != 'COMPLETE'
        except Exception as e:
            print(f"Error checking active conversation: {e}")
            return False
    
    def _load_conversation_state(self):
        """Load conversation state from database"""
        try:
            state_data = self.db.get_conversation_state(self.user_id)
            if state_data:
                # Safely load stage with fallback
                stage_value = state_data.get('stage', 'welcome')
                try:
                    self.stage = ChatbotStage(stage_value)
                except ValueError:
                    print(f"Invalid stage value: {stage_value}, defaulting to WELCOME")
                    self.stage = ChatbotStage.WELCOME
                
                self.current_question = state_data.get('current_question', 0)
                self.responses = state_data.get('responses', [])
                self.current_assessment_question = state_data.get('current_assessment_question')
                
                print(f"Loaded conversation state: stage={self.stage.value}, question={self.current_question}")
            else:
                print("No existing conversation state found, starting fresh")
        except Exception as e:
            print(f"Error loading conversation state: {e}")
            # Ensure stage is always set to a valid value
            self.stage = ChatbotStage.WELCOME
    
    def _save_conversation_state(self):
        """Save current conversation state to database"""
        try:
            # Ensure stage is not None before accessing .value
            if self.stage is None:
                print("Warning: stage is None, setting to WELCOME")
                self.stage = ChatbotStage.WELCOME
            
            state_data = {
                'stage': self.stage.value,
                'current_question': self.current_question,
                'responses': self.responses,
                'current_assessment_question': self.current_assessment_question,
                'last_updated': datetime.now().isoformat()
            }
            self.db.save_conversation_state(self.user_id, state_data)
            print(f"Saved conversation state: stage={self.stage.value}")
        except Exception as e:
            print(f"Error saving conversation state: {e}")
    
    def _save_user_data(self):
        """Save mental age data to database"""
        try:
            if self.mental_age:
                self.db.save_mental_age(
                    self.user_id, 
                    self.mental_age, 
                    {
                        "responses": self.responses,
                        "intellect_level": self.intellect_level.value if self.intellect_level else None,
                        "assessment_date": datetime.now().isoformat()
                    }
                )
        except Exception as e:
            print(f"Error saving user data: {e}")
    
    def _determine_intellect_level(self, mental_age: int) -> IntellectLevel:
        """Determine intellect level based on mental age"""
        if mental_age <= 8:
            return IntellectLevel.BEGINNER
        elif mental_age <= 12:
            return IntellectLevel.INTERMEDIATE
        elif mental_age <= 16:
            return IntellectLevel.ADVANCED
        else:
            return IntellectLevel.EXPERT
    
    def _generate_assessment_question(self, question_number: int, previous_responses: List[str] = None) -> str:
        """Use LLM to generate adaptive assessment questions"""
        
        if previous_responses:
            context = f"Based on previous responses: {', '.join(previous_responses[-2:])}"
        else:
            context = "This is the first question"
        
        prompt = f"""
        You are an expert child psychologist creating an intellectual assessment for determining mental age (5-18 years).
        
        Question number: {question_number + 1} of 5
        Context: {context}
        
        Create a question that tests one of these cognitive abilities:
        - Mathematical reasoning and problem-solving
        - Logical thinking and pattern recognition
        - Reading comprehension and vocabulary
        - Abstract thinking and conceptual understanding
        - Memory and information processing
        
        Requirements:
        - Make it engaging and child-friendly
        - Progressively increase difficulty if previous answers show higher ability
        - Include clear instructions
        - Make it age-neutral (suitable for different mental ages)
        
        Generate only the question, make it conversational and encouraging.
        """
        
        try:
            question = self.llm.invoke(prompt).content
            return question
        except Exception as e:
            print(f"Error generating question: {e}")
            # Fallback questions
            fallback_questions = [
                "What comes next in this pattern: 2, 4, 6, 8, ?",
                "If you have 3 apples and give away 1, how many do you have left?",
                "What is the opposite of 'hot'?",
                "Can you solve this: 5 + 3 = ?",
                "What do you think happens when ice melts?"
            ]
            return fallback_questions[question_number % len(fallback_questions)]
    
    def _analyze_response_and_adjust(self, question: str, response: str) -> Dict[str, Any]:
        """Use LLM to analyze response and determine comprehension level"""
        
        prompt = f"""
        You are a child psychologist analyzing a response to an intellectual assessment question.
        
        Question: "{question}"
        Response: "{response}"
        
        Analyze this response and provide:
        1. Estimated mental age range (5-18 years) based on the complexity, reasoning, and accuracy
        2. Cognitive strengths demonstrated
        3. Areas that need support
        4. Confidence level in assessment (1-10)
        
        Format your response as JSON:
        {{
            "estimated_mental_age": <number>,
            "confidence": <1-10>,
            "cognitive_strengths": ["strength1", "strength2"],
            "support_areas": ["area1", "area2"],
            "reasoning": "brief explanation"
        }}
        """
        
        try:
            analysis = self.llm.invoke(prompt).content
            # Extract JSON from response
            analysis_data = json.loads(analysis.strip())
            return analysis_data
        except Exception as e:
            print(f"Error parsing analysis: {e}")
            # Fallback analysis
            return {
                "estimated_mental_age": 10,
                "confidence": 5,
                "cognitive_strengths": ["problem solving"],
                "support_areas": ["needs more assessment"],
                "reasoning": "Basic response analysis"
            }
    
    def _calculate_final_mental_age(self, all_analyses: List[Dict]) -> int:
        """Use LLM to calculate final mental age from all response analyses"""
        
        analyses_summary = "\n".join([
            f"Question {i+1}: Mental Age {analysis['estimated_mental_age']}, "
            f"Confidence: {analysis['confidence']}, Reasoning: {analysis['reasoning']}"
            for i, analysis in enumerate(all_analyses)
        ])
        
        prompt = f"""
        You are an expert psychologist calculating the final mental age assessment.
        
        Individual question analyses:
        {analyses_summary}
        
        Calculate the most accurate mental age (5-18 years) considering:
        - Confidence levels of each assessment
        - Consistency across responses
        - Demonstrated cognitive abilities
        - Overall reasoning patterns
        
        Provide only the final mental age as a single integer.
        """
        
        try:
            result = self.llm.invoke(prompt).content.strip()
            mental_age = int(''.join(filter(str.isdigit, result)))
            return max(5, min(18, mental_age))
        except Exception as e:
            print(f"Error calculating mental age: {e}")
            ages = [analysis['estimated_mental_age'] for analysis in all_analyses]
            return sum(ages) // len(ages) if ages else 10
    
    def _generate_personalized_response(self, user_message: str, context: str = "") -> str:
        """Generate contextual responses using LLM"""
        
        conversation_context = "\n".join([
            f"{'User' if isinstance(msg, HumanMessage) else 'Assistant'}: {msg.content}"
            for msg in self.conversation_history[-4:]  
        ])
        
        stage_context = f"Current stage: {self.stage.value if self.stage else 'welcome'}"
        user_context = ""
        
        if self.mental_age and self.intellect_level:
            user_context = f"User's mental age: {self.mental_age}, Intellect level: {self.intellect_level.value}"
        
        prompt = f"""
        You are an intelligent educational chatbot assistant specializing in personalized learning guidance.
        
        {stage_context}
        {user_context}
        {context}
        
        Recent conversation:
        {conversation_context}
        
        User's current message: "{user_message}"
        
        Respond appropriately based on the stage and context. Be:
        - Warm, encouraging, and supportive
        - Age-appropriate for the user's mental age level
        - Educational and helpful
        - Concise but informative
        
        If providing learning guidance, tailor it to their intellect level.
        """
        
        try:
            return self.llm.invoke(prompt).content
        except Exception as e:
            print(f"Error generating personalized response: {e}")
            return "I'm here to help you learn! What would you like to know about?"
    
    def _generate_learning_recommendations(self, topic: str = "") -> str:
        """Generate personalized learning recommendations using LLM"""
        
        if not self.intellect_level:
            return "I'd love to help with learning recommendations! Let me assess your learning level first with a quick fun quiz."
        
        user_profile = f"""
        Mental Age: {self.mental_age}
        Intellect Level: {self.intellect_level.value}
        Learning Characteristics:
        - Beginner (5-8): Visual learning, games, simple concepts, short attention span
        - Intermediate (9-12): Interactive activities, practical examples, structured learning
        - Advanced (13-16): Complex problems, critical thinking, independent research
        - Expert (17+): Abstract concepts, advanced analysis, mentoring others
        """
        
        prompt = f"""
        You are an expert educational consultant creating personalized learning recommendations.
        
        Student Profile:
        {user_profile}
        
        Topic of interest: "{topic}" (if empty, provide general recommendations)
        
        Create specific, actionable learning recommendations including:
        1. Suitable subjects and topics
        2. Learning methods and approaches
        3. Recommended activities and exercises
        4. Study schedule suggestions
        5. Progress tracking methods
        
        Make recommendations age-appropriate and engaging for their intellect level.
        Be specific and practical.
        """
        
        try:
            return self.llm.invoke(prompt).content
        except Exception as e:
            print(f"Error generating learning recommendations: {e}")
            return f"Based on your {self.intellect_level.value} level, I recommend focusing on interactive learning activities that match your interests!"
    
    async def process_message(self, user_message: str) -> Dict[str, Any]:
        """Process user message with LLM-powered responses"""
        print(f"Processing message. Current stage: {self.stage.value if self.stage else 'None'}")             
        # Ensure stage is never None
        if self.stage is None:
            self.stage = ChatbotStage.WELCOME
        
        self.conversation_history.append(HumanMessage(content=user_message))
        response = ""
        additional_data = {}
        try:
            if self.stage == ChatbotStage.WELCOME:
                response = self._handle_welcome(user_message)
            elif self.stage == ChatbotStage.ASSESSMENT_START:
                response = self._handle_assessment_start(user_message)
            elif self.stage == ChatbotStage.ASSESSMENT_IN_PROGRESS:
                response, additional_data = self._handle_assessment_progress(user_message)
            elif self.stage == ChatbotStage.ASSESSMENT_COMPLETE:
                response = self._handle_assessment_complete(user_message)
            elif self.stage == ChatbotStage.GUIDANCE:
                response = self._handle_guidance(user_message)
        except Exception as e:
            print(f"Error in stage handling: {e}")
            response = "I'm sorry, I encountered an issue. Let me help you with your learning needs!"
            self.stage = ChatbotStage.GUIDANCE
        self.conversation_history.append(AIMessage(content=response))
        # Save conversation state after processing
        self._save_conversation_state()
        result = {
            "response": response,
            "stage": self.stage.value if self.stage else "welcome",
            "mental_age": self.mental_age,
            "intellect_level": self.intellect_level.value if self.intellect_level else None,
            "progress": f"{self.current_question}/5" if self.stage == ChatbotStage.ASSESSMENT_IN_PROGRESS else None,
            "user_id": self.user_id
        }
        result.update(additional_data)
        # db_session.commit()
        print(f"Returning response. New stage: {self.stage.value if self.stage else 'None'}")
        return result
    
    def _handle_welcome(self, user_message: str) -> str:
        """Handle welcome stage with LLM"""
        context = """
        This is the first interaction. Welcome the user warmly and explain that you're an AI learning assistant
        who can help assess their learning level and provide personalized educational guidance.
        Ask if they'd like to take a quick 5-question assessment to get personalized recommendations.
        """
        
        response = self._generate_personalized_response(user_message, context)
        self.stage = ChatbotStage.ASSESSMENT_START
        print(f"Stage changed from WELCOME to {self.stage.value}")
        return response
    
    def _handle_assessment_start(self, user_message: str) -> str:
        """Handle assessment start with LLM"""
        print(f"Handling assessment start. Current stage: {self.stage.value}")
        
        # Check if user wants to start assessment
        intent_prompt = f"""
        User message: "{user_message}"
        
        Is the user agreeing to start the assessment? Look for positive responses like:
        yes, sure, okay, let's do it, I'm ready, start, begin, etc.
        
        Respond with only "YES" or "NO"
        """
        
        try:
            intent = self.llm.invoke(intent_prompt).content.strip().upper()
            print(f"User intent: {intent}")
            
            if "YES" in intent:
                # Generate first question
                question = self._generate_assessment_question(0)
                self.current_assessment_question = question
                    
                # Update stage and question counter
                self.stage = ChatbotStage.ASSESSMENT_IN_PROGRESS
                self.current_question = 0
                print(f"Stage changed to {self.stage.value}, question: {self.current_question}")
                    
                # Create a direct response that includes the actual question
                response = f"""Great! Let's begin your personalized learning assessment. 

This will help me understand your learning level so I can provide the best guidance for you.

**Question 1 of 5:**

{question}

Take your time to think through your answer!"""
                    
                return response
            else:
                context = """
                User declined assessment. Offer to help with learning questions or topics instead.
                Be understanding and mention they can take the assessment anytime later.
                """
                self.stage = ChatbotStage.GUIDANCE
                print(f"User declined, stage changed to {self.stage.value}")
                return self._generate_personalized_response(user_message, context)
                
        except Exception as e:
            print(f"Error in assessment start: {e}")
            # Fallback - assume they want to start
            question = self._generate_assessment_question(0)
            self.current_assessment_question = question
            self.stage = ChatbotStage.ASSESSMENT_IN_PROGRESS
            self.current_question = 0
            print(f"Fallback: Stage changed to {self.stage.value}")
            
            return f"""Let's begin your learning assessment!

**Question 1 of 5:**

{question}

Take your time to answer!"""

    def _handle_assessment_progress(self, user_message: str) -> tuple[str, Dict]:
        """Handle assessment progress with LLM analysis"""
        print(f"Handling assessment progress. Question {self.current_question + 1} of 5")
        
        # Analyze current response
        if self.current_assessment_question:
            analysis = self._analyze_response_and_adjust(
                self.current_assessment_question, 
                user_message
            )
        else:
            analysis = {"estimated_mental_age": 10, "confidence": 5, "reasoning": "Question context missing"}
        
        self.responses.append({
            "question_number": self.current_question,
            "response": user_message,
            "analysis": analysis
        })
        
        self.current_question += 1
        
        # Check if assessment is complete
        if self.current_question >= 5:
            # Calculate final mental age
            all_analyses = [resp["analysis"] for resp in self.responses]
            self.mental_age = self._calculate_final_mental_age(all_analyses)
            self.intellect_level = self._determine_intellect_level(self.mental_age)
            
            # Save to database
            self._save_user_data()
            
            self.stage = ChatbotStage.GUIDANCE
            print(f"Assessment complete! Stage changed to {self.stage.value}")
            
            # Clear conversation state since assessment is complete
            try:
                self.db.clear_conversation_state(self.user_id)
            except Exception as e:
                print(f"Error clearing conversation state: {e}")
            
            response = f"""🎉 Assessment Complete! 

Based on your responses, your learning profile shows:
- Mental Age: {self.mental_age} years
- Learning Level: {self.intellect_level.value.title()}

This means I can now provide personalized learning guidance that's just right for you! 

What subject or topic would you like help with? I can suggest study methods, recommend resources, or help with specific questions."""
            
            return response, {
                "assessment_complete": True,
                "detailed_analysis": all_analyses
            }
        else:
            # Generate next question
            previous_responses = [resp["response"] for resp in self.responses]
            next_question = self._generate_assessment_question(self.current_question, previous_responses)
            self.current_assessment_question = next_question
            
            print(f"Moving to question {self.current_question + 1}")
            
            response = f"""Great answer! 

**Question {self.current_question + 1} of 5:**

{next_question}

You're doing well - keep thinking it through!"""
            
            return response, {"current_analysis": analysis}
    
    def _handle_assessment_complete(self, user_message: str) -> str:
        """Handle post-assessment with LLM"""
        self.stage = ChatbotStage.GUIDANCE
        return self._generate_learning_recommendations(user_message)
    
    def _handle_guidance(self, user_message: str) -> str:
        """Handle guidance stage with LLM"""
        try:
            subject_prompt = f"""
            User message: "{user_message}"
            
            Is the user asking about a specific subject or topic? If yes, extract the main subject/topic.
            If asking general questions about learning, studying, or homework, respond with "GENERAL".
            If asking about something unrelated to education, respond with "OTHER".
            
            Examples:
            "help with math" -> "math"
            "I need study tips" -> "GENERAL" 
            "what's the weather" -> "OTHER"
            """
            
            topic_analysis = self.llm.invoke(subject_prompt).content.strip()
            
            if topic_analysis == "OTHER":
                context = """
                User asked about non-educational topic. Gently redirect to learning-related topics
                while being helpful and mentioning your educational expertise.
                """
                return self._generate_personalized_response(user_message, context)
            elif topic_analysis == "GENERAL":
                return self._generate_learning_recommendations()
            else:
                return self._generate_learning_recommendations(topic_analysis)
                
        except Exception as e:
            print(f"Error in guidance handling: {e}")
            return self._generate_learning_recommendations(user_message)
    
    def get_detailed_assessment_report(self) -> Dict[str, Any]:
        """Generate comprehensive assessment report using LLM"""
        if not self.responses or not self.mental_age:
            return {"error": "Assessment not completed"}
        
        responses_summary = "\n".join([
            f"Q{resp['question_number']+1}: {resp['response']} "
            f"(Analysis: Age {resp['analysis']['estimated_mental_age']}, "
            f"Confidence {resp['analysis']['confidence']})"
            for resp in self.responses
        ])
        
        prompt = f"""
        Create a comprehensive learning assessment report for a student.
        
        Mental Age: {self.mental_age}
        Intellect Level: {self.intellect_level.value}
        
        Assessment Details:
        {responses_summary}
        
        Generate a detailed report including:
        1. Overall cognitive strengths
        2. Areas for improvement
        3. Personalized learning strategies
        4. Recommended subjects and difficulty levels
        5. Study techniques that would work best
        6. Progress milestones to track
        
        Format as a structured, professional but encouraging report.
        """
        
        try:
            report = self.llm.invoke(prompt).content
        except Exception as e:
            print(f"Error generating report: {e}")
            report = f"Assessment completed with mental age {self.mental_age} and {self.intellect_level.value} level."
        
        return {
            "mental_age": self.mental_age,
            "intellect_level": self.intellect_level.value,
            "detailed_report": report,
            "assessment_data": self.responses,
            "user_id": self.user_id
        }


def create_chatbot(user_id: int, db_session) -> MentalAgeAssessmentChatbot:
    """Create a new chatbot instance for authenticated user"""
    return MentalAgeAssessmentChatbot(user_id, db_session)


async def initialize_chatbot_session(user_id: int) -> Dict[str, Any]:
    """Initialize a new chatbot session with LLM-powered welcome"""
    db_session = SessionLocal()
    try:
        chatbot = create_chatbot(user_id, db_session)
        initial_response = await chatbot.process_message("Hello! I'm ready to start.")
        
        return {
            "initial_response": initial_response,
            "status": "initialized",
            "user_id": user_id
        }
    except Exception as e:
        print(f"Error initializing chatbot session: {e}")
        return {
            "error": str(e),
            "status": "error",
            "user_id": user_id
        }
    finally:
        db_session.close()


async def process_chatbot_message(message: str, user_id: int) -> Dict[str, Any]:
    """Process a message with full LLM intelligence"""
    try:
        db_session = SessionLocal()
        try:
            chatbot = create_chatbot(user_id, db_session)
            response_data = await chatbot.process_message(message)            
            return {
                "success": True,
                "data": response_data
            }
        finally:
            db_session.close()
            
    except Exception as e:
        print(f"Error processing chatbot message: {e}")
        return {
            "success": False,
            "error": str(e)
        }

def get_learning_insights(user_id: int) -> Dict[str, Any]:
    """Get comprehensive learning insights using LLM"""
    try:
        db_session = SessionLocal()
        try:
            chatbot = create_chatbot(user_id, db_session)
            return chatbot.get_detailed_assessment_report()
        finally:
            db_session.close()
            
    except Exception as e:
        return {"error": str(e)}
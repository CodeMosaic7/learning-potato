from typing import Optional, Dict, Any, List, Union
from enum import Enum
import json
import os
import uuid
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

class SessionData:
    """In-memory session data for guest users"""
    def __init__(self):
        self.sessions = {}
    
    def get_session(self, session_id: str) -> Dict:
        return self.sessions.get(session_id, {})
    
    def save_session(self, session_id: str, data: Dict):
        self.sessions[session_id] = data
    
    def delete_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]

# Global session storage for guest users
guest_sessions = SessionData()

class MentalAgeAssessmentChatbot:
    """LLM-powered chatbot for mental age assessment and educational guidance"""
    
    def __init__(self, user_id: Optional[int] = None, db_session=None, session_id: Optional[str] = None):
        self.user_id = user_id
        self.db_session = db_session
        self.session_id = session_id or str(uuid.uuid4())
        self.is_guest = user_id is None
        
        # Initialize database connection only for registered users
        self.db = UserDatabase(db_session) if db_session and not self.is_guest else None
        self.llm = self._initialize_llm()
        
        # Initial states
        self.conversation_history = []
        self.current_question = 0
        self.responses = []
        self.mental_age = None
        self.intellect_level = None
        self.stage = ChatbotStage.WELCOME
        self.assessment_context = ""
        
        # Load existing data
        if self.is_guest:
            self._load_guest_session()
        else:
            self._load_user_data()
    
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
    
    def _load_guest_session(self):
        """Load session data for guest users"""
        session_data = guest_sessions.get_session(self.session_id)
        if session_data:
            self.conversation_history = session_data.get('conversation_history', [])
            self.current_question = session_data.get('current_question', 0)
            self.responses = session_data.get('responses', [])
            self.mental_age = session_data.get('mental_age')
            self.intellect_level = IntellectLevel(session_data['intellect_level']) if session_data.get('intellect_level') else None
            self.stage = ChatbotStage(session_data.get('stage', ChatbotStage.WELCOME.value))
            self.assessment_context = session_data.get('assessment_context', "")
    
    def _save_guest_session(self):
        """Save session data for guest users"""
        session_data = {
            'conversation_history': [
                {'type': type(msg).__name__, 'content': msg.content} 
                for msg in self.conversation_history
            ],
            'current_question': self.current_question,
            'responses': self.responses,
            'mental_age': self.mental_age,
            'intellect_level': self.intellect_level.value if self.intellect_level else None,
            'stage': self.stage.value,
            'assessment_context': self.assessment_context,
            'last_updated': datetime.now().isoformat()
        }
        guest_sessions.save_session(self.session_id, session_data)
    
    def _load_user_data(self):
        """Load data for registered users"""
        if self.db and self.user_id:
            existing_mental_age = self.db.get_user_mental_age(self.user_id)
            if existing_mental_age:
                self.mental_age = existing_mental_age
                self.intellect_level = self._determine_intellect_level(existing_mental_age)
                self.stage = ChatbotStage.GUIDANCE
    
    def _save_user_data(self):
        """Save data for registered users"""
        if self.db and self.user_id and self.mental_age:
            self.db.save_mental_age(
                self.user_id, 
                self.mental_age, 
                {
                    "responses": self.responses,
                    "intellect_level": self.intellect_level.value if self.intellect_level else None,
                    "session_type": "registered_user"
                }
            )
    
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
        
        question = self.llm.invoke(prompt).content
        return question
    
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
        except:
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
        except:
            ages = [analysis['estimated_mental_age'] for analysis in all_analyses]
            return sum(ages) // len(ages)
    
    def _generate_personalized_response(self, user_message: str, context: str = "") -> str:
        """Generate contextual responses using LLM"""
        
        conversation_context = "\n".join([
            f"{'User' if isinstance(msg, HumanMessage) else 'Assistant'}: {msg.content}"
            for msg in self.conversation_history[-4:]  
        ])
        
        stage_context = f"Current stage: {self.stage.value}"
        user_context = ""
        
        if self.mental_age and self.intellect_level:
            user_context = f"User's mental age: {self.mental_age}, Intellect level: {self.intellect_level.value}"
        
        session_context = f"User type: {'Guest user' if self.is_guest else 'Registered user'}"
        
        prompt = f"""
        You are an intelligent educational chatbot assistant specializing in personalized learning guidance.
        
        {stage_context}
        {user_context}
        {session_context}
        {context}
        
        Recent conversation:
        {conversation_context}
        
        User's current message: "{user_message}"
        
        Respond appropriately based on the stage and context. Be:
        - Warm, encouraging, and supportive
        - Age-appropriate for the user's mental age level
        - Educational and helpful
        - Concise but informative
        
        If this is a guest user, mention that they can create an account to save their progress permanently.
        If providing learning guidance, tailor it to their intellect level.
        """
        
        return self.llm.invoke(prompt).content
    
    def _generate_learning_recommendations(self, topic: str = "") -> str:
        """Generate personalized learning recommendations using LLM"""
        
        if not self.intellect_level:
            return "I'd love to help with learning recommendations! Let me assess your learning level first with a quick fun quiz."
        
        user_profile = f"""
        Mental Age: {self.mental_age}
        Intellect Level: {self.intellect_level.value}
        User Type: {'Guest' if self.is_guest else 'Registered'}
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
        
        {'Note: Mention that creating an account would allow them to track progress and get more personalized features.' if self.is_guest else ''}
        """
        
        return self.llm.invoke(prompt).content
    
    def process_message(self, user_message: str) -> Dict[str, Any]:
        """Process user message with LLM-powered responses"""
        self.conversation_history.append(HumanMessage(content=user_message))
        
        response = ""
        additional_data = {}
        
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
        
        self.conversation_history.append(AIMessage(content=response))
        
        # Save session data
        if self.is_guest:
            self._save_guest_session()
        
        result = {
            "response": response,
            "stage": self.stage.value,
            "mental_age": self.mental_age,
            "intellect_level": self.intellect_level.value if self.intellect_level else None,
            "progress": f"{self.current_question}/5" if self.stage == ChatbotStage.ASSESSMENT_IN_PROGRESS else None,
            "session_id": self.session_id,
            "is_guest": self.is_guest
        }
        result.update(additional_data)
        
        return result
    
    def _handle_welcome(self, user_message: str) -> str:
        """Handle welcome stage with LLM"""
        context = f"""
        This is the first interaction. Welcome the user warmly and explain that you're an AI learning assistant
        who can help assess their learning level and provide personalized educational guidance.
        Ask if they'd like to take a quick 5-question assessment to get personalized recommendations.
        
        {'This is a guest user - mention they can use the service without registration, but creating an account saves their progress.' if self.is_guest else 'This is a registered user.'}
        """
        
        response = self._generate_personalized_response(user_message, context)
        self.stage = ChatbotStage.ASSESSMENT_START
        return response
    
    def _handle_assessment_start(self, user_message: str) -> str:
        """Handle assessment start with LLM"""
        # Check if user wants to start assessment
        intent_prompt = f"""
        User message: "{user_message}"
        
        Is the user agreeing to start the assessment? Look for positive responses like:
        yes, sure, okay, let's do it, I'm ready, start, begin, etc.
        
        Respond with only "YES" or "NO"
        """
        
        intent = self.llm.invoke(intent_prompt).content.strip().upper()
        
        if "YES" in intent:
            # Generate first question
            question = self._generate_assessment_question(0)
            self.stage = ChatbotStage.ASSESSMENT_IN_PROGRESS
            self.current_question = 0
            
            context = f"""
            Starting the assessment. Present this question in an encouraging way: "{question}"
            Mention it's question 1 of 5 and encourage them to think it through.
            """
            
            return self._generate_personalized_response(user_message, context)
        else:
            context = """
            User declined assessment. Offer to help with learning questions or topics instead.
            Be understanding and mention they can take the assessment anytime later.
            """
            self.stage = ChatbotStage.GUIDANCE
            return self._generate_personalized_response(user_message, context)
    
    def _handle_assessment_progress(self, user_message: str) -> tuple[str, Dict]:
        """Handle assessment progress with LLM analysis"""
        # Analyze current response
        if hasattr(self, 'current_assessment_question'):
            analysis = self._analyze_response_and_adjust(
                self.current_assessment_question, 
                user_message
            )
        else:
            analysis = {"estimated_mental_age": 10, "confidence": 5}
        
        
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
            
            # Save to database (only for registered users)
            if not self.is_guest:
                self._save_user_data()
            
            context = f"""
            Assessment complete! The user's mental age is {self.mental_age} (intellect level: {self.intellect_level.value}).
            Congratulate them and explain what this means in encouraging terms.
            Mention you'll now provide personalized learning guidance and ask what they'd like help with.
            
            {'Remind them that as a guest, their data is temporary. Creating an account would save their assessment results.' if self.is_guest else ''}
            """
            
            self.stage = ChatbotStage.GUIDANCE
            response = self._generate_personalized_response(user_message, context)
            
            return response, {
                "assessment_complete": True,
                "detailed_analysis": all_analyses
            }
        else:
            # Generate next question
            previous_responses = [resp["response"] for resp in self.responses]
            next_question = self._generate_assessment_question(self.current_question, previous_responses)
            self.current_assessment_question = next_question
            
            context = f"""
            Present question {self.current_question + 1} of 5: "{next_question}"
            Acknowledge their previous answer briefly and encourage them for the next question.
            """
            
            response = self._generate_personalized_response(user_message, context)
            return response, {"current_analysis": analysis}
    
    def _handle_assessment_complete(self, user_message: str) -> str:
        """Handle post-assessment with LLM"""
        self.stage = ChatbotStage.GUIDANCE
        return self._generate_learning_recommendations(user_message)
    
    def _handle_guidance(self, user_message: str) -> str:
        """Handle guidance stage with LLM"""
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
        User Type: {'Guest' if self.is_guest else 'Registered'}
        
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
        
        {'Note: Add a section about benefits of creating an account for progress tracking.' if self.is_guest else ''}
        """
        
        report = self.llm.invoke(prompt).content
        
        return {
            "mental_age": self.mental_age,
            "intellect_level": self.intellect_level.value,
            "detailed_report": report,
            "assessment_data": self.responses,
            "is_guest": self.is_guest,
            "session_id": self.session_id
        }


def create_chatbot(user_id: Optional[int] = None, db_session=None, session_id: Optional[str] = None) -> MentalAgeAssessmentChatbot:
    """Create a new chatbot instance for a user or guest"""
    return MentalAgeAssessmentChatbot(user_id, db_session, session_id)


def initialize_chatbot_session(user_id: Optional[int] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
    """Initialize a new chatbot session with LLM-powered welcome"""
    
    # For registered users
    if user_id:
        db_session = SessionLocal()
        try:
            chatbot = create_chatbot(user_id, db_session)
            initial_response = chatbot.process_message("Hello! I'm ready to start.")
            
            return {
                "session_id": chatbot.session_id,
                "initial_response": initial_response,
                "status": "initialized",
                "user_type": "registered"
            }
        finally:
            db_session.close()
    
    # For guest users
    else:
        chatbot = create_chatbot(session_id=session_id)
        initial_response = chatbot.process_message("Hello! I'm new here.")
        
        return {
            "session_id": chatbot.session_id,
            "initial_response": initial_response,
            "status": "initialized",
            "user_type": "guest"
        }


def process_chatbot_message(message: str, user_id: Optional[int] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
    """Process a message with full LLM intelligence"""
    
    try:
        # For registered users
        if user_id:
            db_session = SessionLocal()
            try:
                chatbot = create_chatbot(user_id, db_session)
                response_data = chatbot.process_message(message)
                
                return {
                    "success": True,
                    "data": response_data,
                    "user_type": "registered"
                }
            finally:
                db_session.close()
        
        # For guest users
        else:
            if not session_id:
                return {
                    "success": False,
                    "error": "session_id is required for guest users"
                }
            
            chatbot = create_chatbot(session_id=session_id)
            response_data = chatbot.process_message(message)
            
            return {
                "success": True,
                "data": response_data,
                "user_type": "guest"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_learning_insights(user_id: Optional[int] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
    """Get comprehensive learning insights using LLM"""
    
    try:
        # For registered users
        if user_id:
            db_session = SessionLocal()
            try:
                chatbot = create_chatbot(user_id, db_session)
                return chatbot.get_detailed_assessment_report()
            finally:
                db_session.close()
        
        # For guest users
        else:
            if not session_id:
                return {"error": "session_id is required for guest users"}
            
            chatbot = create_chatbot(session_id=session_id)
            return chatbot.get_detailed_assessment_report()
            
    except Exception as e:
        return {"error": str(e)}


def clear_guest_session(session_id: str) -> Dict[str, Any]:
    """Clear a guest session"""
    try:
        guest_sessions.delete_session(session_id)
        return {"success": True, "message": "Session cleared"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_guest_session_info(session_id: str) -> Dict[str, Any]:
    """Get guest session information"""
    session_data = guest_sessions.get_session(session_id)
    if session_data:
        return {
            "exists": True,
            "last_updated": session_data.get('last_updated'),
            "stage": session_data.get('stage'),
            "mental_age": session_data.get('mental_age'),
            "intellect_level": session_data.get('intellect_level')
        }
    return {"exists": False}
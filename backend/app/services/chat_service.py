import google.generativeai as genai
from flask import current_app
from app.models.models import ChatSession, ChatMessage
from app.extensions import db
from app.services.emotion_service import EmotionService
from app.services.alert_service import AlertService
from datetime import datetime
import json

class ChatService:
    """
    Service for managing chat sessions with AI
    Integrates emotion analysis and alert detection
    """
    
    @staticmethod
    def configure_gemini():
        """Configure Gemini API"""
        api_key = current_app.config.get('GOOGLE_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
    
    @staticmethod
    def create_session(user_id, title=None):
        """
        Create a new chat session
        
        Args:
            user_id: User ID
            title: Optional session title
            
        Returns:
            ChatSession: Created session
        """
        try:
            session = ChatSession(
                user_id=user_id,
                title=title or 'New Conversation',
                status='active',
                created_at=datetime.utcnow()
            )
            
            db.session.add(session)
            db.session.commit()
            
            return session
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating session: {str(e)}")
            raise
    
    @staticmethod
    def get_or_create_session(user_id, session_id=None):
        """
        Get existing session or create new one
        
        Args:
            user_id: User ID
            session_id: Optional session ID
            
        Returns:
            ChatSession: Session object
        """
        if session_id:
            session = db.session.get(ChatSession, session_id)
            if session and session.user_id == user_id:
                return session
        
        # Create new session
        return ChatService.create_session(user_id)
    
    @staticmethod
    def send_message(user_id, message_content, session_id=None, analyze_emotion=True):
        """
        Send a message and get AI response with emotion analysis
        
        Args:
            user_id: User ID
            message_content: User message
            session_id: Optional session ID
            analyze_emotion: Whether to analyze emotions
            
        Returns:
            dict: Response containing AI message and emotion analysis
        """
        try:
            # Get or create session
            session = ChatService.get_or_create_session(user_id, session_id)
            
            # Analyze user's emotion
            emotion_analysis = None
            alert = None
            
            if analyze_emotion:
                emotion_result = EmotionService.analyze_text_emotion(message_content, user_id)
                if emotion_result['success']:
                    emotion_analysis = emotion_result['analysis']
                    
                    # Check for risk and create alert if needed
                    alert = AlertService.check_and_create_alert(
                        user_id, 
                        message_content, 
                        emotion_analysis
                    )
            
            # Save user message
            user_message = ChatMessage(
                session_id=session.id,
                role='user',
                content=message_content,
                emotion_detected=emotion_analysis.get('primary_emotion') if emotion_analysis else None,
                sentiment_score=emotion_analysis.get('sentiment_score') if emotion_analysis else None,
                risk_level=emotion_analysis.get('risk_level') if emotion_analysis else None,
                created_at=datetime.utcnow()
            )
            db.session.add(user_message)
            
            # Get conversation history for context
            history = ChatMessage.query.filter_by(
                session_id=session.id
            ).order_by(ChatMessage.created_at.asc()).limit(10).all()
            
            # Build context from history
            context_messages = []
            for msg in history:
                context_messages.append(f"{msg.role}: {msg.content}")
            
            # Configure Gemini
            ChatService.configure_gemini()
            model = genai.GenerativeModel('gemini-pro')
            
            # Create empathetic system prompt
            system_prompt = """You are a compassionate and empathetic mental health support AI assistant. 
Your role is to provide emotional support, active listening, and helpful guidance to users who may be experiencing 
mental health challenges. 

Key guidelines:
1. Always be empathetic, non-judgmental, and supportive
2. Validate the user's feelings and experiences
3. Ask clarifying questions when needed
4. Provide coping strategies and resources when appropriate
5. If you detect signs of crisis (suicide, self-harm), gently encourage professional help
6. Never diagnose or prescribe medication
7. Maintain appropriate boundaries
8. Use warm, conversational language

"""
            
            # Add emotion context if available
            if emotion_analysis:
                emotion_context = f"\n[Current emotional state: {emotion_analysis.get('primary_emotion')} with intensity {emotion_analysis.get('intensity')}/10]"
                system_prompt += emotion_context
            
            # Generate AI response
            prompt = f"{system_prompt}\n\nConversation history:\n" + "\n".join(context_messages[-5:]) + f"\n\nUser: {message_content}\n\nAssistant:"
            
            response = model.generate_content(prompt)
            ai_response = response.text.strip()
            
            # Save AI message
            ai_message = ChatMessage(
                session_id=session.id,
                role='assistant',
                content=ai_response,
                created_at=datetime.utcnow()
            )
            db.session.add(ai_message)
            
            # Update session
            session.updated_at = datetime.utcnow()
            if not session.title or session.title == 'New Conversation':
                # Generate title from first message
                session.title = message_content[:50] + ('...' if len(message_content) > 50 else '')
            
            db.session.commit()
            
            return {
                'success': True,
                'session_id': session.id,
                'user_message': user_message.to_dict(),
                'ai_message': ai_message.to_dict(),
                'emotion_analysis': emotion_analysis,
                'alert': alert.to_dict() if alert else None
            }
            
        except Exception as e:
            db.session.rollback()
            print(f"Error sending message: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_session_messages(session_id, user_id):
        """
        Get all messages in a session
        
        Args:
            session_id: Session ID
            user_id: User ID (for permission check)
            
        Returns:
            list: List of messages
        """
        session = db.session.get(ChatSession, session_id)
        
        if not session or session.user_id != user_id:
            return []
        
        messages = ChatMessage.query.filter_by(
            session_id=session_id
        ).order_by(ChatMessage.created_at.asc()).all()
        
        return [msg.to_dict() for msg in messages]
    
    @staticmethod
    def get_user_sessions(user_id, limit=20):
        """
        Get user's recent chat sessions
        
        Args:
            user_id: User ID
            limit: Maximum number of sessions to return
            
        Returns:
            list: List of sessions
        """
        sessions = ChatSession.query.filter_by(
            user_id=user_id
        ).order_by(ChatSession.updated_at.desc()).limit(limit).all()
        
        return [session.to_dict() for session in sessions]
    
    @staticmethod
    def delete_session(session_id, user_id):
        """
        Delete a chat session
        
        Args:
            session_id: Session ID
            user_id: User ID (for permission check)
            
        Returns:
            bool: Success status
        """
        try:
            session = db.session.get(ChatSession, session_id)
            
            if not session or session.user_id != user_id:
                return False
            
            db.session.delete(session)
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting session: {str(e)}")
            return False
    
    @staticmethod
    def archive_session(session_id, user_id):
        """
        Archive a chat session
        
        Args:
            session_id: Session ID
            user_id: User ID (for permission check)
            
        Returns:
            bool: Success status
        """
        try:
            session = db.session.get(ChatSession, session_id)
            
            if not session or session.user_id != user_id:
                return False
            
            session.status = 'archived'
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error archiving session: {str(e)}")
            return False

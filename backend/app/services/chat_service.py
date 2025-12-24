import google.generativeai as genai
from flask import current_app
from app.models.models import ChatSession, ChatMessage
from app.extensions import db
from app.services.emotion_service import EmotionService
from app.services.alert_service import AlertService
from app.services.ai_model_client import get_ai_client
from app.services.mongodb_service import MongoDBService
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
    def _parse_suggested_questions(response_text: str) -> tuple:
        """
        Parse suggested questions from AI response
        
        Args:
            response_text: Raw response from AI Model
            
        Returns:
            tuple: (cleaned_response, suggested_questions_list)
        """
        import re
        
        # Split by "GỢI Ý INTENT:" marker
        parts = re.split(r'\n*GỢI Ý INTENT:', response_text)
        
        # First part is the main response
        main_response = parts[0].strip()
        
        # Parse suggested questions
        suggested = []
        for i in range(1, len(parts)):
            # Each part has format: "INTENT_TYPE\nQuestion text"
            lines = parts[i].strip().split('\n', 1)
            if len(lines) == 2:
                intent = lines[0].strip()
                question = lines[1].strip()
                if question:
                    suggested.append({
                        'intent': intent,
                        'question': question
                    })
        
        return main_response, suggested
    
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
            
            # Use AI Model Client instead of Gemini directly
            ai_client = get_ai_client()
            
            # Call AI Model API
            ai_result = ai_client.chat(
                session_id=f"user_{user_id}_session_{session.id}",
                user_text=message_content
            )
            
            # Extract response and emotion from AI Model
            raw_response = ai_result.get('response', 'Xin lỗi, tôi không thể trả lời lúc này.')
            detected_emotion = ai_result.get('emotion', 'neutral')
            detected_intent = ai_result.get('intent', 'unknown')
            
            # Parse suggested questions from response
            ai_response, suggested_questions = ChatService._parse_suggested_questions(raw_response)
            
            # Save user message with detected emotion
            user_message = ChatMessage(
                session_id=session.id,
                role='user',
                content=message_content,
                emotion_detected=detected_emotion,
                sentiment_score=None,  # Will be updated later from dashboard report
                risk_level=None,  # Will be updated later from dashboard report
                created_at=datetime.utcnow()
            )
            db.session.add(user_message)
            
            # Create AI response message
            ai_message = ChatMessage(
                session_id=session.id,
                role='assistant',
                content=ai_response,
                emotion_detected=detected_emotion,
                created_at=datetime.utcnow()
            )
            db.session.add(ai_message)
            
            # Save to MongoDB for full history
            try:
                MongoDBService.save_message(
                    session_id=session.id,
                    user_id=user_id,
                    role='user',
                    content=message_content,
                    emotion=detected_emotion
                )
                MongoDBService.save_message(
                    session_id=session.id,
                    user_id=user_id,
                    role='assistant',
                    content=ai_response
                )
            except Exception as mongo_error:
                print(f"MongoDB save error: {mongo_error}")
            
            # Skip emotion analysis to avoid Gemini timeout
            emotion_analysis = None
            alert = None
            
            # Update session
            session.updated_at = datetime.utcnow()
            if not session.title or session.title == 'New Conversation':
                # Generate title from first message
                session.title = message_content[:50] + ('...' if len(message_content) > 50 else '')
            
            db.session.commit()
            
            return {
                'success': True,
                'session_id': session.id,
                'message': user_message.content,
                'ai_response': ai_response,
                'user_message': user_message.to_dict(),
                'ai_message': ai_message.to_dict(),
                'emotion_analysis': emotion_analysis,
                'alert': alert.to_dict() if alert else None,
                'suggested_questions': suggested_questions
            }
            
        except Exception as e:
            db.session.rollback()
            print(f"Error sending message: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def get_session_messages(session_id, user_id, limit=50, skip=0):
        """
        Get messages in a session from MongoDB with pagination
        
        Args:
            session_id: Session ID
            user_id: User ID (for permission check)
            limit: Maximum number of messages to return (default 50)
            skip: Number of messages to skip (for pagination)
            
        Returns:
            list: List of messages
        """
        # Verify session ownership from PostgreSQL
        session = db.session.get(ChatSession, session_id)
        
        if not session or session.user_id != user_id:
            return []
        
        # Get messages from MongoDB with limit
        try:
            messages = MongoDBService.get_session_messages(
                session_id, user_id, limit=limit
            )
            
            # Convert MongoDB format to frontend format
            formatted_messages = []
            for msg in messages:
                formatted_messages.append({
                    'id': msg.get('message_id'),
                    'role': msg.get('role'),
                    'content': msg.get('content'),
                    'emotion_detected': msg.get('emotion'),
                    'sentiment_score': msg.get('sentiment_score'),
                    'risk_level': msg.get('risk_level'),
                    'created_at': msg.get('timestamp').isoformat() if msg.get('timestamp') else None
                })
            
            return formatted_messages
            
        except Exception as e:
            print(f"MongoDB retrieval error: {e}, falling back to PostgreSQL")
            # Fallback to PostgreSQL if MongoDB fails
            query = ChatMessage.query.filter_by(
                session_id=session_id
            ).order_by(ChatMessage.created_at.desc())
            
            if limit:
                query = query.limit(limit)
            if skip:
                query = query.offset(skip)
            
            messages = query.all()
            messages.reverse()  # Reverse to chronological order
            
            return [msg.to_dict() for msg in messages]
    
    @staticmethod
    def get_user_sessions(user_id, limit=20):
        """
        Get user's recent chat sessions with message counts from MongoDB
        
        Args:
            user_id: User ID
            limit: Maximum number of sessions to return
            
        Returns:
            list: List of sessions with metadata
        """
        sessions = ChatSession.query.filter_by(
            user_id=user_id
        ).order_by(ChatSession.updated_at.desc()).limit(limit).all()
        
        # Get message counts from MongoDB efficiently
        try:
            db_mongo = MongoDBService.get_client()
            collection = db_mongo['chat_sessions']
            
            session_ids = [s.id for s in sessions]
            
            # Bulk query for message counts
            pipeline = [
                {'$match': {'session_id': {'$in': session_ids}, 'user_id': user_id}},
                {'$project': {
                    'session_id': 1,
                    'message_count': {'$size': {'$ifNull': ['$messages', []]}},
                    'last_message': {'$arrayElemAt': ['$messages', -1]}
                }}
            ]
            
            mongo_stats = {s['session_id']: s for s in collection.aggregate(pipeline)}
            
            # Combine PostgreSQL and MongoDB data
            result = []
            for session in sessions:
                # Build dict manually to avoid calling to_dict() which queries PostgreSQL
                stats = mongo_stats.get(session.id, {})
                session_dict = {
                    'id': session.id,
                    'user_id': session.user_id,
                    'title': session.title,
                    'status': session.status,
                    'created_at': session.created_at.isoformat() if session.created_at else None,
                    'updated_at': session.updated_at.isoformat() if session.updated_at else None,
                    'message_count': stats.get('message_count', 0)
                }
                
                # Add last message preview
                last_msg = stats.get('last_message')
                if last_msg:
                    session_dict['last_message'] = last_msg.get('content', '')[:100]
                
                result.append(session_dict)
            
            return result
            
        except Exception as e:
            import traceback
            print(f"❌ MongoDB stats error: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            # Fallback - return sessions with 0 message_count instead of querying PostgreSQL
            return [{'message_count': 0, **session.to_dict()} for session in sessions]
    
    @staticmethod
    def delete_session(session_id, user_id):
        """
        Delete a chat session from both PostgreSQL and MongoDB
        
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
            
            # Delete from PostgreSQL
            db.session.delete(session)
            db.session.commit()
            
            # Delete from MongoDB
            try:
                MongoDBService.delete_session(session_id, user_id)
            except Exception as mongo_error:
                print(f"MongoDB delete error: {mongo_error}")
                # Continue even if MongoDB delete fails
            
            return True
            
        except Exception as e:
            db.session.rollback()
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

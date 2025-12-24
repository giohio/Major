"""
Service để tạo emotion analytics từ AI Model  
Gọi model sau khi kết thúc session hoặc định kỳ
"""

from app.services.ai_model_client import get_ai_client
from app.services.mongodb_service import MongoDBService
from app.models.models import ChatMessage, ChatSession
from app.models.session_analysis import SessionAnalysis
from app.extensions import db
from datetime import datetime
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class SessionAnalysisService:
    """Service phân tích session với AI Model"""
    
    @staticmethod
    def prepare_conversation_data(session_id: int, user_id: int) -> List[Dict[str, str]]:
        """
        Chuẩn bị dữ liệu conversation để gửi cho AI Model
        Ưu tiên lấy từ MongoDB, fallback sang PostgreSQL
        
        Args:
            session_id: ID của chat session
            user_id: ID của user
            
        Returns:
            List[Dict]: Conversation data theo format AI Model
        """
        try:
            # Try MongoDB first (full conversation)
            messages = MongoDBService.get_session_messages(session_id, user_id)
            
            if messages and len(messages) > 0:
                logger.info(f"Using MongoDB data for session {session_id}")
                conversation = []
                for msg in messages:
                    conversation.append({
                        "role": msg['role'],
                        "content": msg['content'],
                        "timestamp": msg['timestamp'].isoformat() if isinstance(msg['timestamp'], datetime) else msg['timestamp']
                    })
                return conversation
            
        except Exception as e:
            logger.warning(f"MongoDB fallback to PostgreSQL: {e}")
        
        # Fallback to PostgreSQL
        logger.info(f"Using PostgreSQL data for session {session_id}")
        messages = ChatMessage.query.filter_by(
            session_id=session_id
        ).order_by(ChatMessage.created_at.asc()).all()
        
        conversation = []
        for msg in messages:
            conversation.append({
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.created_at.isoformat() if msg.created_at else None
            })
        
        return conversation
    
    @staticmethod
    def analyze_session_for_dashboard(session_id: int, user_id: int) -> Dict[str, Any]:
        """
        Phân tích session để tạo dashboard analytics
        
        Args:
            session_id: ID của session
            user_id: ID của user (để verify ownership)
            
        Returns:
            dict: Dashboard analytics data
        """
        try:
            # Verify session belongs to user
            session = ChatSession.query.get(session_id)
            if not session or session.user_id != user_id:
                return {
                    'success': False,
                    'error': 'Session not found or unauthorized'
                }
            
            # Get conversation data
            conversation = SessionAnalysisService.prepare_conversation_data(session_id, user_id)
            
            if len(conversation) < 2:
                return {
                    'success': False,
                    'error': 'Not enough messages to analyze'
                }
            
            # Call AI Model
            ai_client = get_ai_client()
            result = ai_client.generate_user_dashboard(conversation)
            
            # Check if model returned error
            if result.get('error'):
                return {
                    'success': False,
                    'error': 'Model analysis failed',
                    'fallback_data': result
                }
            
            # Save to database
            analysis = SessionAnalysis.query.filter_by(session_id=session_id).first()
            
            # Parse data robustly
            session_data = result.get('session_analysis', {}) if isinstance(result.get('session_analysis'), dict) else {}
            triggers_data = result.get('triggers', {})
            if isinstance(triggers_data, list):
                triggers_primary = triggers_data
                triggers_secondary = []
            elif isinstance(triggers_data, dict):
                triggers_primary = triggers_data.get('primary', [])
                triggers_secondary = triggers_data.get('secondary', [])
            else:
                triggers_primary = []
                triggers_secondary = []
            
            risk_data = result.get('risk_indicators', {}) if isinstance(result.get('risk_indicators'), dict) else {}
            emotional_breakdown = session_data.get('emotional_breakdown', {}) if isinstance(session_data.get('emotional_breakdown'), dict) else {}
            
            if analysis:
                # Update existing
                analysis.duration_minutes = session_data.get('duration_minutes', 0)
                analysis.total_messages = session_data.get('total_messages', 0)
                analysis.user_messages = session_data.get('user_messages', 0)
                analysis.dominant_emotion = session_data.get('dominant_emotion', 'neutral')
                analysis.emotional_breakdown = emotional_breakdown
                analysis.overall_sentiment = session_data.get('overall_sentiment', 0)
                analysis.intensity_average = session_data.get('intensity_average', 0)
                analysis.emotional_progression = result.get('emotional_progression', [])
                analysis.triggers_primary = triggers_primary
                analysis.triggers_secondary = triggers_secondary
                analysis.risk_level = risk_data.get('level', 'low')
                analysis.risk_flags = risk_data.get('flags', [])
                analysis.trend = result.get('trend', 'stable')
                analysis.simple_summary = result.get('simple_summary', '')
                analysis.analyzed_at = datetime.utcnow()
            else:
                # Create new
                analysis = SessionAnalysis(
                    session_id=session_id,
                    user_id=user_id,
                    duration_minutes=session_data.get('duration_minutes', 0),
                    total_messages=session_data.get('total_messages', 0),
                    user_messages=session_data.get('user_messages', 0),
                    dominant_emotion=session_data.get('dominant_emotion', 'neutral'),
                    emotional_breakdown=emotional_breakdown,
                    overall_sentiment=session_data.get('overall_sentiment', 0),
                    intensity_average=session_data.get('intensity_average', 0),
                    emotional_progression=result.get('emotional_progression', []),
                    triggers_primary=triggers_primary,
                    triggers_secondary=triggers_secondary,
                    risk_level=risk_data.get('level', 'low'),
                    risk_flags=risk_data.get('flags', []),
                    trend=result.get('trend', 'stable'),
                    simple_summary=result.get('simple_summary', '')
                )
                db.session.add(analysis)
            
            db.session.commit()
            
            # Update MongoDB status
            MongoDBService.update_session_status(session_id, user_id, 'analyzed')
            
            return {
                'success': True,
                'data': analysis.to_dict_user()
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error analyzing session for dashboard: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def analyze_session_for_clinical(session_id: int, patient_id: int, doctor_id: int) -> Dict[str, Any]:
        """
        Phân tích session để tạo clinical report cho bác sĩ
        Updates existing SessionAnalysis with clinical data
        
        Args:
            session_id: ID của session
            patient_id: ID của bệnh nhân
            doctor_id: ID của bác sĩ (để verify quyền truy cập)
            
        Returns:
            dict: Clinical report data
        """
        try:
            # Verify session belongs to patient
            session = ChatSession.query.get(session_id)
            if not session or session.user_id != patient_id:
                return {
                    'success': False,
                    'error': 'Session not found'
                }
            
            # Get conversation data
            conversation = SessionAnalysisService.prepare_conversation_data(session_id, patient_id)
            
            if len(conversation) < 2:
                return {
                    'success': False,
                    'error': 'Not enough messages to analyze'
                }
            
            # Call AI Model
            ai_client = get_ai_client()
            result = ai_client.generate_clinical_report(conversation)
            
            # Check if model returned error
            if result.get('error'):
                return {
                    'success': False,
                    'error': 'Model analysis failed',
                    'fallback_data': result
                }
            
            # Get or create SessionAnalysis
            analysis = SessionAnalysis.query.filter_by(session_id=session_id).first()
            
            if not analysis:
                # Create base analysis if doesn't exist
                analysis = SessionAnalysis(
                    session_id=session_id,
                    user_id=patient_id,
                    dominant_emotion=result.get('dominant_emotion', 'NEUTRAL')
                )
                db.session.add(analysis)
            
            # Update with clinical data
            analysis.reviewed_by_doctor_id = doctor_id
            analysis.emotional_changes = result.get('emotional_changes', '')
            analysis.precipitants = result.get('case_formulation', {}).get('precipitants')
            analysis.automatic_thoughts = result.get('case_formulation', {}).get('automatic_thoughts')
            analysis.maladaptive_behaviors = result.get('case_formulation', {}).get('maladaptive_behaviors')
            analysis.core_beliefs = result.get('case_formulation', {}).get('core_beliefs')
            analysis.suicidal_ideation = result.get('risk_assessment', {}).get('suicidal_ideation', False)
            analysis.self_harm_risk = result.get('risk_assessment', {}).get('self_harm_risk', False)
            analysis.severity_level = result.get('risk_assessment', {}).get('severity_level', 'low')
            analysis.requires_immediate_intervention = result.get('risk_assessment', {}).get('requires_immediate_intervention', False)
            analysis.risk_notes = result.get('risk_assessment', {}).get('notes')
            analysis.interventions_used = result.get('clinical_plan', {}).get('interventions_used')
            analysis.recommended_interventions = result.get('clinical_plan', {}).get('recommended_interventions')
            analysis.next_steps = result.get('clinical_plan', {}).get('next_steps')
            analysis.follow_up_timeline = result.get('clinical_plan', {}).get('follow_up_timeline')
            analysis.clinical_summary = result.get('summary', '')
            analysis.analyzed_at = datetime.utcnow()
            
            db.session.commit()
            
            # Update MongoDB status
            MongoDBService.update_session_status(session_id, patient_id, 'analyzed')
            
            return {
                'success': True,
                'data': analysis.to_dict_clinical()
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error analyzing session for clinical: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def should_analyze_session(session_id: int) -> bool:
        """
        Kiểm tra xem session có đủ điều kiện để phân tích không
        
        Args:
            session_id: ID của session
            
        Returns:
            bool: True nếu nên phân tích
        """
        message_count = ChatMessage.query.filter_by(
            session_id=session_id
        ).count()
        
        # Phân tích nếu có ít nhất 4 tin nhắn (2 user + 2 AI)
        return message_count >= 4
    
    @staticmethod
    def get_fresh_analysis(user_id: int, max_age_hours: int = 24):
        """
        Get fresh analysis from database if available
        
        Args:
            user_id: User ID
            max_age_hours: Maximum age of analysis in hours (default 24)
            
        Returns:
            SessionAnalysis if fresh, None otherwise
        """
        from datetime import timedelta
        
        # Get most recent analysis for this user
        latest_analysis = SessionAnalysis.query.filter_by(user_id=user_id)\
            .order_by(SessionAnalysis.analyzed_at.desc())\
            .first()
        
        if not latest_analysis:
            logger.info(f"No cached analysis found for user {user_id}")
            return None
        
        # Check freshness
        age = datetime.utcnow() - latest_analysis.analyzed_at
        if age < timedelta(hours=max_age_hours):
            logger.info(f"✓ Using cached analysis for user {user_id}, age: {age}")
            return latest_analysis
        
        logger.info(f"✗ Analysis too old for user {user_id}, age: {age}, re-analyzing")
        return None

    @staticmethod
    def analyze_recent_sessions_for_dashboard(user_id: int, limit: int = 15, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Analyze recent sessions for dashboard analytics
        Uses cached result if available and fresh (< 24 hours old)
        
        Args:
            user_id: ID of the user
            limit: Number of recent sessions to analyze
            force_refresh: If True, bypass cache and re-analyze
            
        Returns:
            dict: Dashboard analytics data
        """
        try:
            # Check cache first unless force_refresh
            if not force_refresh:
                cached_analysis = SessionAnalysisService.get_fresh_analysis(user_id)
                if cached_analysis:
                    print(f"[CACHE HIT] Returning cached analysis for user {user_id}")
                    return {
                        'success': True,
                        'data': cached_analysis.to_dict_user(),
                        'from_cache': True
                    }
            
            print(f"[CACHE MISS] Analyzing fresh for user {user_id} (force_refresh={force_refresh})")
            
            # 1. Get recent sessions
            recent_sessions = ChatSession.query.filter_by(user_id=user_id)\
                .order_by(ChatSession.created_at.desc())\
                .limit(limit)\
                .all()
            
            if not recent_sessions:
                return {
                    'success': False,
                    'error': 'No recent sessions found'
                }
            
            # 2. Aggregate messages
            all_conversation_data = []
            print(f"[ANALYSIS] Found {len(recent_sessions)} recent sessions for user {user_id}")
            for session in reversed(recent_sessions):
                session_msgs = SessionAnalysisService.prepare_conversation_data(session.id, user_id)
                if session_msgs:
                    print(f"[ANALYSIS] Session {session.id} has {len(session_msgs)} messages")
                    all_conversation_data.extend(session_msgs)
            
            print(f"[ANALYSIS] Total messages accumulated: {len(all_conversation_data)}")
            
            if len(all_conversation_data) < 4:
                print(f"[ANALYSIS] Not enough messages ({len(all_conversation_data)} < 4). Aborting.")
                return {
                    'success': False,
                    'error': 'Not enough messages to analyze (minimum 4)'
                }
            
            # 3. Call AI Model
            ai_client = get_ai_client()
            print(f"[ANALYSIS] Calling AI Model generate_user_dashboard with {len(all_conversation_data)} messages...")
            result = ai_client.generate_user_dashboard(all_conversation_data)
            print(f"[ANALYSIS] AI Model response received: {result.keys() if result else 'None'}")
            
            # Check if model returned error
            if result.get('error'):
                return {
                    'success': False,
                    'error': 'Model analysis failed',
                    'fallback_data': result
                }
            
            # 4. Save to database
            latest_session_id = recent_sessions[0].id
            
            analysis = SessionAnalysis.query.filter_by(session_id=latest_session_id).first()
            
            # Parse data robustly
            session_data = result.get('session_analysis', {}) if isinstance(result.get('session_analysis'), dict) else {}
            triggers_data = result.get('triggers', {})
            if isinstance(triggers_data, list):
                triggers_primary = triggers_data
                triggers_secondary = []
            elif isinstance(triggers_data, dict):
                triggers_primary = triggers_data.get('primary', [])
                triggers_secondary = triggers_data.get('secondary', [])
            else:
                triggers_primary = []
                triggers_secondary = []
            
            risk_data = result.get('risk_indicators', {}) if isinstance(result.get('risk_indicators'), dict) else {}
            emotional_breakdown = session_data.get('emotional_breakdown', {}) if isinstance(session_data.get('emotional_breakdown'), dict) else {}
            
            if analysis:
                # Update existing
                analysis.duration_minutes = session_data.get('duration_minutes', 0)
                analysis.total_messages = session_data.get('total_messages', 0)
                analysis.user_messages = session_data.get('user_messages', 0)
                analysis.dominant_emotion = session_data.get('dominant_emotion', 'neutral')
                analysis.emotional_breakdown = emotional_breakdown
                analysis.overall_sentiment = session_data.get('overall_sentiment', 0)
                analysis.intensity_average = session_data.get('intensity_average', 0)
                analysis.emotional_progression = result.get('emotional_progression', [])
                analysis.triggers_primary = triggers_primary
                analysis.triggers_secondary = triggers_secondary
                analysis.risk_level = risk_data.get('level', 'low')
                analysis.risk_flags = risk_data.get('flags', [])
                analysis.trend = result.get('trend', 'stable')
                analysis.simple_summary = result.get('simple_summary', '')
                analysis.analyzed_at = datetime.utcnow()
            else:
                # Create new
                analysis = SessionAnalysis(
                    session_id=latest_session_id,
                    user_id=user_id,
                    duration_minutes=session_data.get('duration_minutes', 0),
                    total_messages=session_data.get('total_messages', 0),
                    user_messages=session_data.get('user_messages', 0),
                    dominant_emotion=session_data.get('dominant_emotion', 'neutral'),
                    emotional_breakdown=emotional_breakdown,
                    overall_sentiment=session_data.get('overall_sentiment', 0),
                    intensity_average=session_data.get('intensity_average', 0),
                    emotional_progression=result.get('emotional_progression', []),
                    triggers_primary=triggers_primary,
                    triggers_secondary=triggers_secondary,
                    risk_level=risk_data.get('level', 'low'),
                    risk_flags=risk_data.get('flags', []),
                    trend=result.get('trend', 'stable'),
                    simple_summary=result.get('simple_summary', '')
                )
                db.session.add(analysis)
            
            db.session.commit()
            
            return {
                'success': True,
                'data': analysis.to_dict_user(),
                'from_cache': False
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error analyzing recent sessions: {e}")
            return {
                'success': False,
                'error': str(e)
            }

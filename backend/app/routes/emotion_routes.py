"""
Emotion routes for emotion analytics and management
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

from app.models.models import User, ChatMessage, ChatSession
from app.extensions import db
from app.services.emotion_service import EmotionService
from app.services.session_analysis_service import SessionAnalysisService
from sqlalchemy import func

emotion_bp = Blueprint('emotion', __name__, url_prefix='/api/emotion')
emotion_service = EmotionService()


@emotion_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_emotion():
    """
    Analyze emotion from text
    
    Request body:
    {
        "text": "I feel so sad and hopeless today"
    }
    """
    try:
        data = request.json
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        
        if not text or len(text.strip()) < 5:
            return jsonify({'error': 'Text must be at least 5 characters'}), 400
        
        user_id = get_jwt_identity()
        
        # Analyze emotion
        analysis = emotion_service.analyze_text_emotion(text, user_id)
        
        return jsonify(analysis), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_emotion_logs():
    """
    Get user's emotion logs
    
    Query params:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20)
    - start_date: Filter from date (YYYY-MM-DD)
    - end_date: Filter to date (YYYY-MM-DD)
    - emotion: Filter by emotion type
    """
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Query chat messages with emotions (user messages only)
        query = db.session.query(ChatMessage)\
            .join(ChatSession)\
            .filter(
                ChatSession.user_id == user_id,
                ChatMessage.role == 'user',
                ChatMessage.emotion_detected.isnot(None)
            )
        
        # Date filters
        start_date = request.args.get('start_date')
        if start_date:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(ChatMessage.created_at >= start)
        
        end_date = request.args.get('end_date')
        if end_date:
            end = datetime.strptime(end_date, '%Y-%m-%d')
            query = query.filter(ChatMessage.created_at <= end)
        
        # Emotion filter
        emotion = request.args.get('emotion')
        if emotion:
            query = query.filter(ChatMessage.emotion_detected == emotion)
        
        query = query.order_by(ChatMessage.created_at.desc())
        
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Format response to match old structure
        return jsonify({
            'logs': [{
                'id': msg.id,
                'emotion': msg.emotion_detected,
                'sentiment_score': float(msg.sentiment_score) if msg.sentiment_score else 0,
                'risk_level': msg.risk_level,
                'created_at': msg.created_at.isoformat(),
                'intensity': 5  # Default value for backward compatibility
            } for msg in paginated.items],
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_emotion_stats():
    """
    Get emotion statistics
    
    Query params:
    - period: 'week', 'month', or 'year' (default: 'month')
    """
    try:
        user_id = get_jwt_identity()
        period = request.args.get('period', 'month')
        
        if period not in ['week', 'month', 'year']:
            return jsonify({'error': 'Invalid period. Use: week, month, or year'}), 400
        
        stats = emotion_service.get_emotion_stats(user_id, period)
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/trends', methods=['GET'])
@jwt_required()
def get_emotion_trends():
    """
    Get emotion trends over time
    
    Query params:
    - days: Number of days to analyze (default: 30)
    """
    try:
        user_id = get_jwt_identity()
        days = request.args.get('days', 30, type=int)
        
        if days < 1 or days > 365:
            return jsonify({'error': 'Days must be between 1 and 365'}), 400
        
        # Get emotion distribution over time
        start_date = datetime.now() - timedelta(days=days)
        
        # Daily emotion counts from chat messages
        daily_emotions = db.session.query(
            func.date(ChatMessage.created_at).label('date'),
            ChatMessage.emotion_detected,
            func.count(ChatMessage.id).label('count')
        ).join(ChatSession)\
        .filter(
            ChatSession.user_id == user_id,
            ChatMessage.role == 'user',
            ChatMessage.emotion_detected.isnot(None),
            ChatMessage.created_at >= start_date
        ).group_by(
            func.date(ChatMessage.created_at),
            ChatMessage.emotion_detected
        ).all()
        
        # Format data
        trends = {}
        for date, emotion, count in daily_emotions:
            date_str = date.strftime('%Y-%m-%d')
            if date_str not in trends:
                trends[date_str] = {}
            trends[date_str][emotion] = count
        
        # Average sentiment over time
        daily_sentiment = db.session.query(
            func.date(ChatMessage.created_at).label('date'),
            func.avg(ChatMessage.sentiment_score).label('avg_sentiment')
        ).join(ChatSession)\
        .filter(
            ChatSession.user_id == user_id,
            ChatMessage.role == 'user',
            ChatMessage.created_at >= start_date
        ).group_by(
            func.date(ChatMessage.created_at)
        ).all()
        
        sentiment_trends = {
            date.strftime('%Y-%m-%d'): float(avg_sentiment) if avg_sentiment else 0
            for date, avg_sentiment in daily_sentiment
        }
        
        return jsonify({
            'emotion_trends': trends,
            'sentiment_trends': sentiment_trends,
            'period': {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': datetime.now().strftime('%Y-%m-%d'),
                'days': days
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/insights', methods=['GET'])
@jwt_required()
def get_emotion_insights():
    """
    Get AI-generated insights about user's emotional state
    """
    try:
        user_id = get_jwt_identity()
        
        # Get recent emotion data from chat messages (last 30 days)
        start_date = datetime.now() - timedelta(days=30)
        messages = db.session.query(ChatMessage)\
            .join(ChatSession)\
            .filter(
                ChatSession.user_id == user_id,
                ChatMessage.role == 'user',
                ChatMessage.emotion_detected.isnot(None),
                ChatMessage.created_at >= start_date
            ).order_by(ChatMessage.created_at.desc()).limit(100).all()
        
        if not messages:
            return jsonify({
                'message': 'Not enough data for insights',
                'insights': []
            }), 200
        
        # Calculate insights
        from collections import Counter
        
        emotions = [msg.emotion_detected for msg in messages]
        emotion_counts = Counter(emotions)
        
        sentiments = [float(msg.sentiment_score) if msg.sentiment_score else 0 for msg in messages]
        avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0
        
        risk_levels = [msg.risk_level for msg in messages if msg.risk_level]
        high_risk_count = sum(1 for r in risk_levels if r in ['high', 'critical'])
        
        insights = []
        
        # Most common emotion
        if emotion_counts:
            most_common = emotion_counts.most_common(1)[0]
            insights.append({
                'type': 'dominant_emotion',
                'title': f'Your most common emotion: {most_common[0].title()}',
                'description': f'You experienced {most_common[0]} {most_common[1]} times in the last 30 days.',
                'severity': 'info'
            })
        
        # Sentiment analysis
        if avg_sentiment < -0.3:
            insights.append({
                'type': 'sentiment',
                'title': 'Negative sentiment detected',
                'description': 'Your overall sentiment has been negative recently. Consider talking to a professional.',
                'severity': 'warning'
            })
        elif avg_sentiment > 0.3:
            insights.append({
                'type': 'sentiment',
                'title': 'Positive sentiment',
                'description': 'Your overall sentiment has been positive. Keep up the good work!',
                'severity': 'success'
            })
        
        # Risk assessment
        if high_risk_count > 3:
            insights.append({
                'type': 'risk',
                'title': 'High risk detected',
                'description': f'We detected {high_risk_count} high-risk instances. Please consider reaching out to a healthcare professional.',
                'severity': 'critical'
            })
        
        return jsonify({
            'insights': insights,
            'summary': {
                'total_logs': len(messages),
                'average_sentiment': round(avg_sentiment, 2),
                'high_risk_count': high_risk_count,
                'emotion_distribution': dict(emotion_counts)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/session/<int:session_id>/analyze-dashboard', methods=['POST'])
@jwt_required()
def analyze_session_dashboard(session_id):
    """
    Phân tích session để tạo dashboard analytics (gọi AI Model)
    
    Trigger:
    - Khi user kết thúc session
    - Sau mỗi 10 tin nhắn
    - Khi user vào xem emotion dashboard
    """
    try:
        user_id = get_jwt_identity()
        
        result = SessionAnalysisService.analyze_session_for_dashboard(session_id, user_id)
        
        if not result['success']:
            return jsonify({'error': result['error']}), 400
        
        return jsonify(result['data']), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/analyze-recent', methods=['POST'])
@jwt_required()
def analyze_recent_sessions():
    """
    Analyze recent sessions for dashboard (up to limit)
    Uses cached result if available and fresh (< 24 hours old)
    Set force_refresh=true to bypass cache
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        limit = data.get('limit', 15)
        force_refresh = data.get('force_refresh', False)
        
        result = SessionAnalysisService.analyze_recent_sessions_for_dashboard(
            user_id, 
            limit=limit,
            force_refresh=force_refresh
        )
        
        if not result['success']:
            # If "not enough messages" or similar non-critical error, we might still want to return 200 but with a message?
            # ideally not, let frontend handle 400
            return jsonify({'error': result['error']}), 400
            
        return jsonify(result['data']), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/session/<int:session_id>/analyze-clinical', methods=['POST'])
@jwt_required()
def analyze_session_clinical(session_id):
    """
    Phân tích session để tạo clinical report cho bác sĩ (gọi AI Model)
    
    Chỉ bác sĩ mới được gọi endpoint này
    """
    try:
        doctor_id = get_jwt_identity()
        
        # Verify user is a doctor
        from app.models.models import User
        doctor = User.query.get(doctor_id)
        if not doctor or doctor.role != 'doctor':
            return jsonify({'error': 'Unauthorized - Doctor only'}), 403
        
        # Get patient_id from session
        from app.models.models import ChatSession
        session = ChatSession.query.get(session_id)
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        patient_id = session.user_id
        
        if not result['success']:
            return jsonify({'error': result['error']}), 400
        
        return jsonify(result['data']), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/analysis/save', methods=['POST'])
@jwt_required()
def save_emotion_analysis():
    """
    Save emotion analysis results from ML model to database
    
    Request body:
    {
        "session_analysis": {
            "dominant_emotion": "sadness",
            "emotional_breakdown": {"sadness": 0.5, "fear": 0.5},
            "overall_sentiment": -0.52,
            "intensity_average": 0.71
        },
        "emotional_progression": [...],
        "trend": "improving",
        "triggers": [],
        "summary_message": "...",
        "message_count": 10
    }
    """
    try:
        user_id = get_jwt_identity()
        data = request.json
        
        if not data or 'session_analysis' not in data:
            return jsonify({'error': 'session_analysis is required'}), 400
        
        session_analysis = data['session_analysis']
        
        # Create EmotionAnalysis record
        from app.models.emotion import EmotionAnalysis
        
        analysis = EmotionAnalysis(
            user_id=user_id,
            dominant_emotion=session_analysis.get('dominant_emotion', 'neutral'),
            emotional_breakdown=session_analysis.get('emotional_breakdown'),
            overall_sentiment=session_analysis.get('overall_sentiment', 0),
            intensity_average=session_analysis.get('intensity_average', 0),
            emotional_progression=data.get('emotional_progression'),
            trend=data.get('trend', 'stable'),
            triggers=data.get('triggers'),
            summary_message=data.get('summary_message'),
            message_count=data.get('message_count', 0),
            analysis_source='ml_model'
        )
        
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            'message': 'Analysis saved successfully',
            'analysis': analysis.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/analysis/history', methods=['GET'])
@jwt_required()
def get_emotion_analysis_history():
    """
    Get user's emotion analysis history
    
    Query params:
    - limit: Number of records (default: 10)
    - offset: Skip records (default: 0)
    - start_date: Filter from date (YYYY-MM-DD)
    - end_date: Filter to date (YYYY-MM-DD)
    """
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 10, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        from app.models.emotion import EmotionAnalysis
        
        query = EmotionAnalysis.query.filter_by(user_id=user_id)
        
        # Date filters
        start_date = request.args.get('start_date')
        if start_date:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(EmotionAnalysis.created_at >= start)
        
        end_date = request.args.get('end_date')
        if end_date:
            end = datetime.strptime(end_date, '%Y-%m-%d')
            query = query.filter(EmotionAnalysis.created_at <= end)
        
        # Order by latest first
        query = query.order_by(EmotionAnalysis.created_at.desc())
        
        # Apply pagination
        analyses = query.limit(limit).offset(offset).all()
        total = query.count()
        
        return jsonify({
            'analyses': [analysis.to_dict() for analysis in analyses],
            'total': total,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@emotion_bp.route('/analysis/latest', methods=['GET'])
@jwt_required()
def get_latest_emotion_analysis():
    """
    Get user's most recent session analysis from database
    This is used for cache on dashboard page load
    """
    try:
        user_id = get_jwt_identity()
        
        from app.models.session_analysis import SessionAnalysis
        
        # Query from SessionAnalysis (unified table) instead of old EmotionAnalysis
        analysis = SessionAnalysis.query.filter_by(user_id=user_id)\
            .order_by(SessionAnalysis.analyzed_at.desc())\
            .first()
        
        if not analysis:
            return jsonify({'message': 'No analysis found'}), 404
        
        # Return user-facing format
        return jsonify(analysis.to_dict_user()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

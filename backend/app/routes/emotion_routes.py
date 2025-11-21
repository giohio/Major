"""
Emotion routes for emotion analytics and management
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

from app.models.models import User, EmotionLog
from app.extensions import db
from app.services.emotion_service import EmotionService

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
        
        query = EmotionLog.query.filter_by(user_id=user_id)
        
        # Date filters
        start_date = request.args.get('start_date')
        if start_date:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(EmotionLog.created_at >= start)
        
        end_date = request.args.get('end_date')
        if end_date:
            end = datetime.strptime(end_date, '%Y-%m-%d')
            query = query.filter(EmotionLog.created_at <= end)
        
        # Emotion filter
        emotion = request.args.get('emotion')
        if emotion:
            query = query.filter(EmotionLog.primary_emotion == emotion)
        
        query = query.order_by(EmotionLog.created_at.desc())
        
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'logs': [log.to_dict() for log in paginated.items],
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
        
        from sqlalchemy import func
        
        # Get emotion distribution over time
        start_date = datetime.now() - timedelta(days=days)
        
        # Daily emotion counts
        daily_emotions = db.session.query(
            func.date(EmotionLog.created_at).label('date'),
            EmotionLog.primary_emotion,
            func.count(EmotionLog.id).label('count')
        ).filter(
            EmotionLog.user_id == user_id,
            EmotionLog.created_at >= start_date
        ).group_by(
            func.date(EmotionLog.created_at),
            EmotionLog.primary_emotion
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
            func.date(EmotionLog.created_at).label('date'),
            func.avg(EmotionLog.sentiment_score).label('avg_sentiment')
        ).filter(
            EmotionLog.user_id == user_id,
            EmotionLog.created_at >= start_date
        ).group_by(
            func.date(EmotionLog.created_at)
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
        
        # Get recent emotion logs (last 30 days)
        start_date = datetime.now() - timedelta(days=30)
        logs = EmotionLog.query.filter(
            EmotionLog.user_id == user_id,
            EmotionLog.created_at >= start_date
        ).order_by(EmotionLog.created_at.desc()).limit(100).all()
        
        if not logs:
            return jsonify({
                'message': 'Not enough data for insights',
                'insights': []
            }), 200
        
        # Calculate insights
        from collections import Counter
        
        emotions = [log.primary_emotion for log in logs]
        emotion_counts = Counter(emotions)
        
        sentiments = [log.sentiment_score for log in logs]
        avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0
        
        risk_levels = [log.risk_level for log in logs]
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
                'total_logs': len(logs),
                'average_sentiment': round(avg_sentiment, 2),
                'high_risk_count': high_risk_count,
                'emotion_distribution': dict(emotion_counts)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

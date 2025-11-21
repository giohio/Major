from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import User, Plan
from app.extensions import db
from app.middleware.role_middleware import role_required
from app.services.emotion_service import EmotionService
from app.services.chat_service import ChatService
from datetime import datetime

bp = Blueprint('users', __name__)

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/subscription', methods=['GET'])
@jwt_required()
def get_subscription():
    """Get current subscription information"""
    try:
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get plan details
        plan = Plan.query.filter_by(name=user.subscription_plan).first()
        
        return jsonify({
            'subscription_plan': user.subscription_plan,
            'subscription_status': user.subscription_status,
            'subscription_start_date': user.subscription_start_date.isoformat() if user.subscription_start_date else None,
            'subscription_end_date': user.subscription_end_date.isoformat() if user.subscription_end_date else None,
            'plan_details': plan.to_dict() if plan else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/emotions', methods=['GET'])
@jwt_required()
def get_emotions():
    """Get emotion statistics"""
    try:
        current_user_id = get_jwt_identity()
        period = request.args.get('period', 'week')  # week, month, year
        
        stats = EmotionService.get_emotion_stats(current_user_id, period)
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get chat history"""
    try:
        current_user_id = get_jwt_identity()
        limit = int(request.args.get('limit', 20))
        
        sessions = ChatService.get_user_sessions(current_user_id, limit)
        
        return jsonify({
            'sessions': sessions,
            'total': len(sessions)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    """Get user statistics (chat count, emotion trends, etc.)"""
    try:
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get statistics
        from app.models.models import ChatSession, EmotionLog, Alert
        
        total_chats = ChatSession.query.filter_by(user_id=current_user_id).count()
        total_emotions = EmotionLog.query.filter_by(user_id=current_user_id).count()
        active_alerts = Alert.query.filter_by(user_id=current_user_id, is_resolved=False).count()
        
        return jsonify({
            'total_chat_sessions': total_chats,
            'total_emotion_logs': total_emotions,
            'active_alerts': active_alerts,
            'member_since': user.created_at.isoformat() if user.created_at else None,
            'last_login': user.last_login.isoformat() if user.last_login else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

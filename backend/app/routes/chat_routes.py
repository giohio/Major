from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.chat_service import ChatService
from app.services.emotion_service import EmotionService
from app.middleware.auth_middleware import token_required
from app.middleware.plan_middleware import check_chat_limit
from app.models.models import ChatFeedback
from app.extensions import db

bp = Blueprint('chat', __name__)

@bp.route('/send', methods=['POST'])
@check_chat_limit
def send_message(current_user, plan, remaining):
    """Send message to AI chatbot"""
    try:
        data = request.get_json()
        
        if 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        session_id = data.get('session_id')
        analyze_emotion = data.get('analyze_emotion', True)
        
        # Send message and get response
        result = ChatService.send_message(
            user_id=current_user.id,
            message_content=message,
            session_id=session_id,
            analyze_emotion=analyze_emotion
        )
        
        if not result['success']:
            return jsonify({'error': result.get('error')}), 500
        
        # Add remaining quota info
        result['remaining_chats'] = remaining if remaining != -1 else 'unlimited'
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/session/<int:session_id>', methods=['GET'])
@token_required
def get_session(current_user, session_id):
    """Get all messages in a session"""
    try:
        messages = ChatService.get_session_messages(session_id, current_user.id)
        
        return jsonify({
            'session_id': session_id,
            'messages': messages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/recent', methods=['GET'])
@token_required
def get_recent_sessions(current_user):
    """Get recent chat sessions"""
    try:
        limit = int(request.args.get('limit', 10))
        
        sessions = ChatService.get_user_sessions(current_user.id, limit)
        
        return jsonify({
            'sessions': sessions,
            'total': len(sessions)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/session/<int:session_id>', methods=['DELETE'])
@token_required
def delete_session(current_user, session_id):
    """Delete a chat session"""
    try:
        success = ChatService.delete_session(session_id, current_user.id)
        
        if not success:
            return jsonify({'error': 'Session not found or unauthorized'}), 404
        
        return jsonify({'message': 'Session deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/session/<int:session_id>/archive', methods=['POST'])
@token_required
def archive_session(current_user, session_id):
    """Archive a chat session"""
    try:
        success = ChatService.archive_session(session_id, current_user.id)
        
        if not success:
            return jsonify({'error': 'Session not found or unauthorized'}), 404
        
        return jsonify({'message': 'Session archived successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/feedback', methods=['POST'])
@token_required
def submit_feedback(current_user):
    """Submit feedback for a message"""
    try:
        data = request.get_json()
        
        required_fields = ['message_id', 'rating']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        feedback = ChatFeedback(
            user_id=current_user.id,
            message_id=data['message_id'],
            rating=data['rating'],
            feedback_text=data.get('feedback_text')
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        return jsonify({
            'message': 'Feedback submitted successfully',
            'feedback': feedback.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.models import User
from app.extensions import db

def token_required(fn):
    """
    Decorator to verify JWT token and load current user
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            
            user = db.session.get(User, current_user_id)
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
                
            if not user.is_active:
                return jsonify({'error': 'Account is inactive'}), 403
                
            return fn(current_user=user, *args, **kwargs)
            
        except Exception as e:
            return jsonify({'error': 'Invalid or expired token', 'details': str(e)}), 401
            
    return wrapper

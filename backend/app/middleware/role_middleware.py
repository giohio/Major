from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.models import User
from app.extensions import db

def role_required(*allowed_roles):
    """
    Decorator to check if user has one of the allowed roles
    Usage: @role_required('admin', 'doctor')
    """
    def decorator(fn):
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
                    
                if user.role not in allowed_roles:
                    return jsonify({
                        'error': 'Access denied',
                        'message': f'This endpoint requires one of these roles: {", ".join(allowed_roles)}'
                    }), 403
                    
                return fn(current_user=user, *args, **kwargs)
                
            except Exception as e:
                return jsonify({'error': 'Authentication error', 'details': str(e)}), 401
                
        return wrapper
    return decorator


def admin_required(fn):
    """
    Decorator for admin-only endpoints
    """
    return role_required('admin')(fn)


def doctor_required(fn):
    """
    Decorator for doctor and admin endpoints
    """
    return role_required('admin', 'doctor')(fn)


def user_or_doctor_required(fn):
    """
    Decorator for user, doctor and admin endpoints
    """
    return role_required('user', 'doctor', 'admin')(fn)

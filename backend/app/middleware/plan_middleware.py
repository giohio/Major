from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.models import User, Plan
from app.extensions import db
from datetime import datetime

def plan_feature_required(feature_name):
    """
    Decorator to check if user's subscription plan has a specific feature
    
    Args:
        feature_name: Name of the feature to check (e.g., 'voice_enabled', 'video_enabled', 'empathy_layer_enabled')
    
    Usage: @plan_feature_required('voice_enabled')
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
                
                # Admin always has access
                if user.role == 'admin':
                    return fn(current_user=user, *args, **kwargs)
                
                # Check subscription status
                if user.subscription_status != 'active':
                    return jsonify({
                        'error': 'Subscription required',
                        'message': 'Your subscription is not active. Please renew to access this feature.'
                    }), 402
                
                # Check if subscription has expired
                if user.subscription_end_date and user.subscription_end_date < datetime.utcnow():
                    return jsonify({
                        'error': 'Subscription expired',
                        'message': 'Your subscription has expired. Please renew to continue.'
                    }), 402
                
                # Get user's plan
                if user.subscription_plan:
                    plan = db.session.get(Plan, user.subscription_plan)
                else:
                    plan = None
                
                if not plan:
                    # Fallback to Free plan or error
                    # If user has no plan ID, they might be on Free tier implicitly, but here we enforce plan validity
                    return jsonify({
                        'error': 'Plan not found',
                        'message': f'Your subscription plan is invalid. Please contact support.'
                    }), 404
                
                # Check if plan has the required feature
                has_feature = getattr(plan, feature_name, False)
                
                if not has_feature:
                    return jsonify({
                        'error': 'Feature not available',
                        'message': f'Your current plan ({plan.name}) does not include this feature. Please upgrade.',
                        'upgrade_required': True,
                        'current_plan': plan.name
                    }), 403
                    
                return fn(current_user=user, plan=plan, *args, **kwargs)
                
            except AttributeError:
                return jsonify({
                    'error': 'Invalid feature check',
                    'message': f'Feature "{feature_name}" is not a valid plan feature'
                }), 500
            except Exception as e:
                import traceback
                error_details = str(e)
                
                # Better error messages for common JWT errors
                if 'Signature verification failed' in error_details:
                    return jsonify({
                        'error': 'Invalid token',
                        'message': 'Token signature is invalid. Please login again.'
                    }), 401
                elif 'Token has expired' in error_details or 'expired' in error_details.lower():
                    return jsonify({
                        'error': 'Token expired',
                        'message': 'Your session has expired. Please login again.'
                    }), 401
                elif 'Authorization header' in error_details or 'Missing' in error_details:
                    return jsonify({
                        'error': 'Missing authorization',
                        'message': 'No authorization token provided. Please login.'
                    }), 401
                else:
                    return jsonify({
                        'error': 'Authorization error',
                        'message': error_details
                    }), 401
                
        return wrapper
    return decorator


def check_chat_limit(fn):
    """
    Decorator to check if user has remaining chat quota
    Uses new plan_limits utility
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            
            user = db.session.get(User, current_user_id)
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            # Admin always has unlimited access
            if user.role == 'admin':
                return fn(current_user=user, plan=None, remaining=-1, *args, **kwargs)
            
            # Use new plan_limits utility
            from app.utils.plan_limits import check_chat_limit as check_limit
            
            can_chat, error_msg, remaining = check_limit(user)
            
            if not can_chat:
                return jsonify({
                    'error': 'Chat limit reached',
                    'message': error_msg,
                    'upgrade_required': True
                }), 429
            
            # Get user's plan
            if user.subscription_plan:
                plan = db.session.get(Plan, user.subscription_plan)
            else:
                # Fallback to Free Plan (ID 9) if no plan assigned
                plan = db.session.get(Plan, 9)
            
            return fn(current_user=user, plan=plan, remaining=remaining, *args, **kwargs)
            
        except Exception as e:
            import traceback
            error_details = str(e)
            
            # Better error messages for common JWT errors
            if 'Signature verification failed' in error_details:
                return jsonify({
                    'error': 'Invalid token',
                    'message': 'Token signature is invalid. Please login again.'
                }), 401
            elif 'Token has expired' in error_details or 'expired' in error_details.lower():
                return jsonify({
                    'error': 'Token expired',
                    'message': 'Your session has expired. Please login again.'
                }), 401
            elif 'Authorization header' in error_details or 'Missing' in error_details:
                return jsonify({
                    'error': 'Missing authorization',
                    'message': 'No authorization token provided. Please login.'
                }), 401
            else:
                return jsonify({
                    'error': 'Authorization error',
                    'message': error_details
                }), 401
            
    return wrapper

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
                plan = Plan.query.filter_by(name=user.subscription_plan, is_active=True).first()
                
                if not plan:
                    return jsonify({
                        'error': 'Plan not found',
                        'message': 'Your subscription plan is not valid'
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
                return jsonify({'error': 'Authorization error', 'details': str(e)}), 401
                
        return wrapper
    return decorator


def check_chat_limit(fn):
    """
    Decorator to check if user has remaining chat quota
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
                return fn(current_user=user, *args, **kwargs)
            
            # Get user's plan
            plan = Plan.query.filter_by(name=user.subscription_plan, is_active=True).first()
            
            if not plan:
                return jsonify({'error': 'Plan not found'}), 404
            
            # -1 means unlimited
            if plan.chat_limit == -1:
                return fn(current_user=user, plan=plan, *args, **kwargs)
            
            # Count user's chat sessions this month
            from datetime import datetime, timedelta
            from app.models.models import ChatSession
            
            start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            chat_count = ChatSession.query.filter(
                ChatSession.user_id == user.id,
                ChatSession.created_at >= start_of_month
            ).count()
            
            if chat_count >= plan.chat_limit:
                return jsonify({
                    'error': 'Chat limit reached',
                    'message': f'You have reached your monthly limit of {plan.chat_limit} chat sessions.',
                    'used': chat_count,
                    'limit': plan.chat_limit,
                    'upgrade_required': True
                }), 429
                
            return fn(current_user=user, plan=plan, remaining=plan.chat_limit - chat_count, *args, **kwargs)
            
        except Exception as e:
            return jsonify({'error': 'Authorization error', 'details': str(e)}), 401
            
    return wrapper

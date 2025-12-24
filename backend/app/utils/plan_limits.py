"""
Plan Limits Utility
Check user permissions and limits based on subscription plan
"""
from app.models.models import Plan, User, Appointment
from app.extensions import db
from datetime import datetime, timedelta


def get_user_plan(user):
    """Get user's current plan details"""
    if not user.subscription_plan:
        # No plan = Free tier (ID 9)
        free_plan = db.session.get(Plan, 9)
        if free_plan:
            return free_plan.to_dict()
        return {
            'name': 'Free',
            'chat_limit': 10,
            'video_enabled': False,
            'doctor_access': False,
            'priority_support': False
        }
    
    # subscription_plan is now INTEGER (plan ID)
    plan = db.session.get(Plan, user.subscription_plan)
    if plan:
        return plan.to_dict()
    
    # Fallback to Free if plan not found
    free_plan = db.session.get(Plan, 9)
    if free_plan:
        return free_plan.to_dict()
    return {
        'name': 'Free',
        'chat_limit': 10,
        'video_enabled': False,
        'doctor_access': False,
        'priority_support': False
    }


def check_doctor_access(user):
    """Check if user has access to book doctor appointments"""
    plan = get_user_plan(user)
    
    # Free tier: No doctor access
    # Premium/VIP: Has doctor access
    if not plan.get('doctor_access', False):
        return False, "Your plan doesn't include doctor consultations. Please upgrade to Premium or VIP."
    
    return True, None


def check_video_access(user):
    """Check if user has video consultation enabled"""
    plan = get_user_plan(user)
    
    if not plan.get('video_enabled', False):
        return False, "Video consultations are not available in your plan. Please upgrade."
    
    return True, None


def check_chat_limit(user):
    """Check if user has remaining chat messages"""
    from app.models.models import ChatSession
    
    plan = get_user_plan(user)
    chat_limit = plan.get('chat_limit', 10)
    
    # -1 means unlimited
    if chat_limit == -1:
        return True, None, -1
    
    # Count messages today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Count user's chat sessions today (each session counts as 1 "chat")
    sessions_today = ChatSession.query.filter(
        ChatSession.user_id == user.id,
        ChatSession.created_at >= today_start
    ).count()
    
    remaining = chat_limit - sessions_today
    
    if sessions_today >= chat_limit:
        return False, f"You've reached your daily limit of {chat_limit} chat sessions. Upgrade to Premium for unlimited chat.", 0
    
    return True, None, remaining


def check_appointment_limit(user):
    """Check if user can book more appointments this month"""
    plan = get_user_plan(user)
    
    # VIP tier gets 2 free appointments per month
    if plan.get('name') == 'VIP':
        # Count appointments this month
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        appointments_this_month = Appointment.query.filter(
            Appointment.user_id == user.id,
            Appointment.created_at >= month_start,
            Appointment.status.in_(['pending', 'confirmed', 'scheduled', 'completed'])
        ).count()
        
        if appointments_this_month < 2:
            return True, None, 2 - appointments_this_month, True  # Has free sessions
        else:
            return True, None, 0, False  # Can still book but must pay
    
    # Premium: Can book unlimited but must pay
    if plan.get('doctor_access', False):
        return True, None, -1, False  # Unlimited but paid
    
    # Free: No access
    return False, "Doctor consultations are not available in your plan. Please upgrade to Premium or VIP.", 0, False


def get_appointment_price(user, doctor_profile):
    """Calculate appointment price based on user plan and doctor fee"""
    plan = get_user_plan(user)
    base_price = float(doctor_profile.consultation_fee)
    
    # VIP gets discount
    if plan.get('name') == 'VIP':
        # Check if user has free sessions this month
        can_book, msg, free_remaining, is_free = check_appointment_limit(user)
        
        if is_free and free_remaining > 0:
            return 0  # Free session
        else:
            # 20% discount for VIP
            return base_price * 0.8
    
    return base_price


def get_plan_features_summary(user):
    """Get summary of user's plan features and usage"""
    plan = get_user_plan(user)
    
    # Chat usage
    chat_ok, chat_msg, chat_remaining = check_chat_limit(user)
    
    # Doctor access
    doctor_ok, doctor_msg = check_doctor_access(user)
    
    # Appointments
    appt_ok, appt_msg, appt_remaining, has_free = check_appointment_limit(user)
    
    # Video access
    video_ok, video_msg = check_video_access(user)
    
    return {
        'plan_name': plan.get('name', 'Free'),
        'features': {
            'chat': {
                'enabled': True,
                'limit': plan.get('chat_limit', 10),
                'remaining': chat_remaining if chat_remaining != -1 else 'unlimited',
                'unlimited': plan.get('chat_limit', 10) == -1
            },
            'doctor_access': {
                'enabled': doctor_ok,
                'message': doctor_msg
            },
            'video': {
                'enabled': video_ok,
                'message': video_msg
            },
            'appointments': {
                'enabled': appt_ok,
                'free_remaining': appt_remaining if has_free else 0,
                'has_discount': plan.get('name') == 'VIP',
                'discount_percent': 20 if plan.get('name') == 'VIP' else 0,
                'message': appt_msg
            },
            'priority_support': plan.get('priority_support', False),
            'empathy_layer': plan.get('empathy_layer_enabled', False)
        },
        'subscription': {
            'status': user.subscription_status,
            'start_date': user.subscription_start_date.isoformat() if user.subscription_start_date else None,
            'end_date': user.subscription_end_date.isoformat() if user.subscription_end_date else None
        }
    }

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import User, Plan
from app.extensions import db
from app.middleware.role_middleware import role_required
from app.services.emotion_service import EmotionService
from app.services.chat_service import ChatService
from datetime import datetime
import os

bp = Blueprint('users', __name__)

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    try:
        current_user_id = int(get_jwt_identity())
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
        current_user_id = int(get_jwt_identity())
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
        if 'date_of_birth' in data:
            if data['date_of_birth']:
                try:
                    from datetime import datetime
                    user.date_of_birth = datetime.fromisoformat(data['date_of_birth']).date()
                except:
                    pass
        if 'address' in data:
            user.address = data['address']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/avatar/upload', methods=['POST'])
@jwt_required()
def upload_avatar():
    """Upload avatar image file"""
    try:
        current_user_id = int(get_jwt_identity())
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_ext not in allowed_extensions:
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400
        
        # Check file size (5MB max)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            return jsonify({'error': 'File too large. Maximum size: 5MB'}), 400
        
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'avatars')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        import uuid
        unique_filename = f"{user.id}_{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Update user avatar_url
        avatar_url = f"/uploads/avatars/{unique_filename}"
        user.avatar_url = avatar_url
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Avatar uploaded successfully',
            'avatar_url': avatar_url
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/subscription', methods=['GET'])
@jwt_required()
def get_subscription():
    """Get current subscription information"""
    try:
        current_user_id = int(get_jwt_identity())
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get plan details - subscription_plan is now plan ID
        plan = None
        if user.subscription_plan:
            # Check if subscription_plan is ID (integer) or name (string for old data)
            if isinstance(user.subscription_plan, int):
                plan = db.session.get(Plan, user.subscription_plan)
            else:
                # Fallback for old data with plan names
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
        current_user_id = int(get_jwt_identity())
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
        current_user_id = int(get_jwt_identity())
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
        current_user_id = int(get_jwt_identity())
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get statistics
        from app.models.models import ChatSession, ChatMessage, Alert
        
        total_chats = ChatSession.query.filter_by(user_id=current_user_id).count()
        
        # Count emotion messages
        total_emotions = db.session.query(ChatMessage)\
            .join(ChatSession)\
            .filter(
                ChatSession.user_id == current_user_id,
                ChatMessage.role == 'user',
                ChatMessage.emotion_detected.isnot(None)
            ).count()
        
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


@bp.route('/appointments', methods=['GET'])
@jwt_required()
def get_user_appointments():
    """Get user's appointments"""
    try:
        from app.models.models import Appointment, DoctorProfile
        
        current_user_id = int(get_jwt_identity())
        
        # Get appointments for this user
        appointments = Appointment.query.filter_by(user_id=current_user_id).order_by(Appointment.appointment_date.desc()).all()
        
        # Get doctor names for each appointment
        result = []
        for apt in appointments:
            apt_dict = apt.to_dict()
            doctor_profile = db.session.get(DoctorProfile, apt.doctor_id)
            if doctor_profile:
                doctor_user = db.session.get(User, doctor_profile.user_id)
                if doctor_user:
                    apt_dict['doctor_name'] = doctor_user.full_name
                    apt_dict['doctor_specialization'] = doctor_profile.specialization
                    apt_dict['doctor_avatar_url'] = doctor_user.avatar_url
            result.append(apt_dict)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/appointments', methods=['POST'])
@jwt_required()
def create_user_appointment():
    """Create a new appointment (patient books appointment) - Step 1: Create pending payment"""
    try:
        from app.models.models import Appointment, DoctorProfile, Payment
        from app.utils.plan_limits import check_doctor_access, check_video_access, get_appointment_price, check_appointment_limit
        from app.services.payment_service import PaymentService
        
        current_user_id = int(get_jwt_identity())
        current_user = db.session.get(User, current_user_id)
        
        data = request.get_json()
        
        required_fields = ['doctor_id', 'appointment_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if doctor exists
        doctor_profile = db.session.get(DoctorProfile, data['doctor_id'])
        if not doctor_profile:
            return jsonify({'error': 'Doctor not found'}), 404
        
        # Check plan limits - doctor access
        has_access, access_msg = check_doctor_access(current_user)
        if not has_access:
            return jsonify({'error': access_msg, 'upgrade_required': True}), 403
        
        # Check video access if appointment type is video
        appointment_type = data.get('appointment_type', 'video')
        if appointment_type == 'video':
            has_video, video_msg = check_video_access(current_user)
            if not has_video:
                return jsonify({'error': video_msg, 'upgrade_required': True}), 403
        
        # Parse appointment date
        try:
            appointment_date = datetime.fromisoformat(data['appointment_date'].replace('Z', '+00:00'))
        except:
            return jsonify({'error': 'Invalid date format'}), 400
        
        # Calculate price
        appointment_price = get_appointment_price(current_user, doctor_profile)
        
        # Check if user has free sessions
        can_book, limit_msg, free_remaining, is_free = check_appointment_limit(current_user)
        
        # If price is 0 (free session), create appointment directly without payment
        if appointment_price == 0:
            appointment = Appointment(
                user_id=current_user_id,
                doctor_id=data['doctor_id'],
                appointment_date=appointment_date,
                duration_minutes=data.get('duration_minutes', 60),
                status='pending',  # Skip payment, go to pending approval
                appointment_type=appointment_type,
                notes=data.get('notes')
            )
            
            db.session.add(appointment)
            db.session.commit()
            
            return jsonify({
                'message': 'Free appointment booked! Waiting for doctor approval.',
                'appointment': appointment.to_dict(),
                'is_free': True,
                'free_sessions_remaining': free_remaining - 1 if free_remaining > 0 else 0
            }), 201
        
        # Create appointment with pending_payment status
        appointment = Appointment(
            user_id=current_user_id,
            doctor_id=data['doctor_id'],
            appointment_date=appointment_date,
            duration_minutes=data.get('duration_minutes', 60),
            status='pending_payment',  # Waiting for payment
            appointment_type=appointment_type,
            notes=data.get('notes')
        )
        
        db.session.add(appointment)
        db.session.flush()  # Get appointment ID
        
        # Create payment record
        payment = Payment(
            user_id=current_user_id,
            plan_id=None,  # This is appointment payment, not subscription
            amount=appointment_price,
            currency='VND',
            payment_method=data.get('payment_method', 'vnpay'),
            payment_status='pending',
            payment_type='appointment',
            billing_cycle=None
        )
        
        db.session.add(payment)
        db.session.flush()  # Get payment ID
        
        # Link payment to appointment
        appointment.payment_id = payment.id
        
        db.session.commit()
        
        # Generate payment URL
        payment_method = data.get('payment_method', 'vnpay')
        payment_url = None
        
        if payment_method == 'vnpay':
            # Get VNPay config from environment
            vnp_url = os.environ.get('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html')
            vnp_tmn_code = os.environ.get('VNPAY_TMN_CODE', '')
            vnp_hash_secret = os.environ.get('VNPAY_HASH_SECRET', '')
            
            if not vnp_tmn_code or not vnp_hash_secret:
                return jsonify({'error': 'VNPay not configured. Please contact admin.'}), 500
            
            return_url = data.get('return_url', 'http://localhost:5173/appointments')
            payment_url = PaymentService.generate_vnpay_payment_url(
                payment=payment,
                return_url=return_url,
                vnp_url=vnp_url,
                vnp_tmn_code=vnp_tmn_code,
                vnp_hash_secret=vnp_hash_secret
            )
        
        return jsonify({
            'message': 'Appointment created. Please complete payment.',
            'appointment': appointment.to_dict(),
            'payment': payment.to_dict(),
            'payment_url': payment_url,
            'amount': float(appointment_price),
            'is_free': False,
            'has_discount': current_user.subscription_plan == 11  # VIP plan ID
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/appointments/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_user_appointment(appointment_id):
    """Update user's appointment (cancel, reschedule)"""
    try:
        from app.models.models import Appointment
        
        current_user_id = int(get_jwt_identity())
        appointment = db.session.get(Appointment, appointment_id)
        
        if not appointment or appointment.user_id != current_user_id:
            return jsonify({'error': 'Appointment not found or unauthorized'}), 404
        
        data = request.get_json()
        
        # Users can only cancel or reschedule
        if 'status' in data:
            if data['status'] not in ['cancelled', 'scheduled']:
                return jsonify({'error': 'Invalid status'}), 400
            appointment.status = data['status']
        
        if 'appointment_date' in data:
            try:
                appointment.appointment_date = datetime.fromisoformat(data['appointment_date'].replace('Z', '+00:00'))
            except:
                return jsonify({'error': 'Invalid date format'}), 400
        
        if 'notes' in data:
            appointment.notes = data['notes']
        
        appointment.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment updated successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    """Get user settings"""
    try:
        import json
        
        current_user_id = int(get_jwt_identity())
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Parse settings JSON or return defaults
        if user.settings:
            try:
                settings = json.loads(user.settings)
            except:
                settings = get_default_settings()
        else:
            settings = get_default_settings()
        
        return jsonify(settings), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    """Update user settings"""
    try:
        import json
        
        current_user_id = int(get_jwt_identity())
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate settings structure (optional)
        # Store as JSON string
        user.settings = json.dumps(data)
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Settings updated successfully',
            'settings': data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


def get_default_settings():
    """Return default user settings"""
    return {
        'emailNotifications': True,
        'pushNotifications': True,
        'sessionReminders': True,
        'weeklyReports': False,
        'shareDataForResearch': False,
        'anonymousAnalytics': True,
        'showOnlineStatus': True,
        'theme': 'light',
        'language': 'vi',
        'fontSize': 'medium',
        'highContrast': False,
        'reduceMotion': False,
        'screenReader': False
    }

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from app.models.models import User
from app.extensions import db, redis_client
from datetime import datetime, timedelta
import secrets

try:
    from app.services.notification_service import NotificationService
    notification_service = NotificationService()
except ImportError:
    notification_service = None

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'full_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        role = data.get('role', 'user')
        
        # Validate doctor-specific fields
        if role == 'doctor':
            if 'license_number' not in data or not data['license_number']:
                return jsonify({'error': 'License number is required for doctor registration'}), 400
            if 'specialization' not in data or not data['specialization']:
                return jsonify({'error': 'Specialization is required for doctor registration'}), 400
            
            # Check if license number already exists
            from app.models.models import DoctorProfile
            existing_license = DoctorProfile.query.filter_by(license_number=data['license_number']).first()
            if existing_license:
                return jsonify({'error': 'License number already registered'}), 409
        
        # Get free plan ID
        from app.models.models import Plan
        free_plan = Plan.query.filter_by(name='Free').first()
        if not free_plan:
            return jsonify({'error': 'Free plan not found in database'}), 500
        
        # Create new user
        user = User(
            email=data['email'],
            full_name=data['full_name'],
            phone=data.get('phone'),
            role=role,
            subscription_plan=free_plan.id if free_plan else None,
            subscription_status='active',
            is_active=True,
            is_verified=False
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.flush()  # Get user.id before creating doctor profile
        
        # Create doctor profile if role is doctor
        if role == 'doctor':
            from app.models.models import DoctorProfile
            doctor_profile = DoctorProfile(
                user_id=user.id,
                license_number=data['license_number'],
                specialization=data['specialization'],
                bio=data.get('bio', ''),
                years_of_experience=data.get('years_of_experience', 0),
                consultation_fee=data.get('consultation_fee', 300000),  # Default 300k
                is_verified=False,  # Needs admin verification
                is_available=False  # Not available until verified
            )
            db.session.add(doctor_profile)
        
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        response_data = {
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }
        
        if role == 'doctor':
            response_data['message'] = 'Doctor registered successfully. Awaiting admin verification.'
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Registration error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is inactive'}), 403
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Login error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (revoke token)"""
    try:
        jti = get_jwt()["jti"]
        # TTL for the blocked token in Redis
        ttl = current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        
        if current_app.config['REDIS_URL'] and redis_client:
            redis_client.setex(jti, ttl, 'true')
            
        return jsonify({
            'message': 'Successfully logged out'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/verify-email', methods=['POST'])
@jwt_required()
def verify_email():
    """Verify user email with OTP"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # In a real implementation, you would verify the OTP sent via email
        # For now, we'll just mark the user as verified
        
        user = db.session.get(User, current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_verified = True
        db.session.commit()
        
        return jsonify({
            'message': 'Email verified successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset email"""
    try:
        data = request.get_json()
        
        if 'email' not in data:
            return jsonify({'error': 'Email required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if user:
            # Generate secure reset token
            reset_token = secrets.token_urlsafe(32)
            user.reset_token = reset_token
            user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
            
            db.session.commit()
            
            # Send password reset email
            if notification_service:
                frontend_url = current_app.config.get('APP_URL', 'http://localhost:3000')
                notification_service.send_password_reset_email(
                    to_email=user.email,
                    reset_token=reset_token,
                    frontend_url=frontend_url
                )
            else:
                # For development, log the token
                print(f"Reset token for {user.email}: {reset_token}")
        
        # Don't reveal if email exists or not (security best practice)
        return jsonify({
            'message': 'If that email exists, a password reset link has been sent'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token"""
    try:
        data = request.get_json()
        
        required_fields = ['token', 'new_password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        token = data['token']
        new_password = data['new_password']
        
        # Find user by reset token
        user = User.query.filter_by(reset_token=token).first()
        
        if not user:
            return jsonify({'error': 'Invalid or expired reset token'}), 400
        
        # Check if token is expired (optional - add reset_token_expires field to User model)
        # if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
        #     return jsonify({'error': 'Reset token has expired'}), 400
        
        # Update password
        user.set_password(new_password)
        user.reset_token = None  # Clear token after use
        # user.reset_token_expires = None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Password reset successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        current_user_id = get_jwt_identity()
        # Ensure ID is string for JWT subject
        access_token = create_access_token(identity=str(current_user_id))
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    try:
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        required_fields = ['current_password', 'new_password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Verify current password
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Validate new password
        new_password = data['new_password']
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters'}), 400
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/oauth/login', methods=['POST'])
def oauth_login():
    """Login or register user with OAuth (Google/Facebook)"""
    try:
        data = request.get_json()
        
        required_fields = ['provider', 'uid', 'email', 'full_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        provider = data['provider']  # 'google' or 'facebook'
        uid = data['uid']  # Firebase UID
        email = data['email']
        full_name = data['full_name']
        avatar_url = data.get('photo_url')
        
        if provider not in ['google', 'facebook']:
            return jsonify({'error': 'Invalid provider. Use google or facebook'}), 400
        
        # Get free plan ID
        from app.models.models import Plan
        free_plan = Plan.query.filter_by(name='Free').first()
        if not free_plan:
            return jsonify({'error': 'Free plan not found in database'}), 500
        
        # Check if user exists by email
        user = User.query.filter_by(email=email).first()
        
        if user:
            # User exists - update info and login
            user.full_name = full_name
            if avatar_url:
                user.avatar_url = avatar_url
            user.last_login = datetime.utcnow()
            user.is_verified = True  # OAuth users are pre-verified
            
            # Store OAuth provider info if not already stored
            if not hasattr(user, 'oauth_provider') or not user.oauth_provider:
                user.oauth_provider = provider
                user.oauth_uid = uid
        else:
            # Create new user from OAuth
            user = User(
                email=email,
                full_name=full_name,
                avatar_url=avatar_url,
                role='user',
                subscription_plan=free_plan.id if free_plan else None,
                subscription_status='active',
                is_active=True,
                is_verified=True,  # OAuth users are pre-verified
                oauth_provider=provider,
                oauth_uid=uid,
                last_login=datetime.utcnow()
            )
            # Set dummy password for OAuth users (they won't use it)
            user.set_password(None)
            db.session.add(user)
        
        db.session.commit()
        
        # Generate JWT tokens with string identity for proper JWT subject encoding
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

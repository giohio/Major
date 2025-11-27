from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.models.models import User
from app.extensions import db
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
        
        # Create new user
        user = User(
            email=data['email'],
            full_name=data['full_name'],
            phone=data.get('phone'),
            role=data.get('role', 'user'),  # Default to 'user'
            subscription_plan='free',
            subscription_status='active',
            is_active=True,
            is_verified=False
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
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
                subscription_plan='free',
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

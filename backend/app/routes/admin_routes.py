from flask import Blueprint, request, jsonify
from app.middleware.role_middleware import admin_required
from app.models.models import User, Plan, AIModel, Payment, Alert, ChatSession, DoctorProfile
from app.extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func

bp = Blueprint('admin', __name__)

@bp.route('/users', methods=['GET'])
@admin_required
def get_users(current_user):
    """Get all users with filtering"""
    try:
        role = request.args.get('role')
        status = request.args.get('status')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        query = User.query
        
        if role:
            query = query.filter_by(role=role)
        
        if status == 'active':
            query = query.filter_by(is_active=True)
        elif status == 'inactive':
            query = query.filter_by(is_active=False)
        
        pagination = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(current_user, user_id):
    """Get detailed user information"""
    try:
        user = db.session.get(User, user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user statistics
        total_chats = ChatSession.query.filter_by(user_id=user_id).count()
        total_payments = Payment.query.filter_by(user_id=user_id).count()
        total_alerts = Alert.query.filter_by(user_id=user_id).count()
        
        user_data = user.to_dict()
        user_data['statistics'] = {
            'total_chats': total_chats,
            'total_payments': total_payments,
            'total_alerts': total_alerts
        }
        
        return jsonify(user_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(current_user, user_id):
    """Update user information"""
    try:
        user = db.session.get(User, user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        updateable_fields = [
            'full_name', 'phone', 'role', 'is_active', 'is_verified',
            'subscription_plan', 'subscription_status'
        ]
        
        for field in updateable_fields:
            if field in data:
                setattr(user, field, data[field])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    """Delete a user account"""
    try:
        user = db.session.get(User, user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent deleting own account
        if user.id == current_user.id:
            return jsonify({'error': 'Cannot delete your own account'}), 403
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/doctors', methods=['GET'])
@admin_required
def get_doctors(current_user):
    """Get all doctors"""
    try:
        doctors = User.query.filter_by(role='doctor').all()
        
        result = []
        for doctor in doctors:
            doctor_data = doctor.to_dict()
            
            # Get doctor profile if exists
            if doctor.doctor_profile:
                doctor_data['profile'] = doctor.doctor_profile.to_dict()
            
            # Get patient count
            from app.models.models import PatientRecord
            patient_count = PatientRecord.query.filter_by(doctor_id=doctor.id).count()
            doctor_data['patient_count'] = patient_count
            
            result.append(doctor_data)
        
        return jsonify({'doctors': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/plans', methods=['GET'])
@admin_required
def get_all_plans(current_user):
    """Get all plans including inactive"""
    try:
        plans = Plan.query.all()
        
        return jsonify({
            'plans': [plan.to_dict() for plan in plans]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/models', methods=['GET'])
@admin_required
def get_models(current_user):
    """Get all AI models"""
    try:
        models = AIModel.query.all()
        
        return jsonify({
            'models': [model.to_dict() for model in models]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/models', methods=['POST'])
@admin_required
def create_model(current_user):
    """Add a new AI model"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'provider', 'model_version']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        model = AIModel(
            name=data['name'],
            provider=data['provider'],
            model_version=data['model_version'],
            is_active=data.get('is_active', True),
            is_default=data.get('is_default', False),
            max_tokens=data.get('max_tokens', 4096),
            temperature=data.get('temperature', 0.7),
            description=data.get('description')
        )
        
        # If set as default, unset other defaults
        if model.is_default:
            AIModel.query.filter_by(is_default=True).update({'is_default': False})
        
        db.session.add(model)
        db.session.commit()
        
        return jsonify({
            'message': 'Model created successfully',
            'model': model.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/usage', methods=['GET'])
@admin_required
def get_usage_stats(current_user):
    """Get platform usage statistics"""
    try:
        period = request.args.get('period', 'month')  # week, month, year
        
        # Calculate date range
        now = datetime.utcnow()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=30)
        
        # Total users
        total_users = User.query.count()
        new_users = User.query.filter(User.created_at >= start_date).count()
        
        # Active users (logged in within period)
        active_users = User.query.filter(User.last_login >= start_date).count()
        
        # Chat statistics
        total_chats = ChatSession.query.filter(ChatSession.created_at >= start_date).count()
        
        # Payment statistics
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.created_at >= start_date,
            Payment.payment_status == 'completed'
        ).scalar() or 0
        
        # Alert statistics
        total_alerts = Alert.query.filter(Alert.created_at >= start_date).count()
        critical_alerts = Alert.query.filter(
            Alert.created_at >= start_date,
            Alert.severity == 'critical'
        ).count()
        
        # Subscription distribution
        subscription_stats = db.session.query(
            User.subscription_plan,
            func.count(User.id)
        ).group_by(User.subscription_plan).all()
        
        return jsonify({
            'period': period,
            'users': {
                'total': total_users,
                'new': new_users,
                'active': active_users
            },
            'chats': {
                'total': total_chats
            },
            'revenue': {
                'total': float(total_revenue)
            },
            'alerts': {
                'total': total_alerts,
                'critical': critical_alerts
            },
            'subscriptions': {plan: count for plan, count in subscription_stats}
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/logs', methods=['GET'])
@admin_required
def get_logs(current_user):
    """Get system logs (simplified)"""
    try:
        # This would typically read from log files or logging service
        # For now, return recent alerts and errors
        
        recent_alerts = Alert.query.order_by(Alert.created_at.desc()).limit(50).all()
        
        return jsonify({
            'recent_alerts': [alert.to_dict() for alert in recent_alerts]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/stats/overview', methods=['GET'])
@admin_required
def get_overview(current_user):
    """Get overview statistics for admin dashboard"""
    try:
        # Quick stats
        total_users = User.query.count()
        total_doctors = User.query.filter_by(role='doctor').count()
        total_patients = User.query.filter_by(role='user').count()
        
        active_subscriptions = User.query.filter(
            User.subscription_status == 'active',
            User.subscription_plan != 'free'
        ).count()
        
        unresolved_alerts = Alert.query.filter_by(is_resolved=False).count()
        critical_alerts = Alert.query.filter_by(
            is_resolved=False,
            severity='critical'
        ).count()
        
        # Today's activity
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_chats = ChatSession.query.filter(ChatSession.created_at >= today).count()
        today_signups = User.query.filter(User.created_at >= today).count()
        
        return jsonify({
            'users': {
                'total': total_users,
                'doctors': total_doctors,
                'patients': total_patients
            },
            'subscriptions': {
                'active': active_subscriptions
            },
            'alerts': {
                'unresolved': unresolved_alerts,
                'critical': critical_alerts
            },
            'today': {
                'chats': today_chats,
                'signups': today_signups
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

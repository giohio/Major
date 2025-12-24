"""
Admin routes for plan management
"""

from flask import Blueprint, request, jsonify
from app.middleware.role_middleware import admin_required
from app.models.models import Plan, Payment, User
from app.extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func

admin_plan_bp = Blueprint('admin_plans', __name__, url_prefix='/api/admin/plans')


@admin_plan_bp.route('/', methods=['GET'])
@admin_required
def get_all_plans(current_user):
    """Get all plans including inactive ones"""
    try:
        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
        user_type = request.args.get('user_type')
        
        query = Plan.query
        
        if not include_inactive:
            query = query.filter_by(is_active=True)
        
        if user_type:
            query = query.filter_by(user_type=user_type)
        
        plans = query.order_by(Plan.created_at.desc()).all()
        
        # Get subscriber count for each plan
        results = []
        for plan in plans:
            plan_data = plan.to_dict()
            
            # Count active subscribers
            subscriber_count = User.query.filter_by(
                subscription_plan=plan.name,
                subscription_status='active'
            ).count()
            
            # Get total revenue
            total_revenue = db.session.query(func.sum(Payment.amount)).filter(
                Payment.plan_id == plan.id,
                Payment.payment_status == 'completed'
            ).scalar() or 0
            
            plan_data['subscriber_count'] = subscriber_count
            plan_data['total_revenue'] = float(total_revenue)
            
            results.append(plan_data)
        
        return jsonify({'plans': results}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_plan_bp.route('/', methods=['POST'])
@admin_required
def create_plan(current_user):
    """Create a new plan"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'user_type', 'price_monthly']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if plan name already exists
        existing_plan = Plan.query.filter_by(name=data['name']).first()
        if existing_plan:
            return jsonify({'error': 'Plan name already exists'}), 409
        
        # Create plan
        plan = Plan(
            name=data['name'],
            description=data.get('description', ''),
            user_type=data['user_type'],
            price_monthly=data['price_monthly'],
            price_yearly=data.get('price_yearly', data['price_monthly'] * 10),
            chat_limit=data.get('chat_limit', -1),
            voice_enabled=data.get('voice_enabled', False),
            video_enabled=data.get('video_enabled', False),
            empathy_layer_enabled=data.get('empathy_layer_enabled', False),
            doctor_access=data.get('doctor_access', False),
            priority_support=data.get('priority_support', False),
            max_patients=data.get('max_patients', 0),
            can_assign_plans=data.get('can_assign_plans', False),
            analytics_access=data.get('analytics_access', False),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(plan)
        db.session.commit()
        
        return jsonify({
            'message': 'Plan created successfully',
            'plan': plan.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_plan_bp.route('/<int:plan_id>', methods=['PUT'])
@admin_required
def update_plan(current_user, plan_id):
    """Update an existing plan"""
    try:
        plan = db.session.get(Plan, plan_id)
        
        if not plan:
            return jsonify({'error': 'Plan not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        updateable_fields = [
            'name', 'description', 'price_monthly', 'price_yearly',
            'chat_limit', 'voice_enabled', 'video_enabled',
            'empathy_layer_enabled', 'doctor_access', 'priority_support',
            'max_patients', 'can_assign_plans', 'analytics_access', 'is_active'
        ]
        
        for field in updateable_fields:
            if field in data:
                setattr(plan, field, data[field])
        
        plan.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Plan updated successfully',
            'plan': plan.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_plan_bp.route('/<int:plan_id>', methods=['DELETE'])
@admin_required
def delete_plan(current_user, plan_id):
    """Soft delete a plan"""
    try:
        plan = db.session.get(Plan, plan_id)
        
        if not plan:
            return jsonify({'error': 'Plan not found'}), 404
        
        # Check if any active subscribers
        active_subscribers = User.query.filter_by(
            subscription_plan=plan.name,
            subscription_status='active'
        ).count()
        
        if active_subscribers > 0:
            return jsonify({
                'error': f'Cannot delete plan with {active_subscribers} active subscribers',
                'active_subscribers': active_subscribers
            }), 409
        
        # Soft delete
        plan.is_active = False
        plan.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Plan deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_plan_bp.route('/<int:plan_id>/subscribers', methods=['GET'])
@admin_required
def get_plan_subscribers(current_user, plan_id):
    """Get list of users subscribed to a specific plan"""
    try:
        plan = db.session.get(Plan, plan_id)
        
        if not plan:
            return jsonify({'error': 'Plan not found'}), 404
        
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status = request.args.get('status')  # active, expired, cancelled
        
        query = User.query.filter_by(subscription_plan=plan.name)
        
        if status:
            query = query.filter_by(subscription_status=status)
        
        pagination = query.order_by(User.subscription_start_date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        subscribers = []
        for user in pagination.items:
            subscribers.append({
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'role': user.role,
                'subscription_status': user.subscription_status,
                'subscription_start_date': user.subscription_start_date.isoformat() if user.subscription_start_date else None,
                'subscription_end_date': user.subscription_end_date.isoformat() if user.subscription_end_date else None
            })
        
        return jsonify({
            'plan': plan.to_dict(),
            'subscribers': subscribers,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_plan_bp.route('/statistics', methods=['GET'])
@admin_required
def get_plan_statistics(current_user):
    """Get overall plan statistics"""
    try:
        # Total plans
        total_plans = Plan.query.filter_by(is_active=True).count()
        
        # Total subscribers by status
        active_subscribers = User.query.filter_by(subscription_status='active').count()
        expired_subscribers = User.query.filter_by(subscription_status='expired').count()
        cancelled_subscribers = User.query.filter_by(subscription_status='cancelled').count()
        
        # Revenue by plan
        revenue_by_plan = db.session.query(
            Plan.name,
            func.sum(Payment.amount).label('revenue')
        ).join(Payment, Payment.plan_id == Plan.id).filter(
            Payment.payment_status == 'completed'
        ).group_by(Plan.name).all()
        
        # Total revenue
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.payment_status == 'completed'
        ).scalar() or 0
        
        # Subscribers by plan
        subscribers_by_plan = db.session.query(
            User.subscription_plan,
            func.count(User.id).label('count')
        ).filter(
            User.subscription_status == 'active'
        ).group_by(User.subscription_plan).all()
        
        # Recent subscriptions (last 30 days)
        from datetime import timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_subscriptions = User.query.filter(
            User.subscription_start_date >= thirty_days_ago,
            User.subscription_status == 'active'
        ).count()
        
        return jsonify({
            'total_plans': total_plans,
            'subscribers': {
                'active': active_subscribers,
                'expired': expired_subscribers,
                'cancelled': cancelled_subscribers,
                'total': active_subscribers + expired_subscribers + cancelled_subscribers
            },
            'revenue': {
                'total': float(total_revenue),
                'by_plan': {name: float(revenue) for name, revenue in revenue_by_plan}
            },
            'subscribers_by_plan': {plan: count for plan, count in subscribers_by_plan},
            'recent_subscriptions': recent_subscriptions
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_plan_bp.route('/payments', methods=['GET'])
@admin_required
def get_all_payments(current_user):
    """Get all payment transactions"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        status = request.args.get('status')  # pending, completed, failed
        method = request.args.get('method')  # vnpay, momo, zalopay
        
        query = Payment.query
        
        if status:
            query = query.filter_by(payment_status=status)
        
        if method:
            query = query.filter_by(payment_method=method)
        
        pagination = query.order_by(Payment.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        payments = []
        for payment in pagination.items:
            payment_data = payment.to_dict()
            
            # Add user info
            if payment.user:
                payment_data['user_name'] = payment.user.full_name
                payment_data['user_email'] = payment.user.email
            
            # Add plan info
            if payment.plan:
                payment_data['plan_name'] = payment.plan.name
            
            payments.append(payment_data)
        
        return jsonify({
            'payments': payments,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_plan_bp.route('/assign-plan', methods=['POST'])
@admin_required
def assign_plan_to_user(current_user):
    """Manually assign a plan to a user (free trial, gift, etc.)"""
    try:
        data = request.get_json()
        
        if 'user_id' not in data or 'plan_id' not in data:
            return jsonify({'error': 'user_id and plan_id are required'}), 400
        
        user = db.session.get(User, data['user_id'])
        plan = db.session.get(Plan, data['plan_id'])
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not plan:
            return jsonify({'error': 'Plan not found'}), 404
        
        # Get duration
        duration_days = data.get('duration_days', 30)
        
        # Update user subscription
        user.subscription_plan = plan.name
        user.subscription_status = 'active'
        user.subscription_start_date = datetime.utcnow()
        user.subscription_end_date = datetime.utcnow() + timedelta(days=duration_days)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Plan {plan.name} assigned to {user.full_name}',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

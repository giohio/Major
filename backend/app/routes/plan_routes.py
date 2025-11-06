from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.models import Plan
from app.middleware.auth_middleware import token_required
from app.middleware.role_middleware import admin_required

bp = Blueprint('plans', __name__)

@bp.route('/', methods=['GET'])
def get_plans():
    """Get all available plans"""
    try:
        user_type = request.args.get('user_type')  # Filter by user or doctor
        
        query = Plan.query.filter_by(is_active=True)
        
        if user_type:
            query = query.filter_by(user_type=user_type)
        
        plans = query.all()
        
        return jsonify({
            'plans': [plan.to_dict() for plan in plans]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    """Get specific plan details"""
    try:
        from app.extensions import db
        plan = db.session.get(Plan, plan_id)
        
        if not plan:
            return jsonify({'error': 'Plan not found'}), 404
        
        return jsonify(plan.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/current', methods=['GET'])
@token_required
def get_current_plan(current_user):
    """Get user's current plan"""
    try:
        plan = Plan.query.filter_by(name=current_user.subscription_plan).first()
        
        if not plan:
            return jsonify({'error': 'Plan not found'}), 404
        
        return jsonify({
            'plan': plan.to_dict(),
            'subscription_status': current_user.subscription_status,
            'start_date': current_user.subscription_start_date.isoformat() if current_user.subscription_start_date else None,
            'end_date': current_user.subscription_end_date.isoformat() if current_user.subscription_end_date else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/subscribe', methods=['POST'])
@token_required
def subscribe(current_user):
    """Subscribe to a plan (creates payment intent)"""
    try:
        data = request.get_json()
        
        if 'plan_id' not in data:
            return jsonify({'error': 'Plan ID is required'}), 400
        
        from app.extensions import db
        plan = db.session.get(Plan, data['plan_id'])
        
        if not plan or not plan.is_active:
            return jsonify({'error': 'Invalid plan'}), 404
        
        # Check if user type matches plan
        if plan.user_type == 'doctor' and current_user.role != 'doctor':
            return jsonify({'error': 'This plan is only available for doctors'}), 403
        
        billing_cycle = data.get('billing_cycle', 'monthly')
        payment_method = data.get('payment_method', 'vnpay')
        
        # Create payment
        from app.services.payment_service import PaymentService
        
        payment = PaymentService.create_payment(
            user_id=current_user.id,
            plan_id=plan.id,
            billing_cycle=billing_cycle,
            payment_method=payment_method
        )
        
        # Generate payment URL
        # This would generate actual payment gateway URL in production
        payment_url = f"/payment/{payment.id}"
        
        return jsonify({
            'message': 'Payment created',
            'payment': payment.to_dict(),
            'payment_url': payment_url
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/', methods=['POST'])
@admin_required
def create_plan(current_user):
    """Create a new plan (Admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'user_type', 'price_monthly']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        from app.extensions import db
        
        plan = Plan(
            name=data['name'],
            description=data.get('description'),
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
            is_active=True
        )
        
        db.session.add(plan)
        db.session.commit()
        
        return jsonify({
            'message': 'Plan created successfully',
            'plan': plan.to_dict()
        }), 201
        
    except Exception as e:
        from app.extensions import db
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:plan_id>', methods=['PUT'])
@admin_required
def update_plan(current_user, plan_id):
    """Update a plan (Admin only)"""
    try:
        from app.extensions import db
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
        
        from datetime import datetime
        plan.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Plan updated successfully',
            'plan': plan.to_dict()
        }), 200
        
    except Exception as e:
        from app.extensions import db
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

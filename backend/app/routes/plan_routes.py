from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.models import Plan
from app.middleware.auth_middleware import token_required
from app.middleware.role_middleware import admin_required

bp = Blueprint('plans', __name__)

@bp.route('', methods=['GET'])
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
        from flask import current_app
        
        payment = PaymentService.create_payment(
            user_id=current_user.id,
            plan_id=plan.id,
            billing_cycle=billing_cycle,
            payment_method=payment_method
        )
        
        # Generate payment URL
        if payment_method == 'vnpay':
            return_url = current_app.config.get('FRONTEND_URL', 'http://localhost:5173') + '/payment-result'
            vnp_url = current_app.config.get('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html')
            vnp_tmn_code = current_app.config.get('VNPAY_TMN_CODE', '')
            vnp_hash_secret = current_app.config.get('VNPAY_HASH_SECRET', '')
            
            # Check if VNPay is configured
            if not vnp_tmn_code or not vnp_hash_secret:
                return jsonify({
                    'error': 'Hệ thống thanh toán chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
                    'payment': payment.to_dict()
                }), 503
            
            payment_url = PaymentService.generate_vnpay_payment_url(
                payment, return_url, vnp_url, vnp_tmn_code, vnp_hash_secret
            )
        else:
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


@bp.route('/<int:plan_id>', methods=['DELETE'])
@admin_required
def delete_plan(current_user, plan_id):
    """Delete a plan (Admin only)"""
    try:
        from app.extensions import db
        plan = db.session.get(Plan, plan_id)
        
        if not plan:
            return jsonify({'error': 'Plan not found'}), 404
        
        # Soft delete - just mark as inactive
        plan.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Plan deleted successfully'}), 200
        
    except Exception as e:
        from app.extensions import db
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/history', methods=['GET'])
@token_required
def get_subscription_history(current_user):
    """Get user's subscription history"""
    try:
        from app.extensions import db
        from app.models.models import Payment
        
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        pagination = Payment.query.filter_by(user_id=current_user.id).order_by(
            Payment.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        payments = []
        for payment in pagination.items:
            payment_data = payment.to_dict()
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


@bp.route('/cancel', methods=['POST'])
@token_required
def cancel_subscription(current_user):
    """Cancel current subscription"""
    try:
        # Check if user has active subscription (plan ID 9 is Free)
        if not current_user.subscription_plan or current_user.subscription_plan == 9:
            return jsonify({'error': 'No active subscription to cancel'}), 400
        
        from app.services.payment_service import PaymentService
        success = PaymentService.cancel_subscription(current_user.id)
        
        if success:
            return jsonify({
                'message': 'Subscription cancelled successfully',
                'note': 'Your subscription will remain active until the end date'
            }), 200
        else:
            return jsonify({'error': 'Failed to cancel subscription'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/compare', methods=['GET'])
def compare_plans():
    """Get plan comparison data"""
    try:
        user_type = request.args.get('user_type', 'user')
        
        plans = Plan.query.filter_by(is_active=True, user_type=user_type).all()
        
        comparison = []
        for plan in plans:
            comparison.append({
                'id': plan.id,
                'name': plan.name,
                'price_monthly': float(plan.price_monthly),
                'price_yearly': float(plan.price_yearly),
                'features': {
                    'chat_limit': plan.chat_limit,
                    'voice_enabled': plan.voice_enabled,
                    'video_enabled': plan.video_enabled,
                    'empathy_layer': plan.empathy_layer_enabled,
                    'doctor_access': plan.doctor_access,
                    'priority_support': plan.priority_support,
                    'max_patients': plan.max_patients if user_type == 'doctor' else None,
                    'analytics_access': plan.analytics_access if user_type == 'doctor' else None
                }
            })
        
        return jsonify({'plans': comparison}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

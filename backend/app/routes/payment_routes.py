"""
Payment routes for handling payments and subscriptions
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.models.models import User, Payment, Plan
from app.extensions import db
from app.services.payment_service import PaymentService
from app.schemas.payment_schemas import (
    CreatePaymentSchema,
    VerifyPaymentSchema,
    RefundPaymentSchema
)

payment_bp = Blueprint('payment', __name__, url_prefix='/api/payment')
payment_service = PaymentService()

# Initialize schemas
create_payment_schema = CreatePaymentSchema()
verify_payment_schema = VerifyPaymentSchema()
refund_payment_schema = RefundPaymentSchema()


@payment_bp.route('/create', methods=['POST'])
@jwt_required()
def create_payment():
    """
    Create a new payment
    
    Request body:
    {
        "amount": "99000",
        "payment_method": "vnpay",
        "payment_type": "subscription",
        "plan_id": 1,
        "description": "Pro plan subscription",
        "return_url": "http://localhost:3000/payment/callback"
    }
    """
    try:
        # Validate request data
        data = create_payment_schema.load(request.json)
        
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check plan exists if subscription payment
        if data['payment_type'] == 'subscription' and data.get('plan_id'):
            plan = Plan.query.get(data['plan_id'])
            if not plan:
                return jsonify({'error': 'Plan not found'}), 404
        
        # Create payment record
        payment = Payment(
            user_id=user_id,
            amount=float(data['amount']),
            payment_method=data['payment_method'],
            payment_type=data['payment_type'],
            plan_id=data.get('plan_id'),
            description=data.get('description', ''),
            status='pending'
        )
        
        db.session.add(payment)
        db.session.commit()
        
        # Generate payment URL based on method
        payment_url = None
        if data['payment_method'] == 'vnpay':
            payment_url = payment_service.create_vnpay_payment(
                payment_id=payment.id,
                amount=float(data['amount']),
                description=data.get('description', 'Payment'),
                return_url=data.get('return_url', f"{current_app.config.get('FRONTEND_URL')}/payment/callback")
            )
        elif data['payment_method'] == 'stripe':
            # TODO: Implement Stripe payment
            pass
        
        return jsonify({
            'message': 'Payment created successfully',
            'payment': payment.to_dict(),
            'payment_url': payment_url
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_payment():
    """
    Verify payment callback
    
    Request body (VNPay):
    {
        "transaction_id": "PAY123",
        "payment_method": "vnpay",
        "vnp_ResponseCode": "00",
        "vnp_TransactionNo": "123456",
        "vnp_SecureHash": "hash..."
    }
    """
    try:
        data = verify_payment_schema.load(request.json)
        
        user_id = get_jwt_identity()
        
        # Verify payment based on method
        if data['payment_method'] == 'vnpay':
            result = payment_service.verify_vnpay_payment(
                vnp_response_code=data.get('vnp_ResponseCode'),
                vnp_transaction_no=data.get('vnp_TransactionNo'),
                vnp_secure_hash=data.get('vnp_SecureHash'),
                transaction_id=data['transaction_id']
            )
            
            if result['success']:
                # Update payment status
                payment = Payment.query.filter_by(
                    transaction_id=data['transaction_id']
                ).first()
                
                if payment:
                    payment.status = 'completed'
                    payment.paid_at = db.func.now()
                    
                    # If subscription payment, activate subscription
                    if payment.payment_type == 'subscription' and payment.plan_id:
                        success = payment_service.activate_subscription(
                            user_id=payment.user_id,
                            plan_id=payment.plan_id
                        )
                        
                        if not success:
                            return jsonify({'error': 'Failed to activate subscription'}), 500
                    
                    db.session.commit()
                    
                    return jsonify({
                        'message': 'Payment verified successfully',
                        'payment': payment.to_dict()
                    }), 200
            else:
                return jsonify({
                    'error': 'Payment verification failed',
                    'details': result.get('message')
                }), 400
        
        return jsonify({'error': 'Unsupported payment method'}), 400
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    """
    Get user's payment history
    
    Query params:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20)
    - status: Filter by status (optional)
    """
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', None)
        
        query = Payment.query.filter_by(user_id=user_id)
        
        if status:
            query = query.filter_by(status=status)
        
        query = query.order_by(Payment.created_at.desc())
        
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'payments': [p.to_dict() for p in paginated.items],
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    """Get payment details"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        payment = Payment.query.get(payment_id)
        
        if not payment:
            return jsonify({'error': 'Payment not found'}), 404
        
        # Check permission
        if payment.user_id != user_id and user.role != 'admin':
            return jsonify({'error': 'Permission denied'}), 403
        
        return jsonify(payment.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/<int:payment_id>/refund', methods=['POST'])
@jwt_required()
def refund_payment(payment_id):
    """
    Refund a payment (admin only)
    
    Request body:
    {
        "payment_id": 1,
        "amount": "99000",  # Optional, full refund if not provided
        "reason": "Customer requested refund"
    }
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Admin only
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = refund_payment_schema.load(request.json)
        
        payment = Payment.query.get(payment_id)
        
        if not payment:
            return jsonify({'error': 'Payment not found'}), 404
        
        if payment.status != 'completed':
            return jsonify({'error': 'Only completed payments can be refunded'}), 400
        
        # Process refund
        refund_amount = float(data.get('amount', payment.amount))
        
        if refund_amount > payment.amount:
            return jsonify({'error': 'Refund amount exceeds payment amount'}), 400
        
        # Update payment status
        payment.status = 'refunded'
        payment.refund_amount = refund_amount
        payment.refund_reason = data['reason']
        payment.refunded_at = db.func.now()
        
        # If subscription payment, cancel subscription
        if payment.payment_type == 'subscription':
            user_to_refund = User.query.get(payment.user_id)
            if user_to_refund:
                user_to_refund.subscription_status = 'cancelled'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Payment refunded successfully',
            'payment': payment.to_dict()
        }), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_payment_stats():
    """
    Get payment statistics (admin only)
    
    Query params:
    - start_date: Start date (YYYY-MM-DD)
    - end_date: End date (YYYY-MM-DD)
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Admin only
        if user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        from datetime import datetime, timedelta
        from sqlalchemy import func
        
        # Default to last 30 days
        end_date = request.args.get('end_date', datetime.now().strftime('%Y-%m-%d'))
        start_date = request.args.get('start_date', (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
        
        # Parse dates
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        
        # Total revenue
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.status == 'completed',
            Payment.created_at >= start,
            Payment.created_at <= end
        ).scalar() or 0
        
        # Payment counts by status
        payment_counts = db.session.query(
            Payment.status,
            func.count(Payment.id)
        ).filter(
            Payment.created_at >= start,
            Payment.created_at <= end
        ).group_by(Payment.status).all()
        
        # Revenue by payment method
        revenue_by_method = db.session.query(
            Payment.payment_method,
            func.sum(Payment.amount)
        ).filter(
            Payment.status == 'completed',
            Payment.created_at >= start,
            Payment.created_at <= end
        ).group_by(Payment.payment_method).all()
        
        return jsonify({
            'total_revenue': float(total_revenue),
            'payment_counts': {status: count for status, count in payment_counts},
            'revenue_by_method': {method: float(amount) for method, amount in revenue_by_method},
            'period': {
                'start_date': start_date,
                'end_date': end_date
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

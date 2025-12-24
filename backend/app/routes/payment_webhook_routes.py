"""
Payment webhook routes for auto-confirmation
Handles callbacks from VNPay, MoMo, ZaloPay
"""

from flask import Blueprint, request, jsonify, current_app
from app.services.payment_service import PaymentService
from app.models.models import Payment
from app.extensions import db
import json
import os

webhook_bp = Blueprint('payment_webhook', __name__, url_prefix='/api/webhook')


@webhook_bp.route('/vnpay/verify', methods=['POST'])
def vnpay_verify():
    """
    Verify and process VNPay payment from frontend
    Frontend sends callback params after redirect
    """
    try:
        data = request.json
        vnp_params = data.get('params', {})
        
        if not vnp_params:
            return jsonify({
                'success': False,
                'message': 'Missing payment parameters'
            }), 400
        
        # Get VNPay secret from environment
        vnp_hash_secret = os.environ.get('VNPAY_HASH_SECRET', '')
        
        if not vnp_hash_secret:
            current_app.logger.error('VNPAY_HASH_SECRET not configured in environment')
            return jsonify({
                'success': False,
                'message': 'Payment gateway not configured'
            }), 500
        
        # Verify signature
        is_valid = PaymentService.verify_vnpay_callback(vnp_params.copy(), vnp_hash_secret)
        
        if not is_valid:
            return jsonify({
                'success': False,
                'message': 'Invalid payment signature'
            }), 400
        
        # Get payment info
        payment_id = vnp_params.get('vnp_TxnRef')
        response_code = vnp_params.get('vnp_ResponseCode')
        transaction_id = vnp_params.get('vnp_TransactionNo')
        
        # Process payment
        status = 'completed' if response_code == '00' else 'failed'
        success = PaymentService.process_payment_callback(
            payment_id=payment_id,
            transaction_id=transaction_id,
            status=status,
            gateway_response=vnp_params
        )
        
        if success:
            # Get updated payment and related info
            payment = db.session.get(Payment, payment_id)
            appointment_info = None
            subscription_info = None
            
            if payment:
                if payment.payment_type == 'appointment':
                    from app.models.models import Appointment
                    appointment = Appointment.query.filter_by(payment_id=payment.id).first()
                    if appointment:
                        appointment_info = {
                            'id': appointment.id,
                            'status': appointment.status,
                            'appointment_date': appointment.appointment_date.isoformat()
                        }
                elif payment.payment_type == 'subscription':
                    from app.models.models import User, Plan
                    user = db.session.get(User, payment.user_id)
                    if user and user.subscription_plan:
                        plan = db.session.get(Plan, user.subscription_plan)
                        if plan:
                            subscription_info = {
                                'plan_name': plan.name,
                                'plan_id': plan.id,
                                'status': user.subscription_status,
                                'start_date': user.subscription_start_date.isoformat() if user.subscription_start_date else None,
                                'end_date': user.subscription_end_date.isoformat() if user.subscription_end_date else None
                            }
            
            return jsonify({
                'success': True,
                'message': 'Payment verified successfully',
                'payment_status': status,
                'payment_type': payment.payment_type if payment else None,
                'appointment': appointment_info,
                'subscription': subscription_info
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to process payment'
            }), 500
        
    except Exception as e:
        current_app.logger.error(f"VNPay verify error: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@webhook_bp.route('/vnpay', methods=['GET'])
def vnpay_return():
    """
    VNPay return URL handler
    User is redirected here after payment
    """
    try:
        vnp_params = request.args.to_dict()
        
        # Verify signature
        vnp_hash_secret = current_app.config.get('VNPAY_HASH_SECRET')
        is_valid = PaymentService.verify_vnpay_callback(vnp_params.copy(), vnp_hash_secret)
        
        if not is_valid:
            return jsonify({
                'success': False,
                'message': 'Invalid signature'
            }), 400
        
        # Get payment info
        payment_id = vnp_params.get('vnp_TxnRef')
        response_code = vnp_params.get('vnp_ResponseCode')
        transaction_id = vnp_params.get('vnp_TransactionNo')
        
        # Process payment
        status = 'completed' if response_code == '00' else 'failed'
        success = PaymentService.process_payment_callback(
            payment_id=payment_id,
            transaction_id=transaction_id,
            status=status,
            gateway_response=vnp_params
        )
        
        if success and status == 'completed':
            # Redirect to success page
            frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
            return f'''
                <html>
                <head>
                    <meta http-equiv="refresh" content="3;url={frontend_url}/payment/success?payment_id={payment_id}">
                </head>
                <body>
                    <h2>✅ Payment Successful!</h2>
                    <p>Redirecting...</p>
                </body>
                </html>
            '''
        else:
            frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
            return f'''
                <html>
                <head>
                    <meta http-equiv="refresh" content="3;url={frontend_url}/payment/failed?payment_id={payment_id}">
                </head>
                <body>
                    <h2>❌ Payment Failed</h2>
                    <p>Redirecting...</p>
                </body>
                </html>
            '''
        
    except Exception as e:
        current_app.logger.error(f"VNPay callback error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@webhook_bp.route('/vnpay/ipn', methods=['POST'])
def vnpay_ipn():
    """
    VNPay IPN (Instant Payment Notification)
    VNPay sends this for payment confirmation
    """
    try:
        vnp_params = request.args.to_dict()
        
        # Verify signature
        vnp_hash_secret = current_app.config.get('VNPAY_HASH_SECRET')
        is_valid = PaymentService.verify_vnpay_callback(vnp_params.copy(), vnp_hash_secret)
        
        if not is_valid:
            return jsonify({'RspCode': '97', 'Message': 'Invalid signature'}), 200
        
        payment_id = vnp_params.get('vnp_TxnRef')
        response_code = vnp_params.get('vnp_ResponseCode')
        transaction_id = vnp_params.get('vnp_TransactionNo')
        
        # Check payment exists
        payment = db.session.get(Payment, payment_id)
        if not payment:
            return jsonify({'RspCode': '01', 'Message': 'Order not found'}), 200
        
        # Check if already processed
        if payment.payment_status != 'pending':
            return jsonify({'RspCode': '02', 'Message': 'Order already confirmed'}), 200
        
        # Process payment
        status = 'completed' if response_code == '00' else 'failed'
        success = PaymentService.process_payment_callback(
            payment_id=payment_id,
            transaction_id=transaction_id,
            status=status,
            gateway_response=vnp_params
        )
        
        if success:
            return jsonify({'RspCode': '00', 'Message': 'Confirm Success'}), 200
        else:
            return jsonify({'RspCode': '99', 'Message': 'Unknown error'}), 200
        
    except Exception as e:
        current_app.logger.error(f"VNPay IPN error: {str(e)}")
        return jsonify({'RspCode': '99', 'Message': str(e)}), 200


@webhook_bp.route('/momo/notify', methods=['POST'])
def momo_notify():
    """
    MoMo IPN notification
    MoMo sends POST request with payment result
    """
    try:
        callback_data = request.json
        
        # Verify signature
        secret_key = current_app.config.get('MOMO_SECRET_KEY')
        is_valid = PaymentService.verify_momo_callback(callback_data.copy(), secret_key)
        
        if not is_valid:
            return jsonify({'resultCode': 97, 'message': 'Invalid signature'}), 200
        
        # Extract payment info
        order_id = callback_data.get('orderId')
        result_code = callback_data.get('resultCode')
        trans_id = callback_data.get('transId')
        
        # Parse payment_id from order_id (format: MOMO_<payment_id>_<timestamp>)
        payment_id = order_id.split('_')[1] if '_' in order_id else None
        
        if not payment_id:
            return jsonify({'resultCode': 1, 'message': 'Invalid order ID'}), 200
        
        # Process payment
        status = 'completed' if result_code == 0 else 'failed'
        success = PaymentService.process_payment_callback(
            payment_id=payment_id,
            transaction_id=str(trans_id),
            status=status,
            gateway_response=callback_data
        )
        
        if success:
            return jsonify({'resultCode': 0, 'message': 'Success'}), 200
        else:
            return jsonify({'resultCode': 99, 'message': 'Processing error'}), 200
        
    except Exception as e:
        current_app.logger.error(f"MoMo notify error: {str(e)}")
        return jsonify({'resultCode': 99, 'message': str(e)}), 200


@webhook_bp.route('/momo/return', methods=['GET', 'POST'])
def momo_return():
    """
    MoMo return URL
    User is redirected here after payment
    """
    try:
        if request.method == 'POST':
            callback_data = request.json
        else:
            callback_data = request.args.to_dict()
        
        order_id = callback_data.get('orderId')
        result_code = callback_data.get('resultCode')
        
        # Parse payment_id
        payment_id = order_id.split('_')[1] if '_' in order_id else None
        
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        
        if result_code == '0':
            return f'''
                <html>
                <head>
                    <meta http-equiv="refresh" content="3;url={frontend_url}/payment/success?payment_id={payment_id}">
                </head>
                <body>
                    <h2>✅ Payment Successful!</h2>
                    <p>Redirecting...</p>
                </body>
                </html>
            '''
        else:
            return f'''
                <html>
                <head>
                    <meta http-equiv="refresh" content="3;url={frontend_url}/payment/failed?payment_id={payment_id}">
                </head>
                <body>
                    <h2>❌ Payment Failed</h2>
                    <p>Redirecting...</p>
                </body>
                </html>
            '''
        
    except Exception as e:
        current_app.logger.error(f"MoMo return error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@webhook_bp.route('/zalopay/callback', methods=['POST'])
def zalopay_callback():
    """
    ZaloPay callback endpoint
    ZaloPay sends POST request with payment result
    """
    try:
        callback_data = request.json
        
        # Verify MAC
        key2 = current_app.config.get('ZALOPAY_KEY2')
        is_valid = PaymentService.verify_zalopay_callback(callback_data, key2)
        
        if not is_valid:
            return jsonify({'return_code': -1, 'return_message': 'Invalid MAC'}), 200
        
        # Parse data
        data = json.loads(callback_data.get('data', '{}'))
        app_trans_id = data.get('app_trans_id', '')
        
        # Extract payment_id from app_trans_id (format: YYMMDD_<payment_id>_<timestamp>)
        parts = app_trans_id.split('_')
        payment_id = parts[1] if len(parts) >= 3 else None
        
        if not payment_id:
            return jsonify({'return_code': 1, 'return_message': 'Invalid transaction ID'}), 200
        
        # Process payment
        success = PaymentService.process_payment_callback(
            payment_id=payment_id,
            transaction_id=app_trans_id,
            status='completed',
            gateway_response=data
        )
        
        if success:
            return jsonify({'return_code': 1, 'return_message': 'Success'}), 200
        else:
            return jsonify({'return_code': 0, 'return_message': 'Processing error'}), 200
        
    except Exception as e:
        current_app.logger.error(f"ZaloPay callback error: {str(e)}")
        return jsonify({'return_code': 0, 'return_message': str(e)}), 200


@webhook_bp.route('/zalopay/return', methods=['GET'])
def zalopay_return():
    """
    ZaloPay return URL
    User is redirected here after payment
    """
    try:
        apptransid = request.args.get('apptransid')
        status = request.args.get('status')
        
        # Extract payment_id
        parts = apptransid.split('_') if apptransid else []
        payment_id = parts[1] if len(parts) >= 3 else None
        
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
        
        if status == '1':
            return f'''
                <html>
                <head>
                    <meta http-equiv="refresh" content="3;url={frontend_url}/payment/success?payment_id={payment_id}">
                </head>
                <body>
                    <h2>✅ Payment Successful!</h2>
                    <p>Redirecting...</p>
                </body>
                </html>
            '''
        else:
            return f'''
                <html>
                <head>
                    <meta http-equiv="refresh" content="3;url={frontend_url}/payment/failed?payment_id={payment_id}">
                </head>
                <body>
                    <h2>❌ Payment Failed</h2>
                    <p>Redirecting...</p>
                </body>
                </html>
            '''
        
    except Exception as e:
        current_app.logger.error(f"ZaloPay return error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@webhook_bp.route('/payment-status/<int:payment_id>', methods=['GET'])
def check_payment_status(payment_id):
    """
    Check payment status
    Frontend can poll this endpoint
    """
    try:
        payment = db.session.get(Payment, payment_id)
        
        if not payment:
            return jsonify({'error': 'Payment not found'}), 404
        
        return jsonify({
            'payment_id': payment.id,
            'status': payment.payment_status,
            'amount': float(payment.amount),
            'payment_method': payment.payment_method,
            'created_at': payment.created_at.isoformat(),
            'completed_at': payment.completed_at.isoformat() if payment.completed_at else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

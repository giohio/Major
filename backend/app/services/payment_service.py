# ========================================
# PAYMENT SERVICE WITH QR CODE INTEGRATION
# ========================================
"""
Enhanced Payment Service with:
- VNPay integration
- MoMo QR payment
- ZaloPay integration
- Automatic webhook handling
"""

from app.models.models import Payment, User, Plan
from app.extensions import db
from datetime import datetime, timedelta
import hashlib
import hmac
import urllib.parse
import requests
import json
import uuid
import os


class PaymentService:
    """Service for handling payment processing"""
    
    @staticmethod
    def create_payment(user_id, plan_id, billing_cycle='monthly', payment_method='vnpay'):
        """Create a new payment record"""
        try:
            plan = db.session.get(Plan, plan_id)
            if not plan:
                raise ValueError("Plan not found")
            
            # Calculate amount
            amount = plan.price_yearly if billing_cycle == 'yearly' else plan.price_monthly
            
            # Create payment record
            payment = Payment(
                user_id=user_id,
                plan_id=plan_id,
                amount=amount,
                currency='VND',
                payment_method=payment_method,
                payment_status='pending',
                billing_cycle=billing_cycle,
                created_at=datetime.utcnow()
            )
            
            db.session.add(payment)
            db.session.commit()
            
            return payment
            
        except Exception as e:
            db.session.rollback()
            raise
    
    @staticmethod
    def generate_vnpay_payment_url(payment, return_url, vnp_url, vnp_tmn_code, vnp_hash_secret):
        """Generate VNPay payment URL"""
        # Generate order info based on payment type
        if payment.plan_id:
            order_info = f'Thanh toan goi {payment.plan.name} - Ma {payment.id}'
        else:
            order_info = f'Thanh toan lich hen - Ma {payment.id}'
        
        vnp_params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': vnp_tmn_code,
            'vnp_Amount': int(float(payment.amount) * 100),
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': str(payment.id),
            'vnp_OrderInfo': order_info,
            'vnp_OrderType': 'billpayment',
            'vnp_Locale': 'vn',
            'vnp_ReturnUrl': return_url,
            'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
            'vnp_IpAddr': '127.0.0.1'
        }
        
        # Sort parameters for signature
        sorted_params = sorted(vnp_params.items())
        
        # Build hash data with URL encoding for signature
        hash_data = '&'.join([f'{k}={urllib.parse.quote_plus(str(v))}' for k, v in sorted_params])
        
        # Calculate secure hash
        secure_hash = hmac.new(
            vnp_hash_secret.encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        # Build final URL
        return f"{vnp_url}?{hash_data}&vnp_SecureHash={secure_hash}"
    
    @staticmethod
    def verify_vnpay_callback(vnp_params, vnp_hash_secret):
        """Verify VNPay callback signature"""
        vnp_secure_hash = vnp_params.pop('vnp_SecureHash', None)
        if not vnp_secure_hash:
            return False
        
        # Sort parameters
        sorted_params = sorted(vnp_params.items())
        
        # Build hash data with URL encoding (must match generation)
        hash_data = '&'.join([f'{k}={urllib.parse.quote_plus(str(v))}' for k, v in sorted_params])
        
        # Calculate hash
        calculated_hash = hmac.new(
            vnp_hash_secret.encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        return calculated_hash.lower() == vnp_secure_hash.lower()
    
    @staticmethod
    def create_momo_qr_payment(payment, return_url, notify_url, momo_config):
        """
        Create MoMo QR Code payment
        Docs: https://developers.momo.vn/v3/#/docs/qr_payment
        """
        try:
            partner_code = momo_config.get('partner_code')
            access_key = momo_config.get('access_key')
            secret_key = momo_config.get('secret_key')
            endpoint = momo_config.get('endpoint')
            
            order_id = f"MOMO_{payment.id}_{int(datetime.now().timestamp())}"
            request_id = str(uuid.uuid4())
            
            raw_data = (
                f"accessKey={access_key}"
                f"&amount={int(payment.amount)}"
                f"&extraData="
                f"&ipnUrl={notify_url}"
                f"&orderId={order_id}"
                f"&orderInfo=Thanh toan goi {payment.plan.name}"
                f"&partnerCode={partner_code}"
                f"&redirectUrl={return_url}"
                f"&requestId={request_id}"
                f"&requestType=captureWallet"
            )
            
            signature = hmac.new(
                secret_key.encode('utf-8'),
                raw_data.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            payload = {
                'partnerCode': partner_code,
                'accessKey': access_key,
                'requestId': request_id,
                'amount': str(int(payment.amount)),
                'orderId': order_id,
                'orderInfo': f'Thanh toan goi {payment.plan.name}',
                'redirectUrl': return_url,
                'ipnUrl': notify_url,
                'extraData': '',
                'requestType': 'captureWallet',
                'signature': signature,
                'lang': 'vi'
            }
            
            response = requests.post(endpoint, json=payload, timeout=10)
            result = response.json()
            
            if result.get('resultCode') == 0:
                # Update payment with MoMo order ID
                payment.transaction_id = order_id
                db.session.commit()
                
                return {
                    'payment_url': result.get('payUrl'),
                    'qr_code_url': result.get('qrCodeUrl'),
                    'deeplink': result.get('deeplink')
                }
            else:
                raise Exception(f"MoMo Error: {result.get('message')}")
                
        except Exception as e:
            print(f"Error creating MoMo payment: {str(e)}")
            raise
    
    @staticmethod
    def verify_momo_callback(callback_data, secret_key):
        """Verify MoMo IPN callback"""
        signature = callback_data.pop('signature', None)
        if not signature:
            return False
        
        # Build raw signature
        raw_data = (
            f"accessKey={callback_data.get('accessKey')}"
            f"&amount={callback_data.get('amount')}"
            f"&extraData={callback_data.get('extraData')}"
            f"&message={callback_data.get('message')}"
            f"&orderId={callback_data.get('orderId')}"
            f"&orderInfo={callback_data.get('orderInfo')}"
            f"&orderType={callback_data.get('orderType')}"
            f"&partnerCode={callback_data.get('partnerCode')}"
            f"&payType={callback_data.get('payType')}"
            f"&requestId={callback_data.get('requestId')}"
            f"&responseTime={callback_data.get('responseTime')}"
            f"&resultCode={callback_data.get('resultCode')}"
            f"&transId={callback_data.get('transId')}"
        )
        
        calculated_signature = hmac.new(
            secret_key.encode('utf-8'),
            raw_data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return calculated_signature == signature
    
    @staticmethod
    def create_zalopay_payment(payment, notify_url, zalopay_config):
        """
        Create ZaloPay payment
        Docs: https://docs.zalopay.vn/v2/start/
        """
        try:
            app_id = zalopay_config.get('app_id')
            key1 = zalopay_config.get('key1')
            key2 = zalopay_config.get('key2')
            endpoint = zalopay_config.get('endpoint')
            
            transID = int(datetime.now().timestamp())
            order_id = f"{datetime.now().strftime('%y%m%d')}_{payment.id}_{transID}"
            
            embed_data = json.dumps({
                'redirecturl': f"{os.getenv('FRONTEND_URL')}/payment/success"
            })
            
            item = json.dumps([{
                'itemid': str(payment.plan_id),
                'itemname': payment.plan.name,
                'itemprice': int(payment.amount),
                'itemquantity': 1
            }])
            
            order_data = (
                f"{app_id}|{order_id}|{payment.user_id}|"
                f"{int(payment.amount)}|{int(datetime.now().timestamp() * 1000)}|"
                f"{embed_data}|{item}"
            )
            
            mac = hmac.new(
                key1.encode('utf-8'),
                order_data.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            payload = {
                'app_id': app_id,
                'app_trans_id': order_id,
                'app_user': str(payment.user_id),
                'app_time': int(datetime.now().timestamp() * 1000),
                'amount': int(payment.amount),
                'item': item,
                'embed_data': embed_data,
                'description': f'Thanh toan goi {payment.plan.name}',
                'bank_code': 'zalopayapp',
                'callback_url': notify_url,
                'mac': mac
            }
            
            response = requests.post(endpoint, data=payload, timeout=10)
            result = response.json()
            
            if result.get('return_code') == 1:
                payment.transaction_id = order_id
                db.session.commit()
                
                return {
                    'payment_url': result.get('order_url'),
                    'zp_trans_token': result.get('zp_trans_token')
                }
            else:
                raise Exception(f"ZaloPay Error: {result.get('return_message')}")
                
        except Exception as e:
            print(f"Error creating ZaloPay payment: {str(e)}")
            raise
    
    @staticmethod
    def verify_zalopay_callback(callback_data, key2):
        """Verify ZaloPay callback"""
        mac = callback_data.get('mac')
        if not mac:
            return False
        
        data_str = callback_data.get('data', '')
        
        calculated_mac = hmac.new(
            key2.encode('utf-8'),
            data_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return calculated_mac == mac
    
    @staticmethod
    def process_payment_callback(payment_id, transaction_id, status, gateway_response=None):
        """Process payment callback from any gateway"""
        try:
            payment = db.session.get(Payment, payment_id)
            if not payment:
                return False
            
            payment.payment_status = status
            payment.transaction_id = transaction_id
            payment.completed_at = datetime.utcnow()
            
            if gateway_response:
                payment.payment_gateway_response = json.dumps(gateway_response)
            
            # If payment successful, handle based on payment type
            if status == 'completed':
                if payment.payment_type == 'subscription':
                    # Activate subscription
                    user = db.session.get(User, payment.user_id)
                    plan = db.session.get(Plan, payment.plan_id)
                    
                    if user and plan:
                        user.subscription_plan = plan.id  # Use plan ID not name
                        user.subscription_status = 'active'
                        user.subscription_start_date = datetime.utcnow()
                        
                        # Calculate end date
                        if payment.billing_cycle == 'yearly':
                            user.subscription_end_date = datetime.utcnow() + timedelta(days=365)
                        else:
                            user.subscription_end_date = datetime.utcnow() + timedelta(days=30)
                
                elif payment.payment_type == 'appointment':
                    # Update appointment status to pending (waiting for doctor approval)
                    from app.models.models import Appointment
                    appointment = Appointment.query.filter_by(payment_id=payment.id).first()
                    
                    if appointment:
                        print(f"[PAYMENT] Updating appointment {appointment.id} from {appointment.status} to pending")
                        appointment.status = 'pending'  # Payment complete, now waiting for doctor
                        print(f"[PAYMENT] Appointment {appointment.id} status after update: {appointment.status}")
            
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error processing payment callback: {str(e)}")
            return False
    
    @staticmethod
    def get_user_payment_history(user_id, limit=20):
        """Get payment history for a user"""
        return Payment.query.filter_by(user_id=user_id).order_by(
            Payment.created_at.desc()
        ).limit(limit).all()
    
    @staticmethod
    def cancel_subscription(user_id):
        """Cancel user's subscription"""
        try:
            user = db.session.get(User, user_id)
            if not user:
                return False
            
            user.subscription_status = 'cancelled'
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            return False
    
    @staticmethod
    def check_expired_subscriptions():
        """Check and update expired subscriptions"""
        try:
            expired_users = User.query.filter(
                User.subscription_end_date <= datetime.utcnow(),
                User.subscription_status == 'active'
            ).all()
            
            for user in expired_users:
                user.subscription_status = 'expired'
                user.subscription_plan = 'free'
            
            db.session.commit()
            return len(expired_users)
            
        except Exception as e:
            db.session.rollback()
            return 0

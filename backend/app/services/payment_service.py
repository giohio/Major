from app.models.models import Payment, User, Plan
from app.extensions import db
from datetime import datetime, timedelta
import hashlib
import hmac
import urllib.parse
import requests
import json

class PaymentService:
    """
    Service for handling payment processing
    Supports VNPay, Momo, and Stripe
    """
    
    @staticmethod
    def create_payment(user_id, plan_id, billing_cycle='monthly', payment_method='vnpay'):
        """
        Create a new payment record
        
        Args:
            user_id: User ID
            plan_id: Plan ID
            billing_cycle: 'monthly' or 'yearly'
            payment_method: Payment gateway to use
            
        Returns:
            Payment: Created payment object
        """
        try:
            # Get plan details
            plan = db.session.get(Plan, plan_id)
            if not plan:
                raise ValueError("Plan not found")
            
            # Calculate amount
            if billing_cycle == 'yearly':
                amount = plan.price_yearly
            else:
                amount = plan.price_monthly
            
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
            print(f"Error creating payment: {str(e)}")
            raise
    
    @staticmethod
    def generate_vnpay_payment_url(payment, return_url, vnp_url, vnp_tmn_code, vnp_hash_secret):
        """
        Generate VNPay payment URL
        
        Args:
            payment: Payment object
            return_url: URL to return after payment
            vnp_url: VNPay gateway URL
            vnp_tmn_code: VNPay merchant code
            vnp_hash_secret: VNPay hash secret
            
        Returns:
            str: Payment URL
        """
        # VNPay parameters
        vnp_params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': vnp_tmn_code,
            'vnp_Amount': int(float(payment.amount) * 100),  # VNPay uses smallest currency unit
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': str(payment.id),
            'vnp_OrderInfo': f'Payment for plan subscription - Order {payment.id}',
            'vnp_OrderType': 'billpayment',
            'vnp_Locale': 'vn',
            'vnp_ReturnUrl': return_url,
            'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
            'vnp_IpAddr': '127.0.0.1'  # Should be actual client IP
        }
        
        # Sort parameters
        sorted_params = sorted(vnp_params.items())
        
        # Create query string
        query_string = '&'.join([f'{k}={urllib.parse.quote_plus(str(v))}' for k, v in sorted_params])
        
        # Create secure hash
        hash_data = '&'.join([f'{k}={v}' for k, v in sorted_params])
        secure_hash = hmac.new(
            vnp_hash_secret.encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        # Final URL
        payment_url = f"{vnp_url}?{query_string}&vnp_SecureHash={secure_hash}"
        
        return payment_url
    
    @staticmethod
    def verify_vnpay_callback(vnp_params, vnp_hash_secret):
        """
        Verify VNPay callback signature
        
        Args:
            vnp_params: Callback parameters from VNPay
            vnp_hash_secret: VNPay hash secret
            
        Returns:
            bool: True if signature is valid
        """
        # Extract secure hash
        vnp_secure_hash = vnp_params.pop('vnp_SecureHash', None)
        
        if not vnp_secure_hash:
            return False
        
        # Sort and create hash string
        sorted_params = sorted(vnp_params.items())
        hash_data = '&'.join([f'{k}={v}' for k, v in sorted_params])
        
        # Calculate hash
        calculated_hash = hmac.new(
            vnp_hash_secret.encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        return calculated_hash == vnp_secure_hash
    
    @staticmethod
    def process_payment_callback(payment_id, transaction_id, status, gateway_response=None):
        """
        Process payment callback from gateway
        
        Args:
            payment_id: Payment ID
            transaction_id: Transaction ID from gateway
            status: Payment status ('completed' or 'failed')
            gateway_response: Full response from payment gateway
            
        Returns:
            bool: Success status
        """
        try:
            payment = db.session.get(Payment, payment_id)
            
            if not payment:
                return False
            
            # Update payment
            payment.payment_status = status
            payment.transaction_id = transaction_id
            payment.completed_at = datetime.utcnow()
            
            if gateway_response:
                payment.payment_gateway_response = json.dumps(gateway_response)
            
            # If payment successful, update user subscription
            if status == 'completed':
                user = db.session.get(User, payment.user_id)
                plan = db.session.get(Plan, payment.plan_id)
                
                if user and plan:
                    user.subscription_plan = plan.name
                    user.subscription_status = 'active'
                    user.subscription_start_date = datetime.utcnow()
                    
                    # Calculate end date
                    if payment.billing_cycle == 'yearly':
                        user.subscription_end_date = datetime.utcnow() + timedelta(days=365)
                    else:
                        user.subscription_end_date = datetime.utcnow() + timedelta(days=30)
            
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error processing payment callback: {str(e)}")
            return False
    
    @staticmethod
    def get_user_payment_history(user_id, limit=20):
        """
        Get payment history for a user
        
        Args:
            user_id: User ID
            limit: Maximum number of records to return
            
        Returns:
            list: List of Payment objects
        """
        return Payment.query.filter_by(user_id=user_id).order_by(
            Payment.created_at.desc()
        ).limit(limit).all()
    
    @staticmethod
    def cancel_subscription(user_id):
        """
        Cancel user's subscription
        
        Args:
            user_id: User ID
            
        Returns:
            bool: Success status
        """
        try:
            user = db.session.get(User, user_id)
            
            if not user:
                return False
            
            user.subscription_status = 'cancelled'
            # Keep subscription active until end date
            
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error cancelling subscription: {str(e)}")
            return False
    
    @staticmethod
    def check_expired_subscriptions():
        """
        Check and update expired subscriptions
        Should be run as a scheduled task
        
        Returns:
            int: Number of subscriptions updated
        """
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
            print(f"Error checking expired subscriptions: {str(e)}")
            return 0

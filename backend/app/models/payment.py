"""
Subscription Plans and Payment Models
"""
from datetime import datetime
from app.extensions import db


class Plan(db.Model):
    __tablename__ = 'plans'
    
    id = db.Column(db.Integer, primary_key=True)
    
    name = db.Column(db.String(100), nullable=False, unique=True)  # Free, Pro, Clinical, Doctor Basic, Doctor Pro
    description = db.Column(db.Text, nullable=True)
    user_type = db.Column(db.String(20), nullable=False)  # user, doctor
    
    # Pricing
    price_monthly = db.Column(db.Numeric(10, 2), default=0)
    price_yearly = db.Column(db.Numeric(10, 2), default=0)
    
    # Features
    chat_limit = db.Column(db.Integer, default=-1)  # -1 = unlimited
    voice_enabled = db.Column(db.Boolean, default=False)
    video_enabled = db.Column(db.Boolean, default=False)
    empathy_layer_enabled = db.Column(db.Boolean, default=False)
    doctor_access = db.Column(db.Boolean, default=False)
    priority_support = db.Column(db.Boolean, default=False)
    
    # Doctor specific
    max_patients = db.Column(db.Integer, default=0)  # Only for doctor plans
    can_assign_plans = db.Column(db.Boolean, default=False)
    analytics_access = db.Column(db.Boolean, default=False)
    
    is_active = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'user_type': self.user_type,
            'price_monthly': float(self.price_monthly) if self.price_monthly else 0,
            'price_yearly': float(self.price_yearly) if self.price_yearly else 0,
            'chat_limit': self.chat_limit,
            'voice_enabled': self.voice_enabled,
            'video_enabled': self.video_enabled,
            'empathy_layer_enabled': self.empathy_layer_enabled,
            'doctor_access': self.doctor_access,
            'priority_support': self.priority_support,
            'max_patients': self.max_patients,
            'can_assign_plans': self.can_assign_plans,
            'analytics_access': self.analytics_access,
            'is_active': self.is_active
        }


class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=True)  # Nullable for appointment payments
    
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(10), default='VND')
    
    payment_method = db.Column(db.String(50), nullable=False)  # vnpay, momo, zalopay, bank_transfer
    payment_status = db.Column(db.String(20), default='pending')  # pending, completed, failed, refunded
    payment_type = db.Column(db.String(20), default='subscription')  # subscription, appointment, one_time
    
    transaction_id = db.Column(db.String(200), unique=True, nullable=True)
    payment_gateway_response = db.Column(db.Text, nullable=True)  # JSON response from gateway
    
    billing_cycle = db.Column(db.String(20), nullable=True)  # monthly, yearly (for subscriptions only)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    user = db.relationship('User', backref='payments')
    plan = db.relationship('Plan', backref='payments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan_id': self.plan_id,
            'amount': float(self.amount),
            'currency': self.currency,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'payment_type': self.payment_type,
            'transaction_id': self.transaction_id,
            'billing_cycle': self.billing_cycle,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

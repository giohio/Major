"""
Base User and Authentication Models
"""
from datetime import datetime
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    address = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(20), nullable=False, default='user')  # user, doctor, admin
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    avatar_url = db.Column(db.String(255), nullable=True)
    
    # Password reset
    reset_token = db.Column(db.String(255), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)
    
    # OAuth fields
    oauth_provider = db.Column(db.String(20), nullable=True)  # google, facebook
    oauth_uid = db.Column(db.String(255), nullable=True)
    
    # Subscription info
    subscription_plan = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=True)  # Plan ID (9=Free, 10=Premium, 11=VIP)
    subscription_status = db.Column(db.String(20), default='active')  # active, cancelled, expired
    subscription_start_date = db.Column(db.DateTime, nullable=True)
    subscription_end_date = db.Column(db.DateTime, nullable=True)
    
    # User settings (JSON)
    settings = db.Column(db.Text, nullable=True)  # JSON string of user preferences
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    chat_sessions = db.relationship('ChatSession', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    emotions = db.relationship('EmotionLog', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    alerts = db.relationship('Alert', foreign_keys='Alert.user_id', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    resolved_alerts = db.relationship('Alert', foreign_keys='Alert.resolved_by', backref='resolver', lazy='dynamic')
    
    # For doctors
    doctor_profile = db.relationship('DoctorProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Set password hash"""
        if password:
            self.password_hash = generate_password_hash(password)
        else:
            # For OAuth users without password
            self.password_hash = generate_password_hash('oauth_user_no_password')
    
    def check_password(self, password):
        """Check password"""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'address': self.address,
            'role': self.role,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'avatar_url': self.avatar_url,
            'subscription_plan': self.subscription_plan,
            'subscription_status': self.subscription_status,
            'subscription_start_date': self.subscription_start_date.isoformat() if self.subscription_start_date else None,
            'subscription_end_date': self.subscription_end_date.isoformat() if self.subscription_end_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

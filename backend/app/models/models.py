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
    role = db.Column(db.String(20), nullable=False, default='user')  # user, doctor, admin
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    avatar_url = db.Column(db.String(255), nullable=True)
    
    # Subscription info
    subscription_plan = db.Column(db.String(50), default='free')  # free, personal, family
    subscription_status = db.Column(db.String(20), default='active')  # active, cancelled, expired
    subscription_start_date = db.Column(db.DateTime, nullable=True)
    subscription_end_date = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    chat_sessions = db.relationship('ChatSession', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    emotions = db.relationship('EmotionLog', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    alerts = db.relationship('Alert', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    # For doctors
    doctor_profile = db.relationship('DoctorProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'role': self.role,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'avatar_url': self.avatar_url,
            'subscription_plan': self.subscription_plan,
            'subscription_status': self.subscription_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


class DoctorProfile(db.Model):
    __tablename__ = 'doctor_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    specialization = db.Column(db.String(100), nullable=False)  # Clinical Psychology, Psychiatry, etc.
    years_of_experience = db.Column(db.Integer, default=0)
    education = db.Column(db.Text, nullable=True)  # JSON string of education history
    certifications = db.Column(db.Text, nullable=True)  # JSON string of certifications
    
    bio = db.Column(db.Text, nullable=True)
    consultation_fee = db.Column(db.Numeric(10, 2), default=0)
    languages = db.Column(db.String(200), nullable=True)  # Comma separated
    
    is_verified = db.Column(db.Boolean, default=False)
    is_available = db.Column(db.Boolean, default=True)
    rating = db.Column(db.Numeric(3, 2), default=0.0)
    total_sessions = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    appointments = db.relationship('Appointment', backref='doctor', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'license_number': self.license_number,
            'specialization': self.specialization,
            'years_of_experience': self.years_of_experience,
            'bio': self.bio,
            'consultation_fee': float(self.consultation_fee) if self.consultation_fee else 0,
            'languages': self.languages,
            'is_verified': self.is_verified,
            'is_available': self.is_available,
            'rating': float(self.rating) if self.rating else 0.0,
            'total_sessions': self.total_sessions
        }


class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    title = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default='active')  # active, completed, archived
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('ChatMessage', backref='session', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'message_count': self.messages.count()
        }


class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), nullable=False, index=True)
    
    role = db.Column(db.String(20), nullable=False)  # user, assistant
    content = db.Column(db.Text, nullable=False)
    
    # AI Analysis
    emotion_detected = db.Column(db.String(50), nullable=True)
    sentiment_score = db.Column(db.Numeric(5, 2), nullable=True)  # -1.0 to 1.0
    risk_level = db.Column(db.String(20), nullable=True)  # low, medium, high, critical
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'role': self.role,
            'content': self.content,
            'emotion_detected': self.emotion_detected,
            'sentiment_score': float(self.sentiment_score) if self.sentiment_score else None,
            'risk_level': self.risk_level,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class EmotionLog(db.Model):
    __tablename__ = 'emotion_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    emotion = db.Column(db.String(50), nullable=False)  # happy, sad, anxious, angry, etc.
    intensity = db.Column(db.Integer, nullable=False)  # 1-10
    sentiment_score = db.Column(db.Numeric(5, 2), nullable=True)
    
    notes = db.Column(db.Text, nullable=True)
    triggers = db.Column(db.String(200), nullable=True)
    
    logged_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'emotion': self.emotion,
            'intensity': self.intensity,
            'sentiment_score': float(self.sentiment_score) if self.sentiment_score else None,
            'notes': self.notes,
            'triggers': self.triggers,
            'logged_at': self.logged_at.isoformat() if self.logged_at else None
        }


class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    alert_type = db.Column(db.String(50), nullable=False)  # self_harm, suicide, high_stress, etc.
    severity = db.Column(db.String(20), nullable=False)  # low, medium, high, critical
    message = db.Column(db.Text, nullable=False)
    
    is_resolved = db.Column(db.Boolean, default=False)
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    resolved_at = db.Column(db.DateTime, nullable=True)
    resolution_notes = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'alert_type': self.alert_type,
            'severity': self.severity,
            'message': self.message,
            'is_resolved': self.is_resolved,
            'resolved_by': self.resolved_by,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor_profiles.id'), nullable=False, index=True)
    
    appointment_date = db.Column(db.DateTime, nullable=False, index=True)
    duration_minutes = db.Column(db.Integer, default=60)
    
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, cancelled, no_show
    appointment_type = db.Column(db.String(20), default='video')  # video, chat, phone
    
    notes = db.Column(db.Text, nullable=True)
    doctor_notes = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'doctor_id': self.doctor_id,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'duration_minutes': self.duration_minutes,
            'status': self.status,
            'appointment_type': self.appointment_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Exercise(db.Model):
    __tablename__ = 'exercises'
    
    id = db.Column(db.Integer, primary_key=True)
    
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # breathing, meditation, journaling, cbt, etc.
    difficulty = db.Column(db.String(20), default='beginner')  # beginner, intermediate, advanced
    duration_minutes = db.Column(db.Integer, default=5)
    
    instructions = db.Column(db.Text, nullable=False)
    benefits = db.Column(db.Text, nullable=True)
    
    is_active = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'difficulty': self.difficulty,
            'duration_minutes': self.duration_minutes,
            'instructions': self.instructions,
            'benefits': self.benefits
        }

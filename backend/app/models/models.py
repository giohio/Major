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
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(10), default='VND')
    
    payment_method = db.Column(db.String(50), nullable=False)  # vnpay, momo, stripe, bank_transfer
    payment_status = db.Column(db.String(20), default='pending')  # pending, completed, failed, refunded
    
    transaction_id = db.Column(db.String(200), unique=True, nullable=True)
    payment_gateway_response = db.Column(db.Text, nullable=True)  # JSON response from gateway
    
    billing_cycle = db.Column(db.String(20), nullable=False)  # monthly, yearly
    
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
            'transaction_id': self.transaction_id,
            'billing_cycle': self.billing_cycle,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class PatientRecord(db.Model):
    __tablename__ = 'patient_records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Medical info
    diagnosis = db.Column(db.Text, nullable=True)
    medications = db.Column(db.Text, nullable=True)  # JSON array
    allergies = db.Column(db.String(500), nullable=True)
    medical_history = db.Column(db.Text, nullable=True)
    
    # Emergency contact
    emergency_contact_name = db.Column(db.String(100), nullable=True)
    emergency_contact_phone = db.Column(db.String(20), nullable=True)
    emergency_contact_relationship = db.Column(db.String(50), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='patient_record')
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref='assigned_patients')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'doctor_id': self.doctor_id,
            'diagnosis': self.diagnosis,
            'medications': self.medications,
            'allergies': self.allergies,
            'medical_history': self.medical_history,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
            'emergency_contact_relationship': self.emergency_contact_relationship,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class DoctorNote(db.Model):
    __tablename__ = 'doctor_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), nullable=True)
    
    note_type = db.Column(db.String(50), nullable=False)  # assessment, progress, treatment_plan, prescription
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    is_private = db.Column(db.Boolean, default=True)  # Private notes not visible to patient
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref='notes_written')
    patient = db.relationship('User', foreign_keys=[patient_id], backref='medical_notes')
    
    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'patient_id': self.patient_id,
            'session_id': self.session_id,
            'note_type': self.note_type,
            'title': self.title,
            'content': self.content,
            'is_private': self.is_private,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    assigned_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Doctor or system
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=True)
    
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    task_type = db.Column(db.String(50), nullable=False)  # exercise, homework, journal, cbt, meditation
    
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, skipped
    
    due_date = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    patient_notes = db.Column(db.Text, nullable=True)  # Patient's reflection after completing
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = db.relationship('User', foreign_keys=[patient_id], backref='tasks')
    assigner = db.relationship('User', foreign_keys=[assigned_by], backref='tasks_assigned')
    exercise = db.relationship('Exercise', backref='tasks')
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'assigned_by': self.assigned_by,
            'exercise_id': self.exercise_id,
            'title': self.title,
            'description': self.description,
            'task_type': self.task_type,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'patient_notes': self.patient_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class TherapySession(db.Model):
    __tablename__ = 'therapy_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=True)
    
    session_type = db.Column(db.String(20), nullable=False)  # video, audio, chat
    status = db.Column(db.String(20), default='scheduled')  # scheduled, in_progress, completed, cancelled
    
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)
    duration_minutes = db.Column(db.Integer, nullable=True)
    
    # AI Summary
    ai_summary = db.Column(db.Text, nullable=True)
    key_topics = db.Column(db.String(500), nullable=True)  # Comma separated
    sentiment_analysis = db.Column(db.Text, nullable=True)  # JSON
    
    # Video/Audio metadata
    recording_url = db.Column(db.String(500), nullable=True)
    transcript = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref='sessions_conducted')
    patient = db.relationship('User', foreign_keys=[patient_id], backref='therapy_sessions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'patient_id': self.patient_id,
            'appointment_id': self.appointment_id,
            'session_type': self.session_type,
            'status': self.status,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration_minutes': self.duration_minutes,
            'ai_summary': self.ai_summary,
            'key_topics': self.key_topics,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class PsychologicalTest(db.Model):
    __tablename__ = 'psychological_tests'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    test_type = db.Column(db.String(50), nullable=False)  # PHQ-9, GAD-7, PSS, DASS-21, etc.
    score = db.Column(db.Integer, nullable=False)
    max_score = db.Column(db.Integer, nullable=False)
    severity_level = db.Column(db.String(50), nullable=True)  # minimal, mild, moderate, severe
    
    responses = db.Column(db.Text, nullable=True)  # JSON of questions and answers
    interpretation = db.Column(db.Text, nullable=True)
    recommendations = db.Column(db.Text, nullable=True)
    
    taken_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = db.relationship('User', backref='psychological_tests')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'test_type': self.test_type,
            'score': self.score,
            'max_score': self.max_score,
            'severity_level': self.severity_level,
            'interpretation': self.interpretation,
            'recommendations': self.recommendations,
            'taken_at': self.taken_at.isoformat() if self.taken_at else None
        }


class ChatFeedback(db.Model):
    __tablename__ = 'chat_feedbacks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message_id = db.Column(db.Integer, db.ForeignKey('chat_messages.id'), nullable=False)
    
    rating = db.Column(db.Integer, nullable=False)  # 1-5 or thumbs up/down (-1, 1)
    feedback_text = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='chat_feedbacks')
    message = db.relationship('ChatMessage', backref='feedbacks')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message_id': self.message_id,
            'rating': self.rating,
            'feedback_text': self.feedback_text,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AIModel(db.Model):
    __tablename__ = 'ai_models'
    
    id = db.Column(db.Integer, primary_key=True)
    
    name = db.Column(db.String(100), nullable=False, unique=True)  # Qwen, GPT-4, Gemini Pro
    provider = db.Column(db.String(50), nullable=False)  # openai, google, alibaba
    model_version = db.Column(db.String(50), nullable=False)
    
    is_active = db.Column(db.Boolean, default=True)
    is_default = db.Column(db.Boolean, default=False)
    
    # Performance metrics
    avg_latency_ms = db.Column(db.Integer, nullable=True)
    cost_per_1k_tokens = db.Column(db.Numeric(10, 4), nullable=True)
    accuracy_score = db.Column(db.Numeric(5, 2), nullable=True)
    
    # Configuration
    max_tokens = db.Column(db.Integer, default=4096)
    temperature = db.Column(db.Numeric(3, 2), default=0.7)
    
    description = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'provider': self.provider,
            'model_version': self.model_version,
            'is_active': self.is_active,
            'is_default': self.is_default,
            'avg_latency_ms': self.avg_latency_ms,
            'cost_per_1k_tokens': float(self.cost_per_1k_tokens) if self.cost_per_1k_tokens else None,
            'accuracy_score': float(self.accuracy_score) if self.accuracy_score else None,
            'max_tokens': self.max_tokens,
            'temperature': float(self.temperature),
            'description': self.description
        }

"""
Doctor Profile and Related Models
"""
from datetime import datetime
from app.extensions import db


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


class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor_profiles.id'), nullable=False, index=True)
    payment_id = db.Column(db.Integer, db.ForeignKey('payments.id'), nullable=True, index=True)  # Link to payment
    
    appointment_date = db.Column(db.DateTime, nullable=False, index=True)
    duration_minutes = db.Column(db.Integer, default=60)
    
    status = db.Column(db.String(20), default='pending_payment')  # pending_payment, pending, confirmed, scheduled, completed, cancelled, no_show
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
            'payment_id': self.payment_id,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'duration_minutes': self.duration_minutes,
            'status': self.status,
            'appointment_type': self.appointment_type,
            'notes': self.notes,
            'doctor_notes': self.doctor_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

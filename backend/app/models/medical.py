"""
Medical Records and Therapy Session Models
"""
from datetime import datetime
from app.extensions import db


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

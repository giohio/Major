"""
Chat Session and Message Models
"""
from datetime import datetime
from app.extensions import db


class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=True, index=True)  # For doctor-patient chat
    
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
            'appointment_id': self.appointment_id,
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
    
    # Feedback (merged from ChatFeedback)
    rating = db.Column(db.Integer, nullable=True)  # 1-5 or thumbs up/down (-1, 1), NULL = not rated yet
    feedback_text = db.Column(db.Text, nullable=True)
    feedback_created_at = db.Column(db.DateTime, nullable=True)  # When feedback was given
    
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
            'rating': self.rating,
            'feedback_text': self.feedback_text,
            'feedback_created_at': self.feedback_created_at.isoformat() if self.feedback_created_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

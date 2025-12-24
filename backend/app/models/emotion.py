"""
Emotion and Mental Health Tracking Models
"""
from datetime import datetime
from app.extensions import db
import json


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


class EmotionAnalysis(db.Model):
    """Store ML-powered emotion analysis results"""
    __tablename__ = 'emotion_analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Session Analysis JSON
    dominant_emotion = db.Column(db.String(50), nullable=False)
    emotional_breakdown = db.Column(db.JSON, nullable=True)  # {"sadness": 0.5, "fear": 0.5}
    overall_sentiment = db.Column(db.Numeric(5, 2), nullable=False)  # -1 to 1
    intensity_average = db.Column(db.Numeric(5, 2), nullable=False)  # 0 to 1
    
    # Progression & Trend
    emotional_progression = db.Column(db.JSON, nullable=True)  # Array of progression steps
    trend = db.Column(db.String(20), nullable=False)  # improving, declining, stable
    
    # Additional insights
    triggers = db.Column(db.JSON, nullable=True)  # Array of trigger strings
    summary_message = db.Column(db.Text, nullable=True)
    
    # Metadata
    message_count = db.Column(db.Integer, default=0)  # Number of messages analyzed
    analysis_source = db.Column(db.String(50), default='ml_model')  # ml_model, manual, etc.
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    user = db.relationship('User', backref='emotion_analyses', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_analysis': {
                'dominant_emotion': self.dominant_emotion,
                'emotional_breakdown': self.emotional_breakdown or {},
                'overall_sentiment': float(self.overall_sentiment) if self.overall_sentiment else 0,
                'intensity_average': float(self.intensity_average) if self.intensity_average else 0
            },
            'emotional_progression': self.emotional_progression or [],
            'trend': self.trend,
            'triggers': self.triggers or [],
            'summary_message': self.summary_message,
            'message_count': self.message_count,
            'analysis_source': self.analysis_source,
            'created_at': self.created_at.isoformat() if self.created_at else None
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

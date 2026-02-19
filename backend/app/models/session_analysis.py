"""
Unified Session Analysis Model
Combines SessionEmotionAnalytics and ClinicalEmotionReport into one table
"""

from datetime import datetime
from app.extensions import db


class SessionAnalysis(db.Model):
    """
    Unified session analysis for both user and clinical purposes
    Combines emotion tracking analytics and clinical assessment
    """
    __tablename__ = 'session_analysis'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'), nullable=False, unique=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Session Summary
    duration_minutes = db.Column(db.Integer, nullable=True)
    total_messages = db.Column(db.Integer, nullable=True)
    user_messages = db.Column(db.Integer, nullable=True)
    
    # Emotion Analysis (Common)
    dominant_emotion = db.Column(db.String(50), nullable=False, index=True)
    emotional_breakdown = db.Column(db.JSON, nullable=True)  # {"sadness": 0.45, "anger": 0.25, ...}
    overall_sentiment = db.Column(db.Numeric(5, 2), nullable=True)  # -1.0 to 1.0
    intensity_average = db.Column(db.Numeric(5, 2), nullable=True)  # 0.0 to 1.0
    emotional_progression = db.Column(db.JSON, nullable=True)  # Array of emotion changes
    emotional_changes = db.Column(db.String(500), nullable=True)  # Clinical summary of changes
    
    # Triggers
    triggers_primary = db.Column(db.String(200), nullable=True)
    triggers_secondary = db.Column(db.JSON, nullable=True)  # Array of secondary triggers
    
    # Risk Assessment (Combined)
    risk_level = db.Column(db.String(20), nullable=True, index=True)  # low/medium/high/critical
    risk_flags = db.Column(db.JSON, nullable=True)  # Array of flags
    suicidal_ideation = db.Column(db.Boolean, default=False, index=True)
    self_harm_risk = db.Column(db.Boolean, default=False)
    severity_level = db.Column(db.String(20), nullable=True, index=True)  # low/moderate/high/critical
    requires_immediate_intervention = db.Column(db.Boolean, default=False)
    risk_notes = db.Column(db.Text, nullable=True)
    
    # Trend
    trend = db.Column(db.String(20), nullable=True)  # improving/stable/declining
    
    # Summary
    simple_summary = db.Column(db.Text, nullable=True)  # User-friendly summary
    clinical_summary = db.Column(db.Text, nullable=True)  # Clinical assessment summary
    
    # Case Formulation (CBT Framework) - Clinical only
    precipitants = db.Column(db.JSON, nullable=True)  # Array of triggers
    automatic_thoughts = db.Column(db.JSON, nullable=True)  # Array of thoughts
    maladaptive_behaviors = db.Column(db.JSON, nullable=True)  # Array of behaviors
    core_beliefs = db.Column(db.JSON, nullable=True)  # Array of beliefs
    
    # Clinical Plan - Clinical only
    interventions_used = db.Column(db.JSON, nullable=True)  # Array
    recommended_interventions = db.Column(db.JSON, nullable=True)  # Array
    next_steps = db.Column(db.JSON, nullable=True)  # Array
    follow_up_timeline = db.Column(db.String(100), nullable=True)
    
    # Doctor Review
    reviewed_by_doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    doctor_reviewed = db.Column(db.Boolean, default=False)
    doctor_notes = db.Column(db.Text, nullable=True)
    doctor_reviewed_at = db.Column(db.DateTime, nullable=True)
    
    # Metadata
    analyzed_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    model_version = db.Column(db.String(50), nullable=True)
    
    # Relationships
    session = db.relationship('ChatSession', backref='analysis', uselist=False)
    user = db.relationship('User', foreign_keys=[user_id], backref='session_analyses')
    reviewed_by = db.relationship('User', foreign_keys=[reviewed_by_doctor_id], backref='reviewed_analyses')
    
    def to_dict_user(self):
        """User-facing analytics"""
        return {
            'id': self.id,
            'session_id': self.session_id,
            'user_id': self.user_id,
            'duration_minutes': self.duration_minutes,
            'total_messages': self.total_messages,
            'session_analysis': {
                'dominant_emotion': self.dominant_emotion,
                'emotional_breakdown': self.emotional_breakdown,
                'overall_sentiment': float(self.overall_sentiment) if self.overall_sentiment else None,
                'intensity_average': float(self.intensity_average) if self.intensity_average else None
            },
            'emotional_progression': self.emotional_progression,
            'triggers': {
                'primary': self.triggers_primary,
                'secondary': self.triggers_secondary
            },
            'risk_indicators': {
                'level': self.risk_level,
                'flags': self.risk_flags
            },
            'trend': self.trend,
            'simple_summary': self.simple_summary,
            'analyzed_at': self.analyzed_at.isoformat() if self.analyzed_at else None
        }
    
    def to_dict_clinical(self):
        """Clinical report for doctors"""
        return {
            'id': self.id,
            'session_id': self.session_id,
            'patient_id': self.user_id,
            'reviewed_by_doctor_id': self.reviewed_by_doctor_id,
            'dominant_emotion': self.dominant_emotion,
            'emotional_changes': self.emotional_changes,
            'case_formulation': {
                'precipitants': self.precipitants,
                'automatic_thoughts': self.automatic_thoughts,
                'maladaptive_behaviors': self.maladaptive_behaviors,
                'core_beliefs': self.core_beliefs
            },
            'risk_assessment': {
                'suicidal_ideation': self.suicidal_ideation,
                'self_harm_risk': self.self_harm_risk,
                'severity_level': self.severity_level,
                'requires_immediate_intervention': self.requires_immediate_intervention,
                'notes': self.risk_notes
            },
            'clinical_plan': {
                'interventions_used': self.interventions_used,
                'recommended_interventions': self.recommended_interventions,
                'next_steps': self.next_steps,
                'follow_up_timeline': self.follow_up_timeline
            },
            'clinical_summary': self.clinical_summary,
            'analyzed_at': self.analyzed_at.isoformat() if self.analyzed_at else None,
            'doctor_reviewed': self.doctor_reviewed,
            'doctor_notes': self.doctor_notes,
            'doctor_reviewed_at': self.doctor_reviewed_at.isoformat() if self.doctor_reviewed_at else None
        }
    
    def to_dict(self):
        """Full data dict"""
        return {**self.to_dict_user(), **self.to_dict_clinical()}

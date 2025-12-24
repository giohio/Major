"""
AI Model Configuration
"""
from datetime import datetime
from app.extensions import db


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

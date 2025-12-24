"""
Exercise and Task Management Models
"""
from datetime import datetime
from app.extensions import db


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


class UserExerciseProgress(db.Model):
    __tablename__ = 'user_exercise_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False, index=True)
    
    status = db.Column(db.String(20), default='not_started')  # not_started, in_progress, completed
    progress_percentage = db.Column(db.Integer, default=0)  # 0-100
    
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    last_practiced_at = db.Column(db.DateTime, nullable=True)
    
    times_completed = db.Column(db.Integer, default=0)
    total_time_spent_minutes = db.Column(db.Integer, default=0)
    
    notes = db.Column(db.Text, nullable=True)  # User's reflection after completion
    is_favorite = db.Column(db.Boolean, default=False)  # Mark as favorite
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='exercise_progress')
    exercise = db.relationship('Exercise', backref='user_progress')
    
    # Unique constraint: one progress record per user per exercise
    __table_args__ = (
        db.UniqueConstraint('user_id', 'exercise_id', name='unique_user_exercise'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'exercise_id': self.exercise_id,
            'status': self.status,
            'progress_percentage': self.progress_percentage,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'last_practiced_at': self.last_practiced_at.isoformat() if self.last_practiced_at else None,
            'times_completed': self.times_completed,
            'total_time_spent_minutes': self.total_time_spent_minutes,
            'notes': self.notes,
            'is_favorite': self.is_favorite,
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

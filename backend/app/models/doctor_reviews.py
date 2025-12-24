"""
Add Review model and update DoctorProfile with rating calculation
Run: flask db migrate -m "Add doctor reviews"
     flask db upgrade
"""

from datetime import datetime
from app.extensions import db
from sqlalchemy import func

# Add to models.py after Appointment model

class DoctorReview(db.Model):
    """Reviews and ratings for doctors"""
    __tablename__ = 'doctor_reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor_profiles.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=True)
    
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    review_text = db.Column(db.Text, nullable=True)
    
    # Rating breakdown
    professionalism = db.Column(db.Integer, nullable=True)  # 1-5
    communication = db.Column(db.Integer, nullable=True)  # 1-5
    effectiveness = db.Column(db.Integer, nullable=True)  # 1-5
    
    is_verified = db.Column(db.Boolean, default=False)  # Verified from actual appointment
    is_anonymous = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    doctor = db.relationship('DoctorProfile', backref='reviews')
    user = db.relationship('User', backref='doctor_reviews')
    appointment = db.relationship('Appointment', backref='review', uselist=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'user_id': self.user_id if not self.is_anonymous else None,
            'appointment_id': self.appointment_id,
            'rating': self.rating,
            'review_text': self.review_text,
            'professionalism': self.professionalism,
            'communication': self.communication,
            'effectiveness': self.effectiveness,
            'is_verified': self.is_verified,
            'is_anonymous': self.is_anonymous,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @staticmethod
    def calculate_doctor_rating(doctor_id):
        """Calculate average rating for a doctor"""
        result = db.session.query(
            func.avg(DoctorReview.rating).label('avg_rating'),
            func.count(DoctorReview.id).label('review_count')
        ).filter_by(doctor_id=doctor_id).first()
        
        return {
            'average_rating': round(float(result.avg_rating), 2) if result.avg_rating else 0.0,
            'review_count': result.review_count or 0
        }


class DoctorAvailability(db.Model):
    """Doctor's weekly availability schedule"""
    __tablename__ = 'doctor_availability'
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor_profiles.id'), nullable=False, index=True)
    
    day_of_week = db.Column(db.Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    doctor = db.relationship('DoctorProfile', backref='availability_schedule')
    
    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'day_of_week': self.day_of_week,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'is_active': self.is_active
        }


class DoctorTimeOff(db.Model):
    """Doctor's time off / blocked dates"""
    __tablename__ = 'doctor_time_off'
    
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor_profiles.id'), nullable=False, index=True)
    
    start_date = db.Column(db.DateTime, nullable=False, index=True)
    end_date = db.Column(db.DateTime, nullable=False, index=True)
    reason = db.Column(db.String(200), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    doctor = db.relationship('DoctorProfile', backref='time_off')
    
    def to_dict(self):
        return {
            'id': self.id,
            'doctor_id': self.doctor_id,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'reason': self.reason
        }

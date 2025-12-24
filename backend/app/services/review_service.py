"""
Doctor Review Service
Handles review submission, rating calculation, and availability checking
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy import and_, or_, func
from app.extensions import db
from app.models.models import DoctorProfile, Appointment, User
from app.models.doctor_reviews import DoctorReview, DoctorAvailability, DoctorTimeOff


class ReviewService:
    """Service for managing doctor reviews"""
    
    @staticmethod
    def create_review(
        user_id: int,
        doctor_id: int,
        rating: int,
        review_text: Optional[str] = None,
        appointment_id: Optional[int] = None,
        professionalism: Optional[int] = None,
        communication: Optional[int] = None,
        effectiveness: Optional[int] = None,
        is_anonymous: bool = False
    ) -> DoctorReview:
        """Create a new doctor review"""
        
        # Validate rating
        if not 1 <= rating <= 5:
            raise ValueError("Rating must be between 1 and 5")
        
        # Check if user already reviewed this doctor
        existing = DoctorReview.query.filter_by(
            user_id=user_id,
            doctor_id=doctor_id
        ).first()
        
        if existing:
            raise ValueError("You have already reviewed this doctor")
        
        # Check if review is from actual appointment
        is_verified = False
        if appointment_id:
            appointment = Appointment.query.get(appointment_id)
            if appointment and appointment.patient_id == user_id and appointment.doctor_id == doctor_id:
                if appointment.status == 'completed':
                    is_verified = True
        
        review = DoctorReview(
            user_id=user_id,
            doctor_id=doctor_id,
            appointment_id=appointment_id,
            rating=rating,
            review_text=review_text,
            professionalism=professionalism,
            communication=communication,
            effectiveness=effectiveness,
            is_verified=is_verified,
            is_anonymous=is_anonymous
        )
        
        db.session.add(review)
        db.session.commit()
        
        return review
    
    @staticmethod
    def get_doctor_reviews(
        doctor_id: int,
        limit: int = 10,
        offset: int = 0,
        verified_only: bool = False
    ) -> tuple[List[DoctorReview], Dict]:
        """Get reviews for a doctor with stats"""
        
        query = DoctorReview.query.filter_by(doctor_id=doctor_id)
        
        if verified_only:
            query = query.filter_by(is_verified=True)
        
        total = query.count()
        reviews = query.order_by(DoctorReview.created_at.desc()).limit(limit).offset(offset).all()
        
        # Calculate stats
        stats = ReviewService.get_review_stats(doctor_id)
        
        return reviews, {
            'total': total,
            'limit': limit,
            'offset': offset,
            **stats
        }
    
    @staticmethod
    def get_review_stats(doctor_id: int) -> Dict:
        """Get review statistics for a doctor"""
        
        result = db.session.query(
            func.avg(DoctorReview.rating).label('avg_rating'),
            func.count(DoctorReview.id).label('review_count'),
            func.avg(DoctorReview.professionalism).label('avg_professionalism'),
            func.avg(DoctorReview.communication).label('avg_communication'),
            func.avg(DoctorReview.effectiveness).label('avg_effectiveness')
        ).filter_by(doctor_id=doctor_id).first()
        
        # Rating distribution
        distribution = db.session.query(
            DoctorReview.rating,
            func.count(DoctorReview.id)
        ).filter_by(doctor_id=doctor_id).group_by(DoctorReview.rating).all()
        
        rating_dist = {i: 0 for i in range(1, 6)}
        for rating, count in distribution:
            rating_dist[rating] = count
        
        return {
            'average_rating': round(float(result.avg_rating), 2) if result.avg_rating else 0.0,
            'review_count': result.review_count or 0,
            'avg_professionalism': round(float(result.avg_professionalism), 2) if result.avg_professionalism else None,
            'avg_communication': round(float(result.avg_communication), 2) if result.avg_communication else None,
            'avg_effectiveness': round(float(result.avg_effectiveness), 2) if result.avg_effectiveness else None,
            'rating_distribution': rating_dist
        }


class AvailabilityService:
    """Service for managing doctor availability"""
    
    @staticmethod
    def set_weekly_schedule(doctor_id: int, schedule: List[Dict]) -> List[DoctorAvailability]:
        """
        Set doctor's weekly availability
        schedule: [{'day_of_week': 1, 'start_time': '09:00', 'end_time': '17:00'}, ...]
        """
        
        # Delete existing schedule
        DoctorAvailability.query.filter_by(doctor_id=doctor_id).delete()
        
        availabilities = []
        for slot in schedule:
            availability = DoctorAvailability(
                doctor_id=doctor_id,
                day_of_week=slot['day_of_week'],
                start_time=datetime.strptime(slot['start_time'], '%H:%M').time(),
                end_time=datetime.strptime(slot['end_time'], '%H:%M').time(),
                is_active=slot.get('is_active', True)
            )
            db.session.add(availability)
            availabilities.append(availability)
        
        db.session.commit()
        return availabilities
    
    @staticmethod
    def get_available_slots(
        doctor_id: int,
        date: datetime,
        slot_duration: int = 30  # minutes
    ) -> List[Dict]:
        """
        Get available time slots for a doctor on a specific date
        """
        
        # Check if date is in time off
        time_off = DoctorTimeOff.query.filter(
            and_(
                DoctorTimeOff.doctor_id == doctor_id,
                DoctorTimeOff.start_date <= date,
                DoctorTimeOff.end_date >= date
            )
        ).first()
        
        if time_off:
            return []  # Doctor not available on this day
        
        # Get doctor's schedule for this day of week
        day_of_week = date.weekday()
        schedules = DoctorAvailability.query.filter_by(
            doctor_id=doctor_id,
            day_of_week=day_of_week,
            is_active=True
        ).all()
        
        if not schedules:
            return []
        
        # Get existing appointments for this date
        appointments = Appointment.query.filter(
            and_(
                Appointment.doctor_id == doctor_id,
                func.date(Appointment.scheduled_at) == date.date(),
                Appointment.status.in_(['scheduled', 'ongoing'])
            )
        ).all()
        
        booked_times = set()
        for apt in appointments:
            # Assume each appointment takes slot_duration minutes
            start = apt.scheduled_at
            booked_times.add((start.hour, start.minute))
        
        # Generate available slots
        available_slots = []
        for schedule in schedules:
            current_time = datetime.combine(date.date(), schedule.start_time)
            end_time = datetime.combine(date.date(), schedule.end_time)
            
            while current_time + timedelta(minutes=slot_duration) <= end_time:
                time_key = (current_time.hour, current_time.minute)
                
                if time_key not in booked_times:
                    available_slots.append({
                        'time': current_time.strftime('%H:%M'),
                        'datetime': current_time.isoformat(),
                        'is_available': True
                    })
                
                current_time += timedelta(minutes=slot_duration)
        
        return available_slots
    
    @staticmethod
    def add_time_off(
        doctor_id: int,
        start_date: datetime,
        end_date: datetime,
        reason: Optional[str] = None
    ) -> DoctorTimeOff:
        """Add time off for a doctor"""
        
        time_off = DoctorTimeOff(
            doctor_id=doctor_id,
            start_date=start_date,
            end_date=end_date,
            reason=reason
        )
        
        db.session.add(time_off)
        db.session.commit()
        
        return time_off
    
    @staticmethod
    def check_slot_availability(
        doctor_id: int,
        requested_time: datetime,
        slot_duration: int = 30
    ) -> bool:
        """Check if a specific time slot is available"""
        
        # Check time off
        time_off = DoctorTimeOff.query.filter(
            and_(
                DoctorTimeOff.doctor_id == doctor_id,
                DoctorTimeOff.start_date <= requested_time,
                DoctorTimeOff.end_date >= requested_time
            )
        ).first()
        
        if time_off:
            return False
        
        # Check if within doctor's schedule
        day_of_week = requested_time.weekday()
        requested_time_only = requested_time.time()
        
        schedule = DoctorAvailability.query.filter(
            and_(
                DoctorAvailability.doctor_id == doctor_id,
                DoctorAvailability.day_of_week == day_of_week,
                DoctorAvailability.start_time <= requested_time_only,
                DoctorAvailability.end_time >= requested_time_only,
                DoctorAvailability.is_active == True
            )
        ).first()
        
        if not schedule:
            return False
        
        # Check existing appointments
        conflict = Appointment.query.filter(
            and_(
                Appointment.doctor_id == doctor_id,
                Appointment.scheduled_at >= requested_time - timedelta(minutes=slot_duration),
                Appointment.scheduled_at <= requested_time + timedelta(minutes=slot_duration),
                Appointment.status.in_(['scheduled', 'ongoing'])
            )
        ).first()
        
        return conflict is None

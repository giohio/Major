"""
Doctor Review Routes
Endpoints for submitting and viewing doctor reviews
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.review_service import ReviewService, AvailabilityService
from app.middleware.role_middleware import role_required
from datetime import datetime

review_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')


@review_bp.route('/doctor/<int:doctor_id>', methods=['POST'])
@jwt_required()
def create_review(doctor_id):
    """
    Submit a review for a doctor
    ---
    Body:
        rating (int): 1-5 stars (required)
        review_text (str): Review comment (optional)
        appointment_id (int): Related appointment ID (optional)
        professionalism (int): 1-5 rating (optional)
        communication (int): 1-5 rating (optional)
        effectiveness (int): 1-5 rating (optional)
        is_anonymous (bool): Anonymous review (default: false)
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        rating = data.get('rating')
        if not rating or not isinstance(rating, int) or not 1 <= rating <= 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        review = ReviewService.create_review(
            user_id=user_id,
            doctor_id=doctor_id,
            rating=rating,
            review_text=data.get('review_text'),
            appointment_id=data.get('appointment_id'),
            professionalism=data.get('professionalism'),
            communication=data.get('communication'),
            effectiveness=data.get('effectiveness'),
            is_anonymous=data.get('is_anonymous', False)
        )
        
        return jsonify({
            'message': 'Review submitted successfully',
            'review': review.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to submit review', 'details': str(e)}), 500


@review_bp.route('/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor_reviews(doctor_id):
    """
    Get reviews for a doctor
    ---
    Query params:
        limit (int): Number of reviews (default: 10)
        offset (int): Pagination offset (default: 0)
        verified_only (bool): Only show verified reviews (default: false)
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        offset = request.args.get('offset', 0, type=int)
        verified_only = request.args.get('verified_only', 'false').lower() == 'true'
        
        reviews, pagination = ReviewService.get_doctor_reviews(
            doctor_id=doctor_id,
            limit=limit,
            offset=offset,
            verified_only=verified_only
        )
        
        return jsonify({
            'reviews': [r.to_dict() for r in reviews],
            'pagination': pagination
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch reviews', 'details': str(e)}), 500


@review_bp.route('/doctor/<int:doctor_id>/stats', methods=['GET'])
def get_review_stats(doctor_id):
    """
    Get review statistics for a doctor
    Returns average rating, count, rating distribution, etc.
    """
    try:
        stats = ReviewService.get_review_stats(doctor_id)
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch stats', 'details': str(e)}), 500


# Availability endpoints
@review_bp.route('/doctor/<int:doctor_id>/availability', methods=['POST'])
@jwt_required()
@role_required('doctor')
def set_availability(doctor_id):
    """
    Set weekly availability schedule (doctor only)
    ---
    Body:
        schedule: [
            {
                "day_of_week": 1,  // 0=Monday, 6=Sunday
                "start_time": "09:00",
                "end_time": "17:00",
                "is_active": true
            }
        ]
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Verify doctor owns this profile
        from app.models.models import DoctorProfile
        doctor = DoctorProfile.query.get(doctor_id)
        if not doctor or doctor.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        schedule = data.get('schedule', [])
        if not schedule:
            return jsonify({'error': 'Schedule is required'}), 400
        
        availabilities = AvailabilityService.set_weekly_schedule(doctor_id, schedule)
        
        return jsonify({
            'message': 'Availability updated successfully',
            'schedule': [a.to_dict() for a in availabilities]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to update availability', 'details': str(e)}), 500


@review_bp.route('/doctor/<int:doctor_id>/slots', methods=['GET'])
def get_available_slots(doctor_id):
    """
    Get available time slots for a specific date
    ---
    Query params:
        date (str): Date in YYYY-MM-DD format (required)
        slot_duration (int): Slot duration in minutes (default: 30)
    """
    try:
        date_str = request.args.get('date')
        if not date_str:
            return jsonify({'error': 'Date is required'}), 400
        
        date = datetime.strptime(date_str, '%Y-%m-%d')
        slot_duration = request.args.get('slot_duration', 30, type=int)
        
        slots = AvailabilityService.get_available_slots(
            doctor_id=doctor_id,
            date=date,
            slot_duration=slot_duration
        )
        
        return jsonify({
            'date': date_str,
            'slots': slots,
            'total_slots': len(slots)
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to fetch slots', 'details': str(e)}), 500


@review_bp.route('/doctor/<int:doctor_id>/time-off', methods=['POST'])
@jwt_required()
@role_required('doctor')
def add_time_off(doctor_id):
    """
    Add time off for a doctor
    ---
    Body:
        start_date (str): Start date in ISO format (required)
        end_date (str): End date in ISO format (required)
        reason (str): Reason for time off (optional)
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Verify doctor owns this profile
        from app.models.models import DoctorProfile
        doctor = DoctorProfile.query.get(doctor_id)
        if not doctor or doctor.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        start_date = datetime.fromisoformat(data.get('start_date'))
        end_date = datetime.fromisoformat(data.get('end_date'))
        
        time_off = AvailabilityService.add_time_off(
            doctor_id=doctor_id,
            start_date=start_date,
            end_date=end_date,
            reason=data.get('reason')
        )
        
        return jsonify({
            'message': 'Time off added successfully',
            'time_off': time_off.to_dict()
        }), 201
        
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to add time off', 'details': str(e)}), 500


@review_bp.route('/doctor/<int:doctor_id>/check-slot', methods=['POST'])
def check_slot_availability(doctor_id):
    """
    Check if a specific time slot is available
    ---
    Body:
        requested_time (str): DateTime in ISO format (required)
        slot_duration (int): Duration in minutes (default: 30)
    """
    try:
        data = request.get_json()
        requested_time = datetime.fromisoformat(data.get('requested_time'))
        slot_duration = data.get('slot_duration', 30)
        
        is_available = AvailabilityService.check_slot_availability(
            doctor_id=doctor_id,
            requested_time=requested_time,
            slot_duration=slot_duration
        )
        
        return jsonify({
            'is_available': is_available,
            'requested_time': requested_time.isoformat()
        }), 200
        
    except ValueError:
        return jsonify({'error': 'Invalid datetime format'}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to check availability', 'details': str(e)}), 500

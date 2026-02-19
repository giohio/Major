from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.models import Exercise, UserExerciseProgress, User
from datetime import datetime, timedelta
from sqlalchemy import func
from app.utils.cache import cache_response

exercise_bp = Blueprint('exercise', __name__)


@exercise_bp.route('/exercises', methods=['GET'])
@jwt_required()
@cache_response(timeout=3600)  # Cache for 1 hour
def get_exercises():
    """Get list of all active exercises with optional filtering"""
    try:
        category = request.args.get('category')
        difficulty = request.args.get('difficulty')
        search = request.args.get('search', '').strip()
        
        query = Exercise.query.filter_by(is_active=True)
        
        # Apply filters
        if category:
            query = query.filter_by(category=category)
        
        if difficulty:
            query = query.filter_by(difficulty=difficulty)
        
        if search:
            query = query.filter(
                db.or_(
                    Exercise.title.ilike(f'%{search}%'),
                    Exercise.description.ilike(f'%{search}%')
                )
            )
        
        exercises = query.order_by(Exercise.category, Exercise.difficulty).all()
        
        return jsonify({
            'exercises': [exercise.to_dict() for exercise in exercises],
            'total': len(exercises)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@exercise_bp.route('/exercises/<int:exercise_id>', methods=['GET'])
@jwt_required()
def get_exercise(exercise_id):
    """Get detailed information about a specific exercise"""
    try:
        exercise = Exercise.query.get(exercise_id)
        
        if not exercise:
            return jsonify({'error': 'Exercise not found'}), 404
        
        if not exercise.is_active:
            return jsonify({'error': 'Exercise is not available'}), 404
        
        return jsonify({'exercise': exercise.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@exercise_bp.route('/exercises/categories', methods=['GET'])
@jwt_required()
@cache_response(timeout=86400)  # Cache for 24 hours
def get_categories():
    """Get list of all exercise categories"""
    try:
        categories = db.session.query(Exercise.category).filter_by(is_active=True).distinct().all()
        category_list = [cat[0] for cat in categories]
        
        return jsonify({
            'categories': category_list,
            'total': len(category_list)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@exercise_bp.route('/users/exercises/progress', methods=['GET'])
@jwt_required()
def get_user_progress():
    """Get user's exercise progress for all exercises"""
    try:
        user_id = int(get_jwt_identity())
        
        # Get all active exercises
        exercises = Exercise.query.filter_by(is_active=True).all()
        
        # Get user's progress for all exercises
        progress_records = UserExerciseProgress.query.filter_by(user_id=user_id).all()
        progress_dict = {p.exercise_id: p for p in progress_records}
        
        # Combine exercise data with progress
        result = []
        for exercise in exercises:
            exercise_data = exercise.to_dict()
            progress = progress_dict.get(exercise.id)
            
            if progress:
                exercise_data['progress'] = progress.to_dict()
            else:
                exercise_data['progress'] = {
                    'status': 'not_started',
                    'progress_percentage': 0,
                    'times_completed': 0,
                    'total_time_spent_minutes': 0
                }
            
            result.append(exercise_data)
        
        return jsonify({
            'exercises': result,
            'total': len(result)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@exercise_bp.route('/users/exercises/<int:exercise_id>/start', methods=['POST'])
@jwt_required()
def start_exercise(exercise_id):
    """Mark an exercise as started"""
    try:
        user_id = int(get_jwt_identity())
        
        # Check if exercise exists
        exercise = Exercise.query.get(exercise_id)
        if not exercise or not exercise.is_active:
            return jsonify({'error': 'Exercise not found'}), 404
        
        # Get or create progress record
        progress = UserExerciseProgress.query.filter_by(
            user_id=user_id,
            exercise_id=exercise_id
        ).first()
        
        if not progress:
            progress = UserExerciseProgress(
                user_id=user_id,
                exercise_id=exercise_id,
                status='in_progress',
                started_at=datetime.utcnow(),
                last_practiced_at=datetime.utcnow()
            )
            db.session.add(progress)
        else:
            progress.status = 'in_progress'
            progress.last_practiced_at = datetime.utcnow()
            if not progress.started_at:
                progress.started_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Exercise started',
            'progress': progress.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@exercise_bp.route('/users/exercises/<int:exercise_id>/complete', methods=['POST'])
@jwt_required()
def complete_exercise(exercise_id):
    """Mark an exercise as completed"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # Check if exercise exists
        exercise = Exercise.query.get(exercise_id)
        if not exercise or not exercise.is_active:
            return jsonify({'error': 'Exercise not found'}), 404
        
        # Get or create progress record
        progress = UserExerciseProgress.query.filter_by(
            user_id=user_id,
            exercise_id=exercise_id
        ).first()
        
        if not progress:
            progress = UserExerciseProgress(
                user_id=user_id,
                exercise_id=exercise_id
            )
            db.session.add(progress)
        
        # Update progress
        progress.status = 'completed'
        progress.progress_percentage = 100
        progress.completed_at = datetime.utcnow()
        progress.last_practiced_at = datetime.utcnow()
        progress.times_completed += 1
        
        # Add time spent (from request or use exercise duration)
        time_spent = data.get('time_spent_minutes', exercise.duration_minutes)
        progress.total_time_spent_minutes += time_spent
        
        # Add notes if provided
        if data.get('notes'):
            progress.notes = data.get('notes')
        
        if not progress.started_at:
            progress.started_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Exercise completed',
            'progress': progress.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@exercise_bp.route('/users/exercises/<int:exercise_id>/progress', methods=['PUT'])
@jwt_required()
def update_progress(exercise_id):
    """Update exercise progress"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Check if exercise exists
        exercise = Exercise.query.get(exercise_id)
        if not exercise or not exercise.is_active:
            return jsonify({'error': 'Exercise not found'}), 404
        
        # Get or create progress record
        progress = UserExerciseProgress.query.filter_by(
            user_id=user_id,
            exercise_id=exercise_id
        ).first()
        
        if not progress:
            progress = UserExerciseProgress(
                user_id=user_id,
                exercise_id=exercise_id
            )
            db.session.add(progress)
        
        # Update fields
        if 'progress_percentage' in data:
            progress.progress_percentage = min(100, max(0, data['progress_percentage']))
        
        if 'notes' in data:
            progress.notes = data['notes']
        
        if 'status' in data and data['status'] in ['not_started', 'in_progress', 'completed']:
            progress.status = data['status']
        
        progress.last_practiced_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Progress updated',
            'progress': progress.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@exercise_bp.route('/users/exercises/stats', methods=['GET'])
@jwt_required()
def get_exercise_stats():
    """Get user's exercise statistics"""
    try:
        user_id = get_jwt_identity()
        
        # Get all progress records
        progress_records = UserExerciseProgress.query.filter_by(user_id=user_id).all()
        
        # Calculate statistics
        total_exercises = Exercise.query.filter_by(is_active=True).count()
        completed_exercises = len([p for p in progress_records if p.status == 'completed'])
        in_progress_exercises = len([p for p in progress_records if p.status == 'in_progress'])
        
        total_completions = sum(p.times_completed for p in progress_records)
        total_time_minutes = sum(p.total_time_spent_minutes for p in progress_records)
        
        # Calculate streak (consecutive days with at least one exercise)
        streak = calculate_streak(user_id)
        
        # Get recent activity
        recent_progress = UserExerciseProgress.query.filter_by(user_id=user_id)\
            .filter(UserExerciseProgress.last_practiced_at.isnot(None))\
            .order_by(UserExerciseProgress.last_practiced_at.desc())\
            .limit(5)\
            .all()
        
        recent_activity = []
        for p in recent_progress:
            exercise = Exercise.query.get(p.exercise_id)
            if exercise:
                recent_activity.append({
                    'exercise': exercise.to_dict(),
                    'last_practiced': p.last_practiced_at.isoformat() if p.last_practiced_at else None,
                    'times_completed': p.times_completed
                })
        
        return jsonify({
            'stats': {
                'total_exercises': total_exercises,
                'completed_exercises': completed_exercises,
                'in_progress_exercises': in_progress_exercises,
                'completion_rate': round((completed_exercises / total_exercises * 100) if total_exercises > 0 else 0, 1),
                'total_completions': total_completions,
                'total_time_minutes': total_time_minutes,
                'total_time_hours': round(total_time_minutes / 60, 1),
                'streak_days': streak,
                'average_progress': round(sum(p.progress_percentage for p in progress_records) / len(progress_records) if progress_records else 0, 1)
            },
            'recent_activity': recent_activity
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@exercise_bp.route('/users/exercises/<int:exercise_id>/favorite', methods=['POST'])
@jwt_required()
def toggle_favorite(exercise_id):
    """Toggle exercise as favorite/unfavorite"""
    try:
        user_id = get_jwt_identity()
        
        # Check if exercise exists
        exercise = Exercise.query.get(exercise_id)
        if not exercise or not exercise.is_active:
            return jsonify({'error': 'Exercise not found'}), 404
        
        # Get or create progress record
        progress = UserExerciseProgress.query.filter_by(
            user_id=user_id,
            exercise_id=exercise_id
        ).first()
        
        if not progress:
            progress = UserExerciseProgress(
                user_id=user_id,
                exercise_id=exercise_id,
                is_favorite=True
            )
            db.session.add(progress)
            message = 'Added to favorites'
        else:
            progress.is_favorite = not progress.is_favorite
            message = 'Added to favorites' if progress.is_favorite else 'Removed from favorites'
        
        db.session.commit()
        
        return jsonify({
            'message': message,
            'is_favorite': progress.is_favorite
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


def calculate_streak(user_id):
    """Calculate consecutive days streak for exercise practice"""
    try:
        # Get all practice dates (distinct days)
        progress_records = UserExerciseProgress.query.filter_by(user_id=user_id)\
            .filter(UserExerciseProgress.last_practiced_at.isnot(None))\
            .order_by(UserExerciseProgress.last_practiced_at.desc())\
            .all()
        
        if not progress_records:
            return 0
        
        # Extract unique dates
        practice_dates = set()
        for record in progress_records:
            if record.last_practiced_at:
                practice_dates.add(record.last_practiced_at.date())
        
        if not practice_dates:
            return 0
        
        # Sort dates in descending order
        sorted_dates = sorted(practice_dates, reverse=True)
        
        # Check if today or yesterday is in the list
        today = datetime.utcnow().date()
        yesterday = today - timedelta(days=1)
        
        if sorted_dates[0] not in [today, yesterday]:
            return 0
        
        # Calculate streak
        streak = 1
        current_date = sorted_dates[0]
        
        for i in range(1, len(sorted_dates)):
            expected_date = current_date - timedelta(days=1)
            if sorted_dates[i] == expected_date:
                streak += 1
                current_date = sorted_dates[i]
            else:
                break
        
        return streak
        
    except Exception as e:
        print(f"Error calculating streak: {e}")
        return 0

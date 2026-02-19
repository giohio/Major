from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.middleware.role_middleware import doctor_required
from app.models.models import User, PatientRecord, DoctorNote, Task, TherapySession, Alert, ChatMessage, ChatSession, Appointment
from app.extensions import db
from app.utils.cache import cache_response
from datetime import datetime, timedelta
import os

bp = Blueprint('doctors', __name__)

@bp.route('/dashboard', methods=['GET'])
@doctor_required
def get_dashboard(current_user):
    """Get doctor dashboard overview"""
    try:
        from app.models.models import DoctorProfile
        
        # Get doctor profile first
        doctor_profile = DoctorProfile.query.filter_by(user_id=current_user.id).first()
        if not doctor_profile:
            return jsonify({'error': 'Doctor profile not found'}), 404
            
        doctor_id = doctor_profile.id
        
        # Get doctor's patients
        patients = PatientRecord.query.filter_by(doctor_id=doctor_id).all()
        patient_count = len(patients)
        patient_ids = [p.user_id for p in patients] if patients else []
        
        # Get active alerts for doctor's patients
        if patient_ids:
            active_alerts = Alert.query.filter(
                Alert.user_id.in_(patient_ids),
                Alert.is_resolved == False
            ).order_by(Alert.created_at.desc()).limit(10).all()
        else:
            active_alerts = []
        
        critical_alerts_count = sum(1 for alert in active_alerts if alert.severity == 'critical')
        
        # Get today's appointments
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        today_appointments = Appointment.query.filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date >= today_start,
            Appointment.appointment_date < today_end
        ).all()
        
        pending_appointments = sum(1 for apt in today_appointments if apt.status == 'pending')
        
        # Get upcoming appointments with patient info
        upcoming_appointments = Appointment.query.filter(
            Appointment.doctor_id == doctor_id,
            Appointment.appointment_date >= datetime.utcnow(),
            Appointment.status.in_(['pending', 'confirmed', 'scheduled'])
        ).order_by(Appointment.appointment_date.asc()).limit(10).all()
        
        appointments_with_patient = []
        for apt in upcoming_appointments:
            apt_dict = apt.to_dict()
            patient_user = db.session.get(User, apt.user_id)
            if patient_user:
                apt_dict['patient_name'] = patient_user.full_name
                apt_dict['patient_avatar'] = patient_user.avatar_url
            appointments_with_patient.append(apt_dict)
        
        # Get upcoming sessions  
        upcoming_sessions = TherapySession.query.filter_by(
            doctor_id=doctor_id,
            status='scheduled'
        ).filter(
            TherapySession.start_time >= datetime.utcnow()
        ).order_by(TherapySession.start_time.asc()).limit(5).all()
        
        # Get recent notes
        recent_notes = DoctorNote.query.filter_by(
            doctor_id=doctor_id
        ).order_by(DoctorNote.created_at.desc()).limit(5).all()
        
        # Calculate improvement rate (placeholder - can be enhanced)
        improvement_rate = 76  # TODO: Calculate based on patient progress
        
        return jsonify({
            'stats': {
                'patient_count': patient_count,
                'today_appointments': len(today_appointments),
                'pending_appointments': pending_appointments,
                'critical_alerts': critical_alerts_count,
                'improvement_rate': improvement_rate
            },
            'upcoming_appointments': appointments_with_patient,
            'active_alerts': [alert.to_dict() for alert in active_alerts],
            'upcoming_sessions': [session.to_dict() for session in upcoming_sessions],
            'recent_notes': [note.to_dict() for note in recent_notes]
        }), 200
        
    except Exception as e:
        print(f"[DOCTOR_DASHBOARD] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@bp.route('', methods=['GET'], strict_slashes=False)
@jwt_required()
@cache_response(timeout=600)  # Cache for 10 minutes
def get_all_doctors():
    """Get list of all available doctors"""
    try:
        from app.models.models import DoctorProfile, User
        from app.services.review_service import ReviewService
        
        # Get all doctors with their user info
        doctors = db.session.query(DoctorProfile, User).join(User).filter(
            User.role == 'doctor',
            User.is_active == True,
            DoctorProfile.is_verified == True
        ).all()
        
        result = []
        for profile, user in doctors:
            doctor_data = profile.to_dict()
            doctor_data['name'] = user.full_name
            doctor_data['avatar_url'] = user.avatar_url
            doctor_data['email'] = user.email
            
            # Get review stats
            review_stats = ReviewService.get_review_stats(profile.id)
            doctor_data['reviews'] = review_stats['review_count']
            doctor_data['rating'] = review_stats['average_rating']
            
            # Format price
            doctor_data['price'] = float(profile.consultation_fee)
            
            # Parse languages
            if isinstance(doctor_data['languages'], str):
                doctor_data['languages'] = [lang.strip() for lang in doctor_data['languages'].split(',')]
            else:
                doctor_data['languages'] = []
                
            # Mock availability for now
            doctor_data['available'] = profile.is_available
            doctor_data['nextSlot'] = 'Hôm nay' # Placeholder
            
            # Map fields for frontend
            doctor_data['specialty'] = profile.specialization
            doctor_data['experience'] = profile.years_of_experience
            doctor_data['verified'] = profile.is_verified
            
            result.append(doctor_data)
            
        return jsonify({'doctors': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500






@bp.route('/<int:doctor_id>', methods=['GET'])
@jwt_required()
def get_doctor_details(doctor_id):
    """Get details of a specific doctor"""
    try:
        from app.models.models import DoctorProfile, User
        
        # Get doctor profile
        # Note: doctor_id here likely refers to the User ID of the doctor (as used in frontend links)
        # But let's check if frontend passes User ID or DoctorProfile ID.
        # In FindDoctor.tsx: key={doctor.id}. doctor.id usually comes from backend.
        # My get_all_doctors returns profile.to_dict() which has 'id' (DoctorProfile ID) and 'user_id'.
        # But usually we link by User ID or Profile ID.
        # Let's assume it's DoctorProfile ID for now, but check if we can find by User ID too.
        
        # Actually, let's look at get_all_doctors again.
        # doctor_data = profile.to_dict() -> 'id' is profile.id.
        # So the frontend uses profile.id.
        
        profile = db.session.get(DoctorProfile, doctor_id)
        
        if not profile:
            return jsonify({'error': 'Doctor not found'}), 404
            
        user = db.session.get(User, profile.user_id)
        
        if not user or not user.is_active:
             return jsonify({'error': 'Doctor not active'}), 404

        doctor_data = profile.to_dict()
        doctor_data['name'] = user.full_name
        doctor_data['avatar_url'] = user.avatar_url
        doctor_data['email'] = user.email
        doctor_data['image'] = user.avatar_url # Frontend uses 'image' in BookAppointment
        
        # Get review stats
        from app.services.review_service import ReviewService
        review_stats = ReviewService.get_review_stats(profile.id)
        doctor_data['reviews'] = review_stats['review_count']
        doctor_data['rating'] = review_stats['average_rating']
        doctor_data['rating_breakdown'] = {
            'professionalism': review_stats['avg_professionalism'],
            'communication': review_stats['avg_communication'],
            'effectiveness': review_stats['avg_effectiveness']
        }
        doctor_data['rating_distribution'] = review_stats['rating_distribution']
        
        # Format price
        doctor_data['price'] = float(profile.consultation_fee)
        
        # Parse languages
        if isinstance(doctor_data['languages'], str):
            doctor_data['languages'] = [lang.strip() for lang in doctor_data['languages'].split(',')]
        else:
            doctor_data['languages'] = []
            
        # Mock availability
        doctor_data['available'] = profile.is_available
        doctor_data['nextSlot'] = 'Hôm nay'
        
        # Map fields
        doctor_data['specialty'] = profile.specialization
        doctor_data['experience'] = profile.years_of_experience
        doctor_data['verified'] = profile.is_verified
        
        return jsonify(doctor_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@bp.route('/patients', methods=['GET'])
@doctor_required
def get_patients(current_user):
    """Get list of doctor's patients"""
    try:
        patients = PatientRecord.query.filter_by(doctor_id=current_user.id).all()
        
        # Track seen user_ids to avoid duplicates
        seen_user_ids = set()
        result = []
        
        for record in patients:
            # Skip if we've already added this patient
            if record.user_id in seen_user_ids:
                continue
            
            patient = db.session.get(User, record.user_id)
            if patient:
                seen_user_ids.add(record.user_id)
                patient_data = patient.to_dict()
                patient_data['record'] = record.to_dict()
                
                # Count appointments for this patient with this doctor
                appointment_count = Appointment.query.filter_by(
                    user_id=patient.id,
                    doctor_id=current_user.id
                ).count()
                patient_data['appointment_count'] = appointment_count
                
                # Add recent activity
                recent_chats = ChatSession.query.filter_by(
                    user_id=patient.id
                ).order_by(ChatSession.updated_at.desc()).limit(1).first()
                
                patient_data['last_activity'] = recent_chats.updated_at.isoformat() if recent_chats else None
                
                # Risk level based on appointment count and recent activity
                if appointment_count > 5 or (recent_chats and recent_chats.status == 'active'):
                    patient_data['risk_level'] = 'high'
                elif appointment_count > 2:
                    patient_data['risk_level'] = 'medium'
                else:
                    patient_data['risk_level'] = 'low'
                
                result.append(patient_data)
        
        return jsonify({'patients': result}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/users/search', methods=['GET'])
@doctor_required
def search_users(current_user):
    """Search for users to add as patients"""
    try:
        query = request.args.get('query', '').strip()
        
        if not query or len(query) < 3:
            return jsonify({'users': []}), 200
            
        # Search by email or phone
        # Exclude users who are already patients of this doctor
        # And exclude admins/doctors
        
        # Get current patient IDs
        current_patient_ids = [
            r.user_id for r in PatientRecord.query.filter_by(doctor_id=current_user.id).all()
        ]
        
        users = User.query.filter(
            (User.email.ilike(f"%{query}%")) | (User.phone.ilike(f"%{query}%")),
            User.role == 'user',
            User.is_active == True,
            ~User.id.in_(current_patient_ids)
        ).limit(10).all()
        
        return jsonify({
            'users': [{
                'id': u.id,
                'full_name': u.full_name,
                'email': u.email,
                'phone': u.phone,
                'avatar_url': u.avatar_url
            } for u in users]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/patients/add', methods=['POST'])
@doctor_required
def add_patient(current_user):
    """Add a patient to doctor's care"""
    try:
        data = request.get_json()
        
        if 'patient_id' not in data:
            return jsonify({'error': 'Patient ID is required'}), 400
        
        patient_id = data['patient_id']
        
        # Check if patient exists
        patient = db.session.get(User, patient_id)
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Check if record already exists
        existing_record = PatientRecord.query.filter_by(
            user_id=patient_id,
            doctor_id=current_user.id
        ).first()
        
        if existing_record:
            return jsonify({'error': 'Patient already assigned to you'}), 409
        
        # Create or update patient record
        record = PatientRecord.query.filter_by(user_id=patient_id).first()
        
        if not record:
            record = PatientRecord(user_id=patient_id)
            db.session.add(record)
        
        record.doctor_id = current_user.id
        db.session.commit()
        
        return jsonify({
            'message': 'Patient added successfully',
            'patient': patient.to_dict(),
            'record': record.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/patients/<int:patient_id>', methods=['GET'])
@doctor_required
def get_patient(current_user, patient_id):
    """Get detailed patient information"""
    try:
        # Verify patient is assigned to this doctor
        record = PatientRecord.query.filter_by(
            user_id=patient_id,
            doctor_id=current_user.id
        ).first()
        
        if not record:
            return jsonify({'error': 'Patient not found or not assigned to you'}), 404
        
        patient = db.session.get(User, patient_id)
        
        # Get recent emotion data from chat messages
        emotion_messages = db.session.query(ChatMessage)\
            .join(ChatSession)\
            .filter(
                ChatSession.user_id == patient_id,
                ChatMessage.role == 'user',
                ChatMessage.emotion_detected.isnot(None)
            ).order_by(ChatMessage.created_at.desc()).limit(30).all()
        
        # Get alerts
        alerts = Alert.query.filter_by(
            user_id=patient_id
        ).order_by(Alert.created_at.desc()).limit(20).all()
        
        # Get notes
        notes = DoctorNote.query.filter_by(
            patient_id=patient_id,
            doctor_id=current_user.id
        ).order_by(DoctorNote.created_at.desc()).all()
        
        # Get tasks
        tasks = Task.query.filter_by(
            patient_id=patient_id
        ).order_by(Task.created_at.desc()).all()
        
        # Get sessions
        sessions = TherapySession.query.filter_by(
            patient_id=patient_id,
            doctor_id=current_user.id
        ).order_by(TherapySession.created_at.desc()).all()
        
        return jsonify({
            'patient': patient.to_dict(),
            'record': record.to_dict(),
            'emotion_logs': [{
                'id': msg.id,
                'emotion': msg.emotion_detected,
                'sentiment_score': float(msg.sentiment_score) if msg.sentiment_score else 0,
                'risk_level': msg.risk_level,
                'created_at': msg.created_at.isoformat()
            } for msg in emotion_messages],
            'alerts': [alert.to_dict() for alert in alerts],
            'notes': [note.to_dict() for note in notes],
            'tasks': [task.to_dict() for task in tasks],
            'sessions': [session.to_dict() for session in sessions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/notes', methods=['POST'])
@doctor_required
def create_note(current_user):
    """Create a doctor's note"""
    try:
        data = request.get_json()
        
        required_fields = ['patient_id', 'note_type', 'title', 'content']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Verify patient is assigned to this doctor
        record = PatientRecord.query.filter_by(
            user_id=data['patient_id'],
            doctor_id=current_user.id
        ).first()
        
        if not record:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        note = DoctorNote(
            doctor_id=current_user.id,
            patient_id=data['patient_id'],
            session_id=data.get('session_id'),
            note_type=data['note_type'],
            title=data['title'],
            content=data['content'],
            is_private=data.get('is_private', True)
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({
            'message': 'Note created successfully',
            'note': note.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/tasks', methods=['POST'])
@doctor_required
def create_task(current_user):
    """Create a task/exercise for patient"""
    try:
        data = request.get_json()
        
        required_fields = ['patient_id', 'title', 'task_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Verify patient is assigned to this doctor
        record = PatientRecord.query.filter_by(
            user_id=data['patient_id'],
            doctor_id=current_user.id
        ).first()
        
        if not record:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        task = Task(
            patient_id=data['patient_id'],
            assigned_by=current_user.id,
            exercise_id=data.get('exercise_id'),
            title=data['title'],
            description=data.get('description'),
            task_type=data['task_type'],
            due_date=datetime.fromisoformat(data['due_date']) if 'due_date' in data else None,
            status='pending'
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'message': 'Task created successfully',
            'task': task.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/alerts', methods=['GET'])
@doctor_required
def get_alerts(current_user):
    """Get alerts for doctor's patients"""
    try:
        # Get doctor's patients
        patients = PatientRecord.query.filter_by(doctor_id=current_user.id).all()
        patient_ids = [p.user_id for p in patients]
        
        # Filter parameters
        severity = request.args.get('severity')
        include_resolved = request.args.get('include_resolved', 'false').lower() == 'true'
        
        query = Alert.query.filter(Alert.user_id.in_(patient_ids))
        
        if severity:
            query = query.filter_by(severity=severity)
        
        if not include_resolved:
            query = query.filter_by(is_resolved=False)
        
        alerts = query.order_by(Alert.created_at.desc()).all()
        
        result = []
        for alert in alerts:
            alert_data = alert.to_dict()
            patient = db.session.get(User, alert.user_id)
            if patient:
                alert_data['patient_name'] = patient.full_name
            result.append(alert_data)
        
        return jsonify({
            'alerts': result
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/session/start', methods=['POST'])
@doctor_required
def start_session(current_user):
    """Start a therapy session"""
    try:
        data = request.get_json()
        
        required_fields = ['patient_id', 'session_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Verify patient is assigned to this doctor
        record = PatientRecord.query.filter_by(
            user_id=data['patient_id'],
            doctor_id=current_user.id
        ).first()
        
        if not record:
            return jsonify({'error': 'Patient not assigned to you'}), 403
        
        session = TherapySession(
            doctor_id=current_user.id,
            patient_id=data['patient_id'],
            appointment_id=data.get('appointment_id'),
            session_type=data['session_type'],
            status='in_progress',
            start_time=datetime.utcnow()
        )
        
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'message': 'Session started',
            'session': session.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/session/<int:session_id>/end', methods=['POST'])
@doctor_required
def end_session(current_user, session_id):
    """End a therapy session"""
    try:
        session = db.session.get(TherapySession, session_id)
        
        if not session or session.doctor_id != current_user.id:
            return jsonify({'error': 'Session not found or unauthorized'}), 404
        
        data = request.get_json() or {}
        
        session.status = 'completed'
        session.end_time = datetime.utcnow()
        session.duration_minutes = int((session.end_time - session.start_time).total_seconds() / 60)
        
        if 'ai_summary' in data:
            session.ai_summary = data['ai_summary']
        if 'key_topics' in data:
            session.key_topics = data['key_topics']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Session ended successfully',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/appointments', methods=['GET'])
@doctor_required
def get_appointments(current_user):
    """Get appointments for doctor"""
    try:
        from app.models.models import Appointment, DoctorProfile
        
        # Get doctor profile
        doctor_profile = DoctorProfile.query.filter_by(user_id=current_user.id).first()
        if not doctor_profile:
            return jsonify({'error': 'Doctor profile not found'}), 404
        
        # Get appointments for this doctor
        appointments = Appointment.query.filter_by(doctor_id=doctor_profile.id).order_by(Appointment.appointment_date.desc()).all()
        
        # Get user names for each appointment
        result = []
        for apt in appointments:
            apt_dict = apt.to_dict()
            user = db.session.get(User, apt.user_id)
            if user:
                apt_dict['user_name'] = user.full_name
                apt_dict['user_email'] = user.email
                apt_dict['user_avatar_url'] = user.avatar_url
            result.append(apt_dict)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/appointments', methods=['POST'])
@doctor_required
def create_appointment(current_user):
    """Create a new appointment"""
    try:
        from app.models.models import Appointment, DoctorProfile
        
        data = request.get_json()
        
        required_fields = ['user_id', 'appointment_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get doctor profile
        doctor_profile = DoctorProfile.query.filter_by(user_id=current_user.id).first()
        if not doctor_profile:
            return jsonify({'error': 'Doctor profile not found'}), 404
        
        # Parse appointment date
        try:
            appointment_date = datetime.fromisoformat(data['appointment_date'].replace('Z', '+00:00'))
        except:
            return jsonify({'error': 'Invalid date format'}), 400
        
        # Create appointment
        appointment = Appointment(
            user_id=data['user_id'],
            doctor_id=doctor_profile.id,
            appointment_date=appointment_date,
            duration_minutes=data.get('duration_minutes', 60),
            status=data.get('status', 'scheduled'),
            appointment_type=data.get('appointment_type', 'video'),
            notes=data.get('notes')
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment created successfully',
            'appointment': appointment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/appointments/<int:appointment_id>', methods=['GET'])
@doctor_required
def get_appointment(current_user, appointment_id):
    """Get a single appointment"""
    try:
        from app.models.models import Appointment, DoctorProfile
        
        # Get doctor profile
        doctor_profile = DoctorProfile.query.filter_by(user_id=current_user.id).first()
        if not doctor_profile:
            return jsonify({'error': 'Doctor profile not found'}), 404
        
        appointment = db.session.get(Appointment, appointment_id)
        
        if not appointment or appointment.doctor_id != doctor_profile.id:
            return jsonify({'error': 'Appointment not found or unauthorized'}), 404
        
        apt_dict = appointment.to_dict()
        
        # Get user info
        user = db.session.get(User, appointment.user_id)
        if user:
            apt_dict['user_name'] = user.full_name
            apt_dict['patient_name'] = user.full_name
            apt_dict['user_email'] = user.email
        
        return jsonify(apt_dict), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/appointments/<int:appointment_id>', methods=['PUT'])
@doctor_required
def update_appointment(current_user, appointment_id):
    """Update an appointment"""
    try:
        from app.models.models import Appointment, DoctorProfile
        
        # Get doctor profile
        doctor_profile = DoctorProfile.query.filter_by(user_id=current_user.id).first()
        if not doctor_profile:
            return jsonify({'error': 'Doctor profile not found'}), 404
        
        appointment = db.session.get(Appointment, appointment_id)
        
        if not appointment or appointment.doctor_id != doctor_profile.id:
            return jsonify({'error': 'Appointment not found or unauthorized'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'status' in data:
            appointment.status = data['status']
        if 'doctor_notes' in data:
            appointment.doctor_notes = data['doctor_notes']
        if 'appointment_date' in data:
            try:
                appointment.appointment_date = datetime.fromisoformat(data['appointment_date'].replace('Z', '+00:00'))
            except:
                return jsonify({'error': 'Invalid date format'}), 400
        if 'duration_minutes' in data:
            appointment.duration_minutes = data['duration_minutes']
        
        appointment.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment updated successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/profile', methods=['GET'])
@doctor_required
def get_profile(current_user):
    """Get current doctor's profile"""
    try:
        from app.models.models import DoctorProfile
        
        profile = DoctorProfile.query.filter_by(user_id=current_user.id).first()
        
        if not profile:
            return jsonify({'error': 'Doctor profile not found'}), 404
        
        profile_data = profile.to_dict()
        profile_data['full_name'] = current_user.full_name
        profile_data['email'] = current_user.email
        profile_data['phone'] = current_user.phone
        profile_data['avatar_url'] = current_user.avatar_url
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/profile', methods=['PUT'])
@doctor_required
def update_profile(current_user):
    """Update doctor's profile"""
    try:
        from app.models.models import DoctorProfile
        from decimal import Decimal
        
        profile = DoctorProfile.query.filter_by(user_id=current_user.id).first()
        
        if not profile:
            return jsonify({'error': 'Doctor profile not found'}), 404
        
        data = request.get_json()
        
        # Update DoctorProfile fields
        if 'bio' in data:
            profile.bio = data['bio']
        if 'specialization' in data:
            profile.specialization = data['specialization']
        if 'years_of_experience' in data:
            profile.years_of_experience = int(data['years_of_experience'])
        if 'consultation_fee' in data:
            try:
                # Validate consultation fee is positive
                fee = float(data['consultation_fee'])
                if fee < 0:
                    return jsonify({'error': 'Consultation fee must be positive'}), 400
                profile.consultation_fee = Decimal(str(fee))
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid consultation fee format'}), 400
        if 'languages' in data:
            # Convert array to comma-separated string
            if isinstance(data['languages'], list):
                profile.languages = ', '.join(data['languages'])
            else:
                profile.languages = data['languages']
        if 'is_available' in data:
            profile.is_available = bool(data['is_available'])
        if 'education' in data:
            profile.education = data['education']
        if 'certifications' in data:
            profile.certifications = data['certifications']
        
        # Update User fields
        if 'full_name' in data:
            current_user.full_name = data['full_name']
        if 'phone' in data:
            current_user.phone = data['phone']
        if 'avatar_url' in data:
            current_user.avatar_url = data['avatar_url']
        
        profile.updated_at = datetime.utcnow()
        current_user.updated_at = datetime.utcnow()
        db.session.commit()
        
        profile_data = profile.to_dict()
        profile_data['full_name'] = current_user.full_name
        profile_data['email'] = current_user.email
        profile_data['phone'] = current_user.phone
        profile_data['avatar_url'] = current_user.avatar_url
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': profile_data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/avatar/upload', methods=['POST'])
@doctor_required
def upload_doctor_avatar(current_user):
    """Upload avatar image file for doctor"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_ext not in allowed_extensions:
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400
        
        # Check file size (5MB max)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            return jsonify({'error': 'File too large. Maximum size: 5MB'}), 400
        
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'avatars')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        import uuid
        unique_filename = f"{current_user.id}_{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Update user avatar_url
        avatar_url = f"/uploads/avatars/{unique_filename}"
        current_user.avatar_url = avatar_url
        current_user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Avatar uploaded successfully',
            'avatar_url': avatar_url
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

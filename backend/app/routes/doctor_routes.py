from flask import Blueprint, request, jsonify
from app.middleware.role_middleware import doctor_required
from app.models.models import User, PatientRecord, DoctorNote, Task, TherapySession, Alert, EmotionLog, ChatSession
from app.extensions import db
from datetime import datetime, timedelta

bp = Blueprint('doctors', __name__)

@bp.route('/dashboard', methods=['GET'])
@doctor_required
def get_dashboard(current_user):
    """Get doctor dashboard overview"""
    try:
        # Get doctor's patients
        patients = PatientRecord.query.filter_by(doctor_id=current_user.id).all()
        patient_count = len(patients)
        
        # Get active alerts for doctor's patients
        patient_ids = [p.user_id for p in patients]
        active_alerts = Alert.query.filter(
            Alert.user_id.in_(patient_ids),
            Alert.is_resolved == False
        ).order_by(Alert.created_at.desc()).limit(10).all()
        
        # Get upcoming sessions
        upcoming_sessions = TherapySession.query.filter_by(
            doctor_id=current_user.id,
            status='scheduled'
        ).filter(
            TherapySession.start_time >= datetime.utcnow()
        ).order_by(TherapySession.start_time.asc()).limit(5).all()
        
        # Get recent notes
        recent_notes = DoctorNote.query.filter_by(
            doctor_id=current_user.id
        ).order_by(DoctorNote.created_at.desc()).limit(5).all()
        
        return jsonify({
            'patient_count': patient_count,
            'active_alerts': [alert.to_dict() for alert in active_alerts],
            'active_alerts_count': len(active_alerts),
            'upcoming_sessions': [session.to_dict() for session in upcoming_sessions],
            'recent_notes': [note.to_dict() for note in recent_notes]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/patients', methods=['GET'])
@doctor_required
def get_patients(current_user):
    """Get list of doctor's patients"""
    try:
        patients = PatientRecord.query.filter_by(doctor_id=current_user.id).all()
        
        result = []
        for record in patients:
            patient = db.session.get(User, record.user_id)
            if patient:
                patient_data = patient.to_dict()
                patient_data['record'] = record.to_dict()
                
                # Add recent activity
                recent_chats = ChatSession.query.filter_by(
                    user_id=patient.id
                ).order_by(ChatSession.updated_at.desc()).limit(1).first()
                
                patient_data['last_activity'] = recent_chats.updated_at.isoformat() if recent_chats else None
                
                result.append(patient_data)
        
        return jsonify({'patients': result}), 200
        
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
        
        # Get emotion logs
        emotion_logs = EmotionLog.query.filter_by(
            user_id=patient_id
        ).order_by(EmotionLog.logged_at.desc()).limit(30).all()
        
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
            'emotion_logs': [log.to_dict() for log in emotion_logs],
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
        
        return jsonify({
            'alerts': [alert.to_dict() for alert in alerts]
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

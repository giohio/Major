"""
Doctor-specific plan and patient management routes
"""

from flask import Blueprint, request, jsonify
from app.middleware.role_middleware import doctor_required
from app.models.models import User, PatientRecord, Plan
from app.extensions import db

doctor_plan_bp = Blueprint('doctor_plans', __name__, url_prefix='/api/doctors/plans')


@doctor_plan_bp.route('/patients', methods=['GET'])
@doctor_required
def get_patients_by_plan(current_user):
    """
    Get doctor's patients filtered by subscription plan
    Doctors can see which patients have which plans
    """
    try:
        plan_filter = request.args.get('plan')  # free, personal, family
        status_filter = request.args.get('status')  # active, expired, cancelled
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Get doctor's patients
        query = db.session.query(User, PatientRecord).join(
            PatientRecord, PatientRecord.user_id == User.id
        ).filter(
            PatientRecord.doctor_id == current_user.id
        )
        
        # Apply filters
        if plan_filter:
            query = query.filter(User.subscription_plan == plan_filter)
        
        if status_filter:
            query = query.filter(User.subscription_status == status_filter)
        
        # Paginate
        pagination = query.order_by(User.full_name).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        patients = []
        for user, patient_record in pagination.items:
            patient_data = {
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'avatar_url': user.avatar_url,
                'subscription_plan': user.subscription_plan,
                'subscription_status': user.subscription_status,
                'subscription_start_date': user.subscription_start_date.isoformat() if user.subscription_start_date else None,
                'subscription_end_date': user.subscription_end_date.isoformat() if user.subscription_end_date else None,
                'patient_record_id': patient_record.id,
                'assigned_date': patient_record.created_at.isoformat() if patient_record.created_at else None
            }
            
            # Get plan details
            if user.subscription_plan:
                plan = Plan.query.filter_by(name=user.subscription_plan).first()
                if plan:
                    patient_data['plan_details'] = {
                        'name': plan.name,
                        'chat_limit': plan.chat_limit,
                        'voice_enabled': plan.voice_enabled,
                        'video_enabled': plan.video_enabled,
                        'doctor_access': plan.doctor_access
                    }
            
            patients.append(patient_data)
        
        return jsonify({
            'patients': patients,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@doctor_plan_bp.route('/patients/<int:patient_id>/plan', methods=['GET'])
@doctor_required
def get_patient_plan_details(current_user, patient_id):
    """
    Get detailed plan information for a specific patient
    """
    try:
        # Verify this is doctor's patient
        patient_record = PatientRecord.query.filter_by(
            doctor_id=current_user.id,
            user_id=patient_id
        ).first()
        
        if not patient_record:
            return jsonify({'error': 'Patient not found or not assigned to you'}), 404
        
        # Get patient and plan info
        patient = db.session.get(User, patient_id)
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        plan = Plan.query.filter_by(name=patient.subscription_plan).first()
        
        # Get usage statistics
        from app.models.models import ChatSession, ChatMessage
        from datetime import datetime, timedelta
        
        # Chat usage this month
        month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        chats_this_month = ChatSession.query.filter(
            ChatSession.user_id == patient_id,
            ChatSession.created_at >= month_start
        ).count()
        
        # Emotion messages this month
        emotions_this_month = db.session.query(ChatMessage)\
            .join(ChatSession)\
            .filter(
                ChatSession.user_id == patient_id,
                ChatMessage.role == 'user',
                ChatMessage.emotion_detected.isnot(None),
                ChatMessage.created_at >= month_start
            ).count()
        
        return jsonify({
            'patient': {
                'id': patient.id,
                'full_name': patient.full_name,
                'email': patient.email
            },
            'plan': plan.to_dict() if plan else None,
            'subscription': {
                'plan': patient.subscription_plan,
                'status': patient.subscription_status,
                'start_date': patient.subscription_start_date.isoformat() if patient.subscription_start_date else None,
                'end_date': patient.subscription_end_date.isoformat() if patient.subscription_end_date else None
            },
            'usage_this_month': {
                'chats': chats_this_month,
                'emotions': emotions_this_month,
                'chat_limit': plan.chat_limit if plan else -1
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@doctor_plan_bp.route('/statistics', methods=['GET'])
@doctor_required
def get_plan_statistics(current_user):
    """
    Get statistics about doctor's patients' plans
    Useful for doctor dashboard
    """
    try:
        # Get all doctor's patients
        patient_ids = [p.user_id for p in PatientRecord.query.filter_by(
            doctor_id=current_user.id
        ).all()]
        
        if not patient_ids:
            return jsonify({
                'total_patients': 0,
                'by_plan': {},
                'by_status': {},
                'active_subscriptions': 0
            }), 200
        
        # Get patients by plan
        from sqlalchemy import func
        by_plan = db.session.query(
            User.subscription_plan,
            func.count(User.id)
        ).filter(
            User.id.in_(patient_ids)
        ).group_by(User.subscription_plan).all()
        
        # Get patients by status
        by_status = db.session.query(
            User.subscription_status,
            func.count(User.id)
        ).filter(
            User.id.in_(patient_ids)
        ).group_by(User.subscription_status).all()
        
        # Active subscriptions
        active_count = User.query.filter(
            User.id.in_(patient_ids),
            User.subscription_status == 'active'
        ).count()
        
        return jsonify({
            'total_patients': len(patient_ids),
            'by_plan': {plan: count for plan, count in by_plan},
            'by_status': {status: count for status, count in by_status},
            'active_subscriptions': active_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@doctor_plan_bp.route('/my-plan', methods=['GET'])
@doctor_required
def get_doctor_own_plan(current_user):
    """
    Get doctor's own subscription plan
    Doctors also need plans to access certain features
    """
    try:
        plan = Plan.query.filter_by(name=current_user.subscription_plan).first()
        
        if not plan:
            return jsonify({'error': 'No active plan'}), 404
        
        return jsonify({
            'plan': plan.to_dict(),
            'subscription': {
                'plan': current_user.subscription_plan,
                'status': current_user.subscription_status,
                'start_date': current_user.subscription_start_date.isoformat() if current_user.subscription_start_date else None,
                'end_date': current_user.subscription_end_date.isoformat() if current_user.subscription_end_date else None
            },
            'limits': {
                'max_patients': plan.max_patients,
                'can_assign_plans': plan.can_assign_plans,
                'analytics_access': plan.analytics_access,
                'video_enabled': plan.video_enabled
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@doctor_plan_bp.route('/check-limits', methods=['GET'])
@doctor_required
def check_doctor_limits(current_user):
    """
    Check if doctor can add more patients based on their plan
    """
    try:
        plan = Plan.query.filter_by(name=current_user.subscription_plan).first()
        
        if not plan:
            return jsonify({'error': 'No active plan'}), 404
        
        # Count current patients
        current_patients = PatientRecord.query.filter_by(
            doctor_id=current_user.id
        ).count()
        
        # Check limit
        max_patients = plan.max_patients
        can_add = True if max_patients == -1 else current_patients < max_patients
        
        return jsonify({
            'current_patients': current_patients,
            'max_patients': max_patients,
            'can_add_patient': can_add,
            'remaining_slots': max_patients - current_patients if max_patients != -1 else -1
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

"""
Alert routes for managing mental health alerts
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

from app.models.models import User, Alert
from app.extensions import db
from app.services.alert_service import AlertService

alert_bp = Blueprint('alert', __name__, url_prefix='/api/alert')
alert_service = AlertService()


@alert_bp.route('/', methods=['GET'])
@jwt_required()
def get_alerts():
    """
    Get user's alerts
    
    Query params:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20)
    - status: Filter by status (active/resolved/dismissed)
    - severity: Filter by severity (low/medium/high/critical)
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # User sees their own alerts, doctors see all their patients' alerts
        if user.role == 'user':
            query = Alert.query.filter_by(user_id=user_id)
        elif user.role == 'doctor':
            # Get alerts from all patients assigned to this doctor
            from app.models.models import PatientRecord
            patient_ids = db.session.query(PatientRecord.patient_id).filter_by(
                doctor_id=user_id
            ).distinct().all()
            patient_ids = [p[0] for p in patient_ids]
            query = Alert.query.filter(Alert.user_id.in_(patient_ids))
        else:  # admin
            query = Alert.query
        
        # Apply filters
        status = request.args.get('status')
        if status and status in ['active', 'resolved', 'dismissed']:
            query = query.filter_by(status=status)
        
        severity = request.args.get('severity')
        if severity and severity in ['low', 'medium', 'high', 'critical']:
            query = query.filter_by(severity=severity)
        
        query = query.order_by(Alert.created_at.desc())
        
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'alerts': [alert.to_dict() for alert in paginated.items],
            'total': paginated.total,
            'page': page,
            'per_page': per_page,
            'pages': paginated.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@alert_bp.route('/<int:alert_id>', methods=['GET'])
@jwt_required()
def get_alert(alert_id):
    """Get alert details"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        alert = Alert.query.get(alert_id)
        
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
        
        # Check permission
        if user.role == 'user' and alert.user_id != user_id:
            return jsonify({'error': 'Permission denied'}), 403
        elif user.role == 'doctor':
            # Check if this is doctor's patient
            from app.models.models import PatientRecord
            patient_record = PatientRecord.query.filter_by(
                doctor_id=user_id,
                patient_id=alert.user_id
            ).first()
            if not patient_record:
                return jsonify({'error': 'Permission denied'}), 403
        
        return jsonify(alert.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@alert_bp.route('/<int:alert_id>/resolve', methods=['PUT'])
@jwt_required()
def resolve_alert(alert_id):
    """
    Resolve an alert
    
    Request body:
    {
        "resolution_notes": "Patient has been contacted and is safe"
    }
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        alert = Alert.query.get(alert_id)
        
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
        
        # Only doctors and admins can resolve alerts
        if user.role == 'user':
            return jsonify({'error': 'Only healthcare professionals can resolve alerts'}), 403
        
        # Check if doctor has access to this patient
        if user.role == 'doctor':
            from app.models.models import PatientRecord
            patient_record = PatientRecord.query.filter_by(
                doctor_id=user_id,
                patient_id=alert.user_id
            ).first()
            if not patient_record:
                return jsonify({'error': 'Permission denied'}), 403
        
        data = request.json or {}
        
        alert.status = 'resolved'
        alert.resolved_at = datetime.utcnow()
        alert.resolved_by = user_id
        
        if 'resolution_notes' in data:
            alert.resolution_notes = data['resolution_notes']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Alert resolved successfully',
            'alert': alert.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@alert_bp.route('/<int:alert_id>/dismiss', methods=['PUT'])
@jwt_required()
def dismiss_alert(alert_id):
    """Dismiss an alert (user can dismiss their own alerts)"""
    try:
        user_id = get_jwt_identity()
        
        alert = Alert.query.get(alert_id)
        
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
        
        # Users can only dismiss their own alerts
        if alert.user_id != user_id:
            return jsonify({'error': 'Permission denied'}), 403
        
        alert.status = 'dismissed'
        alert.resolved_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Alert dismissed',
            'alert': alert.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@alert_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_alert_stats():
    """
    Get alert statistics
    
    Query params:
    - days: Number of days to analyze (default: 30)
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        days = request.args.get('days', 30, type=int)
        start_date = datetime.now() - timedelta(days=days)
        
        from sqlalchemy import func
        
        # Base query based on role
        if user.role == 'user':
            base_query = Alert.query.filter_by(user_id=user_id)
        elif user.role == 'doctor':
            from app.models.models import PatientRecord
            patient_ids = db.session.query(PatientRecord.patient_id).filter_by(
                doctor_id=user_id
            ).distinct().all()
            patient_ids = [p[0] for p in patient_ids]
            base_query = Alert.query.filter(Alert.user_id.in_(patient_ids))
        else:  # admin
            base_query = Alert.query
        
        # Filter by date range
        base_query = base_query.filter(Alert.created_at >= start_date)
        
        # Total alerts
        total_alerts = base_query.count()
        
        # Alerts by severity
        alerts_by_severity = db.session.query(
            Alert.severity,
            func.count(Alert.id)
        ).filter(
            Alert.created_at >= start_date
        )
        
        if user.role == 'user':
            alerts_by_severity = alerts_by_severity.filter_by(user_id=user_id)
        elif user.role == 'doctor':
            alerts_by_severity = alerts_by_severity.filter(Alert.user_id.in_(patient_ids))
        
        alerts_by_severity = alerts_by_severity.group_by(Alert.severity).all()
        
        # Alerts by status
        alerts_by_status = db.session.query(
            Alert.status,
            func.count(Alert.id)
        ).filter(
            Alert.created_at >= start_date
        )
        
        if user.role == 'user':
            alerts_by_status = alerts_by_status.filter_by(user_id=user_id)
        elif user.role == 'doctor':
            alerts_by_status = alerts_by_status.filter(Alert.user_id.in_(patient_ids))
        
        alerts_by_status = alerts_by_status.group_by(Alert.status).all()
        
        # Active critical alerts
        active_critical = base_query.filter_by(
            severity='critical',
            status='active'
        ).count()
        
        return jsonify({
            'total_alerts': total_alerts,
            'active_critical_alerts': active_critical,
            'alerts_by_severity': {severity: count for severity, count in alerts_by_severity},
            'alerts_by_status': {status: count for status, count in alerts_by_status},
            'period': {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': datetime.now().strftime('%Y-%m-%d'),
                'days': days
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@alert_bp.route('/critical', methods=['GET'])
@jwt_required()
def get_critical_alerts():
    """Get all active critical alerts (for doctors and admins)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Only doctors and admins
        if user.role == 'user':
            return jsonify({'error': 'Permission denied'}), 403
        
        # Base query
        if user.role == 'doctor':
            from app.models.models import PatientRecord
            patient_ids = db.session.query(PatientRecord.patient_id).filter_by(
                doctor_id=user_id
            ).distinct().all()
            patient_ids = [p[0] for p in patient_ids]
            query = Alert.query.filter(Alert.user_id.in_(patient_ids))
        else:  # admin
            query = Alert.query
        
        # Filter critical and active
        alerts = query.filter_by(
            severity='critical',
            status='active'
        ).order_by(Alert.created_at.desc()).all()
        
        return jsonify({
            'critical_alerts': [alert.to_dict() for alert in alerts],
            'count': len(alerts)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

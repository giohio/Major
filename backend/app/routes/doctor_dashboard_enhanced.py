@bp.route('/dashboard', methods=['GET'])
@doctor_required
def get_dashboard(current_user):
    """Get doctor dashboard overview with stats, appointments, and alerts"""
    try:
        # Get doctor's patients
        patients = PatientRecord.query.filter_by(doctor_id=current_user.id).all()
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
            Appointment.doctor_id == current_user.id,
            Appointment.appointment_date >= today_start,
            Appointment.appointment_date < today_end
        ).all()
        
        pending_appointments = sum(1 for apt in today_appointments if apt.status == 'pending')
        
        # Get upcoming appointments with patient info
        upcoming_appointments = Appointment.query.filter(
            Appointment.doctor_id == current_user.id,
            Appointment.appointment_date >= datetime.utcnow(),
            Appointment.status.in_(['pending', 'confirmed'])
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
            doctor_id=current_user.id,
            status='scheduled'
        ).filter(
            TherapySession.start_time >= datetime.utcnow()
        ).order_by(TherapySession.start_time.asc()).limit(5).all()
        
        # Get recent notes
        recent_notes = DoctorNote.query.filter_by(
            doctor_id=current_user.id
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

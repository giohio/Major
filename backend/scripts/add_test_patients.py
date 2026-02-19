"""
Quick script to create patient records for doctor testing
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models.models import User, PatientRecord, DoctorProfile
from datetime import datetime

app = create_app()

with app.app_context():
    # Find doctor1@mindcare.ai
    doctor_user = User.query.filter_by(email='doctor1@mindcare.ai').first()
    
    if not doctor_user:
        print("❌ Doctor not found! Please make sure doctor1@mindcare.ai exists")
        exit(1)
    
    print(f"✅ Found doctor: {doctor_user.full_name} (ID: {doctor_user.id})")
    
    # Get doctor profile
    doctor_profile = DoctorProfile.query.filter_by(user_id=doctor_user.id).first()
    if not doctor_profile:
        print("❌ Doctor profile not found!")
        exit(1)
    
    print(f"✅ Doctor profile ID: {doctor_profile.id}")
    
    # Find some regular users to add as patients
    regular_users = User.query.filter_by(role='user').limit(5).all()
    
    if not regular_users:
        print("❌ No regular users found in database!")
        exit(1)
    
    print(f"\n📋 Found {len(regular_users)} users to add as patients:")
    
    added_count = 0
    for user in regular_users:
        # Check if patient record already exists
        existing_record = PatientRecord.query.filter_by(
            user_id=user.id,
            doctor_id=doctor_user.id
        ).first()
        
        if existing_record:
            print(f"⏭️  {user.full_name} (ID: {user.id}) - Already assigned")
            continue
        
        # Create patient record
        record = PatientRecord(
            user_id=user.id,
            doctor_id=doctor_user.id,
            diagnosis='General consultation',
            medical_history='Initial assessment',
            current_medications='None',
            allergies='None known',
            notes=f'Patient assigned for care on {datetime.utcnow().strftime("%Y-%m-%d")}',
            status='active',
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.session.add(record)
        print(f"✅ Added: {user.full_name} (ID: {user.id})")
        added_count += 1
    
    if added_count > 0:
        db.session.commit()
        print(f"\n🎉 Successfully added {added_count} patients to doctor's care!")
    else:
        print(f"\n✓ All users already assigned. No changes made.")
    
    # Verify
    total_patients = PatientRecord.query.filter_by(doctor_id=doctor_user.id).count()
    print(f"\n📊 Total patients for {doctor_user.full_name}: {total_patients}")

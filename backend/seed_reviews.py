"""
Seed sample reviews and availability for testing
Run: python seed_reviews.py
"""

from app import create_app, db
from app.models.models import User, DoctorProfile
from app.models.doctor_reviews import DoctorReview, DoctorAvailability
from datetime import datetime, time
import random

app = create_app()

def seed_reviews():
    """Add sample reviews for all doctors"""
    with app.app_context():
        print("🌱 Seeding doctor reviews and availability...")
        
        # Get all doctors
        doctors = DoctorProfile.query.join(User).filter(User.role == 'doctor').all()
        print(f"Found {len(doctors)} doctors")
        
        # Get all patients
        patients = User.query.filter_by(role='patient', is_active=True).all()
        print(f"Found {len(patients)} patients")
        
        if not patients:
            print("⚠️ No patients found. Creating sample patients...")
            # Create sample patients if needed
            for i in range(5):
                patient = User(
                    email=f'patient{i+1}@test.com',
                    full_name=f'Bệnh nhân {i+1}',
                    role='patient',
                    is_active=True
                )
                patient.set_password('password123')
                db.session.add(patient)
            db.session.commit()
            patients = User.query.filter_by(role='patient').all()
        
        review_texts = [
            "Bác sĩ rất tận tâm và chuyên nghiệp. Tôi cảm thấy thoải mái khi chia sẻ.",
            "Buổi tư vấn rất hữu ích. Bác sĩ lắng nghe và đưa ra lời khuyên phù hợp.",
            "Rất hài lòng với dịch vụ. Bác sĩ hiểu rõ vấn đề và giúp tôi nhiều.",
            "Chuyên môn cao, giao tiếp tốt. Cảm ơn bác sĩ đã giúp đỡ.",
            "Tôi đã cảm thấy tốt hơn nhiều sau các buổi tư vấn. Rất recommend!",
            "Bác sĩ rất kiên nhẫn và thấu hiểu. Không gian tư vấn rất thoải mái.",
            "Phương pháp điều trị hiệu quả. Tôi thấy tiến bộ rõ rệt.",
            "Bác sĩ giỏi, tạo cảm giác an toàn cho bệnh nhân. Will come back!",
        ]
        
        reviews_added = 0
        
        for doctor in doctors:
            # Random number of reviews (3-15 per doctor)
            num_reviews = random.randint(3, min(15, len(patients)))
            selected_patients = random.sample(patients, num_reviews)
            
            for patient in selected_patients:
                # Check if review already exists
                existing = DoctorReview.query.filter_by(
                    doctor_id=doctor.id,
                    user_id=patient.id
                ).first()
                
                if existing:
                    continue
                
                # Random ratings (mostly high, some medium)
                rating = random.choices([3, 4, 5], weights=[0.1, 0.3, 0.6])[0]
                professionalism = random.randint(rating-1, 5)
                communication = random.randint(rating-1, 5)
                effectiveness = random.randint(rating-1, 5)
                
                review = DoctorReview(
                    doctor_id=doctor.id,
                    user_id=patient.id,
                    rating=rating,
                    review_text=random.choice(review_texts),
                    professionalism=max(1, professionalism),
                    communication=max(1, communication),
                    effectiveness=max(1, effectiveness),
                    is_verified=random.choice([True, False]),
                    is_anonymous=random.choice([True, False]),
                    created_at=datetime.utcnow()
                )
                
                db.session.add(review)
                reviews_added += 1
            
            # Add weekly availability for doctor
            # Monday, Wednesday, Friday: 9AM-5PM
            # Tuesday, Thursday: 1PM-9PM
            schedules = [
                (0, time(9, 0), time(17, 0)),   # Monday
                (1, time(13, 0), time(21, 0)),  # Tuesday
                (2, time(9, 0), time(17, 0)),   # Wednesday
                (3, time(13, 0), time(21, 0)),  # Thursday
                (4, time(9, 0), time(17, 0)),   # Friday
            ]
            
            for day, start, end in schedules:
                existing_schedule = DoctorAvailability.query.filter_by(
                    doctor_id=doctor.id,
                    day_of_week=day
                ).first()
                
                if not existing_schedule:
                    availability = DoctorAvailability(
                        doctor_id=doctor.id,
                        day_of_week=day,
                        start_time=start,
                        end_time=end,
                        is_active=True
                    )
                    db.session.add(availability)
        
        db.session.commit()
        print(f"✅ Added {reviews_added} reviews and availability schedules")
        
        # Print statistics
        for doctor in doctors:
            doctor_user = User.query.get(doctor.user_id)
            review_count = DoctorReview.query.filter_by(doctor_id=doctor.id).count()
            if review_count > 0:
                avg_rating = db.session.query(db.func.avg(DoctorReview.rating)).filter_by(doctor_id=doctor.id).scalar()
                print(f"  📊 {doctor_user.full_name}: {review_count} reviews, avg {float(avg_rating):.1f}★")

if __name__ == '__main__':
    seed_reviews()

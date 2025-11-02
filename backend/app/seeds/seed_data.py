"""Seed data for MindCare AI database"""
from app.extensions import db
from app.models.models import User, DoctorProfile, Exercise
from datetime import datetime, timedelta
import random

def seed_users():
    """Seed users with different roles"""
    users_data = [
        # Admin
        {
            'email': 'admin@mindcare.ai',
            'password': 'Admin@123456',
            'full_name': 'Admin MindCare',
            'phone': '0901234567',
            'role': 'admin',
            'is_verified': True,
            'subscription_plan': 'unlimited'
        },
        # Regular Users
        {
            'email': 'user1@example.com',
            'password': 'User@123456',
            'full_name': 'Nguyễn Văn An',
            'phone': '0912345678',
            'role': 'user',
            'is_verified': True,
            'subscription_plan': 'personal',
            'subscription_status': 'active',
            'subscription_start_date': datetime.utcnow() - timedelta(days=30),
            'subscription_end_date': datetime.utcnow() + timedelta(days=335)
        },
        {
            'email': 'user2@example.com',
            'password': 'User@123456',
            'full_name': 'Trần Thị Bình',
            'phone': '0923456789',
            'role': 'user',
            'is_verified': True,
            'subscription_plan': 'family',
            'subscription_status': 'active',
            'subscription_start_date': datetime.utcnow() - timedelta(days=15),
            'subscription_end_date': datetime.utcnow() + timedelta(days=350)
        },
        {
            'email': 'user3@example.com',
            'password': 'User@123456',
            'full_name': 'Lê Văn Cường',
            'phone': '0934567890',
            'role': 'user',
            'is_verified': True,
            'subscription_plan': 'free',
            'subscription_status': 'active'
        },
        {
            'email': 'user4@example.com',
            'password': 'User@123456',
            'full_name': 'Phạm Thị Dung',
            'phone': '0945678901',
            'role': 'user',
            'is_verified': False,
            'subscription_plan': 'free',
            'subscription_status': 'active'
        },
        # Doctors
        {
            'email': 'doctor1@mindcare.ai',
            'password': 'Doctor@123456',
            'full_name': 'BS. Nguyễn Minh Hiếu',
            'phone': '0956789012',
            'role': 'doctor',
            'is_verified': True
        },
        {
            'email': 'doctor2@mindcare.ai',
            'password': 'Doctor@123456',
            'full_name': 'TS. Trần Thanh Hương',
            'phone': '0967890123',
            'role': 'doctor',
            'is_verified': True
        },
        {
            'email': 'doctor3@mindcare.ai',
            'password': 'Doctor@123456',
            'full_name': 'BS. Lê Quốc Khánh',
            'phone': '0978901234',
            'role': 'doctor',
            'is_verified': True
        },
    ]
    
    created_users = []
    for user_data in users_data:
        existing_user = User.query.filter_by(email=user_data['email']).first()
        if not existing_user:
            user = User(
                email=user_data['email'],
                full_name=user_data['full_name'],
                phone=user_data['phone'],
                role=user_data['role'],
                is_verified=user_data.get('is_verified', False),
                subscription_plan=user_data.get('subscription_plan', 'free'),
                subscription_status=user_data.get('subscription_status', 'active'),
                subscription_start_date=user_data.get('subscription_start_date'),
                subscription_end_date=user_data.get('subscription_end_date')
            )
            user.set_password(user_data['password'])
            db.session.add(user)
            created_users.append((user, user_data))
            print(f"✓ Created user: {user_data['email']}")
        else:
            print(f"⊘ User already exists: {user_data['email']}")
    
    db.session.commit()
    return created_users


def seed_doctor_profiles(created_users):
    """Seed doctor profiles"""
    doctors_data = [
        {
            'email': 'doctor1@mindcare.ai',
            'license_number': 'BYT-12345',
            'specialization': 'Tâm lý lâm sàng',
            'years_of_experience': 8,
            'education': 'Bác sĩ Tâm lý, Đại học Y Hà Nội (2015)\nThạc sĩ Tâm lý lâm sàng, ĐH Y Dược TP.HCM (2018)',
            'certifications': 'Chứng chỉ CBT (Cognitive Behavioral Therapy)\nChứng chỉ DBT (Dialectical Behavior Therapy)',
            'bio': 'Chuyên điều trị rối loạn lo âu, trầm cảm, stress. Có hơn 8 năm kinh nghiệm tư vấn tâm lý.',
            'consultation_fee': 500000,
            'languages': 'Tiếng Việt, English',
            'is_verified': True,
            'rating': 4.8,
            'total_sessions': 234
        },
        {
            'email': 'doctor2@mindcare.ai',
            'license_number': 'BYT-23456',
            'specialization': 'Tâm thần học',
            'years_of_experience': 12,
            'education': 'Tiến sĩ Tâm thần học, Đại học Y Hà Nội (2020)\nBác sĩ Nội trú Tâm thần, BV Bạch Mai (2015)',
            'certifications': 'Chuyên khoa II Tâm thần học\nChứng chỉ EMDR (Eye Movement Desensitization)',
            'bio': 'Chuyên điều trị các rối loạn tâm thần nghiêm trọng, PTSD, bipolar. Tiến sĩ với 12 năm kinh nghiệm.',
            'consultation_fee': 800000,
            'languages': 'Tiếng Việt, English, 中文',
            'is_verified': True,
            'rating': 4.9,
            'total_sessions': 456
        },
        {
            'email': 'doctor3@mindcare.ai',
            'license_number': 'BYT-34567',
            'specialization': 'Tâm lý trẻ em & vị thành niên',
            'years_of_experience': 5,
            'education': 'Bác sĩ Tâm lý, Đại học Sư phạm Hà Nội (2018)\nThạc sĩ Tâm lý Phát triển (2020)',
            'certifications': 'Chứng chỉ Play Therapy\nChứng chỉ Family Therapy',
            'bio': 'Chuyên tư vấn tâm lý cho trẻ em, thanh thiếu niên. Điều trị ADHD, tự kỷ, rối loạn học tập.',
            'consultation_fee': 400000,
            'languages': 'Tiếng Việt, English',
            'is_verified': True,
            'rating': 4.7,
            'total_sessions': 167
        },
    ]
    
    for doctor_data in doctors_data:
        user = User.query.filter_by(email=doctor_data['email']).first()
        if user and not user.doctor_profile:
            doctor_profile = DoctorProfile(
                user_id=user.id,
                license_number=doctor_data['license_number'],
                specialization=doctor_data['specialization'],
                years_of_experience=doctor_data['years_of_experience'],
                education=doctor_data['education'],
                certifications=doctor_data['certifications'],
                bio=doctor_data['bio'],
                consultation_fee=doctor_data['consultation_fee'],
                languages=doctor_data['languages'],
                is_verified=doctor_data['is_verified'],
                rating=doctor_data['rating'],
                total_sessions=doctor_data['total_sessions']
            )
            db.session.add(doctor_profile)
            print(f"✓ Created doctor profile for: {doctor_data['email']}")
        else:
            print(f"⊘ Doctor profile already exists or user not found: {doctor_data['email']}")
    
    db.session.commit()


def seed_exercises():
    """Seed mental health exercises"""
    exercises_data = [
        {
            'title': 'Hít thở sâu 4-7-8',
            'description': 'Kỹ thuật thở giúp giảm căng thẳng và lo âu nhanh chóng',
            'category': 'breathing',
            'difficulty': 'beginner',
            'duration_minutes': 5,
            'instructions': '''1. Ngồi hoặc nằm thoải mái
2. Đặt đầu lưỡi sau răng cửa trên
3. Thở ra hoàn toàn qua miệng
4. Hít vào qua mũi đếm 4 giây
5. Nín thở đếm 7 giây
6. Thở ra qua miệng đếm 8 giây
7. Lặp lại 3-4 lần''',
            'benefits': 'Giảm lo âu, cải thiện giấc ngủ, hạ huyết áp, giảm stress'
        },
        {
            'title': 'Thiền chánh niệm 10 phút',
            'description': 'Bài thiền tập trung vào hơi thở và thời điểm hiện tại',
            'category': 'meditation',
            'difficulty': 'beginner',
            'duration_minutes': 10,
            'instructions': '''1. Ngồi thoải mái, lưng thẳng
2. Đóng mắt hoặc nhìn xuống
3. Tập trung vào hơi thở tự nhiên
4. Khi tâm trí lang thang, nhẹ nhàng đưa về hơi thở
5. Quan sát cảm giác trong cơ thể
6. Chấp nhận mọi suy nghĩ, cảm xúc xuất hiện
7. Tiếp tục 10 phút''',
            'benefits': 'Tăng tập trung, giảm stress, cải thiện sức khỏe tinh thần'
        },
        {
            'title': 'Viết nhật ký cảm xúc',
            'description': 'Ghi chép và nhận diện cảm xúc hàng ngày',
            'category': 'journaling',
            'difficulty': 'beginner',
            'duration_minutes': 15,
            'instructions': '''1. Chọn thời gian cố định mỗi ngày
2. Viết về cảm xúc hiện tại (vui, buồn, lo lắng...)
3. Mô tả chi tiết tình huống gây ra cảm xúc
4. Đánh giá mức độ cảm xúc (1-10)
5. Ghi nhận suy nghĩ tự động
6. Viết về cách xử lý
7. Tóm tắt bài học rút ra''',
            'benefits': 'Nhận diện cảm xúc, giảm stress, phát triển tự nhận thức'
        },
        {
            'title': 'Thách thức suy nghĩ tiêu cực',
            'description': 'Kỹ thuật CBT để điều chỉnh tư duy tiêu cực',
            'category': 'cbt',
            'difficulty': 'intermediate',
            'duration_minutes': 20,
            'instructions': '''1. Xác định suy nghĩ tiêu cực
2. Viết ra suy nghĩ đó
3. Tìm bằng chứng ủng hộ suy nghĩ
4. Tìm bằng chứng phản bác
5. Đánh giá khách quan
6. Tạo suy nghĩ thay thế cân bằng hơn
7. Thực hành suy nghĩ mới''',
            'benefits': 'Giảm lo âu, cải thiện tâm trạng, tư duy tích cực hơn'
        },
        {
            'title': 'Scan cơ thể (Body Scan)',
            'description': 'Thư giãn từng phần cơ thể để giảm căng thẳng',
            'category': 'relaxation',
            'difficulty': 'beginner',
            'duration_minutes': 15,
            'instructions': '''1. Nằm ngửa thoải mái
2. Đóng mắt, thở sâu 3 lần
3. Tập trung vào ngón chân, cảm nhận cảm giác
4. Di chuyển dần lên: bàn chân, cổ chân, bắp chân
5. Tiếp tục lên đùi, hông, bụng, ngực
6. Quét vai, cánh tay, bàn tay
7. Cuối cùng cổ, mặt, đầu
8. Cảm nhận toàn bộ cơ thể thư giãn''',
            'benefits': 'Giảm căng thẳng cơ bắp, cải thiện giấc ngủ, giảm đau mãn tính'
        },
        {
            'title': 'Thực hành biết ơn',
            'description': 'Viết ra những điều biết ơn mỗi ngày',
            'category': 'positive_psychology',
            'difficulty': 'beginner',
            'duration_minutes': 10,
            'instructions': '''1. Chuẩn bị sổ tay và bút
2. Viết 3-5 điều bạn biết ơn hôm nay
3. Có thể là điều lớn hoặc nhỏ
4. Mô tả tại sao bạn biết ơn
5. Cảm nhận sự tri ân trong lòng
6. Thực hiện đều đặn mỗi ngày
7. Xem lại các ghi chép khi buồn''',
            'benefits': 'Tăng hạnh phúc, cải thiện tâm trạng, quan hệ tốt hơn'
        },
        {
            'title': 'Kỹ thuật 5-4-3-2-1 chống lo âu',
            'description': 'Sử dụng 5 giác quan để neo vào hiện tại',
            'category': 'grounding',
            'difficulty': 'beginner',
            'duration_minutes': 5,
            'instructions': '''1. Ngồi hoặc đứng thoải mái
2. Nhận diện 5 thứ bạn NHÌN THẤY
3. Nhận diện 4 thứ bạn CÓ THỂ CHẠM
4. Nhận diện 3 thứ bạn NGHE THẤY
5. Nhận diện 2 thứ bạn NGỬI THẤY
6. Nhận diện 1 thứ bạn NẾM THẤY
7. Thở sâu và cảm nhận sự bình yên''',
            'benefits': 'Giảm lo âu cấp tính, neo về hiện tại, ngăn cơn hoảng loạn'
        },
        {
            'title': 'Hình dung tích cực',
            'description': 'Tưởng tượng một nơi an toàn và bình yên',
            'category': 'visualization',
            'difficulty': 'intermediate',
            'duration_minutes': 12,
            'instructions': '''1. Nằm hoặc ngồi thoải mái
2. Đóng mắt, thở sâu 3 lần
3. Tưởng tượng một nơi yên bình (bãi biển, rừng...)
4. Nhìn thấy màu sắc, ánh sáng
5. Nghe thấy âm thanh (sóng, chim...)
6. Cảm nhận nhiệt độ, gió
7. Ngửi mùi hương tự nhiên
8. Lưu lại 5-10 phút
9. Từ từ quay về hiện tại''',
            'benefits': 'Giảm stress, cải thiện tâm trạng, tăng cường thư giãn'
        }
    ]
    
    for exercise_data in exercises_data:
        existing = Exercise.query.filter_by(title=exercise_data['title']).first()
        if not existing:
            exercise = Exercise(**exercise_data)
            db.session.add(exercise)
            print(f"✓ Created exercise: {exercise_data['title']}")
        else:
            print(f"⊘ Exercise already exists: {exercise_data['title']}")
    
    db.session.commit()


def run_seeds():
    """Run all seed functions"""
    print("\n🌱 Starting database seeding...\n")
    
    print("📊 Seeding Users...")
    created_users = seed_users()
    
    print("\n👨‍⚕️ Seeding Doctor Profiles...")
    seed_doctor_profiles(created_users)
    
    print("\n🧘 Seeding Exercises...")
    seed_exercises()
    
    print("\n✅ Database seeding completed!\n")
    print("=" * 50)
    print("TEST ACCOUNTS:")
    print("=" * 50)
    print("Admin:")
    print("  Email: admin@mindcare.ai")
    print("  Password: Admin@123456")
    print("\nUsers:")
    print("  Email: user1@example.com | Password: User@123456")
    print("  Email: user2@example.com | Password: User@123456")
    print("  Email: user3@example.com | Password: User@123456")
    print("\nDoctors:")
    print("  Email: doctor1@mindcare.ai | Password: Doctor@123456")
    print("  Email: doctor2@mindcare.ai | Password: Doctor@123456")
    print("  Email: doctor3@mindcare.ai | Password: Doctor@123456")
    print("=" * 50)


if __name__ == '__main__':
    from app import create_app
    app = create_app()
    with app.app_context():
        run_seeds()

"""
Seed script to initialize database with comprehensive test data
Run from backend directory: python seed_database.py
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.models import (
    Plan, AIModel, User, DoctorProfile, 
    ChatSession, ChatMessage, EmotionLog,
    Appointment, Payment, Exercise
)
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import random

def seed_plans():
    """Seed initial plans"""
    print("🌱 Seeding plans...")
    
    # Check if plans already exist
    existing_plans = Plan.query.count()
    if existing_plans > 0:
        print(f"⚠️  Plans already exist ({existing_plans}). Skipping.")
        return
    
    plans = [
        # User Plans
        Plan(
            name='Free',
            description='Basic mental health support with AI chatbot',
            user_type='user',
            price_monthly=0,
            price_yearly=0,
            chat_limit=10,
            voice_enabled=False,
            video_enabled=False,
            empathy_layer_enabled=False,
            doctor_access=False,
            priority_support=False,
            is_active=True
        ),
        Plan(
            name='Pro',
            description='Advanced AI support with unlimited chats',
            user_type='user',
            price_monthly=99000,
            price_yearly=990000,
            chat_limit=-1,  # unlimited
            voice_enabled=True,
            video_enabled=False,
            empathy_layer_enabled=True,
            doctor_access=False,
            priority_support=True,
            is_active=True
        ),
        Plan(
            name='Clinical',
            description='Professional mental health support with doctor access',
            user_type='user',
            price_monthly=299000,
            price_yearly=2990000,
            chat_limit=-1,
            voice_enabled=True,
            video_enabled=True,
            empathy_layer_enabled=True,
            doctor_access=True,
            priority_support=True,
            is_active=True
        ),
        
        # Doctor Plans
        Plan(
            name='Doctor Basic',
            description='For individual practitioners',
            user_type='doctor',
            price_monthly=499000,
            price_yearly=4990000,
            chat_limit=-1,
            voice_enabled=True,
            video_enabled=True,
            empathy_layer_enabled=True,
            doctor_access=True,
            priority_support=True,
            max_patients=20,
            can_assign_plans=False,
            analytics_access=True,
            is_active=True
        ),
        Plan(
            name='Doctor Pro',
            description='For growing practices',
            user_type='doctor',
            price_monthly=999000,
            price_yearly=9990000,
            chat_limit=-1,
            voice_enabled=True,
            video_enabled=True,
            empathy_layer_enabled=True,
            doctor_access=True,
            priority_support=True,
            max_patients=100,
            can_assign_plans=True,
            analytics_access=True,
            is_active=True
        ),
        Plan(
            name='Doctor Enterprise',
            description='For clinics and hospitals',
            user_type='doctor',
            price_monthly=2999000,
            price_yearly=29990000,
            chat_limit=-1,
            voice_enabled=True,
            video_enabled=True,
            empathy_layer_enabled=True,
            doctor_access=True,
            priority_support=True,
            max_patients=-1,  # unlimited
            can_assign_plans=True,
            analytics_access=True,
            is_active=True
        ),
    ]
    
    db.session.add_all(plans)
    db.session.commit()
    print(f"✅ Created {len(plans)} plans")


def seed_ai_models():
    """Seed AI model configurations"""
    print("🌱 Seeding AI models...")
    
    # Check if models already exist
    existing_models = AIModel.query.count()
    if existing_models > 0:
        print(f"⚠️  AI models already exist ({existing_models}). Skipping.")
        return
    
    models = [
        AIModel(
            name='Gemini Pro',
            provider='google',
            model_version='gemini-pro',
            description='Google Gemini Pro model for general conversations',
            max_tokens=8192,
            temperature=0.7,
            is_active=True,
            is_default=True
        ),
        AIModel(
            name='Gemini Flash',
            provider='google',
            model_version='gemini-1.5-flash',
            description='Fast and efficient Gemini model',
            max_tokens=8192,
            temperature=0.7,
            is_active=True,
            is_default=False
        ),
    ]
    
    db.session.add_all(models)
    db.session.commit()
    print(f"✅ Created {len(models)} AI models")


def seed_users():
    """Create test users"""
    print("🌱 Seeding users...")
    
    # Check if users already exist
    existing_users = User.query.count()
    if existing_users > 0:
        print(f"⚠️  Users already exist ({existing_users}). Skipping.")
        return
    
    users = [
        # Admin
        User(
            email='admin@mindcare.ai',
            password_hash=generate_password_hash('Admin@123'),
            full_name='System Administrator',
            role='admin',
            is_active=True,
            is_verified=True,
            subscription_plan='Free',
            subscription_status='active',
            created_at=datetime.utcnow()
        ),
        # Test users
        User(
            email='user1@test.com',
            password_hash=generate_password_hash('User@123'),
            full_name='Nguyễn Văn A',
            phone='0901234567',
            role='user',
            is_active=True,
            is_verified=True,
            subscription_plan='Pro',
            subscription_status='active',
            subscription_end_date=datetime.utcnow() + timedelta(days=30),
            created_at=datetime.utcnow() - timedelta(days=15)
        ),
        User(
            email='user2@test.com',
            password_hash=generate_password_hash('User@123'),
            full_name='Trần Thị B',
            phone='0902345678',
            role='user',
            is_active=True,
            is_verified=True,
            subscription_plan='Clinical',
            subscription_status='active',
            subscription_end_date=datetime.utcnow() + timedelta(days=60),
            created_at=datetime.utcnow() - timedelta(days=30)
        ),
        User(
            email='user3@test.com',
            password_hash=generate_password_hash('User@123'),
            full_name='Lê Văn C',
            role='user',
            is_active=True,
            is_verified=True,
            subscription_plan='Free',
            subscription_status='active',
            created_at=datetime.utcnow() - timedelta(days=5)
        ),
    ]
    
    db.session.add_all(users)
    db.session.commit()
    print(f"✅ Created {len(users)} users")
    print("   Admin: admin@mindcare.ai / Admin@123")
    print("   User1: user1@test.com / User@123 (Pro)")
    print("   User2: user2@test.com / User@123 (Clinical)")
    print("   User3: user3@test.com / User@123 (Free)")
    
    return users


def seed_doctors():
    """Create test doctors"""
    print("🌱 Seeding doctors...")
    
    # Check if doctors already exist
    existing_doctors = User.query.filter_by(role='doctor').count()
    if existing_doctors > 0:
        print(f"⚠️  Doctors already exist ({existing_doctors}). Skipping.")
        return
    
    doctors_data = [
        {
            'email': 'doctor1@mindcare.ai',
            'full_name': 'Dr. Nguyễn Văn An',
            'specialty': 'Tâm lý lâm sàng',
            'experience': 10,
            'price': 500000,
            'languages': 'Tiếng Việt, English',
            'bio': 'Chuyên gia tâm lý lâm sàng với 10 năm kinh nghiệm điều trị rối loạn lo âu và trầm cảm.'
        },
        {
            'email': 'doctor2@mindcare.ai',
            'full_name': 'Dr. Trần Thị Bình',
            'specialty': 'Trị liệu CBT',
            'experience': 8,
            'price': 600000,
            'languages': 'Tiếng Việt',
            'bio': 'Chuyên gia trị liệu nhận thức hành vi (CBT) cho các vấn đề về cảm xúc và hành vi.'
        },
        {
            'email': 'doctor3@mindcare.ai',
            'full_name': 'Dr. Lê Văn Cường',
            'specialty': 'Tâm lý trẻ em',
            'experience': 12,
            'price': 550000,
            'languages': 'Tiếng Việt, English',
            'bio': 'Bác sĩ tâm lý chuyên về phát triển và hành vi trẻ em, thanh thiếu niên.'
        },
        {
            'email': 'doctor4@mindcare.ai',
            'full_name': 'Dr. Phạm Mai Dung',
            'specialty': 'Tâm lý gia đình',
            'experience': 15,
            'price': 700000,
            'languages': 'Tiếng Việt, English, 中文',
            'bio': 'Chuyên gia tư vấn gia đình và hôn nhân với kinh nghiệm quốc tế.'
        },
        {
            'email': 'doctor5@mindcare.ai',
            'full_name': 'Dr. Hoàng Minh Đức',
            'specialty': 'Tâm lý học tích cực',
            'experience': 6,
            'price': 450000,
            'languages': 'Tiếng Việt',
            'bio': 'Chuyên gia tâm lý học tích cực, coaching và phát triển bản thân.'
        },
    ]
    
    doctors = []
    for data in doctors_data:
        # Create user account
        doctor_user = User(
            email=data['email'],
            password_hash=generate_password_hash('Doctor@123'),
            full_name=data['full_name'],
            role='doctor',
            is_active=True,
            is_verified=True,
            subscription_plan='Doctor Basic',
            subscription_status='active',
            created_at=datetime.utcnow() - timedelta(days=random.randint(30, 365))
        )
        db.session.add(doctor_user)
        db.session.flush()  # Get the ID
        
        # Create doctor profile
        doctor_profile = DoctorProfile(
            user_id=doctor_user.id,
            specialization=data['specialty'],
            license_number=f'LIC{random.randint(10000, 99999)}',
            years_of_experience=data['experience'],
            bio=data['bio'],
            consultation_fee=data['price'],
            languages=data['languages'],
            is_verified=True,
            is_available=random.choice([True, True, True, False]),  # 75% available
            rating=round(random.uniform(4.5, 5.0), 1),
            total_sessions=random.randint(50, 200)
        )
        db.session.add(doctor_profile)
        doctors.append(doctor_user)
    
    db.session.commit()
    print(f"✅ Created {len(doctors)} doctors")
    print("   All doctors password: Doctor@123")
    
    return doctors


def seed_sample_data(users, doctors):
    """Create sample appointments, chat sessions, etc."""
    print("🌱 Seeding sample data...")
    
    if not users or not doctors:
        print("⚠️  No users or doctors found. Skipping sample data.")
        return
    
    # Get regular users (not admin)
    regular_users = [u for u in users if u.role == 'user']
    
    if not regular_users:
        print("⚠️  No regular users found. Skipping sample data.")
        return
    
    # Create sample appointments
    appointments = []
    for i in range(5):
        user = random.choice(regular_users)
        doctor = random.choice(doctors)
        
        appointment = Appointment(
            user_id=user.id,
            doctor_id=doctor.id,
            appointment_date=datetime.utcnow() + timedelta(days=random.randint(1, 30)),
            appointment_type=random.choice(['consultation', 'initial', 'follow_up']),
            status=random.choice(['scheduled', 'confirmed']),
            notes=f'Appointment for {user.full_name}',
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 7))
        )
        appointments.append(appointment)
    
    db.session.add_all(appointments)
    
    # Create sample payments
    payments = []
    for user in regular_users:
        if user.subscription_plan != 'Free':
            payment = Payment(
                user_id=user.id,
                amount=99000 if user.subscription_plan == 'Pro' else 299000,
                payment_method='vnpay',
                payment_type='subscription',
                status='completed',
                description=f'{user.subscription_plan} plan subscription',
                billing_cycle='monthly',
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )
            payments.append(payment)
    
    db.session.add_all(payments)
    
    db.session.commit()
    print(f"✅ Created {len(appointments)} appointments and {len(payments)} payments")


def seed_exercises():
    """Create mental health exercises"""
    print("🌱 Seeding exercises...")
    
    # Check if exercises already exist
    existing_exercises = Exercise.query.count()
    if existing_exercises > 0:
        print(f"⚠️  Exercises already exist ({existing_exercises}). Skipping.")
        return
    
    exercises = [
        # Breathing Exercises
        Exercise(
            title='Thở Sâu 4-7-8',
            description='Kỹ thuật thở giúp giảm căng thẳng và lo âu nhanh chóng',
            category='breathing',
            difficulty='beginner',
            duration_minutes=5,
            instructions='''1. Ngồi hoặc nằm ở tư thế thoải mái
2. Thở ra hoàn toàn qua miệng
3. Nhắm mắt và hít vào qua mũi đếm đến 4
4. Nín thở đếm đến 7
5. Thở ra qua miệng đếm đến 8
6. Lặp lại chu kỳ này 4 lần''',
            benefits='Giảm lo âu, cải thiện giấc ngủ, giảm huyết áp, tăng sự tập trung'
        ),
        Exercise(
            title='Thở Hộp (Box Breathing)',
            description='Kỹ thuật thở được sử dụng bởi lực lượng đặc nhiệm để giữ bình tĩnh',
            category='breathing',
            difficulty='beginner',
            duration_minutes=5,
            instructions='''1. Ngồi thẳng lưng, chân chạm sàn
2. Thở ra hoàn toàn
3. Hít vào qua mũi đếm đến 4
4. Nín thở đếm đến 4
5. Thở ra qua miệng đếm đến 4
6. Nín thở đếm đến 4
7. Lặp lại 5-10 phút''',
            benefits='Giảm stress, cải thiện sự tập trung, kiểm soát cảm xúc tốt hơn'
        ),
        Exercise(
            title='Thở Bụng (Diaphragmatic Breathing)',
            description='Thở sâu bằng cơ hoành để thư giãn toàn thân',
            category='breathing',
            difficulty='beginner',
            duration_minutes=10,
            instructions='''1. Nằm ngửa hoặc ngồi thoải mái
2. Đặt một tay lên ngực, một tay lên bụng
3. Hít vào sâu qua mũi, để bụng nở ra
4. Thở ra chậm qua miệng, bụng xẹp xuống
5. Tay trên ngực gần như không di chuyển
6. Lặp lại 10-15 phút''',
            benefits='Giảm nhịp tim, hạ huyết áp, giảm căng thẳng cơ bắp'
        ),
        
        # Meditation Exercises
        Exercise(
            title='Thiền Chánh Niệm (Mindfulness)',
            description='Tập trung vào hiện tại, quan sát suy nghĩ không phán xét',
            category='meditation',
            difficulty='intermediate',
            duration_minutes=10,
            instructions='''1. Ngồi ở tư thế thoải mái, lưng thẳng
2. Nhắm mắt hoặc nhìn xuống phía trước
3. Tập trung vào hơi thở tự nhiên
4. Khi tâm trí lang thang, nhẹ nhàng đưa về hơi thở
5. Quan sát suy nghĩ và cảm xúc mà không phán xét
6. Tiếp tục 10-15 phút''',
            benefits='Giảm lo âu, tăng nhận thức bản thân, cải thiện tập trung'
        ),
        Exercise(
            title='Quét Cơ Thể (Body Scan)',
            description='Thư giãn từng phần cơ thể một cách có ý thức',
            category='meditation',
            difficulty='beginner',
            duration_minutes=15,
            instructions='''1. Nằm ngửa, tay để dọc thân
2. Bắt đầu từ ngón chân, chú ý cảm giác
3. Từ từ di chuyển lên: bàn chân, cẳng chân, đùi
4. Tiếp tục qua bụng, ngực, tay, vai, cổ
5. Kết thúc ở đầu và mặt
6. Thư giãn mỗi phần khi quét qua''',
            benefits='Giảm căng thẳng cơ bắp, cải thiện giấc ngủ, tăng nhận thức cơ thể'
        ),
        Exercise(
            title='Thiền Từ Bi (Loving-Kindness)',
            description='Nuôi dưỡng lòng từ bi với bản thân và người khác',
            category='meditation',
            difficulty='intermediate',
            duration_minutes=12,
            instructions='''1. Ngồi thoải mái, nhắm mắt
2. Bắt đầu với bản thân: "Mong tôi được bình an"
3. Mở rộng đến người thân: "Mong bạn được hạnh phúc"
4. Tiếp tục với người trung lập
5. Cuối cùng đến người khó chịu
6. Kết thúc với tất cả chúng sinh''',
            benefits='Tăng cảm xúc tích cực, giảm tự phê phán, cải thiện mối quan hệ'
        ),
        
        # Journaling Exercises
        Exercise(
            title='Nhật Ký Biết Ơn',
            description='Viết ra những điều bạn biết ơn mỗi ngày',
            category='journaling',
            difficulty='beginner',
            duration_minutes=5,
            instructions='''1. Chọn thời điểm cố định mỗi ngày
2. Viết ra 3-5 điều bạn biết ơn
3. Cụ thể và chi tiết
4. Tập trung vào cảm xúc
5. Đọc lại những ghi chép trước
6. Phản ánh về sự thay đổi''',
            benefits='Tăng hạnh phúc, cải thiện tâm trạng, giảm trầm cảm'
        ),
        Exercise(
            title='Ghi Chép Suy Nghĩ (Thought Record)',
            description='Theo dõi và thách thức suy nghĩ tiêu cực',
            category='journaling',
            difficulty='intermediate',
            duration_minutes=10,
            instructions='''1. Ghi lại tình huống gây stress
2. Viết cảm xúc và mức độ (0-10)
3. Ghi suy nghĩ tự động xuất hiện
4. Tìm bằng chứng ủng hộ/phản bác
5. Viết suy nghĩ cân bằng hơn
6. Đánh giá lại cảm xúc''',
            benefits='Giảm suy nghĩ tiêu cực, tăng tư duy logic, cải thiện tâm trạng'
        ),
        Exercise(
            title='Viết Tự Do (Free Writing)',
            description='Viết liên tục không dừng để giải phóng cảm xúc',
            category='journaling',
            difficulty='beginner',
            duration_minutes=8,
            instructions='''1. Đặt hẹn giờ 8 phút
2. Viết liên tục, không dừng
3. Không sửa lỗi, không phán xét
4. Viết bất cứ điều gì xuất hiện
5. Nếu bí, viết "tôi không biết viết gì"
6. Đọc lại sau khi hoàn thành''',
            benefits='Giải phóng cảm xúc, tăng sáng tạo, giảm stress'
        ),
        
        # CBT Exercises
        Exercise(
            title='Tái Cấu Trúc Nhận Thức',
            description='Thay đổi cách suy nghĩ để cải thiện cảm xúc',
            category='cbt',
            difficulty='intermediate',
            duration_minutes=15,
            instructions='''1. Xác định suy nghĩ tiêu cực
2. Nhận ra lỗi tư duy (nhị phân, quá tổng quát...)
3. Tìm bằng chứng thực tế
4. Tạo suy nghĩ thay thế cân bằng
5. Thực hành suy nghĩ mới
6. Theo dõi thay đổi cảm xúc''',
            benefits='Giảm lo âu và trầm cảm, tư duy linh hoạt hơn, tăng tự tin'
        ),
        Exercise(
            title='Kích Hoạt Hành Vi',
            description='Lên kế hoạch hoạt động để cải thiện tâm trạng',
            category='cbt',
            difficulty='beginner',
            duration_minutes=10,
            instructions='''1. Liệt kê hoạt động từng thích
2. Đánh giá mức độ thích thú (0-10)
3. Chọn 2-3 hoạt động khả thi
4. Lên lịch cụ thể
5. Thực hiện và ghi nhận cảm xúc
6. Điều chỉnh kế hoạch nếu cần''',
            benefits='Tăng động lực, giảm trầm cảm, cải thiện năng lượng'
        ),
        Exercise(
            title='Đối Mặt Dần Dần (Graded Exposure)',
            description='Từ từ đối mặt với nỗi sợ để giảm lo âu',
            category='cbt',
            difficulty='advanced',
            duration_minutes=20,
            instructions='''1. Xác định nỗi sợ cần đối mặt
2. Tạo thang bậc lo âu (0-10)
3. Bắt đầu từ mức thấp nhất
4. Ở lại cho đến khi lo âu giảm
5. Tiến lên bậc tiếp theo
6. Lặp lại cho đến khi hoàn thành''',
            benefits='Giảm lo âu, tăng tự tin, mở rộng vùng thoải mái'
        ),
        
        # Relaxation Exercises
        Exercise(
            title='Thư Giãn Cơ Tiến Triển (PMR)',
            description='Căng và thả lỏng từng nhóm cơ để giảm căng thẳng',
            category='relaxation',
            difficulty='intermediate',
            duration_minutes=20,
            instructions='''1. Nằm hoặc ngồi thoải mái
2. Bắt đầu từ bàn chân: căng 5 giây
3. Thả lỏng hoàn toàn 10 giây
4. Di chuyển lên: chân, bụng, tay, vai
5. Kết thúc ở mặt và đầu
6. Cảm nhận sự khác biệt''',
            benefits='Giảm căng thẳng cơ bắp, cải thiện giấc ngủ, giảm đau đầu'
        ),
        Exercise(
            title='Tưởng Tượng Hướng Dẫn',
            description='Hình dung một nơi yên bình để thư giãn tâm trí',
            category='relaxation',
            difficulty='beginner',
            duration_minutes=8,
            instructions='''1. Ngồi hoặc nằm thoải mái
2. Nhắm mắt, thở sâu
3. Hình dung nơi yên bình (bãi biển, rừng...)
4. Sử dụng tất cả giác quan
5. Ở lại đó 5-10 phút
6. Từ từ quay về hiện tại''',
            benefits='Giảm stress, tăng cảm giác bình an, cải thiện tâm trạng'
        ),
        Exercise(
            title='Yoga Buổi Sáng',
            description='Các động tác yoga nhẹ nhàng để khởi động ngày mới',
            category='relaxation',
            difficulty='beginner',
            duration_minutes=15,
            instructions='''1. Bắt đầu với tư thế núi (Mountain Pose)
2. Chào mặt trời (Sun Salutation) 3 lần
3. Tư thế con mèo-con bò (Cat-Cow)
4. Tư thế con chó úp mặt (Downward Dog)
5. Tư thế chiến binh (Warrior Pose)
6. Kết thúc với tư thế xác chết (Savasana)''',
            benefits='Tăng năng lượng, cải thiện linh hoạt, giảm căng thẳng'
        ),
    ]
    
    db.session.add_all(exercises)
    db.session.commit()
    print(f"✅ Created {len(exercises)} exercises")


def seed_all():
    """Seed all data"""
    print("\n" + "="*50)
    print("🌱 Starting comprehensive database seeding...")
    print("="*50 + "\n")
    
    app = create_app()
    
    with app.app_context():
        try:
            seed_plans()
            seed_ai_models()
            users = seed_users()
            doctors = seed_doctors()
            seed_exercises()
            seed_sample_data(users, doctors)
            
            print("\n" + "="*50)
            print("✅ Database seeding completed successfully!")
            print("="*50 + "\n")
            
            # Summary
            print("📊 Summary:")
            print(f"   Plans: {Plan.query.count()}")
            print(f"   AI Models: {AIModel.query.count()}")
            print(f"   Users: {User.query.filter_by(role='user').count()}")
            print(f"   Doctors: {User.query.filter_by(role='doctor').count()}")
            print(f"   Exercises: {Exercise.query.count()}")
            print(f"   Appointments: {Appointment.query.count()}")
            print(f"   Payments: {Payment.query.count()}")
            print("\n")
            
            print("🔑 Login Credentials:")
            print("   Admin: admin@mindcare.ai / Admin@123")
            print("   User: user1@test.com / User@123")
            print("   Doctor: doctor1@mindcare.ai / Doctor@123")
            print("\n")
            
        except Exception as e:
            print(f"\n❌ Error during seeding: {str(e)}")
            db.session.rollback()
            raise


if __name__ == '__main__':
    seed_all()


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
    Appointment, Payment, Exercise, PatientRecord, Alert
)
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import random

def seed_plans():
    """Seed initial plans"""
    print("Seeding plans...")
    
    # Check if plans already exist
    existing_plans = Plan.query.count()
    if existing_plans > 0:
        print(f"Plans already exist ({existing_plans}). Skipping.")
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
    print(f"Created {len(plans)} plans")


def seed_ai_models():
    """Seed AI model configurations"""
    print("Seeding AI models...")
    
    # Check if models already exist
    existing_models = AIModel.query.count()
    if existing_models > 0:
        print(f"AI models already exist ({existing_models}). Skipping.")
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
    print(f"Created {len(models)} AI models")


def seed_users():
    """Create test users"""
    print("Seeding users...")
    
    # Check if users already exist
    existing_users_count = User.query.count()
    if existing_users_count > 0:
        print(f"Users already exist ({existing_users_count}). Skipping creation.")
        return User.query.all()
    
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
            full_name='John Doe',
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
            full_name='Jane Smith',
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
            full_name='Robert Johnson',
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
    print(f"Created {len(users)} users")
    print("   Admin: admin@mindcare.ai / Admin@123")
    print("   User1: user1@test.com / User@123 (Pro)")
    print("   User2: user2@test.com / User@123 (Clinical)")
    print("   User3: user3@test.com / User@123 (Free)")
    
    return users


def seed_doctors():
    """Create test doctors"""
    print("Seeding doctors...")
    
    # Check if doctors already exist
    existing_doctors_count = User.query.filter_by(role='doctor').count()
    if existing_doctors_count > 0:
        print(f"Doctors already exist ({existing_doctors_count}). Updating information...")
    
    doctors_data = [
        {
            'email': 'doctor1@mindcare.ai',
            'full_name': 'Dr. Sarah Wilson',
            'specialty': 'Clinical Psychology',
            'experience': 10,
            'price': 500000,
            'languages': 'Vietnamese, English',
            'bio': 'Clinical psychologist with 10 years of experience treating anxiety and depression.'
        },
        {
            'email': 'doctor2@mindcare.ai',
            'full_name': 'Dr. Michael Brown',
            'specialty': 'CBT Therapy',
            'experience': 8,
            'price': 600000,
            'languages': 'Vietnamese',
            'bio': 'Cognitive Behavioral Therapy (CBT) specialist for emotional and behavioral issues.'
        },
        {
            'email': 'doctor3@mindcare.ai',
            'full_name': 'Dr. Emily Davis',
            'specialty': 'Child Psychology',
            'experience': 12,
            'price': 550000,
            'languages': 'Vietnamese, English',
            'bio': 'Psychologist specializing in child and adolescent development and behavior.'
        },
        {
            'email': 'doctor4@mindcare.ai',
            'full_name': 'Dr. James Miller',
            'specialty': 'Family Psychology',
            'experience': 15,
            'price': 700000,
            'languages': 'Vietnamese, English, Chinese',
            'bio': 'Family and marriage counselor with international experience.'
        },
        {
            'email': 'doctor5@mindcare.ai',
            'full_name': 'Dr. David Anderson',
            'specialty': 'Positive Psychology',
            'experience': 6,
            'price': 450000,
            'languages': 'Vietnamese',
            'bio': 'Positive psychology expert, coaching, and personal development.'
        },
    ]
    
    doctors = []
    for data in doctors_data:
        # Check if user exists
        doctor_user = User.query.filter_by(email=data['email']).first()
        
        if doctor_user:
            # Update existing user
            doctor_user.full_name = data['full_name']
            # Update profile
            doctor_profile = DoctorProfile.query.filter_by(user_id=doctor_user.id).first()
            if doctor_profile:
                doctor_profile.specialization = data['specialty']
                doctor_profile.bio = data['bio']
                doctor_profile.languages = data['languages']
        else:
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
    
    db.session.commit()
    print(f"Created {len(doctors)} doctors")
    print("   All doctors password: Doctor@123")
    
    return doctors


def seed_sample_data(users, doctors):
    """Create sample appointments, chat sessions, etc."""
    print("Seeding sample data...")
    
    if not users or not doctors:
        print("No users or doctors found. Skipping sample data.")
        return
    
    # Get regular users (not admin)
    regular_users = [u for u in users if u.role == 'user']
    
    if not regular_users:
        print("No regular users found. Skipping sample data.")
        return

    # Create Patient Records (Assign patients to doctors)
    print("   Assigning patients to doctors...")
    patient_records = []
    
    # Ensure doctor1 has patients
    doctor1 = next((d for d in doctors if d.email == 'doctor1@mindcare.ai'), doctors[0])
    
    for i, user in enumerate(regular_users):
        # Assign first 2 users to doctor1, others randomly
        assigned_doctor = doctor1 if i < 2 else random.choice(doctors)
        
        record = PatientRecord(
            user_id=user.id,
            doctor_id=assigned_doctor.id,
            diagnosis=random.choice(['Anxiety Disorder', 'Mild Depression', 'Work Stress', 'Insomnia']),
            created_at=datetime.utcnow() - timedelta(days=random.randint(30, 90)),
            updated_at=datetime.utcnow()
        )
        patient_records.append(record)
    
    db.session.add_all(patient_records)
    db.session.commit() # Commit records first
    
    # Create sample appointments
    appointments = []
    for i in range(10): # Increased appointments
        user = random.choice(regular_users)
        # Prefer assigning appointment to their doctor if they have one
        record = next((r for r in patient_records if r.user_id == user.id), None)
        
        doctor_user_id = record.doctor_id if record else random.choice(doctors).id
        doctor_profile = DoctorProfile.query.filter_by(user_id=doctor_user_id).first()
        
        if not doctor_profile:
            continue

        appointment = Appointment(
            user_id=user.id,
            doctor_id=doctor_profile.id,
            appointment_date=datetime.utcnow() + timedelta(days=random.randint(-5, 10)), # Some past, some future
            appointment_type=random.choice(['consultation', 'initial', 'follow_up']),
            status=random.choice(['scheduled', 'confirmed', 'completed']),
            notes=f'Appointment for {user.full_name}',
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 7))
        )
        appointments.append(appointment)
    
    db.session.add_all(appointments)
    
    # Create sample payments
    payments = []
    for user in regular_users:
        if user.subscription_plan != 'Free':
            plan = Plan.query.filter_by(name=user.subscription_plan).first()
            if not plan:
                continue
                
            payment = Payment(
                user_id=user.id,
                plan_id=plan.id,
                amount=99000 if user.subscription_plan == 'Pro' else 299000,
                payment_method='vnpay',
                payment_status='completed',
                billing_cycle='monthly',
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )
            payments.append(payment)
    
    db.session.add_all(payments)

    # Create sample alerts
    alerts = []
    for user in regular_users:
        # Create 1-2 alerts per user
        for _ in range(random.randint(1, 2)):
            alert = Alert(
                user_id=user.id,
                alert_type=random.choice(['risk_assessment', 'missed_session', 'anxiety_spike']),
                severity=random.choice(['low', 'medium', 'high']),
                message=f'Alert for {user.full_name}: Potential issue detected.',
                is_resolved=random.choice([True, False]),
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 5))
            )
            alerts.append(alert)
    
    db.session.add_all(alerts)
    
    db.session.commit()
    print(f"Created {len(patient_records)} patient records, {len(appointments)} appointments, {len(payments)} payments, and {len(alerts)} alerts")


def seed_exercises():
    """Create mental health exercises"""
    print("Seeding exercises...")
    
    # Check if exercises already exist
    existing_exercises = Exercise.query.count()
    if existing_exercises > 0:
        print(f"Exercises already exist ({existing_exercises}). Skipping.")
        return
    
    exercises = [
        # Breathing Exercises
        Exercise(
            title='4-7-8 Deep Breathing',
            description='Breathing technique to reduce stress and anxiety quickly',
            category='breathing',
            difficulty='beginner',
            duration_minutes=5,
            instructions='''1. Sit or lie in a comfortable position
2. Exhale completely through your mouth
3. Close your eyes and inhale through your nose for a count of 4
4. Hold your breath for a count of 7
5. Exhale through your mouth for a count of 8
6. Repeat this cycle 4 times''',
            benefits='Reduces anxiety, improves sleep, lowers blood pressure, increases focus'
        ),
        Exercise(
            title='Box Breathing',
            description='Breathing technique used by special forces to stay calm',
            category='breathing',
            difficulty='beginner',
            duration_minutes=5,
            instructions='''1. Sit with your back straight, feet on the floor
2. Exhale completely
3. Inhale through your nose for a count of 4
4. Hold your breath for a count of 4
5. Exhale through your mouth for a count of 4
6. Hold your breath for a count of 4
7. Repeat for 5-10 minutes''',
            benefits='Reduces stress, improves concentration, better emotional control'
        ),
        Exercise(
            title='Diaphragmatic Breathing',
            description='Deep belly breathing for total body relaxation',
            category='breathing',
            difficulty='beginner',
            duration_minutes=10,
            instructions='''1. Lie on your back or sit comfortably
2. Place one hand on your chest, one on your belly
3. Inhale deeply through your nose, letting your belly expand
4. Exhale slowly through your mouth, belly deflating
5. The hand on your chest should barely move
6. Repeat for 10-15 minutes''',
            benefits='Lowers heart rate, lowers blood pressure, reduces muscle tension'
        ),
        
        # Meditation Exercises
        Exercise(
            title='Mindfulness Meditation',
            description='Focus on the present, observing thoughts without judgment',
            category='meditation',
            difficulty='intermediate',
            duration_minutes=10,
            instructions='''1. Sit comfortably with your back straight
2. Close your eyes or gaze downward
3. Focus on your natural breath
4. When your mind wanders, gently bring it back to your breath
5. Observe thoughts and emotions without judgment
6. Continue for 10-15 minutes''',
            benefits='Reduces anxiety, increases self-awareness, improves focus'
        ),
        Exercise(
            title='Body Scan',
            description='Consciously relax each part of your body',
            category='meditation',
            difficulty='beginner',
            duration_minutes=15,
            instructions='''1. Lie on your back, arms by your sides
2. Start from your toes, notice sensations
3. Slowly move up: feet, calves, thighs
4. Continue through belly, chest, arms, shoulders, neck
5. Finish at your head and face
6. Relax each part as you scan through''',
            benefits='Reduces muscle tension, improves sleep, increases body awareness'
        ),
        Exercise(
            title='Loving-Kindness Meditation',
            description='Cultivate compassion for yourself and others',
            category='meditation',
            difficulty='intermediate',
            duration_minutes=12,
            instructions='''1. Sit comfortably, close your eyes
2. Start with yourself: "May I be peaceful"
3. Extend to loved ones: "May you be happy"
4. Continue with neutral people
5. Finally to difficult people
6. End with all beings''',
            benefits='Increases positive emotions, reduces self-criticism, improves relationships'
        ),
        
        # Journaling Exercises
        Exercise(
            title='Gratitude Journal',
            description='Write down things you are grateful for each day',
            category='journaling',
            difficulty='beginner',
            duration_minutes=5,
            instructions='''1. Choose a fixed time each day
2. Write down 3-5 things you are grateful for
3. Be specific and detailed
4. Focus on the feeling
5. Read back previous entries
6. Reflect on changes''',
            benefits='Increases happiness, improves mood, reduces depression'
        ),
        Exercise(
            title='Thought Record',
            description='Track and challenge negative thoughts',
            category='journaling',
            difficulty='intermediate',
            duration_minutes=10,
            instructions='''1. Record the stressful situation
2. Write down emotions and intensity (0-10)
3. Record automatic thoughts
4. Find evidence for/against
5. Write a more balanced thought
6. Re-evaluate emotions''',
            benefits='Reduces negative thinking, increases logical thinking, improves mood'
        ),
        Exercise(
            title='Free Writing',
            description='Write continuously to release emotions',
            category='journaling',
            difficulty='beginner',
            duration_minutes=8,
            instructions='''1. Set a timer for 8 minutes
2. Write continuously, don't stop
3. Don't correct errors, don't judge
4. Write whatever comes up
5. If stuck, write "I don't know what to write"
6. Read back after finishing''',
            benefits='Releases emotions, increases creativity, reduces stress'
        ),
        
        # CBT Exercises
        Exercise(
            title='Cognitive Restructuring',
            description='Change thinking patterns to improve emotions',
            category='cbt',
            difficulty='intermediate',
            duration_minutes=15,
            instructions='''1. Identify negative thoughts
2. Recognize cognitive distortions (black/white thinking, overgeneralizing...)
3. Find realistic evidence
4. Create alternative balanced thoughts
5. Practice new thoughts
6. Track emotional changes''',
            benefits='Reduces anxiety and depression, flexible thinking, increases confidence'
        ),
        Exercise(
            title='Behavioral Activation',
            description='Plan activities to improve mood',
            category='cbt',
            difficulty='beginner',
            duration_minutes=10,
            instructions='''1. List activities you used to enjoy
2. Rate enjoyment level (0-10)
3. Choose 2-3 feasible activities
4. Schedule specifically
5. Do it and record feelings
6. Adjust plan if needed''',
            benefits='Increases motivation, reduces depression, improves energy'
        ),
        Exercise(
            title='Graded Exposure',
            description='Gradually face fears to reduce anxiety',
            category='cbt',
            difficulty='advanced',
            duration_minutes=20,
            instructions='''1. Identify the fear to face
2. Create an anxiety hierarchy (0-10)
3. Start from the lowest level
4. Stay until anxiety drops
5. Move to the next level
6. Repeat until completed''',
            benefits='Reduces anxiety, increases confidence, expands comfort zone'
        ),
        
        # Relaxation Exercises
        Exercise(
            title='Progressive Muscle Relaxation (PMR)',
            description='Tense and relax muscle groups to reduce stress',
            category='relaxation',
            difficulty='intermediate',
            duration_minutes=20,
            instructions='''1. Lie or sit comfortably
2. Start from feet: tense for 5 seconds
3. Relax completely for 10 seconds
4. Move up: legs, belly, hands, shoulders
5. Finish at face and head
6. Feel the difference''',
            benefits='Reduces muscle tension, improves sleep, reduces headaches'
        ),
        Exercise(
            title='Guided Imagery',
            description='Visualize a peaceful place to relax the mind',
            category='relaxation',
            difficulty='beginner',
            duration_minutes=8,
            instructions='''1. Sit or lie comfortably
2. Close eyes, breathe deeply
3. Visualize a peaceful place (beach, forest...)
4. Use all senses
5. Stay there for 5-10 minutes
6. Slowly return to the present''',
            benefits='Reduces stress, increases peace, improves mood'
        ),
        Exercise(
            title='Morning Yoga',
            description='Gentle yoga poses to start the day',
            category='relaxation',
            difficulty='beginner',
            duration_minutes=15,
            instructions='''1. Start with Mountain Pose
2. Sun Salutation 3 times
3. Cat-Cow Pose
4. Downward Dog
5. Warrior Pose
6. End with Savasana''',
            benefits='Increases energy, improves flexibility, reduces stress'
        ),
    ]
    
    db.session.add_all(exercises)
    db.session.commit()
    print(f"Created {len(exercises)} exercises")


def seed_all():
    """Seed all data"""
    print("\n" + "="*50)
    print("Starting comprehensive database seeding...")
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
            print("Database seeding completed successfully!")
            print("="*50 + "\n")
            
            # Summary
            print("Summary:")
            print(f"   Plans: {Plan.query.count()}")
            print(f"   AI Models: {AIModel.query.count()}")
            print(f"   Users: {User.query.filter_by(role='user').count()}")
            print(f"   Doctors: {User.query.filter_by(role='doctor').count()}")
            print(f"   Exercises: {Exercise.query.count()}")
            print(f"   Appointments: {Appointment.query.count()}")
            print(f"   Payments: {Payment.query.count()}")
            print(f"   Alerts: {Alert.query.count()}")
            print("\n")
            
            print("Login Credentials:")
            print("   Admin: admin@mindcare.ai / Admin@123")
            print("   User: user1@test.com / User@123")
            print("   Doctor: doctor1@mindcare.ai / Doctor@123")
            print("\n")
            
        except Exception as e:
            import traceback
            error_msg = f"\nError during seeding: {str(e)}\n{traceback.format_exc()}"
            print(error_msg)
            with open('seed_error.txt', 'w', encoding='utf-8') as f:
                f.write(error_msg)
            db.session.rollback()
            raise


if __name__ == '__main__':
    seed_all()

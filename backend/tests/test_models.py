"""
Test all database models
"""
import pytest
from datetime import datetime, timedelta
from app.models.models import (
    User, DoctorProfile, ChatSession, ChatMessage, EmotionLog, Alert,
    Appointment, Exercise, UserExerciseProgress, Plan, Payment,
    PatientRecord, DoctorNote, TherapySession, Task, PsychologicalTest,
    ChatFeedback, AIModel, DoctorReview, DoctorAvailability, DoctorTimeOff
)
from app.extensions import db


class TestUserModel:
    """Test User model"""
    
    def test_create_user(self, app):
        """Test user creation"""
        with app.app_context():
            user = User(
                email='test@example.com',
                full_name='Test User',
                role='user'
            )
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            
            assert user.id is not None
            assert user.email == 'test@example.com'
            assert user.check_password('password123')
            assert not user.check_password('wrongpassword')
    
    def test_user_to_dict(self, app):
        """Test user serialization"""
        with app.app_context():
            user = User(
                email='test2@example.com',
                full_name='Test User 2',
                role='user',
                phone='0123456789'
            )
            user.set_password('password')
            db.session.add(user)
            db.session.commit()
            
            data = user.to_dict()
            assert data['email'] == 'test2@example.com'
            assert data['full_name'] == 'Test User 2'
            assert 'password_hash' not in data


class TestDoctorModels:
    """Test Doctor-related models"""
    
    def test_create_doctor_profile(self, app, sample_user):
        """Test doctor profile creation"""
        with app.app_context():
            doctor = DoctorProfile(
                user_id=sample_user.id,
                license_number='DOC12345',
                specialization='Clinical Psychology',
                years_of_experience=5,
                consultation_fee=500000
            )
            db.session.add(doctor)
            db.session.commit()
            
            assert doctor.id is not None
            assert doctor.license_number == 'DOC12345'
            assert doctor.specialization == 'Clinical Psychology'
    
    def test_create_appointment(self, app, sample_user, sample_doctor):
        """Test appointment creation"""
        with app.app_context():
            appointment = Appointment(
                user_id=sample_user.id,
                doctor_id=sample_doctor.id,
                appointment_date=datetime.utcnow() + timedelta(days=1),
                status='scheduled'
            )
            db.session.add(appointment)
            db.session.commit()
            
            assert appointment.id is not None
            assert appointment.status == 'scheduled'


class TestChatModels:
    """Test Chat-related models"""
    
    def test_create_chat_session(self, app, sample_user):
        """Test chat session creation"""
        with app.app_context():
            session = ChatSession(
                user_id=sample_user.id,
                title='Test Session',
                status='active'
            )
            db.session.add(session)
            db.session.commit()
            
            assert session.id is not None
            assert session.status == 'active'
    
    def test_create_chat_message(self, app, sample_chat_session):
        """Test chat message creation"""
        with app.app_context():
            message = ChatMessage(
                session_id=sample_chat_session.id,
                role='user',
                content='Hello, I need help',
                sentiment_score=0.5
            )
            db.session.add(message)
            db.session.commit()
            
            assert message.id is not None
            assert message.content == 'Hello, I need help'
    
    def test_chat_feedback(self, app, sample_user, sample_chat_message):
        """Test chat feedback"""
        with app.app_context():
            feedback = ChatFeedback(
                user_id=sample_user.id,
                message_id=sample_chat_message.id,
                rating=5,
                feedback_text='Very helpful!'
            )
            db.session.add(feedback)
            db.session.commit()
            
            assert feedback.id is not None
            assert feedback.rating == 5


class TestEmotionModels:
    """Test Emotion tracking models"""
    
    def test_create_emotion_log(self, app, sample_user):
        """Test emotion log creation"""
        with app.app_context():
            emotion = EmotionLog(
                user_id=sample_user.id,
                emotion='happy',
                intensity=8,
                notes='Feeling great today'
            )
            db.session.add(emotion)
            db.session.commit()
            
            assert emotion.id is not None
            assert emotion.emotion == 'happy'
            assert emotion.intensity == 8
    
    def test_create_alert(self, app, sample_user):
        """Test alert creation"""
        with app.app_context():
            alert = Alert(
                user_id=sample_user.id,
                alert_type='high_stress',
                severity='medium',
                message='User showing signs of high stress'
            )
            db.session.add(alert)
            db.session.commit()
            
            assert alert.id is not None
            assert alert.severity == 'medium'
            assert not alert.is_resolved
    
    def test_psychological_test(self, app, sample_user):
        """Test psychological test"""
        with app.app_context():
            test = PsychologicalTest(
                user_id=sample_user.id,
                test_type='PHQ-9',
                score=12,
                max_score=27,
                severity_level='moderate'
            )
            db.session.add(test)
            db.session.commit()
            
            assert test.id is not None
            assert test.test_type == 'PHQ-9'
            assert test.severity_level == 'moderate'


class TestExerciseModels:
    """Test Exercise-related models"""
    
    def test_create_exercise(self, app):
        """Test exercise creation"""
        with app.app_context():
            exercise = Exercise(
                title='Breathing Exercise',
                description='Deep breathing for relaxation',
                category='breathing',
                difficulty='beginner',
                duration_minutes=5,
                instructions='Breathe in for 4, hold for 4, out for 4'
            )
            db.session.add(exercise)
            db.session.commit()
            
            assert exercise.id is not None
            assert exercise.title == 'Breathing Exercise'
    
    def test_user_exercise_progress(self, app, sample_user, sample_exercise):
        """Test user exercise progress"""
        with app.app_context():
            progress = UserExerciseProgress(
                user_id=sample_user.id,
                exercise_id=sample_exercise.id,
                status='in_progress',
                progress_percentage=50
            )
            db.session.add(progress)
            db.session.commit()
            
            assert progress.id is not None
            assert progress.progress_percentage == 50
    
    def test_task_creation(self, app, sample_user, sample_doctor_user):
        """Test task creation"""
        with app.app_context():
            task = Task(
                patient_id=sample_user.id,
                assigned_by=sample_doctor_user.id,
                title='Complete mood journal',
                task_type='journal',
                status='pending'
            )
            db.session.add(task)
            db.session.commit()
            
            assert task.id is not None
            assert task.status == 'pending'


class TestPaymentModels:
    """Test Payment-related models"""
    
    def test_create_plan(self, app):
        """Test plan creation"""
        with app.app_context():
            plan = Plan(
                name='Pro Plan',
                user_type='user',
                price_monthly=99000,
                price_yearly=990000,
                chat_limit=-1
            )
            db.session.add(plan)
            db.session.commit()
            
            assert plan.id is not None
            assert plan.name == 'Pro Plan'
            assert plan.price_monthly == 99000
    
    def test_create_payment(self, app, sample_user, sample_plan):
        """Test payment creation"""
        with app.app_context():
            payment = Payment(
                user_id=sample_user.id,
                plan_id=sample_plan.id,
                amount=99000,
                payment_method='vnpay',
                payment_status='pending',
                billing_cycle='monthly'
            )
            db.session.add(payment)
            db.session.commit()
            
            assert payment.id is not None
            assert payment.payment_status == 'pending'


class TestMedicalModels:
    """Test Medical record models"""
    
    def test_patient_record(self, app, sample_user):
        """Test patient record creation"""
        with app.app_context():
            record = PatientRecord(
                user_id=sample_user.id,
                diagnosis='Anxiety disorder',
                medical_history='No previous mental health treatment'
            )
            db.session.add(record)
            db.session.commit()
            
            assert record.id is not None
            assert record.diagnosis == 'Anxiety disorder'
    
    def test_doctor_note(self, app, sample_user, sample_doctor_user):
        """Test doctor note creation"""
        with app.app_context():
            note = DoctorNote(
                doctor_id=sample_doctor_user.id,
                patient_id=sample_user.id,
                note_type='assessment',
                title='Initial Assessment',
                content='Patient shows signs of mild anxiety',
                is_private=True
            )
            db.session.add(note)
            db.session.commit()
            
            assert note.id is not None
            assert note.note_type == 'assessment'
    
    def test_therapy_session(self, app, sample_user, sample_doctor_user):
        """Test therapy session creation"""
        with app.app_context():
            session = TherapySession(
                doctor_id=sample_doctor_user.id,
                patient_id=sample_user.id,
                session_type='video',
                status='scheduled'
            )
            db.session.add(session)
            db.session.commit()
            
            assert session.id is not None
            assert session.session_type == 'video'


class TestDoctorReviewModels:
    """Test Doctor review models"""
    
    def test_doctor_review(self, app, sample_user, sample_doctor):
        """Test doctor review creation"""
        with app.app_context():
            review = DoctorReview(
                doctor_id=sample_doctor.id,
                user_id=sample_user.id,
                rating=5,
                review_text='Excellent doctor!',
                professionalism=5,
                communication=5,
                effectiveness=5
            )
            db.session.add(review)
            db.session.commit()
            
            assert review.id is not None
            assert review.rating == 5
    
    def test_doctor_availability(self, app, sample_doctor):
        """Test doctor availability"""
        with app.app_context():
            availability = DoctorAvailability(
                doctor_id=sample_doctor.id,
                day_of_week=1,  # Monday
                start_time=datetime.strptime('09:00', '%H:%M').time(),
                end_time=datetime.strptime('17:00', '%H:%M').time(),
                is_active=True
            )
            db.session.add(availability)
            db.session.commit()
            
            assert availability.id is not None
            assert availability.day_of_week == 1


class TestAIModel:
    """Test AI model configuration"""
    
    def test_ai_model_creation(self, app):
        """Test AI model creation"""
        with app.app_context():
            ai_model = AIModel(
                name='Qwen',
                provider='alibaba',
                model_version='2.5',
                is_active=True,
                max_tokens=4096
            )
            db.session.add(ai_model)
            db.session.commit()
            
            assert ai_model.id is not None
            assert ai_model.provider == 'alibaba'

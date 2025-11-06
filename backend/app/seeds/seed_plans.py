from app import create_app
from app.extensions import db
from app.models.models import Plan, AIModel, User
from datetime import datetime

def seed_plans():
    """Seed initial plans"""
    app = create_app()
    
    with app.app_context():
        # Check if plans already exist
        existing_plans = Plan.query.count()
        if existing_plans > 0:
            print(f"⚠️  Plans already exist ({existing_plans}). Skipping seed.")
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
                description='Enhanced AI support with emotion tracking and unlimited chats',
                user_type='user',
                price_monthly=99000,
                price_yearly=990000,
                chat_limit=-1,
                voice_enabled=True,
                video_enabled=False,
                empathy_layer_enabled=True,
                doctor_access=False,
                priority_support=False,
                is_active=True
            ),
            Plan(
                name='Clinical',
                description='Full access including doctor consultations and video sessions',
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
                description='Basic plan for mental health professionals',
                user_type='doctor',
                price_monthly=499000,
                price_yearly=4990000,
                chat_limit=-1,
                voice_enabled=True,
                video_enabled=True,
                empathy_layer_enabled=True,
                doctor_access=False,
                priority_support=True,
                max_patients=20,
                can_assign_plans=False,
                analytics_access=True,
                is_active=True
            ),
            Plan(
                name='Doctor Pro',
                description='Professional plan with advanced analytics and more patients',
                user_type='doctor',
                price_monthly=999000,
                price_yearly=9990000,
                chat_limit=-1,
                voice_enabled=True,
                video_enabled=True,
                empathy_layer_enabled=True,
                doctor_access=False,
                priority_support=True,
                max_patients=50,
                can_assign_plans=True,
                analytics_access=True,
                is_active=True
            ),
            Plan(
                name='Doctor Enterprise',
                description='Enterprise solution for clinics and hospitals',
                user_type='doctor',
                price_monthly=2999000,
                price_yearly=29990000,
                chat_limit=-1,
                voice_enabled=True,
                video_enabled=True,
                empathy_layer_enabled=True,
                doctor_access=False,
                priority_support=True,
                max_patients=-1,
                can_assign_plans=True,
                analytics_access=True,
                is_active=True
            )
        ]
        
        for plan in plans:
            db.session.add(plan)
        
        db.session.commit()
        print(f"✅ Successfully seeded {len(plans)} plans")


def seed_ai_models():
    """Seed initial AI models"""
    app = create_app()
    
    with app.app_context():
        # Check if models already exist
        existing_models = AIModel.query.count()
        if existing_models > 0:
            print(f"⚠️  AI Models already exist ({existing_models}). Skipping seed.")
            return
        
        models = [
            AIModel(
                name='Gemini Pro',
                provider='google',
                model_version='gemini-pro',
                is_active=True,
                is_default=True,
                avg_latency_ms=800,
                cost_per_1k_tokens=0.0005,
                max_tokens=4096,
                temperature=0.7,
                description='Google Gemini Pro - Balanced performance and empathy'
            ),
            AIModel(
                name='Gemini Flash',
                provider='google',
                model_version='gemini-2.5-flash',
                is_active=True,
                is_default=False,
                avg_latency_ms=400,
                cost_per_1k_tokens=0.0003,
                max_tokens=8192,
                temperature=0.7,
                description='Google Gemini Flash - Fast responses for real-time chat'
            ),
        ]
        
        for model in models:
            db.session.add(model)
        
        db.session.commit()
        print(f"✅ Successfully seeded {len(models)} AI models")


def seed_admin_user():
    """Seed initial admin user"""
    app = create_app()
    
    with app.app_context():
        # Check if admin exists
        admin = User.query.filter_by(email='admin@mindcare.ai').first()
        if admin:
            print("⚠️  Admin user already exists. Skipping.")
            return
        
        admin = User(
            email='admin@mindcare.ai',
            full_name='System Admin',
            role='admin',
            subscription_plan='free',
            subscription_status='active',
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow()
        )
        admin.set_password('Admin@123')  # Change this in production!
        
        db.session.add(admin)
        db.session.commit()
        
        print(f"✅ Successfully created admin user")
        print(f"   Email: admin@mindcare.ai")
        print(f"   Password: Admin@123 (Please change after first login!)")


def seed_all():
    """Seed all data"""
    print("\n🌱 Starting database seeding...")
    print("=" * 50)
    
    seed_plans()
    seed_ai_models()
    seed_admin_user()
    
    print("=" * 50)
    print("✅ Database seeding completed!\n")


if __name__ == '__main__':
    seed_all()

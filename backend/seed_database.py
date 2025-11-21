"""
Seed script to initialize database with default data
Run from backend directory: python seed_database.py
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.models import Plan, AIModel, User
from datetime import datetime

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


def seed_admin():
    """Create default admin user"""
    print("🌱 Seeding admin user...")
    
    # Check if admin already exists
    admin = User.query.filter_by(email='admin@mindcare.ai').first()
    if admin:
        print("⚠️  Admin user already exists. Skipping.")
        return
    
    from werkzeug.security import generate_password_hash
    
    admin = User(
        email='admin@mindcare.ai',
        password_hash=generate_password_hash('Admin@123'),
        full_name='System Administrator',
        role='admin',
        is_active=True,
        is_verified=True,
        subscription_plan='Free',
        subscription_status='active',
        created_at=datetime.utcnow()
    )
    
    db.session.add(admin)
    db.session.commit()
    print("✅ Created admin user")
    print("   Email: admin@mindcare.ai")
    print("   Password: Admin@123")


def seed_all():
    """Seed all data"""
    print("\n" + "="*50)
    print("🌱 Starting database seeding...")
    print("="*50 + "\n")
    
    app = create_app()
    
    with app.app_context():
        try:
            seed_plans()
            seed_ai_models()
            seed_admin()
            
            print("\n" + "="*50)
            print("✅ Database seeding completed successfully!")
            print("="*50 + "\n")
            
            # Summary
            print("📊 Summary:")
            print(f"   Plans: {Plan.query.count()}")
            print(f"   AI Models: {AIModel.query.count()}")
            print(f"   Users: {User.query.count()}")
            print("\n")
            
        except Exception as e:
            print(f"\n❌ Error during seeding: {str(e)}")
            db.session.rollback()
            raise


if __name__ == '__main__':
    seed_all()

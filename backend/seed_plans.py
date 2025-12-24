"""
Seed initial plans to database
Run: python seed_plans.py
"""

from app import create_app
from app.extensions import db
from app.models.models import Plan

app = create_app()

with app.app_context():
    print("🌱 Seeding plans...")
    
    # New 3-tier structure for users + 2 doctor plans
    plans_data = [
        # FREE TIER
        {
            'name': 'Free',
            'description': 'Gói miễn phí - Trải nghiệm AI chatbot cơ bản',
            'user_type': 'user',
            'price_monthly': 0,
            'price_yearly': 0,
            'chat_limit': 10,  # 10 chat sessions per day
            'voice_enabled': False,
            'video_enabled': False,
            'empathy_layer_enabled': False,
            'doctor_access': False,
            'priority_support': False,
            'max_patients': 0,
            'can_assign_plans': False,
            'analytics_access': False
        },
        
        # PREMIUM TIER
        {
            'name': 'Premium',
            'description': 'Gói cao cấp - Truy cập đầy đủ tính năng AI và bác sĩ',
            'user_type': 'user',
            'price_monthly': 149000,
            'price_yearly': 1490000,  # ~10 months price
            'chat_limit': -1,  # Unlimited
            'voice_enabled': True,
            'video_enabled': True,
            'empathy_layer_enabled': True,
            'doctor_access': True,  # Can book doctors (must pay per session)
            'priority_support': True,
            'max_patients': 0,
            'can_assign_plans': False,
            'analytics_access': False
        },
        
        # VIP TIER
        {
            'name': 'VIP',
            'description': 'Gói VIP - Tư vấn không giới hạn với ưu đãi đặc biệt',
            'user_type': 'user',
            'price_monthly': 499000,
            'price_yearly': 4990000,  # ~10 months price
            'chat_limit': -1,  # Unlimited
            'voice_enabled': True,
            'video_enabled': True,
            'empathy_layer_enabled': True,
            'doctor_access': True,
            'priority_support': True,
            'max_patients': 0,
            'can_assign_plans': False,
            'analytics_access': True
        },
        
        # DOCTOR PLANS
        {
            'name': 'Doctor Basic',
            'description': 'Gói cơ bản cho bác sĩ - Quản lý tối đa 30 bệnh nhân',
            'user_type': 'doctor',
            'price_monthly': 299000,
            'price_yearly': 2990000,
            'chat_limit': -1,
            'voice_enabled': True,
            'video_enabled': True,
            'empathy_layer_enabled': True,
            'doctor_access': True,
            'priority_support': True,
            'max_patients': 30,
            'can_assign_plans': False,
            'analytics_access': True
        },
        {
            'name': 'Doctor Pro',
            'description': 'Gói chuyên nghiệp cho bác sĩ - Không giới hạn bệnh nhân',
            'user_type': 'doctor',
            'price_monthly': 599000,
            'price_yearly': 5990000,
            'chat_limit': -1,
            'voice_enabled': True,
            'video_enabled': True,
            'empathy_layer_enabled': True,
            'doctor_access': True,
            'priority_support': True,
            'max_patients': -1,
            'can_assign_plans': True,
            'analytics_access': True
        }
    ]
    
    created_count = 0
    updated_count = 0
    
    for plan_data in plans_data:
        existing = Plan.query.filter_by(name=plan_data['name']).first()
        
        if not existing:
            plan = Plan(**plan_data)
            db.session.add(plan)
            created_count += 1
            print(f"  ✅ Created: {plan_data['name']}")
        else:
            # Update existing plan
            for key, value in plan_data.items():
                setattr(existing, key, value)
            updated_count += 1
            print(f"  🔄 Updated: {plan_data['name']}")
    
    db.session.commit()
    
    print(f"\n✅ Seeding completed!")
    print(f"   Created: {created_count}")
    print(f"   Updated: {updated_count}")
    print(f"   Total plans: {Plan.query.count()}")

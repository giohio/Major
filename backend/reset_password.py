"""
Reset password for user1@test.com
"""
from app import create_app
from app.models.models import User
from app.extensions import db

def reset_password():
    app = create_app()
    
    with app.app_context():
        print("\n" + "="*50)
        print("Resetting password for user1@test.com...")
        print("="*50 + "\n")
        
        user = User.query.filter_by(email='user1@test.com').first()
        
        if not user:
            print("❌ user1@test.com not found! Creating it...")
            user = User(
                email='user1@test.com',
                full_name='Test User',
                role='user',
                is_active=True,
                is_verified=True
            )
            db.session.add(user)
        
        user.set_password('User@123')
        db.session.commit()
        
        print("✅ Password reset successfully to 'User@123'")
        
        # Verify
        print(f"   User ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role}")
        print(f"   Active: {user.is_active}")

if __name__ == '__main__':
    reset_password()

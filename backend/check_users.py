"""
Check if users exist in database
"""
from app import create_app
from app.models.models import User
from app.extensions import db

def check_users():
    app = create_app()
    
    with app.app_context():
        print("\n" + "="*50)
        print("Checking users in database...")
        print("="*50 + "\n")
        
        # Get all users
        users = User.query.all()
        
        if not users:
            print("❌ No users found in database!")
            return
        
        print(f"✅ Found {len(users)} users:\n")
        
        for user in users:
            print(f"📧 Email: {user.email}")
            print(f"   Name: {user.full_name}")
            print(f"   Role: {user.role}")
            print(f"   Active: {user.is_active}")
            print(f"   Has password: {bool(user.password_hash)}")
            print()
        
        # Try to check password for user1
        user1 = User.query.filter_by(email='user1@test.com').first()
        if user1:
            print("\n🔍 Testing user1@test.com password:")
            test_password = 'User@123'
            is_valid = user1.check_password(test_password)
            print(f"   Password '{test_password}' is {'✅ VALID' if is_valid else '❌ INVALID'}")
        else:
            print("\n❌ user1@test.com not found!")

if __name__ == '__main__':
    check_users()

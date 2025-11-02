"""
Quick test script to verify backend setup
Run: python test_backend.py
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def print_response(title, response):
    print(f"\n{'='*60}")
    print(f"🧪 {title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except:
        print(response.text)

def test_health_check():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)
    return response.status_code == 200

def test_register():
    """Test user registration"""
    data = {
        "email": "test@example.com",
        "password": "Test@123456",
        "full_name": "Test User",
        "phone": "0987654321",
        "role": "user"
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
    print_response("Register New User", response)
    return response.status_code in [201, 400]  # 400 if user exists

def test_login():
    """Test user login"""
    data = {
        "email": "user1@example.com",
        "password": "User@123456"
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print_response("Login", response)
    
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def test_get_me(token):
    """Test get current user"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print_response("Get Current User", response)
    return response.status_code == 200

def test_doctor_login():
    """Test doctor login"""
    data = {
        "email": "doctor1@mindcare.ai",
        "password": "Doctor@123456"
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print_response("Doctor Login", response)
    return response.status_code == 200

def test_admin_login():
    """Test admin login"""
    data = {
        "email": "admin@mindcare.ai",
        "password": "Admin@123456"
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print_response("Admin Login", response)
    return response.status_code == 200

def main():
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║          🧠 MindCare AI Backend Test Suite             ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    results = {}
    
    # Test 1: Health Check
    print("\n📍 Test 1/6: Health Check")
    try:
        results['health'] = test_health_check()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n⚠️  Backend is not running!")
        print("Run: cd backend && .\\run.ps1")
        return
    
    # Test 2: Register
    print("\n📍 Test 2/6: User Registration")
    try:
        results['register'] = test_register()
    except Exception as e:
        print(f"❌ Error: {e}")
        results['register'] = False
    
    # Test 3: Login
    print("\n📍 Test 3/6: User Login")
    try:
        token = test_login()
        results['login'] = token is not None
    except Exception as e:
        print(f"❌ Error: {e}")
        results['login'] = False
        token = None
    
    # Test 4: Get Me
    if token:
        print("\n📍 Test 4/6: Get Current User")
        try:
            results['get_me'] = test_get_me(token)
        except Exception as e:
            print(f"❌ Error: {e}")
            results['get_me'] = False
    else:
        results['get_me'] = False
        print("\n⊘ Test 4/6: Skipped (no token)")
    
    # Test 5: Doctor Login
    print("\n📍 Test 5/6: Doctor Login")
    try:
        results['doctor'] = test_doctor_login()
    except Exception as e:
        print(f"❌ Error: {e}")
        results['doctor'] = False
    
    # Test 6: Admin Login
    print("\n📍 Test 6/6: Admin Login")
    try:
        results['admin'] = test_admin_login()
    except Exception as e:
        print(f"❌ Error: {e}")
        results['admin'] = False
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 Test Summary")
    print(f"{'='*60}")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for test_name, result in results.items():
        icon = "✅" if result else "❌"
        print(f"{icon} {test_name.replace('_', ' ').title()}")
    
    print(f"\n🎯 Score: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Backend is working correctly!")
        print("\n📝 Next steps:")
        print("   1. Integrate frontend with backend (see INTEGRATION.md)")
        print("   2. Test login flow in frontend")
        print("   3. Build additional features")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        print("\n🔧 Troubleshooting:")
        print("   1. Ensure backend is running: .\\backend\\run.ps1")
        print("   2. Check database is created: mindcare_db")
        print("   3. Run migrations: flask db upgrade")
        print("   4. Seed data: python -m app.seeds.seed_data")

if __name__ == "__main__":
    main()

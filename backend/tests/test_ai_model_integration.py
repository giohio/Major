"""
Test script để kiểm tra kết nối với AI Model
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.ai_model_client import AIModelClient


def test_health_check():
    """Test 1: Kiểm tra model có đang chạy không"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    
    # Use explicit URL instead of relying on Flask app context
    client = AIModelClient(base_url='https://lissotrichous-irreclaimably-jessenia.ngrok-free.dev')
    is_healthy = client.health_check()
    
    if is_healthy:
        print("✅ PASSED - AI Model is running!")
        print(f"   URL: {client.base_url}")
        return True
    else:
        print("❌ FAILED - AI Model is not responding")
        print(f"   URL: {client.base_url}")
        print("   Please check if:")
        print("   1. Ngrok tunnel is still running")
        print("   2. FastAPI server is running")
        print("   3. URL in config is correct")
        return False


def test_chat_endpoint():
    """Test 2: Test chat endpoint"""
    print("\n" + "="*60)
    print("TEST 2: Chat Endpoint")
    print("="*60)
    
    client = AIModelClient(base_url='https://lissotrichous-irreclaimably-jessenia.ngrok-free.dev')
    
    test_message = "Hôm nay tôi cảm thấy rất buồn"
    print(f"Sending message: '{test_message}'")
    
    result = client.chat(
        session_id="test_session_001",
        user_text=test_message
    )
    
    if result.get('error'):
        print(f"❌ FAILED - Error: {result['error']}")
        return False
    
    print("✅ PASSED - Chat endpoint working!")
    print(f"   Response: {result.get('response', '')[:100]}...")
    print(f"   Emotion: {result.get('emotion')}")
    print(f"   Intent: {result.get('intent')}")
    return True


def test_user_dashboard_endpoint():
    """Test 3: Test user dashboard endpoint"""
    print("\n" + "="*60)
    print("TEST 3: User Dashboard Endpoint")
    print("="*60)
    
    client = AIModelClient(base_url='https://lissotrichous-irreclaimably-jessenia.ngrok-free.dev')
    
    # Sample conversation
    conversation = [
        {
            "role": "user",
            "content": "Tôi cảm thấy rất buồn hôm nay",
            "timestamp": "2025-12-12T10:00:00Z"
        },
        {
            "role": "assistant",
            "content": "Tôi hiểu bạn đang cảm thấy buồn. Có chuyện gì xảy ra không?",
            "timestamp": "2025-12-12T10:01:00Z"
        },
        {
            "role": "user",
            "content": "Công việc quá áp lực",
            "timestamp": "2025-12-12T10:02:00Z"
        }
    ]
    
    print("Generating dashboard report...")
    result = client.generate_user_dashboard(conversation)
    
    if result.get('error'):
        print(f"⚠️  WARNING - Using fallback response")
        print(f"   Error: {result.get('error')}")
        return False
    
    print("✅ PASSED - Dashboard endpoint working!")
    print(f"   Dominant Emotion: {result.get('session_analysis', {}).get('dominant_emotion')}")
    print(f"   Overall Sentiment: {result.get('session_analysis', {}).get('overall_sentiment')}")
    print(f"   Trend: {result.get('trend')}")
    return True


def test_clinical_report_endpoint():
    """Test 4: Test clinical report endpoint"""
    print("\n" + "="*60)
    print("TEST 4: Clinical Report Endpoint")
    print("="*60)
    
    client = AIModelClient(base_url='https://lissotrichous-irreclaimably-jessenia.ngrok-free.dev')
    
    # Sample conversation
    conversation = [
        {
            "role": "user",
            "content": "Tôi cảm thấy rất mệt mỏi",
            "timestamp": "2025-12-12T10:00:00Z"
        },
        {
            "role": "assistant",
            "content": "Bạn có thể chia sẻ thêm không?",
            "timestamp": "2025-12-12T10:01:00Z"
        },
        {
            "role": "user",
            "content": "Tôi muốn ngủ mãi không dậy nữa",
            "timestamp": "2025-12-12T10:02:00Z"
        }
    ]
    
    print("Generating clinical report...")
    result = client.generate_clinical_report(conversation)
    
    if result.get('error'):
        print(f"⚠️  WARNING - Using fallback response")
        print(f"   Error: {result.get('error')}")
        return False
    
    print("✅ PASSED - Clinical report endpoint working!")
    print(f"   Dominant Emotion: {result.get('dominant_emotion')}")
    print(f"   Risk Level: {result.get('risk_assessment', {}).get('severity_level')}")
    print(f"   Suicidal Ideation: {result.get('risk_assessment', {}).get('suicidal_ideation')}")
    return True


def run_all_tests():
    """Run all integration tests"""
    print("\n" + "="*60)
    print("AI MODEL INTEGRATION TESTS")
    print("="*60)
    print(f"Testing connection to AI Model...")
    
    results = []
    
    # Test 1: Health Check
    results.append(("Health Check", test_health_check()))
    
    # Only continue if health check passes
    if results[0][1]:
        # Test 2: Chat
        results.append(("Chat Endpoint", test_chat_endpoint()))
        
        # Test 3: Dashboard
        results.append(("Dashboard Endpoint", test_user_dashboard_endpoint()))
        
        # Test 4: Clinical Report
        results.append(("Clinical Report", test_clinical_report_endpoint()))
    else:
        print("\n⚠️  Skipping other tests because health check failed")
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Model integration is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
    
    return passed == total


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)

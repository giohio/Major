"""
Test MongoDB connection và lưu chat
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.services.mongodb_service import MongoDBService

def test_mongodb_connection():
    """Test MongoDB connection"""
    print("\n" + "="*60)
    print("TEST: MongoDB Connection")
    print("="*60)
    
    app = create_app()
    
    with app.app_context():
        try:
            db = MongoDBService.get_client()
            print("✅ MongoDB connected successfully!")
            print(f"   Database: {db.name}")
            
            # List collections
            collections = db.list_collection_names()
            print(f"   Collections: {collections}")
            
            return True
            
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            return False


def test_save_message():
    """Test saving message to MongoDB"""
    print("\n" + "="*60)
    print("TEST: Save Message to MongoDB")
    print("="*60)
    
    app = create_app()
    
    with app.app_context():
        try:
            # Test save user message
            msg1 = MongoDBService.save_message(
                session_id=999,
                user_id=123,
                role='user',
                content='Hôm nay tôi cảm thấy rất buồn',
                emotion='sadness'
            )
            
            if msg1:
                print("✅ User message saved!")
                print(f"   Message ID: {msg1['message_id']}")
            
            # Test save assistant message
            msg2 = MongoDBService.save_message(
                session_id=999,
                user_id=123,
                role='assistant',
                content='Tôi hiểu bạn đang cảm thấy buồn. Có chuyện gì xảy ra không?'
            )
            
            if msg2:
                print("✅ Assistant message saved!")
                print(f"   Message ID: {msg2['message_id']}")
            
            return True
            
        except Exception as e:
            print(f"❌ Save message failed: {e}")
            return False


def test_get_messages():
    """Test getting messages from MongoDB"""
    print("\n" + "="*60)
    print("TEST: Get Messages from MongoDB")
    print("="*60)
    
    app = create_app()
    
    with app.app_context():
        try:
            messages = MongoDBService.get_session_messages(
                session_id=999,
                user_id=123
            )
            
            print(f"✅ Retrieved {len(messages)} messages")
            
            for i, msg in enumerate(messages, 1):
                print(f"\n   Message {i}:")
                print(f"   Role: {msg['role']}")
                print(f"   Content: {msg['content'][:50]}...")
                print(f"   Timestamp: {msg['timestamp']}")
            
            return True
            
        except Exception as e:
            print(f"❌ Get messages failed: {e}")
            return False


def test_prepare_for_analysis():
    """Test preparing data for AI analysis"""
    print("\n" + "="*60)
    print("TEST: Prepare Data for AI Analysis")
    print("="*60)
    
    app = create_app()
    
    with app.app_context():
        try:
            data = MongoDBService.prepare_for_analysis(
                session_id=999,
                user_id=123
            )
            
            if data:
                print("✅ Data prepared successfully!")
                print(f"   Session ID: {data['session_id']}")
                print(f"   User ID: {data['user_id']}")
                print(f"   Messages: {data['context']['message_count']}")
                print(f"   Duration: {data['context']['duration_minutes']} minutes")
                return True
            else:
                print("⚠️  No data available")
                return False
            
        except Exception as e:
            print(f"❌ Prepare data failed: {e}")
            return False


def run_all_tests():
    """Run all MongoDB tests"""
    print("\n" + "="*60)
    print("MONGODB INTEGRATION TESTS")
    print("="*60)
    
    results = []
    
    # Test 1: Connection
    results.append(("MongoDB Connection", test_mongodb_connection()))
    
    if results[0][1]:
        # Test 2: Save message
        results.append(("Save Message", test_save_message()))
        
        # Test 3: Get messages
        results.append(("Get Messages", test_get_messages()))
        
        # Test 4: Prepare for analysis
        results.append(("Prepare for Analysis", test_prepare_for_analysis()))
    
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
    
    return passed == total


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)

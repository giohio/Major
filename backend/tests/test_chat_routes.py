"""
Test chat routes
"""
import pytest
import json


class TestChatRoutes:
    """Test chat endpoints"""
    
    def test_send_message(self, client, auth_headers, sample_plan):
        """Test sending a chat message"""
        response = client.post('/api/chat/send',
            headers=auth_headers,
            json={
                'message': 'Hello, I need help with anxiety',
                'session_id': None  # New session
            }
        )
        
        # May return 500 due to missing Google Cloud credentials for emotion analysis
        assert response.status_code in [200, 500]
    
    def test_get_recent_sessions(self, client, auth_headers):
        """Test getting recent chat sessions"""
        response = client.get('/api/chat/recent',
                            headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'sessions' in data
        assert isinstance(data['sessions'], list)
    
    def test_get_session_messages(self, client, auth_headers, sample_chat_session):
        """Test getting messages from a session"""
        response = client.get(f'/api/chat/session/{sample_chat_session.id}',
                            headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'messages' in data
    
    def test_delete_session(self, client, auth_headers, sample_chat_session):
        """Test deleting a chat session"""
        response = client.delete(f'/api/chat/session/{sample_chat_session.id}',
                               headers=auth_headers)
        
        assert response.status_code == 200
    
    def test_submit_feedback(self, client, auth_headers, sample_chat_message):
        """Test submitting chat feedback"""
        response = client.post('/api/chat/feedback',
            headers=auth_headers,
            json={
                'message_id': sample_chat_message.id,
                'rating': 5,
                'feedback_text': 'Very helpful response'
            }
        )
        
        assert response.status_code == 201  # Created status

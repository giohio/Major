"""
Test authentication routes
"""
import pytest
import json
from app.models.models import User
from app.extensions import db


class TestAuthRoutes:
    """Test authentication endpoints"""
    
    def test_register_success(self, client, app):
        """Test successful user registration"""
        response = client.post('/api/auth/register', 
            json={
                'email': 'newuser@example.com',
                'password': 'SecurePass123',
                'full_name': 'New User',
                'role': 'user'
            }
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['message'] == 'User registered successfully'
        assert 'access_token' in data
        assert 'user' in data
    
    def test_register_duplicate_email(self, client, sample_user):
        """Test registration with duplicate email"""
        response = client.post('/api/auth/register',
            json={
                'email': sample_user.email,
                'password': 'password123',
                'full_name': 'Duplicate User'
            }
        )
        
        assert response.status_code == 409  # Conflict status for duplicate
        data = json.loads(response.data)
        assert 'already' in data['error'].lower()
    
    def test_login_success(self, client, sample_user):
        """Test successful login"""
        response = client.post('/api/auth/login',
            json={
                'email': sample_user.email,
                'password': 'password123'
            }
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'access_token' in data
        assert 'refresh_token' in data
        assert data['user']['email'] == sample_user.email
    
    def test_login_wrong_password(self, client, sample_user):
        """Test login with wrong password"""
        response = client.post('/api/auth/login',
            json={
                'email': sample_user.email,
                'password': 'wrongpassword'
            }
        )
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'invalid' in data['error'].lower()
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent email"""
        response = client.post('/api/auth/login',
            json={
                'email': 'nonexistent@example.com',
                'password': 'password123'
            }
        )
        
        assert response.status_code == 401
    
    def test_get_current_user(self, client, auth_headers):
        """Test getting current user info"""
        response = client.get('/api/auth/me', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        # API returns user dict directly, not wrapped
        assert 'email' in data
        assert 'id' in data
    
    def test_change_password(self, client, auth_headers, app, sample_user):
        """Test password change"""
        response = client.post('/api/auth/change-password',
            headers=auth_headers,
            json={
                'current_password': 'password123',
                'new_password': 'NewSecurePass123'
            }
        )
        
        assert response.status_code == 200
        
        # Verify new password works
        with app.app_context():
            user = User.query.get(sample_user.id)
            assert user.check_password('NewSecurePass123')
    
    def test_change_password_wrong_current(self, client, auth_headers):
        """Test password change with wrong current password"""
        response = client.post('/api/auth/change-password',
            headers=auth_headers,
            json={
                'current_password': 'wrongpassword',
                'new_password': 'NewPass123'
            }
        )
        
        assert response.status_code == 401

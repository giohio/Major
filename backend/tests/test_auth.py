import json

def test_register(client, session):
    """Test user registration"""
    payload = {
        'email': 'testuser@example.com',
        'password': 'Password123!',
        'full_name': 'Test User'
    }
    response = client.post('/api/auth/register', 
                          data=json.dumps(payload),
                          content_type='application/json')
    
    assert response.status_code == 201
    data = response.get_json()
    assert 'access_token' in data
    assert 'user' in data
    assert data['user']['email'] == payload['email']

def test_register_duplicate(client, session):
    """Test registering existing user"""
    # Register first time
    payload = {
        'email': 'duplicate@example.com',
        'password': 'Password123!',
        'full_name': 'Duplicate User'
    }
    client.post('/api/auth/register', 
                data=json.dumps(payload),
                content_type='application/json')
    
    # Register second time
    response = client.post('/api/auth/register', 
                          data=json.dumps(payload),
                          content_type='application/json')
    
    assert response.status_code == 409
    assert 'already registered' in response.get_json()['error']

def test_login_success(client, session):
    """Test successful login"""
    # Create user first
    register_payload = {
        'email': 'login@example.com',
        'password': 'Password123!',
        'full_name': 'Login User'
    }
    client.post('/api/auth/register', 
                data=json.dumps(register_payload),
                content_type='application/json')
    
    # Try login
    login_payload = {
        'email': 'login@example.com',
        'password': 'Password123!'
    }
    response = client.post('/api/auth/login', 
                          data=json.dumps(login_payload),
                          content_type='application/json')
    
    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data

def test_login_failure(client, session):
    """Test login with wrong password"""
    # Create user first
    register_payload = {
        'email': 'failure@example.com',
        'password': 'Password123!',
        'full_name': 'Fail User'
    }
    client.post('/api/auth/register', 
                data=json.dumps(register_payload),
                content_type='application/json')
    
    # Try login with wrong pass
    login_payload = {
        'email': 'failure@example.com',
        'password': 'WrongPassword'
    }
    response = client.post('/api/auth/login', 
                          data=json.dumps(login_payload),
                          content_type='application/json')
    
    assert response.status_code == 401
    assert 'Invalid email or password' in response.get_json()['error']

def test_protected_route(client, session):
    """Test accessing protected route with token"""
    # Register to get token
    payload = {
        'email': 'token@example.com',
        'password': 'Password123!',
        'full_name': 'Token User'
    }
    auth_response = client.post('/api/auth/register', 
                               data=json.dumps(payload),
                               content_type='application/json')
    
    access_token = auth_response.get_json()['access_token']
    
    # Access protected route
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    response = client.get('/api/auth/me', headers=headers)
    
    assert response.status_code == 200
    assert response.get_json()['email'] == payload['email']

def test_protected_route_no_token(client):
    """Test accessing protected route without token"""
    response = client.get('/api/auth/me')
    assert response.status_code == 401

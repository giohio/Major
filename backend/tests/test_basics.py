def test_config(app):
    """Test if app is configured for testing"""
    assert app.config['TESTING'] is True
    assert app.config['SQLALCHEMY_DATABASE_URI'].endswith('test_db')

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'

def test_index(client):
    """Test root endpoint"""
    response = client.get('/')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'running'
